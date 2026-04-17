const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

// Load data from JSON files.  In production you might use a database.
const lessons = require("./data/lessons.json");
const quizzes = require("./data/quizzes.json");
const projects = require("./data/projects.json");

const app = express();
const PORT = process.env.PORT || 3000;
const PASSING_STREAK = 2;
const DATA_DIR = path.join(__dirname, "data");
const AWS_LESSONS_DIR = path.join(DATA_DIR, "aws-lessons");
const PROGRESS_FILE = path.join(DATA_DIR, "progress-memory.json");
const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "interactions.log");

let progressCache = loadProgressStore();
let deckCache = {
  signature: null,
  cards: [],
};

// Enable CORS for all origins (for local development)
app.use(cors());
app.use(express.json());

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function hashId(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function safeReadJson(filePath, fallbackValue) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return fallbackValue;
  }
}

function loadProgressStore() {
  return safeReadJson(PROGRESS_FILE, { users: {} });
}

function saveProgressStore() {
  ensureDirectory(path.dirname(PROGRESS_FILE));
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify(progressCache, null, 2),
    "utf8",
  );
}

function appendInteractionLog(entry) {
  ensureDirectory(LOG_DIR);
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`, "utf8");
}

function getUserId(req) {
  return req.headers["x-user-id"] || "local-user";
}

function normalizePathForDisplay(filePath) {
  return filePath
    .replace(/\\/g, "/")
    .replace(/^.*\/server\/src\/data\//, "server/src/data/");
}

function collectFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      return;
    }
    files.push(fullPath);
  });

  return files;
}

function getDeckSignature(files) {
  const parts = files
    .map((filePath) => {
      const stats = fs.statSync(filePath);
      return `${filePath}:${stats.size}:${stats.mtimeMs}`;
    })
    .sort();
  return hashId(parts.join("|"));
}

function inferTags(sourcePath, textBlob) {
  const corpus = `${sourcePath} ${textBlob}`.toLowerCase();
  const keywords = [
    "iam",
    "s3",
    "ec2",
    "vpc",
    "route 53",
    "cloudfront",
    "lambda",
    "security",
    "cost",
    "network",
    "storage",
    "resilience",
    "dns",
    "ssm",
  ];

  return keywords.filter((keyword) => corpus.includes(keyword));
}

function splitTitleFromPath(filePath) {
  const raw = path.basename(filePath, path.extname(filePath));
  return raw.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function extractSnippet(lines, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = lines[cursor].trim();
    if (!candidate) continue;
    if (candidate.startsWith("#") || candidate.startsWith("--")) {
      return candidate
        .replace(/^#+\s*/, "")
        .replace(/^--+\s*/, "")
        .trim();
    }
  }
  return "";
}

function createCard(base, prompt, expectedAnswer, reference, type) {
  return {
    ...base,
    id: hashId(`${base.sourcePath}:${prompt}:${expectedAnswer}`),
    prompt,
    expectedAnswer,
    reference,
    type,
  };
}

function humanizeSlug(slug) {
  return slug
    .replace(/^aws-saa-c03-certified-solutions-architect-associate-/, "")
    .replace(/-/g, " ")
    .trim();
}

function getCardSubject(card) {
  if (card.type === "quiz-anchor") {
    return {
      id: "exam-critical",
      label: "Exam Critical",
    };
  }

  const marker = "server/src/data/aws-lessons/";
  if (typeof card.sourcePath === "string" && card.sourcePath.includes(marker)) {
    const rest = card.sourcePath.slice(
      card.sourcePath.indexOf(marker) + marker.length,
    );
    const segment = rest.split("/")[0] || "general";
    return {
      id: segment,
      label: humanizeSlug(segment)
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    };
  }

  const fallback = (card.topic || "general").toLowerCase().replace(/\s+/g, "-");
  return {
    id: fallback,
    label: card.topic || "General",
  };
}

function filterCardsBySubject(cards, subjectId) {
  if (!subjectId || subjectId === "all") return cards;
  return cards.filter((card) => card.subjectId === subjectId);
}

function filterCardsByQueue(cards, userState, queueId) {
  if (!queueId || queueId === "all-due") {
    return cards.filter((card) => {
      const progress = userState.cards[card.id];
      return !progress || (progress.streak || 0) < PASSING_STREAK;
    });
  }

  if (queueId === "review") {
    return cards.filter((card) => {
      const progress = userState.cards[card.id];
      return (
        !!progress &&
        progress.attempts > 0 &&
        (progress.streak || 0) < PASSING_STREAK
      );
    });
  }

  if (queueId === "new") {
    return cards.filter((card) => {
      const progress = userState.cards[card.id];
      return !progress || progress.attempts === 0;
    });
  }

  if (queueId === "mastered") {
    return cards.filter((card) => {
      const progress = userState.cards[card.id];
      return !!progress && (progress.streak || 0) >= PASSING_STREAK;
    });
  }

  return cards;
}

function buildQueueSummary(cards, userState) {
  const allDue = filterCardsByQueue(cards, userState, "all-due").length;
  const review = filterCardsByQueue(cards, userState, "review").length;
  const fresh = filterCardsByQueue(cards, userState, "new").length;
  const mastered = filterCardsByQueue(cards, userState, "mastered").length;

  return [
    { id: "all-due", label: "All Due", count: allDue },
    { id: "review", label: "Review Queue", count: review },
    { id: "new", label: "New Cards", count: fresh },
    { id: "mastered", label: "Mastered", count: mastered },
  ];
}

function getAttemptMetrics(cards, userState) {
  const cardIds = new Set(cards.map((card) => card.id));
  const attemptedCardIds = new Set();
  let correctAttempts = 0;
  let incorrectAttempts = 0;

  (userState.history || []).forEach((entry) => {
    if (entry.action !== "submitStudyAnswer") return;
    const cardId = entry?.input?.cardId;
    if (!cardId || !cardIds.has(cardId)) return;

    attemptedCardIds.add(cardId);
    if (entry?.output?.correct === true) {
      correctAttempts += 1;
      return;
    }
    if (entry?.output?.correct === false) {
      incorrectAttempts += 1;
    }
  });

  const totalAttempts = correctAttempts + incorrectAttempts;

  return {
    attemptedCards: attemptedCardIds.size,
    totalAttempts,
    correctAttempts,
    incorrectAttempts,
    accuracyPercent:
      totalAttempts > 0
        ? Math.round((correctAttempts / totalAttempts) * 100)
        : 0,
  };
}

function buildSubjectSummary(cards, userState) {
  const grouped = new Map();

  cards.forEach((card) => {
    if (!grouped.has(card.subjectId)) {
      grouped.set(card.subjectId, {
        id: card.subjectId,
        label: card.subjectLabel,
        totalCards: 0,
        remainingCards: 0,
      });
    }

    const bucket = grouped.get(card.subjectId);
    bucket.totalCards += 1;

    const progress = userState.cards[card.id];
    if (!progress || (progress.streak || 0) < PASSING_STREAK) {
      bucket.remainingCards += 1;
    }
  });

  const subjects = Array.from(grouped.values())
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((item) => ({
      ...item,
      masteredCards: item.totalCards - item.remainingCards,
    }));

  return [
    {
      id: "all",
      label: "All Subjects",
      totalCards: cards.length,
      remainingCards: cards.filter((card) => {
        const progress = userState.cards[card.id];
        return !progress || (progress.streak || 0) < PASSING_STREAK;
      }).length,
      masteredCards: cards.filter((card) => {
        const progress = userState.cards[card.id];
        return progress && (progress.streak || 0) >= PASSING_STREAK;
      }).length,
    },
    ...subjects,
  ];
}

function detectAnswerShape(answer) {
  if (typeof answer !== "string") return "other";
  if (/^\d{4}-\d{2}-\d{2}$/.test(answer)) return "iso-date";
  if (/^[A-Za-z][A-Za-z0-9]+$/.test(answer)) return "token";
  if (/^[a-z0-9-]+$/.test(answer)) return "slug";
  return "other";
}

function parseTextCards(filePath, content, baseMeta) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const cards = [];
  const commandRegex =
    /^(aws|ssh|scp|curl|kubectl|npm|node|python|pip|sam|cdk|terraform)\b/i;

  lines.forEach((line, index) => {
    if (!commandRegex.test(line)) return;
    const contextHint = extractSnippet(lines, index);
    const prompt = contextHint
      ? `Which command matches this task: ${contextHint}?`
      : `Which command should you remember for ${baseMeta.topic}?`;

    cards.push(
      createCard(
        baseMeta,
        prompt,
        line,
        `Source command from ${baseMeta.sourcePath}`,
        "command",
      ),
    );
  });

  if (cards.length === 0) {
    cards.push(
      createCard(
        baseMeta,
        `What core idea appears in ${baseMeta.topic}?`,
        `Review the key concept and commands in ${baseMeta.topic}.`,
        `Review ${baseMeta.sourcePath}`,
        "concept",
      ),
    );
  }

  return cards.slice(0, 4);
}

function parseJsonCards(filePath, rawContent, baseMeta) {
  try {
    const value = JSON.parse(rawContent);
    const cards = [];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const blockedKeys = new Set(["Version", "Statement", "Id", "Sid"]);

      // Prioritize meaningful IAM policy semantics over metadata keys.
      if (Array.isArray(value.Statement) && value.Statement.length > 0) {
        const firstStatement = value.Statement[0];
        if (firstStatement && typeof firstStatement === "object") {
          if (typeof firstStatement.Effect === "string") {
            const answer = String(firstStatement.Effect);
            cards.push({
              ...createCard(
                baseMeta,
                `In ${baseMeta.topic}, what is the policy Effect in the first statement?`,
                answer,
                `Statement.Effect from ${baseMeta.sourcePath}`,
                "json",
              ),
              jsonKey: "Effect",
              answerShape: detectAnswerShape(answer),
            });
          }

          if (typeof firstStatement.Action === "string") {
            const answer = String(firstStatement.Action);
            cards.push({
              ...createCard(
                baseMeta,
                `In ${baseMeta.topic}, which Action appears in the first statement?`,
                answer,
                `Statement.Action from ${baseMeta.sourcePath}`,
                "json",
              ),
              jsonKey: "Action",
              answerShape: detectAnswerShape(answer),
            });
          }

          if (
            Array.isArray(firstStatement.Action) &&
            firstStatement.Action.length > 0
          ) {
            const firstAction = firstStatement.Action.find(
              (action) => typeof action === "string",
            );
            if (firstAction) {
              const answer = String(firstAction);
              cards.push({
                ...createCard(
                  baseMeta,
                  `In ${baseMeta.topic}, which Action appears in the first statement?`,
                  answer,
                  `Statement.Action from ${baseMeta.sourcePath}`,
                  "json",
                ),
                jsonKey: "Action",
                answerShape: detectAnswerShape(answer),
              });
            }
          }
        }
      }

      const entries = Object.entries(value).slice(0, 10);

      entries.forEach(([key, entryValue]) => {
        if (blockedKeys.has(key)) {
          return;
        }

        let answer = null;

        if (
          typeof entryValue === "string" ||
          typeof entryValue === "number" ||
          typeof entryValue === "boolean"
        ) {
          answer = String(entryValue);
        }

        if (
          Array.isArray(entryValue) &&
          entryValue.length > 0 &&
          entryValue.length <= 4 &&
          entryValue.every(
            (item) =>
              typeof item === "string" ||
              typeof item === "number" ||
              typeof item === "boolean",
          )
        ) {
          answer = entryValue.map((item) => String(item)).join(", ");
        }

        if (!answer) {
          return;
        }

        cards.push({
          ...createCard(
            baseMeta,
            `In ${baseMeta.topic}, what is the value of '${key}'?`,
            answer,
            `JSON key '${key}' from ${baseMeta.sourcePath}`,
            "json",
          ),
          jsonKey: key,
          answerShape: detectAnswerShape(answer),
        });
      });
    }
    if (cards.length > 0) return cards.slice(0, 4);
  } catch (error) {
    // Fall through to text extraction when JSON parsing fails.
  }

  return parseTextCards(filePath, rawContent, baseMeta);
}

function createFallbackCard(filePath) {
  const topic = splitTitleFromPath(filePath);
  const sourcePath = normalizePathForDisplay(filePath);
  return createCard(
    {
      sourcePath,
      topic,
      tags: inferTags(sourcePath, topic),
    },
    `What is the most relevant exam topic in ${topic}?`,
    `Review the ${topic} material and summarize the key design trade-offs.`,
    `Check the source file: ${sourcePath}`,
    "fallback",
  );
}

function buildCardsFromAwsLessons() {
  if (!fs.existsSync(AWS_LESSONS_DIR)) {
    return [];
  }

  const files = collectFiles(AWS_LESSONS_DIR).filter(
    (filePath) => !filePath.endsWith(".DS_Store"),
  );
  const signature = getDeckSignature(files);

  if (deckCache.signature === signature) {
    return deckCache.cards;
  }

  const binaryExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg", ".zip"]);
  const jsonExtensions = new Set([".json"]);
  const textExtensions = new Set([
    ".txt",
    ".sh",
    ".py",
    ".js",
    ".html",
    ".rtf",
    ".md",
  ]);

  const cards = [];

  files.forEach((filePath) => {
    const extension = path.extname(filePath).toLowerCase();
    if (binaryExtensions.has(extension)) {
      return;
    }

    const sourcePath = normalizePathForDisplay(filePath);
    const topic = splitTitleFromPath(filePath);
    const baseMeta = {
      sourcePath,
      topic,
      tags: inferTags(sourcePath, topic),
    };

    try {
      const rawContent = fs.readFileSync(filePath, "utf8");
      const textBlob = rawContent.slice(0, 8000);
      baseMeta.tags = inferTags(sourcePath, textBlob);

      if (jsonExtensions.has(extension)) {
        cards.push(...parseJsonCards(filePath, rawContent, baseMeta));
      } else if (textExtensions.has(extension)) {
        cards.push(...parseTextCards(filePath, rawContent, baseMeta));
      } else {
        cards.push(createFallbackCard(filePath));
      }
    } catch (error) {
      cards.push(createFallbackCard(filePath));
    }
  });

  // Add high-priority exam cards from existing quiz content as anchor topics.
  quizzes.forEach((quiz) => {
    quiz.questions.forEach((question) => {
      const correctChoice = question.answer[0];
      const expectedAnswer =
        question.choices[correctChoice] || "Review explanation";
      cards.push({
        id: hashId(`quiz:${question.id}`),
        prompt: question.question,
        expectedAnswer,
        reference: question.explanation,
        sourcePath: "server/src/data/quizzes.json",
        topic: "exam-critical",
        tags: ["exam", "critical-topic"],
        type: "quiz-anchor",
      });
    });
  });

  // Deduplicate by prompt + expected answer to avoid noisy repeated cards.
  const uniqueCards = [];
  const seen = new Set();
  cards.forEach((card) => {
    const dedupeKey = `${card.prompt}|${card.expectedAnswer}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    uniqueCards.push(card);
  });

  const sorted = uniqueCards.sort((a, b) => a.prompt.localeCompare(b.prompt));
  const isChoiceFriendly = (answer) => {
    if (!answer || typeof answer !== "string") return false;
    if (answer.length < 2 || answer.length > 80) return false;
    if (answer.includes("\n")) return false;
    if (/[{}\[\]]/.test(answer)) return false;
    if (/!{4,}/.test(answer)) return false;
    if (/(.)\1{5,}/.test(answer)) return false;
    if (/https?:\/\//i.test(answer)) return false;
    if (/hello from/i.test(answer)) return false;
    return true;
  };

  const answerPool = sorted
    .map((card) => card.expectedAnswer)
    .filter((answer) => typeof answer === "string" && answer.length > 0);

  const friendlyAnswerPool = answerPool.filter(isChoiceFriendly);

  const cardsWithChoices = sorted.map((card) => {
    const sameType = sorted
      .filter((candidate) => candidate.type === card.type)
      .map((candidate) => candidate.expectedAnswer)
      .filter(isChoiceFriendly);

    const sameJsonKey =
      card.type === "json" && card.jsonKey
        ? sorted
            .filter(
              (candidate) =>
                candidate.type === "json" &&
                candidate.jsonKey === card.jsonKey &&
                candidate.answerShape === card.answerShape,
            )
            .map((candidate) => candidate.expectedAnswer)
            .filter(isChoiceFriendly)
        : [];

    const sameTopic = sorted
      .filter((candidate) => candidate.topic === card.topic)
      .map((candidate) => candidate.expectedAnswer)
      .filter(isChoiceFriendly);

    const poolBase =
      sameJsonKey.length >= 3
        ? sameJsonKey
        : sameType.length >= 3
          ? sameType
          : sameTopic.length >= 3
            ? sameTopic
            : friendlyAnswerPool;

    const pool = isChoiceFriendly(card.expectedAnswer) ? poolBase : answerPool;

    const distractors = pool
      .filter((answer) => answer !== card.expectedAnswer)
      .slice(0, 20)
      .sort((a, b) =>
        hashId(`${card.id}:${a}`).localeCompare(hashId(`${card.id}:${b}`)),
      )
      .slice(0, 3);

    const choices = [...distractors, card.expectedAnswer].sort((a, b) =>
      hashId(`${card.id}:${a}`).localeCompare(hashId(`${card.id}:${b}`)),
    );

    const subject = getCardSubject(card);

    return {
      ...card,
      choices,
      correctIndex: choices.findIndex(
        (choice) => choice === card.expectedAnswer,
      ),
      subjectId: subject.id,
      subjectLabel: subject.label,
    };
  });

  deckCache = {
    signature,
    cards: cardsWithChoices,
  };

  return cardsWithChoices;
}

