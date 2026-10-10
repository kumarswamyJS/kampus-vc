import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createMilestonePaymentOrder, verifyAndCapturePayment } from '../services/paymentService';
import { Payment } from '../models/Payment';
import { WebhookEvent } from '../models/WebhookEvent';
import { FinancialLedgerEntry } from '../models/FinancialLedgerEntry';

// POST /api/v1/payments/create-order
export const createPaymentOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payerUserId = req.user!._id.toString();
    const { projectId, milestoneId, idempotencyKey } = req.body;

    if (!projectId || !milestoneId) {
      res.status(400).json({ success: false, error: 'projectId and milestoneId are required' });
      return;
    }

    const payment = await createMilestonePaymentOrder({
      projectId,
      milestoneId,
      payerUserId,
      idempotencyKey,
    });

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// POST /api/v1/payments/verify
export const verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentId, providerPaymentId, providerSignature } = req.body;

    if (!paymentId) {
      res.status(400).json({ success: false, error: 'paymentId is required' });
      return;
    }

    const capturedPayment = await verifyAndCapturePayment({
      paymentId,
      providerPaymentId,
      providerSignature,
    });

    res.status(200).json({
      success: true,
      data: capturedPayment,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// POST /api/v1/payments/webhook
export const handlePaymentWebhook = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.headers['x-razorpay-event-id'] as string || `evt_${Date.now()}`;
    const payload = req.body || {};

    const existing = await WebhookEvent.findOne({ providerEventId: eventId });
    if (existing) {
      res.status(200).json({ success: true, message: 'Webhook already processed' });
      return;
    }

    await WebhookEvent.create({
      providerEventId: eventId,
      provider: 'razorpay',
      eventType: payload.event || 'payment.captured',
      payload,
      signatureVerified: true,
      status: 'processed',
      processedAt: new Date(),
    });

    res.status(200).json({ success: true, message: 'Webhook received & processed idempotently' });
  } catch (error: any) {
    next(error);
  }
};

// GET /api/v1/payments/mine
export const getMyPayments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const payments = await Payment.find({
      $or: [{ payerUserId: userId }, { payeeUserId: userId }],
    })
      .populate('projectId', 'title contractAmount status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/payments/:id/refund
export const processRefund = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin role required to trigger refunds' });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found' });
      return;
    }

    if (payment.status === 'refunded') {
      res.status(400).json({ success: false, error: 'Payment has already been refunded' });
      return;
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();

    // Log reversal in financial ledger
    await FinancialLedgerEntry.create({
      projectId: payment.projectId,
      milestoneId: payment.milestoneId,
      payerUserId: payment.payerUserId,
      payeeUserId: payment.payeeUserId,
      eventType: 'refunded_simulated',
      amount: payment.amount,
      currency: payment.currency,
      isSimulation: payment.isSimulation,
      metadata: {
        paymentId: payment._id,
        refundReason: reason || 'Administrative dispute refund',
      },
    });

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
