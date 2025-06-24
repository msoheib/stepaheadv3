import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import StudyCalendar from '../components/StudyCalendar'; // Import the calendar component

export default function DashboardPage() {
  const { user } = useAuth();

  // Form inputs
  const [taskName, setTaskName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Data for dropdowns
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);

  // Task list (still local for now, DB interaction in next step)
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null); // To store task being edited

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch subjects, resources, and tasks concurrently
      const [subjectsResponse, resourcesResponse, tasksResponse] = await Promise.all([
        supabase.from('subjects').select('id, name').eq('user_id', user.id).order('name'),
        supabase.from('resources').select('id, name, type').eq('user_id', user.id).order('name'),
        supabase.from('study_blocks').select('*').eq('user_id', user.id).order('start_time') // Fetch all columns for tasks
      ]);

      if (subjectsResponse.error) throw subjectsResponse.error;
      const fetchedSubjects = subjectsResponse.data || [];
      setSubjects(fetchedSubjects);

      if (resourcesResponse.error) throw resourcesResponse.error;
      const fetchedResources = resourcesResponse.data || [];
      setResources(fetchedResources);

      if (tasksResponse.error) throw tasksResponse.error;
      const fetchedTasks = tasksResponse.data || [];

      // Map subject/resource names to tasks for display
      const displayTasks = fetchedTasks.map(task => {
        const subject = fetchedSubjects.find(s => s.id === task.subject_id);
        const resource = fetchedResources.find(r => r.id === task.resource_id);
        return {
          ...task,
          subjectName: subject ? subject.name : 'N/A',
          resourceName: resource ? resource.name : 'N/A',
        };
      });
      setTasks(displayTasks);

    } catch (err) {
      setError(`Error fetching initial data: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Renamed fetchSubjectsAndResources to fetchInitialData, which now also fetches tasks.

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName || !startTime || !endTime) {
      alert('Please fill in Task Name, Start Time, and End Time.');
      return;
    }

    // Find the name of the selected subject and resource for display purposes
    // In a real scenario, when saving to DB, we'd use selectedSubjectId and selectedResourceId
    const subjectObj = subjects.find(s => s.id.toString() === selectedSubjectId);
    const resourceObj = resources.find(r => r.id.toString() === selectedResourceId);

    // Prepare data for Supabase
    const taskToInsert = {
      user_id: user.id,
      task_name: taskName,
      subject_id: selectedSubjectId || null,
      resource_id: selectedResourceId || null,
      start_time: startTime,
      end_time: endTime,
      status: 'pending', // Default status
    };

    setIsLoading(true);
    setError('');

    try {
      if (editingTask) { // UPDATE existing task
        const taskToUpdate = {
          // user_id is not updated, and id is used in .eq()
          task_name: taskName,
          subject_id: selectedSubjectId || null,
          resource_id: selectedResourceId || null,
          start_time: startTime,
          end_time: endTime,
          // status is not updated here, handled by handleUpdateTaskStatus
        };
        const { data: updatedTask, error: updateError } = await supabase
          .from('study_blocks')
          .update(taskToUpdate)
          .eq('id', editingTask.id)
          .eq('user_id', user.id) // Ensure user owns the task
          .select()
          .single();

        if (updateError) throw updateError;

        // Update task in local state
        const displayUpdatedTask = {
            ...updatedTask,
            subjectName: subjectObj ? subjectObj.name : 'N/A',
            resourceName: resourceObj ? resourceObj.name : 'N/A',
        };
        setTasks(tasks.map(task => task.id === editingTask.id ? displayUpdatedTask : task));

      } else { // CREATE new task
        const taskToInsert = {
          user_id: user.id,
          task_name: taskName,
          subject_id: selectedSubjectId || null,
          resource_id: selectedResourceId || null,
          start_time: startTime,
          end_time: endTime,
          status: 'pending', // Default status
        };
        const { data: insertedTask, error: insertError } = await supabase
          .from('study_blocks')
          .insert(taskToInsert)
          .select()
          .single();

        if (insertError) throw insertError;

        const displayInsertedTask = {
          ...insertedTask,
          subjectName: subjectObj ? subjectObj.name : 'N/A',
          resourceName: resourceObj ? resourceObj.name : 'N/A',
        };
        setTasks(prevTasks => [...prevTasks, displayInsertedTask].sort((a,b) => new Date(a.start_time) - new Date(b.start_time)));
      }
    } catch (err) {
      setError(`Error saving task: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }

    // Clear form and reset editing state
    setTaskName('');
    setSelectedSubjectId('');
    setSelectedResourceId('');
    setStartTime('');
    setEndTime('');
    setEditingTask(null);
  };

  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    setIsLoading(true);
    try {
      const { data, error: updateError } = await supabase
        .from('study_blocks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));

    } catch (err) {
      setError(`Error updating task status: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('study_blocks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(`Error deleting task: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = (taskToEdit) => {
    setEditingTask(taskToEdit);
    setTaskName(taskToEdit.task_name);
    setSelectedSubjectId(taskToEdit.subject_id || '');
    setSelectedResourceId(taskToEdit.resource_id || '');
    // Format date-time for input field
    const formatDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Adjust for timezone offset to display correctly in datetime-local
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    };
    setStartTime(formatDateTimeLocal(taskToEdit.start_time));
    setEndTime(formatDateTimeLocal(taskToEdit.end_time));
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTaskName('');
    setSelectedSubjectId('');
    setSelectedResourceId('');
    setStartTime('');
    setEndTime('');
    setError('');
  };


  return (
    <div>
      <h1>Dashboard</h1>
      {user && <p>Welcome, {user.email}!</p>}
      {isLoading && <p>Loading data...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}

      <h2>{editingTask ? 'Edit Study Task' : 'Add New Study Task'}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px' }}>
        <div>
          <label htmlFor="taskName">Task Name:</label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            style={{ marginLeft: '5px', marginBottom: '10px', width: 'calc(100% - 100px)' }}
          />
        </div>

        <div>
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            style={{ marginLeft: '5px', marginBottom: '10px', width: 'calc(100% - 100px)' }}
            disabled={isLoading}
          >
            <option value="">Select Subject (Optional)</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="resource">Resource:</label>
          <select
            id="resource"
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            style={{ marginLeft: '5px', marginBottom: '10px', width: 'calc(100% - 100px)' }}
            disabled={isLoading}
          >
            <option value="">Select Resource (Optional)</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
          </select>
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}
        </button>
        {editingTask && (
          <button type="button" onClick={cancelEdit} style={{ marginLeft: '10px' }} disabled={isLoading}>
            Cancel Edit
          </button>
        )}
      </form>

      <h2>Your Study Tasks</h2>
      {isLoading && tasks.length === 0 && <p>Loading tasks...</p>}
      {!isLoading && tasks.length === 0 && <p>No tasks scheduled yet. Add some!</p>}

      {tasks.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => {
            const isMissed = task.status === 'pending' && new Date(task.end_time) < new Date();
            let taskStyle = {
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '10px',
            };
            if (task.status === 'completed') {
              taskStyle.backgroundColor = '#e6ffe6'; // Light green for completed
            } else if (isMissed) {
              taskStyle.backgroundColor = '#ffeeee'; // Light red for missed
              taskStyle.borderColor = '#ffcccc';
            }

            return (
              <li key={task.id} style={taskStyle}>
                <h3>{task.task_name}</h3>
                {task.subject_id && <p>Subject: {task.subjectName || 'Loading...'}</p>}
                {task.resource_id && <p>Resource: {task.resourceName || 'Loading...'}</p>}
                <p>Start: {new Date(task.start_time).toLocaleString()}</p>
                <p>End: {new Date(task.end_time).toLocaleString()}</p>
                <p>Status: <span style={{ fontWeight: 'bold' }}>{isMissed ? 'MISSED' : task.status.toUpperCase()}</span></p>
                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => handleUpdateTaskStatus(task.id, task.status)} style={{ marginRight: '5px' }} disabled={isLoading || !!editingTask}>
                  {task.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                </button>
                <button onClick={() => handleEditTask(task)} style={{ marginRight: '5px' }} disabled={isLoading || !!editingTask}>
                  Edit
                </button>
                <button onClick={() => handleDeleteTask(task.id)} disabled={isLoading || !!editingTask}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Render the StudyCalendar component if there are tasks */}
      {tasks.length > 0 && <StudyCalendar tasks={tasks} />}
    </div>
  );
}
