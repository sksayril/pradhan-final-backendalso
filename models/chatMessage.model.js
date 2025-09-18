const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  // Message identification
  messageId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Chat reference
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  
  // Sender
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  },
  
  // Message content
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Message content cannot exceed 1000 characters']
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'payment_link', 'emi_reminder'],
    default: 'text'
  },
  
  // File attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocietyMember'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reply to message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  
  // Message metadata
  metadata: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    originalContent: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
chatMessageSchema.index({ messageId: 1 });
chatMessageSchema.index({ chatId: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ status: 1 });

// Pre-save middleware to generate message ID
chatMessageSchema.pre('save', async function(next) {
  if (!this.messageId) {
    try {
      const count = await this.constructor.countDocuments();
      const timestamp = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(3, '0');
      this.messageId = `MSG${timestamp}${month}${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to mark as read
chatMessageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.equals(userId));
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
};

// Method to edit message
chatMessageSchema.methods.editMessage = function(newContent) {
  if (!this.metadata.isEdited) {
    this.metadata.originalContent = this.content;
  }
  this.content = newContent;
  this.metadata.isEdited = true;
  this.metadata.editedAt = new Date();
  this.updatedAt = new Date();
};

// Method to delete message
chatMessageSchema.methods.deleteMessage = function() {
  this.metadata.isDeleted = true;
  this.metadata.deletedAt = new Date();
  this.metadata.originalContent = this.content;
  this.content = 'This message has been deleted';
  this.updatedAt = new Date();
};

// Static method to get messages by chat
chatMessageSchema.statics.getMessagesByChat = function(chatId, options = {}) {
  const query = { 
    chatId: chatId,
    'metadata.isDeleted': false
  };
  
  if (options.sender) query.sender = options.sender;
  if (options.messageType) query.messageType = options.messageType;
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query)
    .populate('sender', 'firstName lastName memberId email')
    .populate('replyTo', 'content sender')
    .populate('replyTo.sender', 'firstName lastName memberId')
    .sort({ createdAt: -1 });
};

// Static method to get unread message count
chatMessageSchema.statics.getUnreadCount = function(chatId, userId) {
  return this.countDocuments({
    chatId: chatId,
    sender: { $ne: userId },
    readBy: { $not: { $elemMatch: { user: userId } } },
    'metadata.isDeleted': false
  });
};

// Static method to mark messages as read
chatMessageSchema.statics.markMessagesAsRead = function(chatId, userId) {
  return this.updateMany(
    {
      chatId: chatId,
      sender: { $ne: userId },
      readBy: { $not: { $elemMatch: { user: userId } } }
    },
    {
      $push: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    }
  );
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
