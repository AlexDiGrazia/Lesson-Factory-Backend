import Router from "express";
import { prisma } from "../../prisma/db.setup";
import { createJWT } from "../authUtils";

export const subscriptionRouter = Router();

subscriptionRouter.post("/", async (req, res) => {
  console.log("subscription updated");
  const id = Number(req.body.id);
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      subscribed: true,
    },
  });

  const JWT = createJWT(updatedUser);

  return res.status(200).send({ JWT });
});
