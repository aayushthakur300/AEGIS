
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// require('dotenv').config(); 
// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// // ✅ IMPORT SUPREME ENGINES
// const { analyzeErrorWithGemini } = require("./routes/analyze"); // The Architect (AI)
// const { detectThreatsAndSilentKillers } = require("./utils/mlDetector"); // The Sentry (700+ Signatures)

// const { 
//   sanitizeLog, checkCache, saveToCache, 
//   generateJiraPayload 
// } = require("./utils/featureEngine");

// const app = express();
// app.use(express.json());
// app.use(cors());

// // ==========================================
// // 🎨 SENIOR DEV UTILS: LOGGING & PARSING
// // ==========================================
// const TERM = {
//     reset: "\x1b[0m",
//     green: "\x1b[32m",
//     yellow: "\x1b[33m",
//     blue: "\x1b[34m",
//     magenta: "\x1b[35m",
//     red: "\x1b[31m",
//     cyan: "\x1b[36m",
//     white: "\x1b[37m",
//     bgRed: "\x1b[41m",
//     bold: "\x1b[1m"
// };

// const completedJobs = new Map();

// function log(type, msg) {
//     const timestamp = new Date().toLocaleTimeString();
//     let color = TERM.reset;
//     if(type === "INFO") color = TERM.blue;
//     if(type === "SUCCESS") color = TERM.green;
//     if(type === "WARN") color = TERM.yellow;
//     if(type === "ERROR") color = TERM.red;
//     if(type === "WORKER") color = TERM.cyan;
//     if(type === "ALERT") color = TERM.bgRed + TERM.white + TERM.bold;
    
//     console.log(`${color}[${timestamp}] [${type}] ${msg}${TERM.reset}`);
// }

// function printTerminalReport(result) {
//     console.log(`\n${TERM.cyan}═══════════════════════ URFIS ANALYSIS REPORT ═══════════════════════${TERM.reset}`);
    
//     // Handle potential undefined values safely
//     const sev = result.severity || "UNKNOWN";
//     const score = result.severityScore || 0;
//     const cause = result.rootCause || "Unknown Cause";
//     const expl = result.explanation || "No details provided.";
//     const fix = result.fix || "No fix available.";

//     if (result.isSilentKiller) {
//         console.log(`${TERM.red}${TERM.bold}💀 THREAT DETECTED: ${result.silentKillerType || "CRITICAL ANOMALY"}${TERM.reset}`);
//     } else {
//         const isHigh = String(sev).toUpperCase() === 'HIGH' || String(sev).toUpperCase() === 'CRITICAL';
//         const statusIcon = isHigh ? "⚠️" : "✅";
//         const statusText = isHigh ? "HIGH RISK DETECTED" : "NORMAL OPERATION";
//         const color = isHigh ? TERM.yellow : TERM.green;
//         console.log(`${color}${statusIcon} THREAT STATUS:   ${statusText}${TERM.reset}`);
//     }

//     const severityColor = (String(sev).toUpperCase() === 'HIGH' || String(sev).toUpperCase() === 'CRITICAL') ? TERM.red : (String(sev).toUpperCase() === 'MED' ? TERM.yellow : TERM.green);
    
//     console.log(`${TERM.bold}📊 SEVERITY:${TERM.reset}      ${severityColor}${sev} (Score: ${score}/10)${TERM.reset}`);
//     console.log(`${TERM.bold}🔍 ROOT CAUSE:${TERM.reset}    ${cause}`);
//     console.log(`${TERM.bold}📝 EXPLANATION:${TERM.reset}   ${expl}`);
//     console.log(`${TERM.bold}🛠️  SUGGESTED FIX:${TERM.reset}`);
//     console.log(`${TERM.yellow}${fix}${TERM.reset}`);
//     console.log(`${TERM.cyan}═════════════════════════════════════════════════════════════════════\n${TERM.reset}`);
// }

// // ==========================================
// // 🏗️ ARCHITECTURE: SOCKET & WORKERS
// // ==========================================
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] } });

