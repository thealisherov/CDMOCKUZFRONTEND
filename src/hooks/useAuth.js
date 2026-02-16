"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check local storage or cookie for session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    // Mock login logic
    console.log("Logging in with", email, password);
    const mockUser = { id: "1", name: "Test User", email, role: "student" };
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
    router.push("/dashboard/reading");
  };

  const register = async (name, email, password) => {
    // Mock registration logic
    console.log("Registering", name, email, password);
    const mockUser = { id: "1", name, email, role: "student" };
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
    router.push("/dashboard/reading");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
