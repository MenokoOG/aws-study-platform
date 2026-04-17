# AWS Solutions Architect Study Platform

This repository now contains a mobile-first flashcard mastery companion for the **AWS Certified Solutions Architect - Associate** exam. The app continuously adapts to your local course files in `server/src/data/aws-lessons` and repeats missed cards until you get them right.

## Features

- Auto-ingested flashcards from your downloaded course assets in `server/src/data/aws-lessons`.
- Mastery loop: wrong answers are shown again until your streak reaches the passing threshold.
- Progress tracking with mastery %, review counts, history, and personal notes.
- Reference reinforcement: each wrong answer includes explanation and source material path.
- Optional AI tutor endpoint powered by OpenAI for supportive concept coaching.
- Existing lesson/project/quiz endpoints are still available for compatibility.

## Getting started

> **Note:** The code files in this repository are provided as a starting point.  You must install the dependencies and run the application on your own machine.  Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Set up the back-end

1. Open a terminal and navigate to the `server` directory:

   ```sh
   cd server
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. (Optional) Configure AI tutor support:

   ```sh
   export OPENAI_API_KEY="your_openai_api_key"
   export OPENAI_MODEL="gpt-4.1-mini"
   ```

4. Start the server (by default on port 3000):

   ```sh
   npm run start
   ```

   The API endpoints will be available at `http://localhost:3000/api`.

### Set up the front-end

1. In a new terminal, navigate to the `client` directory:

   ```sh
   cd client
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Start the development server using Vite:

   ```sh
   npm run dev
   ```

   By default, the front end runs on port 5173.  The Vite configuration proxies `/api` requests to the back‑end server.

4. Open your browser to `http://localhost:5173`.

You will land directly in the flashcard study companion screen.

### Build for production

To create a production build of the front end:

```sh
cd client
npm run build
```

The build output will be placed in `client/dist`.  You can configure your back‑end server (e.g., Express or a static file server) to serve the static assets.

## Study Data Flow

1. Drop new files into `server/src/data/aws-lessons`.
2. Start or refresh the app.
3. The server regenerates cards from supported text-like files (`.txt`, `.json`, `.sh`, `.py`, `.js`, `.html`, `.rtf`, `.md`) and merges them with exam-critical anchors from `quizzes.json`.
4. Binary course files (`.pdf`, `.png`, `.zip`, etc.) are safely skipped.

Progress and note memory is persisted to `server/src/data/progress-memory.json`.

## Agent Documentation

The `AGENTS.MD` file describes the study assistant agent behavior, skills, memory and safety rules. Additional documents in `agent_docs/` provide detailed specifications for skills, memory management and logging policies.

## Contributing And Extending

This project is intentionally lightweight and easy to extend. Possible enhancements include:

- Adding authenticated user profiles for multi-device sync.
- Introducing spaced-repetition scheduling and decay windows per topic.
- Adding PDF extraction pipelines to generate cards from slide content.
- Expanding AI tutor to include source citations and follow-up drills.

Contributions are welcome!  Feel free to fork the repository and adapt it to your learning needs.