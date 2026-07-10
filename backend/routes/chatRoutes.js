const express = require('express');
const router = express.Router();
const {
  createChatOrGetChat,
  getChats,
  sendMessage,
  getMessages,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createChatOrGetChat);
router.get('/', getChats);
router.post('/:chatId/messages', sendMessage);
router.get('/:chatId/messages', getMessages);

module.exports = router;
