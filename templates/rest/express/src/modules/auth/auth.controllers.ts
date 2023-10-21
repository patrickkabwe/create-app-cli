import { Request } from "express";
import createHttpError from "http-errors";
import { sign } from "jsonwebtoken";
import { COOKIE_NAME } from "~/constants";
import { prisma } from "~/libs/prisma";
import { asyncHandler } from "~/utils/asyncHandler";
import { UsersService } from "../users/users.services";
import {
  LoginPayload,
  loginUserSchema,
  RegisterPayload,
  registerUserSchema,
} from "./auth.schemas";

export const loginController = asyncHandler(
  async (req: Request<{}, {}, LoginPayload>, res) => {
    const { email, password } = req.body;

    const cleanedData = loginUserSchema.parse({ email, password });

    const hashPassword = "test";

    if (cleanedData.password !== hashPassword) {
      throw createHttpError(400, "Invalid credentials");
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!foundUser) {
      throw createHttpError(400, "Invalid credentials");
    }

    const token = sign(
      { id: foundUser.id },
      process.env.ACCESS_TOKEN_KEY as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = sign(
      { id: foundUser.id },
      process.env.REFRESH_TOKEN_KEY as string,
      { expiresIn: "7d" }
    );

    const response = {
      ...foundUser,
      token,
    };

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      signed: process.env.NODE_ENV === "production",
    });

    res.status(200).json(response);
  }
);

export const registerController = asyncHandler(
  async (req: Request<{}, {}, RegisterPayload>, res) => {
    const { email, password, name } = req.body;

    const cleanedData = registerUserSchema.parse({ email, password, name });

    const hashPassword = "test";

    if (cleanedData.password !== hashPassword) {
      throw createHttpError(400, "Invalid credentials");
    }

    const foundUser = await UsersService.getUserByEmail(email);

    if (foundUser) {
      throw createHttpError(400, "Account already exists");
    }

    const newUser = await UsersService.createUser({
      name,
      email,
      password: hashPassword,
    });

    const token = sign(
      { id: newUser.id },
      process.env.ACCESS_TOKEN_KEY as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = sign(
      { id: newUser.id },
      process.env.REFRESH_TOKEN_KEY as string,
      { expiresIn: "7d" }
    );

    const response = {
      ...newUser,
      token,
    };

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      signed: process.env.NODE_ENV === "production",
    });

    res.status(200).json(response);
  }
);

export const logoutController = asyncHandler(async (_, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    signed: process.env.NODE_ENV === "production",
  });

  res.sendStatus(205); // No Content
});
