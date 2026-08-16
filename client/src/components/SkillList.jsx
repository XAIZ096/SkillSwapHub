import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest, buildQuery } from '../api/apiClient.js';
import SkillCard from './SkillCard.jsx';
import SkillForm from './SkillForm.jsx';
import './SkillList.css';

function SkillList({ user, onNavigate }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    type: '',
    level: '',
  });
  const [message, setMessage] = useState('');
  const [successRequest, setSuccessRequest] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  async function loadSkills() {
    try {
      const data = await apiRequest(`/api/skills${buildQuery(filters)}`);
      setSkills(data.skills);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function updateFilter(event) {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  }

  async function applyFilters(event) {
    event.preventDefault();
    await loadSkills();
    setMessage('Filters applied. Skill results have been updated.');
  }

  async function submitSkill(skill) {
    if (!user) {
      setMessage('Please login before creating a skill.');
      return;
    }

    try {
      const method = selectedSkill ? 'PUT' : 'POST';
      const path = selectedSkill
        ? `/api/skills/${selectedSkill._id}`
        : '/api/skills';

      await apiRequest(path, { method, body: JSON.stringify(skill) });
      setSelectedSkill(null);
      setIsSkillFormOpen(false);
      setMessage(selectedSkill ? 'Skill updated successfully.' : 'Skill created successfully.');
      await loadSkills();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteSkill(skillId) {
    try {
      await apiRequest(`/api/skills/${skillId}`, { method: 'DELETE' });
      setMessage('Skill deleted successfully.');
      await loadSkills();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createRequest(skill) {
    if (!user) {
      setMessage('Please login before sending a request.');
      return;
    }

    try {
      await apiRequest('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: skill.ownerId,
          receiverName: skill.ownerName,
          requestedSkill: skill.name,
          offeredSkill: 'I can help with another skill in return.',
          message:
            requestMessage || `I would like to connect about ${skill.name}.`,
        }),
      });

      setRequestMessage('');
      setSuccessRequest(skill.name);
      setMessage(`Request sent successfully for ${skill.name}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function startEditingSkill(skill) {
    setSelectedSkill(skill);
    setIsSkillFormOpen(true);
  }

  function cancelSkillForm() {
    setSelectedSkill(null);
    setIsSkillFormOpen(false);
  }

  function toggleSkillForm() {
    setSelectedSkill(null);
    setIsSkillFormOpen(!isSkillFormOpen);
  }

  return (
    <section className="grid two-columns skill-page" aria-labelledby="skill-marketplace-title">
      <aside className="skill-sidebar" aria-label="Skill tools">
        <form className="card filter-form" onSubmit={applyFilters}>
          <h3>Filter skills</h3>
          <p className="form-instruction">
            Search by keyword or narrow results by category and type.
          </p>

          <label htmlFor="skill-keyword">
            Keyword
            <input
              id="skill-keyword"
              name="q"
              value={filters.q}
              onChange={updateFilter}
              placeholder="Example: React"
            />
          </label>

          <label htmlFor="skill-category">
            Category
            <select
              id="skill-category"
              name="category"
              value={filters.category}
              onChange={updateFilter}
            >
              <option value="">All categories</option>
              <option>Programming</option>
              <option>Career</option>
              <option>Language</option>
              <option>Math</option>
              <option>Design</option>
              <option>Engineering</option>
            </select>
          </label>

          <label htmlFor="skill-type">
            Type
            <select
              id="skill-type"
              name="type"
              value={filters.type}
              onChange={updateFilter}
            >
              <option value="">All types</option>
              <option value="offer">Offering</option>
              <option value="learn">Wants to learn</option>
            </select>
          </label>

          <button type="submit" className="primary-button full-width-button">
            Apply filters
          </button>
        </form>

        <section className="card add-skill-panel" aria-labelledby="add-skill-heading">
          <h3 id="add-skill-heading">Add your own skill</h3>
          <p className="form-instruction">
            Create a listing only when you want to offer or request a skill.
          </p>
          <button
            type="button"
            className="secondary-button full-width-button"
            onClick={toggleSkillForm}
            aria-expanded={isSkillFormOpen}
          >
            {isSkillFormOpen ? 'Close skill form' : '+ Add a skill'}
          </button>
        </section>

        {isSkillFormOpen && (
          <SkillForm
            selectedSkill={selectedSkill}
            onSubmit={submitSkill}
            onCancel={cancelSkillForm}
          />
        )}
      </aside>

      <section className="grid">
        <div className="card marketplace-header">
          <h2 id="skill-marketplace-title">Skill Marketplace</h2>
          <p className="muted">
            Browse, filter, create, edit, and delete skill listings.
          </p>

          <label htmlFor="request-message">
            Optional request message
            <input
              id="request-message"
              value={requestMessage}
              onChange={(event) => setRequestMessage(event.target.value)}
              placeholder="Example: I would like help this weekend."
            />
          </label>

          {successRequest && (
            <div className="success-message" role="status" aria-live="polite">
              <div>
                <strong>Request sent successfully.</strong>
                <p>
                  Your request for <strong>{successRequest}</strong> was saved.
                  You can review it on the Requests page.
                </p>
              </div>
              <button
                type="button"
                className="success-button"
                onClick={() => onNavigate('requests')}
              >
                Go to Requests
              </button>
            </div>
          )}

          {message && (
            <p className="inline-status" role="status" aria-live="polite">
              {message}
            </p>
          )}
        </div>

        <div className="skill-results" aria-label="Skill results">
          {skills.map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              currentUserId={user?._id}
              onEdit={startEditingSkill}
              onDelete={deleteSkill}
              onRequest={createRequest}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

SkillList.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
  }),
  onNavigate: PropTypes.func.isRequired,
};

export default SkillList;
