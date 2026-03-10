require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db } = require("./db.ts");
const { feedings } = require("./src/db/schema.ts");
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

app.post("/feedings", async (req, res) => {
    const {date_time, notes, user_id} = req.body;
    const [newFeeding] = await db
        .insert(feedings)
        .values({ date_time: new Date(date_time), notes, user_id })
        .returning();
    console.log("Sami was just fed")
    res.json(newFeeding);
});

app.post("/identify", async (req, res) => {
    try {    
        const { email } = normaliseEmail(req.body?.email);
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const token = generateDeviceToken();
        const hashedToken = hashDeviceToken(token);

        await db.insert(user_devices).values({ 
                user_id: user.id, 
                token_hash: hashedToken, 
                lastseen: new Date()
        });

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