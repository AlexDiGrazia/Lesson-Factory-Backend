import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeRouter = Router();
const DOMAIN = "http://localhost:5173";

stripeRouter.post("/", async (req, res) => {
  const mode = req.body.mode;
  const path = req.body.return_url;
  const videoId = req.body.videoId;
  const return_url =
    mode === "subscription"
      ? `${DOMAIN}/${path}`
      : `${DOMAIN}/${path}/${videoId}`;

  console.log(return_url);
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price: req.body.priceId,
        quantity: 1,
      },
    ],
    mode: req.body.mode,
    allow_promotion_codes: true,
    return_url,
    automatic_tax: { enabled: true },
  });
  res.send({ clientSecret: session.client_secret });
});

export { stripeRouter };

// price: "price_1QDhp72NGxzi9IJzeoDYcTfy",  $20 recurring monthly
// price: "price_1QDhnm2NGxzi9IJz4A1CC2zw",  $20 one-off

// mode: "subscription",
// mode: "payment",

// return_url: `${DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
// return_url: `${
//   req.body.return_url === "subscription"
//     ? `${DOMAIN}/signup/payment/confirmation`
//     : `${DOMAIN}/signup/payment/video_purchase`
// } `,
