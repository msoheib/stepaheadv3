import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const daysOfWeek = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
];

export default function PreferencesPage() {
  const { user } = useAuth();
  const [preferredDays, setPreferredDays] = useState([]); // Array of day numbers (0-6)
  const [defaultStartTime, setDefaultStartTime] = useState('09:00');
  const [defaultEndTime, setDefaultEndTime] = useState('17:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const { data, error: fetchError } = await supabase
        .from('user_scheduling_preferences')
        .select('preferred_days, default_start_time, default_end_time')
        .eq('user_id', user.id)
        .maybeSingle(); // Fetches a single row or null, not an array

      if (fetchError) throw fetchError;

      if (data) {
        setPreferredDays(data.preferred_days || []);
        setDefaultStartTime(data.default_start_time || '09:00');
        setDefaultEndTime(data.default_end_time || '17:00');
      }
    } catch (err) {
      setError(`Failed to load preferences: ${err.message}`);
      console.error('Error fetching preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferredDayChange = (dayId) => {
    setPreferredDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const preferencesData = {
      user_id: user.id, // Also primary key
      preferred_days: preferredDays.sort((a,b) => a - b), // Store sorted
      default_start_time: defaultStartTime,
      default_end_time: defaultEndTime,
      updated_at: new Date().toISOString(), // Keep track of update time
    };

    try {
      // Upsert: inserts if user_id doesn't exist, updates if it does.
      // 'user_id' should be the primary key or have a unique constraint for upsert to work as expected on it.
      const { error: upsertError } = await supabase
        .from('user_scheduling_preferences')
        .upsert(preferencesData, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;
      setSuccessMessage('Preferences saved successfully!');
    } catch (err) {
      setError(`Failed to save preferences: ${err.message}`);
      console.error('Error saving preferences:', err);
    } finally {
      setIsLoading(false);
      // Optionally refetch or assume UI is in sync
      // fetchPreferences();
    }
  };

  if (!user) {
    return <p>Please log in to manage your preferences.</p>;
  }

  return (
    <div>
      <h1>Scheduling Preferences</h1>
      {isLoading && <p>Loading preferences...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <fieldset style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <legend>Preferred Study Days</legend>
          {daysOfWeek.map(day => (
            <div key={day.id}>
              <input
                type="checkbox"
                id={`day-${day.id}`}
                checked={preferredDays.includes(day.id)}
                onChange={() => handlePreferredDayChange(day.id)}
                disabled={isLoading}
              />
              <label htmlFor={`day-${day.id}`} style={{ marginLeft: '5px' }}>{day.name}</label>
            </div>
          ))}
        </fieldset>

        <fieldset style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <legend>Default Study Hours</legend>
          <div>
            <label htmlFor="defaultStartTime" style={{ marginRight: '10px' }}>Default Start Time:</label>
            <input
              type="time"
              id="defaultStartTime"
              value={defaultStartTime}
              onChange={(e) => setDefaultStartTime(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="defaultEndTime" style={{ marginRight: '10px' }}>Default End Time:</label>
            <input
              type="time"
              id="defaultEndTime"
              value={defaultEndTime}
              onChange={(e) => setDefaultEndTime(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </fieldset>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
