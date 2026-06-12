// frontend/src/components/Sidebar.jsx
// Reusable left navigation sidebar component
import { Link, useLocation } from "react-router-dom";

// Navigation items
const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: "⊞",         
    path: "/",
    enabled: true,    
  },
  {
    label: "Paper History",
    icon: "⊟",
    path: "/history",
    enabled: false,     
  },
  {
    label: "Q&A Chat",
    icon: "◈",
    path: "/chat",
    enabled: false,     
  },
  {
    label: "Settings",
    icon: "⊕",
    path: "/settings",
    enabled: false,
  },
];

export default function Sidebar() {
  // useLocation gives us the current URL path so we can highlight the active nav item
  const location = useLocation();

  return (
    <aside
      className="flex flex-col w-60 h-screen flex-shrink-0 border-r"
      style={{
        backgroundColor: "#1a1d27",
        borderColor: "#2a2d3e",
      }}
    >
      {/*  App branding / logo area  */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "#2a2d3e" }}
      >
        {/* Logo icon — a stylised atom/flask emoji */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: "#6c63ff20" }}
        >
          ⚗️
        </div>
        <div>
          <p className="text-sm font-semibold leading-none" style={{ color: "#e2e8f0" }}>
            Research Buddy
          </p>
          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
            AI Paper Assistant
          </p>
        </div>
      </div>

      {/*  Navigation  */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p
          className="text-xs font-semibold uppercase tracking-widest px-2 mb-3"
          style={{ color: "#4a5568" }}
        >
          Navigation
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;

          // Disabled items are rendered as non-interactive spans
          if (!item.enabled) {
            return (
              <div
                key={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-not-allowed opacity-40"
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-sm" style={{ color: "#94a3b8" }}>
                  {item.label}
                </span>
                {/* "Soon" badge on disabled items */}
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "#2a2d3e", color: "#94a3b8" }}
                >
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
              style={{
                // Active item: purple background tint + accent text
                // Inactive: transparent background with secondary text
                backgroundColor: isActive ? "#6c63ff20" : "transparent",
                color: isActive ? "#6c63ff" : "#94a3b8",
              }}
              // Hover is handled via inline event handlers since Tailwind
              // can't target arbitrary color variables in hover: variants reliably
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#2a2d3e";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {/* Active indicator dot on the right */}
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#6c63ff" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / phase indicator */}
      <div
        className="px-5 py-4 border-t"
        style={{ borderColor: "#2a2d3e" }}
      >
        <p className="text-xs" style={{ color: "#4a5568" }}>
          Phase 1 of 4
        </p>
        {/* Progress bar showing Phase 1 completion */}
        <div
          className="mt-2 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "#2a2d3e" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: "25%", backgroundColor: "#6c63ff" }}
          />
        </div>
      </div>
    </aside>
  );
}