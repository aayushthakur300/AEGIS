// backend/routes/analytics.js
const AnalysisLog = require("../models/AnalysisLog");

// Define a standalone function (Controller) instead of a Router
async function getAnalytics(req, res) {
  try {
    const data = await AnalysisLog.aggregate([
      { $group: { _id: "$normalized", count: { $sum: 1 } } }
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
}

// Export it as an object property to match 'const { getAnalytics }' in server.js
module.exports = { getAnalytics };