const crypto = require('crypto');
const PDFDocument = require('pdfkit');

// --- FEATURE 1: PRIVACY SHIELD ---
const sanitizeLog = (logText) => {
    if (!logText) return "";
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const apiKeyRegex = /sk-[a-zA-Z0-9]{20,}/g; 
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

    return logText
        .replace(emailRegex, '[EMAIL_REDACTED]')
        .replace(apiKeyRegex, '[API_KEY_REDACTED]')
        .replace(ipRegex, '[IP_REDACTED]');
};

// --- FEATURE 3: REGRESSION MEMORY (Cache) ---
const memoryCache = new Map();

const checkCache = (logText) => {
    // Generate Hash
    const hash = crypto.createHash('sha256').update(logText).digest('hex');
    
    if (memoryCache.has(hash)) {
        return { ...memoryCache.get(hash), cached: true };
    }
    return { hash, cached: false };
};

const saveToCache = (hash, analysisResult) => {
    if (hash && analysisResult) {
        memoryCache.set(hash, analysisResult);
    }
};

// --- FEATURE 4: WORKFLOW AUTOMATION (Jira) ---
const generateJiraPayload = (analysis) => {
    return {
        title: `Defect: ${analysis.rootCause || "Unknown Error"}`,
        description: `Severity: ${analysis.severity}\nFix: ${analysis.fix}`,
        labels: ["AI-Reported", "URFIS", "Auto-Generated"]
    };
};

// --- FEATURE: PDF EXPORT ---
const generatePDFReport = (analysisData, res) => {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('URFIS Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(14).text(`Severity: ${analysisData.severity} (Score: ${analysisData.severityScore}/10)`);
    doc.text(`Language: ${analysisData.language}`);
    doc.moveDown();
    doc.fontSize(16).text('Root Cause:', { underline: true });
    doc.fontSize(12).text(analysisData.rootCause || "N/A");
    doc.moveDown();
    doc.fontSize(16).text('Recommended Fix:', { underline: true });
    doc.fontSize(12).text(analysisData.fix || "N/A");
    
    doc.end();
};

module.exports = { sanitizeLog, checkCache, saveToCache, generateJiraPayload, generatePDFReport };