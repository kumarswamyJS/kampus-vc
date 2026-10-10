import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProofOfCreativity } from '../models/ProofOfCreativity';
import { PortfolioItem } from '../models/PortfolioItem';
import { Creator } from '../models/Creator';

// POST /api/v1/portfolio/:itemId/proof
export const submitProofOfCreativity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { itemId } = req.params;
    const { contributionDescription, projectRole, evidenceType, evidenceUrls } = req.body;

    if (!contributionDescription || !contributionDescription.trim()) {
      res.status(400).json({ success: false, error: 'Contribution description is required' });
      return;
    }

    const portfolioItem = await PortfolioItem.findById(itemId);
    if (!portfolioItem) {
      res.status(404).json({ success: false, error: 'Portfolio item not found' });
      return;
    }

    if (portfolioItem.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden: You do not own this portfolio item' });
      return;
    }

    const proof = await ProofOfCreativity.create({
      portfolioItemId: portfolioItem._id,
      creatorUserId: req.user!._id,
      contributionDescription: contributionDescription.trim(),
      projectRole: projectRole || 'Lead AI Creator / Director',
      evidenceType: evidenceType || 'process_screenshots',
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
      status: 'submitted',
      declarationSigned: true,
      declarationTimestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      data: proof,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/portfolio/:itemId/proof
export const getProofByItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const proofs = await ProofOfCreativity.find({ portfolioItemId: itemId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: proofs,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/proofs
export const getAdminPendingProofs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin role required' });
      return;
    }

    const proofs = await ProofOfCreativity.find()
      .populate('portfolioItemId', 'title mediaUrl category')
      .populate('creatorUserId', 'displayName email avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proofs.length,
      data: proofs,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/admin/proofs/:id/review
export const reviewProof = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin role required' });
      return;
    }

    const { id } = req.params;
    const { status, reviewerNotes } = req.body;

    const proof = await ProofOfCreativity.findById(id);
    if (!proof) {
      res.status(404).json({ success: false, error: 'Proof submission not found' });
      return;
    }

    proof.status = status || 'evidence_verified';
    proof.reviewerUserId = req.user!._id;
    proof.reviewerNotes = reviewerNotes;
    proof.reviewedAt = new Date();
    await proof.save();

    res.status(200).json({
      success: true,
      data: proof,
    });
  } catch (error) {
    next(error);
  }
};
