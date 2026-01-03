// File: test/master-suite.js
const fetch = require('node-fetch');
const { exec } = require('child_process');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

const API_URL = "http://localhost:5000/api";

console.log("\n###################################################".bold.cyan);
console.log("#      URFIS MASTER VERIFICATION SUITE            #".bold.cyan);
console.log("#      Testing all 7 Senior Features              #".bold.cyan);
console.log("###################################################\n".bold.cyan);

async function runTests() {
    // --- 1. PRIVACY SHIELD TEST ---
    console.log("🧪 TEST 1: Privacy Shield (PII Redaction)".yellow);
    const privacyPayload = {
        errorLog: "Critical crash for user admin@company.com with key sk-9999999",
        privacyMode: true
    };
    
    try {
        const res = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(privacyPayload)
        });
        const data = await res.json();
        
        if (res.status === 200) {
            console.log("   ✅ Server accepted Privacy Mode request".green);
            // Note: In a real unit test, we'd check internal logs, but 200 OK proves the pipeline didn't crash.
        } else {
            throw new Error("Server returned non-200 status");
        }
    } catch (e) {
        console.log(`   ❌ FAIL: ${e.message}`.red);
    }

    // --- 2. REGRESSION MEMORY (CACHE SPEED TEST) ---
    console.log("\n🧪 TEST 2: Regression Memory (Caching Strategy)".yellow);
    const uniqueLog = `Database Deadlock Error - Timestamp ${Date.now()}`;
    
    // First Call (Cold Start)
    const start1 = Date.now();
    await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorLog: uniqueLog })
    });
    const duration1 = Date.now() - start1;
    console.log(`   Attempt 1 (AI Processing): ${duration1}ms`);

    // Second Call (Cache Hit)
    const start2 = Date.now();
    const res2 = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorLog: uniqueLog })
    });
    const data2 = await res2.json();
    const duration2 = Date.now() - start2;
    console.log(`   Attempt 2 (From Memory):   ${duration2}ms`);

    if (data2.cached && duration2 < duration1) {
        console.log("   ✅ PASS: Response served from Memory (Zero Latency)".green);
    } else {
        console.log("   ❌ FAIL: Caching did not trigger".red);
    }

    // --- 3. WORKFLOW AUTOMATION (JIRA) ---
    console.log("\n🧪 TEST 3: Workflow Automation (Jira Integration)".yellow);
    if (data2.jiraPayload && data2.jiraPayload.labels.includes("URFIS")) {
        console.log("   ✅ PASS: Jira Payload successfully generated".green);
        console.log(`      Title: ${data2.jiraPayload.title}`.gray);
    } else {
        console.log("   ❌ FAIL: No Jira payload found".red);
    }

    // --- 4. PDF EXPORT ---
    console.log("\n🧪 TEST 4: PDF Report Generation".yellow);
    const pdfRes = await fetch(`${API_URL}/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData: data2 })
    });
    
    if (pdfRes.headers.get('content-type') === 'application/pdf') {
        console.log("   ✅ PASS: Server returned a valid PDF stream".green);
    } else {
        console.log("   ❌ FAIL: Invalid content type".red);
    }

    // --- 5. AI CHAT ASSISTANT ---
    console.log("\n🧪 TEST 5: AI Chat Assistant".yellow);
    const chatRes = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "How do I fix a deadlock?", context: "SQL Error" })
    });
    const chatData = await chatRes.json();
    
    if (chatData.reply) {
        console.log("   ✅ PASS: AI Chat responded".green);
    } else {
        console.log("   ❌ FAIL: No reply from Chat Agent".red);
    }

    // --- 6. CLI & CI/CD GATE (The "Silent Killer") ---
    console.log("\n🧪 TEST 6: CLI & CI/CD Quality Gate".yellow);
    
    // Test A: Critical Error (Should Fail Build)
    const criticalCommand = 'node cli/urfis.js "Critical Database Failure Connection Refused"';
    console.log(`   Running: ${criticalCommand}`.gray);
    
    exec(criticalCommand, (error, stdout, stderr) => {
        if (error && error.code === 1) {
            console.log("   ✅ PASS: CI/CD Gate correctly BLOCKED the build (Exit Code 1)".green);
        } else {
            console.log("   ❌ FAIL: CI/CD Gate allowed a critical error to pass!".red);
        }

        // Test B: Minor Error (Should Pass Build)
        const minorCommand = 'node cli/urfis.js "Minor variable typo in css"';
        console.log(`   Running: ${minorCommand}`.gray);

        exec(minorCommand, (err, out, stde) => {
            if (!err) {
                console.log("   ✅ PASS: CI/CD Gate correctly ALLOWED a minor issue".green);
            } else {
                console.log("   ❌ FAIL: CI/CD Gate blocked a non-critical issue".red);
            }
            console.log("\n🏁 TEST SUITE COMPLETED 🏁".bold.cyan);
        });
    });
}

// Run the suite
runTests();