const express = require('express');
const { getCollection } = require('../db/collections');
const { requireAuth } = require('../middleware/requireAuth');
const { serializeDocument, serializeDocuments, toObjectId } = require('../utils/objectId');

const router = express.Router();

function userIsParticipant(session, userId) {
  return session.participantIds.includes(userId);
}

router.get('/', requireAuth, async (request, response) => {
  const userId = request.user._id.toString();
  const filter = { participantIds: userId };

  if (request.query.status) {
    filter.status = request.query.status;
  }

  try {
    const sessions = await getCollection('sessions');
    const documents = await sessions.find(filter).sort({ meetingTime: 1 }).limit(100).toArray();
    return response.json({ sessions: serializeDocuments(documents) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load sessions.' });
  }
});

router.get('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid session id.' });
  }

  try {
    const sessions = await getCollection('sessions');
    const session = await sessions.findOne({ _id: objectId });

    if (!session) {
      return response.status(404).json({ message: 'Session not found.' });
    }

    if (!userIsParticipant(session, request.user._id.toString())) {
      return response.status(403).json({ message: 'You can only view your own sessions.' });
    }

    return response.json({ session: serializeDocument(session) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load session.' });
  }
});

router.post('/', requireAuth, async (request, response) => {
  const { partnerId, partnerName, skillName, meetingTime, location, notes } = request.body;

  if (!partnerId || !partnerName || !skillName || !meetingTime) {
    return response.status(400).json({ message: 'Partner, skill, and meeting time are required.' });
  }

  if (partnerId === request.user._id.toString()) {
    return response.status(400).json({ message: 'You cannot schedule a session with yourself.' });
  }

  try {
    const sessions = await getCollection('sessions');
    const now = new Date();
    const session = {
      participantIds: [request.user._id.toString(), partnerId],
      participants: [request.user.displayName, partnerName],
      skillName,
      meetingTime: new Date(meetingTime),
      location: location || 'Online',
      notes: notes || '',
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };

    const result = await sessions.insertOne(session);
    return response.status(201).json({ session: serializeDocument({ ...session, _id: result.insertedId }) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not create session.' });
  }
});

router.put('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid session id.' });
  }

  const { skillName, meetingTime, location, notes, status } = request.body;
  const allowedStatuses = ['scheduled', 'completed', 'cancelled'];

  if (status && !allowedStatuses.includes(status)) {
    return response.status(400).json({ message: 'Invalid session status.' });
  }

  try {
    const sessions = await getCollection('sessions');
    const existingSession = await sessions.findOne({ _id: objectId });

    if (!existingSession) {
      return response.status(404).json({ message: 'Session not found.' });
    }

    if (!userIsParticipant(existingSession, request.user._id.toString())) {
      return response.status(403).json({ message: 'You can only update your own sessions.' });
    }

    const update = {
      skillName: skillName || existingSession.skillName,
      meetingTime: meetingTime ? new Date(meetingTime) : existingSession.meetingTime,
      location: location || existingSession.location,
      notes: notes ?? existingSession.notes,
      status: status || existingSession.status,
      updatedAt: new Date(),
    };

    await sessions.updateOne({ _id: objectId }, { $set: update });
    const updatedSession = await sessions.findOne({ _id: objectId });
    return response.json({ session: serializeDocument(updatedSession) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not update session.' });
  }
});

router.delete('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid session id.' });
  }

  try {
    const sessions = await getCollection('sessions');
    const existingSession = await sessions.findOne({ _id: objectId });

    if (!existingSession) {
      return response.status(404).json({ message: 'Session not found.' });
    }

    if (!userIsParticipant(existingSession, request.user._id.toString())) {
      return response.status(403).json({ message: 'You can only delete your own sessions.' });
    }

    await sessions.deleteOne({ _id: objectId });
    return response.json({ message: 'Session deleted.' });
  } catch (error) {
    return response.status(500).json({ message: 'Could not delete session.' });
  }
});

module.exports = router;
