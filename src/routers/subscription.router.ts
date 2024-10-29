import Router from "express";
import { prisma } from "../../prisma/db.setup";

export const subscriptionRouter = Router();

subscriptionRouter.post("/", async (req, res) => {
  console.log("subscription updated");
  const id = Number(req.body.id);
  const newSubscriptionStatus = await prisma.user.update({
    where: {
      id,
    },
    data: {
      subscribed: true,
    },
  });
  return res.status(200).send(newSubscriptionStatus);
});
