import { type Request, type Response, type NextFunction } from 'express';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export function success<T>(data: T): ApiResponse<T> {
  return { data, error: null };
}

export function failure(code: string, message: string, details?: unknown[]): ApiResponse<null> {
  return { data: null, error: { code, message, details } };
}

export function errorHandler(_err: Error, _req: Request, res: Response, _next: NextFunction): void {
  res.status(500).json(failure('INTERNAL_ERROR', 'An unexpected error occurred'));
}
