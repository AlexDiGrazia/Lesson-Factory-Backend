import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
import { authMiddleware } from "../authUtils";

const videosRouter = Router();

videosRouter.get("/", authMiddleware, async (req, res) => {
  const allVideos = await prisma.video.findMany();
  return res.status(200).send(allVideos);
});

videosRouter.get("/firstVideo", authMiddleware, async (req, res) => {
  const firstTableRow =
    await prisma.$queryRaw`SELECT * FROM "Video" LIMIT 1 OFFSET 4`;
  res.json(firstTableRow);
});

export { videosRouter };
