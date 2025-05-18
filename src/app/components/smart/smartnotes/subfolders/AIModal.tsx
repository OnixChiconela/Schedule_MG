"use client";

import { useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/app/themeContext";
import toast from "react-hot-toast";
import { PenTool, Zap } from "lucide-react";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

export default function AIModal({
  isOpen,
  onClose,
  onSubmit,
}: AIModalProps) {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<string>(""); // Estado inicial vazio

  const safeTheme = theme || "light";

  const handleSubmit = () => {
    if (!prompt.trim()) {
      console.warn("handleSubmit: Prompt is empty");
      toast.error("Prompt is empty");
      return;
    }
    // Adicionar apenas o tom ao prompt, sem instrução fixa
    const finalPrompt =
      tone
        ? `${tone}: ${prompt}`
        : prompt;
    onSubmit(finalPrompt);
    setPrompt("");
    setTone(""); // Resetar o tom após o envio
    onClose();
  };

  const handleBackgroundClick = () => {
    onClose();
  };

  const handleModalContentClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleToneChange = (value: string) => {
    // Se o valor clicado for o mesmo que o atual, desmarcar (setar como "")
    if (tone === value) {
      setTone("");
    } else {
      setTone(value);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        safeTheme === "light" ? "bg-gray-100/50" : "bg-slate-800/50"
      }`}
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleBackgroundClick}
    >
      <motion.div
        className={`p-6 rounded-2xl shadow-xl w-full max-w-md ${
          safeTheme === "light" ? "bg-white" : "bg-slate-800/90"
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleModalContentClick}
      >
        <h2
          className={`text-2xl font-semibold mb-4 ${
            safeTheme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Generate with AI
        </h2>
        <div className="space-y-4">
          {/* Seletor de tom com botões estilizados */}
          <div>
            <label
              className={`block mb-2 font-medium ${
                safeTheme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              Select tone (optional):
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleToneChange("dynamic")}
                className={`px-4 py-1 flex items-center gap-2 rounded-full border-2 cursor-pointer transition-colors ${
                  safeTheme === "light"
                    ? "border-gray-300 text-gray-700 hover:border-neutral-500"
                    : "border-slate-600 text-gray-300 hover:border-neutral-400"
                } ${
                  tone === "dynamic"
                    ? safeTheme === "light"
                      ? "border-purple-500 bg-neutral-100"
                      : "border-purple-200 bg-slate-700"
                    : ""
                }`}
              >
                Dynamic
                <Zap />
              </button>
              <button
                onClick={() => handleToneChange("formal")}
                className={`px-6 py-1 flex items-center gap-2 rounded-full border-2 cursor-pointer transition-colors ${
                  safeTheme === "light"
                    ? "border-gray-300 text-gray-700 hover:border-neutral-500"
                    : "border-slate-600 text-gray-300 hover:border-neutral-400"
                } ${
                  tone === "formal"
                    ? safeTheme === "light"
                      ? "border-neutral-800 bg-neutral-100"
                      : "border-neutral-200 bg-slate-700"
                    : ""
                }`}
              >
                Formal
                <PenTool />
              </button>
            </div>
          </div>
          {/* Textarea para o prompt */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt to generate text..."
            rows={4}
            className={`w-full p-3 rounded-lg border ${
              safeTheme === "light"
                ? "border-gray-300 bg-white text-gray-900"
                : "border-slate-600 bg-slate-900 text-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-neutral-700`}
          />
          <div className="flex justify-end space-x-2">
            <motion.button
              onClick={() => {
                setPrompt("");
                onClose();
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                safeTheme === "light"
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  : "bg-slate-600 hover:bg-slate-500 text-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={() => {
                handleSubmit();
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                safeTheme === "light"
                  ? "bg-neutral-900 hover:bg-black text-white"
                  : "bg-neutral-900 hover:bg-black text-gray-100"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!prompt.trim()}
            >
              Submit
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}