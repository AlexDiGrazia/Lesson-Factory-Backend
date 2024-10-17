import { Router } from "express";
import { createJWT, encryptPassword } from "../authUtils";
import { prisma } from "../../prisma/db.setup";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../emailVerification";

const authRouter = Router();

authRouter.post(
  "/signup",
  // validateRequest({
  //   body: z.object({
  //     email: z.string(),
  //     password: z.string(),
  //     role: z.enum(["USER", "ADMIN"]),
  //   }),
  // }),
  async (req, res) => {
    const email = req.body.email;
    const password = await encryptPassword(req.body.password);
    const role = req.body.role;

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        role,
      },
    });

    sendVerificationEmail(newUser);

    return res.status(200).send(newUser);
  }
);

authRouter.post(
  "/login",
  validateRequest({
    body: z.object({
      email: z.string(),
      password: z.string(),
    }),
  }),
  async (req, res) => {
    const email = req.body.email;
    const requestBodyPassword = req.body.password;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      requestBodyPassword,
      user.password
    );

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid credentials" });

    const JWT = createJWT(user);

    return res.status(200).send({ JWT });
  }
);

export { authRouter };