function getUserProgress(userId) {
  if (!progressCache.users[userId]) {
    progressCache.users[userId] = {
      lessons: {},
      notes: [],
      history: [],
      cards: {},
    };
  }
  return progressCache.users[userId];
}

function buildStudyStats(cards, userState) {
  const totalCards = cards.length;
  let masteredCards = 0;
  let reviewQueueCards = 0;
  let unseenCards = 0;

  cards.forEach((card) => {
    const progress = userState.cards[card.id];
    if (!progress || progress.attempts === 0) {
      unseenCards += 1;
      return;
    }

    if ((progress.streak || 0) >= PASSING_STREAK) {
      masteredCards += 1;
      return;
    }

    reviewQueueCards += 1;
  });

  const attemptMetrics = getAttemptMetrics(cards, userState);

  return {
    totalCards,
    masteredCards,
    attemptedCards: attemptMetrics.attemptedCards,
    remainingCards: totalCards - masteredCards,
    unseenCards,
    masteryPercent:
      totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0,
    reviewQueueCards,
    needsReview: reviewQueueCards,
    totalAttempts: attemptMetrics.totalAttempts,
    correctAttempts: attemptMetrics.correctAttempts,
    incorrectAttempts: attemptMetrics.incorrectAttempts,
    accuracyPercent: attemptMetrics.accuracyPercent,
  };
}

