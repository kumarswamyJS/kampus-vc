import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookEvent extends Document {
  providerEventId: string;
  provider: 'razorpay' | 'stripe' | 'sandbox';
  eventType: string;
  payload: Record<string, any>;
  signatureVerified: boolean;
  status: 'received' | 'processed' | 'failed' | 'ignored';
  errorDetails?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    providerEventId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, enum: ['razorpay', 'stripe', 'sandbox'], default: 'razorpay' },
    eventType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    signatureVerified: { type: Boolean, default: true },
    status: { type: String, enum: ['received', 'processed', 'failed', 'ignored'], default: 'received', index: true },
    errorDetails: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const WebhookEvent = mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
