import { Router } from "express";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import dotenv from "dotenv";
import { authMiddleware } from "../authUtils";

dotenv.config();
const { PRIVATE_KEY_TWO: privateKey, KEY_PAIR_ID_TWO: keyPairId } = process.env;

const decodedPrivateKey = privateKey
  ? Buffer.from(privateKey, "base64").toString("utf-8")
  : "";

const presignedUrlRouter = Router();

presignedUrlRouter.post("/", authMiddleware, async (req, res) => {
  const dateLessThan = new Date(Date.now() + 1000 * 60).toString();

  if (privateKey === undefined || keyPairId === undefined) {
    return res.status(400).send("Environment variable not found");
  }

  const signedUrl = getSignedUrl({
    url: req.body.url,
    dateLessThan,
    privateKey: decodedPrivateKey,
    keyPairId,
  });

  return res.status(200).send({ signedUrl });
});

export { presignedUrlRouter };
