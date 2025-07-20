const express = require("express");
const cors = require("cors");
require("dotenv").config();

const priceRoutes = require("./routes/price");
const scheduleRoutes = require("./routes/scheduler");

const app = express();

// ✅ CORS setup for local + Vercel frontend access
const allowedOrigins = [
  "http://localhost:5173",
  "https://token-chronicle-seeker.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ✅ JSON middleware
app.use(express.json());

// ✅ API routes
app.use("/price", priceRoutes);
app.use("/schedule-history", scheduleRoutes);

// ✅ Health check route (optional but useful for Railway/Vercel)
app.get("/", (req, res) => {
  res.send("✅ Price Chronicle Seeker API is live");
});

// ✅ Global error handler (optional, helps debug better)
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
