// frontend/src/components/PaperCard.jsx
// The metadata display card shown after a successful PDF upload

export default function PaperCard({ filename, titleGuess, pageCount, wordCount }) {
  // Format word count with thousands separator for readability
  const formattedWords = wordCount?.toLocaleString() ?? "—";

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "#1e2130", borderColor: "#2a2d3e" }}
    >
      {/* ── Card header ─────────────────────────────────────────────── */}
      <div
        className="px-5 py-4 border-b flex items-start justify-between gap-4"
        style={{ borderColor: "#2a2d3e" }}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Document icon tile */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#6c63ff20" }}
          >
            📑
          </div>

          <div className="min-w-0">
            {/* Guessed title — truncated with ellipsis if too long */}
            <p
              className="font-semibold text-sm leading-snug truncate"
              style={{ color: "#e2e8f0", maxWidth: "480px" }}
              title={titleGuess}   // Show full text on hover via native tooltip
            >
              {titleGuess || "Untitled Paper"}
            </p>
            {/* Original filename */}
            <p className="text-xs mt-1 truncate" style={{ color: "#94a3b8" }}>
              {filename}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#10b98115", color: "#10b981" }}
        >
          Extracted
        </span>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: "#2a2d3e" }}>
        {/* Stat tile helper — defined inline to keep this file self-contained */}
        {[
          { label: "Pages", value: pageCount, icon: "📃" },
          { label: "Words", value: formattedWords, icon: "✏️" },
          { label: "Format", value: "PDF", icon: "📎" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center gap-1 py-5"
            style={{ borderColor: "#2a2d3e" }}
          >
            <span className="text-lg">{stat.icon}</span>
            <p
              className="text-xl font-bold tabular-nums"
              style={{ color: "#e2e8f0" }}
            >
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── footer ────────────────────────────────────── */}
      <div
        className="px-5 py-3 border-t flex items-center gap-2"
        style={{ borderColor: "#2a2d3e", backgroundColor: "#ffffff04" }}
      >
        <span className="text-xs" style={{ color: "#4a5568" }}>
          🔮 Phase 2 will add TF-IDF keywords, AI summary, and Q&A
        </span>
      </div>
    </div>
  );
}