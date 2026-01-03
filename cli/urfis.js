#!/usr/bin/env node
const fetch = require('node-fetch'); // npm install node-fetch@2

const SERVER_URL = "http://localhost:5000/api/analyze";
const args = process.argv.slice(2);
const logInput = args[0];

if (!logInput) {
  console.log("❌ Usage: node cli/urfis.js <error_log_string>");
  process.exit(1);
}

// ANSI Colors for Terminal "Red Box" Effect
const TERM = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m",
    bgRed: "\x1b[41m",
    white: "\x1b[37m"
};

async function runAnalysis() {
  console.log(`${TERM.cyan}🔍 URFIS: Scanning log for defects & silent killers...${TERM.reset}`);
  
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errorLog: logInput, privacyMode: true })
    });
    
    // Handle Server Failures
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    const result = await response.json();
    
    // --- 1. DISPLAY OUTPUT ---
    console.log(`\n${TERM.cyan}═══════════════════════ URFIS REPORT ═══════════════════════${TERM.reset}`);
    
    // THE TERMINAL "RED BOX"
    if (result.isSilentKiller) {
        console.log(`\n${TERM.bgRed}${TERM.white}${TERM.bold} 💀 SILENT KILLER DETECTED ${TERM.reset}`);
        console.log(`${TERM.red}${TERM.bold} TYPE: ${result.silentKillerType || "CRITICAL ANOMALY"}${TERM.reset}\n`);
    }

    console.log(`${TERM.bold}LANGUAGE:${TERM.reset}    ${result.language || 'Unknown'}`);
    
    // Severity Color Logic
    let sevColor = TERM.green;
    if (result.severity === 'Medium') sevColor = TERM.yellow;
    if (result.severity === 'High' || result.severity === 'Critical') sevColor = TERM.red;

    console.log(`${TERM.bold}SEVERITY:${TERM.reset}    ${sevColor}${result.severity} (Score: ${result.severityScore}/10)${TERM.reset}`);
    console.log(`${TERM.bold}ROOT CAUSE:${TERM.reset}  ${result.rootCause}`);
    console.log(`${TERM.bold}EXPLANATION:${TERM.reset} ${result.explanation}`);
    
    console.log(`\n${TERM.bold}🛠️  FIX:${TERM.reset}`);
    console.log(`${TERM.yellow}${result.fix}${TERM.reset}`);
    console.log(`${TERM.cyan}════════════════════════════════════════════════════════════${TERM.reset}\n`);

    // --- 2. CI/CD GATE LOGIC ---
    // Fail if Silent Killer OR Score >= 7 OR Severity is High/Critical
    const isCritical = result.isSilentKiller || 
                       (result.severityScore >= 7) || 
                       ['HIGH', 'CRITICAL'].includes(String(result.severity).toUpperCase());

    if (isCritical) {
      console.error(`${TERM.red}⛔ CI/CD GATE: BLOCKING BUILD due to ${result.isSilentKiller ? "SILENT KILLER" : "CRITICAL ERROR"}.${TERM.reset}`);
      process.exit(1); 
    } else {
      console.log(`${TERM.green}✅ CI/CD GATE: PASSED.${TERM.reset}`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`${TERM.red}❌ SYSTEM FAILURE: ${error.message}${TERM.reset}`);
    process.exit(1);
  }
}

runAnalysis();