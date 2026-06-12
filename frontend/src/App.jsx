// frontend/src/App.jsx
// The root React component and router configuration.

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark min-h-screen bg-background text-text-primary">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}