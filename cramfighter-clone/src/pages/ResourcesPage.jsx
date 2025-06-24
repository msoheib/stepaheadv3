import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// Predefined resource types for the dropdown
const RESOURCE_TYPES = ["Book", "Video Series", "QBank", "Lecture Notes", "Article", "Website", "Other"];

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0]); // Default to the first type
  const [editingResource, setEditingResource] = useState(null); // { id, name, type }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('id, name, type')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setResources(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resourceName.trim() || !resourceType.trim()) {
      setError('Resource name and type cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { error: insertError } = await supabase
        .from('resources')
        .insert([{ name: resourceName, type: resourceType, user_id: user.id }]);

      if (insertError) throw insertError;
      fetchResources();
      setResourceName('');
      setResourceType(RESOURCE_TYPES[0]);
    } catch (err) {
      setError(err.message);
      console.error('Error adding resource:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? This might affect existing study blocks linked to it.')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      fetchResources();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting resource:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setResourceName(resource.name);
    setResourceType(resource.type);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!resourceName.trim() || !resourceType.trim() || !editingResource) {
      setError('Resource name and type cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await supabase
        .from('resources')
        .update({ name: resourceName, type: resourceType })
        .eq('id', editingResource.id)
        .eq('user_id', user.id);

      fetchResources();
      setResourceName('');
      setResourceType(RESOURCE_TYPES[0]);
      setEditingResource(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating resource:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingResource(null);
    setResourceName('');
    setResourceType(RESOURCE_TYPES[0]);
    setError('');
  };

  return (
    <div>
      <h1>Manage Resources</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <form onSubmit={editingResource ? handleUpdateResource : handleAddResource} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter resource name"
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
          required
          style={{ marginRight: '10px', marginBottom: '10px' }}
        />
        <select
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
          style={{ marginRight: '10px', marginBottom: '10px' }}
          required
        >
          {RESOURCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (editingResource ? 'Update Resource' : 'Add Resource')}
        </button>
        {editingResource && (
          <button type="button" onClick={cancelEdit} style={{ marginLeft: '10px' }} disabled={isLoading}>
            Cancel Edit
          </button>
        )}
      </form>

      {isLoading && resources.length === 0 && <p>Loading resources...</p>}

      {resources.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {resources.map((resource) => (
            <li key={resource.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{resource.name}</strong> <br />
                <small>Type: {resource.type}</small>
              </div>
              <div>
                <button onClick={() => handleEditResource(resource)} style={{ marginRight: '5px' }} disabled={isLoading || !!editingResource}>Edit</button>
                <button onClick={() => handleDeleteResource(resource.id)} disabled={isLoading || !!editingResource}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && <p>No resources found. Add some to get started!</p>
      )}
    </div>
  );
}
