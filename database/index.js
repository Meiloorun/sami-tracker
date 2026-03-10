require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db } = require("./db.ts");
const { feedings } = require("./src/db/schema.ts");
const { eq } = require("drizzle-orm");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/feedings", async (req, res) => {
    const result = await db.select().from(feedings)
    res.json(result);
});

app.post("/feedings", async (req, res) => {
    const {date_time, notes} = req.body;
    const [newFeeding] = await db
        .insert(feedings)
        .values({ date_time: new Date(date_time), notes })
        .returning();
    console.log("Sami was just fed")
    res.json(newFeeding);
});

app.listen(3000, () => {
    console.log("Feeding API running on http://localhost:3000");
});