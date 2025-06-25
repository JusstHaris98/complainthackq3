import React, { useState, useEffect } from 'react';
import './App.css';

interface Complaint {
  complaint_id: string;
  // Add other fields as necessary
}

const App = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [history, setHistory] = useState<Complaint[]>([]);

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket('ws://localhost:8000/ws/logs');
      socket.onopen = () => {
        console.log('WebSocket connected');
      };
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'thought') {
          setThoughts((prev) => [...prev, data.message]);
        } else if (data.type === 'result') {
          setThoughts([]);
          fetchHistory();
        }
      };
      socket.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connect, 1000);
      };
    };
    connect();
  }, []);

  const fetchHistory = async () => {
    const response = await fetch('/complaint/history');
    const data = await response.json();
    setHistory(data);
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = (e.currentTarget.elements.namedItem('complaint') as HTMLTextAreaElement)?.value;
    if (!text) return;
    setThoughts([]);
    await fetch('/complaint/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    e.currentTarget.reset();
  };

  return (
    <div className="App">
      <header>
        <h1>Complaint Analysis Agent</h1>
        <div className="tabs">
          <button onClick={() => setActiveTab('live')} className={activeTab === 'live' ? 'active' : ''}>
            Live
          </button>
          <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>
            History
          </button>
        </div>
      </header>
      <main>
        {activeTab === 'live' && (
          <div className="live-view">
            <form onSubmit={handleSubmit}>
              <textarea name="complaint" placeholder="Enter complaint text..."></textarea>
              <button type="submit">Analyze</button>
            </form>
            <div className="thought-process">
              <h2>Thinking Process</h2>
              <ul>
                {thoughts.map((thought, i) => (
                  <li key={i}>{thought}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="history-view">
            <h2>Complaint History</h2>
            {history.map((item, i) => (
              <div key={i} className="history-item">
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
