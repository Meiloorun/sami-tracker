import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    is_active: integer("is_active").default(1).notNull(),
});

export const feedings = pgTable("feedings", {
    id: serial("id").primaryKey(),
    date_time: timestamp("date_time").notNull(),
    feed_description: text("feed_description").notNull(),
    notes: text("notes"),
    user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
});

export const user_devices = pgTable("user_devices", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    device_name: text("device_name"),
    platform: text("platform"),
    token_hash: text("token_hash").notNull().unique(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    last_seen: timestamp("last_seen", { withTimezone: true }).defaultNow().notNull(),
});
