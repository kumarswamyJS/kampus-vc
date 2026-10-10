import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CreativePassport } from '../models/CreativePassport';
import { Creator } from '../models/Creator';
import { generatePassportForCreator } from '../services/passportService';
import { calculateCreatorReliability } from '../services/reliabilityService';

// GET /api/v1/passport/me
export const getMyPassport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    let passport = await CreativePassport.findOne({ creatorUserId: userId });

    if (!passport) {
      passport = await generatePassportForCreator(userId);
    }

    const reliability = await calculateCreatorReliability(userId);

    res.status(200).json({
      success: true,
      data: {
        passport,
        reliability,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/passport/reanalyze
export const reanalyzePassport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const passport = await generatePassportForCreator(userId);
    const reliability = await calculateCreatorReliability(userId);

    res.status(200).json({
      success: true,
      data: {
        passport,
        reliability,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/passport/creator/:creatorId
export const getCreatorPassport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { creatorId } = req.params;
    const creator = await Creator.findById(creatorId);

    if (!creator) {
      res.status(404).json({ success: false, error: 'Creator not found' });
      return;
    }

    const userId = creator.userId.toString();
    let passport = await CreativePassport.findOne({ creatorUserId: userId });

    if (!passport) {
      passport = await generatePassportForCreator(userId);
    }

    const reliability = await calculateCreatorReliability(userId);

    res.status(200).json({
      success: true,
      data: {
        passport,
        reliability,
      },
    });
  } catch (error) {
    next(error);
  }
};