// const jobQueue = [];
// const processBackgroundJobs = async () => {
//     if (jobQueue.length > 0) {
//         const job = jobQueue.shift();
//         log("WORKER", `⚙️  Processing Job: ${job.id} (${job.type})`);
        
//         await new Promise(r => setTimeout(r, 2000));
        
//         const fileContent = `URFIS REPORT\nID: ${job.id}\nResult: ${JSON.stringify(job.data, null, 2)}`;
//         completedJobs.set(job.id, Buffer.from(fileContent));
        
//         const downloadUrl = `http://localhost:5000/api/download/${job.id}`;
        
//         io.emit("job_complete", { jobId: job.id, status: "COMPLETED", resultUrl: downloadUrl });
//         log("SUCCESS", `✅ Job ${job.id} Completed. Ready for download.`);
//     }
//     setTimeout(processBackgroundJobs, 1000); 
// };
// processBackgroundJobs();

// // ==========================================
// // 📡 API ROUTES
// // ==========================================

// // ✅ ROOT ROUTE (Fixes "Cannot GET /" error)
// app.get("/", (req, res) => {
//     res.send(`
//         <h1 style="color:green; font-family:monospace;">🟢 URFIS SERVER CONNECTED & ONLINE</h1>
//         <p style="font-family:monospace;">System is ready to analyze logs and source code.</p>
//     `);
// });

// app.get("/api/download/:id", (req, res) => {
//     if (completedJobs.has(parseInt(req.params.id)) || completedJobs.has(req.params.id)) {
//         res.setHeader('Content-Type', 'application/pdf'); 
//         res.setHeader('Content-Disposition', `attachment; filename=urfis_report_${req.params.id}.txt`);
//         res.send(completedJobs.get(parseInt(req.params.id)) || completedJobs.get(req.params.id));
//     } else res.status(404).send("File not found");
// });

// app.post("/api/analyze", async (req, res) => {
//   const { errorLog, language, privacyMode } = req.body;
  
//   // 1. RUN THE 700+ SIGNATURE SCAN (Instant Sentry)
//   const mlAnalysis = detectThreatsAndSilentKillers(errorLog);
//   const isSilentKiller = mlAnalysis.isSilentKiller;
//   const killerType = mlAnalysis.silentKillers.length > 0 ? mlAnalysis.silentKillers[0] : null;
  
//   if (isSilentKiller) log("ALERT", `💀 SILENT KILLER DETECTED: ${killerType}`);
//   if (mlAnalysis.isThreat) log("ALERT", `⚠️ SECURITY THREAT DETECTED: ${mlAnalysis.threats[0]}`);

//   try {
//     const finalLog = privacyMode ? sanitizeLog(errorLog) : errorLog;
    
//     // 2. Check Cache (Skip for source code to force fresh analysis)
//     const isSourceCode = finalLog.includes("int ") || finalLog.includes("function") || finalLog.includes("def ");
//     const cacheResult = checkCache(finalLog);
    
//     if (cacheResult.cached && !isSourceCode) {
//         if (isSilentKiller) {
//              cacheResult.isSilentKiller = true;
//              cacheResult.silentKillerType = killerType;
//              cacheResult.severity = "CRITICAL";
//              cacheResult.severityScore = 10;
//         }
//         log("SUCCESS", `⚡ Cache Hit!`);
//         printTerminalReport(cacheResult);
//         io.emit("new_incident", { type: isSilentKiller?"💀 SILENT KILLER":"CACHE_HIT", severity: cacheResult.severity, timestamp: new Date() });
//         return res.json(cacheResult);
//     }

//     // 3. CALL INTELLIGENT AI WRAPPER (The Architect)
//     // We pass the ML findings as context so the AI knows what to look for.
//     const context = {
//         detectedThreats: mlAnalysis.threats,
//         detectedSilentKillers: mlAnalysis.silentKillers,
//         entropyScore: mlAnalysis.entropyScore
//     };

//     // This handles the matrix logic, round-robin, and prompt generation internally
//     let result = await analyzeErrorWithGemini(finalLog, language || "auto-detect", context);

