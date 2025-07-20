// backend/routes/price.js

const express = require('express');
const router = express.Router();
const { getPriceAtTimestamp } = require('../services/priceFetcher');
const { scheduleFullHistory, getJobProgress } = require('../jobs/scheduler');
const { jobProgressMap } = require('../utils/jobStore');


// Get token price at timestamp
router.get('/price', async (req, res) => {
  const { token, network, timestamp } = req.query;
  try {
    const result = await getPriceAtTimestamp(token, network, timestamp);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create full history job (default date range)
router.post('/schedule', async (req, res) => {
  const { token, network } = req.body;

  const startDate = "2023-01-01";
  const endDate = new Date().toISOString().split("T")[0];

  try {
    const jobId = await scheduleFullHistory(token, network, startDate, endDate);
    res.json({ jobId });
  } catch (err) {
    console.error("Scheduler error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create full history job (custom date range)
router.post("/schedule-history", async (req, res) => {
  const { tokenAddress, network, startDate, endDate } = req.body;
  try {
    const jobId = await scheduleFullHistory(tokenAddress, network, startDate, endDate);
    res.status(200).json({ success: true, jobId });
  } catch (err) {
    console.error("Scheduler error:", err);
    res.status(500).json({ success: false, message: "Failed to schedule history" });
  }
});

// Progress polling endpoint
router.get('/progress', (req, res) => {
  const jobId = req.query.jobId;

  const progress = jobProgressMap.get(jobId);
  if (!progress) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(progress);
});

module.exports = router;
