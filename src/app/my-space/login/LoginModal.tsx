"use client";

import { useState } from "react";
import { useTheme } from "@/app/themeContext";
import api from "@/app/api/api";
import BaseAuthModal from "../BaseAuthModal";

interface LoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/login", { email, password }, { withCredentials: true });
      window.location.href = "/team-chat"; // Ajuste conforme sua rota
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseAuthModal isOpen={isOpen} onClose={onClose} title="Login">
      {error && (
        <div className="p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className={`block text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-600 text-white"
            }`}
            placeholder="Enter your email"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className={`block text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-600 text-white"
            }`}
            placeholder="Enter your password"
            required
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg font-medium transition-all ${
            theme === "light"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-500 hover:underline"
            aria-label="Switch to register"
          >
            Register
          </button>
        </p>
      </div>
    </BaseAuthModal>
  );
};

export default LoginModal;
