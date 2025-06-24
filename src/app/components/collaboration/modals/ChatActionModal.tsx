"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Message } from "../CollaborationChatView";
import { useTheme } from "@/app/themeContext";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ChatActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnswer: () => Promise<void>;
  onSummarize: () => Promise<void>;
  onOpenSchedule: () => void;
  messages: Message[];
}

const ChatActionModal = ({
  isOpen,
  onClose,
  onAnswer,
  onSummarize,
  onOpenSchedule,
  messages,
}: ChatActionModalProps) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      data-testid="chat-action-modal"
    >
      <div
        className={`w-[80%] max-w-md rounded-xl p-6 ${
          theme === "light" ? "bg-white text-neutral-800" : "bg-slate-900 text-neutral-200"
        } shadow-lg`}
      >
        <div className="flex items-center mb-5 gap-2">
          <Sparkles size={18} />
          <h3
            className={`text-xl font-semibold ${
              theme === "light" ? "text-neutral-800" : "text-neutral-300"
            }`}
          >
            Chat Actions
          </h3>
        </div>
        <div className="space-y-3 mb-6">
          <button
            onClick={async () => {
              try {
                await onAnswer();
                onClose();
              } catch (error) {
                toast.error("Failed to answer", { duration: 3000 });
              }
            }}
            className={`w-full p-3 rounded-lg font-medium transition-all duration-200 ${
              theme === "light"
                ? "bg-neutral-800 text-white hover:bg-neutral-900"
                : "bg-neutral-950 text-white hover:bg-black"
            } ${messages.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={messages.length === 0}
            data-testid="answer-button"
          >
            Answer
          </button>
          <button
            onClick={async () => {
              try {
                await onSummarize();
                onClose();
              } catch (error) {
                toast.error("Failed to summarize", { duration: 3000 });
              }
            }}
            className={`w-full p-3 rounded-lg font-medium transition-all duration-200 ${
              theme === "light"
                ? "bg-gray-50/20 border border-gray-200 text-neutral-800 hover:bg-gray-200"
                : "bg-slate-800/20 border border-slate-600 text-neutral-200 hover:bg-slate-700"
            } ${messages.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={messages.length === 0}
            data-testid="summarize-button"
          >
            Summarize
          </button>
          <button
            onClick={() => {
              toast.error("Scheduling is disabled", {
                duration: 3000,
                style: {
                  background: theme === "light" ? "#fff" : "#1e293b",
                  color: theme === "light" ? "#1f2937" : "#f4f4f6",
                  border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
              });
            }}
            className={`w-full p-3 rounded-lg font-medium transition-all duration-200 ${
              theme === "light"
                ? "bg-gray-50/20 border border-gray-400 text-gray-400 cursor-not-allowed"
                : "bg-slate-800/20 border border-slate-500 text-gray-500 cursor-not-allowed"
            }`}
            disabled={true}
            data-testid="schedule-button"
          >
            Schedule
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              theme === "light"
                ? "bg-gray-50/20 border border-gray-200 text-neutral-800 hover:bg-gray-200"
                : "bg-slate-800/20 border border-slate-600 text-neutral-200 hover:bg-slate-700"
            }`}
            data-testid="close-button"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatActionModal;