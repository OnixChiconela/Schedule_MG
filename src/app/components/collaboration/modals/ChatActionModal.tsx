import { useState } from "react";
import toast from "react-hot-toast";
import { Message } from "../CollaborationChatView";
import { useTheme } from "@/app/themeContext";

interface ChatActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnswer: () => Promise<void>;
  onSummarize: () => Promise<void>;
  onCreate: (prompt: string, scheduledTime: string) => Promise<void>;
  messages: Message[];
}

const ChatActionModal = ({
  isOpen,
  onClose,
  onAnswer,
  onSummarize,
  onCreate,
  messages,
}: ChatActionModalProps) => {
  const [prompt, setPrompt] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sendOption, setSendOption] = useState<"now" | "schedule">("now");

  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt is required", { duration: 3000 });
      return;
    }
    if (sendOption === "schedule" && !scheduledTime) {
      toast.error("Scheduled time is required", { duration: 3000 });
      return;
    }
    try {
      const timeToSend = sendOption === "now" ? new Date().toISOString() : scheduledTime;
      await onCreate(prompt, timeToSend);
      setPrompt("");
      setScheduledTime("");
      setShowCreateForm(false);
      setSendOption("now");
      onClose();
    } catch (error) {
      toast.error("Failed to schedule message", { duration: 3000 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`w-80 rounded-lg p-4 ${theme === "light" ? "bg-white text-black" : "bg-blue-900 text-white"}`}
      >
        <h3 className="text-lg font-semibold mb-4">Chat Actions</h3>
        {!showCreateForm ? (
          <div className="space-y-2 mb-4">
            <button
              onClick={async () => {
                await onAnswer();
                onClose();
              }}
              className={`w-full p-2 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
              disabled={messages.length === 0}
              data-testid="answer-button"
            >
              Answer
            </button>
            <button
              onClick={async () => {
                await onSummarize();
                onClose();
              }}
              className={`w-full p-2 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
              disabled={messages.length === 0}
              data-testid="summarize-button"
            >
              Summarize
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className={`w-full p-2 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
              data-testid="create-button"
            >
              Create
            </button>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`w-full p-2 rounded ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-blue-700 border-blue-200"} resize-none h-24`}
              placeholder="Enter your prompt..."
              data-testid="prompt-input"
            />
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="now"
                  checked={sendOption === "now"}
                  onChange={() => setSendOption("now")}
                  className="mr-2"
                  data-testid="send-now-toggle"
                />
                Enviar Agora
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="schedule"
                  checked={sendOption === "schedule"}
                  onChange={() => setSendOption("schedule")}
                  className="mr-2"
                  data-testid="schedule-toggle"
                />
                Agendar
              </label>
            </div>
            {sendOption === "schedule" && (
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={`w-full p-2 rounded ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-blue-700 border-blue-200"}`}
                data-testid="schedule-input"
              />
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateForm(false)}
                className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                className={`px-3 py-1 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
                data-testid="schedule-button"
              >
                {sendOption === "now" ? "Send" : "Schedule"}
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatActionModal;