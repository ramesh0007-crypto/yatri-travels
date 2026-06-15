import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { CreateReviewBody, UpdateReviewBody, ListReviewsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt.toISOString() };
}

// GET /reviews
router.get("/reviews", async (req, res) => {
  const parsed = ListReviewsQueryParams.safeParse(req.query);
  const packageId = parsed.success && parsed.data.packageId ? Number(parsed.data.packageId) : undefined;

  const rows = packageId
    ? await db.select().from(reviewsTable).where(eq(reviewsTable.packageId, packageId))
    : await db.select().from(reviewsTable);

  const result = await Promise.all(rows.map(async (r) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId));
    return { ...r, createdAt: r.createdAt.toISOString(), user: user ? formatUser(user) : undefined };
  }));
  res.json(result);
});

// POST /reviews
router.post("/reviews", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { packageId, rating, comment } = parsed.data;
  if (rating < 1 || rating > 5) { res.status(400).json({ error: "Rating must be 1-5" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    userId: req.userId!,
    packageId,
    rating,
    comment,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  res.status(201).json({ ...review, createdAt: review.createdAt.toISOString(), user: user ? formatUser(user) : undefined });
});

// PATCH /reviews/:id
router.patch("/reviews/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [existing] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.userId !== req.userId && req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

  const parsed = UpdateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [review] = await db.update(reviewsTable).set(parsed.data).where(eq(reviewsTable.id, id)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, review.userId));
  res.json({ ...review, createdAt: review.createdAt.toISOString(), user: user ? formatUser(user) : undefined });
});

// DELETE /reviews/:id
router.delete("/reviews/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [existing] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.userId !== req.userId && req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  res.status(204).send();
});

export default router;
