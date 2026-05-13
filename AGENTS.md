# Agent Specification for the Study Platform

This document defines the behaviour, capabilities and constraints of the **Study Assistant Agent** that powers the AWS AIF-C01 AI Practitioner study platform. The agent acts as a virtual tutor, answering questions, providing explanations and guiding the learner through flashcards, quizzes, and hands-on projects. The agent can optionally connect to a local language model such as **Ollama** to generate responses.

## Role and Responsibilities

- **Tutor and explainer** - Provide clear explanations of AWS concepts, exam topics and project steps. Encourage best practices (e.g., least-privilege IAM policies, cost optimization) and reference official sources where possible.
- **Navigation helper** - Retrieve lesson summaries, quiz questions and project instructions from the back-end API. Present them to the user in a conversational manner and allow the user to move between lessons.
- **Quiz master** - Present quiz questions, accept the user's answer(s), evaluate correctness and provide explanations or hints. Encourage the user to try again if incorrect.
- **Progress tracker** - Maintain a memory of which lessons the user has completed, scores achieved in quizzes and notes taken. Use this memory to personalize recommendations and highlight topics that need review.
- **Cheat sheet generator** - Retrieve and present cheat-sheet entries (AWS CLI commands, service limits, development commands). Provide context or examples when requested.
- **Safe behaviour** - Follow safety guidelines. Never ask for or expose personal information. Refuse to engage in prohibited topics (e.g., malicious hacking, sharing exam answers). Always cite sources when providing factual information.

## Skills

The agent exposes several skills (documented in `agent_docs/skills.md`) that can be invoked by the application's front end. Skills include:

| Skill                            | Description                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `getLessonList()`                | Returns a list of available lessons with titles and IDs.                                                                  |
| `getLesson(id)`                  | Retrieves the content of a lesson (objectives, description, resources and project summary).                               |
| `getQuiz(id)`                    | Fetches the quiz for a given lesson, including questions, choices and correct answers (used only internally to evaluate). |
| `submitQuizAnswers(id, answers)` | Accepts the user's selected answers and returns the score along with explanations for each question. Updates memory.      |
| `getProject(id)`                 | Retrieves the hands-on project for a lesson, including step-by-step instructions and expected outcomes.                   |
| `getCheatSheet(category)`        | Returns cheat-sheet entries for a given category (e.g., `aws-cli`, `development`).                                        |
| `recordNote()`                   | Allows the user to save personal notes associated with lessons or projects.                                               |
| `getProgress()`                  | Returns a summary of lessons completed, quiz scores and notes stored in memory.                                           |

Skills must be called with explicit parameters. They return structured data that the agent can use to formulate a response. Skills are pure functions; they never alter user data unless explicitly stated (e.g., `submitQuizAnswers` updates memory).

## Memory

Memory is stored per user session (see `agent_docs/memory.md`). It consists of:

1. **Lesson progress** - For each lesson, whether the user has viewed it, the timestamp of completion and the quiz score (if attempted). Lessons can be revisited without resetting progress.
2. **Notes** - Free-text notes created by the user, associated with specific lessons or projects. Notes are not shared with anyone else.
3. **Interaction history** - A log of questions asked and answers given, with timestamps. This history allows the agent to refer back to previous explanations and avoid repeating information.

The agent should consult memory to personalize responses (for example, reminding the user of an uncompleted lesson) but never reveal sensitive data to other users.

## Logging

All interactions are logged to a server-side log file (see `agent_docs/logging.md`). Each log entry includes the timestamp, user ID (if available), action performed, input parameters and output. Logs are used for debugging and improving the platform but must not be used to track individual user behaviour beyond the scope of the study platform.

## Integration with Local Models (Ollama)

If the user has a local language model such as **Ollama** installed, the agent can optionally delegate natural-language generation to that model. When configured, the agent passes the structured response (e.g., lesson content or quiz feedback) to the local model to paraphrase or elaborate. The agent still enforces safety rules and ensures that the returned text remains factual and helpful. When the local model is unavailable or disabled, the agent generates responses directly from the data it has access to.

## Safety and Ethics

