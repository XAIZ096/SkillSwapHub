import { useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest } from '../api/apiClient.js';
import './AuthPanel.css';

function AuthPanel({ user, onAuthChange, onLogout }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: 'demo',
    password: 'demo123',
    displayName: '',
    major: 'Computer Engineering',
    year: 'Fourth Year',
    contactPreference: 'In-app request',
  });
  const [error, setError] = useState('');

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const endpoint =
        mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onAuthChange(data.user);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  if (user) {
    return (
      <section className="auth-panel">
        <p className="muted">Signed in as</p>
        <h2>{user.displayName}</h2>
        <p>{user.major}</p>
        <button type="button" className="secondary-button" onClick={onLogout}>
          Log out
        </button>
      </section>
    );
  }

  return (
    <section className="auth-panel">
      <div
        className="auth-tabs"
        role="tablist"
        aria-label="Authentication options"
      >
        <button
          type="button"
          onClick={() => setMode('login')}
          className={mode === 'login' ? 'active' : ''}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={mode === 'register' ? 'active' : ''}
        >
          Register
        </button>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={updateForm}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateForm}
            required
          />
        </label>
        {mode === 'register' && (
          <>
            <label>
              Display name
              <input
                name="displayName"
                value={form.displayName}
                onChange={updateForm}
                required
              />
            </label>
            <label>
              Major
              <input name="major" value={form.major} onChange={updateForm} />
            </label>
          </>
        )}
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="primary-button">
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </section>
  );
}

AuthPanel.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    displayName: PropTypes.string,
    major: PropTypes.string,
  }),
  onAuthChange: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default AuthPanel;
