import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome to MyInsta</h1>
      <button className="px-6 py-2 rounded bg-blue-600 text-white font-semibold" onClick={() => navigate("/")}>Go to Feed</button>
    </div>
  );
} 