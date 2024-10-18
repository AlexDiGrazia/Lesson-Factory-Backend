import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../../prisma/db.setup";

dotenv.config();

const emailVerificationRouter = Router();

emailVerificationRouter.get("/:token", async (req, res) => {
  if (!process.env.EMAIL_JWT_SECRET) {
    return res.status(404).send({ error: "no Email JWT Secret found" });
  }
  const decodedToken = jwt.verify(
    req.params.token,
    process.env.EMAIL_JWT_SECRET
  );
  if (typeof decodedToken !== "string" && "user" in decodedToken) {
    const {
      user: { id },
    } = decodedToken;
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        emailVerified: true,
      },
    });
    return res.redirect("http://localhost:5173/login");
  } else {
    return res.status(400).send({ error: "Invalid token" });
  }
});

export { emailVerificationRouter };
