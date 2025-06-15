"use client"

import { useTheme } from "@/app/themeContext";
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

  useEffect(() => {
    if (answer) {
      setEditedAnswer(answer);
    }
  }, [answer]);

  if (!isOpen || !answer) return null;

  const handleConfirm = async () => {
    await onConfirm(editedAnswer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-[1000]" data-testid="answer-modal">
      <div
        className={`w-96 p-4 rounded ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-blue-900 text-white'}`}
      >
        <h3 className="text-lg font-semibold mb-4">Edit and Confirm Answer</h3>
        <textarea
          value={editedAnswer}
          onChange={(e) => setEditedAnswer(e.target.value)}
          className={`w-full p-2 rounded mb-4 ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-blue-700 border-blue-200'} resize-none h-32`}
          placeholder="Edit the generated answer..."
          data-testid="answer-textarea"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-blue-700 hover:bg-blue-600'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
export default AnswerModal;