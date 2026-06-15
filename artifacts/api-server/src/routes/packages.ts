import { Router } from "express";
import { db, packagesTable, reviewsTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, avg, count, min, max, sum, or } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { CreatePackageBody, UpdatePackageBody, ListPackagesQueryParams } from "@workspace/api-zod";

const router = Router();

function formatPkg(pkg: typeof packagesTable.$inferSelect, avgRating?: number | null, reviewCount?: number | null) {
  return {
    ...pkg,
    images: pkg.images ?? [],
    avgRating: avgRating ?? null,
    reviewCount: reviewCount ?? null,
    createdAt: pkg.createdAt.toISOString(),
  };
}

// GET /packages
router.get("/packages", async (req, res) => {
  const parsed = ListPackagesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const conditions = [];
  if (params.search) {
    conditions.push(or(
      ilike(packagesTable.title, `%${params.search}%`),
      ilike(packagesTable.location, `%${params.search}%`),
      ilike(packagesTable.description, `%${params.search}%`)
    ));
  }
  if (params.location) conditions.push(ilike(packagesTable.location, `%${params.location}%`));
  if (params.minPrice) conditions.push(gte(packagesTable.price, params.minPrice));
  if (params.maxPrice) conditions.push(lte(packagesTable.price, params.maxPrice));
  if (params.minDuration) conditions.push(gte(packagesTable.duration, params.minDuration));
  if (params.maxDuration) conditions.push(lte(packagesTable.duration, params.maxDuration));

  const pkgs = conditions.length > 0
    ? await db.select().from(packagesTable).where(and(...conditions))
    : await db.select().from(packagesTable);

  // Get ratings
  const ratings = await db
    .select({ packageId: reviewsTable.packageId, avg: avg(reviewsTable.rating), count: count(reviewsTable.id) })
    .from(reviewsTable)
    .groupBy(reviewsTable.packageId);
  const ratingMap = new Map(ratings.map(r => [r.packageId, r]));

  res.json(pkgs.map(p => {
    const r = ratingMap.get(p.id);
    return formatPkg(p, r ? Number(r.avg) : null, r ? Number(r.count) : null);
  }));
});

// GET /packages/featured
router.get("/packages/featured", async (_req, res) => {
  const pkgs = await db.select().from(packagesTable).where(eq(packagesTable.featured, true));
  const ratings = await db
    .select({ packageId: reviewsTable.packageId, avg: avg(reviewsTable.rating), count: count(reviewsTable.id) })
    .from(reviewsTable)
    .groupBy(reviewsTable.packageId);
  const ratingMap = new Map(ratings.map(r => [r.packageId, r]));
  res.json(pkgs.map(p => {
    const r = ratingMap.get(p.id);
    return formatPkg(p, r ? Number(r.avg) : null, r ? Number(r.count) : null);
  }));
});

// GET /packages/stats
router.get("/packages/stats", async (_req, res) => {
  const [pkgStats] = await db.select({
    count: count(packagesTable.id),
    minPrice: min(packagesTable.price),
    maxPrice: max(packagesTable.price),
  }).from(packagesTable);

  const [bookingStats] = await db.select({ total: count() }).from(
    (await import("@workspace/db")).bookingsTable
  );

  const locations = await db.selectDistinct({ location: packagesTable.location }).from(packagesTable);

  const [happyTravelers] = await db.select({
    total: sum((await import("@workspace/db")).bookingsTable.seatsBooked)
  }).from((await import("@workspace/db")).bookingsTable);

  res.json({
    totalPackages: pkgStats.count ?? 0,
    totalBookings: bookingStats.total ?? 0,
    totalDestinations: locations.length,
    minPrice: pkgStats.minPrice ?? 0,
    maxPrice: pkgStats.maxPrice ?? 0,
    happyTravelers: Number(happyTravelers.total) || 0,
  });
});

// GET /packages/:id
router.get("/packages/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, id));
  if (!pkg) { res.status(404).json({ error: "Not found" }); return; }

  const [ratingRow] = await db.select({ avg: avg(reviewsTable.rating), cnt: count(reviewsTable.id) })
    .from(reviewsTable).where(eq(reviewsTable.packageId, id));

  res.json(formatPkg(pkg, ratingRow ? Number(ratingRow.avg) : null, ratingRow ? Number(ratingRow.cnt) : null));
});

// POST /packages (admin)
router.post("/packages", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [pkg] = await db.insert(packagesTable).values({
    ...parsed.data,
    images: parsed.data.images ?? [],
    featured: parsed.data.featured ?? false,
  }).returning();
  res.status(201).json(formatPkg(pkg));
});

// PATCH /packages/:id (admin)
router.patch("/packages/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [pkg] = await db.update(packagesTable).set(parsed.data).where(eq(packagesTable.id, id)).returning();
  if (!pkg) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatPkg(pkg));
});

// DELETE /packages/:id (admin)
router.delete("/packages/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(packagesTable).where(eq(packagesTable.id, id));
  res.status(204).send();
});

export default router;
