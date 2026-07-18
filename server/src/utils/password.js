const crypto = require('crypto');

function createPasswordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, expectedHash] = storedHash.split(':');
  const actualHash = createPasswordHash(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
}

module.exports = {
  createPasswordHash,
  verifyPassword,
};
