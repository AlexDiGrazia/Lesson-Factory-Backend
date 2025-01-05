import { Router } from "express";
import dotenv from "dotenv";
import { stripe } from "../stripe.setup";

dotenv.config();

const stripeRouter = Router();
const DOMAIN = "https://thelessonfactory.com";

stripeRouter.post("/", async (req, res) => {
  const mode = req.body.mode;
  const path = req.body.return_url;
  const customer_email = req.body.customer_email;
  const cancel_url = req.body.cancel_url;
  const videoId = req.body.videoId;
  const return_url =
    mode === "subscription"
      ? `${DOMAIN}/${path}`
      : `${DOMAIN}/${path}/${videoId}`;

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
    customer_email,
    cancel_url,
  });

  res.send({ clientSecret: session.client_secret });
});

export { stripeRouter };
