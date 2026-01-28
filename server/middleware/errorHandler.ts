import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(503, message);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, { statusCode: err.statusCode, path: req.path });
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn('Validation error', { errors: err.errors, path: req.path });
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err.message.includes('API') || err.message.includes('rate limit')) {
    logger.error('External API error', { error: err.message, path: req.path });
    res.status(503).json({
      success: false,
      error: 'External service temporarily unavailable',
      message: 'Please try again in a few moments',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  logger.error('Unexpected error', { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
