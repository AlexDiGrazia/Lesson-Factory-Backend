import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TUser } from "../types/authTypes";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

// Extend the Request interface to include the user property
declare module "express-serve-static-core" {
  interface Request {
    user?: ReturnType<typeof createUnsecuredUserInformation>;
  }
}

import { z } from "zod";
import { prisma } from "../prisma/db.setup";

dotenv.config();
const saltRounds = 11;

export const encryptPassword = (password: string) =>
  bcrypt.hash(password, saltRounds);

export const createUnsecuredUserInformation = (user: TUser) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
});

export const createJWT = (user: TUser) => {
  if (!process.env.USER_LOGIN_JWT_SECRET)
    return new Error("JWT_SECRET is missing from environment variables");

  return jwt.sign(
    createUnsecuredUserInformation(user),
    process.env.USER_LOGIN_JWT_SECRET
  );
};

const jwtSchema = z.object({
  id: z.number(),
  email: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  emailVerified: z.boolean(),
  iat: z.number(),
});

export const getDataFromJWT = (token?: string) => {
  if (!token) return null;

  try {
    return jwtSchema.parse(
      jwt.verify(token, process.env.USER_LOGIN_JWT_SECRET as string)
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [, token] = req.headers.authorization?.split(" ") || [];
  const jwtData = getDataFromJWT(token);

  if (!jwtData)
    return res.status(401).json({ message: "Invalid authorization token" });

  const userFromJWT = await prisma.user.findUnique({
    where: {
      email: jwtData.email,
    },
  });

  if (!userFromJWT) return res.status(404).json({ message: "User not found" });

  req.user = createUnsecuredUserInformation(userFromJWT);
  next();
};
