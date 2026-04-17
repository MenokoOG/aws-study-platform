import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const USER_KEY = "aws-study-user-id";

function getUserId() {
  const existing = localStorage.getItem(USER_KEY);
  if (existing) return existing;
  const generated = `learner-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(USER_KEY, generated);
  return generated;
}

function App() {
  const [userId] = useState(getUserId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("all");
  const [queues, setQueues] = useState([]);
  const [queueId, setQueueId] = useState("all-due");
  const [stats, setStats] = useState(null);
  const [progressSummary, setProgressSummary] = useState({
    recentAnswers: [],
    trend: [],
    topStrugglingSubject: null,
  });
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [resetStatus, setResetStatus] = useState("");
  const [historyState, setHistoryState] = useState({ cards: [], index: -1 });
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const [tutorReply, setTutorReply] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);

  const headers = useMemo(() => ({ "x-user-id": userId }), [userId]);

  const card =
    historyState.index >= 0 ? historyState.cards[historyState.index] : null;

  const clearTransientState = () => {
    setSelectedChoice(null);
    setFeedback(null);
    setTutorReply("");
    setNoteStatus("");
  };

  const resetHistory = (nextCard) => {
    setHistoryState({
      cards: nextCard ? [nextCard] : [],
      index: nextCard ? 0 : -1,
    });
  };

  const appendToHistory = (nextCard) => {
    if (!nextCard) return;
    setHistoryState((prev) => {
      const clipped = prev.cards.slice(0, prev.index + 1);
      if (
        clipped.length > 0 &&
        clipped[clipped.length - 1].id === nextCard.id
      ) {
        return {
          cards: clipped,
          index: clipped.length - 1,
        };
      }

      const cards = [...clipped, nextCard];
      return {
        cards,
        index: cards.length - 1,
      };
    });
  };

  const loadSession = async (
    nextSubject = subjectId,
    nextQueue = queueId,
    reset = true,
  ) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/study/session", {
        headers,
        params: { subject: nextSubject, queue: nextQueue },
      });
      setSubjectId(response.data.activeSubject || nextSubject);
      setQueueId(response.data.activeQueue || nextQueue);
      setSubjects(response.data.subjects || []);
      setQueues(response.data.queues || []);
      setStats(response.data.stats);
      await loadProgressSummary(response.data.activeSubject || nextSubject);
      if (reset) {
        resetHistory(response.data.card || null);
      } else {
        appendToHistory(response.data.card || null);
      }
      clearTransientState();
    } catch (requestError) {
      setError(
        "Could not load your study session. Check that the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession("all", "all-due", true);
  }, []);

  const loadProgressSummary = async (nextSubject = subjectId) => {
    try {
      const response = await axios.get("/api/progress", {
        headers,
        params: { subject: nextSubject },
      });
      setProgressSummary(
        response.data.summary || {
          recentAnswers: [],
          trend: [],
          topStrugglingSubject: null,
        },
      );
    } catch (requestError) {
      // Keep current summary if progress endpoint is temporarily unavailable.
    }
  };

  const submitAnswer = async () => {
    if (!card || selectedChoice === null) return;

    setError("");
    try {
      const selectedAnswer = card.choices[selectedChoice];
      const response = await axios.post(
        "/api/study/answer",
        {
          cardId: card.id,
          choiceIndex: selectedChoice,
          subject: subjectId,
          queue: queueId,
        },
        { headers },
      );

      setFeedback({
        question: card.prompt,
        correct: response.data.correct,
        expectedAnswer: response.data.expectedAnswer,
        selectedAnswer,
        reference: response.data.reference,
        sourcePath: response.data.sourcePath,
        mastered: response.data.mastered,
        streak: response.data.streak,
      });
      setSubjectId(response.data.activeSubject || subjectId);
      setQueueId(response.data.activeQueue || queueId);
      setSubjects(response.data.subjects || subjects);
      setQueues(response.data.queues || queues);
      setStats(response.data.stats);
      await loadProgressSummary(response.data.activeSubject || subjectId);
      if (response.data.correct) {
        appendToHistory(response.data.card || null);
      }
      setSelectedChoice(null);
      setTutorReply("");
    } catch (requestError) {
      setError("Could not submit answer. Try again in a moment.");
    }
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setNoteStatus("Saving...");

    try {
      await axios.post(
        "/api/study/note",
        {
          cardId: feedback?.correct
            ? null
            : feedback?.sourcePath || card?.id || null,
          text: noteText,
        },
        { headers },
      );
      setNoteStatus("Saved.");
      setNoteText("");
    } catch (requestError) {
      setNoteStatus("Failed to save note.");
    }
  };

  const askTutor = async () => {
    if (!feedback) return;
    setTutorLoading(true);
    setTutorReply("");
    setError("");

    try {
      const response = await axios.post(
        "/api/tutor",
        {
          question: feedback?.question || "Help explain this AWS concept.",
          selectedAnswer: feedback.selectedAnswer,
          correctAnswer: feedback.expectedAnswer,
          reference: feedback.reference,
          sourcePath: feedback.sourcePath,
        },
        { headers },
      );
      setTutorReply(response.data.response);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.error ||
        "Tutor is unavailable right now.";
      setTutorReply(message);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleSubjectChange = async (event) => {
    const nextSubject = event.target.value;
    setSubjectId(nextSubject);
    await loadSession(nextSubject, queueId, true);
  };

  const handleQueueChange = async (event) => {
    const nextQueue = event.target.value;
    setQueueId(nextQueue);
    await loadSession(subjectId, nextQueue, true);
  };

  const resetTracking = async (scope = "subject") => {
    const subjectLabel =
      subjects.find((subject) => subject.id === subjectId)?.label ||
      "current subject";

    const targetLabel = scope === "all" ? "ALL subjects" : subjectLabel;
    const targetValue = scope === "all" ? "all" : subjectId;

    const confirmed = window.confirm(
      `Reset tracking for ${targetLabel}? This clears right/wrong stats and streaks for this scope.`,
    );
    if (!confirmed) return;

    setResetStatus("Resetting...");
    try {
      await axios.post(
        "/api/progress/reset",
        { subject: targetValue },
        { headers },
      );
      setResetStatus(
        scope === "all"
          ? "All tracking reset."
          : `Tracking reset for ${subjectLabel}.`,
      );
      await loadSession(scope === "all" ? "all" : subjectId, queueId, true);
    } catch (requestError) {
      setResetStatus("Reset failed.");
    }
  };

  const goToPreviousCard = () => {
    setHistoryState((prev) => ({
      ...prev,
      index: Math.max(prev.index - 1, 0),
    }));
    clearTransientState();
  };

  const goToNextCard = async () => {
    if (historyState.index < historyState.cards.length - 1) {
      setHistoryState((prev) => ({
        ...prev,
        index: prev.index + 1,
      }));
      clearTransientState();
      return;
    }

    await loadSession(subjectId, queueId, false);
  };

  const masteryPercent = stats?.masteryPercent || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white font-body text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-orange-300/35 blur-3xl" />
        <div className="absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
        <header className="animate-floatIn rounded-3xl border border-orange-200/80 bg-white/85 p-5 shadow-aura backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            AWS SAA Companion
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-slate-900">
            Mastery Flashcards
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Focus mode: every missed card loops back until you own it. Built for
            calm, repeatable progress.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Subject Area
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none ring-orange-300 focus:ring"
                value={subjectId}
                onChange={handleSubjectChange}
              >
                {(subjects.length > 0
                  ? subjects
                  : [
                      {
                        id: "all",
                        label: "All Subjects",
                        remainingCards: 0,
                        totalCards: 0,
                      },
                    ]
                ).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.label} ({subject.remainingCards}/
                    {subject.totalCards} left)
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Card Queue
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none ring-orange-300 focus:ring"
                value={queueId}
                onChange={handleQueueChange}
              >
                {(queues.length > 0
                  ? queues
                  : [
                      {
                        id: "all-due",
                        label: "All Due",
                        count: 0,
                      },
                    ]
                ).map((queue) => (
                  <option key={queue.id} value={queue.id}>
                    {queue.label} ({queue.count})
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                disabled={historyState.index <= 0}
                onClick={goToPreviousCard}
              >
                Back
              </button>
              <button
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                disabled={!card}
                onClick={goToNextCard}
              >
                Forward
              </button>
              <button
                className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                onClick={() => resetTracking("subject")}
              >
                Reset Subject
              </button>
              <button
                className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                onClick={() => resetTracking("all")}
              >
                Reset Everything
              </button>
            </div>
          </div>

          {resetStatus && (
            <p className="mt-2 text-xs font-medium text-rose-700">
              {resetStatus}
            </p>
          )}

          {stats && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip label="Mastered" value={`${stats.masteredCards}`} />
              <StatChip label="Remaining" value={`${stats.remainingCards}`} />
              <StatChip
                label="Review Queue"
                value={`${stats.reviewQueueCards ?? stats.needsReview ?? 0}`}
              />
              <StatChip label="Progress" value={`${masteryPercent}%`} accent />
            </div>
          )}

          {stats && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip
                label="Correct"
                value={`${stats.correctAttempts ?? 0}`}
              />
              <StatChip
                label="Incorrect"
                value={`${stats.incorrectAttempts ?? 0}`}
              />
              <StatChip
                label="Attempts"
                value={`${stats.totalAttempts ?? 0}`}
              />
              <StatChip
                label="Accuracy"
                value={`${stats.accuracyPercent ?? 0}%`}
              />
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Session Summary
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Most Missed Subject
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {progressSummary.topStrugglingSubject
                    ? `${progressSummary.topStrugglingSubject.label} (${progressSummary.topStrugglingSubject.mistakes})`
                    : "No misses yet"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Last 10 Trend
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(progressSummary.trend || []).length > 0 ? (
                    progressSummary.trend.map((item, idx) => (
                      <span
                        key={`${item}-${idx}`}
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item === "correct"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item === "correct" ? "R" : "W"}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      No attempts yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Last 10 Answers
                </p>
                <button
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setIsHistoryCollapsed((prev) => !prev)}
                >
                  {isHistoryCollapsed ? "Show" : "Hide"}
                </button>
              </div>

              {!isHistoryCollapsed && (
                <div className="mt-2 space-y-2">
                  {(progressSummary.recentAnswers || []).length > 0 ? (
                    progressSummary.recentAnswers.map((entry, idx) => (
                      <div
                        key={`${entry.cardId}-${entry.timestamp}-${idx}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs font-medium text-slate-600">
                          {entry.subjectLabel} •{" "}
                          {entry.correct ? "Right" : "Wrong"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-800">
                          {entry.prompt}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No answers yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="mt-5 animate-floatIn rounded-3xl border border-amber-200/80 bg-white/90 p-4 shadow-lg backdrop-blur sm:p-6">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>

          {loading && (
            <p className="text-sm text-slate-600">Preparing your deck...</p>
          )}
          {!loading && error && (
            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          {!loading && !error && !card && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="font-display text-xl text-emerald-800">
                Session complete
              </h2>
              <p className="mt-2 text-sm text-emerald-700">
                You mastered every currently generated card. Add new files to
                aws-lessons, then refresh this session.
              </p>
              <button
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                onClick={loadSession}
              >
                Refresh deck
              </button>
            </div>
          )}

          {!loading && !error && card && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                {card.topic}
              </p>
              {card.subjectLabel && (
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Subject: {card.subjectLabel}
                </p>
              )}
              <h2 className="mt-2 font-display text-2xl leading-tight text-slate-900">
                {card.prompt}
              </h2>

              <div className="mt-4 space-y-3">
                {card.choices.map((choice, index) => {
                  const selected = selectedChoice === index;
                  return (
                    <button
                      key={`${card.id}-${index}`}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? "border-orange-500 bg-orange-100 text-slate-900"
                          : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50"
                      }`}
                      onClick={() => setSelectedChoice(index)}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              <button
                className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={selectedChoice === null}
                onClick={submitAnswer}
              >
                Check answer
              </button>
            </div>
          )}
        </section>

        {feedback && (
          <section className="mt-5 animate-floatIn space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg sm:p-6">
            <div
              className={`rounded-2xl p-4 ${feedback.correct ? "bg-emerald-50" : "bg-rose-50"}`}
            >
              <p
                className={`text-sm font-semibold ${feedback.correct ? "text-emerald-700" : "text-rose-700"}`}
              >
                {feedback.correct
                  ? "Correct. Great work."
                  : "Not quite yet. You will see this card again."}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold">Answer:</span>{" "}
                {feedback.expectedAnswer}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold">Reference:</span>{" "}
                {feedback.reference}
              </p>
              {feedback.sourcePath && (
                <p className="mt-2 break-all text-xs text-slate-500">
                  Source: {feedback.sourcePath}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Current streak on this card: {feedback.streak}
              </p>
            </div>

            {!feedback.correct && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-orange-700">
                    Need a calmer explanation?
                  </p>
                  <button
                    className="rounded-xl bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
                    onClick={askTutor}
                    disabled={tutorLoading}
                  >
                    {tutorLoading ? "Thinking..." : "Ask AI tutor"}
                  </button>
                </div>
                {tutorReply && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                    {tutorReply}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-800">
                Quick personal note
              </p>
              <textarea
                className="mt-2 min-h-[96px] w-full rounded-xl border border-cyan-200 bg-white p-3 text-sm text-slate-900 outline-none ring-orange-300 transition focus:ring"
                placeholder="Write your own memory anchor for this topic..."
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
              />
              <div className="mt-3 flex items-center justify-between">
                <button
                  className="rounded-xl bg-cyan-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-800"
                  onClick={saveNote}
                >
                  Save note
                </button>
                <span className="text-xs text-cyan-800">{noteStatus}</span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatChip({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        accent
          ? "border-orange-300 bg-orange-100 text-orange-800"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-1 font-display text-xl leading-none">{value}</p>
    </div>
  );
}

export default App;