- **Follow the application's safety policies** - Do not execute harmful code, do not reveal sensitive information and do not provide exam answers or cheat on the certification exam.
- **Be transparent** - When citing facts, include citations to the official exam guide or other credible sources. If information is uncertain or unavailable, admit it.
- **Respect user privacy** - Do not store or display personally identifiable information. Memory and logs store only what is necessary for the learning experience.
- **Encourage learning** - Provide constructive feedback, suggest additional resources and encourage the user to think critically rather than memorize answers.

For more details about skills, memory and logging, see the documents in the `agent_docs` folder.

## Handoff Notes (AWS Study Companion)

### Current Project State (updated May 13 2026)

- App is a mobile-first flashcard study companion for AWS AIF-C01.
- Flashcards are auto-generated from `server/src/data/aws-lessons` PDF slides + anchor quiz cards from `server/src/data/quizzes.json`.
- Tutor endpoint is integrated with OpenAI and reads key/model from `server/.env`.
- Subject filters and queue filters are implemented.
- Progress and history are persisted in `server/src/data/progress-memory.json`.
- Server runs on **port 3001** (not 3000 — changed due to Docker conflict).
- Client runs on **port 5173** with `strictPort: true`.

### Known Bug — MUST FIX NEXT SESSION

**Answer evaluation is broken.** Selecting any answer always evaluates incorrectly, and selecting the 4th choice (index 3) always evaluates as correct regardless of what it contains.

**Root cause (already identified, not yet fixed):**

`sanitizeCardForClient()` in `server/src/index.js` Fisher-Yates shuffles the choices on every serve and sends the shuffled order + new `correctIndex` to the client. But `POST /api/study/answer` evaluates correctness by comparing the client's submitted `choiceIndex` against `card.correctIndex` from the **cached (pre-shuffle) deck** — a completely different ordering.

```js
// BUG in POST /api/study/answer (~line 1185):
const correct = choiceIndex === card.correctIndex;
//              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// card.correctIndex is the pre-shuffle cached index.
// choiceIndex is based on the shuffled order the client saw.
// These never match correctly.
```

**Fix:** Compare the selected choice *text* against `card.expectedAnswer` instead of comparing numeric indices:

```js
// CORRECT approach:
const selectedText = card.choices[choiceIndex];
const correct = selectedText === card.expectedAnswer;
```

`card.choices` in the cache is the pre-shuffle order. `choiceIndex` is the post-shuffle index from the client. So `card.choices[choiceIndex]` is still wrong. The client needs to either:
- Send the selected text instead of the index, OR
- The server needs to use the shuffled `choices` array it actually sent.

**Recommended fix path:**
1. In `sanitizeCardForClient`, add the shuffled choices to the returned object (already done — `choices` is the shuffled array).
2. In `POST /api/study/answer`, look up the card's shuffled choices by doing `card.choices[choiceIndex]` — BUT `card` here is from the pre-shuffle cache. So the simplest fix is: **have the client send the selected answer text** (`card.choices[selectedChoice]`) instead of just the index. The server then checks `submittedAnswer === card.expectedAnswer`.

Check `client/src/App.jsx` around line 166–170 where `submitAnswer` is called — it already computes `selectedAnswer = card.choices[selectedChoice]`. Just send that text field to the server and evaluate against `card.expectedAnswer`.

### What Is Working

#### Backend (`server/src/index.js`)

- `GET /api/study/session` — returns active filters, subject/queue summaries, stats, next card (with shuffled choices).
- `POST /api/study/answer` — evaluates answer (BROKEN — see bug above), updates streak/attempts/history, returns feedback + next card.
- `GET /api/progress` — returns stats + `recentAnswers`, `trend`, `topStrugglingSubject`.
- `POST /api/progress/reset` — resets per subject or all.
- `POST /api/tutor` — OpenAI Responses API with robust response parsing.
- `expectedAnswer` is now included in `sanitizeCardForClient` output (was missing — fixed this session).
- Choices are Fisher-Yates shuffled on every serve (fixed this session — was always index 3 correct due to deterministic SHA-256 sort).

#### PDF Card Generation (`parsePdfCards` in `server/src/index.js`)

- Splits on `-- N of M --` slide markers (Pluralsight PDF format).
- Exam-review PDFs (`exam-question-review-slides.pdf`) are **skipped** — correct answer is visual-only (highlighting) and undetectable from text.
- Concept slides: extracts title + body, skips URL-only slides and short/noisy slides.
- Question slides with A/B/C/D choices: paired with next slide to build Q+A card.
- Section-header question slides (no A/B/C/D following) are skipped.

