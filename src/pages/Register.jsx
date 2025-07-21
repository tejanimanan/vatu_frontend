import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from '../utils/api';

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await post('/users/register', { username, email, password, name: username });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-white">
      <h1 className="text-2xl font-bold mb-4">Register for MyInsta</h1>
      <form className="bg-[#232323] p-6 rounded-lg w-full max-w-xs" onSubmit={handleRegister}>
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <button className="w-full py-2 rounded bg-blue-600 text-white font-semibold" type="submit">Register</button>
      </form>
    </div>
  );
} 