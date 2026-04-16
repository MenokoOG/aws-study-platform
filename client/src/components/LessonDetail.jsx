import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/lessons/${id}`)
      .then((response) => {
        setLesson(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load lesson');
      });
  }, [id]);

  if (error) {
    return <p>{error}</p>;
  }
  if (!lesson) {
    return <p>Loading lesson…</p>;
  }

  return (
    <div>
      <h2>{lesson.title}</h2>
      <p><strong>Domain:</strong> {lesson.domain}</p>
      <h3>Objectives</h3>
      <ul>
        {lesson.objectives.map((obj, idx) => (
          <li key={idx}>{obj}</li>
        ))}
      </ul>
      <h3>Description</h3>
      <p>{lesson.description}</p>
      {lesson.resources && lesson.resources.length > 0 && (
        <>
          <h3>Resources</h3>
          <ul>
            {lesson.resources.map((res, idx) => (
              <li key={idx}>
                <a href={res.url} target="_blank" rel="noopener noreferrer">
                  {res.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      <h3>Hands‑on Project</h3>
      <p>{lesson.projectSummary}</p>
      <div style={{ marginTop: '1rem' }}>
        <Link to={`/project/${lesson.id}`} style={{ marginRight: '1rem' }}>View Project</Link>
        <Link to={`/quiz/${lesson.id}`}>Take Quiz</Link>
      </div>
    </div>
  );
}

export default LessonDetail;