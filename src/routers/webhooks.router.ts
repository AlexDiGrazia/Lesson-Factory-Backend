import { Router, json } from "express";
import { prisma } from "../../prisma/db.setup";

const webhooksRouter = Router();

webhooksRouter.post(
  "/",
  json({ type: "application/json" }),
  async (req, res) => {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerId = session.customer;
      const email = session.customer_details.email;
      const mode = session.mode;

      if (mode === "subscription") {
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            stripeCustomerId: customerId,
          },
        });
      }

      console.log({ session });
      console.log({ customerId });
      console.log({ email });
      console.log({ mode });
      console.log("mode is a string", mode === "subscription");
    }
    if (event.type === "customer.created") {
      console.log({ newCustomer: event.data.object });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      await prisma.user.update({
        where: {
          stripeCustomerId: subscription.customer,
        },
        data: {
          subscribed: false,
          stripeCustomerId: null,
        },
      });
    }

    res.status(200).send({ event });
  }
);

export { webhooksRouter };
