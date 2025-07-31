import { useEffect, useState } from "react";

export default function Settings({ apiCall }) {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    loadAllQuestions();
  }, [apiCall]);

  const loadAllQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall("http://localhost:5000/api/all-questions", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setOriginalQuestions(data.questions || []); 
    } catch (err) {
      console.error("Question fetch error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (questionId, newLevel) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, level: parseInt(newLevel) } : q
    ));
  };

  
  const hasChanges = () => {
    return questions.some(question => {
      const original = originalQuestions.find(orig => orig.id === question.id);
      return original && original.level !== question.level;
    });
  };

  
  const getChangedQuestions = () => {
    return questions.filter(question => {
      const original = originalQuestions.find(orig => orig.id === question.id);
      return original && original.level !== question.level;
    });
  };

  const saveAllChanges = async () => {
    const changedQuestions = getChangedQuestions();
    
    if (changedQuestions.length === 0) {
      setSaveMessage("No changes to save");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      
      const savePromises = changedQuestions.map(question =>
        apiCall("http://localhost:5000/api/update-question-level", {
          method: "PUT",
          body: JSON.stringify({ question_id: question.id, level: question.level }),
        })
      );

      const responses = await Promise.all(savePromises);
      
      
      const failedRequests = responses.filter(response => !response.ok);
      
      if (failedRequests.length > 0) {
        throw new Error(`Failed to update ${failedRequests.length} question(s)`);
      }

     
      setOriginalQuestions([...questions]);
      setSaveMessage(`Successfully updated ${changedQuestions.length} question(s)!`);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Save error:", err.message);
      setSaveMessage(`Error: ${err.message}`);
      setTimeout(() => setSaveMessage(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setQuestions([...originalQuestions]);
    setSaveMessage("Changes reset");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const getLevelBadgeClass = (level) => {
    switch(level) {
      case 1: return "level-badge level-1";
      case 2: return "level-badge level-2";
      case 3: return "level-badge level-3";
      default: return "level-badge";
    }
  };

  const getQuestionsByLevel = (level) => {
    return questions.filter(q => q.level === level);
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          <h3>Error: {error}</h3>
          <button onClick={loadAllQuestions} className="button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="header">
        <img src="/logo/thunder-game.jpg" alt="Quiz Logo" className="logo" />
        <h2>Question Settings</h2>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
          {saveMessage}
        </div>
      )}

      <div className="settings-info">
        <p>Manage question levels for your quiz. Questions are organized into 3 levels of difficulty.</p>
        <div className="level-info-grid">
          <div className="level-info-item">
            <span className="level-badge level-1">Level 1</span>
            <span>Beginner ({getQuestionsByLevel(1).length} questions)</span>
          </div>
          <div className="level-info-item">
            <span className="level-badge level-2">Level 2</span>
            <span>Intermediate ({getQuestionsByLevel(2).length} questions)</span>
          </div>
          <div className="level-info-item">
            <span className="level-badge level-3">Level 3</span>
            <span>Advanced ({getQuestionsByLevel(3).length} questions)</span>
          </div>
        </div>
      </div>

      
      {hasChanges() && (
        <div className="settings-actions" style={{ marginBottom: '20px', justifyContent: 'center' }}>
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '8px', 
            padding: '15px', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
              You have {getChangedQuestions().length} unsaved change(s)
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={saveAllChanges}
                disabled={saving}
                className="save-btn"
                style={{ 
                  background: '#28a745', 
                  color: 'white',
                  padding: '8px 20px',
                  fontSize: '14px'
                }}
              >
                {saving ? "Saving..." : `Save All Changes (${getChangedQuestions().length})`}
              </button>
              <button
                onClick={resetChanges}
                disabled={saving}
                className="button"
                style={{ 
                  background: '#6c757d', 
                  color: 'white',
                  padding: '8px 20px',
                  fontSize: '14px'
                }}
              >
                Reset Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="no-questions">
          <p>No questions found in the database.</p>
          <button onClick={loadAllQuestions} className="button">
            Refresh
          </button>
        </div>
      ) : (
        <div className="questions-list">
          {[1, 2, 3].map(level => (
            <div key={level} className="level-section">
              <h3 className="level-header">
                <span className={getLevelBadgeClass(level)}>Level {level}</span>
                <span className="question-count">({getQuestionsByLevel(level).length} questions)</span>
              </h3>
              
              <div className="questions-grid">
                {questions
                  .filter(q => q.level === level)
                  .map(question => {
                    const original = originalQuestions.find(orig => orig.id === question.id);
                    const isChanged = original && original.level !== question.level;
                    
                    return (
                      <div key={question.id} className="question-card" style={{
                        border: isChanged ? '2px solid #ffc107' : '1.5px solid #b3c6e0',
                        background: isChanged ? '#fff8e1' : '#fff'
                      }}>
                        {isChanged && (
                          <div style={{
                            background: '#ffc107',
                            color: '#212529',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            textAlign: 'center'
                          }}>
                            Modified (Level {original.level} → {question.level})
                          </div>
                        )}
                        <div className="question-text">
                          <strong>Q{question.id}:</strong> {question.question}
                        </div>
                        <div className="question-options">
                          <div className="options-grid">
                            {question.options?.map((option, idx) => (
                              <div 
                                key={idx} 
                                className={`option-preview ${option === question.answer ? 'correct-option' : ''}`}
                              >
                                {String.fromCharCode(65 + idx)}: {option}
                                {option === question.answer && <span className="correct-indicator"></span>}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="question-controls">
                          <label>
                            Level:
                            <select
                              value={question.level}
                              onChange={(e) => handleLevelChange(question.id, e.target.value)}
                              className="level-select"
                            >
                              <option value={1}>Level 1 (Beginner)</option>
                              <option value={2}>Level 2 (Intermediate)</option>
                              <option value={3}>Level 3 (Advanced)</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {getQuestionsByLevel(level).length === 0 && (
                <div className="no-questions-level">
                  <p>No questions assigned to Level {level} yet.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="settings-actions">
        <button onClick={loadAllQuestions} className="button">
          Refresh Questions
        </button>
        {hasChanges() && (
          <>
            <button
              onClick={saveAllChanges}
              disabled={saving}
              className="save-btn"
              style={{ 
                background: '#28a745', 
                color: 'white',
                marginLeft: '10px'
              }}
            >
              {saving ? "Saving..." : `Save All Changes (${getChangedQuestions().length})`}
            </button>
            <button
              onClick={resetChanges}
              disabled={saving}
              className="button"
              style={{ 
                background: '#6c757d', 
                color: 'white',
                marginLeft: '10px'
              }}
            >
              Reset Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}