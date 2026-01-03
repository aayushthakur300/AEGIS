
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import jsPDF from "jspdf";
import "../App.css"; 

const socket = io("http://localhost:5000");

// --- STYLES ---
const styles = {
    container: { 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '30px', 
        fontFamily: '"Inter", "Segoe UI", monospace', 
        transition: 'filter 0.3s ease, opacity 0.3s ease' 
    },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px', 
        borderBottom: '1px solid', 
        paddingBottom: '15px' 
    },
    brand: { 
        fontSize: '26px', 
        fontWeight: '800', 
        letterSpacing: '-1px' 
    },
    
    // Main Layout
    input: { 
        width: '100%', 
        padding: '20px', 
        fontFamily: '"Fira Code", monospace', 
        fontSize: '14px', 
        borderRadius: '8px', 
        minHeight: '200px', 
        resize: 'vertical', 
        border: '1px solid',
        outline: 'none',
        lineHeight: '1.5'
    },
    btnPrimary: { 
        background: 'linear-gradient(135deg, #2980b9, #2c3e50)', 
        color: 'white', 
        border: 'none', 
        padding: '18px 24px', 
        borderRadius: '8px', 
        fontWeight: 'bold', 
        cursor: 'pointer', 
        transition: 'all 0.2s', 
        width: '100%', 
        fontSize: '16px', 
        marginTop: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    
    // Metric Cards
    metricCard: { 
        padding: '25px', 
        borderRadius: '12px', 
        textAlign: 'center', 
        border: '1px solid',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)' 
    },
    
    // 💀 RED BOX FOR SILENT KILLER
    silentKiller: { 
        background: 'linear-gradient(135deg, #990000 0%, #ff0000 100%)', 
        color: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        marginBottom: '30px', 
        textAlign: 'center', 
        border: '3px solid #ff4d4d', 
        boxShadow: '0 0 30px rgba(255, 0, 0, 0.5)', 
        animation: 'pulse 1.5s infinite' 
    },

    // Result Panel
    glassPanel: { 
        backdropFilter: 'blur(10px)', 
        border: '1px solid', 
        borderRadius: '12px', 
        padding: '30px' 
    },
    
    // Chat
    chatBubble: { padding: '10px 15px', borderRadius: '15px', fontSize: '13px', display: 'inline-block', maxWidth: '85%', lineHeight: '1.4' },
    btnAction: { width:'100%', padding:'20px', borderRadius:'8px', border:'none', color:'white', cursor:'pointer', fontWeight:'bold', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }
};

