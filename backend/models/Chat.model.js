// Chat model
// ============================================
// CHAT/MESSAGE MODEL
// ============================================

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    // ============================================
    // CONVERSATION TYPE
    // ============================================
    conversationType: {
      type: String,
      enum: ['direct', 'group', 'support', 'course', 'session'],
      default: 'direct',
    },

    // ============================================
    // PARTICIPANTS
    // ============================================
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['member', 'admin', 'moderator'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
        lastReadAt: Date,
        mutedUntil: Date,
      },
    ],

    // ============================================
    // GROUP CHAT DETAILS (IF APPLICABLE)
    // ============================================
    groupDetails: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Group name cannot exceed 100 characters'],
      },
      description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
      },
      avatar: {
        url: String,
        publicId: String,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // ============================================
    // RELATED ENTITIES (FOR CONTEXT)
    // ============================================
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['course', 'live-session', 'skill-exchange'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },

    // ============================================
    // MESSAGES
    // ============================================
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },

        messageType: {
          type: String,
          enum: ['text', 'image', 'video', 'audio', 'file', 'link', 'system'],
          default: 'text',
        },

        content: {
          text: String,
          file: {
            url: String,
            publicId: String,
            fileName: String,
            fileType: String,
            fileSize: Number,
          },
          link: {
            url: String,
            title: String,
            description: String,
            thumbnail: String,
          },
        },

        // ============================================
        // MESSAGE METADATA
        // ============================================
        readBy: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            readAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],

        deliveredTo: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            deliveredAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],

        // ============================================
        // MESSAGE STATUS
        // ============================================
        status: {
          type: String,
          enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
          default: 'sent',
        },

        isEdited: {
          type: Boolean,
          default: false,
        },

        editedAt: Date,

        isDeleted: {
          type: Boolean,
          default: false,
        },

        deletedAt: Date,

        deletedFor: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],

        // ============================================
        // REACTIONS
        // ============================================
        reactions: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            emoji: String,
            reactedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],

        // ============================================
        // REPLY/THREAD
        // ============================================
        replyTo: {
          type: mongoose.Schema.Types.ObjectId,
        },

        // ============================================
        // MENTIONS
        // ============================================
        mentions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],

        // ============================================
        // TIMESTAMP
        // ============================================
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // CHAT SETTINGS
    // ============================================
    settings: {
      isEncrypted: {
        type: Boolean,
        default: false,
      },
      allowFileSharing: {
        type: Boolean,
        default: true,
      },
      maxFileSize: {
        type: Number,
        default: 10485760, // 10MB
      },
      autoDeleteAfter: Number, // in days
      requireApproval: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // LAST MESSAGE INFO
    // ============================================
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sentAt: Date,
    },

    // ============================================
    // ACTIVITY TRACKING
    // ============================================
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    // ============================================
    // PINNED MESSAGES
    // ============================================
    pinnedMessages: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
        },
        pinnedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        pinnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // STATUS
    // ============================================
    isActive: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
