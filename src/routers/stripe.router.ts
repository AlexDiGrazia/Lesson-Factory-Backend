import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeRouter = Router();
const DOMAIN = "http://localhost:5173";

stripeRouter.post("/", async (req, res) => {
  console.log("stripe ran ");
  console.log({ secret_key: process.env.STRIPE_SECRET_KEY });

  const product = await stripe.products.create({
    name: "Membership",
    id: "new_membership",
    // default_price: "membership_price",
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2000,
    currency: "usd",
    // id: "membership_price",
  });

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price: price.id,
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