//     // 4. MERGE RESULTS (Heuristics + AI)
//     // If ML found a Silent Killer, force the flag to TRUE even if AI missed it (Safety Net).
//     if (isSilentKiller) {
//         result.isSilentKiller = true;
//         result.silentKillerType = killerType;
//         result.severity = "CRITICAL";
//         result.severityScore = 10;
        
//         // Ensure root cause mentions the specific detected pattern
//         if (!result.rootCause || !String(result.rootCause).toUpperCase().includes("CRITICAL")) {
//              result.rootCause = `CRITICAL: ${killerType}`;
//         }
        
//         // Ensure explanation mentions the heuristic detection
//         if (!result.explanation || String(result.explanation).includes("Unknown")) {
//              result.explanation = `Heuristic Scan detected a '${killerType}' pattern. This is a known high-risk failure mode matched against our knowledge base.`;
//         }
//     } 
//     // If ML found a Security Threat (SQLi, etc.)
//     else if (mlAnalysis.isThreat) {
//         result.severity = "CRITICAL";
//         result.severityScore = 10;
//         result.rootCause = `SECURITY THREAT: ${mlAnalysis.threats[0]}`;
//     }
//     else {
//         // Explicitly set false so frontend doesn't show Red Box unnecessarily
//         result.isSilentKiller = false;
//     }

//     // 5. Save & Respond
//     result.jiraPayload = generateJiraPayload(result);
//     saveToCache(cacheResult.hash, result);

//     printTerminalReport(result);
//     io.emit("new_incident", { type: result.isSilentKiller?"💀 SILENT KILLER":"NEW_ANALYSIS", severity: result.severity, cause: result.rootCause, timestamp: new Date() });
//     res.json(result);

//   } catch (error) { 
//       console.error(error);
//       res.status(500).json({ error: "Analysis Failed" }); 
//   }
// });

// app.post("/api/export-pdf-async", (req, res) => {
//     const jobId = Date.now();
//     jobQueue.push({ id: jobId, type: "PDF", data: req.body.analysisData });
//     res.json({ message: "Queued", jobId });
// });

// app.post("/api/search", async (req, res) => res.json({keywords:[]}));

// app.post("/api/chat", async (req, res) => {
//     const result = await analyzeErrorWithGemini(`Context: ${req.body.context}. User Question: ${req.body.message}`, "Chat Mode", {});
//     const replyText = result.explanation || JSON.stringify(result);
//     res.json({ reply: replyText });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`[Server] Server is running on http://localhost:${PORT}`);
//   console.log(`[Server] AEGIS ACTIVE: 700+ Signatures Loaded. AI Architect Online.`);
// });
//-----------------------------------------------------------------------------------------------------------------------
require('dotenv').config(); 
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');

// ✅ IMPORT SUPREME ENGINES
const { analyzeErrorWithGemini } = require("./routes/analyze"); // The Architect (AI)
const { detectThreatsAndSilentKillers } = require("./utils/mlDetector"); // The Sentry (700+ Signatures)

const { 
  sanitizeLog, checkCache, saveToCache, 
  generateJiraPayload 
} = require("./utils/featureEngine");

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 🎨 SENIOR DEV UTILS: LOGGING & PARSING
// ==========================================
const TERM = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bgRed: "\x1b[41m",
    bold: "\x1b[1m"
};

const completedJobs = new Map();

function log(type, msg) {
    const timestamp = new Date().toLocaleTimeString();
    let color = TERM.reset;
    if(type === "INFO") color = TERM.blue;
    if(type === "SUCCESS") color = TERM.green;
    if(type === "WARN") color = TERM.yellow;
    if(type === "ERROR") color = TERM.red;
    if(type === "WORKER") color = TERM.cyan;
    if(type === "ALERT") color = TERM.bgRed + TERM.white + TERM.bold;
    
    console.log(`${color}[${timestamp}] [${type}] ${msg}${TERM.reset}`);
}

