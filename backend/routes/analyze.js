
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define available models for Round Robin selection
const AVAILABLE_MODELS = [
    //--- TIER 1: LATEST STABLE & FAST (2.5 & 2.0) ---
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001',

    // --- TIER 2: HIGH INTELLIGENCE (PRO) ---
    'gemini-2.5-pro',
    'gemini-pro-latest',
    'gemini-2.0-pro-exp-02-05',
    'gemini-1.5-pro',

    // --- TIER 3: PREVIEWS & EXPERIMENTAL ---
    'gemini-2.5-flash-preview-09-2025',
    'gemini-2.5-flash-lite-preview-09-2025',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.0-flash-lite-preview',
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',

    // --- TIER 4: NEXT GEN PREVIEWS (3.0) ---
    'gemini-3-pro-preview',
    'gemini-3-flash-preview',
    'deep-research-pro-preview-12-2025',

    // --- TIER 5: LEGACY / ALIASES ---
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-lite-latest',
    'gemini-1.5-flash',

    // --- TIER 6: GEMMA (OPEN MODELS FALLBACK) ---
    'gemma-3-27b-it',
    'gemma-3-12b-it',
    'gemma-3-4b-it',
    'gemma-3-1b-it',
    'gemma-3n-e4b-it',
    'gemma-3n-e2b-it',

    //--- TIER 7: SPECIALIZED ---
    'gemini-robotics-er-1.5-preview',
    'gemini-2.5-computer-use-preview-10-2025',
    'nano-banana-pro-preview'
];

// Global index tracker for Round Robin
let currentModelIndex = 0;

/**
 * MAIN ANALYSIS FUNCTION (SUPREME ARCHITECT EDITION)
 * Now fully integrated with the 700+ Signature ML Sentry.
 */
