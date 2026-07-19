import PropTypes from 'prop-types';
import './SessionCard.css';

function formatMeetingTime(meetingTime) {
  return new Date(meetingTime).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function SessionCard({ session, onComplete, onCancel, onDelete }) {
  return (
    <article className="card session-card">
      <div>
        <p className={`session-status ${session.status}`}>{session.status}</p>
        <h3>{session.skillName}</h3>
        <p className="muted">{session.participants.join(' and ')}</p>
      </div>
      <p>
        <strong>Time:</strong> {formatMeetingTime(session.meetingTime)}
      </p>
      <p>
        <strong>Location:</strong> {session.location}
      </p>
      <p className="muted">{session.notes || 'No notes added.'}</p>
      <div className="actions">
        {session.status === 'scheduled' && (
          <>
            <button
              type="button"
              className="primary-button"
              onClick={() => onComplete(session)}
            >
              Mark complete
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onCancel(session)}
            >
              Cancel
            </button>
          </>
        )}
        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(session._id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

SessionCard.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
    skillName: PropTypes.string.isRequired,
    meetingTime: PropTypes.string.isRequired,
    location: PropTypes.string,
    notes: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SessionCard;
