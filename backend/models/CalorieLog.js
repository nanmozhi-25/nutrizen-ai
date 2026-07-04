const mongoose = require("mongoose");

const calorieLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    entries: [
      {
        food: String,
        calories: Number,
      },
    ],
    goal: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

calorieLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("CalorieLog", calorieLogSchema);
