const Chat = require('../models/chat.model');
const ChatMessage = require('../models/chatMessage.model');
const SocietyMember = require('../models/societyMember.model');
const { uploadToS3 } = require('../config/aws');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Create new chat
const createChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const memberId = req.user.id;
    const { subject, chatType, category, priority, participants } = req.body;

    // Create chat
    const chat = new Chat({
      subject,
      chatType: chatType || 'member_to_admin',
      category: category || 'general',
      priority: priority || 'medium',
      participants: [memberId, ...(participants || [])],
      createdBy: memberId
    });

    await chat.save();

    // Populate the created chat
    await chat.populate([
      { path: 'participants', select: 'firstName lastName memberId email' },
      { path: 'createdBy', select: 'firstName lastName memberId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get member's chats
const getMemberChats = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { status, chatType, category, page = 1, limit = 10 } = req.query;

    const options = {};
    if (status) options.status = status;
    if (chatType) options.chatType = chatType;
    if (category) options.category = category;

    const chats = await Chat.getChatsByParticipant(
      new mongoose.Types.ObjectId(memberId),
      options
    )
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalChats = await Chat.countDocuments({
      participants: new mongoose.Types.ObjectId(memberId)
    });

    res.status(200).json({
      success: true,
      message: 'Chats retrieved successfully',
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalChats / limit),
          totalChats,
          hasNext: page * limit < totalChats,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting member chats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get chat details
const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const memberId = req.user.id;

    const chat = await Chat.findOne({
      chatId: chatId,
      participants: new mongoose.Types.ObjectId(memberId)
    })
      .populate('participants', 'firstName lastName memberId email')
      .populate('lastMessage.sentBy', 'firstName lastName memberId')
      .populate('createdBy', 'firstName lastName memberId');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat details retrieved successfully',
      data: chat
    });

  } catch (error) {
    console.error('Error getting chat details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { content, messageType, replyTo } = req.body;
    const memberId = req.user.id;

    // Verify chat exists and member is participant
    const chat = await Chat.findOne({
      chatId: chatId,
      participants: new mongoose.Types.ObjectId(memberId)
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Create message
    const message = new ChatMessage({
      chatId: chat._id,
      sender: new mongoose.Types.ObjectId(memberId),
      content,
      messageType: messageType || 'text',
      replyTo: replyTo || null
    });

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const attachments = [];
      for (const file of req.files) {
        const uploadResult = await uploadToS3(file, 'chat-attachments');
        attachments.push({
          fileName: file.originalname,
          fileUrl: uploadResult.Location,
          fileSize: file.size,
          mimeType: file.mimetype
        });
      }
      message.attachments = attachments;
      message.messageType = 'file';
    }

    await message.save();

    // Update chat with last message info
    chat.lastMessage = {
      content: content,
      sentBy: new mongoose.Types.ObjectId(memberId),
      sentAt: new Date()
    };
    chat.messageCount += 1;
    chat.updatedAt = new Date();

    // Update unread count for other participants
    chat.participants.forEach(participantId => {
      if (!participantId.equals(memberId)) {
        chat.updateUnreadCount(participantId, true);
      }
    });

    await chat.save();

    // Populate the message
    await message.populate([
      { path: 'sender', select: 'firstName lastName memberId email' },
      { path: 'replyTo', select: 'content sender' },
      { path: 'replyTo.sender', select: 'firstName lastName memberId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get chat messages
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const memberId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify chat exists and member is participant
    const chat = await Chat.findOne({
      chatId: chatId,
      participants: new mongoose.Types.ObjectId(memberId)
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    const messages = await ChatMessage.getMessagesByChat(chat._id)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalMessages = await ChatMessage.countDocuments({
      chatId: chat._id,
      'metadata.isDeleted': false
    });

    // Mark messages as read
    await ChatMessage.markMessagesAsRead(chat._id, new mongoose.Types.ObjectId(memberId));
    
    // Update chat unread count
    chat.markAsRead(new mongoose.Types.ObjectId(memberId));
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat messages retrieved successfully',
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNext: page * limit < totalMessages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Edit message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const memberId = req.user.id;

    const message = await ChatMessage.findOne({
      messageId: messageId,
      sender: new mongoose.Types.ObjectId(memberId)
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or access denied'
      });
    }

    message.editMessage(content);
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: message
    });

  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const memberId = req.user.id;

    const message = await ChatMessage.findOne({
      messageId: messageId,
      sender: new mongoose.Types.ObjectId(memberId)
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or access denied'
      });
    }

    message.deleteMessage();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get chat statistics
const getChatStatistics = async (req, res) => {
  try {
    const memberId = req.user.id;

    const totalChats = await Chat.countDocuments({
      participants: new mongoose.Types.ObjectId(memberId)
    });

    const activeChats = await Chat.countDocuments({
      participants: new mongoose.Types.ObjectId(memberId),
      status: 'active'
    });

    const totalMessages = await ChatMessage.countDocuments({
      sender: new mongoose.Types.ObjectId(memberId)
    });

    const unreadMessages = await Chat.aggregate([
      { $match: { participants: new mongoose.Types.ObjectId(memberId) } },
      { $unwind: '$unreadCount' },
      { $match: { 'unreadCount.participant': new mongoose.Types.ObjectId(memberId) } },
      { $group: { _id: null, total: { $sum: '$unreadCount.count' } } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Chat statistics retrieved successfully',
      data: {
        totalChats,
        activeChats,
        totalMessages,
        unreadMessages: unreadMessages[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Error getting chat statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createChat,
  getMemberChats,
  getChatDetails,
  sendMessage,
  getChatMessages,
  editMessage,
  deleteMessage,
  getChatStatistics
};
