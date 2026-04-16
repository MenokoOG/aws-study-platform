import React, { useState } from 'react';
import { cheatData } from './cheatData.js';

function CheatSheet() {
  const categories = Object.keys(cheatData);
  const [selected, setSelected] = useState(categories[0]);

  return (
    <div>
      <h2>Cheat Sheets</h2>
      <div style={{ marginBottom: '1rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: selected === cat ? '#007acc' : '#eee',
              color: selected === cat ? '#fff' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Command</th>
            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Description</th>
            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {cheatData[selected].map((item, idx) => (
            <tr key={idx}>
              <td style={{ verticalAlign: 'top', padding: '0.5rem' }}><code>{item.command}</code></td>
              <td style={{ verticalAlign: 'top', padding: '0.5rem' }}>{item.description}</td>
              <td style={{ verticalAlign: 'top', padding: '0.5rem' }}>{item.notes || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CheatSheet;