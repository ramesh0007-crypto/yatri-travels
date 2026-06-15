import { Router } from "express";
import { db, galleryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { CreateGalleryImageBody } from "@workspace/api-zod";

const router = Router();

// GET /gallery
router.get("/gallery", async (_req, res) => {
  const images = await db.select().from(galleryTable).orderBy(desc(galleryTable.createdAt));
  res.json(images.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })));
});

// POST /gallery
router.post("/gallery", requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const parsed = CreateGalleryImageBody.safeParse(_req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [image] = await db.insert(galleryTable).values(parsed.data).returning();
  res.status(201).json({ ...image, createdAt: image.createdAt.toISOString() });
});

// DELETE /gallery/:id
router.delete("/gallery/:id", requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const id = Number(_req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(galleryTable).where(eq(galleryTable.id, id));
  res.status(204).send();
});

export default router;
