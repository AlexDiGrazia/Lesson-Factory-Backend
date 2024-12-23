import express from "express";
import cors from "cors";
import { uploadRouter } from "./routers/upload.router";
import { presignedUrlRouter } from "./routers/presignedUrl.router";
import { videosRouter } from "./routers/videos.router";
import { stripeRouter } from "./routers/stripe.router";
import { authRouter } from "./routers/auth.router";
import { emailVerificationRouter } from "./routers/emailVerification.router";
import { subscriptionRouter } from "./routers/subscription.router";
import { stripeCustomerPortalRouter } from "./routers/stripeCustomerPortal.router";
import { webhooksRouter } from "./routers/webhooks.router";

const app = express();

app.set("trust proxy", 1 /* number of proxies between user and server */);

app.get("/ip", (request, response) => response.send(request.ip));

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send("Good job guys!!");
});

app.use("/upload", uploadRouter);
app.use("/presigned-url", presignedUrlRouter);
app.use("/videos", videosRouter);
app.use("/create-checkout-session", stripeRouter);
app.use("/create_customer_portal_session", stripeCustomerPortalRouter);
app.use("/webhooks", webhooksRouter);
app.use("/buy", subscriptionRouter);
app.use("/auth", authRouter);
app.use("/confirmation", emailVerificationRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`server is live on port ${port}`);
});
