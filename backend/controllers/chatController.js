const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// @desc    Initiate or fetch direct chat thread with another user
// @route   POST /api/chats
// @access  Private
exports.createChatOrGetChat = async (req, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Please provide target user ID' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot start chat with yourself' });
    }

    // Check if chat thread already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, targetUserId] },
    }).populate('participants', 'name email avatar role');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.id, targetUserId],
      });
      chat = await Chat.findById(chat._id).populate('participants', 'name email avatar role');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's chat folders
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
    })
      .populate('participants', 'name email avatar role phone')
      .populate('lastSender', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: chats.length, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat thread not found' });
    }

    // Verify membership
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to post in this chat' });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      text,
    });

    chat.lastMessage = text;
    chat.lastSender = req.user.id;
    chat.isRead = false;
    await chat.save();

    // Notify other participant
    const recipientId = chat.participants.find((id) => id.toString() !== req.user.id);
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: 'message',
      title: `New Message from ${req.user.name}`,
      message: text.substring(0, 60),
      link: `/messages?chatId=${chatId}`,
    });

    const populatedMsg = await Message.findById(message._id).populate('sender', 'name email avatar role');

    res.status(201).json({ success: true, message: populatedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get message logs for a single chat thread
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat thread not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view messages' });
    }

    // If viewer is not the last sender, mark chat as read
    if (chat.lastSender && chat.lastSender.toString() !== req.user.id) {
      chat.isRead = true;
      await chat.save();
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
