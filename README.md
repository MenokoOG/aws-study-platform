# AWS Solutions Architect Study Platform

This repository contains a simple full‑stack study platform designed to help learners prepare for the **AWS Certified Solutions Architect – Associate** exam.  The application serves lesson content, hands‑on projects, quizzes and cheat sheets through an API and a React front end.

## Features

- Four comprehensive lessons covering the exam domains: secure architectures, resilient architectures, high‑performing architectures and cost‑optimized architectures.
- Hands‑on projects for each lesson to practise your skills in an AWS environment.
- Multiple‑choice quizzes with feedback.
- Cheat sheets summarizing common AWS CLI and development commands.
- A study assistant agent specification (`AGENTS.MD`) and supporting documentation in `agent_docs/`.

## Getting started

> **Note:** The code files in this repository are provided as a starting point.  You must install the dependencies and run the application on your own machine.  Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Set up the back‑end

1. Open a terminal and navigate to the `server` directory:

   ```sh
   cd server
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Start the server (by default on port 3000):

   ```sh
   npm run start
   ```

   The API endpoints will be available at `http://localhost:3000/api`.

### Set up the front‑end

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

4. Open your browser to `http://localhost:5173` to view the application.  You can navigate through the lessons, complete quizzes and view projects.

### Build for production

To create a production build of the front end:

```sh
cd client
npm run build
```

The build output will be placed in `client/dist`.  You can configure your back‑end server (e.g., Express or a static file server) to serve the static assets.

## Agent documentation

The `AGENTS.MD` file describes the study assistant agent’s behaviour, skills, memory and safety rules.  Additional documents in the `agent_docs/` folder provide detailed specifications of skills, memory management and logging policies.  If you plan to integrate a conversational agent (e.g., using a local model like **Ollama**), refer to these documents for guidance.

## Contributing and extending

This project is intentionally lightweight and easy to extend.  Possible enhancements include:

- Adding authentication and user accounts to persist progress across sessions.
- Integrating a database (e.g., DynamoDB or PostgreSQL) instead of JSON files.
- Incorporating interactive labs or simulated AWS environments.
- Expanding cheat sheets with additional services and commands.
- Internationalizing the UI and content.

Contributions are welcome!  Feel free to fork the repository and adapt it to your learning needs.