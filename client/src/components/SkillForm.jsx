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
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(selectedSkill || blankSkill);
    setFormError('');
  }, [selectedSkill]);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError('Skill name is required.');
      return;
    }

    if (!form.description.trim()) {
      setFormError('Description is required.');
      return;
    }

    setFormError('');
    onSubmit(form);
    setForm(blankSkill);
  }

  return (
    <form
      className="card skill-form"
      onSubmit={handleSubmit}
      aria-labelledby="skill-form-title"
    >
      <h3 id="skill-form-title">{selectedSkill ? 'Edit skill' : 'Add a skill'}</h3>
      <p className="form-instruction">
        Required fields are marked with <span className="required">*</span>.
      </p>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <fieldset className="form-section">
        <legend>Basic information</legend>

        <label htmlFor="skill-name">
          Skill name <span className="required">*</span>
          <input
            id="skill-name"
            name="name"
            value={form.name}
            onChange={updateForm}
            required
            placeholder="Example: Python tutoring"
          />
        </label>

        <label htmlFor="skill-form-category">
          Category <span className="required">*</span>
          <select
            id="skill-form-category"
            name="category"
            value={form.category}
            onChange={updateForm}
          >
            <option>Programming</option>
            <option>Career</option>
            <option>Language</option>
            <option>Math</option>
            <option>Design</option>
            <option>Engineering</option>
          </select>
        </label>

        <label htmlFor="skill-form-type">
          Type <span className="required">*</span>
          <select
            id="skill-form-type"
            name="type"
            value={form.type}
            onChange={updateForm}
          >
            <option value="offer">I can offer this</option>
            <option value="learn">I want to learn this</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="form-section">
        <legend>Skill details</legend>

        <label htmlFor="skill-level">
          Level
          <select
            id="skill-level"
            name="level"
            value={form.level}
            onChange={updateForm}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>

        <label htmlFor="skill-availability">
          Availability
          <input
            id="skill-availability"
            name="availability"
            value={form.availability}
            onChange={updateForm}
            placeholder="Example: Weekends"
          />
        </label>

        <label htmlFor="skill-location">
          Location preference
          <input
            id="skill-location"
            name="locationPreference"
            value={form.locationPreference}
            onChange={updateForm}
            placeholder="Example: Online or library"
          />
        </label>

        <label htmlFor="skill-description">
          Description <span className="required">*</span>
          <textarea
            id="skill-description"
            name="description"
            value={form.description}
            onChange={updateForm}
            rows="4"
            required
            placeholder="Briefly explain what you can offer or what you want to learn."
          />
        </label>
      </fieldset>

      <div className="actions">
        <button type="submit" className="primary-button">
          {selectedSkill ? 'Update skill' : 'Create skill'}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
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
