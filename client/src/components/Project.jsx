import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Project() {
  const { lessonId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/projects/${lessonId}`)
      .then((response) => {
        setProject(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load project');
      });
  }, [lessonId]);

  if (error) {
    return <p>{error}</p>;
  }
  if (!project) {
    return <p>Loading project…</p>;
  }

  return (
    <div>
      <h2>{project.title}</h2>
      <p>{project.introduction}</p>
      <h3>Steps</h3>
      <ol>
        {project.steps.map((step, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>{step}</li>
        ))}
      </ol>
      <h3>Expected Outcome</h3>
      <p>{project.expectedOutcome}</p>
    </div>
  );
}

export default Project;