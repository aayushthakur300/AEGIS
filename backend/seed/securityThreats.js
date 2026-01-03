// backend/seed/securityThreats.js
const mongoose = require("mongoose");
const RuntimeSignature = require("../models/RuntimeSignature");
const connectDB = require("../config/db");
require("dotenv").config({ path: "../../.env" });

const securityThreats = [
  // --- 1. INJECTION ATTACKS (SQL / NoSQL / Command) ---
  { pattern: "UNION\\s+ALL\\s+SELECT", language: "SQL", fix: "Use parameterized queries (Prepared Statements).", severity: "Critical" },
  { pattern: "UNION\\s+SELECT", language: "SQL", fix: "Use parameterized queries.", severity: "Critical" },
  { pattern: "DROP\\s+TABLE", language: "SQL", fix: "Revoke DROP permissions from app user.", severity: "Critical" },
  { pattern: "OR\\s+['\"]?1['\"]?=['\"]?1", language: "SQL", fix: "Sanitize input or use ORM.", severity: "Critical" },
  { pattern: "(\\$where|\\$ne|\\$gt|\\$regex)[\\s\"':]+", language: "NoSQL", fix: "Sanitize MongoDB query operators.", severity: "Critical" },
  { pattern: "{\"\\$gt\":", language: "NoSQL", fix: "Validate JSON input types.", severity: "Critical" },
  { pattern: "(?:;|\\|\\||&&)\\s*(?:rm\\s+-rf|wget|curl|cat\\s+/etc/passwd|nc\\s+-e|/bin/sh)", language: "Shell", fix: "Avoid shell execution with user input. Use execFile.", severity: "Critical" },
  
  // --- 2. XSS & CLIENT-SIDE INJECTION ---
  { pattern: "<script>|javascript:alert\\(", language: "Web", fix: "Escape HTML output (e.g., React defaults).", severity: "High" },
  { pattern: "onerror\\s*=|onload\\s*=", language: "Web", fix: "Content Security Policy (CSP).", severity: "High" },
  { pattern: "document\\.cookie", language: "Web", fix: "Use HttpOnly cookies.", severity: "Medium" },
  
  // --- 3. PATH TRAVERSAL (LFI/RFI) ---
  { pattern: "\\.\\./|\\.\\.\\\\|/etc/shadow|/windows/system32/config", language: "File", fix: "Sanitize file paths. Use path.basename().", severity: "Critical" },
  
  // --- 4. AUTHENTICATION & SECRETS ---
  { pattern: "AIza[0-9A-Za-z-_]{35}", language: "Secret", fix: "Revoke API Key immediately.", severity: "Critical" },
  { pattern: "SK-[a-zA-Z0-9]{32,}", language: "Secret", fix: "Rotate Secret Key.", severity: "Critical" },
  { pattern: "BEGIN PRIVATE KEY", language: "Secret", fix: "Never log private keys.", severity: "Critical" },
  { pattern: "Invalid CSRF token", language: "Auth", fix: "Verify CSRF middleware.", severity: "High" },
  { pattern: "mixed content", language: "Web", fix: "Enforce HTTPS.", severity: "High" },
  
  // --- 5. ARCHITECTURAL SECURITY (CORS, HEADERS) ---
  { pattern: "Cross-Origin Request Blocked", language: "Web", fix: "Configure CORS Middleware properly.", severity: "High" },
  { pattern: "Response\\.Headers\\.Add\\s*\\(\\s*[\"']Access-Control-Allow-Origin[\"']", language: "C#", fix: "Insecure Manual CORS. Use app.UseCors().", severity: "High" },
  { pattern: "header\\s*\\(\\s*[\"']Access-Control-Allow-Origin", language: "PHP/Node", fix: "Insecure Manual CORS. Use standard middleware.", severity: "High" },
  
  // --- 6. DOS & RESOURCE EXHAUSTION ---
  { pattern: "Zip Bomb detected", language: "Security", fix: "Limit decompression size.", severity: "High" },
  { pattern: "Rate limit exceeded", language: "API", fix: "Implement Backoff.", severity: "Medium" },
  { pattern: "ReDoS", language: "Regex", fix: "Optimize Regex or use Re2.", severity: "High" }
];

const seedSecurity = async () => {
  try {
    await connectDB();
    console.log(`[Seeder] Adding ${securityThreats.length} security signatures...`);
    await RuntimeSignature.insertMany(securityThreats);
    console.log("[Seeder] Security signatures added successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Uncomment to run standalone
// seedSecurity();

module.exports = securityThreats;