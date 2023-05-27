import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

declare module "express" {
  interface Request extends Express.Request {
    user?: {
      id: string;
    };
  }
}
export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      next(createHttpError(401));
      return;
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY!);

    req.user = decoded as jwt.JwtPayload & { id: string };

    next();
  } catch (err) {
    console.log(err);

    return next(createHttpError(403));
  }
};
