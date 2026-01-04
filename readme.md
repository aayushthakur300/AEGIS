# 🛡️ AEGIS — Automated Error Guard & Intelligence System

**Forensic Runtime Error Detection & AI-Assisted Root Cause Analysis**

AEGIS is a **forensic-grade software analysis system** designed to detect and explain **runtime failures that compile successfully but fail in production**. Unlike traditional linters or static analyzers that focus on syntax and formatting, AEGIS targets **silent, high-impact defects** such as memory leaks, deadlocks, race conditions, resource exhaustion, timezone/DST bugs, and delayed security failures.

The system combines a **deterministic signature-based engine** with **AI-assisted reasoning** to deliver fast detection, deep contextual explanation, and actionable remediation guidance.

---

## 📌 Project Overview

### The Problem

Most real-world outages are not caused by syntax errors. They arise from **logic, concurrency, architectural assumptions, or performance anti-patterns** that pass compilation but fail under real execution conditions. These failures are difficult to debug, expensive to fix, and often detected too late.

### The Solution

AEGIS performs **multi-layer forensic analysis** to identify these failures early, explain *why* they occur, and recommend safe, production-ready fixes — before deployment.

---

## 🎯 Key Objectives

* Detect runtime and architectural defects early
* Minimize false positives and alert fatigue
* Provide root-cause analysis, not just error messages
* Assist developers with clear, actionable remediation
* Integrate naturally into CI/CD workflows

---

## 🧠 Core Capabilities

### 🔍 Silent Runtime Failure Detection

AEGIS focuses on defects that bypass compilation but fail under load or real-world conditions, including:

* Memory leaks and heap exhaustion
* Deadlocks and thread starvation
* Race conditions
* Infinite loops and blocking I/O
* Resource leaks (file descriptors, sockets)
* Time-delayed security issues (expired tokens, unsafe regex, hardcoded secrets)

---

### ⚙️ Hybrid Analysis Engine

AEGIS uses a **two-stage detection pipeline**:

#### 1. Deterministic Signature Engine

* Regex and rule-based patterns
* Extremely fast execution
* No hallucinations
* Early rejection of known critical issues

#### 2. AI-Assisted Forensic Analysis

* Context-aware reasoning using Gemini
* Explains *why* the issue occurs, not just *what* failed
* Suggests remediation strategies and safer designs
* Triggered only when deterministic analysis requires deeper context

---

### 🧬 Triple-Layer Analysis Model

1. **Syntax Layer**

   * Structural and syntactic validation

2. **Logic Layer**

   * Runtime flow issues
   * Boundary and loop anomalies
   * Error-prone logic patterns

3. **Architecture Layer**

   * Blocking operations
   * Inefficient or unsafe design patterns
   * Scalability and concurrency risks

---

### ⚖️ Severity Classification

Each detected issue is assigned a **severity score (1–10)** to guide prioritization:

| Score | Meaning                               |
| ----- | ------------------------------------- |
| 1–3   | Low impact / informational noise      |
| 4–7   | Runtime risk / must fix               |
| 8–10  | Critical failure / deployment blocked |

This scoring directly feeds CI/CD gate decisions.

---

### 📄 Forensic Reporting

AEGIS generates structured forensic reports containing:

* Detected issue and threat category
* Root cause explanation (logic + architecture)
* Severity score and risk classification
* Recommended remediation strategy
* Audit-ready contextual notes

Reports can be exported in **JSON or PDF format**.

---

### 💬 AI-Assisted Developer Consultation

AEGIS includes a context-aware AI assistant that allows developers to:

* Ask follow-up questions about detected issues
* Clarify remediation strategies
* Understand architectural trade-offs

The assistant is designed to **support developer decision-making**, not replace it.

---

## 🖥️ Interfaces

AEGIS can be used through multiple interfaces:

* **Web Dashboard (React)** — visualization and reports
* **REST API** — integration with other systems
* **Command-Line Interface (CLI)** — developer workflows

This flexibility allows usage by individuals, teams, and automated pipelines.

---

## 🏗️ System Architecture (High-Level)

1. Code or logs are submitted by the user or CI pipeline
2. Deterministic engine scans for known runtime signatures
3. AI performs deeper forensic reasoning when required
4. Results are returned as structured analysis data
5. Reports are generated and exposed via UI, API, or CLI

---

## 📂 Project Structure

```
AEGIS/
├── cli/                # Command-line interface
├── client/             # React frontend
├── backend/            # Node.js / Express backend
│   ├── routes/         # API endpoints
│   ├── models/         # MongoDB schemas
│   ├── utils/          # Detection engine
│   └── seed/           # Signature seeding
├── server.js           # Backend entry point
├── package.json
└── README.md
```

---

## 🖥️ Frontend Stack

* React.js
* CSS Grid / Flexbox
* Recharts (visualization)
* jsPDF (report generation)
* Socket.io (real-time updates)

---

## ⚙️ Backend Stack

* Node.js
* Express
* MongoDB
* Google Gemini API
* Custom rule-based detection engine

---

## 🔌 API Endpoints

| Method | Endpoint     | Description                 |
| ------ | ------------ | --------------------------- |
| POST   | /api/analyze | Run forensic analysis       |
| POST   | /api/chat    | Context-aware AI assistance |

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
node cli/urfis.js "FATAL ERROR: Heap out of memory"
```

---

## 🔧 Planned Improvements

* Unit and integration testing
* Benchmarking on real-world codebases
* CI/CD workflow templates
* Modular detector expansion
* Versioned releases
* Contribution guidelines and licensing

---

## 👤 Author

**Aayush Thakur**
Computer Science Engineering Student (3rd Year)
Full-Stack Developer | AI Systems Enthusiast

---

## 📌 Disclaimer

AEGIS is an **educational and experimental system** intended to demonstrate advanced software analysis concepts. It is not a replacement for formal security audits or production monitoring tools.

---

⭐ If you find this project valuable, consider starring the repository.