function printTerminalReport(result) {
    console.log(`\n${TERM.cyan}═══════════════════════ AEGIS ANALYSIS REPORT ═══════════════════════${TERM.reset}`);
    
    const sev = result.severity || "UNKNOWN";
    const score = result.severityScore || 0;
    const cause = result.rootCause || "Unknown Cause";
    const expl = result.explanation || "No details provided.";
    const fix = result.fix || "No fix available.";

    if (result.isSilentKiller) {
        console.log(`${TERM.red}${TERM.bold}💀 THREAT DETECTED: ${result.silentKillerType || "CRITICAL ANOMALY"}${TERM.reset}`);
    } else {
        const isHigh = String(sev).toUpperCase() === 'HIGH' || String(sev).toUpperCase() === 'CRITICAL';
        const statusIcon = isHigh ? "⚠️" : "✅";
        const statusText = isHigh ? "HIGH RISK DETECTED" : "NORMAL OPERATION";
        const color = isHigh ? TERM.yellow : TERM.green;
        console.log(`${color}${statusIcon} THREAT STATUS:   ${statusText}${TERM.reset}`);
    }
    
    console.log(`${TERM.bold}📊 SEVERITY:${TERM.reset}      ${sev} (Score: ${score}/10)`);
    console.log(`${TERM.bold}🔍 ROOT CAUSE:${TERM.reset}    ${cause}`);
    console.log(`${TERM.bold}🛠️  SUGGESTED FIX:${TERM.reset}`);
    console.log(`${TERM.yellow}${fix}${TERM.reset}`);
    console.log(`${TERM.cyan}═════════════════════════════════════════════════════════════════════\n${TERM.reset}`);
}

// ==========================================
// 🏗️ ARCHITECTURE: SOCKET & WORKERS
// ==========================================
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const jobQueue = [];
const processBackgroundJobs = async () => {
    if (jobQueue.length > 0) {
        const job = jobQueue.shift();
        log("WORKER", `⚙️  Processing Job: ${job.id} (${job.type})`);
        
        await new Promise(r => setTimeout(r, 2000)); // Simulate processing
        
        const fileContent = `AEGIS REPORT\nID: ${job.id}\nResult: ${JSON.stringify(job.data, null, 2)}`;
        completedJobs.set(job.id, Buffer.from(fileContent));
        
        const downloadUrl = `http://localhost:${process.env.PORT || 5000}/api/download/${job.id}`;
        
        io.emit("job_complete", { jobId: job.id, status: "COMPLETED", resultUrl: downloadUrl });
        log("SUCCESS", `✅ Job ${job.id} Completed.`);
    }
    setTimeout(processBackgroundJobs, 1000); 
};
processBackgroundJobs();

// ==========================================
// 1. API ROUTES (Data Layer) - PRIORITY #1
// ==========================================

// ✅ DOWNLOAD ROUTE
app.get("/api/download/:id", (req, res) => {
    if (completedJobs.has(parseInt(req.params.id)) || completedJobs.has(req.params.id)) {
        res.setHeader('Content-Type', 'text/plain'); 
        res.setHeader('Content-Disposition', `attachment; filename=aegis_report_${req.params.id}.txt`);
        res.send(completedJobs.get(parseInt(req.params.id)) || completedJobs.get(req.params.id));
    } else res.status(404).send("File not found");
});

// ✅ SEARCH ROUTE (Restored from your original code)
app.post("/api/search", async (req, res) => res.json({keywords:[]}));

