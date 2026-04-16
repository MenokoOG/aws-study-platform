import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function LessonList() {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/api/lessons')
      .then((response) => {
        setLessons(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load lessons');
      });
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Lessons</h2>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id} style={{ marginBottom: '1rem' }}>
            <h3>
              <Link to={`/lesson/${lesson.id}`}>{lesson.title}</Link>
            </h3>
            <p><strong>Domain:</strong> {lesson.domain}</p>
            {lesson.objectives && (
              <ul>
                {lesson.objectives.slice(0, 2).map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
                {lesson.objectives.length > 2 && <li>…</li>}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LessonList;