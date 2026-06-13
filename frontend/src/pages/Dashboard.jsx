// frontend/src/pages/Dashboard.jsx

import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import UploadZone from "../components/UploadZone";
import PaperCard from "../components/PaperCard";
import StatsBar     from "../components/StatsBar";
import KeywordsPanel from "../components/KeywordsPanel";
import SummaryPanel  from "../components/SummaryPanel";
import ChatPanel from "../components/ChatPanel";
 

export default function Dashboard() {
  //PHASE1
  // Track the current upload workflow state: "idle" | "uploading" | "success" | "error"
  const [uploadState, setUploadState] = useState("idle");

  // Store the API response data once the upload succeeds
  const [paperData, setPaperData] = useState(null);

  // Store error message text for display in the error state
  const [errorMsg, setErrorMsg] = useState("");

  //PHASE2
  const [analysisData,  setAnalysisData]  = useState(null);

  // "idle" | "loading" | "success" | "error"
  const [analysisState, setAnalysisState] = useState("idle");

  const [analysisError, setAnalysisError] = useState("");

  // Controls the fade-in animation for Phase 2 results
  const [showAnalysis, setShowAnalysis] = useState(false);

  //PHASE3
  // Stores the raw File object so ChatPanel can call /api/index 
  const [pdfFile, setPdfFile] = useState(null);

  // Called by UploadZone when the user drops or selects a PDF file
  async function handleFileUpload(file) {
    setPaperData(null);
    setErrorMsg("");
    setUploadState("uploading");
    setAnalysisData(null);
    setAnalysisState("idle");
    setAnalysisError("");
    setShowAnalysis(false);
    
    // FormData is the browser API for encoding multipart/form-data.
    const formData = new FormData();
    formData.append("file", file);

    setPdfFile(file);

    try {
      // POST to /api/upload 
      // Phase 1: text extraction preview 
      const uploadResponse = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPaperData(uploadResponse.data);
      setUploadState("success");

      // POST to /api/analyze
      // Phase 2: kick off ML analysis immediately after upload succeeds
      // We re-create FormData because the original stream was already consumed
      runAnalysis(file);

    } catch (err) {
      // If there's no response (network error), fall back to a generic message
      const detail =
        err.response?.data?.detail ||
        "Upload failed. Make sure the backend is running.";
      setErrorMsg(detail);
      setUploadState("error");
    }
  }

  async function runAnalysis(file) {
    setAnalysisState("loading");
 
    const formData = new FormData();
    formData.append("file", file);
 
    try {
      const analysisResponse = await axios.post("/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisData(analysisResponse.data);
      setAnalysisState("success");
      // Small delay so the fade-in feels intentional, not an instant layout shift
      setTimeout(() => setShowAnalysis(true), 80);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "Analysis failed. The paper may be too short or image-only.";
      setAnalysisError(detail);
      setAnalysisState("error");
    }
  }

  /** Reset everything so the user can upload another paper */
  function handleReset() {
    setPaperData(null);
    setErrorMsg("");
    setUploadState("idle");
    setAnalysisData(null);
    setAnalysisState("idle");
    setAnalysisError("");
    setShowAnalysis(false);
    setPdfFile(null);
  }

   return (
    <div className="flex h-screen overflow-hidden">
 
      {/* Left sidebar */}
      <Sidebar />
 
      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
 
        {/* Top header bar — kept exactly from Phase 1 */}
        <header
          className="flex items-center justify-between px-8 py-4 border-b"
          style={{ borderColor: "#2a2d3e", backgroundColor: "#1a1d27" }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#e2e8f0" }}>
              Paper Dashboard
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
              Upload a research paper to extract its content
            </p>
          </div>
 
          {/* Phase badge — updated to reflect Phase 3 */}
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: "#6c63ff20", color: "#6c63ff" }}
          >
            Phase 3 · RAG Chat
          </span>
        </header>
 
        {/* Scrollable page body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
 
          {/* Upload zone */}
          <UploadZone
            onFileSelected={handleFileUpload}
            uploadState={uploadState}
            onReset={handleReset}
          />
 
          {/* Upload error */}
          {uploadState === "error" && (
            <div
              className="rounded-xl border p-4 animate-fade-in-up"
              style={{ backgroundColor: "#ef444415", borderColor: "#ef444440" }}
            >
              <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                ⚠ Upload Error
              </p>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                {errorMsg}
              </p>
            </div>
          )}
 
          {/* ── SUCCESS STATE ─────────────────────────────────────────────── */}
          {uploadState === "success" && paperData && (
            <div className="space-y-6 animate-fade-in-up">
 
              {/* ════════════════════════════════════════════════════════════
                  PHASE 1 PANELS — file metadata and extracted text preview
              ════════════════════════════════════════════════════════════ */}
 
              {/* Metadata card */}
              <PaperCard
                filename={paperData.filename}
                titleGuess={paperData.title_guess}
                pageCount={paperData.page_count}
                wordCount={paperData.word_count}
              />
 
              {/* Extracted text preview panel */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "#1e2130", borderColor: "#2a2d3e" }}
              >
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ borderColor: "#2a2d3e" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                      Extracted Text Preview
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    First 5,000 characters
                  </span>
                </div>
 
                <pre
                  className="p-5 text-sm overflow-y-auto whitespace-pre-wrap leading-relaxed"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    color: "#94a3b8",
                    maxHeight: "420px",
                  }}
                >
                  {paperData.raw_text}
                </pre>
              </div>
 
              {/* Full text stats row */}
              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: "#1e2130", borderColor: "#2a2d3e" }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>
                  Full Extraction Summary
                </p>
                <p className="text-sm" style={{ color: "#e2e8f0" }}>
                  Complete text stored in memory —{" "}
                  {paperData.full_text?.length?.toLocaleString()} characters,{" "}
                  {paperData.word_count?.toLocaleString()} words across{" "}
                  {paperData.page_count} pages. Phase 2 will run TF-IDF keyword
                  extraction on this corpus.
                </p>
              </div>
 
              {/* ════════════════════════════════════════════════════════════
                  PHASE 2 PANELS — ML analysis results
              ════════════════════════════════════════════════════════════ */}
 
              {/* Visual divider between the two phases */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1 border-t" style={{ borderColor: "#2a2d3e" }} />
                <span
                  className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{
                    color: "#6c63ff",
                    backgroundColor: "#6c63ff15",
                    border: "1px solid #6c63ff30",
                  }}
                >
                  ML Analysis · Phase 2
                </span>
                <div className="flex-1 border-t" style={{ borderColor: "#2a2d3e" }} />
              </div>
 
              {/* Analysis loading indicator */}
              {analysisState === "loading" && (
                <div className="flex items-center gap-3 px-1" style={{ color: "#94a3b8" }}>
                  <div
                    className="w-5 h-5 rounded-full border-2 animate-spin flex-shrink-0"
                    style={{ borderColor: "#6c63ff44", borderTopColor: "#6c63ff" }}
                  />
                  <span className="text-sm">Running TF-IDF analysis on extracted text…</span>
                </div>
              )}
 
              {/* Analysis error */}
              {analysisState === "error" && (
                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: "#ef444415", borderColor: "#ef444440" }}
                >
                  <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                    ⚠ Analysis Error
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                    {analysisError}
                  </p>
                </div>
              )}
 
              {/* Analysis results — fade + slide in when ready */}
              {analysisState === "success" && analysisData && (
                <div
                  className="space-y-6 transition-all duration-500 ease-out"
                  style={{
                    opacity:   showAnalysis ? 1 : 0,
                    transform: showAnalysis ? "translateY(0)" : "translateY(16px)",
                  }}
                >
                  <StatsBar
                    stats={analysisData.stats}
                    keywords={analysisData.keywords}
                  />
                  <KeywordsPanel keywords={analysisData.keywords} />
                  <SummaryPanel summary={analysisData.summary} />

                  {/* ════════════════════════════════════════════════════════════
                  PHASE 3 PANELS — RAG Chat Panel 
              ════════════════════════════════════════════════════════════ */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1 border-t" style={{ borderColor: "#2a2d3e" }} />
                    <span
                      className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{
                        color: "#00d4aa",
                        backgroundColor: "#00d4aa15",
                        border: "1px solid #00d4aa30",
                      }}
                    >
                      RAG · Phase 3
                    </span>
                    <div className="flex-1 border-t" style={{ borderColor: "#2a2d3e" }} />
                  </div>

                  {/* ChatPanel — only render when analysis is complete and we have the PDF file */}
                  {analysisState === "success" && pdfFile && (
                    <ChatPanel
                      paperId={paperData.filename.replace(/\.pdf$/i, "")}
                      pdfFile={pdfFile}
                    />
                  )}
                 
                </div>
              )}
 
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
 