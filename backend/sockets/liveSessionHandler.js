// Live session handler
// ============================================
// LIVE SESSION SOCKET HANDLER
// ============================================

const LiveSession = require('../models/LiveSession.model');

const liveSessionHandler = (io, socket) => {
  // ============================================
  // JOIN LIVE SESSION
  // ============================================
  socket.on('session:join', async (sessionId) => {
    try {
      const session = await LiveSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:error', { message: 'Session not found' });
      }

      // Check if user is registered
      const isRegistered = session.isUserRegistered(socket.userId);
      const isHost = session.host.toString() === socket.userId;
      const isCoHost = session.coHosts.some(
        (coHost) => coHost.toString() === socket.userId
      );

      if (!isRegistered && !isHost && !isCoHost) {
        return socket.emit('session:error', { message: 'Not registered for this session' });
      }

      // Join session room
      socket.join(`session:${sessionId}`);

      // Track participant
      const participant = session.participants.find(
        (p) => p.user.toString() === socket.userId
      );

      if (participant) {
        participant.joinedAt = new Date();
      }

      await session.save();

      console.log(`User ${socket.user.name} joined session ${sessionId}`);

      // Emit to user
      socket.emit('session:joined', {
        sessionId,
        session: {
          title: session.title,
          host: session.host,
          currentParticipants: session.currentParticipants,
          status: session.status,
        },
      });

      // Notify other participants
      socket.to(`session:${sessionId}`).emit('session:user-joined', {
        sessionId,
        user: {
          id: socket.userId,
          name: socket.user.name,
          profileImage: socket.user.profileImage,
        },
      });

      // Send current participant count
      const participantCount = io.sockets.adapter.rooms.get(`session:${sessionId}`)?.size || 0;
      io.to(`session:${sessionId}`).emit('session:participant-count', {
        sessionId,
        count: participantCount,
      });
    } catch (error) {
      console.error('Join session error:', error);
      socket.emit('session:error', { message: 'Failed to join session' });
    }
  });

  // ============================================
  // LEAVE LIVE SESSION
  // ============================================
  socket.on('session:leave', async (sessionId) => {
    try {
      socket.leave(`session:${sessionId}`);

      const session = await LiveSession.findById(sessionId);

      if (session) {
        const participant = session.participants.find(
          (p) => p.user.toString() === socket.userId
        );

        if (participant) {
          participant.leftAt = new Date();
          
          // Calculate time spent
          if (participant.joinedAt) {
            const timeSpent = Math.round(
              (participant.leftAt - participant.joinedAt) / 60000
            ); // minutes
            participant.timeSpent = (participant.timeSpent || 0) + timeSpent;
          }
        }

        await session.save();
      }

      // Notify other participants
      socket.to(`session:${sessionId}`).emit('session:user-left', {
        sessionId,
        userId: socket.userId,
      });

      // Update participant count
      const participantCount = io.sockets.adapter.rooms.get(`session:${sessionId}`)?.size || 0;
      io.to(`session:${sessionId}`).emit('session:participant-count', {
        sessionId,
        count: participantCount,
      });

      console.log(`User ${socket.user.name} left session ${sessionId}`);
    } catch (error) {
      console.error('Leave session error:', error);
    }
  });

  // ============================================
  // SEND CHAT MESSAGE IN SESSION
  // ============================================
  socket.on('session:chat', async (data) => {
    try {
      const { sessionId, message } = data;

      // Broadcast to all participants
      io.to(`session:${sessionId}`).emit('session:chat', {
        sessionId,
        user: {
          id: socket.userId,
          name: socket.user.name,
          profileImage: socket.user.profileImage,
        },
        message,
        timestamp: new Date(),
      });

      // Optionally save to database
      const session = await LiveSession.findById(sessionId);
      if (session) {
        session.analytics.chatMessages += 1;
        await session.save();
      }
    } catch (error) {
      console.error('Session chat error:', error);
    }
  });

  // ============================================
  // RAISE HAND
  // ============================================
  socket.on('session:raise-hand', (sessionId) => {
    io.to(`session:${sessionId}`).emit('session:hand-raised', {
      sessionId,
      user: {
        id: socket.userId,
        name: socket.user.name,
        profileImage: socket.user.profileImage,
      },
    });
  });

  socket.on('session:lower-hand', (sessionId) => {
    io.to(`session:${sessionId}`).emit('session:hand-lowered', {
      sessionId,
      userId: socket.userId,
    });
  });

  // ============================================
  // ASK QUESTION
  // ============================================
  socket.on('session:question', async (data) => {
    try {
      const { sessionId, question } = data;

      const session = await LiveSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:error', { message: 'Session not found' });
      }

      session.questions.push({
        user: socket.userId,
        question,
      });

      await session.save();

      // Notify all participants (especially host)
      io.to(`session:${sessionId}`).emit('session:new-question', {
        sessionId,
        questionId: session.questions[session.questions.length - 1]._id,
        user: {
          id: socket.userId,
          name: socket.user.name,
        },
        question,
      });
    } catch (error) {
      console.error('Session question error:', error);
      socket.emit('session:error', { message: 'Failed to submit question' });
    }
  });

  // ============================================
  // ANSWER QUESTION (Host/CoHost)
  // ============================================
  socket.on('session:answer-question', async (data) => {
    try {
      const { sessionId, questionId, answer } = data;

      const session = await LiveSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:error', { message: 'Session not found' });
      }

      const question = session.questions.id(questionId);

      if (!question) {
        return socket.emit('session:error', { message: 'Question not found' });
      }

      question.answer = answer;
      question.answeredBy = socket.userId;
      question.answeredAt = new Date();

      await session.save();

      // Notify all participants
      io.to(`session:${sessionId}`).emit('session:question-answered', {
        sessionId,
        questionId,
        answer,
        answeredBy: socket.user.name,
      });
    } catch (error) {
      console.error('Answer question error:', error);
      socket.emit('session:error', { message: 'Failed to answer question' });
    }
  });

  // ============================================
  // CREATE POLL (Host/CoHost)
  // ============================================
  socket.on('session:create-poll', async (data) => {
    try {
      const { sessionId, question, options } = data;

      const session = await LiveSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:error', { message: 'Session not found' });
      }

      const poll = {
        question,
        options: options.map((text) => ({ text, votes: 0, voters: [] })),
      };

      session.polls.push(poll);
      await session.save();

      // Notify all participants
      io.to(`session:${sessionId}`).emit('session:new-poll', {
        sessionId,
        pollId: session.polls[session.polls.length - 1]._id,
        poll,
      });
    } catch (error) {
      console.error('Create poll error:', error);
      socket.emit('session:error', { message: 'Failed to create poll' });
    }
  });

  // ============================================
  // VOTE ON POLL
  // ============================================
  socket.on('session:vote', async (data) => {
    try {
      const { sessionId, pollId, optionIndex } = data;

      const session = await LiveSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:error', { message: 'Session not found' });
      }

      const poll = session.polls.id(pollId);

      if (!poll) {
        return socket.emit('session:error', { message: 'Poll not found' });
      }

      // Check if already voted
      const hasVoted = poll.options.some((option) =>
        option.voters.includes(socket.userId)
      );

      if (hasVoted) {
        return socket.emit('session:error', { message: 'Already voted' });
      }

      poll.options[optionIndex].votes += 1;
      poll.options[optionIndex].voters.push(socket.userId);

      await session.save();

      // Send updated poll results to all
      io.to(`session:${sessionId}`).emit('session:poll-updated', {
        sessionId,
        pollId,
        results: poll.options.map((opt) => ({
          text: opt.text,
          votes: opt.votes,
        })),
      });
    } catch (error) {
      console.error('Vote on poll error:', error);
      socket.emit('session:error', { message: 'Failed to vote' });
    }
  });

  // ============================================
  // SCREEN SHARE
  // ============================================
  socket.on('session:start-screen-share', (sessionId) => {
    socket.to(`session:${sessionId}`).emit('session:screen-share-started', {
      sessionId,
      userId: socket.userId,
      userName: socket.user.name,
    });
  });

  socket.on('session:stop-screen-share', (sessionId) => {
    socket.to(`session:${sessionId}`).emit('session:screen-share-stopped', {
      sessionId,
      userId: socket.userId,
    });
  });

  // ============================================
  // RECORDING
  // ============================================
  socket.on('session:start-recording', async (sessionId) => {
    try {
      const session = await LiveSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:error', { message: 'Session not found' });
      }

      session.recording.isRecorded = true;
      await session.save();

      io.to(`session:${sessionId}`).emit('session:recording-started', {
        sessionId,
      });
    } catch (error) {
      console.error('Start recording error:', error);
      socket.emit('session:error', { message: 'Failed to start recording' });
    }
  });

  socket.on('session:stop-recording', async (sessionId) => {
    try {
      io.to(`session:${sessionId}`).emit('session:recording-stopped', {
        sessionId,
      });
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  });
};

module.exports = liveSessionHandler;