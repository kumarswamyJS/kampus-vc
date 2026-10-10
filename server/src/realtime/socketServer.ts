import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/token';
import { User, IUser } from '../models/User';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { CallSession } from '../models/CallSession';
import { env } from '../config/env';

export interface AuthenticatedSocket extends Socket {
  user?: IUser;
}

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts.shift()!.trim();
      const val = parts.join('=').trim();
      list[name] = decodeURIComponent(val);
    }
  });
  return list;
}

export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      let token: string | undefined = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookieHeader(socket.handshake.headers.cookie);
        token = cookies.kampus_auth_token;
      }

      if (!token) {
        return next(new Error('UNAUTHORIZED: No authentication token provided'));
      }

      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error('UNAUTHORIZED: Invalid or expired token'));
      }

      const user = await User.findById(payload.userId);
      if (!user || user.status === 'suspended') {
        return next(new Error('UNAUTHORIZED: User not active'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('UNAUTHORIZED: Socket authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user!._id.toString();
    console.log(`⚡ Socket connected: User ${userId} (${socket.user!.displayName}) [SocketID: ${socket.id}]`);

    // Join personal user notification room
    socket.join(`user_${userId}`);

    // Join Conversation Room (With Authorization Check)
    socket.on('join_conversation', async (conversationId: string, ack?: (res: any) => void) => {
      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          if (ack) ack({ success: false, error: 'Conversation not found' });
          return;
        }

        const isParticipant = conv.participants.some((p) => p.toString() === userId);
        if (!isParticipant) {
          if (ack) ack({ success: false, error: 'Unauthorized to join conversation' });
          return;
        }

        socket.join(conversationId);
        if (ack) ack({ success: true, room: conversationId });
      } catch (err) {
        if (ack) ack({ success: false, error: 'Failed to join conversation room' });
      }
    });

    // Send Real-Time Persisted Message
    socket.on('send_message', async (data: { conversationId: string; text: string; attachmentUrl?: string }, ack?: (res: any) => void) => {
      try {
        const { conversationId, text, attachmentUrl } = data;
        if (!text || !text.trim()) {
          if (ack) ack({ success: false, error: 'Message text is empty' });
          return;
        }

        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          if (ack) ack({ success: false, error: 'Conversation not found' });
          return;
        }

        const isParticipant = conv.participants.some((p) => p.toString() === userId);
        if (!isParticipant) {
          if (ack) ack({ success: false, error: 'Unauthorized' });
          return;
        }

        const recipientUserId = conv.participants.find((p) => p.toString() !== userId);
        if (!recipientUserId) {
          if (ack) ack({ success: false, error: 'Recipient not found' });
          return;
        }

        // Persist message to DB
        const message = await Message.create({
          conversationId: conv._id,
          projectId: conv.projectId,
          senderUserId: userId,
          recipientUserId,
          text: text.trim(),
          attachmentUrl,
        });

        // Update conversation metadata
        conv.lastMessageText = text.trim();
        conv.lastMessageAt = new Date();
        await conv.save();

        // Emit real-time message event to conversation room
        io.to(conversationId).emit('new_message', {
          message,
          conversationId,
        });

        // Notify recipient personal room
        io.to(`user_${recipientUserId.toString()}`).emit('notification', {
          title: 'New Project Message',
          message: `${socket.user!.displayName}: "${text.trim().substring(0, 50)}..."`,
          linkUrl: `/messages?project=${conv.projectId}`,
        });

        if (ack) ack({ success: true, message });
      } catch (err: any) {
        if (ack) ack({ success: false, error: err.message });
      }
    });

    // Ephemeral Typing Indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(conversationId).emit('user_typing', { userId, conversationId });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(conversationId).emit('user_stopped_typing', { userId, conversationId });
    });

    // WebRTC Audio/Video Call Signaling Handlers
    socket.on('call_initiate', async (data: { conversationId: string; callType: 'audio' | 'video' }, ack?: (res: any) => void) => {
      try {
        const { conversationId, callType } = data;
        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          if (ack) ack({ success: false, error: 'Conversation not found' });
          return;
        }

        const calleeUserId = conv.participants.find((p) => p.toString() !== userId);
        if (!calleeUserId) {
          if (ack) ack({ success: false, error: 'Recipient not found' });
          return;
        }

        const callId = `call_${conv._id}_${Date.now()}`;
        const session = await CallSession.create({
          callId,
          projectId: conv.projectId,
          conversationId: conv._id,
          callerUserId: userId,
          calleeUserId,
          callType: callType || 'video',
          status: 'ringing',
        });

        // Emit incoming call to callee user room
        io.to(`user_${calleeUserId.toString()}`).emit('incoming_call', {
          callId,
          conversationId: conv._id,
          projectId: conv.projectId,
          caller: {
            userId,
            displayName: socket.user!.displayName,
            avatarUrl: socket.user!.avatarUrl,
          },
          callType: callType || 'video',
        });

        if (ack) ack({ success: true, callId, session });
      } catch (err: any) {
        if (ack) ack({ success: false, error: err.message });
      }
    });

    socket.on('call_accept', async (data: { callId: string }) => {
      const session = await CallSession.findOne({ callId: data.callId });
      if (session) {
        session.status = 'connecting';
        session.connectedAt = new Date();
        await session.save();

        io.to(`user_${session.callerUserId.toString()}`).emit('call_accepted', {
          callId: data.callId,
          calleeUserId: userId,
        });
      }
    });

    socket.on('call_decline', async (data: { callId: string }) => {
      const session = await CallSession.findOne({ callId: data.callId });
      if (session) {
        session.status = 'declined';
        session.endedAt = new Date();
        await session.save();

        io.to(`user_${session.callerUserId.toString()}`).emit('call_declined', {
          callId: data.callId,
        });
      }
    });

    socket.on('call_cancel', async (data: { callId: string }) => {
      const session = await CallSession.findOne({ callId: data.callId });
      if (session) {
        session.status = 'missed';
        session.endedAt = new Date();
        await session.save();

        io.to(`user_${session.calleeUserId.toString()}`).emit('call_cancelled', {
          callId: data.callId,
        });
      }
    });

    // WebRTC Offer, Answer & ICE Candidate Peer Transport
    socket.on('webrtc_offer', (data: { callId: string; offer: any; targetUserId: string }) => {
      io.to(`user_${data.targetUserId}`).emit('webrtc_offer', {
        callId: data.callId,
        offer: data.offer,
        senderUserId: userId,
      });
    });

    socket.on('webrtc_answer', (data: { callId: string; answer: any; targetUserId: string }) => {
      io.to(`user_${data.targetUserId}`).emit('webrtc_answer', {
        callId: data.callId,
        answer: data.answer,
        senderUserId: userId,
      });
    });

    socket.on('webrtc_ice_candidate', (data: { callId: string; candidate: any; targetUserId: string }) => {
      io.to(`user_${data.targetUserId}`).emit('webrtc_ice_candidate', {
        callId: data.callId,
        candidate: data.candidate,
        senderUserId: userId,
      });
    });

    socket.on('call_end', async (data: { callId: string }) => {
      const session = await CallSession.findOne({ callId: data.callId });
      if (session) {
        session.status = 'ended';
        session.endedAt = new Date();
        if (session.connectedAt) {
          session.durationSeconds = Math.round((session.endedAt.getTime() - session.connectedAt.getTime()) / 1000);
        }
        await session.save();

        const peerUserId = session.callerUserId.toString() === userId ? session.calleeUserId.toString() : session.callerUserId.toString();
        io.to(`user_${peerUserId}`).emit('call_ended', { callId: data.callId });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ${userId}`);
    });
  });

  return io;
};
