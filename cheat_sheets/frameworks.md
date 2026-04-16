# Development Cheat Sheet (Node.js, NPM, React, Vite)

This cheat sheet summarizes common commands and patterns used when developing with Node.js, npm, React and Vite.  Use these commands as quick references while building and running the study platform.

## Node.js & npm

- **Initialize a new project** – Create a `package.json` file with default values:

  ```sh
  npm init -y
  ```

- **Install a dependency** – Add a package to your project (saves to `dependencies`):

  ```sh
  npm install express cors
  ```

- **Install a development dependency** – Save the package under `devDependencies`:

  ```sh
  npm install -D nodemon
  ```

- **Run a script** – Execute a command defined in `package.json` under `scripts`:

  ```sh
  npm run dev
  npm run build
  ```

- **Update packages** – Check for outdated packages and update:

  ```sh
  npm outdated
  npm update
  ```

## Express.js

- **Basic server setup** – An Express server listening on port 3000:

  ```js
  const express = require('express');
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Hello, world!');
  });

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
  ```

- **Add CORS support** – Allow cross‑origin requests (e.g., from `localhost:5173`):

  ```js
  const cors = require('cors');
  app.use(cors({ origin: 'http://localhost:5173' }));
  ```

## Vite

Vite is a fast build tool that replaces traditional bundlers for modern front‑end projects.

- **Create a new Vite React app** – Use npm’s `create-vite` package (installed globally or via `npm init vite@latest`):

  ```sh
  npm create vite@latest my-app -- --template react
  cd my-app
  npm install
  npm run dev
  ```

- **Vite scripts** – In `package.json` of a Vite project:

  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    }
  }
  ```

## React

- **Create a functional component**:

  ```jsx
  import React from 'react';

  function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
  }

  export default Welcome;
  ```

- **Use state and effects with hooks**:

  ```jsx
  import { useState, useEffect } from 'react';

  function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => {
      document.title = `Count: ${count}`;
    }, [count]);
    return (
      <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>Click me</button>
      </div>
    );
  }
  ```

- **Fetch data from the API** – Use `fetch` or `axios` inside `useEffect`:

  ```jsx
  import { useState, useEffect } from 'react';
  import axios from 'axios';

  function LessonList() {
    const [lessons, setLessons] = useState([]);
    useEffect(() => {
      axios.get('http://localhost:3000/api/lessons').then((response) => {
        setLessons(response.data);
      });
    }, []);
    return (
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>{lesson.title}</li>
        ))}
      </ul>
    );
  }
  ```

## General tips

- **Hot reloading** – Vite automatically reloads your browser when files change.  Leave `npm run dev` running during development.
- **Environment variables** – Store sensitive or environment‑specific values in `.env` files and access them via `import.meta.env` in Vite or `process.env` in Node.
- **Linting and formatting** – Consider adding ESLint and Prettier to maintain code quality.

This cheat sheet covers common scenarios.  Refer to official documentation for advanced features and best practices.