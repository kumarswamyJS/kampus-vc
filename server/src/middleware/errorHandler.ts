import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
    },
    timestamp: new Date().toISOString(),
  });
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`💥 Error [${statusCode}]: ${message}`, err.stack ? `\n${err.stack}` : '');

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { details: err.errors || err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};
