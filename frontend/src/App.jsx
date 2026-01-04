// import Dashboard from "./pages/Dashboard.jsx";

// export default function App() {
//   return <Dashboard />;
// }
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    // 👇 CRITICAL: basename must match server route /dashboard
    <BrowserRouter basename="/dashboard">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Catch-all to prevent 404s inside React */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}