export default function Dashboard() {
  const [log, setLog] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);
  
  // Workflows
  const [jobStatus, setJobStatus] = useState("IDLE");
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([{ sender: "ai", text: "AEGIS Enterprise Online. How can I assist?" }]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  // Theme Management
  useEffect(() => {
    document.body.style.background = isDarkMode ? '#0a0a0a' : '#f8f9fa';
    document.body.style.color = isDarkMode ? '#e0e0e0' : '#000000';
  }, [isDarkMode]);

  const theme = {
      text: isDarkMode ? '#fff' : '#000',
      subText: isDarkMode ? '#aaa' : '#333',
      border: isDarkMode ? '#333' : '#ddd',
      cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
      panelBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      inputBg: isDarkMode ? '#0d0d0d' : '#ffffff',
      inputColor: isDarkMode ? '#0f0' : '#000000',
      codeColor: isDarkMode ? '#2ecc71' : '#000000', // Green in Dark Mode, Black in Light Mode
      codeBg: isDarkMode ? '#0a0a0a' : '#f4f4f4',
      headerBorder: isDarkMode ? '#333' : '#e0e0e0'
  };

  // Socket Listeners
  useEffect(() => {
    socket.on("job_complete", (data) => {
        if (data.status === "COMPLETED") {
            setPdfUrl(data.resultUrl); 
            setJobStatus("READY");
        }
    });
    return () => { socket.off("job_complete"); };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleAnalyze = async () => {
    if (!log.trim()) return;
    setLoading(true);
    setPdfUrl(null); 
    setJobStatus("IDLE");
    
    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorLog: log, privacyMode })
      });
      const data = await res.json();

      // CLIENT-SIDE FAILSAFE FOR SILENT KILLER
      const lower = log.toLowerCase();
      let detectedType = data.silentKillerType;
      if (!detectedType) {
          if (lower.includes("maxlistenersexceeded")) detectedType = "EVENT EMITTER LEAK";
          else if (lower.includes("heap out of memory")) detectedType = "HEAP OVERFLOW";
          else if (lower.includes("deadlock")) detectedType = "DATABASE DEADLOCK";
          else if (lower.includes("zombie")) detectedType = "ZOMBIE PROCESS";
      }

      if (detectedType) {
          data.isSilentKiller = true;
          data.silentKillerType = detectedType;
          data.severity = "CRITICAL";
          data.severityScore = 10;
          if(!data.rootCause || data.rootCause === "Unknown") data.rootCause = `Critical ${detectedType}`;
      }

      setAnalysis(data);
    } catch (e) { alert("Server connection failed"); } 
    finally { setLoading(false); }
  };

  // --- 📄 PROFESSIONAL PDF GENERATOR (SENIOR DESIGNER EDITION) ---
  const generateProfessionalPDF = () => {
      if (!analysis) return;
      const doc = new jsPDF();
      
      const margin = 15;
      let y = 15;
      const pageWidth = doc.internal.pageSize.width;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper: Check for Page Break
      const checkPageBreak = (heightNeeded) => {
          if (y + heightNeeded > 280) {
              doc.addPage();
              y = 20;
          }
      };

      // Helper: Draw Section Box
      const drawSection = (title, content, color=[0,0,0], isCode=false) => {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(40, 40, 40);
          
          // Title Bar
          doc.setFillColor(230, 230, 230);
          doc.rect(margin, y, contentWidth, 8, 'F');
          doc.text(title.toUpperCase(), margin + 2, y + 5.5);
          y += 10; // Move y past the title bar

          // Content Preparation
          doc.setFontSize(10);
          doc.setFont(isCode ? "courier" : "helvetica", "normal");
          doc.setTextColor(color[0], color[1], color[2]);
          
          const lines = doc.splitTextToSize(content || "N/A", contentWidth - 6);
          const lineHeight = 6; // Standardized line height to prevent intersection
          const blockHeight = (lines.length * lineHeight) + 8; // Calculated height + padding
          
          checkPageBreak(blockHeight + 15);
          
          // Draw Box Outline (Title Bar + Content)
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, y - 10, contentWidth, blockHeight + 10); 
          
          // Render Text (Pushed down by +5 to fit inside box comfortably)
          doc.text(lines, margin + 3, y + 5);
          
          y += blockHeight + 5; // Move Y for next section
      };

      // --- HEADER ---
      doc.setFillColor(33, 33, 33); 
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("AEGIS TECHNICAL REPORT", margin, 17);
      doc.setFontSize(10);
      doc.text(`ID: ${Date.now()}`, pageWidth - margin - 40, 17);
      y = 35;

      // --- SECTION 1: EXECUTIVE SUMMARY & CI/CD ---
      doc.setFontSize(12);
      doc.setTextColor(0,0,0);
      doc.text(`Severity: ${analysis.severity}`, margin, y);
      doc.text(`Score: ${analysis.severityScore}/10`, margin + 60, y);
      
      const cicdStatus = analysis.severityScore >= 7 ? "BLOCK" : "PASS";
      const cicdColor = analysis.severityScore >= 7 ? [200, 0, 0] : [0, 150, 0];
      
      doc.setTextColor(cicdColor[0], cicdColor[1], cicdColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`CI/CD GATE: ${cicdStatus}`, margin + 120, y);
      y += 10;

      // --- SECTION: SILENT KILLER (Conditional) ---
      if (analysis.isSilentKiller) {
          doc.setFillColor(255, 235, 235);
          doc.setDrawColor(200, 0, 0);
          doc.rect(margin, y, contentWidth, 15, 'FD');
          doc.setTextColor(200, 0, 0);
          doc.setFontSize(12);
          doc.text(`💀 SILENT KILLER DETECTED: ${analysis.silentKillerType}`, margin + 5, y + 10);
          y += 25;
      }

      // --- SECTION 2: ORIGINAL INPUT ---
      const displayLog = log.length > 2000 ? log.substring(0, 2000) + "\n...[Truncated]" : log;
      drawSection("1. ORIGINAL SOURCE CODE / LOG", displayLog, [50, 50, 50], true);

      // --- SECTION 3: ROOT CAUSE ---
      drawSection("2. ROOT CAUSE ANALYSIS", analysis.rootCause, [0, 0, 0]);

      // --- SECTION 4: TECHNICAL EXPLANATION ---
      drawSection("3. TECHNICAL EXPLANATION", analysis.explanation, [60, 60, 60]);

      // --- SECTION 5: REMEDIATION ---
      drawSection("4. REMEDIATION (ACTION PLAN)", analysis.fix, [0, 100, 0], true);

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Generated by AEGIS Enterprise  |  Page ${i} of ${pageCount}`, margin, doc.internal.pageSize.height - 10);
      }

      doc.save(`AEGIS_Report_${Date.now()}.pdf`);
  };

  const handleAsyncPDF = () => {
      generateProfessionalPDF();
  };

  const handleChat = async () => {
      if(!chatInput.trim()) return;
      const msg = {sender:"user", text:chatInput};
      setChatHistory(p => [...p, msg]); 
      setChatInput("");
      
      const thinkingId = Date.now();
      setChatHistory(p => [...p, {sender:"ai", text:"Thinking...", id: thinkingId}]);

      try {
        const res = await fetch("http://localhost:5000/api/chat", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ message: msg.text, context: analysis?.rootCause || "No active analysis" }) });
        const data = await res.json();
        setChatHistory(p => p.map(m => m.id === thinkingId ? {sender:"ai", text:data.reply} : m));
      } catch(e) {
        setChatHistory(p => p.map(m => m.id === thinkingId ? {sender:"ai", text:"Error contacting AI."} : m));
      }
  };

  return (
    <div style={{...styles.container, filter: loading ? 'blur(8px)' : 'none', pointerEvents: loading ? 'none' : 'auto'}}>
      
      {/* HEADER */}
      <div style={{...styles.header, borderColor: theme.headerBorder}}>
        <div>
            <div style={{...styles.brand, color: theme.text}}>AEGIS <span style={{fontSize:'12px', background:'#f1c40f', color:'black', padding:'2px 5px', borderRadius:'4px', marginLeft:'10px'}}>ULTIMATE</span></div>
            <div style={{fontSize:'12px', color: theme.subText, marginTop:'5px', letterSpacing:'1px'}}>Automated Error Guard & Intelligence System </div>
        </div>
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
            <button onClick={()=>setIsDarkMode(!isDarkMode)} style={{background:'none', border:`1px solid ${theme.border}`, color: theme.text, padding:'8px 15px', borderRadius:'20px', cursor:'pointer', fontWeight:'bold', fontSize:'12px'}}>
                {isDarkMode ? "☀ LIGHT MODE" : "☾ DARK MODE"}
            </button>
        </div>
      </div>

      {/* MAIN INPUT AREA */}
      <textarea 
        value={log} 
        onChange={e=>setLog(e.target.value)} 
        placeholder="// PASTE CRASH LOG OR SOURCE CODE HERE..." 
        style={{
            ...styles.input, 
            background: theme.inputBg, 
            color: theme.inputColor, 
            borderColor: theme.border 
        }} 
      />
      <button onClick={handleAnalyze} disabled={loading} style={{...styles.btnPrimary, opacity: loading?0.5:1}}>
          {loading ? "⚡ ESTABLISHING UPLINK..." : "🚀 INITIATE ANALYSIS SEQUENCE"}
      </button>

      {/* ANALYSIS RESULTS */}
      {analysis && (
        <div style={{marginTop:'40px'}}>
            
            {/* 💀 RED BOX: SILENT KILLER HUD (Conditional) 💀 */}
            {analysis.isSilentKiller && (
                <div style={styles.silentKiller}>
                    <h2 style={{margin:0, fontSize:'32px', textTransform:'uppercase', letterSpacing:'2px'}}>💀 SILENT KILLER DETECTED 💀</h2>
                    <div style={{background: 'rgba(0,0,0,0.3)', display:'inline-block', padding:'8px 20px', borderRadius:'20px', marginTop:'15px', fontWeight:'bold', fontSize:'14px'}}>
                        THREAT TYPE: {analysis.silentKillerType || "CRITICAL ANOMALY"}
                    </div>
                    <div style={{marginTop:'10px', fontSize:'12px', fontWeight:'bold'}}>SYSTEM INTEGRITY COMPROMISED. IMMEDIATE ACTION REQUIRED.</div>
                </div>
            )}

            {/* METRICS (WITH CI/CD BLOCK) */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'15px', marginBottom:'20px'}}>
                <div style={{...styles.metricCard, background: theme.cardBg, borderColor: theme.border, borderTop: `4px solid ${analysis.severity==='HIGH' || analysis.severity==='CRITICAL' ?'#e74c3c':'#f1c40f'}`}}>
                    <div style={{fontSize:'11px', color: theme.subText, textTransform:'uppercase'}}>Severity</div>
                    <div style={{fontSize:'22px', fontWeight:'bold', color: theme.text}}>{analysis.severity}</div>
                </div>
                <div style={{...styles.metricCard, background: theme.cardBg, borderColor: theme.border, borderTop: '4px solid #3498db'}}>
                    <div style={{fontSize:'11px', color: theme.subText, textTransform:'uppercase'}}>Risk Score</div>
                    <div style={{fontSize:'22px', fontWeight:'bold', color: theme.text}}>{analysis.severityScore}/10</div>
                </div>
                
                {/* ⛔ CI/CD GATE BLOCK ⛔ */}
                <div style={{...styles.metricCard, background: theme.cardBg, borderColor: theme.border, borderTop: analysis.severityScore>=7?'4px solid #e74c3c':'4px solid #2ecc71'}}>
                    <div style={{fontSize:'11px', color: theme.subText, textTransform:'uppercase'}}>CI/CD Gate</div>
                    <div style={{fontSize:'22px', fontWeight:'bold', color: analysis.severityScore>=7 ? '#e74c3c' : '#2ecc71'}}>
                        {analysis.severityScore>=7 ? "⛔ BLOCK" : "✅ PASS"}
                    </div>
                </div>

                <div style={{...styles.metricCard, background: theme.cardBg, borderColor: theme.border, borderTop: '4px solid #9b59b6'}}>
                    <div style={{fontSize:'11px', color: theme.subText, textTransform:'uppercase'}}>Language</div>
                    <div style={{fontSize:'18px', fontWeight:'bold', color: theme.text}}>{analysis.language}</div>
                </div>
            </div>

            {/* ACTION PANEL */}
            <div style={{display:'grid', gridTemplateColumns:'3fr 1fr', gap:'20px'}}>
                <div style={{...styles.glassPanel, background: theme.panelBg, borderColor: theme.border}}>
                    <h3 style={{marginTop:0, borderBottom:`1px solid ${theme.border}`, paddingBottom:'10px', color: theme.text}}>Root Cause Analysis</h3>
                    <p style={{color: theme.subText, lineHeight:'1.6'}}>{analysis.explanation || analysis.rootCause}</p>
                    
                    {/* REMEDY STRATEGY HEADER - UPDATED FOR STANDARD FORMAT */}
                    <h3 style={{marginTop:'25px', borderBottom:`1px solid ${theme.border}`, paddingBottom:'10px', color: theme.text, textTransform: 'uppercase', letterSpacing: '1px'}}>REMEDY STRATEGY</h3>
                    
                    {/* --- THE FIX BLOCK: STANDARD FORMAT (Green Border, Pre-Wrap, Monospace) --- */}
                    <div style={{
                        background: theme.codeBg, 
                        padding: '20px', 
                        borderRadius: '6px', 
                        borderLeft: '4px solid #2ecc71', 
                        fontFamily: '"Fira Code", monospace', 
                        color: theme.codeColor, 
                        marginTop: '15px',
                        whiteSpace: 'pre-wrap', // CRITICAL: This enables the line breaks from the backend
                        overflowX: 'auto',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        {analysis.fix}
                    </div>
                </div>
                
                {/* 📄 STYLISH PDF BUTTON */}
                <div style={{display:'flex', flexDirection:'column', justifyContent:'flex-start'}}>
                    <button onClick={handleAsyncPDF} style={{
                        ...styles.btnAction,
                        background: 'linear-gradient(45deg, #27ae60, #2ecc71)', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}>
                        📄 DOWNLOAD PDF REPORT
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 💬 FLOATING CHAT WIDGET */}
      {chatOpen && (
        <div style={{position:'fixed', bottom:'20px', right:'20px', width:'350px', height:'500px', background: theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:'10px', display:'flex', flexDirection:'column', boxShadow:'0 10px 30px rgba(0,0,0,0.5)', zIndex:999}}>
            <div style={{padding:'15px', background: 'linear-gradient(45deg, #8e44ad, #9b59b6)', color:'white', borderTopLeftRadius:'10px', borderTopRightRadius:'10px', display:'flex', justifyContent:'space-between', fontWeight:'bold'}}>
                <span>🤖 AEGIS AI ASSISTANT</span> 
                <span onClick={()=>setChatOpen(false)} style={{cursor:'pointer'}}>✖</span>
            </div>
            <div style={{flex:1, padding:'15px', overflowY:'auto', background: isDarkMode?'#111':'#f9f9f9'}}>
                {chatHistory.map((m,i)=> (
                    <div key={i} style={{marginBottom:'10px', textAlign: m.sender==='user'?'right':'left'}}>
                        <span style={{...styles.chatBubble, background: m.sender==='user'?'#3498db': (isDarkMode?'#333':'#e0e0e0'), color: m.sender==='user'?'white':(isDarkMode?'white':'black')}}>
                            {m.text}
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div style={{padding:'10px', borderTop:`1px solid ${theme.border}`, display:'flex', background: theme.cardBg}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type a message..." style={{flex:1, padding:'10px', borderRadius:'6px', border:`1px solid ${theme.border}`, background: isDarkMode?'#222':'#fff', color: theme.text, marginRight:'5px'}} onKeyPress={e=>e.key==='Enter'&&handleChat()} />
                <button onClick={handleChat} style={{background:'#8e44ad', border:'none', color:'white', borderRadius:'6px', padding:'0 15px', cursor:'pointer'}}>➤</button>
            </div>
        </div>
      )}
      {!chatOpen && <button onClick={()=>setChatOpen(true)} style={{position:'fixed', bottom:'20px', right:'20px', width:'65px', height:'65px', borderRadius:'50%', background:'linear-gradient(45deg, #8e44ad, #9b59b6)', color:'white', border:'none', fontSize:'30px', cursor:'pointer', boxShadow:'0 5px 25px rgba(142, 68, 173, 0.5)', transition:'transform 0.2s', zIndex:999}} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>💬</button>}

      {/* LOADER OVERLAY */}
      {loading && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10000}}>
              <div style={{background:'rgba(0,0,0,0.8)', padding:'30px', borderRadius:'20px', color:'white', fontWeight:'bold', fontSize:'24px', boxShadow:'0 0 50px rgba(0,255,0,0.2)'}}>
                  ⚡ INITIALIZING AEGIS CORE...
              </div>
          </div>
      )}
    </div>
  );
}
//-------------------------------------------------------------------------------------------------------------------------------------
