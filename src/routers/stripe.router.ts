import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeRouter = Router();
const DOMAIN = "http://localhost:5173";

stripeRouter.post("/", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        // price: "price_1QDhp72NGxzi9IJzeoDYcTfy",
        price: "price_1QDhnm2NGxzi9IJz4A1CC2zw",
        quantity: 1,
      },
    ],
    // mode: "subscription",
    mode: "payment",
    allow_promotion_codes: true,
    // return_url: `${DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
    return_url: `${DOMAIN}/signup/payment/confirmation`,
    automatic_tax: { enabled: true },
  });
  res.send({ clientSecret: session.client_secret });
});

export { stripeRouter };
