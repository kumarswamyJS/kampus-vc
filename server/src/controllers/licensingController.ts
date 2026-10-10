import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CampaignBrief } from '../models/CampaignBrief';
import { Proposal } from '../models/Proposal';
import { Project } from '../models/Project';
import { analyzeLicensingTerms } from '../services/licensingService';

// POST /api/v1/licensing/analyze-brief
export const analyzeBriefLicensing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { briefId } = req.body;
    const brief = await CampaignBrief.findById(briefId);
    if (!brief) {
      res.status(404).json({ success: false, error: 'Campaign brief not found' });
      return;
    }

    const analysis = analyzeLicensingTerms({ briefTerms: brief });
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/licensing/analyze-proposal
export const analyzeProposalLicensing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { proposalId } = req.body;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      res.status(404).json({ success: false, error: 'Proposal not found' });
      return;
    }

    const brief = await CampaignBrief.findById(proposal.briefId);
    const analysis = analyzeLicensingTerms({ briefTerms: brief, proposalTerms: proposal });

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/licensing/analyze-project
export const analyzeProjectLicensing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const analysis = analyzeLicensingTerms({ projectTerms: project });
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};
