require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const goalRoutes = require("./routes/goals");
const waterRoutes = require("./routes/water");
const calorieRoutes = require("./routes/calories");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "NutriZen AI API running" }));
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/calories", calorieRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
