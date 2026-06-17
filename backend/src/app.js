const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const entryRoutes = require("./routes/entryRoutes");
const journalRoutes = require("./routes/journalRoutes");
const insightsRoutes = require("./routes/insightsRoutes");

require("dotenv").config();
console.log("URL:", process.env.DATABASE_URL);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/insights", insightsRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database Connected ✅",
      time: result.rows[0],
    });
  } catch (err) {
    console.log("========== ERROR START ==========");
    console.log(err);
    console.log("NAME:", err.name);
    console.log("MESSAGE:", err.message);
    console.log("CODE:", err.code);
    console.log("========== ERROR END ==========");

    res.status(500).json({
      message: "Database Connection Failed ❌",
      errorName: err.name,
      errorMessage: err.message,
      errorCode: err.code,
    });
  }
});
app.get(
  "/api/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected Route Accessed",
      user: req.user,
    });
  }
);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});