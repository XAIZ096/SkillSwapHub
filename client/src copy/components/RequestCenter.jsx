import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest, buildQuery } from '../api/apiClient.js';
import RequestCard from './RequestCard.jsx';
import './RequestCenter.css';

function RequestCenter({ user }) {
  const [swapRequests, setSwapRequests] = useState([]);
  const [direction, setDirection] = useState('all');
  const [message, setMessage] = useState('');

  async function loadRequests(nextDirection = direction) {
    if (!user) {
      return;
    }

    try {
      const query =
        nextDirection === 'all' ? '' : buildQuery({ direction: nextDirection });
      const data = await apiRequest(`/api/requests${query}`);
      setSwapRequests(data.swapRequests);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [user]);

  async function changeDirection(event) {
    const nextDirection = event.target.value;
    setDirection(nextDirection);
    await loadRequests(nextDirection);
  }

  async function updateRequestStatus(swapRequest, status) {
    try {
      await apiRequest(`/api/requests/${swapRequest._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setMessage(`Request ${status}.`);
      await loadRequests();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteRequest(requestId) {
    try {
      await apiRequest(`/api/requests/${requestId}`, { method: 'DELETE' });
      setMessage('Request deleted.');
      await loadRequests();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!user) {
    return (
      <section className="card">Please login to manage swap requests.</section>
    );
  }

  return (
    <section className="request-center grid">
      <div className="card request-toolbar">
        <div>
          <h2>Swap Request Management</h2>
          <p className="muted">
            Read, update, cancel, and delete peer learning requests.
          </p>
        </div>
        <label>
          View
          <select value={direction} onChange={changeDirection}>
            <option value="all">All requests</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>
        </label>
      </div>
      {message && <p className="card">{message}</p>}
      <div className="request-grid">
        {swapRequests.map((swapRequest) => (
          <RequestCard
            key={swapRequest._id}
            swapRequest={swapRequest}
            currentUserId={user._id}
            onStatusChange={updateRequestStatus}
            onDelete={deleteRequest}
          />
        ))}
      </div>
    </section>
  );
}

RequestCenter.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
  }),
};

export default RequestCenter;
