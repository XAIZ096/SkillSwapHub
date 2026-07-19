import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest } from '../api/apiClient.js';
import SessionCard from './SessionCard.jsx';
import './SessionPlanner.css';

const blankSession = {
  partnerId: '',
  partnerName: '',
  skillName: '',
  meetingTime: '',
  location: 'Online',
  notes: '',
};

function SessionPlanner({ user }) {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(blankSession);
  const [message, setMessage] = useState('');

  async function loadSessions() {
    if (!user) {
      return;
    }

    try {
      const data = await apiRequest('/api/sessions');
      setSessions(data.sessions);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadSessions();
  }, [user]);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function createSession(event) {
    event.preventDefault();

    try {
      await apiRequest('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(blankSession);
      setMessage('Session created.');
      await loadSessions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateSessionStatus(session, status) {
    try {
      await apiRequest(`/api/sessions/${session._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setMessage(`Session ${status}.`);
      await loadSessions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteSession(sessionId) {
    try {
      await apiRequest(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      setMessage('Session deleted.');
      await loadSessions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!user) {
    return (
      <section className="card">
        Please login to manage learning sessions.
      </section>
    );
  }

  return (
    <section className="grid two-columns session-page">
      <form className="card session-form" onSubmit={createSession}>
        <h2>Learning Session Management</h2>
        <p className="muted">
          Create, read, update, cancel, and delete scheduled sessions.
        </p>
        <label>
          Partner user ID
          <input
            name="partnerId"
            value={form.partnerId}
            onChange={updateForm}
            required
          />
        </label>
        <label>
          Partner name
          <input
            name="partnerName"
            value={form.partnerName}
            onChange={updateForm}
            required
          />
        </label>
        <label>
          Skill name
          <input
            name="skillName"
            value={form.skillName}
            onChange={updateForm}
            required
          />
        </label>
        <label>
          Meeting time
          <input
            name="meetingTime"
            type="datetime-local"
            value={form.meetingTime}
            onChange={updateForm}
            required
          />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={updateForm} />
        </label>
        <label>
          Notes
          <textarea
            name="notes"
            value={form.notes}
            onChange={updateForm}
            rows="4"
          />
        </label>
        <button type="submit" className="primary-button">
          Create session
        </button>
        <p className="muted">
          Tip: use another seeded user's ID from a skill card owner when
          testing.
        </p>
      </form>

      <section className="grid">
        {message && <p className="card">{message}</p>}
        <div className="session-grid">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onComplete={(selectedSession) =>
                updateSessionStatus(selectedSession, 'completed')
              }
              onCancel={(selectedSession) =>
                updateSessionStatus(selectedSession, 'cancelled')
              }
              onDelete={deleteSession}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

SessionPlanner.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
  }),
};

export default SessionPlanner;
