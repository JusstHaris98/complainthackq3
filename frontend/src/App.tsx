import React, { useState, useEffect } from 'react';
import './App.css';

interface Complaint {
  complaint_id: string;
  status?: string;
  customer_id?: string;
  summary?: string;
  extracted_details?: any;
  categorization?: any;  // American spelling
  categorisation?: any;  // British spelling
  regulatory_flag?: any;
  proposed_action_plan?: any;
  confidence_score?: number;
  athena_query_parameters?: any;
  investigation_checklist?: any;
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
          if (data.data) {
            setCurrentResult(data.data);
          }
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
    
    // Prevent double submission
    if (isLoading) {
      console.log('Already processing, ignoring duplicate submission');
      return;
    }
    
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
                  {isLoading ? 'Analysing...' : 'Analyse Complaint'}
                </button>
              </form>
            </div>
            <div className="thought-process">
              <h2>🧠 AI Analysis Process</h2>
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  Error: {error}
                </div>
              )}
              {isLoading && thoughts.length === 0 && (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>🤖 AI is analysing your complaint...</p>
                </div>
              )}
              {!isLoading && !error && thoughts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">💭</span>
                  <p>Submit a complaint to see the AI's thinking process...</p>
                </div>
              ) : (
                <ul>
                  {thoughts.map((thought, i) => (
                    <li key={i} style={{animationDelay: `${i * 0.1}s`}}>
                      <span className="thought-icon">💭</span>
                      {thought}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {currentResult && (
              <div className="analysis-result">
                <h2>📊 Analysis Result</h2>
                
                {/* Debug: Show what fields are actually present */}
                <details className="debug-response" style={{marginBottom: '2rem'}}>
                  <summary style={{color: '#ffc107', cursor: 'pointer', padding: '1rem', background: 'rgba(255,193,7,0.1)', borderRadius: '8px'}}>
                    🐛 Debug: Show Raw Response Data
                  </summary>
                  <pre style={{background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', overflow: 'auto', maxHeight: '300px'}}>
                    {JSON.stringify(currentResult, null, 2)}
                  </pre>
                </details>

                {currentResult.summary && (
                  <div className="result-summary">
                    <h3>📝 Summary</h3>
                    <p>{currentResult.summary}</p>
                  </div>
                )}
                
                {/* Show if summary is missing */}
                {!currentResult.summary && (
                  <div className="missing-field" style={{background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '8px', padding: '1rem', margin: '1rem 0', color: '#ff6b7a'}}>
                    ⚠️ Summary field is missing from AI response
                  </div>
                )}
                
                {(currentResult.categorization || currentResult.categorisation) && (
                  <div className="result-section">
                    <h3>🏷️ Categorisation</h3>
                    <div className="category-tags">
                      <span className="category-tag primary">
                        <strong>Primary:</strong> {(currentResult.categorisation || currentResult.categorization)?.primary_category}
                      </span>
                      <span className="category-tag secondary">
                        <strong>Secondary:</strong> {(currentResult.categorisation || currentResult.categorization)?.secondary_category}
                      </span>
                      <span className="category-tag fca">
                        <strong>FCA Type:</strong> {(currentResult.categorisation || currentResult.categorization)?.fca_complaint_type}
                      </span>
                    </div>
                  </div>
                )}
                
                {currentResult.proposed_action_plan?.steps && (
                  <div className="result-section">
                    <h3>🚀 Proposed Action Plan</h3>
                    <div className="action-steps">
                      {currentResult.proposed_action_plan.steps.map((step: any, i: number) => (
                        <div key={i} className="action-step">
                          <div className="step-header">
                            <span className="step-number">{step.step_number}</span>
                            <h4>{step.responsible_party}</h4>
                          </div>
                          <p>{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentResult.extracted_details && (
                  <div className="result-section">
                    <h3>🔍 Extracted Details</h3>
                    <div className="details-grid">
                      {currentResult.extracted_details.issue_type && (
                        <div className="detail-item">
                          <span className="detail-label">Issue Type:</span>
                          <span className="detail-value">{currentResult.extracted_details.issue_type}</span>
                        </div>
                      )}
                      {currentResult.extracted_details.product_affected && (
                        <div className="detail-item">
                          <span className="detail-label">Product Affected:</span>
                          <span className="detail-value">{currentResult.extracted_details.product_affected}</span>
                        </div>
                      )}
                      {currentResult.extracted_details.amount_disputed && (
                        <div className="detail-item">
                          <span className="detail-label">Amount Disputed:</span>
                          <span className="detail-value">{currentResult.extracted_details.amount_disputed}</span>
                        </div>
                      )}
                      {currentResult.extracted_details.incident_date && (
                        <div className="detail-item">
                          <span className="detail-label">Incident Date:</span>
                          <span className="detail-value">{currentResult.extracted_details.incident_date}</span>
                        </div>
                      )}
                      {currentResult.extracted_details.customer_desired_outcome && (
                        <div className="detail-item">
                          <span className="detail-label">Desired Outcome:</span>
                          <span className="detail-value">
                            {Array.isArray(currentResult.extracted_details.customer_desired_outcome) 
                              ? currentResult.extracted_details.customer_desired_outcome.join(', ')
                              : currentResult.extracted_details.customer_desired_outcome}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentResult.regulatory_flag && (
                  <div className="result-section">
                    <h3>⚖️ Regulatory Analysis</h3>
                    {currentResult.regulatory_flag.potential_breaches && (
                      <div className="regulatory-subsection">
                        <h4>Potential Breaches:</h4>
                        <ul className="regulatory-list">
                          {currentResult.regulatory_flag.potential_breaches.map((breach: string, i: number) => (
                            <li key={i}>{breach}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentResult.regulatory_flag.relevant_principles && (
                      <div className="regulatory-subsection">
                        <h4>Relevant Principles:</h4>
                        <ul className="regulatory-list">
                          {currentResult.regulatory_flag.relevant_principles.map((principle: string, i: number) => (
                            <li key={i}>{principle}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Athena Outputs Section */}
                <div className="result-section athena-section">
                  <h3>🧠 Athena Knowledge System Outputs</h3>
                  
                  <div className="athena-subsection">
                    <h4>Knowledge Base Integration:</h4>
                    <p className="athena-info">
                      This analysis incorporates UK banking regulation guidelines, FCA DISP rules, 
                      and Payment Services Regulations retrieved from the Athena knowledge system 
                      to ensure regulatory compliance and proper case treatment.
                    </p>
                  </div>
                  
                  {currentResult.athena_query_parameters && (
                    <div className="athena-subsection">
                      <h4>Query Parameters:</h4>
                      <div className="athena-query">
                        <div className="detail-item">
                          <span className="detail-label">Question:</span>
                          <span className="detail-value">{currentResult.athena_query_parameters.question}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Product Type:</span>
                          <span className="detail-value">{currentResult.athena_query_parameters.product_type}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentResult.proposed_action_plan?.steps && (
                    <div className="athena-subsection">
                      <h4>Athena Treatment Guidelines Applied:</h4>
                      <div className="athena-treatments">
                        {currentResult.proposed_action_plan.steps.map((step: any, i: number) => (
                          step.details_from_athena && (
                            <div key={i} className="athena-treatment">
                              <span className="treatment-step">Step {step.step_number}:</span>
                              <span className="treatment-details">{step.details_from_athena}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {currentResult.investigation_checklist && (
                  <div className="result-section investigation-section">
                    <h3>🔍 Investigation Checklist</h3>
                    <p className="investigation-intro">
                      Based on the complaint analysis, here are the specific investigation points to examine:
                    </p>
                    
                    {/* Debug: Show raw investigation checklist if structure is unexpected */}
                    {typeof currentResult.investigation_checklist === 'string' && (
                      <div className="investigation-fallback">
                        <p>{currentResult.investigation_checklist}</p>
                      </div>
                    )}
                    
                    {/* Debug: Show if investigation_checklist exists but has no expected properties */}
                    {typeof currentResult.investigation_checklist === 'object' && 
                     !currentResult.investigation_checklist.system_checks &&
                     !currentResult.investigation_checklist.records_to_examine &&
                     !currentResult.investigation_checklist.data_points_to_verify &&
                     !currentResult.investigation_checklist.customer_information_to_confirm &&
                     !currentResult.investigation_checklist.timeline_analysis &&
                     !currentResult.investigation_checklist.regulatory_compliance_checks && (
                      <div className="investigation-fallback">
                        <h4>Raw Investigation Data:</h4>
                        <pre>{JSON.stringify(currentResult.investigation_checklist, null, 2)}</pre>
                      </div>
                    )}
                    
                    {currentResult.investigation_checklist.system_checks && (
                      <div className="investigation-category">
                        <h4>🖥️ System Checks Required:</h4>
                        <ul className="investigation-list">
                          {currentResult.investigation_checklist.system_checks.map((check: string, i: number) => (
                            <li key={i} className="investigation-item">
                              <span className="check-icon">🔧</span>
                              {check}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentResult.investigation_checklist.records_to_examine && (
                      <div className="investigation-category">
                        <h4>📁 Records to Examine:</h4>
                        <ul className="investigation-list">
                          {currentResult.investigation_checklist.records_to_examine.map((record: string, i: number) => (
                            <li key={i} className="investigation-item">
                              <span className="check-icon">📋</span>
                              {record}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentResult.investigation_checklist.data_points_to_verify && (
                      <div className="investigation-category">
                        <h4>📊 Data Points to Verify:</h4>
                        <ul className="investigation-list">
                          {currentResult.investigation_checklist.data_points_to_verify.map((point: string, i: number) => (
                            <li key={i} className="investigation-item">
                              <span className="check-icon">📈</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentResult.investigation_checklist.customer_information_to_confirm && (
                      <div className="investigation-category">
                        <h4>👤 Customer Information to Confirm:</h4>
                        <ul className="investigation-list">
                          {currentResult.investigation_checklist.customer_information_to_confirm.map((info: string, i: number) => (
                            <li key={i} className="investigation-item">
                              <span className="check-icon">✅</span>
                              {info}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentResult.investigation_checklist.timeline_analysis && (
                      <div className="investigation-category">
                        <h4>⏰ Timeline Analysis:</h4>
                        <ul className="investigation-list">
                          {currentResult.investigation_checklist.timeline_analysis.map((timeline: string, i: number) => (
                            <li key={i} className="investigation-item">
                              <span className="check-icon">🕐</span>
                              {timeline}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentResult.investigation_checklist.regulatory_compliance_checks && (
                      <div className="investigation-category">
                        <h4>⚖️ Regulatory Compliance Checks:</h4>
                        <ul className="investigation-list">
                          {currentResult.investigation_checklist.regulatory_compliance_checks.map((compliance: string, i: number) => (
                            <li key={i} className="investigation-item">
                              <span className="check-icon">⚖️</span>
                              {compliance}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {currentResult.confidence_score && (
                  <div className="confidence">
                    <div className="confidence-content">
                      <span className="confidence-label">🎯 Confidence Score</span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{width: `${currentResult.confidence_score * 100}%`}}
                        ></div>
                      </div>
                      <span className="score">{(currentResult.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/* Full JSON Details */}
                <details className="full-analysis-details">
                  <summary>View Complete Analysis JSON</summary>
                  <pre className="analysis-json">{JSON.stringify(currentResult, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        )}
        {activeTab === 'history' && (
          <div className="history-view">
            <h2>📚 Complaint History</h2>
            {history.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <p>No complaints analysed yet. Submit a complaint to see it appear here.</p>
              </div>
            ) : (
              history.map((item, i) => (
                <div key={i} className="history-item">
                  <div className="history-header">
                    <h3>Complaint #{item.complaint_id}</h3>
                    <span className="history-status">{item.status}</span>
                  </div>
                  
                  {item.summary && (
                    <div className="history-summary">
                      <h4>Summary</h4>
                      <p>{item.summary}</p>
                    </div>
                  )}
                  
                  <details className="history-details">
                    <summary>View Full Analysis</summary>
                    <pre className="history-json">{JSON.stringify(item, null, 2)}</pre>
                  </details>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
