"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Message } from "../CollaborationChatView";
import { useTheme } from "@/app/themeContext";

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
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`w-80 rounded-lg p-4 ${theme === "light" ? "bg-white text-black" : "bg-blue-900 text-white"}`}
      >
        <h3 className="text-lg font-semibold mb-4">Chat Actions</h3>
        <div className="space-y-2 mb-4">
          <button
            onClick={async () => {
              try {
                await onAnswer();
                onClose();
              } catch (error) {
                toast.error("Failed to answer", { duration: 3000 });
              }
            }}
            className={`w-full p-2 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
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
            className={`w-full p-2 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
            disabled={messages.length === 0}
            data-testid="summarize-button"
          >
            Summarize
          </button>
          <button
            onClick={() => {
              onOpenSchedule();
              onClose();
            }}
            className={`w-full p-2 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
            data-testid="schedule-button"
          >
            Schedule
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
            data-testid="close-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatActionModal;