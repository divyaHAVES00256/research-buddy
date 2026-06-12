// frontend/src/pages/Dashboard.jsx

import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import UploadZone from "../components/UploadZone";
import PaperCard from "../components/PaperCard";

export default function Dashboard() {
  // Track the current upload workflow state.
  const [uploadState, setUploadState] = useState("idle");

  // Store the API response data once the upload succeeds
  const [paperData, setPaperData] = useState(null);

  // Store error message text for display in the error state
  const [errorMsg, setErrorMsg] = useState("");

  // Called by UploadZone when the user drops or selects a PDF file
  async function handleFileUpload(file) {
    setPaperData(null);
    setErrorMsg("");
    setUploadState("uploading");

    // FormData is the browser API for encoding multipart/form-data.
    const formData = new FormData();
    formData.append("file", file);

    try {
      // POST to /api/upload 
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPaperData(response.data);
      setUploadState("success");
    } catch (err) {
      // If there's no response (network error), fall back to a generic message
      const detail =
        err.response?.data?.detail ||
        "Upload failed. Make sure the backend is running.";
      setErrorMsg(detail);
      setUploadState("error");
    }
  }

  /** Reset everything so the user can upload another paper */
  function handleReset() {
    setPaperData(null);
    setErrorMsg("");
    setUploadState("idle");
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Left sidebar */}
      <Sidebar />

      {/*  Main content area  */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/*  Top header bar  */}
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

          {/* Phase badge — shows which phase we're running */}
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: "#6c63ff20", color: "#6c63ff" }}
          >
            Phase 1 · Text Extraction
          </span>
        </header>

        {/*  Scrollable page body  */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Upload zone  */}
          <UploadZone
            onFileSelected={handleFileUpload}
            uploadState={uploadState}
            onReset={handleReset}
          />

          {/* Error message*/}
          {uploadState === "error" && (
            <div
              className="rounded-xl border p-4 animate-fade-in-up"
              style={{
                backgroundColor: "#ef444415",
                borderColor: "#ef444440",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                ⚠ Upload Error
              </p>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                {errorMsg}
              </p>
            </div>
          )}

          {/* Results — successful upload */}
          {uploadState === "success" && paperData && (
            <div className="space-y-6 animate-fade-in-up">

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
                {/* Panel header */}
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ borderColor: "#2a2d3e" }}
                >
                  <div className="flex items-center gap-2">
                    {/* Decorative dot — green for "active/live" indicator */}
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                      Extracted Text Preview
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    First 2,000 characters
                  </span>
                </div>

                {/* Extracted textr */}
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
                  Complete text stored in memory — {paperData.full_text?.length?.toLocaleString()} characters,{" "}
                  {paperData.word_count?.toLocaleString()} words across {paperData.page_count} pages.
                  Phase 2 will run TF-IDF keyword extraction on this corpus.
                </p>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}