const fs = require('fs');
const path = require('path');

// ===========================================================================
// 1. CRITICAL SILENT KILLERS (FORCEFUL TRIGGER - HIGHEST PRIORITY)
// ===========================================================================
const CRITICAL_HARDCODED_SIGNATURES = [
  // --- 1. Memory & Resource Silent Killers ---
  { pattern: "memory leak suspected|heap out of memory|Out Of Memory|OOM", fix: "Memory usage grows over time. Profile heap snapshots.", type: "KILLER" },
  { pattern: "MaxListenersExceededWarning|EventEmitter memory leak", fix: "EventEmitter listener leak. Remove unused listeners.", type: "KILLER" },
  { pattern: "EMFILE|too many open files|file descriptor exhaustion", fix: "File descriptor exhaustion. Ensure proper cleanup.", type: "KILLER" },
  { pattern: "Metaspace memory leak|PermGen space", fix: "Classloader leak due to dynamic class loading.", type: "KILLER" },
  { pattern: "Unclosed file handles|stream not closed", fix: "Files or streams opened without closing.", type: "KILLER" },
  { pattern: "Connection pool exhaustion|pool size exceeded|timeout waiting for connection", fix: "Connections not returned to pool.", type: "KILLER" },
  { pattern: "Unbounded cache growth|cache overflow", fix: "Cache without eviction policy leads to memory exhaustion.", type: "KILLER" },
  { pattern: "Unbounded queues|queue overflow", fix: "Producer outpaces consumer causing memory pressure.", type: "KILLER" },

  // --- 2. Concurrency & Threading Silent Killers ---
  { pattern: "race condition|data race|concurrent modification", fix: "Concurrent read/write without synchronization.", type: "KILLER" },
  { pattern: "Thread starvation|pool exhausted", fix: "High-priority threads block others. Adjust thread pools.", type: "KILLER" },
  { pattern: "Deadlock|circular dependency|lock wait timeout", fix: "Circular lock dependency. Enforce consistent ordering.", type: "KILLER" },
  { pattern: "Shared mutable state|unsafe sharing", fix: "Multiple threads modify shared objects without coordination.", type: "KILLER" },
  { pattern: "Improper async/await|fire and forget", fix: "Fire-and-forget async tasks hide failures.", type: "KILLER" },
  { pattern: "Background thread swallowing exceptions|silent failure", fix: "Exceptions ignored in background threads.", type: "KILLER" },
  { pattern: "Atomicity violation|check-then-act", fix: "Operations assumed atomic but are not.", type: "KILLER" },

  // --- 3. Performance & Latency Time Bombs ---
  { pattern: "N\\+1 query|n plus one", fix: "ORM executes one query per entity. Use eager loading.", type: "KILLER" },
  { pattern: "ReDoS|catastrophic backtracking|regex hang", fix: "Regex with nested quantifiers causes exponential time.", type: "KILLER" },
  { pattern: "process.nextTick starvation|event loop blocked", fix: "Recursive nextTick blocks event loop.", type: "KILLER" },
  { pattern: "Blocking calls in async|sync call in async", fix: "Synchronous I/O inside async path blocks threads.", type: "KILLER" },
  { pattern: "Inefficient algorithm|O\\(n\\^2\\)|quadratic complexity", fix: "O(n²) logic collapses at scale.", type: "KILLER" },
  { pattern: "Silent retry storms|retry amplification", fix: "Unbounded retries amplify failures.", type: "KILLER" },
  { pattern: "Stale cache|cache drift", fix: "Cache invalidation bugs.", type: "KILLER" },

  // --- 4. Data Integrity Silent Killers ---
  { pattern: "Floating point precision|0\\.1 \\+ 0\\.2", fix: "Never use floating point for money. Use decimal.", type: "KILLER" },
  { pattern: "Integer overflow|numeric overflow|wrap around", fix: "Values wrap silently. Check bounds.", type: "KILLER" },
  
  // ✅ UPDATED: Broader Pattern for Timezone issues (catches code like ZoneId.systemDefault)
  { pattern: "Timezone misalignment|ZoneId\\.systemDefault|new Date\\(\\)|UTC mismatch", fix: "UTC vs local time mismatch. Use explicit ZoneId (e.g. UTC).", type: "KILLER" },
  
  { pattern: "Lost updates|optimistic locking fail", fix: "Last-write-wins overwrites concurrent changes.", type: "KILLER" },
  { pattern: "Duplicate records|unique constraint violation", fix: "No unique index allows silent data duplication.", type: "KILLER" },
  { pattern: "Partial writes|transaction failure", fix: "Multi-step operations fail mid-way without rollback.", type: "KILLER" },
  { pattern: "Incorrect default values", fix: "Defaults mask missing data.", type: "KILLER" },
  { pattern: "Schema evolution|column missing", fix: "Field removal or rename causes silent data drops.", type: "KILLER" },

  // --- 5. Architecture & Configuration Silent Killers ---
  { pattern: "Feature flags|dead code", fix: "Dead code paths accumulate.", type: "KILLER" },
  { pattern: "Configuration drift|env mismatch", fix: "Different configs across environments.", type: "KILLER" },
  { pattern: "Magic numbers|hardcoded value", fix: "Hardcoded values obscure intent.", type: "KILLER" },
  { pattern: "Ignoring return values|unchecked return", fix: "APIs signal failure via return codes that are ignored.", type: "KILLER" },
  { pattern: "Fallback logic|silent fallback", fix: "Fallbacks mask real outages.", type: "KILLER" },
  { pattern: "Partial deployments|version mismatch", fix: "Mixed versions cause undefined behavior.", type: "KILLER" },

  // --- 6. Security Time Bombs (TRUE Silent Killers) ---
  { pattern: "Hardcoded secrets|API Key|password =", fix: "Secrets in source control lead to leaks.", type: "SECURITY" },
  { pattern: "Logging sensitive data|PII leak", fix: "Passwords/tokens logged.", type: "SECURITY" },
  { pattern: "JWT|token expiration", fix: "Tokens never expire, enabling long-term abuse.", type: "SECURITY" },
  { pattern: "Weak password hashing|MD5|SHA1", fix: "MD5/SHA1 allows offline cracking. Use bcrypt.", type: "SECURITY" },
  { pattern: "Missing authorization|insecure direct object reference", fix: "Authenticated users gain unintended access.", type: "SECURITY" },
  { pattern: "Trusting client-side|client validation", fix: "Client checks bypassed silently.", type: "SECURITY" },
  { pattern: "Improper CORS|Access-Control-Allow-Origin: \\*", fix: "Wildcard origins with credentials leak data.", type: "SECURITY" },
  { pattern: "Expired certificate|SSL error", fix: "Certificate expires without monitoring.", type: "SECURITY" }
];

