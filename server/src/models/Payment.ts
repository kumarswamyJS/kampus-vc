import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'created' | 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';

export interface IPayment extends Document {
  internalPaymentId: string;
  projectId: mongoose.Types.ObjectId;
  milestoneId: mongoose.Types.ObjectId;
  payerUserId: mongoose.Types.ObjectId;
  payeeUserId: mongoose.Types.ObjectId;
  amountMinorUnits: number; // Integer minor units (e.g. INR paise)
  amount: number; // Major unit (e.g. INR)
  currency: string;
  platformFeeAmount: number;
  netCreatorAmount: number;
  provider: 'razorpay' | 'stripe' | 'sandbox';
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  idempotencyKey: string;
  status: PaymentStatus;
  isSimulation: boolean;
  verifiedAt?: Date;
  refundedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    internalPaymentId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId, required: true, index: true },
    payerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    payeeUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountMinorUnits: { type: Number, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    platformFeeAmount: { type: Number, default: 0 },
    netCreatorAmount: { type: Number, required: true },
    provider: { type: String, enum: ['razorpay', 'stripe', 'sandbox'], default: 'razorpay' },
    providerOrderId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    providerSignature: { type: String },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['created', 'pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
      default: 'created',
      index: true,
    },
    isSimulation: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    refundedAt: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
