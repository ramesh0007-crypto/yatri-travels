import { pgTable, serial, text, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const packagesTable = pgTable("packages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  images: text("images").array().notNull().default([]),
  price: real("price").notNull(),
  duration: integer("duration").notNull(),
  seatsAvailable: integer("seats_available").notNull(),
  featured: boolean("featured").notNull().default(false),
  highlights: text("highlights"),
  inclusions: text("inclusions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPackageSchema = createInsertSchema(packagesTable).omit({ id: true, createdAt: true });
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packagesTable.$inferSelect;
