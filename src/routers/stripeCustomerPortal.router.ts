import { Router } from "express";
import { stripe } from "../Stripe.setup";
const stripeCustomerPortalRouter = Router();

stripeCustomerPortalRouter.post("/", async (req, res) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: req.body.customerId,
    return_url: "https://example.com/account",
  });
});
