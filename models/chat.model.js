const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Chat identification
  chatId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  }],
  
  // Chat type
  chatType: {
    type: String,
    enum: ['member_to_admin', 'member_to_member', 'group', 'support'],
    default: 'member_to_admin'
  },
  
  // Chat subject/title
  subject: {
    type: String,
    required: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  // Chat status
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Category
  category: {
    type: String,
    enum: ['general', 'loan_inquiry', 'payment_issue', 'technical_support', 'complaint', 'suggestion'],
    default: 'general'
  },
  
  // Last message info
  lastMessage: {
    content: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocietyMember'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Message count
  messageCount: {
    type: Number,
    default: 0
  },
  
  // Unread count for each participant
  unreadCount: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocietyMember'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ chatId: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ status: 1, createdAt: -1 });
chatSchema.index({ chatType: 1 });

// Pre-save middleware to generate chat ID
chatSchema.pre('save', async function(next) {
  if (!this.chatId) {
    try {
      const count = await this.constructor.countDocuments();
      const timestamp = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(3, '0');
      this.chatId = `CHAT${timestamp}${month}${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to add participant
chatSchema.methods.addParticipant = function(participantId) {
  if (!this.participants.includes(participantId)) {
    this.participants.push(participantId);
    this.unreadCount.push({
      participant: participantId,
      count: 0
    });
  }
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(participantId) {
  this.participants = this.participants.filter(p => !p.equals(participantId));
  this.unreadCount = this.unreadCount.filter(u => !u.participant.equals(participantId));
};

// Method to update unread count
chatSchema.methods.updateUnreadCount = function(participantId, increment = true) {
  const unread = this.unreadCount.find(u => u.participant.equals(participantId));
  if (unread) {
    unread.count = increment ? unread.count + 1 : 0;
  }
};

// Method to mark as read
chatSchema.methods.markAsRead = function(participantId) {
  this.updateUnreadCount(participantId, false);
};

// Static method to get chats by participant
chatSchema.statics.getChatsByParticipant = function(participantId, options = {}) {
  const query = { participants: participantId };
  
  if (options.status) query.status = options.status;
  if (options.chatType) query.chatType = options.chatType;
  if (options.category) query.category = options.category;
  
  return this.find(query)
    .populate('participants', 'firstName lastName memberId email')
    .populate('lastMessage.sentBy', 'firstName lastName memberId')
    .populate('createdBy', 'firstName lastName memberId')
    .sort({ updatedAt: -1 });
};

// Static method to get chat statistics
chatSchema.statics.getChatStatistics = function(options = {}) {
  const matchStage = {};
  
  if (options.startDate && options.endDate) {
    matchStage.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          status: '$status',
          chatType: '$chatType',
          category: '$category'
        },
        count: { $sum: 1 },
        totalMessages: { $sum: '$messageCount' }
      }
    },
    {
      $group: {
        _id: null,
        statusBreakdown: {
          $push: {
            status: '$_id.status',
            chatType: '$_id.chatType',
            category: '$_id.category',
            count: '$count',
            totalMessages: '$totalMessages'
          }
        },
        totalChats: { $sum: '$count' },
        totalMessages: { $sum: '$totalMessages' }
      }
    }
  ]);
};

module.exports = mongoose.model('Chat', chatSchema);
