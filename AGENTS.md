# Agent Specification for the Study Platform

This document defines the behaviour, capabilities and constraints of the **Study Assistant Agent** that powers the AWS Solutions Architect study platform. The agent acts as a virtual tutor, answering questions, providing explanations and guiding the learner through lessons, hands-on projects and quizzes. The agent can optionally connect to a local language model such as **Ollama** to generate responses.

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

### Current Project State

- App has been upgraded from lesson pages to a mobile-first flashcard study companion.
- Flashcards are auto-generated from `server/src/data/aws-lessons` (text/json/script-like files) plus anchor quiz cards from `server/src/data/quizzes.json`.
- Tutor endpoint is integrated with OpenAI and reads key/model from `server/.env`.
- Subject filters and queue filters are implemented.
- Progress and history are persisted in `server/src/data/progress-memory.json`.

### What Is Working

#### Backend (`server/src/index.js`)

- `GET /api/study/session`
  - Supports `subject` and `queue` query params.
  - Returns: active filters, subject/queue summaries, stats, and next card.
- `POST /api/study/answer`
  - Evaluates answer, updates streak/attempts/history, returns feedback + next card.
- `GET /api/progress`
  - Returns stats + summary payload:
    - `recentAnswers` (last 10)
    - `trend` (right/wrong sequence)
    - `topStrugglingSubject`
- `POST /api/progress/reset`
  - Resets tracking per subject or for all (`subject: "all"`).
- `POST /api/tutor`
  - Uses OpenAI Responses API with robust response parsing.
- Existing MVP endpoints are still present (`/api/lessons`, `/api/quizzes/:lessonId`, etc.) for compatibility.

#### Frontend (`client/src/App.jsx`)

- Subject selector (`All Subjects`, `Certification Essentials`, `Core Services`, `Exam Critical`).
- Queue selector (`All Due`, `Review Queue`, `New Cards`, `Mastered`).
- Card navigation controls (`Back`, `Forward`).
- Stats shown clearly:
  - Mastered, Remaining, Review Queue, Progress
  - Correct, Incorrect, Attempts, Accuracy
- Session summary panel:
  - Most missed subject
  - Last 10 trend
  - Last 10 answers (collapsible)
- Reset controls:
  - `Reset Subject`
  - `Reset Everything`

### Environment / Run

#### Server

1. `cd server`
2. `npm install`
3. Ensure `server/.env` contains:
   - `OPENAI_API_KEY=...`
   - `OPENAI_MODEL=gpt-4.1-mini`
   - `PORT=3000`
4. `npm run dev`

#### Client

1. `cd client`
2. `npm install`
3. `npm run dev`

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
