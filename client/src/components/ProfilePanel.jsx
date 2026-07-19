import { useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest } from '../api/apiClient.js';
import './ProfilePanel.css';

function ProfilePanel({ user, onUserUpdated }) {
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    major: user?.major || '',
    year: user?.year || '',
    contactPreference: user?.contactPreference || '',
  });
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <section className="card">Please login to manage your profile.</section>
    );
  }

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const data = await apiRequest('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      onUserUpdated(data.user);
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="card profile-panel">
      <h2>Profile Management</h2>
      <p className="muted">
        This covers profile update functionality and supports the skill profile
        user story.
      </p>
      <form className="profile-form" onSubmit={handleSubmit}>
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
        <label>
          Year
          <input name="year" value={form.year} onChange={updateForm} />
        </label>
        <label>
          Contact preference
          <input
            name="contactPreference"
            value={form.contactPreference}
            onChange={updateForm}
          />
        </label>
        <button type="submit" className="primary-button">
          Save profile
        </button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}

ProfilePanel.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    major: PropTypes.string,
    year: PropTypes.string,
    contactPreference: PropTypes.string,
  }),
  onUserUpdated: PropTypes.func.isRequired,
};

export default ProfilePanel;
