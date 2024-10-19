import jwt from "jsonwebtoken";
import { TUser } from "../types/authTypes";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const idFromUserObject = (user: TUser) => ({
  id: user.id,
});

const BASE_URL = "http://localhost:3000";

export const sendVerificationEmail = (email: string, id: number) => {
  if (!process.env.EMAIL_JWT_SECRET)
    return new Error("EMAIL_JWT_SECRET is missing from environment variables");

  jwt.sign(
    { user: { id } },
    process.env.EMAIL_JWT_SECRET,
    {
      expiresIn: "1d",
    },
    (error, emailToken) => {
      const url = `${BASE_URL}/confirmation/${emailToken}`;
      if (!process.env.EMAIL_ADDRESS) {
        return new Error("missing email from .env");
      }
      console.log(email, { email: process.env.EMAIL_ADDRESS });

      transporter.sendMail(
        {
          from: "The Lesson Factory",
          to: email,
          subject: "Confirm your email!",
          html: `
          <p style="padding-left: 200px;">
          Please confirm your email by clicking this link: 
            <a href="${url}" style="background: rgb(58, 62, 148); padding: 10px 15px; text-decoration: none; color: white">Verify Email</a>
          </p>
            `,
        },
        (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log({ info: info.response });
          }
        }
      );
      console.log("email sent");
    }
  );
};