async function analyzeErrorWithGemini(log, language = "detect", context = {}) {
    console.log("---------------------------------------------------");
    console.log(`[AI Analyzer] Request Initiated.`);
    console.log(`[AI Analyzer] Context: ${JSON.stringify(context)}`);

    const maxRetries = AVAILABLE_MODELS.length;
    let attempts = 0;
    let success = false;
    let finalResult = null;

    // Loop through models until one works or we run out of models
    while (attempts < maxRetries && !success) {
        // 1. Select Model
        const modelName = AVAILABLE_MODELS[currentModelIndex % AVAILABLE_MODELS.length];
        const model = genAI.getGenerativeModel({ model: modelName });
        
        console.log(`[AI Analyzer] Attempt ${attempts + 1}: Selected '${modelName}'`);

        // 2. Build Prompt (SUPREME ARCHITECT & SECURITY ENGINEER)
        // We inject the ML Detector's findings directly into the prompt so the AI doesn't miss them.
        const prompt = `
            ACT AS A PRINCIPAL SOFTWARE ARCHITECT, SECURITY RESEARCHER, AND COMPILER ENGINEER.
            
            Your mission is to perform a FORENSIC ANALYSIS of the provided input code/log.
            You are the "Brain" of URFIS (Universal Runtime Failure Intelligence System).
            
            ---------------------------------------------------------
            🚨 INTELLIGENCE BRIEFING (FROM ML SENTRY):
            - **Detected Threats:** ${JSON.stringify(context.detectedThreats || [])}
            - **Detected Silent Killers:** ${JSON.stringify(context.detectedSilentKillers || [])}
            - **Entropy Score:** ${context.entropyScore || 0} (High > 5.0 implies potential malware/obfuscation)
            ---------------------------------------------------------

            INPUT DATA:
            """
            ${log}
            """

            ---------------------------------------------------------
            ANALYSIS PROTOCOL (STRICT INDUSTRIAL STANDARDS):

            PHASE 1: THE TRIPLE-LAYER SCAN
            1. **Syntax Layer (Compiler View):** Identify syntax errors, typos, missing imports, and type mismatches.
            2. **Logic Layer (Runtime View):** Identify race conditions, deadlocks, infinite loops, off-by-one errors, and unhandled promises.
            3. **Architecture Layer (System View):** Identify "Anti-Patterns" (e.g., N+1 queries, Blocking I/O, Hardcoded Secrets, Manual CORS).

            PHASE 2: PRECISE SEVERITY SCORING (1-10)
            *Be ruthless. Nothing is perfect.*
            
            - **[1-3] LOW (Noise/Style):** Deprecation warnings, messy formatting, console logs, unused variables. Code runs but is ugly.
            - **[4-6] MEDIUM (Major/Blocker):** Compilation failures, runtime crashes (exceptions), logic bugs that break a feature but not the DB.
            - **[7-8] HIGH (Dangerous):** Resource leaks (memory/connection), Unhandled Rejections, Performance bottlenecks (N+1), Race conditions.
            - **[9-10] CRITICAL (Catastrophic):** SECURITY BREACHES (SQLi, Secrets), DATA CORRUPTION, DEADLOCKS, SYSTEM CRASHES.
            
            *CRITICAL RULE:* If "Detected Silent Killers" is NOT empty, the score MUST be >= 8.

            PHASE 3: SUPREME CODE GENERATION
            - **COMPLETE CODE**: Return the FULL, RUNNABLE file. Do not provide snippets.
            - **MODERNIZE**: Use the latest stable syntax (e.g., modern C#, React Hooks, ES6+, Python 3.10+).
            - **CLEAN**: Strip all explanatory comments from the code block. The code must be production-ready.
            - **FORMATTING**: Use explicit '\\n' for newlines.

            PHASE 4: CLEAN TEXT OUTPUT
            - **NO MARKDOWN**: The 'explanation' and 'rootCause' fields MUST be plain text. Do not use asterisks (**bold**), underscores (_italic_), or backticks (\`code\`). Write clean, professional English sentences.

            ---------------------------------------------------------
            OUTPUT FORMAT (Strict JSON, No Markdown):
            {
              "language": "Detected Language",
              "rootCause": "Precise Technical Summary (No Markdown)",
              "severity": "Low" | "Medium" | "High" | "Critical",
              "severityScore": Integer (1-10),
              "fix": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    // ... clean code ...\\n    return 0;\\n}",
              "isSilentKiller": boolean, 
              "explanation": "Deep forensic analysis explaining the Root Cause (Symptom vs Disease) and the Architectural Fix. (No Markdown)"
            }
        `;

        try {
            // 3. Send Request
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // 4. Parse Response
            const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
            finalResult = JSON.parse(cleanJson);

            // --- NO MANUAL OVERRIDES ---
            // We fully trust the upgraded Prompt Engineering.
            
            console.log(`[AI Analyzer] Success with model: ${modelName}`);
            console.log(`[AI Analyzer] Verdict: Score ${finalResult.severityScore}/10 - ${finalResult.rootCause}`);
            
            success = true; // Exit loop

        } catch (error) {
            console.error(`[AI Analyzer] Failed with ${modelName}. Error: ${error.message}`);
            
            if (error.message.includes("429") || error.message.includes("Quota") || error.message.includes("resource exhausted")) {
                console.warn(`[AI Analyzer] ⚠️ Quota exceeded for ${modelName}. Switching to next model...`);
            } else {
                console.warn(`[AI Analyzer] ⚠️ API Error. Switching to next model...`);
            }
            
            currentModelIndex++;
            attempts++;
        }
    }

    console.log("---------------------------------------------------");

    if (success && finalResult) {
        return finalResult;
    } else {
        return {
            language: "Unknown",
            rootCause: "System Overload - All Models Failed",
            severity: "Unknown",
            severityScore: 0,
            fix: "// Please check API Keys or Internet Connection",
            isSilentKiller: false,
            explanation: `Tried ${attempts} models but all failed due to quota or network errors.`
        };
    }
}

module.exports = { analyzeErrorWithGemini };