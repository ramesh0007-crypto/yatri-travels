import { Router } from "express";
import { db, contactsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { SubmitContactBody } from "@workspace/api-zod";

const router = Router();

// POST /contact
router.post("/contact", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  await db.insert(contactsTable).values(parsed.data);
  res.json({ message: "Message sent successfully" });
});

// GET /admin/contacts
router.get("/admin/contacts", requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const contacts = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
  res.json(contacts.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

export default router;
