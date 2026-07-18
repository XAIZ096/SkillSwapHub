const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { getCollection } = require('../db/collections');
const { toObjectId } = require('../utils/objectId');
const { verifyPassword } = require('../utils/password');

function safeUser(user) {
  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    major: user.major,
    year: user.year,
    contactPreference: user.contactPreference,
    role: user.role,
  };
}

function configurePassport() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const users = await getCollection('users');
        const user = await users.findOne({ username: username.trim().toLowerCase() });

        if (!user || !verifyPassword(password, user.passwordHash)) {
          return done(null, false, { message: 'Invalid username or password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return done(null, false);
      }

      const users = await getCollection('users');
      const user = await users.findOne({ _id: objectId });
      return done(null, user || false);
    } catch (error) {
      return done(error);
    }
  });
}

module.exports = {
  configurePassport,
  safeUser,
};
