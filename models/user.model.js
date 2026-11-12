const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 80 },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
  password: { type: String, required: true, minlength: 6, select: false },
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
  profilePic: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
