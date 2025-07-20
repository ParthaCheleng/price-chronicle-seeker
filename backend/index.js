const express = require("express");
const cors = require("cors");
require("dotenv").config();

const priceRoutes = require("./routes/price");
const scheduleRoutes = require("./routes/scheduler");

const app = express();

// ✅ Correct CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://token-chronicle-seeker.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Apply JSON middleware AFTER CORS
app.use(express.json());

// ✅ Then routes
app.use("/price", priceRoutes);
app.use("/schedule-history", scheduleRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
