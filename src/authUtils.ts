import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TUser } from "../types/authTypes";
import dotenv from "dotenv";

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
