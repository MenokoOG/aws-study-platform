import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Quiz() {
  const { lessonId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/quizzes/${lessonId}`)
      .then((response) => {
        setQuiz(response.data);
        // Initialize answers array with empty arrays for each question
        setAnswers(response.data.questions.map(() => []));
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load quiz');
      });
  }, [lessonId]);

  const handleSelect = (questionIdx, choiceIdx, checked) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const selected = new Set(newAnswers[questionIdx]);
      if (checked) {
        selected.add(choiceIdx);
      } else {
        selected.delete(choiceIdx);
      }
      newAnswers[questionIdx] = Array.from(selected);
      return newAnswers;
    });
  };

  const handleSubmit = () => {
    axios
      .post(`/api/quizzes/${lessonId}`, { answers })
      .then((response) => {
        setResult(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to submit quiz');
      });
  };

  if (error) {
    return <p>{error}</p>;
  }
  if (!quiz) {
    return <p>Loading quiz…</p>;
  }

  return (
    <div>
      <h2>Quiz</h2>
      {quiz.questions.map((q, qIdx) => (
        <div key={q.id} style={{ marginBottom: '1rem' }}>
          <p><strong>{qIdx + 1}. {q.question}</strong></p>
          {q.choices.map((choice, cIdx) => (
            <div key={cIdx}>
              <label>
                <input
                  type="checkbox"
                  checked={answers[qIdx]?.includes(cIdx) || false}
                  onChange={(e) => handleSelect(qIdx, cIdx, e.target.checked)}
                />{' '}
                {choice}
              </label>
            </div>
          ))}
        </div>
      ))}
      {result ? (
        <div>
          <h3>Results</h3>
          <p>You scored {result.score} out of {result.total}</p>
          <ul>
            {result.feedback.map((fb, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                Question {idx + 1}: {fb.correct ? 'Correct' : 'Incorrect'} – {fb.explanation}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={handleSubmit}>Submit Quiz</button>
      )}
    </div>
  );
}

export default Quiz;