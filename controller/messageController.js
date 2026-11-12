const mongoose = require('mongoose');
const User = require('../models/user.model');
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const { getIO } = require('../socket/socket');

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const findConversation = async (userA, userB) => {
  let conversation = await Conversation.findOne({ participants: { $all: [userA, userB], $size: 2 } });
  if (!conversation) {
    conversation = await Conversation.create({ participants: [userA, userB] });
  }
  return conversation;
};

const GetMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!validId(userId)) return res.status(400).json({ message: 'Invalid user ID' });
    if (String(req.user._id) === userId) return res.status(400).json({ message: 'You cannot open a conversation with yourself' });
    const otherUser = await User.findById(userId).select('_id');
    if (!otherUser) return res.status(404).json({ message: 'User not found' });
    const conversation = await Conversation.findOne({ participants: { $all: [req.user._id, otherUser._id], $size: 2 } });
    if (!conversation) return res.status(200).json({ conversationId: null, messages: [] });

    // const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    const messages = await Message.find({
  conversationId: conversation._id
})
.populate("senderId", "fullName username profilePic")
.populate("receiverId", "fullName username profilePic")
.sort({ createdAt: 1 });
    await Message.updateMany({ conversationId: conversation._id, receiverId: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
    res.status(200).json({ conversationId: conversation._id, messages });
  } catch (error) { res.status(500).json({ message: 'Unable to fetch messages', error: error.message }); }
};

const SendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const messageText = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!validId(userId)) return res.status(400).json({ message: 'Invalid receiver ID' });
    if (!messageText) return res.status(400).json({ message: 'Message cannot be empty' });
    if (messageText.length > 5000) return res.status(400).json({ message: 'Message cannot exceed 5000 characters' });
    if (String(req.user._id) === userId) return res.status(400).json({ message: 'You cannot message yourself' });
    const receiver = await User.findById(userId).select('_id');
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    const conversation = await findConversation(req.user._id, receiver._id);
    const message = await Message.create({
      senderId: req.user._id, receiverId: receiver._id, message: messageText, conversationId: conversation._id,
    });
    conversation.lastMessage = message._id;
    await conversation.save();

    const payload = await Message.findById(message._id)
      .populate('senderId', 'fullName username profilePic')
      .populate('receiverId', 'fullName username profilePic');
    const io = getIO();
    io.to(String(receiver._id)).emit('newMessage', payload);
    io.to(String(req.user._id)).emit('newMessage', payload);
    res.status(201).json({ message: 'Message sent successfully', data: payload });
  } catch (error) { res.status(500).json({ message: 'Unable to send message', error: error.message }); }
};

const GetConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'fullName username profilePic')
      .populate({ path: 'lastMessage', select: 'message senderId receiverId createdAt readAt' })
      .sort({ updatedAt: -1 });
    res.status(200).json({ conversations });
  } catch (error) { res.status(500).json({ message: 'Unable to fetch conversations', error: error.message }); }
};

module.exports = { GetMessages, SendMessage, GetConversations };
