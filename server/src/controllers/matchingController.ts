import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { matchingService } from '../services/matchingService';
import { CampaignBrief } from '../models/CampaignBrief';

export const getMatchesForBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { briefId } = req.params;
    const brief = await CampaignBrief.findById(briefId);

    if (!brief) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brief not found' } });
      return;
    }

    // Security ownership check: Only owning brand can request matches for a brief
    if (brief.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      return;
    }

    const matches = await matchingService.getMatchesForBrief(briefId);
    res.json({ success: true, data: { matches } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getMatchesForCreator = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Identity security check: User can only access their own creator matches
    const userId = req.user!._id.toString();
    const matches = await matchingService.getMatchesForCreator(userId);
    res.json({ success: true, data: { matches } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
