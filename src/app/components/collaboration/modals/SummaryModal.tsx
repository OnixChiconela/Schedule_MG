"use client";

import { simulateStreaming } from "@/app/api/actions/AI/hugging_face/generateText";
import { useTheme } from "@/app/themeContext";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string | null;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, summary }) => {
  const { theme } = useTheme();
  const [displayedSummary, setDisplayedSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (summary) {
      setIsStreaming(true);
      setDisplayedSummary(""); // Reset before streaming
      simulateStreaming(
        summary,
        (chunk) => {
          setDisplayedSummary((prev) => prev + chunk);
        },
        5, // Chunk size
        200 // Delay between chunks
      ).then(() => {
        setIsStreaming(false); // Streaming complete
      });
    }
  }, [summary]);

  if (!isOpen || !summary) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      data-testid="summary-modal"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`w-[80%] h-[60%] p-4 rounded ${
          theme === "light" ? "bg-white text-gray-900" : "bg-slate-900 text-white"
        }`}
      >
        <div className="flex items-center mb-4 gap-2">
          <Sparkles size={18} />
          <h3
            className={`text-lg font-semibold ${
              theme === "light" ? "" : "text-neutral-300"
            }`}
          >
            Chat Summary
          </h3>
        </div>
        {isStreaming && !displayedSummary ? (
          <div className="flex justify-center items-center h-32">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
                theme === "light" ? "border-neutral-800" : "border-neutral-300"
              }`}
              data-testid="loading-spinner"
            ></div>
          </div>
        ) : (
          <p
            className={`w-full p-2 rounded mb-4 ${
              theme === "light" ? "bg-gray-50/20 text-neutral-800" : "bg-slate-800/20 text-neutral-200"
            } h-[75%]`}
            data-testid="summary-text"
          >
            {displayedSummary || "Summary is being generated..."}
          </p>
        )}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded ${
              theme === "light"
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryModal;