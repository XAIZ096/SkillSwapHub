import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest, buildQuery } from '../api/apiClient.js';
import SkillCard from './SkillCard.jsx';
import SkillForm from './SkillForm.jsx';
import './SkillList.css';

function SkillList({ user }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    type: '',
    level: '',
  });
  const [message, setMessage] = useState('');
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
      setMessage(selectedSkill ? 'Skill updated.' : 'Skill created.');
      await loadSkills();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteSkill(skillId) {
    try {
      await apiRequest(`/api/skills/${skillId}`, { method: 'DELETE' });
      setMessage('Skill deleted.');
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
      setMessage('Swap request sent.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="grid two-columns skill-page">
      <aside className="skill-sidebar">
        <form className="card filter-form" onSubmit={applyFilters}>
          <h3>Filter skills</h3>
          <label>
            Keyword
            <input name="q" value={filters.q} onChange={updateFilter} />
          </label>
          <label>
            Category
            <select
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
          <label>
            Type
            <select name="type" value={filters.type} onChange={updateFilter}>
              <option value="">All types</option>
              <option value="offer">Offering</option>
              <option value="learn">Wants to learn</option>
            </select>
          </label>
          <button type="submit" className="primary-button">
            Apply filters
          </button>
        </form>
        <SkillForm
          selectedSkill={selectedSkill}
          onSubmit={submitSkill}
          onCancel={() => setSelectedSkill(null)}
        />
      </aside>

      <section className="grid">
        <div className="card">
          <h2>Skill Marketplace</h2>
          <p className="muted">
            Browse, filter, create, edit, and delete skill listings.
          </p>
          <label>
            Optional request message
            <input
              value={requestMessage}
              onChange={(event) => setRequestMessage(event.target.value)}
            />
          </label>
          {message && <p>{message}</p>}
        </div>
        <div className="skill-results">
          {skills.map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              currentUserId={user?._id}
              onEdit={setSelectedSkill}
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
};

export default SkillList;
