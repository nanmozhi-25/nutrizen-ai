const express = require("express");
const WaterLog = require("../models/WaterLog");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/water/:date  (date = YYYY-MM-DD)
router.get("/:date", async (req, res) => {
  let log = await WaterLog.findOne({ user: req.userId, date: req.params.date });
  if (!log) log = { date: req.params.date, glasses: 0, goal: 8 };
  res.json(log);
});

// PUT /api/water/:date  — upsert today's glasses/goal
router.put("/:date", async (req, res) => {
  const { glasses, goal } = req.body;
  const log = await WaterLog.findOneAndUpdate(
    { user: req.userId, date: req.params.date },
    { $set: { ...(glasses !== undefined && { glasses }), ...(goal !== undefined && { goal }) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(log);
});

// GET /api/water?days=7  — last N days for the weekly chart
router.get("/", async (req, res) => {
  const days = Number(req.query.days) || 7;
  const logs = await WaterLog.find({ user: req.userId }).sort({ date: -1 }).limit(days);
  res.json(logs);
});

module.exports = router;