// ===========================================================================
// 2. FOUNDATIONAL SIGNATURES (Fallback)
// ===========================================================================
const FOUNDATIONAL_SIGNATURES = [
  // Note: I escaped the parens here to stop your regex crashes
  { pattern: "TypeError: .* is not a function", fix: "Check definition.", type: "FOUNDATIONAL" },
  { pattern: "ReferenceError: .* is not defined", fix: "Variable missing.", type: "FOUNDATIONAL" },
  { pattern: "Cannot read property .* of undefined", fix: "Parent object is undefined.", type: "FOUNDATIONAL" },
  { pattern: "'end' expected \\(to close 'function' at line", fix: "Lua Syntax Error: Missing 'end'.", type: "FOUNDATIONAL" }, // Fixed Regex
  { pattern: "error: expected identifier or '\\('", fix: "C/C++ Syntax Error.", type: "FOUNDATIONAL" }, // Fixed Regex
  { pattern: "Makefile:.*: \\*\\*\\* missing separator", fix: "Makefile Error: Use Tabs.", type: "FOUNDATIONAL" } // Fixed Regex
];

// ===========================================================================
// 3. DYNAMIC LOADER
// ===========================================================================
let LOADED_SIGNATURES = [];

function loadSignatures() {
    if (LOADED_SIGNATURES.length > 0) return;
    console.log("[URFIS ML] Connecting to Knowledge Base...");
    const SEED_DIR = path.join(__dirname, '../seed'); 
    const signatureFiles = ['seedCompileTime', 'memoryCorruptionUB', 'dataCorruption', 'environmentPlatformCorruption', 'rareEdgeCaseConditions', 'silentLogicalErrors', 'securityThreats'];
    let count = 0;

    signatureFiles.forEach(fileName => {
        try {
            const filePath = path.join(SEED_DIR, `${fileName}.js`);
            if (fs.existsSync(filePath)) {
                const moduleData = require(filePath);
                const patterns = Array.isArray(moduleData) ? moduleData : (moduleData.patterns || []);
                if (patterns.length > 0) {
                    LOADED_SIGNATURES = LOADED_SIGNATURES.concat(patterns);
                    count += patterns.length;
                }
            }
        } catch (error) {
            console.error(`   ❌ [ML] Error loading ${fileName}.js: ${error.message}`);
        }
    });
    console.log(`[URFIS ML] Database Ready. Total Signatures: ${count + CRITICAL_HARDCODED_SIGNATURES.length}`);
}
loadSignatures();

