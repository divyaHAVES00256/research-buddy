// frontend/src/components/SummaryPanel.jsx
// What this file is: An accordion panel displaying the 5-field structured summary.
// Why it exists: Accordion cards let users scan all 5 fields at a glance and
//   drill into only the ones they care about, without a wall of text.
// What it does in Phase 2: Renders one collapsible card per summary field, with
//   icons, smooth height animation, and a "not stated" italic fallback style.

import { useState } from "react";

// NOT_STATED is the sentinel string the backend returns when a field can't be found
const NOT_STATED = "Not explicitly stated in this paper.";

// Summary card definitions: key in the summary object, display title, and SVG icon
const CARD_DEFINITIONS = [
  {
    key:   "problem_statement",
    title: "Problem Statement",
    icon: (
      // Target / crosshair icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           className="w-4 h-4 flex-shrink-0">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    key:   "methodology",
    title: "Methodology",
    icon: (
      // Flask / beaker icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           className="w-4 h-4 flex-shrink-0">
        <path d="M9 3h6M9 3v7l-5 9h14L14 10V3M9 3h6"
              strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 17.5h11" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key:   "key_results",
    title: "Key Results",
    icon: (
      // Bar chart icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           className="w-4 h-4 flex-shrink-0">
        <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="12" y2="4"  strokeLinecap="round"/>
        <line x1="6"  y1="20" x2="6"  y2="14" strokeLinecap="round"/>
        <line x1="2"  y1="20" x2="22" y2="20" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key:   "limitations",
    title: "Limitations",
    icon: (
      // Alert triangle icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           className="w-4 h-4 flex-shrink-0">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0
                 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="9"  x2="12" y2="13" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key:   "future_work",
    title: "Future Work",
    icon: (
      // Rocket icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           className="w-4 h-4 flex-shrink-0">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18
                 2.18 0 0 0-2.91-.09z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78
                 7.5-6 11a22.35 22.35 0 0 1-4 2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M15 12v5s3.03-.55
                 4-2c1.08-1.62 0-5 0-5"  strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

// Individual accordion card component
function AccordionCard({ definition, text, defaultOpen }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isNotStated = text === NOT_STATED;

  return (
    <div className="border border-[#2a2d3e] rounded-lg overflow-hidden">

      {/* Card header — clickable to toggle */}
      <button
        className="w-full flex items-center justify-between px-5 py-4
                   text-left hover:bg-[#ffffff08] transition-colors duration-150"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {/* Icon + title row */}
        <div className="flex items-center gap-3 text-[#6c63ff]">
          {definition.icon}
          <span className="text-sm font-semibold text-[#e2e8f0]">
            {definition.title}
          </span>
        </div>

        {/* Chevron — rotates 180° when the card is open */}
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-[#64748b] transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Collapsible body — max-height trick: animate between 0 and a large value.
          We use a fixed max of 600px; for any card that overflows, the user can
          scroll inside. Using 'max-height: none' on a closed element breaks the
          animation, so we use a pixel value large enough for any realistic summary. */}
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "600px" : "0px" }}
      >
        <div className="px-5 pb-5 pt-1">
          <p
            className="text-sm leading-relaxed"
            style={{
              color:      isNotStated ? "#4b5563" : "#94a3b8",
              fontStyle:  isNotStated ? "italic" : "normal",
              lineHeight: "1.7",
            }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPanel({ summary }) {
  return (
    <div className="rounded-xl border border-[#2a2d3e] bg-[#1e2130] p-6">

      {/* Panel header with AI-generated badge */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-base font-semibold text-[#e2e8f0]">
          Structured Summary
        </h2>
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide"
          style={{
            backgroundColor: "rgba(0, 212, 170, 0.12)",
            color:           "#00d4aa",
            border:          "1px solid rgba(0, 212, 170, 0.3)",
          }}
        >
          Heuristic
        </span>
      </div>

      {/* Accordion cards — Problem Statement is open by default, rest collapsed */}
      <div className="space-y-2">
        {CARD_DEFINITIONS.map((def, index) => (
          <AccordionCard
            key={def.key}
            definition={def}
            text={summary[def.key] || NOT_STATED}
            defaultOpen={index === 0} // only first card starts open
          />
        ))}
      </div>
    </div>
  );
}