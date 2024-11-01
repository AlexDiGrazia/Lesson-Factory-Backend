import Router from "express";
import { prisma } from "../../prisma/db.setup";
import { createJWT } from "../authUtils";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

export const subscriptionRouter = Router();

subscriptionRouter.post(
  "/subscription",
  validateRequest({
    body: z.object({
      id: z.number(),
    }),
  }),
  async (req, res) => {
    const id = Number(req.body.id);
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        subscribed: true,
      },
      include: {
        videoPurchase: true,
      },
    });

    const JWT = createJWT(updatedUser);

    return res.status(200).send({ JWT });
  }
);

subscriptionRouter.post(
  "/single_video",

  async (req, res) => {
    const videoId = req.body.videoId;
    const userId = req.body.userId;

    console.log({ videoId, userId });
    const newPurchase = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        videoPurchase: {
          create: {
            videoId,
          },
        },
      },
      include: {
        videoPurchase: true,
      },
    });

    const JWT = createJWT(newPurchase);

    return res.status(200).send({ JWT });
  }
);
