import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ZodError } from "zod";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(
      (err: ZodError | (Error & { status: number })) => {
        const { errors } = err as ZodError;
        if (err instanceof ZodError) {
          res.status(400).send({
            status: 400,
            message: errors[0].message,
          });
        } else {
          next(createHttpError(err.status || 500, err.message));
        }
      }
    );
  };
