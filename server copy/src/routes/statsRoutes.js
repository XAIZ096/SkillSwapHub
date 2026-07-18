const express = require('express');
const { getCollection } = require('../db/collections');

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    const users = await getCollection('users');
    const skills = await getCollection('skills');
    const swapRequests = await getCollection('swapRequests');
    const sessions = await getCollection('sessions');

    const [userCount, skillCount, requestCount, sessionCount] = await Promise.all([
      users.countDocuments(),
      skills.countDocuments(),
      swapRequests.countDocuments(),
      sessions.countDocuments(),
    ]);

    return response.json({
      counts: {
        users: userCount,
        skills: skillCount,
        swapRequests: requestCount,
        sessions: sessionCount,
        totalRecords: userCount + skillCount + requestCount + sessionCount,
      },
    });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load stats.' });
  }
});

module.exports = router;
