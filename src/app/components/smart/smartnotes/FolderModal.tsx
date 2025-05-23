"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
  theme: "light" | "dark";
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, onCreate, theme }) => {
  const [title, setTitle] = useState("");

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title.trim());
      setTitle("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 ${theme === "light" ? "bg-gray-100/50" : "bg-slate-800/50"
        }`}
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={`p-6 rounded-xl shadow-md w-full max-w-md ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-gray-700"
          }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"
            }`}
        >
          New Vault
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Folder name"
            className={`w-full p-3 rounded-lg border ${theme === "light"
              ? "border-gray-300 bg-white text-gray-900"
              : "border-slate-600 bg-slate-800 text-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-neutral-700`}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <motion.button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${theme === "light"
                ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                : "bg-slate-600 hover:bg-slate-500 text-gray-200"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleCreate}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1 ${theme === "light"
                ? "bg-neutral-900 hover:bg-black text-white"
                : "bg-neutral-900 hover:bg-black text-gray-200"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!title.trim()}
            >
              <Plus size={17} />
              Create
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FolderModal;