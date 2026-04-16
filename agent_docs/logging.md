# Logging Policy for the Study Assistant Agent

The study platform logs interactions to assist with debugging, usage analytics and improving future versions of the application.  Logging is transparent and follows these guidelines:

## What gets logged

- **Action type** – The type of operation performed (e.g., `getLesson`, `submitQuizAnswers`).
- **Timestamp** – When the action occurred, recorded in ISO 8601 format.
- **User identifier** – An anonymized identifier used by the platform (e.g., a UUID).  Logs never contain personally identifiable information.
- **Parameters** – The inputs supplied to the skill, with sensitive values redacted when necessary.  For example, quiz answers are stored as indexes rather than raw text.
- **Outcome** – A summary of the result (e.g., success or error) and important metrics (e.g., quiz score).

## Storage and retention

Logs are written to a server‑side file and, optionally, to a database.  Access to logs is restricted to authorized administrators.  Logs are retained for a period determined by the platform’s privacy policy (e.g., 90 days) and then purged.

## Usage

Logs are used solely for:

1. **Debugging** – Identifying and fixing errors or bugs in the application.
2. **Analytics** – Understanding how users interact with lessons and quizzes to improve content.  Analytics are aggregated and do not identify individual users.
3. **Security auditing** – Ensuring that the agent behaves according to the specified rules and that there are no unauthorized actions.

Logs are **never** used to monitor or profile users for advertising or other unrelated purposes.  Users may request a summary of their own interaction history.