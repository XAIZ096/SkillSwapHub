import { useEffect, useState } from 'react';
import AuthPanel from './components/AuthPanel.jsx';
import Dashboard from './components/Dashboard.jsx';
import NavBar from './components/NavBar.jsx';
import ProfilePanel from './components/ProfilePanel.jsx';
import RequestCenter from './components/RequestCenter.jsx';
import SessionPlanner from './components/SessionPlanner.jsx';
import SkillList from './components/SkillList.jsx';
import { apiRequest } from './api/apiClient.js';

const pages = {
  dashboard: 'Dashboard',
  skills: 'Skills',
  requests: 'Requests',
  sessions: 'Sessions',
  profile: 'Profile',
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  async function loadCurrentUser() {
    try {
      const data = await apiRequest('/api/auth/me');
      setUser(data.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function handleLogout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setActivePage('dashboard');
      setMessage('Logged out successfully.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function renderActivePage() {
    if (activePage === 'dashboard') {
      return <Dashboard user={user} />;
    }

    if (activePage === 'skills') {
      return <SkillList user={user} />;
    }

    if (activePage === 'requests') {
      return <RequestCenter user={user} />;
    }

    if (activePage === 'sessions') {
      return <SessionPlanner user={user} />;
    }

    return <ProfilePanel user={user} onUserUpdated={setUser} />;
  }

  if (loadingUser) {
    return <main className="app-shell">Loading SkillSwap Hub...</main>;
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Peer-to-peer college learning</p>
          <h1>SkillSwap Hub</h1>
          <p>
            Exchange React, MongoDB, career, language, and project skills with
            other students.
          </p>
        </div>
        <AuthPanel user={user} onAuthChange={setUser} onLogout={handleLogout} />
      </header>

      {message && (
        <section className="status-message" aria-live="polite">
          {message}
          <button type="button" onClick={() => setMessage('')}>
            Dismiss
          </button>
        </section>
      )}

      <NavBar
        pages={pages}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      {renderActivePage()}
    </main>
  );
}

export default App;
