import { pgTable, serial, integer, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { packagesTable } from "./packages";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "refunded"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "cancelled", "pending"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  travelDate: text("travel_date").notNull(),
  seatsBooked: integer("seats_booked").notNull(),
  totalAmount: real("total_amount").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingsRelations = relations(bookingsTable, ({ one }) => ({
  user: one(usersTable, { fields: [bookingsTable.userId], references: [usersTable.id] }),
  package: one(packagesTable, { fields: [bookingsTable.packageId], references: [packagesTable.id] }),
}));

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
