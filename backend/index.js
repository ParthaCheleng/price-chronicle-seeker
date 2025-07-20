const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();


const allowedOrigins = [
  'https://token-chronicle-seeker.vercel.app', 
];

app.use(cors({
  origin: function (origin, callback) {
 
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ Route registration
const priceRoutes = require('./routes/price');
app.use('/', priceRoutes);

// ✅ Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
