import mongoose, { Schema, Document } from 'mongoose';

export interface ICallSession extends Document {
  callId: string;
  projectId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  callerUserId: mongoose.Types.ObjectId;
  calleeUserId: mongoose.Types.ObjectId;
  callType: 'audio' | 'video';
  status: 'initiated' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'declined' | 'missed' | 'busy' | 'failed';
  startedAt?: Date;
  connectedAt?: Date;
  endedAt?: Date;
  durationSeconds: number;
  endReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CallSessionSchema = new Schema<ICallSession>(
  {
    callId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    callerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    calleeUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    callType: { type: String, enum: ['audio', 'video'], default: 'video' },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'connecting', 'connected', 'ended', 'declined', 'missed', 'busy', 'failed'],
      default: 'initiated',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    connectedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    endReason: { type: String },
  },
  {
    timestamps: true,
  }
);

CallSessionSchema.index({ conversationId: 1, createdAt: -1 });

export const CallSession = mongoose.model<ICallSession>('CallSession', CallSessionSchema);
