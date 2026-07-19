import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './SkillForm.css';

const blankSkill = {
  name: '',
  category: 'Programming',
  type: 'offer',
  level: 'Beginner',
  description: '',
  availability: 'Flexible',
  locationPreference: 'Online',
};

function SkillForm({ selectedSkill, onSubmit, onCancel }) {
  const [form, setForm] = useState(blankSkill);

  useEffect(() => {
    setForm(selectedSkill || blankSkill);
  }, [selectedSkill]);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
    setForm(blankSkill);
  }

  return (
    <form className="card skill-form" onSubmit={handleSubmit}>
      <h3>{selectedSkill ? 'Edit skill' : 'Add a skill'}</h3>
      <label>
        Skill name
        <input name="name" value={form.name} onChange={updateForm} required />
      </label>
      <label>
        Category
        <select name="category" value={form.category} onChange={updateForm}>
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
        <select name="type" value={form.type} onChange={updateForm}>
          <option value="offer">I can offer this</option>
          <option value="learn">I want to learn this</option>
        </select>
      </label>
      <label>
        Level
        <select name="level" value={form.level} onChange={updateForm}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </label>
      <label>
        Availability
        <input
          name="availability"
          value={form.availability}
          onChange={updateForm}
        />
      </label>
      <label>
        Location preference
        <input
          name="locationPreference"
          value={form.locationPreference}
          onChange={updateForm}
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={updateForm}
          rows="4"
        />
      </label>
      <div className="actions">
        <button type="submit" className="primary-button">
          {selectedSkill ? 'Update skill' : 'Create skill'}
        </button>
        {selectedSkill && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
}

SkillForm.propTypes = {
  selectedSkill: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    type: PropTypes.string,
    level: PropTypes.string,
    description: PropTypes.string,
    availability: PropTypes.string,
    locationPreference: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SkillForm;
