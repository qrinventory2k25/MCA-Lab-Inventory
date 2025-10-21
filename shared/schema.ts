import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const systems = pgTable("systems", {
  id: uuid("id").primaryKey().defaultRandom(),
  idCode: varchar("id_code", { length: 20 }).notNull().unique(),
  labName: varchar("lab_name", { length: 10 }).notNull(),
  description: text("description").notNull().default("INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE"),
  qrImageUrl: text("qr_image_url"),
  qrPayload: text("qr_payload"),
  systemUrl: text("system_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSchema = createInsertSchema(systems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystem = z.infer<typeof insertSystemSchema>;
export type System = typeof systems.$inferSelect;

// Lab names enum
export const LAB_NAMES = ["MCA", "BCA", "UIT", "PIT", "UCS", "PCS", "PDS"] as const;
export type LabName = typeof LAB_NAMES[number];