#### Frontend (`client/src/App.jsx`)

- Subject selector, queue selector, card navigation, stats panel, session summary, reset controls — all present.
- `getUserId()` uses `crypto.randomUUID()` (fixed from `Math.random()` this session).

### Environment / Run

#### Server

1. `cd server && npm install`
2. Ensure `server/.env` contains:
   - `OPENAI_API_KEY=...`
   - `OPENAI_MODEL=gpt-4.1-mini`
   - `PORT=3001`
3. `npm run dev`

#### Client

1. `cd client && npm install`
2. `npm run dev` → http://localhost:5173

#### Port Conflicts

- If port 3001 or 5173 is in use, check `docker ps` first — another project (`hadesrehabcompletestarter`) had containers on both ports.
- `fuser` cannot kill Docker namespace processes; use `docker stop <container>`.

### Deck Stats (current)

- Total: 85 cards
- AI/ML Fundamentals: 40
- Generative AI Fundamentals: 30
- Exam Critical (quiz-anchor): 15

### Next Session Prompt

> **Start here:** There is a confirmed bug in answer evaluation in `server/src/index.js`. In `POST /api/study/answer` (~line 1185), correctness is evaluated as `choiceIndex === card.correctIndex`. This is broken because `sanitizeCardForClient()` Fisher-Yates shuffles the choices on every serve, so the `correctIndex` in the cached card does not match the `choiceIndex` the client sends back (which is based on the shuffled order). The result: answers are almost always wrong, and selecting the 4th option always evaluates as correct.
>
> **Fix, test, and verify:**
> 1. Change the server to evaluate by comparing answer text: the client already sends `choiceIndex` — look up `card.choices[choiceIndex]` from the **shuffled** choices. The cleanest fix is to have the client send `selectedAnswerText` (it already computes this as `selectedAnswer = card.choices[selectedChoice]` around line 166 of `App.jsx`) and have the server compare `submittedAnswerText === card.expectedAnswer`.
> 2. After fixing, start server (`cd server && npm run dev`) and client (`cd client && npm run dev`), open http://localhost:5173, select each choice one by one on a card, and confirm only the correct one registers as right.
> 3. Verify stats (correct/incorrect counts) increment correctly.

### Known Follow-Up Opportunities

- Add stronger scoring/retention model (spaced repetition intervals, not just streak).
- Improve semantic distractors (domain-aware wrong options vs random pool).
- Add per-subject reset audit message and optional export/import of progress memory.
- Add lightweight charting for trend over time.
- Add accessibility mode toggles.

### Data Rules / Generation Notes

- Binary files are skipped (pdf/png/jpg/jpeg/zip).
- JSON card generation avoids low-value metadata prompts (e.g., version-only noise) and focuses on meaningful policy semantics.
- Choice generation is filtered to avoid long/noisy/code-like distractors.

### Known Follow-Up Opportunities

- Add stronger scoring/retention model (spaced repetition intervals, not just streak).
- Improve semantic distractors (domain-aware wrong options vs random pool).
- Add per-subject reset audit message and optional export/import of progress memory.
- Add lightweight charting for trend over time.
- Add accessibility mode toggles (reduced motion, larger text/hit targets, high-clarity mode).

### Suggested Next Iteration Plan

1. Ingest richer concepts from more file types (optional OCR/PDF text pipeline).
2. Add spaced repetition scheduling and due dates.
3. Improve wrong-answer remediation (mini-drills per weak subject).
4. Add a compact diagnostics page (current user id, active filters, memory snapshot).

### Quick Validation Checklist

- `GET /api/study/session?subject=all&queue=all-due` returns card + queues + stats.
- Submit wrong answer and confirm:
  - incorrect count increments
  - card remains in review flow
- Submit correct answer and confirm:
  - correct count increments
  - forward flow advances
- `POST /api/progress/reset` with subject and all works as expected.
- `POST /api/tutor` returns generated guidance with valid API key.

### Notes for Future Agent

- If card quality regresses, inspect JSON parsing and distractor pool logic first.
- If progress looks wrong, verify `x-user-id` consistency between browser session and API calls.
- If OpenAI fails, verify `server/.env` loading and key validity before changing app logic.
