import React, { useState } from 'react';
import {CameraEmotion} from './components/CameraEmotion';
import { analyzeTextMood } from './services/openaiService';

export default function App() {
  const [text, setText] = useState('');
  const [textMood, setTextMood] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [mockMode, setMockMode] = useState(true); // default true to avoid accidental key leaks

  async function handleAnalyzeText() {
    setTextMood('Analyzing...');
    try {
      const res = await analyzeTextMood(text, { mock: mockMode });
      setTextMood(res.mood);
      setSuggestion(res.suggestion);
    } catch (err) {
      console.error(err);
      setTextMood('Error');
    }
  }

  return (
    <div className="app" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <header>
        <h1>MoodMate (Frontend)</h1>
        <p>Realtime face emotion detection + text mood analysis (demo)</p>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <section className="card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h2>Camera (Facial Emotion)</h2>
          <CameraEmotion onSuggestion={(s) => setSuggestion(s)} />
        </section>

        <section className="card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h2>Text Mood Detection</h2>
          <textarea
            rows={6}
            placeholder="Type how you feel..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          <button onClick={handleAnalyzeText} style={{ marginTop: '10px' }}>
            Analyze Mood
          </button>

          {textMood && (
            <div style={{ marginTop: '10px' }}>
              <p><b>Mood:</b> {textMood}</p>
              {suggestion && <p><b>Suggestion:</b> {suggestion}</p>}
            </div>
          )}
        </section>
      </main>

      <footer style={{ marginTop: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={mockMode}
            onChange={() => setMockMode(!mockMode)}
          /> Use Mock Mode (No API key)
        </label>
      </footer>
    </div>
  );
}
