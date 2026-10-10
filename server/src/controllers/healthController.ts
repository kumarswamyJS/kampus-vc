import { Request, Response } from 'express';
import { getDatabaseState } from '../config/database';
import { env } from '../config/env';

export const getHealth = (_req: Request, res: Response): void => {
  const dbState = getDatabaseState();
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(200).json({
    status: 'ok',
    service: 'Kampus.VC API Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: env.NODE_ENV,
    server: {
      status: 'online',
    },
    database: {
      connected: dbState.isConnected,
      status: dbState.status,
      ...(dbState.host && { host: dbState.host }),
      ...(dbState.name && { databaseName: dbState.name }),
    },
  });
};
