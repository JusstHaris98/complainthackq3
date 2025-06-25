import React, { useState, useEffect } from 'react';
import './App.css';

interface Complaint {
  complaint_id: string;
  status?: string;
  customer_id?: string;
  summary?: string;
  extracted_details?: any;
  categorization?: any;
  regulatory_flag?: any;
  proposed_action_plan?: any;
  confidence_score?: number;
}

const App = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [history, setHistory] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<Complaint | null>(null);

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
    setError(null);
    setIsLoading(true);
    setCurrentResult(null);
    
    try {
      const response = await fetch('/complaint/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Analysis result:', result);
      setCurrentResult(result);
      
    } catch (err) {
      console.error('Error analyzing complaint:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the complaint');
    } finally {
      setIsLoading(false);
    }
    
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
            <div className="form-container">
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Enter your complaint</label>
                  <textarea 
                    name="complaint" 
                    placeholder="Describe your complaint in detail..."
                  ></textarea>
                </div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Analyzing...' : 'Analyze Complaint'}
                </button>
              </form>
            </div>
            <div className="thought-process">
              <h2>AI Analysis Process</h2>
              {error && (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  borderRadius: '6px', 
                  marginBottom: '1rem' 
                }}>
                  Error: {error}
                </div>
              )}
              {isLoading && (
                <p style={{ color: '#0066cc', fontStyle: 'italic' }}>
                  🤖 AI is analyzing your complaint...
                </p>
              )}
              {!isLoading && !error && thoughts.length === 0 ? (
                <p style={{ color: '#8a8a8a', fontStyle: 'italic' }}>
                  Submit a complaint to see the AI's thinking process...
                </p>
              ) : (
                <ul>
                  {thoughts.map((thought, i) => (
                    <li key={i}>{thought}</li>
                  ))}
                </ul>
              )}
            </div>
            
            {currentResult && (
              <div className="analysis-result">
                <h2>Analysis Result</h2>
                <div className="result-summary">
                  <h3>Summary</h3>
                  <p>{currentResult.summary}</p>
                </div>
                
                {currentResult.categorization && (
                  <div className="result-section">
                    <h3>Categorization</h3>
                    <p><strong>Primary:</strong> {currentResult.categorization.primary_category}</p>
                    <p><strong>Secondary:</strong> {currentResult.categorization.secondary_category}</p>
                    <p><strong>FCA Type:</strong> {currentResult.categorization.fca_complaint_type}</p>
                  </div>
                )}
                
                {currentResult.proposed_action_plan?.steps && (
                  <div className="result-section">
                    <h3>Proposed Action Plan</h3>
                    <div className="action-steps">
                      {currentResult.proposed_action_plan.steps.map((step: any, i: number) => (
                        <div key={i} className="action-step">
                          <h4>Step {step.step_number}: {step.responsible_party}</h4>
                          <p>{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentResult.confidence_score && (
                  <div className="confidence">
                    <strong>Confidence Score: </strong>
                    <span className="score">{(currentResult.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}
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
