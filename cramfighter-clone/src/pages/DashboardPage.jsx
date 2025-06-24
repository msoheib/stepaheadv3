import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // To show user info

export default function DashboardPage() {
  const { user } = useAuth(); // Get user info, e.g., for display

  // State for the form inputs
  const [taskName, setTaskName] = useState('');
  const [subject, setSubject] = useState('');
  const [resource, setResource] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // State for the list of tasks
  const [tasks, setTasks] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName || !startTime || !endTime) {
      alert('Please fill in at least Task Name, Start Time, and End Time.');
      return;
    }
    const newTask = {
      id: Date.now(), // Simple unique ID for local state
      taskName,
      subject,
      resource,
      startTime,
      endTime,
      status: 'pending', // Default status
    };
    setTasks([...tasks, newTask]);
    // Clear form fields
    setTaskName('');
    setSubject('');
    setResource('');
    setStartTime('');
    setEndTime('');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {user && <p>Welcome, {user.email}!</p>}

      <h2>Add New Study Task</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px' }}>
        <div>
          <label htmlFor="taskName">Task Name:</label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            style={{ marginLeft: '5px', marginBottom: '10px', width: '90%' }}
          />
        </div>
        <div>
          <label htmlFor="subject">Subject (optional):</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ marginLeft: '5px', marginBottom: '10px', width: '90%' }}
          />
        </div>
        <div>
          <label htmlFor="resource">Resource (optional):</label>
          <input
            type="text"
            id="resource"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            style={{ marginLeft: '5px', marginBottom: '10px', width: '90%' }}
          />
        </div>
        <div>
          <label htmlFor="startTime">Start Time:</label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            style={{ marginLeft: '5px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label htmlFor="endTime">End Time:</label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            style={{ marginLeft: '5px', marginBottom: '10px' }}
          />
        </div>
        <button type="submit">Add Task</button>
      </form>

      <h2>Your Study Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks scheduled yet. Add some!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <strong>{task.taskName}</strong>
              {task.subject && <p>Subject: {task.subject}</p>}
              {task.resource && <p>Resource: {task.resource}</p>}
              <p>Start: {new Date(task.startTime).toLocaleString()}</p>
              <p>End: {new Date(task.endTime).toLocaleString()}</p>
              <p>Status: {task.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
