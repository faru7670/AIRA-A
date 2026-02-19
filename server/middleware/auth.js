export function requireAuth(req, res, next) {
  if (!req.session.user?.verified) {
    return res.status(401).json({ error: 'Authentication and email verification required.' });
  }
  next();
}
