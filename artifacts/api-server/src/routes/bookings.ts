import { Router } from "express";
import { db, bookingsTable, packagesTable, usersTable } from "@workspace/db";
import { eq, and, desc, sum } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { CreateBookingBody, UpdateBookingBody, CreatePaymentSessionBody } from "@workspace/api-zod";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt.toISOString() };
}

function formatPkg(p: typeof packagesTable.$inferSelect) {
  return { ...p, images: p.images ?? [], createdAt: p.createdAt.toISOString(), avgRating: null, reviewCount: null };
}

function formatBooking(b: typeof bookingsTable.$inferSelect, pkg?: typeof packagesTable.$inferSelect | null, user?: typeof usersTable.$inferSelect | null) {
  return {
    ...b,
    travelDate: b.travelDate,
    createdAt: b.createdAt.toISOString(),
    package: pkg ? formatPkg(pkg) : undefined,
    user: user ? formatUser(user) : undefined,
  };
}

// GET /bookings
router.get("/bookings", requireAuth, async (req: AuthRequest, res) => {
  const rows = req.userRole === "admin"
    ? await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt))
    : await db.select().from(bookingsTable).where(eq(bookingsTable.userId, req.userId!)).orderBy(desc(bookingsTable.createdAt));

  const result = await Promise.all(rows.map(async (b) => {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, b.packageId));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, b.userId));
    return formatBooking(b, pkg, user);
  }));
  res.json(result);
});

// POST /bookings
router.post("/bookings", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { packageId, travelDate, seatsBooked } = parsed.data;

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
  if (!pkg) { res.status(404).json({ error: "Package not found" }); return; }
  if (pkg.seatsAvailable < seatsBooked) { res.status(400).json({ error: "Not enough seats available" }); return; }

  const totalAmount = pkg.price * seatsBooked;
  const [booking] = await db.insert(bookingsTable).values({
    userId: req.userId!,
    packageId,
    travelDate,
    seatsBooked,
    totalAmount,
    paymentStatus: "pending",
    status: "pending",
  }).returning();

  // Reduce seats
  await db.update(packagesTable).set({ seatsAvailable: pkg.seatsAvailable - seatsBooked }).where(eq(packagesTable.id, packageId));

  res.status(201).json(formatBooking(booking, pkg));
});

// GET /bookings/:id
router.get("/bookings/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [b] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!b) { res.status(404).json({ error: "Not found" }); return; }
  if (b.userId !== req.userId && req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, b.packageId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, b.userId));
  res.json(formatBooking(b, pkg, user));
});

// PATCH /bookings/:id (admin)
router.patch("/bookings/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateBookingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [b] = await db.update(bookingsTable).set(parsed.data).where(eq(bookingsTable.id, id)).returning();
  if (!b) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatBooking(b));
});

// POST /bookings/:id/cancel
router.post("/bookings/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [b] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!b) { res.status(404).json({ error: "Not found" }); return; }
  if (b.userId !== req.userId && req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

  const [updated] = await db.update(bookingsTable).set({ status: "cancelled" }).where(eq(bookingsTable.id, id)).returning();

  // Return seats
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, b.packageId));
  if (pkg) await db.update(packagesTable).set({ seatsAvailable: pkg.seatsAvailable + b.seatsBooked }).where(eq(packagesTable.id, b.packageId));

  res.json(formatBooking(updated));
});

// POST /payments/create-session
router.post("/payments/create-session", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreatePaymentSessionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { bookingId } = parsed.data;

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  if (booking.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET) {
    // Return a mock session for demo purposes
    const mockSessionId = `cs_demo_${Date.now()}`;
    await db.update(bookingsTable).set({ stripeSessionId: mockSessionId, paymentStatus: "paid", status: "confirmed" }).where(eq(bookingsTable.id, bookingId));
    res.json({ sessionId: mockSessionId, url: `/dashboard?payment=success&bookingId=${bookingId}` });
    return;
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(STRIPE_SECRET);

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, booking.packageId));
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:80";
  const baseUrl = `https://${domains}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: pkg?.title || "Tour Package" },
        unit_amount: Math.round(booking.totalAmount * 100),
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${baseUrl}/dashboard?payment=success&bookingId=${bookingId}`,
    cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
    metadata: { bookingId: String(bookingId) },
  });

  await db.update(bookingsTable).set({ stripeSessionId: session.id }).where(eq(bookingsTable.id, bookingId));
  res.json({ sessionId: session.id, url: session.url });
});

// POST /payments/webhook
router.post("/payments/webhook", async (req, res) => {
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  if (!STRIPE_SECRET || !WEBHOOK_SECRET) { res.json({ received: true }); return; }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(STRIPE_SECRET);
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch {
    res.status(400).send("Webhook error");
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { bookingId?: string } };
    const bookingId = Number(session?.metadata?.bookingId);
    if (bookingId) {
      await db.update(bookingsTable).set({ paymentStatus: "paid", status: "confirmed" }).where(eq(bookingsTable.id, bookingId));
    }
  }
  res.json({ received: true });
});

export default router;