function calculateEntropy(str) {
  if (!str) return 0;
  const len = str.length;
  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ===========================================================================
// 5. THE SUPREME DETECTOR (WITH DIAGNOSTIC LOGS)
// ===========================================================================
function detectThreatsAndSilentKillers(log) {
  console.log("\n[ML DETECTOR] 🔎 Starting Scan...");
  console.log(`[ML DETECTOR] Input Length: ${log.length} chars`);
  
  const threats = [];
  const silentKillers = [];
  const logLower = log.toLowerCase();

  // Helper: Safely create regex or fall back to literal match
  const safeRegexMatch = (pattern, text) => {
      try {
          const regex = new RegExp(pattern, 'i');
          return regex.test(text);
      } catch (e) {
          // If regex crashes (e.g. unclosed parens), try a simple string include
          // We strip regex special chars for the literal check
          const cleanPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '');
          return text.toLowerCase().includes(cleanPattern.toLowerCase());
      }
  };

  const analyzePattern = (sig, sourceName) => {
      if (safeRegexMatch(sig.pattern, log)) {
          console.log(`[ML DETECTOR] 🚨 MATCH FOUND in [${sourceName}]! Pattern: "${sig.pattern}"`);
          
          const fix = sig.fix || "Check logic.";
          const entry = `${sig.pattern} [${fix}]`;

          const isSecurity = sig.type === "SECURITY" || 
                             (sig.language && ["Secret", "Security", "Auth", "Crypto"].includes(sig.language)) ||
                             logLower.includes("injection") || 
                             logLower.includes("xss");

          const isKiller = sig.type === "KILLER" || 
                           (sig.severity && ["Critical", "High"].includes(sig.severity));

          if (isSecurity) {
              threats.push(entry);
          } else if (isKiller) {
              silentKillers.push(entry);
          } else {
              if (logLower.includes("error") || logLower.includes("fatal") || logLower.includes("panic")) {
                  silentKillers.push(entry);
              }
          }
      }
  };

  // 1. CHECK HARDCODED CRITICALS (Forceful Trigger)
  console.log(`[ML DETECTOR] Scanning ${CRITICAL_HARDCODED_SIGNATURES.length} Critical Signatures...`);
  CRITICAL_HARDCODED_SIGNATURES.forEach(sig => analyzePattern(sig, "CRITICAL"));

  // 2. CHECK FOUNDATIONAL
  FOUNDATIONAL_SIGNATURES.forEach(sig => analyzePattern(sig, "FOUNDATIONAL"));

  // 3. CHECK LOADED FILES
  if (LOADED_SIGNATURES.length > 0) {
      console.log(`[ML DETECTOR] Scanning ${LOADED_SIGNATURES.length} External Signatures...`);
      LOADED_SIGNATURES.forEach(sig => analyzePattern(sig, "EXTERNAL"));
  }

  // 4. CHECK ENTROPY
  const entropy = calculateEntropy(log);
  console.log(`[ML DETECTOR] Entropy Score: ${entropy.toFixed(2)}`);
  
  if (entropy > 5.2 && log.length > 150 && !logLower.includes("certificate")) {
    threats.push("High Entropy Artifact (Potential Malware/Obfuscation)");
    console.log("[ML DETECTOR] 🚨 High Entropy Detected!");
  }

  const uniqueThreats = [...new Set(threats)];
  const uniqueKillers = [...new Set(silentKillers)];

  console.log(`[ML DETECTOR] Scan Complete. Threats: ${uniqueThreats.length}, Silent Killers: ${uniqueKillers.length}\n`);

  return {
    isThreat: uniqueThreats.length > 0,
    threats: uniqueThreats,
    isSilentKiller: uniqueKillers.length > 0,
    silentKillers: uniqueKillers,
    entropyScore: entropy
  };
}

module.exports = { detectThreatsAndSilentKillers };