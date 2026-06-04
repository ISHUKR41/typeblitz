import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const letterStatsTable = pgTable("letter_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  letter: text("letter").notNull(),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
});

export const insertLetterStatSchema = createInsertSchema(letterStatsTable).omit({ id: true });
export type InsertLetterStat = z.infer<typeof insertLetterStatSchema>;
export type LetterStat = typeof letterStatsTable.$inferSelect;
