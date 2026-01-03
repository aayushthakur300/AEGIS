
// require('dotenv').config(); 
// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// // ✅ IMPORT INTELLIGENT AI WRAPPER
// const { analyzeErrorWithGemini } = require("./routes/analyze");

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
// // 🕵️ INTELLIGENT PATTERN SCANNER (40+ Silent Killers)
// // ==========================================
// const detectSilentKillerType = (logText) => {
//     const lower = logText.toLowerCase();

//     // --- 0. SOURCE CODE & LOGIC ERRORS (C++, Go, etc.) ---
//     // Note: Simple syntax errors are NOT silent killers. 
//     // We only flag logic that causes hangs, crashes, or corruption.
//     if (lower.includes("/ 0") || (lower.includes("/ b") && lower.includes("b = 0"))) return "DIVISION BY ZERO";
//     if (lower.includes("thread") && lower.includes("counter++") && !lower.includes("atomic") && !lower.includes("mutex")) return "RACE CONDITION (DATA RACE)";
//     if (lower.includes("sizeof") && lower.includes("malloc") && !lower.includes("*")) return "INCORRECT MEMORY ALLOCATION";
    
//     // --- 1. MEMORY & RESOURCE LEAKS ---
//     if (lower.includes("maxlistenersexceeded") || lower.includes("eventemitter memory leak")) return "EVENT EMITTER LEAK";
//     if (lower.includes("heap out of memory") || lower.includes("ineffective mark-compacts")) return "HEAP OVERFLOW CRASH";
//     if (lower.includes("gc overhead limit exceeded")) return "GC OVERHEAD LIMIT EXCEEDED";
//     if (lower.includes("outofmemoryerror: metaspace")) return "JAVA METASPACE LEAK";
//     if (lower.includes("emfile") || lower.includes("too many open files")) return "FILE DESCRIPTOR EXHAUSTION";
//     if (lower.includes("socket hang up") || lower.includes("econnreset")) return "TCP CONNECTION RESET";

//     // --- 2. CONCURRENCY & THREADING ---
//     if (lower.includes("deadlock") || lower.includes("lock wait timeout")) return "DATABASE DEADLOCK";
//     if (lower.includes("zombie") || lower.includes("defunct")) return "ZOMBIE PROCESS";
//     if (lower.includes("blocked by global interpreter lock")) return "GIL CONTENTION";
//     if (lower.includes("thread starvation")) return "THREAD STARVATION";
//     if (lower.includes("race condition")) return "RACE CONDITION DETECTED";
//     if (lower.includes("concurrentmodificationexception")) return "CONCURRENT MODIFICATION";

//     // --- 3. INFRASTRUCTURE & LIMITS ---
//     if (lower.includes("connection pool exhausted") || lower.includes("pool size exceeded")) return "CONNECTION POOL EXHAUSTION";
//     if (lower.includes("timeout waiting for idle object")) return "CONNECTION POOL TIMEOUT";
//     if (lower.includes("no space left on device")) return "DISK SPACE EXHAUSTED";
//     if (lower.includes("fork: retry: resource temporarily unavailable")) return "PID/THREAD EXHAUSTION";
//     if (lower.includes("ephemeral port exhaustion")) return "EPHEMERAL PORT EXHAUSTION";
//     if (lower.includes("clock skew detected")) return "SYSTEM CLOCK SKEW";

//     // --- 4. PERFORMANCE & LATENCY ---
//     if (lower.includes("process.nexttick starvation")) return "EVENT LOOP STARVATION";
//     if (lower.includes("slow query detected")) return "SLOW QUERY PERFORMANCE";
//     if (lower.includes("catastrophic backtracking") || lower.includes("redos")) return "REGEX DENIAL OF SERVICE (ReDoS)";
//     if (lower.includes("n+1 query problem")) return "N+1 QUERY ANTI-PATTERN";
//     if (lower.includes("request entity too large")) return "PAYLOAD SIZE EXCEEDED";

//     // --- 5. LOGIC & DATA INTEGRITY ---
//     if (lower.includes("unhandledpromiserejection")) return "UNHANDLED PROMISE REJECTION";
//     if (lower.includes("converting circular structure to json")) return "JSON CIRCULAR REFERENCE";
//     if (lower.includes("floating point precision error")) return "FLOATING POINT DRIFT";
//     if (lower.includes("integer overflow")) return "INTEGER OVERFLOW";
//     if (lower.includes("deprecationwarning")) return "DEPRECATION TIME BOMB";
//     if (lower.includes("transaction rolled back")) return "SILENT TRANSACTION ROLLBACK";

