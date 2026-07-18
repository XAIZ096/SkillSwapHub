const express = require('express');
const { getCollection } = require('../db/collections');
const { requireAuth } = require('../middleware/requireAuth');
const { serializeDocument, serializeDocuments, toObjectId } = require('../utils/objectId');

const router = express.Router();

function buildSkillFilter(query) {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.level) {
    filter.level = query.level;
  }

  if (query.ownerId) {
    filter.ownerId = query.ownerId;
  }

  if (query.q) {
    filter.$or = [
      { name: { $regex: query.q, $options: 'i' } },
      { description: { $regex: query.q, $options: 'i' } },
      { ownerName: { $regex: query.q, $options: 'i' } },
    ];
  }

  return filter;
}

router.get('/', async (request, response) => {
  try {
    const skills = await getCollection('skills');
    const filter = buildSkillFilter(request.query);
    const documents = await skills.find(filter).sort({ updatedAt: -1 }).limit(100).toArray();
    return response.json({ skills: serializeDocuments(documents) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load skills.' });
  }
});

router.get('/:id', async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid skill id.' });
  }

  try {
    const skills = await getCollection('skills');
    const skill = await skills.findOne({ _id: objectId });

    if (!skill) {
      return response.status(404).json({ message: 'Skill not found.' });
    }

    return response.json({ skill: serializeDocument(skill) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load skill.' });
  }
});

router.post('/', requireAuth, async (request, response) => {
  const { name, category, type, level, description, availability, locationPreference } = request.body;

  if (!name || !category || !type || !level) {
    return response.status(400).json({ message: 'Name, category, type, and level are required.' });
  }

  try {
    const skills = await getCollection('skills');
    const now = new Date();
    const skill = {
      ownerId: request.user._id.toString(),
      ownerName: request.user.displayName,
      name: name.trim(),
      category,
      type,
      level,
      description: description || '',
      availability: availability || 'Flexible',
      locationPreference: locationPreference || 'Online',
      createdAt: now,
      updatedAt: now,
    };

    const result = await skills.insertOne(skill);
    return response.status(201).json({ skill: serializeDocument({ ...skill, _id: result.insertedId }) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not create skill.' });
  }
});

router.put('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid skill id.' });
  }

  const { name, category, type, level, description, availability, locationPreference } = request.body;

  try {
    const skills = await getCollection('skills');
    const existingSkill = await skills.findOne({ _id: objectId });

    if (!existingSkill) {
      return response.status(404).json({ message: 'Skill not found.' });
    }

    if (existingSkill.ownerId !== request.user._id.toString()) {
      return response.status(403).json({ message: 'You can only edit your own skills.' });
    }

    const update = {
      name: name || existingSkill.name,
      category: category || existingSkill.category,
      type: type || existingSkill.type,
      level: level || existingSkill.level,
      description: description ?? existingSkill.description,
      availability: availability || existingSkill.availability,
      locationPreference: locationPreference || existingSkill.locationPreference,
      updatedAt: new Date(),
    };

    await skills.updateOne({ _id: objectId }, { $set: update });
    const updatedSkill = await skills.findOne({ _id: objectId });
    return response.json({ skill: serializeDocument(updatedSkill) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not update skill.' });
  }
});

router.delete('/:id', requireAuth, async (request, response) => {
  const objectId = toObjectId(request.params.id);

  if (!objectId) {
    return response.status(400).json({ message: 'Invalid skill id.' });
  }

  try {
    const skills = await getCollection('skills');
    const existingSkill = await skills.findOne({ _id: objectId });

    if (!existingSkill) {
      return response.status(404).json({ message: 'Skill not found.' });
    }

    if (existingSkill.ownerId !== request.user._id.toString()) {
      return response.status(403).json({ message: 'You can only delete your own skills.' });
    }

    await skills.deleteOne({ _id: objectId });
    return response.json({ message: 'Skill deleted.' });
  } catch (error) {
    return response.status(500).json({ message: 'Could not delete skill.' });
  }
});

module.exports = router;
