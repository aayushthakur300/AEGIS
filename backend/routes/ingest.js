// backend/routes/ingest.js

// 1. Go up one level (..) to 'backend', then into 'models'
const CrashLog = require('../models/CrashLog');
const AnalysisLog = require('../models/AnalysisLog');

// 2. Go up one level (..) to 'backend', then into 'core'
// Note: Based on your screenshots, signatureEngine, mlDetector, etc., are in the 'core' folder
const { matchSignature } = require("../core/signatureEngine");
const { detectThreatsAndSilentKillers } = require("../core/mlDetector");
const { detectLanguage } = require("../core/languageDetector");

// 3. 'analyze.js' is in the same 'routes' folder as this file
const { analyzeErrorWithGemini } = require("./analyze");

async function ingestLog(req, res) {
  console.log("===================================================");
  console.log(`[Ingest] Incoming Request at ${new Date().toISOString()}`);

  const { logs } = req.body;
  if (!logs) {
    console.error("[Ingest] Error: No logs provided in body.");
    return res.status(400).json({ error: "No log provided" });
  }

  try {
    // 1. Save Raw Crash Log
    const newCrash = await CrashLog.create({
      rawLog: logs,
      timestamp: new Date(),
    });
    console.log(`[Ingest] Raw log saved with ID: ${newCrash._id}`);

    // 2. Identify Language
    const detectedLang = detectLanguage(logs);

    // 3. ML & Heuristic Check (Security + Silent Killers)
    const heuristics = detectThreatsAndSilentKillers(logs);
    
    let analysisResult = null;

    // 4. Check Database Signatures (Tier 1 - Fast)
    console.log("[Ingest] Checking Tier 1 Signatures...");
    const signatureMatch = await matchSignature(logs);

    if (signatureMatch) {
      console.log("[Ingest] Tier 1 Hit! Returning cached solution.");
      analysisResult = {
        language: detectedLang,
        rootCause: "Known Pattern Match",
        severity: heuristics.isThreat ? "Critical" : "High", // Elevate if threat detected
        fix: signatureMatch.fix,
        isSilentKiller: heuristics.isSilentKiller,
        explanation: "Matched a known runtime error pattern in the database."
      };
    } else {
      // 5. Tier 2: AI Analysis
      console.log("[Ingest] Tier 1 Miss. Escalating to Tier 2 (Gemini AI)...");
      analysisResult = await analyzeErrorWithGemini(logs, detectedLang, heuristics);
    }

    // 6. Save Analysis Result
    const newAnalysis = await AnalysisLog.create({
      crashId: newCrash._id,
      ...analysisResult
    });

    console.log(`[Ingest] Analysis complete. Saved Analysis ID: ${newAnalysis._id}`);
    console.log("===================================================");

    res.json(analysisResult);

  } catch (err) {
    console.error("[Ingest] Critical Internal Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { ingestLog };