import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest } from '../api/apiClient.js';
import './Dashboard.css';

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiRequest('/api/stats');
        setStats(data.counts);
      } catch (statsError) {
        setError(statsError.message);
      }
    }

    loadStats();
  }, []);

  return (
    <section className="dashboard grid">
      <article className="card intro-card">
        <h2>
          {user
            ? `Welcome back, ${user.displayName}`
            : 'Welcome to SkillSwap Hub'}
        </h2>
        <p>
          Find students who can help you learn a skill, offer your own
          strengths, send swap requests, and schedule learning sessions.
        </p>
        {!user && (
          <p className="muted">
            Login with demo / demo123 to try the authenticated features.
          </p>
        )}
      </article>

      {error && <p className="card">{error}</p>}

      {stats && (
        <section className="stat-grid" aria-label="Project data summary">
          <article className="card stat-card">
            <strong>{stats.users}</strong>
            <span>Students</span>
          </article>
          <article className="card stat-card">
            <strong>{stats.skills}</strong>
            <span>Skills</span>
          </article>
          <article className="card stat-card">
            <strong>{stats.swapRequests}</strong>
            <span>Requests</span>
          </article>
          <article className="card stat-card">
            <strong>{stats.sessions}</strong>
            <span>Sessions</span>
          </article>
          <article className="card stat-card highlight">
            <strong>{stats.totalRecords}</strong>
            <span>Synthetic records</span>
          </article>
        </section>
      )}

      <section className="card dashboard-steps">
        <h3>How to use this app</h3>
        <ol>
          <li>Create or edit your profile.</li>
          <li>Add skills you can offer or want to learn.</li>
          <li>Browse student skills and send a swap request.</li>
          <li>Schedule a confirmed learning session.</li>
        </ol>
      </section>
    </section>
  );
}

Dashboard.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
  }),
};

export default Dashboard;