function buildProgressSummary(cards, userState) {
  const cardMap = new Map(cards.map((card) => [card.id, card]));

  const answerHistory = (userState.history || [])
    .filter((entry) => entry.action === "submitStudyAnswer")
    .map((entry) => {
      const cardId = entry?.input?.cardId;
      const card = cardMap.get(cardId);

      return {
        timestamp: entry.timestamp,
        cardId,
        correct: entry?.output?.correct === true,
        prompt: card?.prompt || "Unknown card",
        subjectLabel: card?.subjectLabel || "Unknown subject",
      };
    })
    .filter((entry) => !!entry.cardId);

  const recentAnswers = answerHistory.slice(-10).reverse();

  const trend = recentAnswers
    .slice()
    .reverse()
    .map((entry) => (entry.correct ? "correct" : "incorrect"));

  const mistakesBySubject = {};
  answerHistory.forEach((entry) => {
    if (entry.correct) return;
    mistakesBySubject[entry.subjectLabel] =
      (mistakesBySubject[entry.subjectLabel] || 0) + 1;
  });

  const topStrugglingSubject =
    Object.entries(mistakesBySubject)
      .sort((a, b) => b[1] - a[1])
      .map(([label, mistakes]) => ({ label, mistakes }))[0] || null;

  return {
    recentAnswers,
    trend,
    topStrugglingSubject,
  };
}

