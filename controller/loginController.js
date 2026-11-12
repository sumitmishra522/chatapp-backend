const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const FindUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password) return res.status(400).json({ message: 'Username and password are required' });
    const user = await User.findOne({ username: username.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return res.status(200).json({ message: 'Login successful', token, user: {
      _id: user._id, username: user.username, fullName: user.fullName, profilePic: user.profilePic,
    } });
  } catch (error) { return res.status(500).json({ message: 'Login failed', error: error.message }); }
};

module.exports = { FindUser };
