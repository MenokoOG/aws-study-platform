# Agent Memory Specification

The study assistant agent maintains per‑user memory to provide a personalized learning experience.  Memory is stored server‑side and is not persisted beyond the scope of the study platform.  The agent accesses and updates memory via internal APIs and never exposes raw memory contents directly.

## Data structure

Memory is represented as a JSON object with the following top‑level properties:

| Property | Type | Description |
|---------|------|-------------|
| `lessons` | object | A mapping from lesson IDs to lesson progress data.  Each entry includes the keys `viewed` (boolean), `completedAt` (timestamp or null) and `quizScore` (number between 0 and total questions or null). |
| `notes` | array | A list of note objects created by the user.  Each note has `lessonId`, `text` and `timestamp`. |
| `history` | array | A chronological list of interactions.  Each entry contains `timestamp`, `action` (e.g., `viewLesson`, `submitQuiz`), input parameters and output summary.  This history allows the agent to reference previous explanations and avoid repetition. |

## Updating memory

- When the user views a lesson via `getLesson()`, the agent marks the lesson’s `viewed` status as `true` if it has not been viewed before.
- When the user completes a quiz via `submitQuizAnswers()`, the agent records the `quizScore` and marks `completedAt` with the current timestamp if the score meets or exceeds the passing threshold (the threshold can be configured by the platform).  The agent also appends a log entry to `history`.
- When the user adds a note via `recordNote()`, the note is appended to the `notes` array and a history entry is added.

## Privacy considerations

Memory only stores information relevant to the user’s learning progress.  It does not include personal identifiers beyond a unique user ID assigned by the platform.  Memory is never shared with other users.  If a user requests deletion of their data, the platform should remove all associated memory entries.