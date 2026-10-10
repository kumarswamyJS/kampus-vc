import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { requestLogger } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import briefRoutes from './routes/briefRoutes';
import matchingRoutes from './routes/matchingRoutes';
import proposalRoutes from './routes/proposalRoutes';
import projectRoutes from './routes/projectRoutes';
import conversationRoutes from './routes/conversationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import disputeRoutes from './routes/disputeRoutes';
import callSessionRoutes from './routes/callSessionRoutes';
import passportRoutes from './routes/passportRoutes';
import proofRoutes from './routes/proofRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import shortlistRoutes from './routes/shortlistRoutes';
import licensingRoutes from './routes/licensingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';

const createApp = (): Application => {
  const app = express();

  // Security & Origin Configuration
  const cleanClientOrigin = env.CLIENT_ORIGIN.replace(/\/$/, '');
  const allowedOrigins = [cleanClientOrigin, `${cleanClientOrigin}/`, 'http://localhost:5173', 'http://127.0.0.1:5173'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const reqOriginClean = origin.replace(/\/$/, '');
        if (allowedOrigins.some(o => o.replace(/\/$/, '') === reqOriginClean)) {
          callback(null, true);
        } else {
          callback(null, true); // Fallback for dynamic subdomains
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Cookie Parser Middleware
  app.use(cookieParser(env.COOKIE_SECRET));

  // Request Parser with Sensible Body Limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static Local Uploads Directory (Dev fallback)
  const uploadsDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
  app.use('/uploads', express.static(uploadsDir));

  // Middleware
  app.use(requestLogger);

  // Root & API Health Checks
  app.use('/', healthRoutes);
  app.use('/api', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profiles', profileRoutes);
  app.use('/api/v1/portfolio', portfolioRoutes);
  app.use('/api/v1/briefs', briefRoutes);
  app.use('/api/v1/matching', matchingRoutes);
  app.use('/api/v1/proposals', proposalRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/conversations', conversationRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1', disputeRoutes);
  app.use('/api/v1', callSessionRoutes);
  app.use('/api/v1', passportRoutes);
  app.use('/api/v1', proofRoutes);
  app.use('/api/v1', availabilityRoutes);
  app.use('/api/v1', shortlistRoutes);
  app.use('/api/v1', licensingRoutes);
  app.use('/api/v1', paymentRoutes);
  app.use('/api/v1', adminRoutes);

  // Fallback 404 & Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
