function requireAuth(request, response, next) {
  if (request.isAuthenticated && request.isAuthenticated()) {
    return next();
  }

  return response.status(401).json({ message: 'Authentication is required.' });
}

module.exports = { requireAuth };
