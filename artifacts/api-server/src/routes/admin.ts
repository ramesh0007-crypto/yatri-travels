import { Router } from "express";
import { db, usersTable, packagesTable, bookingsTable } from "@workspace/db";
import { eq, count, sum, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { UpdateUserBody } from "@workspace/api-zod";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt.toISOString() };
}

function formatPkg(p: typeof packagesTable.$inferSelect) {
  return { ...p, images: p.images ?? [], createdAt: p.createdAt.toISOString(), avgRating: null, reviewCount: null };
}

// GET /admin/stats
router.get("/admin/stats", requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [pkgCount] = await db.select({ count: count() }).from(packagesTable);
  const [bookingStats] = await db.select({
    count: count(),
    revenue: sum(bookingsTable.totalAmount),
  }).from(bookingsTable);
  const [pendingCount] = await db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "pending"));

  const recentBookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt)).limit(5);
  const enrichedRecent = await Promise.all(recentBookings.map(async (b) => {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, b.packageId));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, b.userId));
    return {
      ...b,
      createdAt: b.createdAt.toISOString(),
      package: pkg ? formatPkg(pkg) : undefined,
      user: user ? formatUser(user) : undefined,
    };
  }));

  res.json({
    totalUsers: userCount.count ?? 0,
    totalPackages: pkgCount.count ?? 0,
    totalBookings: bookingStats.count ?? 0,
    totalRevenue: Number(bookingStats.revenue) || 0,
    pendingBookings: pendingCount.count ?? 0,
    recentBookings: enrichedRecent,
  });
});

// GET /admin/users
router.get("/admin/users", requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users.map(formatUser));
});

// PATCH /admin/users/:id
router.patch("/admin/users/:id", requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const id = Number(_req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateUserBody.safeParse(_req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(user));
});

// DELETE /admin/users/:id
router.delete("/admin/users/:id", requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const id = Number(_req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

export default router;
