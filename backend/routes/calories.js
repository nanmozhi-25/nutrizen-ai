const express = require("express");
const CalorieLog = require("../models/CalorieLog");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/calories/:date
router.get("/:date", async (req, res) => {
  let log = await CalorieLog.findOne({ user: req.userId, date: req.params.date });
  if (!log) log = { date: req.params.date, entries: [], goal: 2000 };
  res.json(log);
});

// POST /api/calories/:date  — add a food entry for that day
router.post("/:date", async (req, res) => {
  const { food, calories } = req.body;
  if (!food || calories === undefined) {
    return res.status(400).json({ message: "food and calories are required" });
  }

  const log = await CalorieLog.findOneAndUpdate(
    { user: req.userId, date: req.params.date },
    { $push: { entries: { food, calories } } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(log);
});

// PUT /api/calories/:date/goal  — update daily calorie goal
router.put("/:date/goal", async (req, res) => {
  const { goal } = req.body;
  const log = await CalorieLog.findOneAndUpdate(
    { user: req.userId, date: req.params.date },
    { $set: { goal } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(log);
});

// GET /api/calories?days=7  — last N days for the weekly chart
router.get("/", async (req, res) => {
  const days = Number(req.query.days) || 7;
  const logs = await CalorieLog.find({ user: req.userId }).sort({ date: -1 }).limit(days);
  res.json(logs);
});

module.exports = router;
