const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const CreateUser = async (req, res) => {
  try {
    const { fullName, username, password, gender } = req.body;
    if (!fullName?.trim() || !username?.trim() || !password || !gender) {
      return res.status(400).json({ message: 'fullName, username, password and gender are required' });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters' });
    const normalizedUsername = username.trim().toLowerCase();
    if (await User.exists({ username: normalizedUsername })) return res.status(409).json({ message: 'Username is already taken' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName: fullName.trim(), username: normalizedUsername, password: hashedPassword,
      gender, profilePic: req.file?.path || '',
    });
    return res.status(201).json({ message: 'User created successfully', user: {
      _id: user._id, fullName: user.fullName, username: user.username, gender: user.gender, profilePic: user.profilePic,
    } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Username is already taken' });
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    return res.status(500).json({ message: 'Unable to create user', error: error.message });
  }
};

const GetUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('fullName username profilePic gender createdAt').sort({ fullName: 1 });
    res.status(200).json({ users });
  } catch (error) { res.status(500).json({ message: 'Unable to fetch users' }); }
};

module.exports = { CreateUser, GetUsers };
