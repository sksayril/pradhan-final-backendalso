const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/fileUpload');
const {
  createChat,
  getMemberChats,
  getChatDetails,
  sendMessage,
  getChatMessages,
  editMessage,
  deleteMessage,
  getChatStatistics
} = require('../controllers/chatController');
const {
  validateChatCreation,
  validateMessage,
  validateChatId,
  validateMessageId
} = require('../middleware/validation');

// Create new chat
router.post('/',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateChatCreation,
  createChat
);

// Get member's chats
router.get('/',
  auth.authenticate,
  auth.authorize('societyMember'),
  getMemberChats
);

// Get chat details
router.get('/:chatId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateChatId,
  getChatDetails
);

// Send message
router.post('/:chatId/messages',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateChatId,
  uploadMultiple('attachments', 5),
  validateMessage,
  sendMessage
);

// Get chat messages
router.get('/:chatId/messages',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateChatId,
  getChatMessages
);

// Edit message
router.put('/messages/:messageId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateMessageId,
  editMessage
);

// Delete message
router.delete('/messages/:messageId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateMessageId,
  deleteMessage
);

// Get chat statistics
router.get('/statistics/overview',
  auth.authenticate,
  auth.authorize('societyMember'),
  getChatStatistics
);

module.exports = router;
