const express = require("express");
const Goal = require("../models/Goal");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth); // every route below requires a valid token

// GET /api/goals
router.get("/", async (req, res) => {
  const goals = await Goal.find({ user: req.userId }).sort({ createdAt: 1 });
  res.json(goals);
});

// POST /api/goals
router.post("/", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Goal text is required" });
  const goal = await Goal.create({ user: req.userId, text });
  res.status(201).json(goal);
});

// PATCH /api/goals/:id  — toggle done
router.patch("/:id", async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.userId });
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  goal.done = !goal.done;
  await goal.save();
  res.json(goal);
});

// DELETE /api/goals/:id
router.delete("/:id", async (req, res) => {
  await Goal.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ success: true });
});

module.exports = router;
