import './styles.css';
import React, { useState, useEffect, useRef } from 'react';

function Clock({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function Play({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}

function Pause({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  );
}

function CheckCircle({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function Award({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  );
}

function Plus({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState('');
  const [newTaskCount, setNewTaskCount] = useState('1');
  const [onBreak, setOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [breakDuration, setBreakDuration] = useState(0);
  const [breakRunning, setBreakRunning] = useState(false);
  const intervalRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('mindful-tasks');
    const savedTimeValue = localStorage.getItem('mindful-savedTime');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Error loading tasks:', e);
      }
    }
    
    if (savedTimeValue) {
      setSavedTime(parseInt(savedTimeValue, 10));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mindful-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save savedTime to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mindful-savedTime', savedTime.toString());
  }, [savedTime]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (breakRunning && breakTimeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            setBreakRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, breakRunning, breakTimeRemaining]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTask = () => {
    if (newTaskName.trim() && newTaskMinutes && parseInt(newTaskMinutes) > 0) {
      const count = parseInt(newTaskCount) || 1;
      const newTasks = [];
      
      for (let i = 0; i < count; i++) {
        newTasks.push({
          id: Date.now() + i,
          name: newTaskName.trim(),
          estimatedMinutes: parseInt(newTaskMinutes),
          estimatedSeconds: parseInt(newTaskMinutes) * 60
        });
      }
      
      setTasks([...tasks, ...newTasks]);
      setNewTaskName('');
      setNewTaskMinutes('');
      setNewTaskCount('1');
    }
  };

  const startTask = (task) => {
    setCurrentTask(task);
    setTimeRemaining(task.estimatedSeconds);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const completeTask = () => {
    if (currentTask && timeRemaining > 0) {
      const timeSaved = timeRemaining;
      setSavedTime(prev => prev + timeSaved);
      setTasks(tasks.filter(t => t.id !== currentTask.id));
    }
    setCurrentTask(null);
    setTimeRemaining(0);
    setIsRunning(false);
  };

  const cancelTask = () => {
    setCurrentTask(null);
    setTimeRemaining(0);
    setIsRunning(false);
  };

  const useBreak = (minutes) => {
    const seconds = minutes * 60;
    if (savedTime >= seconds) {
      setSavedTime(prev => prev - seconds);
      setOnBreak(true);
      setBreakTimeRemaining(seconds);
      setBreakDuration(minutes);
      setBreakRunning(true);
    }
  };

  const toggleBreak = () => {
    setBreakRunning(!breakRunning);
  };

  const endBreakEarly = () => {
    if (breakTimeRemaining > 0) {
      setSavedTime(prev => prev + breakTimeRemaining);
    }
    setOnBreak(false);
    setBreakTimeRemaining(0);
    setBreakRunning(false);
    setBreakDuration(0);
  };

  const cancelBreak = () => {
    setOnBreak(false);
    setBreakTimeRemaining(0);
    setBreakRunning(false);
    setBreakDuration(0);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all tasks and saved time? This cannot be undone.')) {
      setTasks([]);
      setSavedTime(0);
      setCurrentTask(null);
      setTimeRemaining(0);
      setIsRunning(false);
      setOnBreak(false);
      setBreakTimeRemaining(0);
      setBreakRunning(false);
      localStorage.removeItem('mindful-tasks');
      localStorage.removeItem('mindful-savedTime');
    }
  };

  return (
    <div className="app-container">
      <div className="max-width-container">
        <div className="header">
          <h1>BEAR NECESSITITES</h1>
        </div>

        {/* Break Timer - Full Width when on break */}
        {onBreak && (
          <div className="card timer-card">
            <h3 className="task-title">BREAK TIME!</h3>
            
            <div className="timer-display">
              <div className="timer-time">{formatTime(breakTimeRemaining)}</div>
              <p className="timer-subtitle">OF A {breakDuration} MINUTE BREAK</p>
            </div>

            <div className="timer-controls">
              <button onClick={toggleBreak} className="btn btn-primary">
                {breakRunning ? <Pause size={20} /> : <Play size={20} />}
                {breakRunning ? 'Pause' : 'Resume'}
              </button>
              <button onClick={endBreakEarly} className="btn btn-success">
                <CheckCircle size={20} />
                END BREAK EARLY
              </button>
              <button onClick={cancelBreak} className="btn btn-secondary">
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Current Timer - Full Width when active */}
        {currentTask && !onBreak && (
          <div className="card timer-card">
            <h3 className="task-title">{currentTask.name}</h3>
            
            <div className="timer-display">
              <div className="timer-time">{formatTime(timeRemaining)}</div>
              <p className="timer-subtitle">OF {currentTask.estimatedMinutes} MINUTES ESTIMATED</p>
            </div>

            <div className="timer-controls">
              <button onClick={toggleTimer} className="btn btn-primary">
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button onClick={completeTask} className="btn btn-success">
                <CheckCircle size={20} />
                COMPLETE
              </button>
              <button onClick={cancelTask} className="btn btn-secondary">
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Two Column Layout - Only show when no active timer or break */}
        {!currentTask && !onBreak && (
          <div className="two-column-layout">
            {/* Saved Time Bank */}
            <div className="card">
              <h2 className="section-header">TIME SAVED</h2>
              <div className="saved-time-content">
                <Award size={32} className="saved-time-icon" />
                <p className="saved-time-display">{formatTime(savedTime)}</p>
              </div>
              
              <div className="break-buttons">
                <button
                  onClick={() => useBreak(5)}
                  disabled={savedTime < 300}
                  className="btn-break btn-break-5"
                >
                  TAKE 5 MIN BREAK
                </button>
                <button
                  onClick={() => useBreak(15)}
                  disabled={savedTime < 900}
                  className="btn-break btn-break-15"
                >
                  TAKE 5 MIN BREAK
                </button>
                <button
                  onClick={() => useBreak(30)}
                  disabled={savedTime < 1800}
                  className="btn-break btn-break-30"
                >
                  TAKE 5 MIN BREAK
                </button>
              </div>
            </div>

            {/* Add Task Form */}
            <div className="card">
              <h3 className="section-header">ADD A TASK</h3>
              
              <div className="form-content">
                <input
                  type="text"
                  placeholder="TASK NAME..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  className="input"
                />
                <div className="input-row">
                  <input
                    type="number"
                    placeholder="MINUTES"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    className="input"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Count"
                    value={newTaskCount}
                    onChange={(e) => setNewTaskCount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    className="input"
                    min="1"
                  />
                  <button onClick={addTask} className="btn btn-primary">
                    <Plus size={20} />
                    ADD
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task List - Full Width Below */}
        {tasks.length > 0 && !currentTask && !onBreak && (
          <div className="card">
            <h3 className="section-header">YOUR TASKS</h3>
            <div className="task-list">
              {tasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <p className="task-name">{task.name}</p>
                    <p className="task-duration">{task.estimatedMinutes} MINUTES</p>
                  </div>
                  <button onClick={() => startTask(task)} className="btn btn-primary">
                    <Clock size={18} />
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <button 
            onClick={clearAllData} 
            style={{ 
              marginTop: '0.5rem', 
              padding: '0.25rem 0.5rem', 
              fontSize: '0.8rem',
              background: '#014421',
              color: '#BCB88A',
              border: '2px solid #013220',
              cursor: 'pointer',
              fontFamily: 'VT323, monospace'
            }}
          >
            CLEAR ALL DATA
          </button>
      </div>
    </div>
  );
}