const express = require("express");
const cors = require("cors");
const { db } = require("./db");
const { feedings } = require("./schema");
const { eq } = require("drizzle-orm");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/feedings", async (req, res) => {
    const result = await db.select().from(feedings).orderBy(feedings.date_time)
    res.json(result);
});

app.post("/feedings", async (req, res) => {
    const {date_time, notes} = req.body;
    const [newFeeding] = await db
        .insert(feedings)
        .values({ date_time: new Date(date_time), notes })
        .returning();
    res.json(newFeeding);
});

app.listen(3000, () => {
    console.log("Feeding API running on http://localhost:3000");
});