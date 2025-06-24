import React from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: '/login' }); // Redirect to login after logout
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle logout error, maybe show a notification
    }
  };

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <div>
          <Link to="/" style={{ marginRight: '10px', fontWeight: 'bold' }}>CramFighter Clone</Link>
          {user && <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>}
        </div>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: '10px' }}>Welcome, {user.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
              <Link to="/signup" style={{ marginRight: '10px' }}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>
      <hr style={{display: 'none'}} /> {/* Visually hidden as nav has borderBottom */}
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}
