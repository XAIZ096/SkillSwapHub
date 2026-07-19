import PropTypes from 'prop-types';
import './SkillCard.css';

function SkillCard({ skill, currentUserId, onEdit, onDelete, onRequest }) {
  const isOwner = skill.ownerId === currentUserId;

  return (
    <article className="card skill-card">
      <div>
        <p className="skill-type">
          {skill.type === 'offer' ? 'Offering' : 'Wants to learn'}
        </p>
        <h3>{skill.name}</h3>
        <p className="muted">
          {skill.ownerName} • {skill.category} • {skill.level}
        </p>
      </div>
      <p>{skill.description || 'No description provided.'}</p>
      <p className="muted">
        Availability: {skill.availability} | Location:{' '}
        {skill.locationPreference}
      </p>
      <p className="muted">
        Owner ID for session testing: <code>{skill.ownerId}</code>
      </p>
      <div className="actions">
        {isOwner ? (
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onEdit(skill)}
            >
              Edit
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => onDelete(skill._id)}
            >
              Delete
            </button>
          </>
        ) : (
          <button
            type="button"
            className="primary-button"
            onClick={() => onRequest(skill)}
          >
            Request swap
          </button>
        )}
      </div>
    </article>
  );
}

SkillCard.propTypes = {
  skill: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    ownerId: PropTypes.string.isRequired,
    ownerName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    description: PropTypes.string,
    availability: PropTypes.string,
    locationPreference: PropTypes.string,
  }).isRequired,
  currentUserId: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRequest: PropTypes.func.isRequired,
};

export default SkillCard;
