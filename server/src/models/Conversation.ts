import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  projectId: mongoose.Types.ObjectId;
  briefId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[]; // Array of User IDs [brandUserId, creatorUserId]
  lastMessageText?: string;
  lastMessageAt?: Date;
  unreadCountBrand: number;
  unreadCountCreator: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    briefId: { type: Schema.Types.ObjectId, ref: 'CampaignBrief', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageText: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCountBrand: { type: Number, default: 0 },
    unreadCountCreator: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
