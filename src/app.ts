import express from "express";
import cors from "cors";
import { prisma } from "../prisma/db.setup";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import multer from "multer";
import { S3Client, CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import Busboy from "busboy";
import { Readable, Transform } from "stream";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";
import { createHash } from "crypto";
import Bull from "bull";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

dotenv.config();

const {
  REDIS_HOST,
  REDIS_PORT,
  BUCKET_NAME: bucketName,
  BUCKET_REGION: bucketRegion,
  ACCESS_KEY: accessKey,
  SECRET_ACCESS_KEY: secretAccessKey,
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

const app = express();
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send({ response: "hello world" });
});

app.post(
  "/videos",
  validateRequest({
    body: z.object({
      filename: z.string(),
      title: z.string(),
    }),
  }),
  async (req, res) => {
    const filename = req.body.filename;
    const title = req.body.title;
    const newVideo = await prisma.video.create({
      data: {
        filename,
        title,
      },
    });
    return res.status(200).send(newVideo);
  }
);

app.get("/videos", async (req, res) => {
  const allVideos = await prisma.video.findMany();
  return res.status(200).send(allVideos);
});

app.get("/firstVideo", async (req, res) => {
  const firstTableRow =
    await prisma.$queryRaw`SELECT * FROM "Video" LIMIT 1 OFFSET 4`;
  res.json(firstTableRow);
});

app.get("/videos/:id", async (req, res) => {
  const id = +req.params.id;
  const singleVideo = await prisma.video.findUnique({
    where: {
      id,
    },
  });
  return res.status(200).send(singleVideo);
});

app.post("/singleVideo", async (req, res) => {
  const singleVideo = await prisma.video.findFirst({
    where: {
      filename: req.body.filename,
    },
  });
  return res.status(200).send(singleVideo);
});

app.post("/upload", async (req, res) => {
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
    const memoryUsage = process.memoryUsage();

    const Parts: {
      ETag: string;
      PartNumber: number;
    }[] = [];

    return new Transform({
      async transform(
        chunk: Buffer,
        encoding: string,
        callback: (error?: Error | null, data?: Buffer) => void
      ) {
        buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length >= aggregate) {
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
        const cmpucParams = {
          Bucket: bucketName,
          Key: filename,
          MultipartUpload: {
            Parts,
          },
          UploadId,
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
      const { encoding, filename, mimeType } = info;
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

      let PartNumber = 1;

      if (!bucketName || !filename) {
        res.status(400).send("Bucket name or file name is missing");
        return;
      }

      const params = {
        Bucket: bucketName,
        Key: filename,
        Body: file,
      };
    }
  );

  busboy.on("field", (name: string, value: string) => {
    if (name === "caption") {
      videoTitle = value;
      uploadQueue.add("title", { title: videoTitle });
    }
  });

  busboy.on("finish", async () => {
    // await prisma.video.create({
    //   data: {
    //     title: videoTitle,
    //     filename: `${cloudfrontDistribution}/${originalFileName}`,
    //   },
    // });
  });
  res.status(200).send("ok");

  req.pipe(busboy);
});

app.delete(
  "/videos/:id",
  validateRequest({
    params: z.object({
      id: z.coerce.number(),
    }),
  }),
  async (req, res) => {
    const id = +req.params.id;
    const deletedVideo = await prisma.video.delete({
      where: { id },
    });
    return res.status(200).send(deletedVideo);
  }
);

["REDIS_HOST", "REDIS_PORT"].forEach((key) => {
  if (process.env[key] === undefined)
    throw new Error(`Missing environment variable ${key}`);
});

app.post("/presigned-url", async (req, res) => {
  const privateKey = process.env.PRIVATE_KEY_TWO;
  const keyPairId = process.env.KEY_PAIR_ID_TWO;
  const dateLessThan = new Date(Date.now() + 1000 * 10).toString();

  if (privateKey === undefined || keyPairId === undefined) {
    return res.status(400).send("Environment variable not found");
  }

  const signedUrl = getSignedUrl({
    url: req.body.url,
    dateLessThan,
    privateKey,
    keyPairId,
  });

  return res.status(200).send({ signedUrl });
});

app.post("/test", async (req, res) => {
  const data = await fetch(
    "https://z89m6eihob.execute-api.us-east-1.amazonaws.com/dev",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Name: req.body.value }),
    }
  ).then((res) => res.json());
  return res.status(200).send({ data });
});

const port = 3000;
app.listen(port, () => {
  console.log(`server is live on port ${port}`);
});
