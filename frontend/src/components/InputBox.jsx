// InputBox.jsx
import { useState } from "react";

export default function InputBox({ onAnalyze }) {
  const [log, setLog] = useState("");

  const handleSubmit = () => {
    console.log("[Frontend] Submitting log for analysis...");
    console.log(`[Frontend] Log length: ${log.length}`);
    if (log.trim()) {
      onAnalyze(log);
    } else {
      console.warn("[Frontend] Attempted to submit empty log.");
    }
  };

  return (
    <div style={{ marginBottom: "20px", textAlign: "center" }}>
      <textarea
        rows="8"
        cols="80"
        placeholder="Paste your runtime error stack trace here (Python, Java, JS, C++, Go...)"
        value={log}
        onChange={(e) => setLog(e.target.value)}
        style={{
          width: "80%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontFamily: "monospace",
          fontSize: "14px"
        }}
      />
      <br />
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Analyze Error
      </button>
    </div>
  );
}