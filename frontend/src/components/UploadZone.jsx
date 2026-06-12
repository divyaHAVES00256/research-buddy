// frontend/src/components/UploadZone.jsx
// The drag-and-drop PDF upload component.

import { useState, useRef } from "react";

export default function UploadZone({ onFileSelected, uploadState, onReset }) {
  // Track whether a file is being dragged over the drop zone.
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  /** Called when a dragged item enters the drop zone area. */
  function handleDragOver(e) {
    e.preventDefault();         
    e.stopPropagation();
    setIsDragging(true);
  }

  /** Called when the drag leaves the drop zone */
  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  /** Called when the user drops a file onto the zone. */
  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);

    // DataTransfer.files is a FileList — get the first file
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  }

/** Called when the user selects a file via the hidden <input type="file"> */
  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    e.target.value = "";
  }

  /** Validate that the chosen file is a PDF before calling the parent callback. */
  function validateAndUpload(file) {
    const isPdf =
      file.type === "application/pdf" ||      
      file.name.toLowerCase().endsWith(".pdf"); 

    if (!isPdf) {
      alert("Please upload a PDF file. Other file types are not supported.");
      return;
    }

    // Soft size check — warn but don't block files over 50MB
    if (file.size > 50 * 1024 * 1024) {
      const ok = confirm(
        `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Large files may take a moment to process. Continue?`
      );
      if (!ok) return;
    }

    // Pass the validated File object up to the Dashboard
    onFileSelected(file);
  }

  // Style object for the drop zone border — changes color when dragging
  const zoneBorderColor = isDragging ? "#6c63ff" : "#2a2d3e";
  const zoneBgColor = isDragging ? "#6c63ff08" : "transparent";
  const zoneBoxShadow = isDragging ? "0 0 20px #6c63ff30" : "none";

  // "Uploading" state — show a spinner and progress message
  if (uploadState === "uploading") {
    return (
      <div
        className="rounded-xl border-2 border-dashed p-12 flex flex-col items-center gap-4"
        style={{ borderColor: "#6c63ff40", backgroundColor: "#6c63ff08" }}
      >
        {/* CSS-only spinner using border trick */}
        <div
          className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "#6c63ff",
            borderRightColor: "#6c63ff40",
          }}
        />
        <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
          Extracting text from PDF…
        </p>
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          This usually takes 1–3 seconds
        </p>
      </div>
    );
  }

  // "Success" state — compact zone with "Upload Another" button
  if (uploadState === "success") {
    return (
      <div
        className="rounded-xl border px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#10b98110", borderColor: "#10b98130" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">✓</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "#10b981" }}>
              Extraction complete
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Results are shown below
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200"
          style={{ backgroundColor: "#2a2d3e", color: "#e2e8f0" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a3d4e")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2a2d3e")}
        >
          Upload Another
        </button>
      </div>
    );
  }

  // "Idle" and "Error" states — show the full drop zone
  return (
    <div
      className="rounded-xl border-2 border-dashed p-12 flex flex-col items-center gap-5 cursor-pointer transition-all duration-300"
      style={{
        borderColor: zoneBorderColor,
        backgroundColor: zoneBgColor,
        boxShadow: zoneBoxShadow,
      }}
      // Drag and drop event handlers
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      // Click anywhere in the zone to open the file picker
      onClick={() => fileInputRef.current?.click()}
    >
      {/* Upload icon — large and centred */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300"
        style={{
          backgroundColor: isDragging ? "#6c63ff30" : "#6c63ff15",
        }}
      >
        {isDragging ? "📂" : "📄"}
      </div>

      {/* Instructions text */}
      <div className="text-center">
        <p className="text-base font-semibold" style={{ color: "#e2e8f0" }}>
          {isDragging ? "Drop your PDF here" : "Drag & drop a PDF paper"}
        </p>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          or{" "}
          <span
            className="underline underline-offset-2"
            style={{ color: "#6c63ff" }}
          >
            click to browse
          </span>{" "}
          your files
        </p>
        <p className="text-xs mt-2" style={{ color: "#4a5568" }}>
          PDF files only · Max 50 MB recommended
        </p>
      </div>

      {/*
        Hidden file input — triggered by clicking the zone.
      */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className="hidden"        
        aria-label="Upload PDF file"
      />
    </div>
  );
}