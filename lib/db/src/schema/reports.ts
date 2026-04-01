import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { equipmentTable } from "./equipment";

export const reportStatusEnum = pgEnum("report_status", ["pending", "in_progress", "resolved", "cancelled"]);
export const reportPriorityEnum = pgEnum("report_priority", ["low", "medium", "high", "critical"]);

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: reportStatusEnum("status").notNull().default("pending"),
  priority: reportPriorityEnum("priority").notNull().default("medium"),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id),
  reportedById: integer("reported_by_id").notNull().references(() => usersTable.id),
  receivedById: integer("received_by_id").references(() => usersTable.id),
  assignedToId: integer("assigned_to_id").references(() => usersTable.id),
  resolvedById: integer("resolved_by_id").references(() => usersTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  status: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