function getDueCards(cards, userState) {
  const due = cards.filter((card) => {
    const progress = userState.cards[card.id];
    return !progress || (progress.streak || 0) < PASSING_STREAK;
  });

  return due.sort((a, b) => {
    const progressA = userState.cards[a.id] || {
      streak: 0,
      attempts: 0,
      lastCorrect: false,
    };
    const progressB = userState.cards[b.id] || {
      streak: 0,
      attempts: 0,
      lastCorrect: false,
    };

    if (progressA.streak !== progressB.streak) {
      return progressA.streak - progressB.streak;
    }
    if (progressA.lastCorrect !== progressB.lastCorrect) {
      return progressA.lastCorrect ? 1 : -1;
    }
    return progressA.attempts - progressB.attempts;
  });
}

function sanitizeCardForClient(card) {
  return {
    id: card.id,
    prompt: card.prompt,
    choices: card.choices,
    reference: card.reference,
    topic: card.topic,
    tags: card.tags,
    sourcePath: card.sourcePath,
    type: card.type,
    subjectId: card.subjectId,
    subjectLabel: card.subjectLabel,
  };
}

function getNextCard(cards, userState) {
  const dueCards = getDueCards(cards, userState);
  if (dueCards.length === 0) return null;
  return dueCards[0];
}

