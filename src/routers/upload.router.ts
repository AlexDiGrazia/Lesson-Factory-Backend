import { Router } from "express";
import { S3Client, CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";
import Busboy from "busboy";
import Bull from "bull";
import { Readable, Transform } from "stream";
import { createHash } from "crypto";
import dotenv from "dotenv";
import { authMiddleware } from "../authUtils";

const uploadRouter = Router();

dotenv.config();
const {
  REDIS_HOST,
  REDIS_PORT,
  BUCKET_NAME: bucketName,
  BUCKET_REGION: bucketRegion,
  AWS_ACCESS_KEY_ID: accessKey,
  AWS_SECRET_ACCESS_KEY: secretAccessKey,
  CLOUDFRONT_DISTRIBUTION: cloudfrontDistribution,
} = process.env;

const s3v3 = new S3Client({
  credentials: {
    accessKeyId: accessKey!,
    secretAccessKey: secretAccessKey!,
  },
  region: bucketRegion,
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({ maxSockets: 500 }),
    socketAcquisitionWarningTimeout: 120000,
  }),
});

["REDIS_HOST", "REDIS_PORT"].forEach((key) => {
  if (process.env[key] === undefined)
    throw new Error(`Missing environment variable ${key}`);
});

uploadRouter.post("/", authMiddleware, async (req, res) => {
  const busboy = Busboy({ headers: req.headers });

  if (!REDIS_HOST || !REDIS_PORT) {
    throw new Error("error");
  }
  const redisOptions = {
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
  };

  const uploadQueue = new Bull("uploadQueue", {
    redis: redisOptions,
  });

  let originalFileName = "";
  let videoTitle = "";

  const createTransformStream = (
    UploadId: string,
    bucketName: string,
    filename: string
  ) => {
    let buffer = Buffer.alloc(0);
    const _5MiB = 5 * 1024 * 1024;
    const _64KiB = 64 * 1024;
    const aggregate = _5MiB + _64KiB; //5MiB + 64KiB, since buffer loses 64KiB when stored in S3, and minimum part size for re-stitching is 5MiB
    //Above note fixed by adding Checksum to uploadPartCommand()
    let PartNumber = 1;

    return new Transform({
      async transform(
        chunk: Buffer,
        encoding: string,
        callback: (error?: Error | null, data?: Buffer) => void
      ) {
        buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length >= aggregate) {
          console.log(buffer);
          const hash = createHash("md5").update(buffer).digest("base64");
          const uploadPartParams = {
            Body: buffer,
            Bucket: bucketName,
            Key: filename,
            PartNumber,
            UploadId: UploadId,
            ContentMD5: hash, //It seems like this param made the difference between Parts transferring as the correct size and not
          };
          await uploadQueue.add("video_part", uploadPartParams);
          buffer = Buffer.alloc(0);
          PartNumber++;
          callback();
        } else {
          callback();
        }
      },
      async flush() {
        const hash = createHash("md5").update(buffer).digest("base64");
        const uploadPartParams = {
          Body: buffer,
          Bucket: bucketName,
          Key: filename,
          PartNumber,
          UploadId,
          ContentMD5: hash,
        };
        await uploadQueue.add("last_video_part", uploadPartParams);
      },
    });
  };

  busboy.on(
    "file",
    async (
      name: string,
      file: Readable,
      info: { filename: string; encoding: string; mimeType: string }
    ) => {
      const { filename } = info;
      originalFileName = filename;

      const mpuParams = {
        Bucket: bucketName,
        Key: filename,
        ContentType: "video/mp4",
        ContentDisposition: "inline",
      };

      const mpuCommand = new CreateMultipartUploadCommand(mpuParams);
      const mpuResponse = await s3v3.send(mpuCommand);
      const UploadId = mpuResponse.UploadId;

      if (!UploadId || !bucketName)
        return res
          .status(400)
          .send("No Upload ID returned from CreateMultipartUploadCommand");

      const transformStream = createTransformStream(
        UploadId,
        bucketName,
        filename
      );
      file.pipe(transformStream).on("end", () => {});

      if (!bucketName || !filename) {
        res.status(400).send("Bucket name or file name is missing");
        return;
      }
    }
  );

  busboy.on("field", (name: string, value: string) => {
    if (name === "title") {
      videoTitle = value;
      uploadQueue.add("title", { title: videoTitle });
    }
  });

  busboy.on("finish", async () => {});
  res.status(200).send("ok");

  req.pipe(busboy);
});

export { uploadRouter };
