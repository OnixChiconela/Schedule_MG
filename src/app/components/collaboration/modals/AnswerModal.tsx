"use client"

import { simulateStreaming } from "@/app/api/actions/AI/hugging_face/generateText";
import { useTheme } from "@/app/themeContext";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  answer: string | null;
  onConfirm: (editedAnswer: string) => Promise<void>;
}

const AnswerModal = ({ isOpen, onClose, answer, onConfirm }: AnswerModalProps) => {
  const { theme } = useTheme();
  const [editedAnswer, setEditedAnswer] = useState(answer || '');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (answer) {
      setIsStreaming(true);
      setEditedAnswer("");
      simulateStreaming(
        answer,
        (chunk) => {
          setEditedAnswer((prev) => prev + chunk);
        },
        5,
        200
      ).then(() => {
        setIsStreaming(false);
      });
    }
  }, [answer]);

  if (!isOpen || !answer) return null;

  const handleConfirm = async () => {
    await onConfirm(editedAnswer);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      data-testid="answer-modal"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
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
            AI Answer
          </h3>
        </div>
        {isStreaming && !editedAnswer ? (
          <div className="flex justify-center items-center h-32">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
                theme === "light" ? "border-neutral-800" : "border-neutral-300"
              }`}
              data-testid="loading-spinner"
            ></div>
          </div>
        ) : (
          <textarea
            value={editedAnswer}
            onChange={(e) => setEditedAnswer(e.target.value)}
            className={`w-full p-2 rounded mb-4 ${
              theme === "light" ? "bg-gray-50/20 text-neutral-800" : "bg-slate-800/20 text-neutral-200"
            } resize-none h-[75%]`}
            placeholder="Edit the generated answer..."
            data-testid="answer-textarea"
            disabled={isStreaming} // Disable editing while streaming
          />
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded ${
              theme === "light"
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-3 py-1 rounded ${
              theme === "light"
                ? "bg-neutral-800 text-white hover:bg-neutral-900"
                : "bg-neutral-950 hover:bg-black"
            }`}
            disabled={isStreaming} // Disable confirm button while streaming
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
export default AnswerModal;