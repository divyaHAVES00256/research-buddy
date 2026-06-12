// frontend/src/components/KeywordsPanel.jsx
// What this file is: A panel that displays TF-IDF-extracted keywords as coloured chips.
// Why it exists: Chips are the most scannable way to show keyword lists; users can
//   immediately see what each section is "about" without reading prose.
// What it does in Phase 2: Renders one chip-group per paper section, cycling
//   through 4 accent colors, with hover effects and a TF-IDF provenance badge.

// 4 accent color sets — each has: text color, border color, bg rgba, hover bg rgba
const ACCENT_COLORS = [
  {
    text:     "#6c63ff",
    border:   "#6c63ff",
    bg:       "rgba(108, 99, 255, 0.12)",
    hoverBg:  "rgba(108, 99, 255, 0.25)",
  },
  {
    text:     "#00d4aa",
    border:   "#00d4aa",
    bg:       "rgba(0, 212, 170, 0.12)",
    hoverBg:  "rgba(0, 212, 170, 0.25)",
  },
  {
    text:     "#ff6b6b",
    border:   "#ff6b6b",
    bg:       "rgba(255, 107, 107, 0.12)",
    hoverBg:  "rgba(255, 107, 107, 0.25)",
  },
  {
    text:     "#ffd93d",
    border:   "#ffd93d",
    bg:       "rgba(255, 217, 61, 0.12)",
    hoverBg:  "rgba(255, 217, 61, 0.25)",
  },
];

// Capitalise first letter and replace underscores with spaces for display
function formatSectionName(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// A single keyword chip — uses inline style for the dynamic accent colors
function Chip({ label, color }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium cursor-default
                 transition-all duration-150 border"
      style={{
        color:           color.text,
        borderColor:     color.border,
        backgroundColor: color.bg,
      }}
      // CSS-in-JS hover isn't possible with plain inline styles, so we use
      // onMouseEnter / onMouseLeave to swap the background color imperatively
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = color.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = color.bg;
      }}
    >
      {label}
    </span>
  );
}

export default function KeywordsPanel({ keywords }) {
  // Filter to only sections that have at least one keyword
  const activeSections = Object.entries(keywords).filter(
    ([, terms]) => terms.length > 0
  );

  if (activeSections.length === 0) {
    return null; // Don't render an empty panel
  }

  return (
    <div className="rounded-xl border border-[#2a2d3e] bg-[#1e2130] p-6">

      {/* Panel header with TF-IDF badge */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-base font-semibold text-[#e2e8f0]">
          Extracted Keywords
        </h2>
        {/* Provenance badge — tells the user exactly how these were generated */}
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide"
          style={{
            backgroundColor: "rgba(108, 99, 255, 0.18)",
            color:           "#a89dff",
            border:          "1px solid rgba(108, 99, 255, 0.35)",
          }}
        >
          TF-IDF
        </span>
      </div>

      {/* One section group per section that has keywords */}
      <div className="space-y-5">
        {activeSections.map(([sectionKey, terms], sectionIndex) => {
          // Cycle through the 4 accent colors by section index
          const color = ACCENT_COLORS[sectionIndex % ACCENT_COLORS.length];

          return (
            <div key={sectionKey}>
              {/* Section label */}
              <p className="text-[11px] font-semibold uppercase tracking-widest
                            text-[#64748b] mb-3">
                {formatSectionName(sectionKey)}
              </p>

              {/* Keyword chip row — wraps naturally on narrow screens */}
              <div className="flex flex-wrap gap-2">
                {terms.map((term) => (
                  <Chip key={term} label={term} color={color} />
                ))}
              </div>

              {/* Thin divider between sections (not after the last one) */}
              {sectionIndex < activeSections.length - 1 && (
                <div className="mt-5 border-t border-[#2a2d3e]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}