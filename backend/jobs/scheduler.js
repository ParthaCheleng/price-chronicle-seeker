// backend/jobs/scheduler.js
const { getPriceAtTimestamp } = require("../services/priceFetcher");
const { addDays, parseISO, isBefore } = require("date-fns");
const { v4: uuidv4 } = require("uuid");
const { jobProgressMap } = require("../utils/jobStore");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function scheduleFullHistory(tokenAddress, network, startDate, endDate) {
  const jobId = uuidv4();
  let current = parseISO(startDate);
  const end = parseISO(endDate);
  const totalDays = Math.ceil((end - current) / (1000 * 60 * 60 * 24));
  let fetchedCount = 0;

  jobProgressMap.set(jobId, {
    isRunning: true,
    progress: 0,
    totalFetched: 0,
    totalExpected: totalDays,
    isComplete: false,
    error: null,
  });

  while (isBefore(current, end)) {
    const timestamp = Math.floor(current.getTime() / 1000);
    try {
      const result = await getPriceAtTimestamp(tokenAddress, network, timestamp);

      // You can save or log the result here if needed
      fetchedCount++;

      jobProgressMap.set(jobId, {
        isRunning: true,
        progress: Math.round((fetchedCount / totalDays) * 100),
        totalFetched: fetchedCount,
        totalExpected: totalDays,
        isComplete: false,
        error: null,
      });

      await sleep(1000); // avoid rate limiting
    } catch (error) {
      console.error(`Failed on ${current.toISOString()}: ${error.message}`);
    }

    current = addDays(current, 1);
  }

  jobProgressMap.set(jobId, {
    isRunning: false,
    progress: 100,
    totalFetched: fetchedCount,
    totalExpected: totalDays,
    isComplete: true,
    error: null,
  });

  return jobId;
}

module.exports = {
  scheduleFullHistory,
  getJobProgress: (jobId) => jobProgressMap.get(jobId),
};