chatSchema.index({ 'participants.user': 1, lastActivityAt: -1 });
chatSchema.index({ conversationType: 1 });
chatSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });
chatSchema.index({ 'messages.sentAt': -1 });
chatSchema.index({ lastActivityAt: -1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Total messages count
chatSchema.virtual('messagesCount').get(function () {
  return this.messages?.filter((m) => !m.isDeleted).length || 0;
});

// Active participants count
chatSchema.virtual('activeParticipantsCount').get(function () {
  return this.participants?.filter((p) => p.isActive).length || 0;
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Update last activity
chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.lastActivityAt = new Date();

    // Update last message
    const lastMsg = this.messages[this.messages.length - 1];
    if (lastMsg && !lastMsg.isDeleted) {
      this.lastMessage = {
        content: lastMsg.content?.text || 'Media',
        sender: lastMsg.sender,
        sentAt: lastMsg.sentAt,
      };
    }
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Add message
chatSchema.methods.addMessage = async function (senderId, messageData) {
  const message = {
    sender: senderId,
    messageType: messageData.type || 'text',
    content: messageData.content,
    mentions: messageData.mentions || [],
    replyTo: messageData.replyTo,
    sentAt: new Date(),
  };

  this.messages.push(message);
  await this.save();

  return this.messages[this.messages.length - 1];
};

// Get unread count for user
chatSchema.methods.getUnreadCount = function (userId) {
  const participant = this.participants.find(
    (p) => p.user.toString() === userId.toString()
  );

  if (!participant || !participant.lastReadAt) {
    return this.messages.filter((m) => !m.isDeleted).length;
  }

  return this.messages.filter(
    (m) => !m.isDeleted && m.sentAt > participant.lastReadAt
  ).length;
};

// Mark as read for user
chatSchema.methods.markAsRead = async function (userId) {
  const participant = this.participants.find(
    (p) => p.user.toString() === userId.toString()
  );

  if (participant) {
    participant.lastReadAt = new Date();
    await this.save();
  }
};

// Add participant
chatSchema.methods.addParticipant = async function (userId, role = 'member') {
  const exists = this.participants.some(
    (p) => p.user.toString() === userId.toString()
  );

  if (!exists) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
    });
    await this.save();
  }
};

// Remove participant
chatSchema.methods.removeParticipant = async function (userId) {
  const participant = this.participants.find(
    (p) => p.user.toString() === userId.toString()
  );

  if (participant) {
    participant.isActive = false;
    participant.leftAt = new Date();
    await this.save();
  }
};

// Delete message
chatSchema.methods.deleteMessage = async function (messageId, userId, deleteForEveryone = false) {
  const message = this.messages.id(messageId);

  if (!message) {
    throw new Error('Message not found');
  }

  if (deleteForEveryone) {
    message.isDeleted = true;
    message.deletedAt = new Date();
  } else {
    if (!message.deletedFor) {
      message.deletedFor = [];
    }
    message.deletedFor.push(userId);
  }

  await this.save();
};

// Edit message
chatSchema.methods.editMessage = async function (messageId, newContent) {
  const message = this.messages.id(messageId);

  if (!message) {
    throw new Error('Message not found');
  }

  message.content.text = newContent;
  message.isEdited = true;
  message.editedAt = new Date();

  await this.save();
};

// Add reaction
chatSchema.methods.addReaction = async function (messageId, userId, emoji) {
  const message = this.messages.id(messageId);

  if (!message) {
    throw new Error('Message not found');
  }

  // Remove existing reaction from this user
  message.reactions = message.reactions.filter(
    (r) => r.user.toString() !== userId.toString()
  );

  // Add new reaction
  message.reactions.push({
    user: userId,
    emoji: emoji,
  });

  await this.save();
};

// Pin message
chatSchema.methods.pinMessage = async function (messageId, userId) {
  const alreadyPinned = this.pinnedMessages.some(
    (p) => p.message.toString() === messageId.toString()
  );

  if (!alreadyPinned) {
    this.pinnedMessages.push({
      message: messageId,
      pinnedBy: userId,
    });
    await this.save();
  }
};

// Unpin message
chatSchema.methods.unpinMessage = async function (messageId) {
  this.pinnedMessages = this.pinnedMessages.filter(
    (p) => p.message.toString() !== messageId.toString()
  );
  await this.save();
};

// Archive chat for user
chatSchema.methods.archiveForUser = async function (userId) {
  if (!this.archivedBy.includes(userId)) {
    this.archivedBy.push(userId);
    await this.save();
  }
};

// ============================================
// STATIC METHODS
// ============================================

// Get chats for user
chatSchema.statics.getChatsByUser = function (userId, options = {}) {
  const query = {
    'participants.user': userId,
    'participants.isActive': true,
  };

  if (options.conversationType) {
    query.conversationType = options.conversationType;
  }

  return this.find(query)
    .sort({ lastActivityAt: -1 })
    .populate('participants.user', 'name profileImage status')
    .populate('lastMessage.sender', 'name profileImage')
    .limit(options.limit || 50);
};

// Find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function (user1Id, user2Id) {
  let chat = await this.findOne({
    conversationType: 'direct',
    'participants.user': { $all: [user1Id, user2Id] },
    'participants.isActive': true,
  });

  if (!chat) {
    chat = new this({
      conversationType: 'direct',
      participants: [
        { user: user1Id, role: 'member' },
        { user: user2Id, role: 'member' },
      ],
    });
    await chat.save();
  }

  return chat;
};

// Search messages
chatSchema.statics.searchMessages = function (userId, searchTerm) {
  return this.find({
    'participants.user': userId,
    'messages.content.text': { $regex: searchTerm, $options: 'i' },
  });
};

// Get active chats count
chatSchema.statics.getActiveChatsCount = function (userId) {
  return this.countDocuments({
    'participants.user': userId,
    'participants.isActive': true,
    isActive: true,
  });
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Chat', chatSchema);