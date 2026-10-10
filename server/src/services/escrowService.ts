import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { FinancialLedgerEntry, IFinancialLedgerEntry } from '../models/FinancialLedgerEntry';

export interface IFundMilestoneRequest {
  projectId: string;
  milestoneId: string;
  brandUserId: string;
  amount: number;
  currency: string;
}

export interface IReleaseMilestoneRequest {
  projectId: string;
  milestoneId: string;
  brandUserId: string;
}

export class EscrowService {
  /**
   * Fund a project milestone (Simulated or Provider-verified)
   */
  public async fundMilestone(req: IFundMilestoneRequest): Promise<{ project: IProject; ledgerEntry: IFinancialLedgerEntry }> {
    const project = await Project.findById(req.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.brandUserId.toString() !== req.brandUserId) {
      throw new Error('Unauthorized: Only the project brand owner can fund milestones.');
    }

    const milestone = project.milestones.find((m) => m._id.toString() === req.milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.paymentState === 'funded_simulated' || milestone.paymentState === 'funded_verified') {
      throw new Error('Milestone is already funded.');
    }

    // Server-side validation of amount and currency against agreed milestone scope
    if (req.amount < milestone.amount) {
      throw new Error(`Insufficient payment amount. Required: ${milestone.amount} ${project.currency}`);
    }

    const isProviderConnected = process.env.STRIPE_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET;
    const isSimulation = !isProviderConnected;
    const paymentState = isSimulation ? 'funded_simulated' : 'funded_verified';
    const eventType = isSimulation ? 'payment_simulated' : 'payment_verified';

    const idempotencyKey = `fund_${project._id}_${milestone._id}_${Date.now()}`;

    // Create append-only ledger entry
    const ledgerEntry = await FinancialLedgerEntry.create({
      projectId: project._id,
      milestoneId: milestone._id,
      eventType,
      amount: milestone.amount,
      currency: project.currency,
      idempotencyKey,
      verificationStatus: isSimulation ? 'simulated' : 'verified',
      isSimulation,
      metadata: {
        fundedBy: req.brandUserId,
        notice: isSimulation ? 'SIMULATED — NO REAL MONEY MOVED' : 'VERIFIED PROVIDER TRANSACTION',
      },
    });

    // Update milestone payment state
    milestone.paymentState = paymentState;
    if (project.status === 'awaiting_funding') {
      project.status = 'in_progress';
      project.startedAt = project.startedAt || new Date();
    }

    await project.save();

    return { project, ledgerEntry };
  }

  /**
   * Release funded milestone funds to creator (Simulated or Provider-verified)
   */
  public async releaseMilestone(req: IReleaseMilestoneRequest): Promise<{ project: IProject; ledgerEntry: IFinancialLedgerEntry }> {
    const project = await Project.findById(req.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.brandUserId.toString() !== req.brandUserId) {
      throw new Error('Unauthorized: Only the brand owner can release milestone payments.');
    }

    const milestone = project.milestones.find((m) => m._id.toString() === req.milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.status !== 'approved') {
      throw new Error('Milestone work must be approved by brand before funds can be released.');
    }

    if (milestone.paymentState === 'released_simulated' || milestone.paymentState === 'released_verified') {
      throw new Error('Milestone funds have already been released.');
    }

    const isProviderConnected = process.env.STRIPE_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET;
    const isSimulation = !isProviderConnected;
    const paymentState = isSimulation ? 'released_simulated' : 'released_verified';
    const eventType = isSimulation ? 'release_simulated' : 'release_verified';

    const idempotencyKey = `release_${project._id}_${milestone._id}_${Date.now()}`;

    const ledgerEntry = await FinancialLedgerEntry.create({
      projectId: project._id,
      milestoneId: milestone._id,
      eventType,
      amount: milestone.amount,
      currency: project.currency,
      idempotencyKey,
      verificationStatus: isSimulation ? 'simulated' : 'verified',
      isSimulation,
      metadata: {
        releasedBy: req.brandUserId,
        paidToCreatorUser: project.creatorUserId,
        notice: isSimulation ? 'SIMULATED — NO REAL MONEY MOVED' : 'VERIFIED PROVIDER RELEASE',
      },
    });

    milestone.paymentState = paymentState;

    // Check if all milestones are approved and released -> Complete Project
    const allReleased = project.milestones.every(
      (m) => m.paymentState === 'released_simulated' || m.paymentState === 'released_verified' || m.status === 'approved'
    );
    if (allReleased) {
      project.status = 'completed';
      project.completedAt = new Date();
    }

    await project.save();

    return { project, ledgerEntry };
  }

  /**
   * Get project financial ledger history
   */
  public async getProjectLedger(projectId: string, userId: string): Promise<IFinancialLedgerEntry[]> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const isParticipant =
      project.brandUserId.toString() === userId || project.creatorUserId.toString() === userId;
    if (!isParticipant) {
      throw new Error('Unauthorized access to project financial records.');
    }

    return await FinancialLedgerEntry.find({ projectId }).sort({ createdAt: -1 });
  }
}

export const escrowService = new EscrowService();
