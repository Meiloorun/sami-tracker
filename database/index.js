require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db } = require("./db.ts");
const { feedings, users, user_devices } = require("./src/db/schema.ts");
const { eq } = require("drizzle-orm");
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

app.get("/feedings", async (req, res) => {
    const result = await db.select().from(feedings)
    res.json(result);
});

app.get("/feedings/latest", async (req, res) => {
    const result = await db.select().from(feedings).orderBy(feedings.date_time).limit(1);
    res.json(result);
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
