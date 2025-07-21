import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-4">Page not found</p>
      <button className="px-6 py-2 rounded bg-blue-600 text-white font-semibold" onClick={() => navigate("/")}>Go Home</button>
    </div>
  );
} 