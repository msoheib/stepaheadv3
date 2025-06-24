import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null); // { id, name }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setSubjects(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setError('Subject name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data, error: insertError } = await supabase
        .from('subjects')
        .insert([{ name: subjectName, user_id: user.id }])
        .select();

      if (insertError) throw insertError;
      // setSubjects([...subjects, ...data]); // Optimistic update or refetch
      fetchSubjects(); // Refetch to ensure data consistency
      setSubjectName('');
    } catch (err) {
      setError(err.message);
      console.error('Error adding subject:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject? This might affect existing study blocks linked to it.')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { error: deleteError } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('user_id', user.id); // Ensure user owns the subject

      if (deleteError) throw deleteError;
      // setSubjects(subjects.filter(s => s.id !== subjectId)); // Optimistic update or refetch
      fetchSubjects(); // Refetch
    } catch (err) {
      setError(err.message);
      console.error('Error deleting subject:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name); // Pre-fill input for editing
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim() || !editingSubject) {
      setError('Subject name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data, error: updateError } = await supabase
        .from('subjects')
        .update({ name: subjectName })
        .eq('id', editingSubject.id)
        .eq('user_id', user.id) // Ensure ownership
        .select();

      if (updateError) throw updateError;
      fetchSubjects(); // Refetch
      setSubjectName('');
      setEditingSubject(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating subject:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingSubject(null);
    setSubjectName('');
    setError('');
  }

  return (
    <div>
      <h1>Manage Subjects</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter subject name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          required
          style={{ marginRight: '10px' }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Add Subject')}
        </button>
        {editingSubject && (
          <button type="button" onClick={cancelEdit} style={{ marginLeft: '10px' }} disabled={isLoading}>
            Cancel Edit
          </button>
        )}
      </form>

      {isLoading && subjects.length === 0 && <p>Loading subjects...</p>}

      {subjects.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {subjects.map((subject) => (
            <li key={subject.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{subject.name}</span>
              <div>
                <button onClick={() => handleEditSubject(subject)} style={{ marginRight: '5px' }} disabled={isLoading || !!editingSubject}>Edit</button>
                <button onClick={() => handleDeleteSubject(subject.id)} disabled={isLoading || !!editingSubject}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && <p>No subjects found. Add some to get started!</p>
      )}
    </div>
  );
}
