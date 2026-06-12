// frontend/src/components/StatsBar.jsx
// What this file is: A horizontal row of 4 stat cards summarising key paper metrics.
// Why it exists: Gives users an at-a-glance reading of the paper's scale before
//   they dive into keywords and summaries.
// What it does in Phase 2: Displays word count, sections found, reading time,
//   and total keywords extracted — all derived from the /analyze response.

export default function StatsBar({ stats, keywords }) {

  // Count total keywords across all sections so we have a single number to show
  const totalKeywords = Object.values(keywords).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // Each card definition: icon (SVG path), value, and label
  const statCards = [
    {
      icon: (
        // Document icon
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             className="w-5 h-5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0
                   2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/>
          <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/>
          <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      value: stats.word_count.toLocaleString(),
      label: "Word Count",
    },
    {
      icon: (
        // Layers icon
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             className="w-5 h-5">
          <polygon points="12 2 2 7 12 12 22 7 12 2"
                   strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="2 17 12 22 22 17"
                    strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="2 12 12 17 22 12"
                    strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      value: stats.section_count,
      label: "Sections Found",
    },
    {
      icon: (
        // Clock icon
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             className="w-5 h-5">
          <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
          <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      value: `${stats.reading_time_minutes} min`,
      label: "Reading Time",
    },
    {
      icon: (
        // Tag icon
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             className="w-5 h-5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59
                   8.59a2 2 0 0 1 0 2.82z" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round"/>
        </svg>
      ),
      value: totalKeywords,
      label: "Keywords Extracted",
    },
  ];

  return (
    // Responsive grid: 2 columns on small screens, 4 on md+
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 p-5 rounded-xl border border-[#2a2d3e] bg-[#1e2130]
                     hover:border-[#6c63ff44] transition-colors duration-200"
        >
          {/* Icon with purple accent */}
          <span className="text-[#6c63ff]">
            {card.icon}
          </span>

          {/* Large numeric / value */}
          <span className="text-[28px] font-bold text-[#e2e8f0] leading-none tracking-tight">
            {card.value}
          </span>

          {/* Muted label below */}
          <span className="text-[12px] text-[#94a3b8] uppercase tracking-wide">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}