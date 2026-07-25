import { type Request, type Response, type NextFunction } from 'express';
import { type ZodSchema } from 'zod';
import { failure } from './error-handler.js';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json(failure('VALIDATION_ERROR', 'Invalid request body', details));
      return;
    }

    req.body = result.data;
    next();
  };
}
