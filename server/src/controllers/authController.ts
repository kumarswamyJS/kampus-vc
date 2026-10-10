import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Creator } from '../models/Creator';
import { Brand } from '../models/Brand';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { env } from '../config/env';

const signupSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters long').trim(),
  role: z.enum(['creator', 'brand'], {
    errorMap: () => ({ message: "Role must be either 'creator' or 'brand'" }),
  }),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration details',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { email, password, displayName, role } = parseResult.data;

    // Check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
      return;
    }

    // Create user
    const user = new User({
      email,
      passwordHash: password, // Pre-save hook hashes password
      displayName,
      role,
      isProfileComplete: false,
    });

    await user.save();

    // Create associated profile based on role
    if (role === 'creator') {
      const handle = displayName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(1000 + Math.random() * 9000);
      const creator = await Creator.create({
        userId: user._id,
        name: displayName,
        handle,
        email,
        role: 'creator',
      });
      user.creatorProfile = creator._id;
      await user.save();
    } else {
      const brand = await Brand.create({
        userId: user._id,
        companyName: displayName,
        industry: 'Digital & Technology',
        email,
        role: 'brand',
      });
      user.brandProfile = brand._id;
      await user.save();
    }

    // Generate token & set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token,
        nextStep: role === 'creator' ? '/onboarding/creator' : '/onboarding/brand',
      },
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Registration failed';
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: errMessage },
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid login credentials',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { email, password } = parseResult.data;

    // Fetch user with passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is suspended.' },
      });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token,
        redirectTo: user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard',
      },
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: errMessage },
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
    return;
  }

  let profile = null;
  if (req.user.role === 'creator') {
    profile = await Creator.findOne({ userId: req.user._id });
  } else if (req.user.role === 'brand') {
    profile = await Brand.findOne({ userId: req.user._id });
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
      profile,
    },
  });
};

export const handleGoogleOAuth = async (_req: Request, res: Response): Promise<void> => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth credentials are not configured in backend environment variables.',
        instructions: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env file.',
      },
    });
    return;
  }
  
  res.status(200).json({
    success: true,
    message: 'Google OAuth service is configured.',
  });
};
