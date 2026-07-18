const express = require('express');
const { getCollection } = require('../db/collections');
const { requireAuth } = require('../middleware/requireAuth');
const { serializeDocument, serializeDocuments, toObjectId } = require('../utils/objectId');

const router = express.Router();

function requestVisibleToUser(swapRequest, userId) {
  return swapRequest.requesterId === userId || swapRequest.receiverId === userId;
}

router.get('/', requireAuth, async (request, response) => {
  const userId = request.user._id.toString();
  const filter = {};

  if (request.query.direction === 'incoming') {
    filter.receiverId = userId;
  } else if (request.query.direction === 'outgoing') {
    filter.requesterId = userId;
  } else {
    filter.$or = [{ requesterId: userId }, { receiverId: userId }];
  }

  if (request.query.status) {
    filter.status = request.query.status;
  }

  try {
    const swapRequests = await getCollection('swapRequests');
    const documents = await swapRequests.find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return response.json({ swapRequests: serializeDocuments(documents) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load swap requests.' });
  }
});

router.get('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid request id.' });
  }

  try {
    const swapRequests = await getCollection('swapRequests');
    const swapRequest = await swapRequests.findOne({ _id: objectId });

    if (!swapRequest) {
      return response.status(404).json({ message: 'Swap request not found.' });
    }

    if (!requestVisibleToUser(swapRequest, request.user._id.toString())) {
      return response.status(403).json({ message: 'You can only view your own requests.' });
    }

    return response.json({ swapRequest: serializeDocument(swapRequest) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load swap request.' });
  }
});

router.post('/', requireAuth, async (request, response) => {
  const { receiverId, receiverName, requestedSkill, offeredSkill, message } = request.body;

  if (!receiverId || !receiverName || !requestedSkill) {
    return response.status(400).json({ message: 'Receiver and requested skill are required.' });
  }

  if (receiverId === request.user._id.toString()) {
    return response.status(400).json({ message: 'You cannot send a request to yourself.' });
  }

  try {
    const swapRequests = await getCollection('swapRequests');
    const now = new Date();
    const newRequest = {
      requesterId: request.user._id.toString(),
      requesterName: request.user.displayName,
      receiverId,
      receiverName,
      requestedSkill,
      offeredSkill: offeredSkill || 'Help in return',
      message: message || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const result = await swapRequests.insertOne(newRequest);
    return response.status(201).json({ swapRequest: serializeDocument({ ...newRequest, _id: result.insertedId }) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not create swap request.' });
  }
});

router.put('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid request id.' });
  }

  const { requestedSkill, offeredSkill, message, status } = request.body;
  const allowedStatuses = ['pending', 'accepted', 'rejected', 'cancelled'];

  if (status && !allowedStatuses.includes(status)) {
    return response.status(400).json({ message: 'Invalid request status.' });
  }

  try {
    const swapRequests = await getCollection('swapRequests');
    const existingRequest = await swapRequests.findOne({ _id: objectId });

    if (!existingRequest) {
      return response.status(404).json({ message: 'Swap request not found.' });
    }

    const userId = request.user._id.toString();
    if (!requestVisibleToUser(existingRequest, userId)) {
      return response.status(403).json({ message: 'You can only update your own requests.' });
    }

    if (status && ['accepted', 'rejected'].includes(status) && existingRequest.receiverId !== userId) {
      return response.status(403).json({ message: 'Only the receiver can accept or reject this request.' });
    }

    const update = {
      requestedSkill: requestedSkill || existingRequest.requestedSkill,
      offeredSkill: offeredSkill || existingRequest.offeredSkill,
      message: message ?? existingRequest.message,
      status: status || existingRequest.status,
      updatedAt: new Date(),
    };

    await swapRequests.updateOne({ _id: objectId }, { $set: update });
    const updatedRequest = await swapRequests.findOne({ _id: objectId });
    return response.json({ swapRequest: serializeDocument(updatedRequest) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not update swap request.' });
  }
});

router.delete('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid request id.' });
  }

  try {
    const swapRequests = await getCollection('swapRequests');
    const existingRequest = await swapRequests.findOne({ _id: objectId });

    if (!existingRequest) {
      return response.status(404).json({ message: 'Swap request not found.' });
    }

    if (!requestVisibleToUser(existingRequest, request.user._id.toString())) {
      return response.status(403).json({ message: 'You can only delete your own requests.' });
    }

    await swapRequests.deleteOne({ _id: objectId });
    return response.json({ message: 'Swap request deleted.' });
  } catch (error) {
    return response.status(500).json({ message: 'Could not delete swap request.' });
  }
});

module.exports = router;
