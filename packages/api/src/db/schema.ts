import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const kvTable = pgTable("kv", {
  key: text("id").primaryKey(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
