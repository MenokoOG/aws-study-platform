# Skills for the Study Assistant Agent

This document lists the available skills that the study assistant agent can perform.  Skills are invoked by the platform’s front end and return structured data.  All skills must be deterministic and have no side effects unless explicitly stated.

## List of skills

### `getLessonList()`
Returns an array of lesson summaries.  Each summary includes:

| Field | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the lesson. |
| `title` | string | Lesson title. |
| `domain` | string | The exam domain the lesson belongs to (e.g., `secure`, `resilient`). |
| `completed` | boolean | Whether the user has completed the lesson (from memory). |

### `getLesson(id)`
Returns the full content of a lesson, given its ID.  Fields include:

| Field | Type | Description |
|------|------|-------------|
| `id` | string | Lesson identifier. |
| `title` | string | Lesson title. |
| `domain` | string | Domain name. |
| `objectives` | string[] | List of learning objectives. |
| `description` | string | Detailed lesson content, including explanatory text and recommended resources. |
| `projectSummary` | string | Short summary of the hands‑on project associated with this lesson. |

### `getQuiz(lessonId)`
Returns the quiz associated with a lesson.  The quiz object contains:

| Field | Type | Description |
|------|------|-------------|
| `lessonId` | string | ID of the lesson the quiz belongs to. |
| `questions` | array | Each item is an object with `id`, `questionText`, `choices` (array of strings) and `answer` (array of correct choice indexes).  The `answer` field is not sent to the client; it is used internally by the agent to evaluate results. |

### `submitQuizAnswers(lessonId, answers)`
Takes the user’s selected answers (an array of selected choice indexes for each question) and returns a result object with:

| Field | Type | Description |
|------|------|-------------|
| `score` | number | Number of correct answers. |
| `total` | number | Total number of questions. |
| `feedback` | array | For each question, whether the answer was correct and an explanation or hint. |
| `completed` | boolean | Whether the user passed the quiz (e.g., score ≥ passing threshold). |

This skill updates the user’s progress in memory.

### `getProject(lessonId)`
Returns the detailed hands‑on project for a lesson.  Fields include:

| Field | Type | Description |
|------|------|-------------|
| `title` | string | Project title. |
| `introduction` | string | A short overview of the project. |
| `steps` | string[] | Step‑by‑step instructions for performing the project in AWS. |
| `expectedOutcome` | string | What the learner should achieve by the end of the project. |

### `getCheatSheet(category)`
Returns cheat‑sheet entries for a given category.  Categories can include `aws-cli`, `iam`, `networking`, `compute`, `storage`, `development`, etc.  Each entry has:

| Field | Type | Description |
|------|------|-------------|
| `command` | string | The CLI or shell command. |
| `description` | string | A short explanation of what the command does. |
| `notes` | string | Additional notes or best practices. |

### `recordNote(lessonId, text)`
Creates a note associated with a specific lesson.  The agent stores the note text in memory along with a timestamp.  Notes are retrievable via `getProgress()`.

### `getProgress()`
Returns a summary of the user’s progress across all lessons, including completion status, quiz scores and any notes.