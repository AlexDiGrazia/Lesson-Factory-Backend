import { Router } from "express";
import { stripe } from "../stripe.setup";
const stripeCustomerPortalRouter = Router();

stripeCustomerPortalRouter.post("/", async (req, res) => {
  console.log("customerId", req.body.stripeCustomerId);
  const session = await stripe.billingPortal.sessions.create({
    customer: req.body.stripeCustomerId,
    return_url: `https://thelessonfactory.com/app/${req.body.lastVideoWatched}`,
  });

  console.log(session.url);

  // return res.redirect(302, session.url);
  return res.status(200).send({ url: session.url });
});

export { stripeCustomerPortalRouter };
