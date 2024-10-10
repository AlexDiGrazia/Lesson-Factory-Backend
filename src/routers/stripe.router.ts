import { Router } from "express";
const stripe = require("stripe")(
  "sk_test_51Q5KrD2NGxzi9IJzwKscj4NCbPxhF2nzmTp7podK6CpTa2tTgh1891fBzVVRVbfB4N9XBpsHtCK0ULj0PhtcLDU0001A4fnWPV"
);

const stripeRouter = Router();
const DOMAIN = "http://localhost:5173";

stripeRouter.post("/", async (req, res) => {
  const product = await stripe.products.create({
    name: "Membership",
    id: "new_membership",
    default_price: "membership_price",
  });

  const price = await stripe.prices.create({
    product: "{{PRODUCT_ID}}",
    unit_amount: 2000,
    currency: "usd",
    id: "membership_price",
  });

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price: "{{PRICE_ID}}",
        quantity: 1,
      },
    ],
    mode: "subscription",
    return_url: `${DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
    automatic_tax: { enabled: true },
  });
  res.send({ clientSecret: session.client_secret });
});

export { stripeRouter };
