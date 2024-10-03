import { Router } from "express";
const stripe = require("stripe")(
  "sk_test_51Q5KrD2NGxzi9IJzwKscj4NCbPxhF2nzmTp7podK6CpTa2tTgh1891fBzVVRVbfB4N9XBpsHtCK0ULj0PhtcLDU0001A4fnWPV"
);

const stripeRouter = Router();
const DOMAIN = "http://localhost:5713";

stripeRouter.post("/", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price: "{{PRICE_ID}}",
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
    automatic_tax: { enabled: true },
  });
});

export { stripeRouter };
