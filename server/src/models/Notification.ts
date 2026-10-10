import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientUserId: mongoose.Types.ObjectId;
  senderUserId?: mongoose.Types.ObjectId;
  type:
    | 'proposal_received'
    | 'proposal_revision_requested'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'project_created'
    | 'milestone_submitted'
    | 'milestone_revision_requested'
    | 'milestone_approved'
    | 'payment_event'
    | 'new_message';
  title: string;
  message: string;
  linkUrl?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: [
        'proposal_received',
        'proposal_revision_requested',
        'proposal_accepted',
        'proposal_rejected',
        'project_created',
        'milestone_submitted',
        'milestone_revision_requested',
        'milestone_approved',
        'payment_event',
        'new_message',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    linkUrl: { type: String },
    resourceId: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
