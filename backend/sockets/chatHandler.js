// Chat handler
// ============================================
// CHAT SOCKET HANDLER
// ============================================

const Chat = require('../models/Chat.model');

const chatHandler = (io, socket) => {
  // ============================================
  // JOIN CHAT ROOM
  // ============================================
  socket.on('chat:join', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('chat:error', { message: 'Chat not found' });
      }

      // Check if user is participant
      const isParticipant = chat.participants.some(
        (p) => p.user.toString() === socket.userId
      );

      if (!isParticipant) {
        return socket.emit('chat:error', { message: 'Not authorized' });
      }

      // Join chat room
      socket.join(`chat:${chatId}`);
      
      console.log(`User ${socket.user.name} joined chat ${chatId}`);

      socket.emit('chat:joined', { chatId });
    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('chat:error', { message: 'Failed to join chat' });
    }
  });

  // ============================================
  // LEAVE CHAT ROOM
  // ============================================
  socket.on('chat:leave', (chatId) => {
    socket.leave(`chat:${chatId}`);
    console.log(`User ${socket.user.name} left chat ${chatId}`);
  });

  // ============================================
  // SEND MESSAGE
  // ============================================
  socket.on('chat:message', async (data) => {
    try {
      const { chatId, message, attachments, replyTo } = data;

      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('chat:error', { message: 'Chat not found' });
      }

      // Add message to chat
      const newMessage = await chat.addMessage(socket.userId, {
        type: 'text',
        content: { text: message, attachments },
        replyTo,
      });

      // Populate sender info
      await chat.populate('messages.sender', 'name profileImage');

      const messageData = {
        chatId,
        message: chat.messages[chat.messages.length - 1],
      };

      // Emit to all participants in the chat room
      io.to(`chat:${chatId}`).emit('chat:message', messageData);

      // Send push notification to offline participants
      const offlineParticipants = chat.participants.filter(
        (p) => p.user.toString() !== socket.userId && !io.isUserOnline(p.user)
      );

      for (const participant of offlineParticipants) {
        // Send notification (would integrate with notification service)
        io.emitToUser(participant.user, 'notification', {
          type: 'new-message',
          data: {
            chatId,
            senderName: socket.user.name,
            message: message.substring(0, 50),
          },
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // ============================================
  // MARK AS READ
  // ============================================
  socket.on('chat:read', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('chat:error', { message: 'Chat not found' });
      }

      await chat.markAsRead(socket.userId);

      // Notify other participants
      socket.to(`chat:${chatId}`).emit('chat:read', {
        chatId,
        userId: socket.userId,
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      socket.emit('chat:error', { message: 'Failed to mark as read' });
    }
  });

  // ============================================
  // TYPING INDICATOR
  // ============================================
  socket.on('chat:typing', (chatId) => {
    socket.to(`chat:${chatId}`).emit('chat:typing', {
      chatId,
      userId: socket.userId,
      userName: socket.user.name,
    });
  });

  socket.on('chat:stop-typing', (chatId) => {
    socket.to(`chat:${chatId}`).emit('chat:stop-typing', {
      chatId,
      userId: socket.userId,
    });
  });

  // ============================================
  // DELETE MESSAGE
  // ============================================
  socket.on('chat:delete-message', async (data) => {
    try {
      const { chatId, messageId, deleteForEveryone } = data;

      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('chat:error', { message: 'Chat not found' });
      }

      await chat.deleteMessage(messageId, socket.userId, deleteForEveryone);

      if (deleteForEveryone) {
        // Notify all participants
        io.to(`chat:${chatId}`).emit('chat:message-deleted', {
          chatId,
          messageId,
        });
      } else {
        // Only notify the user
        socket.emit('chat:message-deleted', {
          chatId,
          messageId,
        });
      }
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('chat:error', { message: 'Failed to delete message' });
    }
  });

  // ============================================
  // EDIT MESSAGE
  // ============================================
  socket.on('chat:edit-message', async (data) => {
    try {
      const { chatId, messageId, newContent } = data;

      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('chat:error', { message: 'Chat not found' });
      }

      await chat.editMessage(messageId, newContent);

      // Notify all participants
      io.to(`chat:${chatId}`).emit('chat:message-edited', {
        chatId,
        messageId,
        newContent,
      });
    } catch (error) {
      console.error('Edit message error:', error);
      socket.emit('chat:error', { message: 'Failed to edit message' });
    }
  });

  // ============================================
  // ADD REACTION
  // ============================================
  socket.on('chat:add-reaction', async (data) => {
    try {
      const { chatId, messageId, emoji } = data;

      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('chat:error', { message: 'Chat not found' });
      }

      await chat.addReaction(messageId, socket.userId, emoji);

      // Notify all participants
      io.to(`chat:${chatId}`).emit('chat:reaction-added', {
        chatId,
        messageId,
        userId: socket.userId,
        emoji,
      });
    } catch (error) {
      console.error('Add reaction error:', error);
      socket.emit('chat:error', { message: 'Failed to add reaction' });
    }
  });

  // ============================================
  // VOICE/VIDEO CALL SIGNALING
  // ============================================
  socket.on('call:initiate', (data) => {
    const { chatId, recipientId, type } = data;

    socket.to(recipientId).emit('call:incoming', {
      chatId,
      callerId: socket.userId,
      callerName: socket.user.name,
      type, // 'voice' or 'video'
    });
  });

  socket.on('call:accept', (data) => {
    const { chatId, callerId } = data;

    socket.to(callerId).emit('call:accepted', {
      chatId,
      accepterId: socket.userId,
    });
  });

  socket.on('call:reject', (data) => {
    const { chatId, callerId } = data;

    socket.to(callerId).emit('call:rejected', {
      chatId,
      rejecterId: socket.userId,
    });
  });

  socket.on('call:end', (data) => {
    const { chatId, recipientId } = data;

    socket.to(recipientId).emit('call:ended', {
      chatId,
      endedBy: socket.userId,
    });
  });

  // WebRTC signaling
  socket.on('call:offer', (data) => {
    socket.to(data.recipientId).emit('call:offer', {
      offer: data.offer,
      senderId: socket.userId,
    });
  });

  socket.on('call:answer', (data) => {
    socket.to(data.recipientId).emit('call:answer', {
      answer: data.answer,
      senderId: socket.userId,
    });
  });

  socket.on('call:ice-candidate', (data) => {
    socket.to(data.recipientId).emit('call:ice-candidate', {
      candidate: data.candidate,
      senderId: socket.userId,
    });
  });
};

module.exports = chatHandler;