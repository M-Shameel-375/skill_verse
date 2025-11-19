// Notification handler
// ============================================
// NOTIFICATION SOCKET HANDLER
// ============================================

const Notification = require('../models/Notification.model');

const notificationHandler = (io, socket) => {
  // ============================================
  // GET UNREAD COUNT
  // ============================================
  socket.on('notifications:get-count', async () => {
    try {
      const count = await Notification.countUnread(socket.userId);

      socket.emit('notifications:count', { count });
    } catch (error) {
      console.error('Get notification count error:', error);
    }
  });

  // ============================================
  // MARK AS READ
  // ============================================
  socket.on('notifications:mark-read', async (notificationId) => {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return socket.emit('notifications:error', { message: 'Notification not found' });
      }

      if (notification.recipient.toString() !== socket.userId) {
        return socket.emit('notifications:error', { message: 'Not authorized' });
      }

      await notification.markAsRead();

      // Send updated count
      const count = await Notification.countUnread(socket.userId);
      socket.emit('notifications:count', { count });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      socket.emit('notifications:error', { message: 'Failed to mark as read' });
    }
  });

  // ============================================
  // MARK ALL AS READ
  // ============================================
  socket.on('notifications:mark-all-read', async () => {
    try {
      await Notification.markAllAsRead(socket.userId);

      socket.emit('notifications:count', { count: 0 });
      socket.emit('notifications:all-read');
    } catch (error) {
      console.error('Mark all as read error:', error);
      socket.emit('notifications:error', { message: 'Failed to mark all as read' });
    }
  });

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  socket.on('notifications:delete', async (notificationId) => {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return socket.emit('notifications:error', { message: 'Notification not found' });
      }

      if (notification.recipient.toString() !== socket.userId) {
        return socket.emit('notifications:error', { message: 'Not authorized' });
      }

      await notification.softDelete();

      socket.emit('notifications:deleted', { notificationId });

      // Send updated count
      const count = await Notification.countUnread(socket.userId);
      socket.emit('notifications:count', { count });
    } catch (error) {
      console.error('Delete notification error:', error);
      socket.emit('notifications:error', { message: 'Failed to delete notification' });
    }
  });
};

module.exports = notificationHandler;