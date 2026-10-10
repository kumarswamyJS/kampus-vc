import crypto from 'crypto';
import mongoose from 'mongoose';
import { Payment, IPayment } from '../models/Payment';
import { Project } from '../models/Project';
import { FinancialLedgerEntry } from '../models/FinancialLedgerEntry';
import { CreatorPayout } from '../models/CreatorPayout';
import { env } from '../config/env';

export interface CreateOrderParams {
  projectId: string;
  milestoneId: string;
  payerUserId: string;
  idempotencyKey?: string;
}

export const createMilestonePaymentOrder = async (params: CreateOrderParams) => {
  const { projectId, milestoneId, payerUserId, idempotencyKey } = params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  if (project.brandUserId.toString() !== payerUserId) {
    throw new Error('Forbidden: Only project brand owner can fund milestones');
  }

  const milestone = project.milestones?.find((m) => m._id.toString() === milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.paymentState === 'funded_verified' || milestone.paymentState === 'released_verified') {
    throw new Error('Milestone has already been funded');
  }

  const safeIdempotencyKey = idempotencyKey || `idemp_${projectId}_${milestoneId}_${Date.now()}`;

  // Check for existing payment by idempotency key
  let existingPayment = await Payment.findOne({ idempotencyKey: safeIdempotencyKey });
  if (existingPayment) {
    return existingPayment;
  }

  const amountMajor = milestone.amount;
  const amountMinorUnits = Math.round(amountMajor * 100);
  const platformFeeAmount = Math.round(amountMajor * 0.1); // 10% platform fee
  const netCreatorAmount = amountMajor - platformFeeAmount;

  const internalPaymentId = `pay_${projectId}_${milestoneId}_${Date.now()}`;
  const provider = env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET ? 'razorpay' : 'sandbox';
  const providerOrderId = `order_${provider}_${Date.now()}`;

  const payment = await Payment.create({
    internalPaymentId,
    projectId: project._id,
    milestoneId: milestone._id,
    payerUserId: new mongoose.Types.ObjectId(payerUserId),
    payeeUserId: project.creatorUserId,
    amountMinorUnits,
    amount: amountMajor,
    currency: project.currency || 'INR',
    platformFeeAmount,
    netCreatorAmount,
    provider,
    providerOrderId,
    idempotencyKey: safeIdempotencyKey,
    status: 'created',
    isSimulation: provider === 'sandbox',
  });

  return payment;
};

export const verifyAndCapturePayment = async (params: {
  paymentId: string;
  providerPaymentId?: string;
  providerSignature?: string;
}) => {
  const { paymentId, providerPaymentId, providerSignature } = params;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment record not found');
  }

  if (payment.status === 'captured') {
    return payment; // Already captured idempotently
  }

  // Razorpay Signature Verification if credentials exist
  if (payment.provider === 'razorpay' && env.RAZORPAY_KEY_SECRET && providerSignature && payment.providerOrderId) {
    const body = `${payment.providerOrderId}|${providerPaymentId}`;
    const expectedSignature = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSignature !== providerSignature) {
      payment.status = 'failed';
      payment.failureReason = 'Invalid provider signature verification';
      await payment.save();
      throw new Error('Invalid payment signature verification');
    }
  }

  // Update payment status to captured
  payment.status = 'captured';
  payment.providerPaymentId = providerPaymentId || `pay_captured_${Date.now()}`;
  payment.providerSignature = providerSignature;
  payment.verifiedAt = new Date();
  await payment.save();

  // Update project milestone payment state
  const project = await Project.findById(payment.projectId);
  if (project && project.milestones) {
    const milestone = project.milestones.find((m) => m._id.toString() === payment.milestoneId.toString());
    if (milestone) {
      milestone.paymentState = payment.isSimulation ? 'funded_simulated' : 'funded_verified';
      await project.save();
    }
  }

  // Append verified immutable financial ledger entry
  await FinancialLedgerEntry.create({
    projectId: payment.projectId,
    milestoneId: payment.milestoneId,
    payerUserId: payment.payerUserId,
    payeeUserId: payment.payeeUserId,
    eventType: payment.isSimulation ? 'funded_simulated' : 'funded_verified',
    amount: payment.amount,
    currency: payment.currency,
    isSimulation: payment.isSimulation,
    metadata: {
      internalPaymentId: payment.internalPaymentId,
      providerPaymentId: payment.providerPaymentId,
      platformFeeAmount: payment.platformFeeAmount,
      netCreatorAmount: payment.netCreatorAmount,
    },
  });

  // Create pending creator payout record
  await CreatorPayout.create({
    payoutId: `payout_${payment._id}_${Date.now()}`,
    projectId: payment.projectId,
    milestoneId: payment.milestoneId,
    creatorUserId: payment.payeeUserId,
    amount: payment.netCreatorAmount,
    currency: payment.currency,
    status: 'pending',
  });

  return payment;
};
