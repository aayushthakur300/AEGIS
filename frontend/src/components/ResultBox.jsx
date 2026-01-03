// ResultBox.jsx
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ResultBox({ result }) {
  if (!result) return null;

  console.log("[Frontend] Rendering ResultBox with:", result);

  const isCritical = result.severity === "Critical" || result.severity === "High";
  const isSilentKiller = result.isSilentKiller;

  return (
    <div
      style={{
        width: "80%",
        margin: "0 auto",
        textAlign: "left",
        border: isCritical ? "2px solid red" : "1px solid #ddd",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Analysis Report</h3>
        <div>
           <span style={{ 
              backgroundColor: "#333", color: "#fff", 
              padding: "5px 10px", borderRadius: "4px", 
              marginRight: "10px", fontSize: "12px", textTransform: "uppercase" 
            }}>
            {result.language || "Unknown Lang"}
          </span>

          {isSilentKiller && (
             <span style={{ 
                backgroundColor: "purple", color: "#fff", 
                padding: "5px 10px", borderRadius: "4px", 
                marginRight: "10px", fontSize: "12px", fontWeight: "bold"
              }}>
              SILENT KILLER DETECTED
            </span>
          )}

          <span
            style={{
              backgroundColor: isCritical ? "#dc3545" : "#28a745",
              color: "white",
              padding: "5px 10px",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            {result.severity}
          </span>
        </div>
      </div>

      <p><strong>Root Cause:</strong> {result.rootCause}</p>
      
      {result.explanation && (
        <p style={{fontStyle: "italic", color: "#555"}}>
          <strong>AI Explanation:</strong> {result.explanation}
        </p>
      )}

      <h4>Suggested Fix:</h4>
      <SyntaxHighlighter language={result.language?.toLowerCase() || "javascript"} style={dracula}>
        {result.fix}
      </SyntaxHighlighter>
    </div>
  );
}