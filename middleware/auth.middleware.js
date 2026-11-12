const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const VerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication token is required' });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id username fullName profilePic');
    if (!user) return res.status(401).json({ message: 'User account no longer exists' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid or expired token' });
  }
};

module.exports = VerifyToken;