//     // --- 6. SECURITY TIME BOMBS ---
//     if (lower.includes("cross-origin request blocked")) return "CORS POLICY VIOLATION";
//     if (lower.includes("mixed content")) return "MIXED CONTENT SECURITY";
//     if (lower.includes("certificate has expired")) return "SSL CERTIFICATE EXPIRED";
//     if (lower.includes("rate limit exceeded")) return "API RATE LIMIT EXCEEDED";
//     if (lower.includes("zip bomb detected")) return "COMPRESSION BOMB DETECTED";
//     if (lower.includes("invalid csrf token")) return "CSRF TOKEN MISMATCH";

//     return null;
// };

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
//   const { errorLog, privacyMode } = req.body;
  
//   // 1. Detect known patterns (Source Code Logic OR Log Signature)
//   const killerType = detectSilentKillerType(errorLog);
//   const isSilentKiller = killerType !== null;
  
//   if (isSilentKiller) log("ALERT", `💀 SILENT KILLER DETECTED: ${killerType}`);

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

//     // 3. CALL INTELLIGENT AI WRAPPER (From routes/analyze.js)
//     const context = {
//         isSourceCode,
//         isSilentKiller,
//         killerType
//     };

//     // This handles the matrix logic, round-robin, and prompt generation internally
//     let result = await analyzeErrorWithGemini(finalLog, "auto-detect", context);

//     // 4. Merge Heuristics: ONLY flag if Silent Killer was actually detected
//     if (isSilentKiller) {
//         result.isSilentKiller = true;
//         result.silentKillerType = killerType;
//         result.severity = "CRITICAL";
//         result.severityScore = 10;
//         // Prefix root cause if not already emphatic
//         if (!result.rootCause || !String(result.rootCause).toUpperCase().includes("CRITICAL")) {
//              result.rootCause = `CRITICAL: ${killerType}`;
//         }
//         // Ensure explanation mentions the heuristic detection
//         if (!result.explanation || String(result.explanation).includes("Unknown")) {
//              result.explanation = `Heuristic Scan detected a '${killerType}' pattern. This is a known high-risk failure mode.`;
//         }
//     } else {
//         // Explicitly set false so frontend doesn't show Red Box
//         result.isSilentKiller = false;
//         // AI still determines severity/score, but the "Killer" flag is off
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
//   console.log(`[Server] Ready to detect 20+ languages and 100+ failure types.`);
// });
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
require('dotenv').config(); 
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

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
    console.log(`\n${TERM.cyan}═══════════════════════ URFIS ANALYSIS REPORT ═══════════════════════${TERM.reset}`);
    
    // Handle potential undefined values safely
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

    const severityColor = (String(sev).toUpperCase() === 'HIGH' || String(sev).toUpperCase() === 'CRITICAL') ? TERM.red : (String(sev).toUpperCase() === 'MED' ? TERM.yellow : TERM.green);
    
    console.log(`${TERM.bold}📊 SEVERITY:${TERM.reset}      ${severityColor}${sev} (Score: ${score}/10)${TERM.reset}`);
    console.log(`${TERM.bold}🔍 ROOT CAUSE:${TERM.reset}    ${cause}`);
    console.log(`${TERM.bold}📝 EXPLANATION:${TERM.reset}   ${expl}`);
    console.log(`${TERM.bold}🛠️  SUGGESTED FIX:${TERM.reset}`);
    console.log(`${TERM.yellow}${fix}${TERM.reset}`);
    console.log(`${TERM.cyan}═════════════════════════════════════════════════════════════════════\n${TERM.reset}`);
}

// ==========================================
// 🏗️ ARCHITECTURE: SOCKET & WORKERS
// ==========================================
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] } });

const jobQueue = [];
const processBackgroundJobs = async () => {
    if (jobQueue.length > 0) {
        const job = jobQueue.shift();
        log("WORKER", `⚙️  Processing Job: ${job.id} (${job.type})`);
        
        await new Promise(r => setTimeout(r, 2000));
        
        const fileContent = `URFIS REPORT\nID: ${job.id}\nResult: ${JSON.stringify(job.data, null, 2)}`;
        completedJobs.set(job.id, Buffer.from(fileContent));
        
        const downloadUrl = `http://localhost:5000/api/download/${job.id}`;
        
        io.emit("job_complete", { jobId: job.id, status: "COMPLETED", resultUrl: downloadUrl });
        log("SUCCESS", `✅ Job ${job.id} Completed. Ready for download.`);
    }
    setTimeout(processBackgroundJobs, 1000); 
};
processBackgroundJobs();

