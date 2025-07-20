const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Allow requests only from your Vercel frontend domain
const allowedOrigins = [
  'https://token-chronicle-seeker.vercel.app', // Replace with your actual Vercel frontend domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

const priceRoutes = require('./routes/price');
app.use('/', priceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
