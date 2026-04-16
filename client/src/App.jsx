import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import LessonList from './components/LessonList.jsx';
import LessonDetail from './components/LessonDetail.jsx';
import Quiz from './components/Quiz.jsx';
import Project from './components/Project.jsx';
import CheatSheet from './components/CheatSheet.jsx';

function App() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <header>
        <h1>AWS Solutions Architect Study Platform</h1>
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>Lessons</Link>
          <Link to="/cheatsheet">Cheat Sheets</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LessonList />} />
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/quiz/:lessonId" element={<Quiz />} />
          <Route path="/project/:lessonId" element={<Project />} />
          <Route path="/cheatsheet" element={<CheatSheet />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;