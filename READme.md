<div align="center">

<br/>

```
██████╗ ███████╗███████╗███████╗ █████╗ ██████╗  ██████╗██╗  ██╗
██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║
██████╔╝█████╗  ███████╗█████╗  ███████║██████╔╝██║     ███████║
██╔══██╗██╔══╝  ╚════██║██╔══╝  ██╔══██║██╔══██╗██║     ██╔══██║
██║  ██║███████╗███████║███████╗██║  ██║██║  ██║╚██████╗██║  ██║
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
                                                                    
██████╗ ██╗   ██╗██████╗ ██████╗ ██╗   ██╗
██╔══██╗██║   ██║██╔══██╗██╔══██╗╚██╗ ██╔╝
██████╔╝██║   ██║██║  ██║██║  ██║ ╚████╔╝ 
██╔══██╗██║   ██║██║  ██║██║  ██║  ╚██╔╝  
██████╔╝╚██████╔╝██████╔╝██████╔╝   ██║   
╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝   
```

### ⚗️ AI-Powered Academic Paper Summarizer & Q&A Assistant

<br/>

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<br/>

![Status](https://img.shields.io/badge/Status-Phase%201%20Complete-6c63ff?style=for-the-badge)
![Phase](https://img.shields.io/badge/Phases-1%20of%204-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web-e2e8f0?style=for-the-badge)

<br/>

> *Upload a research paper. Get summaries, keywords, and AI-powered Q&A — built for university students.*

<br/>

</div>

---

## 📑 Table of Contents

- [What is Research Buddy?](#-what-is-research-buddy)
- [Roadmap — 4 Phases](#-roadmap--4-phases)
- [Phase 1 — What's Built](#-phase-1--whats-built-now)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [File Structure](#-file-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Design System](#-design-system)
- [Built By](#-built-by)

---

## 🔬 What is Research Buddy?

Research Buddy is a **full-stack AI assistant** for university students that makes dense academic papers accessible. Paste in a paper — get back a plain-English summary, the key topics, and a chat interface to ask specific questions, all grounded in the actual paper text.

```
Without Research Buddy              With Research Buddy
─────────────────────               ────────────────────────────
📄 46-page PDF paper       ──►     📊 Auto-summary in seconds
😵 3 hours reading                  🏷️  Top keywords extracted
🤔 Still confused                   💬 "What is the proposed method?"
📝 Patchy notes                     ✅ Direct answer with citations
```

---

## 🗺️ Roadmap — 4 Phases

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RESEARCH BUDDY ROADMAP                          │
├──────────────┬──────────────┬──────────────┬────────────────────────┤
│   PHASE 1    │   PHASE 2    │   PHASE 3    │       PHASE 4          │
│  ✅ DONE     │  🔜 NEXT     │  🔜 SOON     │      🔜 FUTURE         │
├──────────────┼──────────────┼──────────────┼────────────────────────┤
│              │              │              │                        │
│  PDF Upload  │  TF-IDF      │  RAG Q&A     │  Paper History         │
│  Text Extract│  Keywords    │  Claude API  │  Multi-paper search    │
│  Metadata    │  AI Summary  │  Vector DB   │  Citation graph        │
│  Dark UI     │  Keyword UI  │  Chat UI     │  Export to notes       │
│              │              │              │                        │
├──────────────┴──────────────┴──────────────┴────────────────────────┤
│  Progress: ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  25%                  │
└─────────────────────────────────────────────────────────────────────┘
```

| Phase | Feature | Status | Tech Added |
|-------|---------|--------|------------|
| **1** | PDF upload, text extraction, dark dashboard | ✅ Complete | FastAPI, PyMuPDF, React, Tailwind |
| **2** | TF-IDF keyword extraction, AI summarisation | 🔜 Next | scikit-learn, Claude API |
| **3** | RAG Q&A — ask questions about the paper | 🔜 Soon | ChromaDB, sentence-transformers |
| **4** | Paper history, multi-doc search, export | 🔜 Future | SQLite, FAISS |

---

## ✅ Phase 1 — What's Built Now

### Features shipped in Phase 1

```
┌─────────────────────────────────────────────────────┐
│  📤  Drag-and-drop PDF upload zone                  │
│      └─ Click-to-browse fallback                    │
│      └─ File type + size validation                 │
│                                                     │
│  🔍  Backend text extraction (PyMuPDF)              │
│      └─ Full Unicode text from all pages            │
│      └─ Page-by-page parsing                        │
│      └─ Text cleaning (whitespace, hyphens)         │
│      └─ Heuristic title detection                   │
│                                                     │
│  📊  Metadata dashboard card                        │
│      └─ Filename, guessed title                     │
│      └─ Page count, word count                      │
│                                                     │
│  📝  Extracted text preview panel                   │
│      └─ First 2,000 characters                      │
│      └─ Monospace scrollable viewer                 │
│                                                     │
│  🎨  Full dark-theme UI                             │
│      └─ Sidebar with phase progress bar             │
│      └─ Smooth upload state transitions             │
│      └─ Fade-in animations on results               │
└─────────────────────────────────────────────────────┘
```

### Screenshots (UI States)

```
┌──────────────────────────────────────────────────────────────────┐
│  IDLE STATE — upload zone visible                                │
│                                                                  │
│  ┌─────────┐  ┌────────────────────────────────────────────┐   │
│  │ ⚗️      │  │  Paper Dashboard               Phase 1 ·  │   │
│  │ Research│  │  Upload a research paper       Text Extract│   │
│  │ Buddy   │  ├────────────────────────────────────────────┤   │
│  │─────────│  │                                            │   │
│  │ ⊞ Dash  │  │     ┌─────────────────────────────┐       │   │
│  │ ⊟ Hist· │  │     │                             │       │   │
│  │ ◈ Q&A · │  │     │   📄  Drag & drop a PDF     │       │   │
│  │ ⊕ Set · │  │     │       or click to browse    │       │   │
│  │─────────│  │     │                             │       │   │
│  │Phase 1/4│  │     └─────────────────────────────┘       │   │
│  │ ████░░░ │  │                                            │   │
│  └─────────┘  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  SUCCESS STATE — results visible                                 │
│                                                                  │
│  ┌─────────┐  ┌────────────────────────────────────────────┐   │
│  │ ⚗️      │  │  ✓ Extraction complete    [Upload Another] │   │
│  │ Research│  ├────────────────────────────────────────────┤   │
│  │ Buddy   │  │  📑 Attention Is All You Need              │   │
│  │─────────│  │     attention_2017.pdf          [Extracted]│   │
│  │ ⊞ Dash ●│  │  ┌──────────┬──────────┬──────────┐       │   │
│  │ ⊟ Hist· │  │  │  📃 15   │  ✏️ 9,200│  📎 PDF  │       │   │
│  │ ◈ Q&A · │  │  │  Pages   │  Words   │  Format  │       │   │
│  │ ⊕ Set · │  │  └──────────┴──────────┴──────────┘       │   │
│  │─────────│  ├────────────────────────────────────────────┤   │
│  │Phase 1/4│  │  ● Extracted Text Preview    [2,000 chars] │   │
│  │ ████░░░ │  │  Attention mechanisms allow...             │   │
│  └─────────┘  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### System Architecture — Phase 1

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Port 5173)                          │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    React Application                        │   │
│   │                                                             │   │
│   │   ┌──────────┐   ┌──────────────────────────────────────┐  │   │
│   │   │ Sidebar  │   │           Dashboard Page             │  │   │
│   │   │          │   │                                      │  │   │
│   │   │ Nav links│   │  ┌────────────┐  ┌────────────────┐  │  │   │
│   │   │ Phase bar│   │  │ UploadZone │  │   PaperCard    │  │  │   │
│   │   └──────────┘   │  │            │  │                │  │  │   │
│   │                  │  │ drag & drop│  │ filename       │  │  │   │
│   │                  │  │ FormData   │  │ page count     │  │  │   │
│   │                  │  │ Axios POST │  │ word count     │  │  │   │
│   │                  │  └────────────┘  └────────────────┘  │  │   │
│   │                  └──────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                    POST /api/upload                                 │
│                    (multipart/form-data)                            │
└──────────────────────────────│──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Vite Dev Proxy    │
                    │  /api/* → :8000/*  │
                    │  (strips /api)     │
                    └──────────┬──────────┘
                               │
                    POST /upload
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     FASTAPI SERVER (Port 8000)                      │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                       main.py                               │   │
│   │                                                             │   │
│   │   GET  /          ──►  {"status": "ok", ...}                │   │
│   │                                                             │   │
│   │   POST /upload    ──►  1. Validate file type                │   │
│   │                        2. Read bytes into memory            │   │
│   │                        3. Wrap in io.BytesIO                │   │
│   │                        4. fitz.open(stream=...)             │   │
│   │                           │                                 │   │
│   │                      ┌────▼─────────────────┐               │   │
│   │                      │   PyMuPDF (fitz)      │              │   │
│   │                      │                       │              │   │
│   │                      │  for page in doc:     │              │   │
│   │                      │    page.get_text()    │              │   │
│   │                      │                       │              │   │
│   │                      │  Returns Unicode text │              │   │
│   │                      └────┬─────────────────┘               │   │
│   │                           │                                 │   │
│   │                        5. clean_text()                      │   │
│   │                        6. count words/pages                 │   │
│   │                        7. guess_title()                     │   │
│   │                        8. Return JSON ◄───────────────────────┤ │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow — Upload to Display

```
  User drops PDF
       │
       ▼
  Browser File API
  (e.dataTransfer.files[0])
       │
       ▼
  UploadZone validates
  ├─ file.type === "application/pdf"  ✓
  └─ file.name.endsWith(".pdf")       ✓
       │
       ▼
  FormData.append("file", pdfFile)
       │
       ▼
  axios.post("/api/upload", formData)
       │
       ▼  [Vite proxy rewrites to localhost:8000/upload]
       │
       ▼
  FastAPI receives UploadFile
       │
       ▼
  await file.read() → raw bytes
       │
       ▼
  io.BytesIO(bytes) → in-memory stream
       │
       ▼
  fitz.open(stream=stream, filetype="pdf")
       │
       ├─► page_count = len(doc)
       │
       └─► for each page → page.get_text() → join all pages
                │
                ▼
           clean_text()
           ├─ remove soft hyphens
           ├─ collapse newlines
           └─ collapse whitespace
                │
                ▼
           word_count = len(text.split())
           title_guess = first line[:120]
                │
                ▼
           return JSON {
             filename, title_guess,
             page_count, word_count,
             raw_text (2000 chars),
             full_text (complete)
           }
                │
                ▼  [Axios receives response.data]
                │
                ▼
           setPaperData(response.data)
           setUploadState("success")
                │
                ▼
           React re-renders →
           PaperCard + text preview
           fade in with animation ✨
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Why This Choice |
|-------|-----------|---------|-----------------|
| 🐍 Language | Python | 3.11+ | Fastest CPython, best error messages, rich AI ecosystem |
| ⚡ API Framework | FastAPI | 0.115 | Async-native, auto-validation, auto-docs at `/docs` |
| 🚀 ASGI Server | Uvicorn | 0.32 | Production-grade async server, `--reload` for dev |
| 📄 PDF Parser | PyMuPDF (fitz) | 1.24 | Fastest + most accurate — used in production PDF viewers |
| 📦 File Parsing | python-multipart | 0.0.17 | Required by FastAPI to parse file upload form data |
| ⚛️ UI Framework | React | 18 | Component model, massive ecosystem, industry standard |
| ⚡ Build Tool | Vite | 5 | Sub-second HMR, proxy config, replaces deprecated CRA |
| 🎨 CSS Framework | TailwindCSS | 4 | Utility-first, co-located styles, zero runtime overhead |
| 🌐 HTTP Client | Axios | 1.7 | Clean API, `FormData` support, better errors than `fetch` |
| 🗺️ Router | React Router DOM | 6 | Industry-standard client routing, hooks-based API |

---

## 📁 File Structure

```
research-buddy/
│
├── 📄 .gitignore                  ← Git exclusion rules (root level)
├── 📄 README.md                   ← This file
│
├── 🐍 backend/
│   ├── main.py                    ← FastAPI app (2 endpoints, ~120 lines)
│   └── requirements.txt           ← Pinned Python dependencies
│
└── ⚛️  frontend/
    ├── index.html                 ← App shell, loads Inter font, dark bg
    ├── vite.config.js             ← Vite + Tailwind plugin + API proxy
    ├── tailwind.config.js         ← Custom dark theme colors & animations
    ├── package.json               ← npm dependencies
    │
    └── src/
        ├── main.jsx               ← React entry point (mounts App)
        ├── App.jsx                ← Router config, top-level layout
        ├── index.css              ← Global styles, scrollbar, CSS vars
        │
        ├── pages/
        │   └── Dashboard.jsx      ← Main page — upload + results display
        │
        └── components/
            ├── Sidebar.jsx        ← Left nav panel with phase progress
            ├── UploadZone.jsx     ← Drag-and-drop upload (all states)
            └── PaperCard.jsx      ← Metadata card (pages, words, title)
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Check Python version (3.11+ required)
python --version

# Check Node version (18+ required)
node --version
npm --version
```

### 1 — Clone & Set Up

```bash
git clone https://github.com/your-username/research-buddy.git
cd research-buddy
```

### 2 — Backend Setup

```bash
# Navigate to backend
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate it
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install all dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

✅ Test the API: open http://localhost:8000/docs in your browser.

### 3 — Frontend Setup

Open a **second terminal**:

```bash
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# Start the Vite dev server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4 — Open the App

🌐 Navigate to **http://localhost:5173**

Upload any PDF research paper — the extracted text and metadata will appear on screen within seconds.

---

## 📡 API Reference

### `GET /`
Health check — confirms the backend is alive.

**Response:**
```json
{
  "status": "ok",
  "message": "Research Buddy API is running"
}
```

---

### `POST /upload`
Accepts a PDF file, extracts text and metadata using PyMuPDF.

**Request:** `multipart/form-data` with field `file` containing the PDF.

**Response:**
```json
{
  "status": "success",
  "filename": "attention_is_all_you_need.pdf",
  "title_guess": "Attention Is All You Need",
  "page_count": 15,
  "word_count": 9241,
  "raw_text": "Attention Is All You Need\nAbstract. The dominant sequence...",
  "full_text": "< complete extracted text of all pages >"
}
```

**Error responses:**

| Code | Reason |
|------|--------|
| `400` | Uploaded file is not a PDF (wrong MIME type) |
| `422` | File is corrupt or cannot be parsed by PyMuPDF |

---

## 🎨 Design System

```
COLOR PALETTE
─────────────────────────────────────────────────────────────
  #0f1117   ██  Page background    (near-black, blue tint)
  #1a1d27   ██  Sidebar + header   (slightly lighter)
  #1e2130   ██  Cards & panels     (surface color)
  #2a2d3e   ██  Borders & dividers (subtle separator)
  #6c63ff   ██  Accent (purple)    (buttons, active states)
  #5a52d5   ██  Accent hover       (darker on hover)
  #e2e8f0   ██  Primary text       (near-white)
  #94a3b8   ██  Secondary text     (muted grey)
  #10b981   ██  Success green      (upload complete)
  #ef4444   ██  Error red          (validation / network errors)

TYPOGRAPHY
─────────────────────────────────────────────────────────────
  Font family  →  Inter (Google Fonts, variable weight 300–700)
  Scale        →  xs (12px) · sm (14px) · base (16px) · xl (20px)
  Weights      →  Regular 400 · Medium 500 · Semibold 600 · Bold 700

ANIMATIONS
─────────────────────────────────────────────────────────────
  fadeInUp     →  Results appear: opacity 0→1, translateY 16px→0  (350ms)
  glowPulse    →  Drag-over glow: box-shadow pulses purple  (1500ms)
  spin         →  Upload spinner: 360° rotation  (1000ms linear)
  transitions  →  All interactive states: 200–300ms ease
```

---

## 📋 .gitignore Placement Guide

```
research-buddy/
├── .gitignore     ← ✅ Place HERE (project root — covers both backend & frontend)
├── backend/
└── frontend/
```

**What it ignores and why:**

| Pattern | Reason |
|---------|--------|
| `venv/` | Python virtual environment — gigabytes, rebuilt by each developer |
| `__pycache__/` | Python bytecode — auto-generated, not source code |
| `.env` | Environment variables — contains secrets and API keys |
| `node_modules/` | npm packages — hundreds of MB, restored via `npm install` |
| `frontend/dist/` | Vite build output — generated artifact, not source |
| `*.pdf` | Uploaded user files — user data should never be in git |
| `.DS_Store` | macOS Finder metadata — machine-specific noise |
| `chroma_db/` | Phase 3+ vector database — large binary files |

---

## 🔮 What's Coming in Phase 2

```
Phase 2 will add:

  🏷️  TF-IDF Keyword Extraction
      └─ scikit-learn TfidfVectorizer on the full_text
      └─ Top 10 keywords returned as chips in the UI
      └─ New endpoint: POST /keywords

  🤖  AI Summary (Claude API)
      └─ Send full_text to Claude claude-sonnet-4-6
      └─ Structured output: Abstract, Method, Results, Conclusion
      └─ New endpoint: POST /summarise

  🃏  Summary Card UI
      └─ Expandable sections per summary block
      └─ Keyword chips with frequency scores
```

---

<div align="center">

---

### 💜 Built By

```
██████╗ ██╗██╗   ██╗██╗   ██╗ █████╗ 
██╔══██╗██║██║   ██║╚██╗ ██╔╝██╔══██╗
██║  ██║██║██║   ██║ ╚████╔╝ ███████║
██║  ██║██║╚██╗ ██╔╝  ╚██╔╝  ██╔══██║
██████╔╝██║ ╚████╔╝    ██║   ██║  ██║
╚═════╝ ╚═╝  ╚═══╝     ╚═╝   ╚═╝  ╚═╝
```

**Built by DIVYAꨄ**  
BTech CSE · Netaji Subhas University Of Technology, Delhi

<br/>

![NSUT](https://img.shields.io/badge/NSUT-Delhi-6c63ff?style=for-the-badge)
![BTech](https://img.shields.io/badge/BTech-CSE-10b981?style=for-the-badge)
![Made with](https://img.shields.io/badge/Made%20with-💜-e2e8f0?style=for-the-badge)

<br/>

*Project · Building something that matters for students*

---

</div>