const express = require('express');
const passport = require('passport');
const { getCollection } = require('../db/collections');
const { requireAuth } = require('../middleware/requireAuth');
const { safeUser } = require('../auth/passportConfig');
const { createPasswordHash } = require('../utils/password');

const router = express.Router();

router.post('/logout', (request, response) => {
  const { username, password, displayName, major, year, contactPreference } = request.body;

  if (!username || !password || !displayName) {
    return response.status(400).json({ message: 'Username, password, and display name are required.' });
  }

  if (password.length < 6) {
    return response.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const users = await getCollection('users');
    const now = new Date();
    const newUser = {
      username: username.trim().toLowerCase(),
      passwordHash: createPasswordHash(password),
      displayName: displayName.trim(),
      major: major || 'Undeclared',
      year: year || 'Student',
      contactPreference: contactPreference || 'In-app request',
      role: 'student',
      createdAt: now,
      updatedAt: now,
    };

    const result = await users.insertOne(newUser);
    const insertedUser = { ...newUser, _id: result.insertedId };

    request.login(insertedUser, (error) => {
      if (error) {
        return response.status(500).json({ message: 'Registered, but login failed.' });
      }

      return response.status(201).json({ user: safeUser(insertedUser) });
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'That username is already taken.' });
    }

    return response.status(500).json({ message: 'Could not register user.' });
  }
});

router.post('/login', (request, response, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return response.status(401).json({ message: info.message });
    }

    return request.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return response.json({ user: safeUser(user) });
    });
  })(request, response, next);
});

router.post('/logout', requireAuth, (request, response) => {
  request.logout((error) => {
    if (error) {
      return response.status(500).json({ message: 'Could not log out.' });
    }

    return response.json({ message: 'Logged out successfully.' });
  });
});

router.get('/me', (request, response) => {
  if (!request.user) {
    return response.json({ user: null });
  }

  return response.json({ user: safeUser(request.user) });
});

router.put('/me', requireAuth, async (request, response) => {
  const { displayName, major, year, contactPreference } = request.body;

  try {
    const users = await getCollection('users');
    const update = {
      displayName: displayName || request.user.displayName,
      major: major || request.user.major,
      year: year || request.user.year,
      contactPreference: contactPreference || request.user.contactPreference,
      updatedAt: new Date(),
    };

    await users.updateOne({ _id: request.user._id }, { $set: update });
    const updatedUser = await users.findOne({ _id: request.user._id });
    return response.json({ user: safeUser(updatedUser) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not update profile.' });
  }
});

module.exports = router;
