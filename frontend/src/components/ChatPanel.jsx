// frontend/src/components/ChatPanel.jsx
// full Q&A chat interface with RAG integration

import { useEffect, useRef, useState } from "react";

// Suggested starter questions shown when chat is empty and index is ready
const SUGGESTED_QUESTIONS = [
  "What problem does this paper solve?",
  "What methodology was used?",
  "What are the key findings?",
];

// ── TypingIndicator ───────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#6c63ff",
            display: "inline-block",
            // Each dot starts its animation with a 150ms offset so they pulse in sequence
            animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── SourcesBlock ──────────────────────────────────────────────────────────────
function SourcesBlock({ sources }) {
  const [open, setOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: "6px", marginLeft: "4px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "11px",
          color: "#6c63ff",
          padding: "2px 0",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {/* Simple chevron that flips when open */}
        <span style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▶</span>
        {open ? "Hide" : "View"} sources ({sources.length})
      </button>

      {open && (
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {sources.map((src, i) => (
            <div
              key={i}
              style={{
                background: "#0f1117",
                border: "1px solid #2a2d3e",
                borderRadius: "8px",
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: "10px", color: "#6c63ff", marginBottom: "4px", fontWeight: 600 }}>
                Chunk #{src.chunk_index} · similarity {(1 - src.distance).toFixed(3)}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  lineHeight: "1.6",
                  // Limit display to keep the UI tidy; user can read the full chunk if needed
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {src.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ChatPanel (main component) ────────────────────────────────────────────────
export default function ChatPanel({ paperId, pdfFile }) {
  // Chat history — each message is { id, role: "user"|"assistant", text, sources }
  const [messages, setMessages] = useState([]);

  // Current value of the question input field
  const [inputValue, setInputValue] = useState("");

  // True while /api/ask is in-flight — disables input and shows typing indicator
  const [isLoading, setIsLoading] = useState(false);

  // Tracks the state of the /api/index call that fires on mount
  // "indexing" → "ready" → "error"
  const [indexStatus, setIndexStatus] = useState("indexing");

  // Optional error message shown when indexing fails
  const [indexError, setIndexError] = useState("");

  // Ref attached to an invisible div at the bottom of the messages list.
  // We call scrollIntoView on it after every new message.
  const bottomRef = useRef(null);

  // ── Auto-scroll effect ────────────────────────────────────────────────────
  // Runs every time the messages array changes — keeps the latest message visible
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Indexing effect ───────────────────────────────────────────────────────
  // Fires once when the component mounts (paperId/pdfFile won't change during
  // a session). Calls /api/index to build the ChromaDB vector index.
  useEffect(() => {
    if (!paperId || !pdfFile) return;

    const buildIndex = async () => {
      setIndexStatus("indexing");

      try {
        // /api/index expects multipart/form-data: a paper_id string + the PDF file
        const formData = new FormData();
        formData.append("paper_id", paperId);
        formData.append("file", pdfFile);

        const res = await fetch("/api/index", { method: "POST", body: formData });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Indexing failed");
        }

        setIndexStatus("ready");
      } catch (err) {
        console.error("[ChatPanel] Indexing error:", err);
        setIndexError(err.message || "Failed to build knowledge index.");
        setIndexStatus("error");
      }
    };

    buildIndex();
  }, [paperId, pdfFile]);

  // ── Send handler ──────────────────────────────────────────────────────────
  const handleSend = async (questionOverride) => {
    // questionOverride is used when the user clicks a suggested question chip
    const question = questionOverride || inputValue.trim();
    if (!question || isLoading || indexStatus !== "ready") return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: question,
      sources: null,
    };

    // Optimistic UI: add the user message immediately so the chat feels instant
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // /api/ask expects JSON — { paper_id, question }
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper_id: paperId, question }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to get an answer.");
      }

      const data = await res.json();

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("[ChatPanel] Ask error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
          sources: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send on Enter (Shift+Enter does nothing special in a single-line input —
  // the browser prevents newlines in <input type="text"> by default)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (indexStatus === "indexing") {
      return (
        <span style={{
          fontSize: "11px", fontWeight: 600, padding: "3px 10px",
          borderRadius: "999px", backgroundColor: "#f59e0b20",
          border: "1px solid #f59e0b40", color: "#f59e0b",
          display: "flex", alignItems: "center", gap: "5px"
        }}>
          <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
          Building index…
        </span>
      );
    }
    if (indexStatus === "error") {
      return (
        <span style={{
          fontSize: "11px", fontWeight: 600, padding: "3px 10px",
          borderRadius: "999px", backgroundColor: "#ef444420",
          border: "1px solid #ef444440", color: "#ef4444"
        }}>
          ⚠ Index error
        </span>
      );
    }
    return (
      <span style={{
        fontSize: "11px", fontWeight: 600, padding: "3px 10px",
        borderRadius: "999px", backgroundColor: "#00d4aa15",
        border: "1px solid #00d4aa30", color: "#00d4aa"
      }}>
        ✓ Ready
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* CSS keyframes injected once — covers the typing dots and spin animations */}
      <style>{`
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        background: "#1e2130",
        border: "1px solid #2a2d3e",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── Panel header ──────────────────────────────────────────────── */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #2a2d3e",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1a1d2e",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Brain/robot icon using a unicode emoji — no import needed */}
            <span style={{ fontSize: "20px" }}>🧠</span>
            <div>
              <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "15px" }}>
                Ask the Paper
              </div>
              <div style={{ color: "#64748b", fontSize: "11px" }}>
                Powered by RAG + Gemini 2.5 Flash
              </div>
            </div>
          </div>
          <StatusBadge />
        </div>

        {/* ── Messages area ─────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          minHeight: "200px",
          maxHeight: "420px",
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          // Custom scrollbar styling for webkit browsers
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2d3e #1e2130",
        }}>

          {/* ── Error state ────────────────────────────────────────────── */}
          {indexStatus === "error" && (
            <div style={{
              textAlign: "center", padding: "32px 16px",
              color: "#ef4444", fontSize: "13px"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>Failed to build knowledge index</div>
              <div style={{ color: "#94a3b8", fontSize: "12px" }}>{indexError}</div>
            </div>
          )}

          {/* ── Indexing state ─────────────────────────────────────────── */}
          {indexStatus === "indexing" && (
            <div style={{
              textAlign: "center", padding: "40px 16px",
              color: "#94a3b8", fontSize: "13px"
            }}>
              <div style={{
                width: "48px", height: "48px", margin: "0 auto 16px",
                border: "3px solid #2a2d3e",
                borderTop: "3px solid #6c63ff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "6px" }}>
                Building knowledge index…
              </div>
              <div style={{ fontSize: "12px" }}>
                Chunking and embedding your paper. This takes ~5 seconds.
              </div>
            </div>
          )}

          {/* ── Empty state (ready, no messages yet) ──────────────────── */}
          {indexStatus === "ready" && messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px 16px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>💬</div>
              <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "6px" }}>
                Ready — ask anything about this paper
              </div>
              <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "20px" }}>
                Try one of these to get started:
              </div>
              <div style={{
                display: "flex", flexDirection: "column",
                gap: "8px", alignItems: "center"
              }}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    style={{
                      background: "#2a2d3e",
                      border: "1px solid #3d405a",
                      borderRadius: "999px",
                      color: "#c4b5fd",
                      fontSize: "13px",
                      padding: "8px 18px",
                      cursor: "pointer",
                      transition: "background 0.2s, border-color 0.2s",
                      maxWidth: "380px",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#6c63ff20";
                      e.target.style.borderColor = "#6c63ff60";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#2a2d3e";
                      e.target.style.borderColor = "#3d405a";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages list ──────────────────────────────────────────── */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: msg.role === "user" ? "70%" : "85%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "#6c63ff" : "#2a2d3e",
                  color: msg.role === "user" ? "#ffffff" : "#e2e8f0",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
              {/* Sources are only shown for assistant messages */}
              {msg.role === "assistant" && <SourcesBlock sources={msg.sources} />}
            </div>
          ))}

          {/* ── Typing indicator ───────────────────────────────────────── */}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                background: "#2a2d3e",
                borderRadius: "18px 18px 18px 4px",
              }}>
                <TypingIndicator />
              </div>
            </div>
          )}

          {/* Invisible sentinel div — we scroll to this after every new message */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input area ────────────────────────────────────────────────── */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid #2a2d3e",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          background: "#1a1d2e",
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              indexStatus === "indexing"
                ? "Building index, please wait…"
                : indexStatus === "error"
                ? "Index failed — unable to ask questions"
                : "Ask anything about this paper…"
            }
            disabled={isLoading || indexStatus !== "ready"}
            style={{
              flex: 1,
              background: "#0f1117",
              border: "1px solid #2a2d3e",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "#e2e8f0",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
              opacity: indexStatus !== "ready" ? 0.5 : 1,
            }}
            onFocus={(e) => { e.target.style.borderColor = "#6c63ff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#2a2d3e"; }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || indexStatus !== "ready" || !inputValue.trim()}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              border: "none",
              background: (isLoading || indexStatus !== "ready" || !inputValue.trim())
                ? "#2a2d3e"
                : "#6c63ff",
              color: "#fff",
              cursor: (isLoading || indexStatus !== "ready" || !inputValue.trim())
                ? "not-allowed"
                : "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.boxShadow = "0 0 16px #6c63ff80";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            title="Send question"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}