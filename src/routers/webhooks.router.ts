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
      const customerEmail = session.customer_details.email;
      const mode = session.mode;

      console.log({ session });
      console.log({ customerId });
      console.log({ customerEmail });
      console.log({ mode });
      console.log("mode is a string", mode === "subscription");
    }
    if (event.type === "customer.created") {
      console.log({ newCustomer: event.data.object });
    }

    res.status(200).send({ event });
  }
);

export { webhooksRouter };
