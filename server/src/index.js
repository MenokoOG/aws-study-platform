const express = require('express');
const cors = require('cors');

// Load data from JSON files.  In production you might use a database.
const lessons = require('./data/lessons.json');
const quizzes = require('./data/quizzes.json');
const projects = require('./data/projects.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (for local development)
app.use(cors());
app.use(express.json());

/**
 * GET /api/lessons
 * Returns a list of lessons with summary information.
 */
app.get('/api/lessons', (req, res) => {
  // Omit long descriptions to keep summaries lightweight
  const summaries = lessons.map(({ id, title, domain, objectives }) => ({ id, title, domain, objectives }));
  res.json(summaries);
});

/**
 * GET /api/lessons/:id
 * Returns full lesson details.
 */
app.get('/api/lessons/:id', (req, res) => {
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json(lesson);
});

/**
 * GET /api/quizzes/:lessonId
 * Returns the quiz for the specified lesson.  Answers are not included in the response.
 */
app.get('/api/quizzes/:lessonId', (req, res) => {
  const quiz = quizzes.find((q) => q.lessonId === req.params.lessonId);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  // Omit correct answers before sending to client
  const strippedQuestions = quiz.questions.map(({ id, question, choices }) => ({ id, question, choices }));
  res.json({ lessonId: quiz.lessonId, questions: strippedQuestions });
});

/**
 * POST /api/quizzes/:lessonId
 * Accepts an array of user answers and returns the score and feedback.  In a full implementation,
 * this would update the user’s progress in a database or session.  Here we perform a simple evaluation.
 */
app.post('/api/quizzes/:lessonId', (req, res) => {
  const quiz = quizzes.find((q) => q.lessonId === req.params.lessonId);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  const userAnswers = req.body.answers;
  if (!Array.isArray(userAnswers) || userAnswers.length !== quiz.questions.length) {
    return res.status(400).json({ error: 'Invalid answers array' });
  }
  let score = 0;
  const feedback = [];
  quiz.questions.forEach((q, idx) => {
    const isCorrect = JSON.stringify(userAnswers[idx].sort()) === JSON.stringify(q.answer.sort());
    if (isCorrect) score++;
    feedback.push({
      questionId: q.id,
      correct: isCorrect,
      explanation: q.explanation
    });
  });
  res.json({ score, total: quiz.questions.length, feedback });
});

/**
 * GET /api/projects/:lessonId
 * Returns the hands‑on project instructions for a lesson.
 */
app.get('/api/projects/:lessonId', (req, res) => {
  const project = projects.find((p) => p.lessonId === req.params.lessonId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});