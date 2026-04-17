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
  const [stats, setStats] = useState(null);
  const [card, setCard] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const [tutorReply, setTutorReply] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);

  const headers = useMemo(() => ({ "x-user-id": userId }), [userId]);

  const loadSession = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/study/session", { headers });
      setStats(response.data.stats);
      setCard(response.data.card);
      setSelectedChoice(null);
      setFeedback(null);
      setTutorReply("");
      setNoteStatus("");
    } catch (requestError) {
      setError(
        "Could not load your study session. Check that the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

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
        },
        { headers },
      );

      setFeedback({
        correct: response.data.correct,
        expectedAnswer: response.data.expectedAnswer,
        selectedAnswer,
        reference: response.data.reference,
        sourcePath: response.data.sourcePath,
        mastered: response.data.mastered,
        streak: response.data.streak,
      });
      setStats(response.data.stats);
      setCard(response.data.card);
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
          question: card?.prompt || "Help explain this AWS concept.",
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

          {stats && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip label="Mastered" value={`${stats.masteredCards}`} />
              <StatChip label="Remaining" value={`${stats.remainingCards}`} />
              <StatChip label="Needs review" value={`${stats.needsReview}`} />
              <StatChip label="Progress" value={`${masteryPercent}%`} accent />
            </div>
          )}
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
