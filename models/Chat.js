import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  // The users participating in this chat
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  
  // Track unread message count for each participant
  unreadCount: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    }
  }],
  
  // Array of messages in this conversation
  messages: [{
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Optional: Message status (sent, delivered, read)
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
  }],
  
  // Last message timestamp for sorting conversations
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  
  // Optional: Track if conversation is active
  isActive: {
    type: Boolean,
    default: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for efficient queries
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ 'participants': 1, 'lastMessageAt': -1 });

// Virtual to get the last message
ChatSchema.virtual('lastMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Method to add a new message
ChatSchema.methods.addMessage = async function(message, senderId) {
  const newMessage = {
    message: message.trim(),
    senderId: senderId,
    createdAt: new Date(),
    status: 'sent'
  };
  
  this.messages.push(newMessage);
  
  // Update lastMessageAt
  this.lastMessageAt = new Date();
  this.updatedAt = new Date();
  
  // Update unread count for the other participant
  const otherParticipantId = this.participants.find(id => id.toString() !== senderId.toString());
  if (otherParticipantId) {
    let unreadEntry = this.unreadCount.find(entry => entry.userId.toString() === otherParticipantId.toString());
    if (!unreadEntry) {
      this.unreadCount.push({ userId: otherParticipantId, count: 1 });
    } else {
      unreadEntry.count += 1;
    }
  }
  
  const savedChat = await this.save();
  
  // Return the newly added message
  return savedChat.messages[savedChat.messages.length - 1];
};

// Method to mark messages as read for a user
ChatSchema.methods.markAsRead = async function(userId) {
  // Reset unread count for this user
  let unreadEntry = this.unreadCount.find(entry => entry.userId.toString() === userId.toString());
  if (unreadEntry) {
    unreadEntry.count = 0;
  } else {
    this.unreadCount.push({ userId: userId, count: 0 });
  }
  
  // Mark all messages from other users as 'read'
  this.messages.forEach(msg => {
    if (msg.senderId.toString() !== userId.toString() && msg.status === 'sent') {
      msg.status = 'read';
    }
  });
  
  return await this.save();
};

// Static method to find or create a chat between two users
ChatSchema.statics.findOrCreateChat = async function(userId1, userId2) {
  // Sort IDs to ensure consistent ordering
  const sortedIds = [userId1, userId2].sort();
  
  // Try to find existing chat
  let chat = await this.findOne({
    participants: { $all: sortedIds, $size: 2 }
  }).populate('participants', 'firstName lastName name');
  
  // If no chat exists, create one
  if (!chat) {
    chat = new this({
      participants: sortedIds,
      messages: [],
      lastMessageAt: new Date(),
    });
    await chat.save();
    
    // Populate participants after creation
    chat = await this.findById(chat._id).populate('participants', 'firstName lastName name');
  }
  
  return chat;
};

// Static method to get all chats for a user
ChatSchema.statics.getUserChats = async function(userId) {
  return this.find({
    participants: userId,
    isActive: true,
  })
  .populate('participants', 'firstName lastName name')
  .sort({ lastMessageAt: -1 });
};

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);