function updateCardProgress(userState, cardId, correct) {
  if (!userState.cards[cardId]) {
    userState.cards[cardId] = {
      attempts: 0,
      streak: 0,
      lastCorrect: false,
      lastAttemptAt: null,
    };
  }

  const cardState = userState.cards[cardId];
  cardState.attempts += 1;
  cardState.streak = correct ? cardState.streak + 1 : 0;
  cardState.lastCorrect = correct;
  cardState.lastAttemptAt = new Date().toISOString();

  return cardState;
}

async function askOpenAiTutor(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const systemPrompt = [
    "You are an AWS Solutions Architect study tutor.",
    "Keep answers concise, calming, and supportive.",
    "Teach concepts, do not provide real exam dump answers.",
    "When possible, include quick practical memory tips.",
    "Always end with one short check-for-understanding question.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: payload,
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${message}`);
  }

  const data = await response.json();

  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .join("\n")
      .trim() ||
    data.choices?.[0]?.message?.content ||
    "";

  return outputText || "Tutor response unavailable.";
}

/**
 * GET /api/lessons
 * Returns a list of lessons with summary information.
 */
app.get("/api/lessons", (req, res) => {
  // Omit long descriptions to keep summaries lightweight
  const summaries = lessons.map(({ id, title, domain, objectives }) => ({
    id,
    title,
    domain,
    objectives,
  }));
  res.json(summaries);
});

/**
 * GET /api/study/session
 * Returns the current study status and next card to review.
 */
app.get("/api/study/session", (req, res) => {
  const userId = getUserId(req);
  const cards = buildCardsFromAwsLessons();
  const userState = getUserProgress(userId);
  const subjectId = req.query.subject || "all";
  const queueId = req.query.queue || "all-due";
  const subjectCards = filterCardsBySubject(cards, subjectId);
  const queueCards = filterCardsByQueue(subjectCards, userState, queueId);
  const nextCard = getNextCard(queueCards, userState);
  const stats = buildStudyStats(subjectCards, userState);
  const subjects = buildSubjectSummary(cards, userState);
  const queues = buildQueueSummary(subjectCards, userState);

  appendInteractionLog({
    timestamp: new Date().toISOString(),
    userId,
    action: "getStudySession",
    outcome: "success",
    metrics: stats,
  });

  res.json({
    activeSubject: subjectId,
    activeQueue: queueId,
    subjects,
    queues,
    stats,
    card: nextCard ? sanitizeCardForClient(nextCard) : null,
  });
});

/**
 * POST /api/study/answer
 * Evaluates an answer for a study card and returns feedback with the next card.
 */
app.post("/api/study/answer", (req, res) => {
  const userId = getUserId(req);
  const cards = buildCardsFromAwsLessons();
  const userState = getUserProgress(userId);
  const { cardId, choiceIndex, subject, queue } = req.body;

  if (!cardId || typeof choiceIndex !== "number") {
    return res
      .status(400)
      .json({ error: "cardId and numeric choiceIndex are required." });
  }

  const card = cards.find((candidate) => candidate.id === cardId);
  if (!card) {
    return res.status(404).json({ error: "Card not found." });
  }

  const correct = choiceIndex === card.correctIndex;
  const cardState = updateCardProgress(userState, cardId, correct);
  userState.history.push({
    timestamp: new Date().toISOString(),
    action: "submitStudyAnswer",
    input: { cardId, choiceIndex },
    output: { correct },
  });

  saveProgressStore();

  const activeSubject = subject || "all";
  const activeQueue = queue || "all-due";
  const subjectCards = filterCardsBySubject(cards, activeSubject);
  const queueCards = filterCardsByQueue(subjectCards, userState, activeQueue);
  const nextCard = correct ? getNextCard(queueCards, userState) : card;
  const stats = buildStudyStats(subjectCards, userState);
  const subjects = buildSubjectSummary(cards, userState);
  const queues = buildQueueSummary(subjectCards, userState);

  appendInteractionLog({
    timestamp: new Date().toISOString(),
    userId,
    action: "submitStudyAnswer",
    parameters: { cardId, choiceIndex },
    outcome: "success",
    metrics: {
      correct,
      streak: cardState.streak,
      masteryPercent: stats.masteryPercent,
    },
  });

  return res.json({
    correct,
    expectedAnswer: card.expectedAnswer,
    reference: card.reference,
    sourcePath: card.sourcePath,
    streak: cardState.streak,
    mastered: cardState.streak >= PASSING_STREAK,
    activeSubject,
    activeQueue,
    subjects,
    queues,
    stats,
    card: nextCard ? sanitizeCardForClient(nextCard) : null,
  });
});

/**
 * POST /api/study/note
 * Records an optional note tied to a topic/card for progress tracking.
 */
app.post("/api/study/note", (req, res) => {
  const userId = getUserId(req);
  const userState = getUserProgress(userId);
  const { cardId, lessonId, text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Note text is required." });
  }

  const note = {
    cardId: cardId || null,
    lessonId: lessonId || null,
    text: text.trim(),
    timestamp: new Date().toISOString(),
  };

  userState.notes.push(note);
  userState.history.push({
    timestamp: note.timestamp,
    action: "recordNote",
    input: { cardId, lessonId },
    output: { success: true },
  });

  saveProgressStore();
  res.json({ success: true, note });
});

/**
 * GET /api/progress
 * Returns progress summary aligned with agent memory docs.
 */
app.get("/api/progress", (req, res) => {
  const userId = getUserId(req);
  const userState = getUserProgress(userId);
  const cards = buildCardsFromAwsLessons();
  const subjectId = req.query.subject || "all";
  const subjectCards = filterCardsBySubject(cards, subjectId);
  const stats = buildStudyStats(subjectCards, userState);
  const summary = buildProgressSummary(subjectCards, userState);

  res.json({
    activeSubject: subjectId,
    stats,
    summary,
    notes: userState.notes.slice(-20).reverse(),
    history: userState.history.slice(-40).reverse(),
  });
});

/**
 * POST /api/progress/reset
 * Resets study tracking for a specific subject (or all subjects).
 */
app.post("/api/progress/reset", (req, res) => {
  const userId = getUserId(req);
  const userState = getUserProgress(userId);
  const cards = buildCardsFromAwsLessons();
  const subjectId = req.body.subject || "all";

  const subjectCards = filterCardsBySubject(cards, subjectId);
  const cardIds = new Set(subjectCards.map((card) => card.id));

  Object.keys(userState.cards || {}).forEach((cardId) => {
    if (subjectId === "all" || cardIds.has(cardId)) {
      delete userState.cards[cardId];
    }
  });

  userState.history = (userState.history || []).filter((entry) => {
    if (entry.action !== "submitStudyAnswer") return true;
    const cardId = entry?.input?.cardId;
    if (!cardId) return true;
    return !(subjectId === "all" || cardIds.has(cardId));
  });

  saveProgressStore();

  appendInteractionLog({
    timestamp: new Date().toISOString(),
    userId,
    action: "resetProgress",
    parameters: { subjectId },
    outcome: "success",
  });

  res.json({
    success: true,
    subjectId,
    resetCardCount: subjectCards.length,
  });
});

/**
 * POST /api/tutor
 * Generates coaching feedback for the current card using OpenAI.
 */
app.post("/api/tutor", async (req, res) => {
  const userId = getUserId(req);
  const { question, selectedAnswer, correctAnswer, reference, sourcePath } =
    req.body;

  if (!question) {
    return res.status(400).json({ error: "question is required." });
  }

  try {
    const tutorPrompt = [
      `Question: ${question}`,
      `Learner selected: ${selectedAnswer || "Not provided"}`,
      `Correct answer: ${correctAnswer || "Not provided"}`,
      `Reference notes: ${reference || "Not provided"}`,
      `Source: ${sourcePath || "Not provided"}`,
      "Please explain why the correct answer is right in simple language and give a memory aid.",
    ].join("\n");

    const response = await askOpenAiTutor(tutorPrompt);

    appendInteractionLog({
      timestamp: new Date().toISOString(),
      userId,
      action: "askTutor",
      outcome: "success",
    });

    res.json({ response });
  } catch (error) {
    appendInteractionLog({
      timestamp: new Date().toISOString(),
      userId,
      action: "askTutor",
      outcome: "error",
      error: error.message,
    });
    res.status(503).json({ error: error.message });
  }
});

/**
 * GET /api/lessons/:id
 * Returns full lesson details.
 */
app.get("/api/lessons/:id", (req, res) => {
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }
  res.json(lesson);
});

/**
 * GET /api/quizzes/:lessonId
 * Returns the quiz for the specified lesson.  Answers are not included in the response.
 */
app.get("/api/quizzes/:lessonId", (req, res) => {
  const quiz = quizzes.find((q) => q.lessonId === req.params.lessonId);
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }
  // Omit correct answers before sending to client
  const strippedQuestions = quiz.questions.map(({ id, question, choices }) => ({
    id,
    question,
    choices,
  }));
  res.json({ lessonId: quiz.lessonId, questions: strippedQuestions });
});

/**
 * POST /api/quizzes/:lessonId
 * Accepts an array of user answers and returns the score and feedback.  In a full implementation,
 * this would update the user’s progress in a database or session.  Here we perform a simple evaluation.
 */
app.post("/api/quizzes/:lessonId", (req, res) => {
  const quiz = quizzes.find((q) => q.lessonId === req.params.lessonId);
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }
  const userAnswers = req.body.answers;
  if (
    !Array.isArray(userAnswers) ||
    userAnswers.length !== quiz.questions.length
  ) {
    return res.status(400).json({ error: "Invalid answers array" });
  }
  let score = 0;
  const feedback = [];
  quiz.questions.forEach((q, idx) => {
    const isCorrect =
      JSON.stringify(userAnswers[idx].sort()) ===
      JSON.stringify(q.answer.sort());
    if (isCorrect) score++;
    feedback.push({
      questionId: q.id,
      correct: isCorrect,
      explanation: q.explanation,
    });
  });
  res.json({ score, total: quiz.questions.length, feedback });
});

/**
 * GET /api/projects/:lessonId
 * Returns the hands‑on project instructions for a lesson.
 */
app.get("/api/projects/:lessonId", (req, res) => {
  const project = projects.find((p) => p.lessonId === req.params.lessonId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json(project);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
