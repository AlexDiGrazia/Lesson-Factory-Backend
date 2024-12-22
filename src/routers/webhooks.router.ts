import { Router, json } from "express";

const webhooksRouter = Router();

webhooksRouter.post("/", json({ type: "application/json" }), (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerId = session.id;

    console.log(session);
    console.log({ customerId });
  }
  if (event.type === "customer.created") {
    console.log(event.data.object);
  }

  res.status(200).send({ event });
});

export { webhooksRouter };
