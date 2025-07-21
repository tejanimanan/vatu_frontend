import { useState } from "react";

export default function useAuth() {
  // Simulate auth state
  const [user, setUser] = useState({ username: "man._.patel_", name: "Manan Tejani" });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // Add login, logout, register logic as needed
  return { user, isAuthenticated };
} 