🛡️ **AEGIS — Automated Error Guard & Intelligence System**

**The Ultimate Defense Against Silent Killers & Runtime Threats**
*Military-Grade Forensic Analysis for Software Engineering*

---

AEGIS is a **Forensic Intelligence Engine** designed to hunt down the most dangerous bugs in software development: **Silent Killers**. Unlike standard linters that catch syntax errors, AEGIS targets defects that compile successfully but destroy production environments—**Memory Leaks, Deadlocks, Race Conditions, Timezone Misalignments, and Security Time Bombs**.

It combines **700+ Static ML Signatures (The Sentinel)** with **Generative AI (Gemini 2.0) (The Architect)** to perform deep-layer analysis, creating a defense system that doesn't just find errors—it **re-architects solutions**.

---

## 🧠 Why This Project Stands Out (Recruiter View)

✔ **Solves Critical Engineering Problems**
Targets high-stakes *Silent Killers* (OOM, Deadlocks) rather than trivial syntax issues.

✔ **Hybrid Intelligence Architecture**
Merges a high-speed Regex/ML engine with LLM reasoning for optimal speed + depth.

✔ **CI/CD Pipeline Integration**
Acts as a **build gate** that blocks deployments when critical threats are detected.

✔ **Forensic Mindset**
Separates symptoms (logs) from root causes (architectural flaws).

✔ **Production-Ready UX**
Military-defense aesthetic with real-time threat HUD, AI chat, and professional reporting.

---

## ✨ Core Capabilities

### ⚡ The “Silent Killer” Detector (Sentinel Engine)

A dedicated high-speed ML engine (`mlDetector.js`) scans for **44+ Critical Runtime Signatures** that bypass traditional tools:

* **Resource Exhaustion**: Memory leaks, FD exhaustion, zombie processes
* **Concurrency**: Race conditions, deadlocks, thread starvation
* **Security Time Bombs**: Hardcoded secrets, JWT expiry, ReDoS attacks

---

### 🔎 Triple-Layer Forensic Scan

1. **Syntax Layer**
   Instantly fixes compilation errors and typos

2. **Logic Layer**
   Detects runtime anomalies like infinite loops and off-by-one errors

3. **Architecture Layer**
   Identifies systemic anti-patterns (Blocking I/O, N+1 queries)

---

### 🧠 Supreme AI Architect & Chat Assistant

Powered by **Google Gemini**, the AI core acts as a **Principal Engineer**:

* **Context-Aware AI Chat**
  Ask follow-up questions like: *“How do I implement this fix in Python?”*

* **Severity Matrix (1–10)**
  Ruthless scoring system to separate noise from catastrophe

* **Architectural Fixes**
  Generates **complete, production-ready code files**, not snippets

---

### 📄 Professional PDF Reporting

* **One-Click Generation**
  Full forensic report: root cause, severity, fixes

* **Audit Trail Ready**
  Ideal for enterprise incident documentation

---

## ⚖️ The Severity Law

AEGIS follows a **No False Positives** policy:

* **1–3 (Low)**: Style / noise — safe to ignore
* **4–7 (Medium)**: Runtime crashes, logic bugs — must fix
* **8–10 (Critical)**: **SILENT KILLERS** — build fails immediately

---

## 🛠️ System Architecture

```
graph TD
    User[User / CI Pipeline] -->|Submit Log/Code| API[API Gateway (server.js)]
    
    subgraph "AEGIS CORE"
        API --> Sentinel[Sentinel Engine (mlDetector.js)]
        Sentinel -->|1. Pattern Match| KB[(Knowledge Base / MongoDB)]
        
        Sentinel -- "Critical Match Found (Red Box)" --> Report
        
        Sentinel -- "No Critical Match" --> Architect[AI Architect (Gemini 2.0)]
        Architect -->|2. Forensic Analysis| Architect
        Architect -->|3. Generate Fix| Report
    end
    
    Report[Forensic Report JSON] --> Client[React Dashboard / CLI]
    Client -->|4. Download| PDF[Professional PDF Report]
    Client -->|5. Query| Chat[AI Chat Assistant]
```

---

## 📂 Project Structure

```
AEGIS/
├── cli/
│   └── aegis.js
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── Dashboard.js
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── config/db.js
│   ├── models/RuntimeSignature.js
│   ├── routes/analyze.js
│   ├── seed/
│   │   ├── seedSignatures.js
│   │   └── securityThreats.js
│   └── utils/mlDetector.js
├── server.js
├── .env
├── package.json
└── README.md
```

---

## 🖥️ Frontend Engineering

**Stack**

* React.js
* CSS Grid / Flexbox
* Socket.io-client
* jsPDF
* Recharts

**UX Highlights**

* Red Box Threat HUD
* Floating AI Chat Assistant
* Dark Defense Theme
* Fully Responsive Layout

---

## ⚙️ Backend Architecture

**Stack**

* Node.js / Express
* Google Gemini API
* MongoDB
* Custom Regex + ML Engine

**Responsibilities**

* Deterministic detection before AI
* Supreme forensic prompt engineering
* Signature knowledge base seeding

---

## 🗃️ Database Design (MongoDB)

**Collection**: `RuntimeSignatures`

Stores patterns, severity, fixes. Optimized for fast lookup and expansion.

---

## 🔌 API Surface

* `POST /api/analyze` — Main forensic pipeline
* `POST /api/chat` — Context-aware AI consultation

---

## 📦 Setup & Installation

### 1️⃣ Clone Repository

```
git clone https://github.com/aayushthakur300/AEGIS.git
cd aegis
```

### 2️⃣ Backend Dependencies

```
npm install express cors dotenv @google/generative-ai mongoose socket.io node-fetch
```

### 3️⃣ Frontend Dependencies

```
cd client
npm install react react-dom vite @vitejs/plugin-react recharts react-syntax-highlighter jspdf socket.io-client
```

### 4️⃣ Environment Variables

```
GEMINI_API_KEY=your_api_key_here
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 5️⃣ Seed Knowledge Base

```
npm run seed
```

### 6️⃣ Run System

```
# Backend
npm start

# Frontend
cd client && npm run dev
```

---

## 🧪 CLI Mode

```
node cli/aegis.js "FATAL ERROR: Heap out of memory"
```

---

## 🧠 What Interviewers Notice

✅ Advanced systems thinking
✅ Hybrid AI + deterministic architecture
✅ Forensic-grade UI/UX
✅ CI/CD & enterprise readiness

---

## 🏁 Final Note

AEGIS is **not** a ChatGPT wrapper. It is a **specialized forensic defense system** built to enforce stability in real-world software.

> *“Peace through Superior Intelligence.”*

**Author:** Aayush Thakur
*Full-Stack Engineer | AI Systems Architect*

⭐ If this system aids your defense, consider starring the repository.
