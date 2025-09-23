const { pgTable, serial, text, timestamp } = require("drizzle-orm/pg-core");

const feedings = pgTable("feedings",{
    id: serial("id").primaryKey(),
    date_time: timestamp("date_time").notNull(),
    notes: text("notes"),
});

module.exports = { feedings };