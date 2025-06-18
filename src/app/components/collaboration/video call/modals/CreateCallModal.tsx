"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface CreateCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
  theme: string;
}

export default function CreateCallModal({ isOpen, onClose, onCreate, theme }: CreateCallModalProps) {
  const [callTitle, setCallTitle] = useState("");

  const handleCreate = () => {
    if (callTitle.trim()) {
      onCreate(callTitle);
      setCallTitle("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`rounded-lg p-6 w-full max-w-md ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Create New Call</h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"}`}
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={callTitle}
              onChange={(e) => setCallTitle(e.target.value)}
              placeholder="Enter call title"
              maxLength={50}
              className={`w-full p-2 rounded-lg mb-3 ${theme === "light" ? "bg-gray-100 text-gray-900 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white" : "bg-fuchsia-700 hover:bg-fuchsia-800 text-white"}`}
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}