// ✅ MAIN ANALYSIS ROUTE
app.post("/api/analyze", async (req, res) => {
  const { errorLog, language, privacyMode } = req.body;
  
  // 1. RUN THE 700+ SIGNATURE SCAN
  const mlAnalysis = detectThreatsAndSilentKillers(errorLog);
  const isSilentKiller = mlAnalysis.isSilentKiller;
  const killerType = mlAnalysis.silentKillers.length > 0 ? mlAnalysis.silentKillers[0] : null;
  
  if (isSilentKiller) log("ALERT", `💀 SILENT KILLER DETECTED: ${killerType}`);
  if (mlAnalysis.isThreat) log("ALERT", `⚠️ SECURITY THREAT DETECTED: ${mlAnalysis.threats[0]}`);

  try {
    const finalLog = privacyMode ? sanitizeLog(errorLog) : errorLog;
    const isSourceCode = finalLog.includes("int ") || finalLog.includes("function") || finalLog.includes("def ");
    const cacheResult = checkCache(finalLog);
    
    if (cacheResult.cached && !isSourceCode) {
        if (isSilentKiller) {
             cacheResult.isSilentKiller = true;
             cacheResult.silentKillerType = killerType;
             cacheResult.severity = "CRITICAL";
             cacheResult.severityScore = 10;
        }
        log("SUCCESS", `⚡ Cache Hit!`);
        printTerminalReport(cacheResult);
        io.emit("new_incident", { type: isSilentKiller?"💀 SILENT KILLER":"CACHE_HIT", severity: cacheResult.severity, timestamp: new Date() });
        return res.json(cacheResult);
    }

    const context = {
        detectedThreats: mlAnalysis.threats,
        detectedSilentKillers: mlAnalysis.silentKillers,
        entropyScore: mlAnalysis.entropyScore
    };

    let result = await analyzeErrorWithGemini(finalLog, language || "auto-detect", context);

    if (isSilentKiller) {
        result.isSilentKiller = true;
        result.silentKillerType = killerType;
        result.severity = "CRITICAL";
        result.severityScore = 10;
        if (!result.rootCause || !String(result.rootCause).toUpperCase().includes("CRITICAL")) {
             result.rootCause = `CRITICAL: ${killerType}`;
        }
    } else if (mlAnalysis.isThreat) {
        result.severity = "CRITICAL";
        result.severityScore = 10;
        result.rootCause = `SECURITY THREAT: ${mlAnalysis.threats[0]}`;
    } else {
        result.isSilentKiller = false;
    }

    result.jiraPayload = generateJiraPayload(result);
    saveToCache(cacheResult.hash, result);

    printTerminalReport(result);
    io.emit("new_incident", { type: result.isSilentKiller?"💀 SILENT KILLER":"NEW_ANALYSIS", severity: result.severity, cause: result.rootCause, timestamp: new Date() });
    res.json(result);

  } catch (error) { 
      console.error(error);
      res.status(500).json({ error: "Analysis Failed" }); 
  }
});

// ✅ PDF QUEUE
app.post("/api/export-pdf-async", (req, res) => {
    const jobId = Date.now();
    jobQueue.push({ id: jobId, type: "PDF", data: req.body.analysisData });
    res.json({ message: "Queued", jobId });
});

// ✅ CHAT BOT API
app.post("/api/chat", async (req, res) => {
    try {
        const { message, context } = req.body;
        const chatPrompt = `CONTEXT: ${context}\nUSER QUESTION: "${message}"\nProvide a technical answer as a Senior Engineer.`;
        const result = await analyzeErrorWithGemini(chatPrompt, "Chat Mode", {});
        const replyText = result.explanation || result.fix || "I analyzed your request.";
        res.json({ reply: replyText });
    } catch (e) {
        console.error("Chat Error:", e);
        res.status(500).json({ reply: "System Error: Unable to process chat." });
    }
});

// ==========================================
// 2. SERVE REACT DASHBOARD - PRIORITY #2
// ==========================================
// 👇 IMPORTANT: Correct path to FRONTEND folder
const clientBuildPath = path.join(__dirname, '../frontend/dist'); 

// 1. Serve Static Assets (JS/CSS) at /dashboard URL
app.use('/dashboard', express.static(clientBuildPath));

// 2. Serve index.html for React Router
app.get(/^\/dashboard\/.*$/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ==========================================
// 3. SERVE LANDING PAGE - PRIORITY #3
// ==========================================
// Serve public assets (your client.html) at the Root URL
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

// ==========================================
// 4. FALLBACK & START
// ==========================================
app.get(/.*/, (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] AEGIS ACTIVE on http://localhost:${PORT}`);
  console.log(`   👉 Landing:   http://localhost:${PORT}/`);
  console.log(`   👉 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`[Server] 700+ Signatures Loaded. AI Architect Online.`);
});