// ==========================================
// 📡 API ROUTES
// ==========================================

// ✅ ROOT ROUTE (Fixes "Cannot GET /" error)
app.get("/", (req, res) => {
    res.send(`
        <h1 style="color:green; font-family:monospace;">🟢 URFIS SERVER CONNECTED & ONLINE</h1>
        <p style="font-family:monospace;">System is ready to analyze logs and source code.</p>
    `);
});

app.get("/api/download/:id", (req, res) => {
    if (completedJobs.has(parseInt(req.params.id)) || completedJobs.has(req.params.id)) {
        res.setHeader('Content-Type', 'application/pdf'); 
        res.setHeader('Content-Disposition', `attachment; filename=urfis_report_${req.params.id}.txt`);
        res.send(completedJobs.get(parseInt(req.params.id)) || completedJobs.get(req.params.id));
    } else res.status(404).send("File not found");
});

app.post("/api/analyze", async (req, res) => {
  const { errorLog, language, privacyMode } = req.body;
  
  // 1. RUN THE 700+ SIGNATURE SCAN (Instant Sentry)
  const mlAnalysis = detectThreatsAndSilentKillers(errorLog);
  const isSilentKiller = mlAnalysis.isSilentKiller;
  const killerType = mlAnalysis.silentKillers.length > 0 ? mlAnalysis.silentKillers[0] : null;
  
  if (isSilentKiller) log("ALERT", `💀 SILENT KILLER DETECTED: ${killerType}`);
  if (mlAnalysis.isThreat) log("ALERT", `⚠️ SECURITY THREAT DETECTED: ${mlAnalysis.threats[0]}`);

  try {
    const finalLog = privacyMode ? sanitizeLog(errorLog) : errorLog;
    
    // 2. Check Cache (Skip for source code to force fresh analysis)
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

    // 3. CALL INTELLIGENT AI WRAPPER (The Architect)
    // We pass the ML findings as context so the AI knows what to look for.
    const context = {
        detectedThreats: mlAnalysis.threats,
        detectedSilentKillers: mlAnalysis.silentKillers,
        entropyScore: mlAnalysis.entropyScore
    };

    // This handles the matrix logic, round-robin, and prompt generation internally
    let result = await analyzeErrorWithGemini(finalLog, language || "auto-detect", context);

    // 4. MERGE RESULTS (Heuristics + AI)
    // If ML found a Silent Killer, force the flag to TRUE even if AI missed it (Safety Net).
    if (isSilentKiller) {
        result.isSilentKiller = true;
        result.silentKillerType = killerType;
        result.severity = "CRITICAL";
        result.severityScore = 10;
        
        // Ensure root cause mentions the specific detected pattern
        if (!result.rootCause || !String(result.rootCause).toUpperCase().includes("CRITICAL")) {
             result.rootCause = `CRITICAL: ${killerType}`;
        }
        
        // Ensure explanation mentions the heuristic detection
        if (!result.explanation || String(result.explanation).includes("Unknown")) {
             result.explanation = `Heuristic Scan detected a '${killerType}' pattern. This is a known high-risk failure mode matched against our knowledge base.`;
        }
    } 
    // If ML found a Security Threat (SQLi, etc.)
    else if (mlAnalysis.isThreat) {
        result.severity = "CRITICAL";
        result.severityScore = 10;
        result.rootCause = `SECURITY THREAT: ${mlAnalysis.threats[0]}`;
    }
    else {
        // Explicitly set false so frontend doesn't show Red Box unnecessarily
        result.isSilentKiller = false;
    }

    // 5. Save & Respond
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

app.post("/api/export-pdf-async", (req, res) => {
    const jobId = Date.now();
    jobQueue.push({ id: jobId, type: "PDF", data: req.body.analysisData });
    res.json({ message: "Queued", jobId });
});

app.post("/api/search", async (req, res) => res.json({keywords:[]}));

app.post("/api/chat", async (req, res) => {
    const result = await analyzeErrorWithGemini(`Context: ${req.body.context}. User Question: ${req.body.message}`, "Chat Mode", {});
    const replyText = result.explanation || JSON.stringify(result);
    res.json({ reply: replyText });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Server is running on http://localhost:${PORT}`);
  console.log(`[Server] AEGIS ACTIVE: 700+ Signatures Loaded. AI Architect Online.`);
});