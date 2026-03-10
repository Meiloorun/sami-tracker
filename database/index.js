require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db } = require("./db.ts");
const { feedings, users, user_devices } = require("./src/db/schema.ts");
const { eq, desc, and, gte, lt } = require("drizzle-orm");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateDeviceToken() {
    return crypto.randomBytes(32).toString("base64url");
}

function hashDeviceToken(token) {
    const pepper = process.env.TOKEN_PEPPER || "";
    return crypto.createHash("sha256").update(`${token}.${pepper}`).digest("hex");
}

function parseDayKey(dayKey) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dayKey || ""));
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) return null;

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

app.get("/feedings", async (req, res) => {
    const result = await db.select().from(feedings)
    res.json(result);
});

app.get("/feedings/latest", async (req, res) => {
  try {
    const [latest] = await db
      .select({
        id: feedings.id,
        date_time: feedings.date_time,
        feed_description: feedings.feed_description,
        notes: feedings.notes,
        user_id: feedings.user_id,
        user_name: users.name,
      })
      .from(feedings)
      .innerJoin(users, eq(feedings.user_id, users.id))
      .orderBy(desc(feedings.date_time))
      .limit(1);

    if (!latest) return res.status(404).json({ error: "No feedings yet" });
    return res.json(latest);
  } catch (error) {
    console.error("Error fetching latest feeding:", error);
    return res.status(500).json({ error: "Failed to fetch latest feeding" });
  }
});

app.get("/feedings/recent", async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(10, requestedLimit)) : 3;

    const recent = await db
      .select({
        id: feedings.id,
        date_time: feedings.date_time,
        feed_description: feedings.feed_description,
        notes: feedings.notes,
        user_id: feedings.user_id,
        user_name: users.name,
      })
      .from(feedings)
      .innerJoin(users, eq(feedings.user_id, users.id))
      .orderBy(desc(feedings.date_time))
      .limit(limit);

    return res.json(recent);
  } catch (error) {
    console.error("Error fetching recent feedings:", error);
    return res.status(500).json({ error: "Failed to fetch recent feedings" });
  }
});

app.get("/feedings/day", async (req, res) => {
  try {
    const range = parseDayKey(req.query.date);
    if (!range) {
      return res.status(400).json({ error: "date must be YYYY-MM-DD" });
    }

    const rows = await db
      .select({
        id: feedings.id,
        date_time: feedings.date_time,
        feed_description: feedings.feed_description,
        notes: feedings.notes,
        user_id: feedings.user_id,
        user_name: users.name,
      })
      .from(feedings)
      .innerJoin(users, eq(feedings.user_id, users.id))
      .where(and(gte(feedings.date_time, range.start), lt(feedings.date_time, range.end)))
      .orderBy(desc(feedings.date_time));

    return res.json(rows);
  } catch (error) {
    console.error("Error fetching daily feedings:", error);
    return res.status(500).json({ error: "Failed to fetch daily feedings" });
  }
});

app.post("/feedings", async (req, res) => {
    try {
        const { date_time, notes, user_id } = req.body;
        const feedDescription = req.body.feed_description ?? req.body.feedDescription;

        if (!feedDescription || !String(feedDescription).trim()) {
            return res.status(400).json({ error: "feed_description is required" });
        }
        if (!date_time || Number.isNaN(new Date(date_time).getTime())) {
            return res.status(400).json({ error: "Valid date_time is required" });
        }
        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" });
        }

        const [newFeeding] = await db
            .insert(feedings)
            .values({
                date_time: new Date(date_time),
                feed_description: String(feedDescription).trim(),
                notes: notes ?? null,
                user_id: Number(user_id),
            })
            .returning();

        console.log("Sami was just fed");
        res.json(newFeeding);
    } catch (error) {
        console.error("Error adding feeding:", error);
        res.status(500).json({ error: "Failed to add feeding" });
    }
});

app.delete("/feedings/:id", async (req, res) => {
  try {
    const feedingId = Number(req.params.id);
    if (!Number.isInteger(feedingId) || feedingId <= 0) {
      return res.status(400).json({ error: "Valid feeding id is required" });
    }

    const [deleted] = await db.delete(feedings).where(eq(feedings.id, feedingId)).returning();
    if (!deleted) {
      return res.status(404).json({ error: "Feeding not found" });
    }

    return res.json(deleted);
  } catch (error) {
    console.error("Error deleting feeding:", error);
    return res.status(500).json({ error: "Failed to delete feeding" });
  }
});

app.post("/identify", async (req, res) => {
    try {    
        const email = normaliseEmail(req.body?.email);
        console.log("Attempting to identify user with email:", email);
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const [ user ] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const token = generateDeviceToken();
        const hashedToken = hashDeviceToken(token);

        await db.insert(user_devices).values({ 
                user_id: user.id, 
                token_hash: hashedToken, 
                last_seen: new Date()
        });

        console.log(`User ${user.email} identified successfully, device token generated.`);

        return res.json({ 
            token,
            user: {id: user.id, email: user.email, name: user.name}
        });
    }
    catch (error) {
        console.error("Error identifying user:", error);
        return res.status(500).json({ error: "Failed to identify user" });
    }
});

app.listen(3000, () => {
    console.log("Feeding API running on http://localhost:3000");
});
