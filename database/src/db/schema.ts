import { integer } from "drizzle-orm/gel-core";
import { int } from "drizzle-orm/mysql-core";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const feedings = pgTable("feedings",{
    id: serial("id").primaryKey(),
    date_time: timestamp("date_time").notNull(),
    notes: text("notes"),
    user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})