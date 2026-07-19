import PropTypes from 'prop-types';
import './RequestCard.css';

function RequestCard({ swapRequest, currentUserId, onStatusChange, onDelete }) {
  const isReceiver = swapRequest.receiverId === currentUserId;

  return (
    <article className="card request-card">
      <div>
        <p className={`request-status ${swapRequest.status}`}>
          {swapRequest.status}
        </p>
        <h3>{swapRequest.requestedSkill}</h3>
        <p className="muted">
          From {swapRequest.requesterName} to {swapRequest.receiverName}
        </p>
      </div>
      <p>{swapRequest.message || 'No message provided.'}</p>
      <p className="muted">Offered in return: {swapRequest.offeredSkill}</p>
      <div className="actions">
        {isReceiver && swapRequest.status === 'pending' && (
          <>
            <button
              type="button"
              className="primary-button"
              onClick={() => onStatusChange(swapRequest, 'accepted')}
            >
              Accept
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onStatusChange(swapRequest, 'rejected')}
            >
              Reject
            </button>
          </>
        )}
        {swapRequest.status === 'pending' && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => onStatusChange(swapRequest, 'cancelled')}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(swapRequest._id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

RequestCard.propTypes = {
  swapRequest: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    requesterId: PropTypes.string.isRequired,
    requesterName: PropTypes.string.isRequired,
    receiverId: PropTypes.string.isRequired,
    receiverName: PropTypes.string.isRequired,
    requestedSkill: PropTypes.string.isRequired,
    offeredSkill: PropTypes.string,
    message: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  currentUserId: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default RequestCard;
