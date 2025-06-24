"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/themeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, X, Sparkles } from "lucide-react";
import { DndContext, useDraggable, useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { simulateStreaming } from "@/app/api/actions/AI/hugging_face/generateText";
import toast from "react-hot-toast";

interface AICallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, audioBlob?: Blob) => Promise<string | null>;
  peerStream?: MediaStream | null;
}

interface MiniAICallModalProps {
  theme: string;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (prompt: string, audioBlob?: Blob | null) => void;
  onExpand: () => void;
  position: { x: number; y: number };
  isDragging?: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
  peerStream?: MediaStream | null;
  isMicEnabled: boolean
  enableMic: () => void
}

interface ExpandedAICallModalProps {
  theme: string;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (prompt: string, audioBlob?: Blob | null) => void;
  onMinimize: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  peerStream?: MediaStream | null;
  audioBlob: Blob | null;
  position: { x: number; y: number };
  isDragging?: boolean;
  response: string | null;
  isResponseStreaming: boolean;
  isMicEnabled: boolean
  enableMic: () => void
}

function MiniAICallModal({
  theme,
  prompt,
  setPrompt,
  onSubmit,
  onExpand,
  position,
  isDragging,
  isRecording,
  toggleRecording,
  peerStream,
  isMicEnabled,
  enableMic
}: MiniAICallModalProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "mini-ai-call-modal",
  });

  const style = {
    position: "fixed" as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transform ? "none" : "transform 0.05s ease-out",
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 1002 : 1000,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`rounded-xl p-4 w-85 shadow-lg flex items-center gap-2 ${theme === "light" ? "bg-white border border-gray-200" : "bg-slate-900 border border-slate-600"
        } hover:shadow-xl transition-shadow duration-200 select-none`}
    >
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask AI..."
        className={`flex-1 p-2 rounded-lg text-sm ${theme === "light" ? "bg-gray-50/20 text-neutral-800" : "bg-slate-800/20 text-neutral-200"
          } focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleRecording();
          if (!isMicEnabled) {
            enableMic();
            toast.success("Microphone enabled", {
              duration: 3000,
              style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
              },
            });
          } else {
            toggleRecording();
            toast.success(isRecording ? "Recording stopped" : "Recording started", {
              duration: 3000,
              style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
              },
            });
          }
        }}
        disabled={!peerStream || (!isMicEnabled && !isRecording)}
        className={`p-2 rounded-full ${!peerStream || (!isMicEnabled && !isRecording)
          ? "opacity-50 cursor-not-allowed"
          : isRecording
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            : theme === "light"
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        title={isRecording ? "Stop recording" : "Record audio"}
      >
        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          prompt.trim() && onSubmit(prompt);
        }}
        disabled={!prompt.trim()}
        className={`p-2 rounded-full ${prompt.trim()
          ? theme === "light"
            ? "bg-neutral-800 hover:bg-neutral-900 text-white"
            : "bg-neutral-950 hover:bg-black text-white"
          : "opacity-50 cursor-not-allowed"
          }`}
        title="Send prompt"
      >
        <Send size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className={`p-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-600"
          }`}
        title="Expand"
      >
        <X size={16} className="rotate-45" />
      </button>
    </motion.div>
  );
}

function ExpandedAICallModal({
  theme,
  prompt,
  setPrompt,
  onSubmit,
  onMinimize,
  isRecording,
  toggleRecording,
  peerStream,
  audioBlob,
  position,
  isDragging,
  response,
  isResponseStreaming,
  isMicEnabled,
  enableMic,
}: ExpandedAICallModalProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "expanded-ai-call-modal",
  });

  const style = {
    position: "fixed" as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transform ? "none" : "transform 0.05s ease-out",
    cursor: "default",
    zIndex: isDragging ? 1002 : 1000,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-xl p-6 w-[80%] max-w-lg h-[400px] flex flex-col shadow-xl ${
        theme === "light" ? "bg-white border border-gray-200" : "bg-slate-900 border border-slate-600"
      } hover:shadow-xl transition-shadow duration-200 select-none`}
    >
      <div
        className="flex justify-between items-center mb-4 cursor-grab flex-shrink-0"
        {...attributes}
        {...listeners}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h2 className={`text-xl font-semibold ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
            AI Interaction
          </h2>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
          title="Minimize"
          aria-label="Minimize AI modal"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 mb-4">
        {response !== null && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} />
              <h3 className={`text-sm font-medium ${theme === "light" ? "text-neutral-800" : "text-neutral-300"}`}>
                AI Response
              </h3>
            </div>
            {isResponseStreaming && !response?.length ? (
              <div className="flex justify-center items-center ">
                <div
                  className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
                    theme === "light" ? "border-neutral-800" : "border-neutral-300"
                  }`}
                  data-testid="response-loading-spinner"
                ></div>
              </div>
            ) : (
              <p
                className={`w-full p-3 rounded-lg h-[100px] overflow-y-auto ${
                  theme === "light" ? "bg-gray-50/20 text-neutral-800 border border-gray-200/30" : "bg-slate-800/20 text-neutral-200 border border-slate-600/30"
                }`}
                data-testid="response-text"
                aria-live="polite"
              >
                {response || "Generating response..."}
              </p>
            )}
          </div>
        )}
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt for the AI..."
        className={`w-full h-24 p-3 rounded-lg mb-4 resize-none ${
          theme === "light" ? "bg-gray-50/20 text-neutral-800 border border-gray-200" : "bg-slate-800/20 text-neutral-200 border border-slate-600"
        } focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
        aria-label="Enter prompt for AI"
      />
      <div className="flex justify-end gap-2 mb-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-600"
          }`}
          aria-label="Minimize AI modal"
        >
          Minimize
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSubmit(prompt, audioBlob);
          }}
          disabled={!prompt.trim()}
          className={`px-4 py-2 rounded-lg font-medium ${
            !prompt.trim()
              ? "opacity-50 cursor-not-allowed"
              : theme === "light"
              ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
              : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          }`}
          aria-label="Send prompt to AI"
        >
          <Send size={20} className="inline mr-2" />
          Send to AI
        </button>
      </div>
      <div className="flex justify-between items-center flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isMicEnabled) {
              enableMic();
              toast.success("Microphone enabled", {
                duration: 3000,
                style: {
                  background: theme === "light" ? "#fff" : "#1e293b",
                  color: theme === "light" ? "#1f2937" : "#f4f4f6",
                  border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
              });
            } else {
              toggleRecording();
              toast.success(isRecording ? "Recording stopped" : "Recording started", {
                duration: 3000,
                style: {
                  background: theme === "light" ? "#fff" : "#1e293b",
                  color: theme === "light" ? "#1f2937" : "#f4f4f6",
                  border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
              });
            }
          }}
          disabled={!peerStream || (!isMicEnabled && !isRecording)}
          className={`p-2 rounded-full ${
            !peerStream || (!isMicEnabled && !isRecording)
              ? "opacity-50 cursor-not-allowed"
              : isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : theme === "light"
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
          title={isRecording ? "Stop recording" : "Record audio"}
          aria-label={isRecording ? "Stop recording audio" : "Start recording audio"}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
          {isRecording ? "Recording audio..." : "Record participant audio"}
        </p>
      </div>
    </motion.div>
  );
}

export default function AICallModal({ isOpen, onClose, onSubmit, peerStream }: AICallModalProps) {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [isResponseStreaming, setIsResponseStreaming] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  useEffect(() => {
    if (isRecording && peerStream) {
      const audioTracks = peerStream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.error("No audio tracks in peerStream");
        toast.error("No audio detected in peer stream", {
          duration: 3000,
          style: {
            background: theme === "light" ? "#fff" : "#1e293b",
            color: theme === "light" ? "#1f2937" : "#f4f4f6",
            border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
          },
        });
        setIsRecording(false);
        return;
      }

      try {
        audioContextRef.current = new AudioContext();
        sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(peerStream);
        const mediaRecorder = new MediaRecorder(peerStream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            // Keep only the last 10 seconds of audio (assuming 1MB/s for estimation)
            const maxDurationMs = 10000; // 10 seconds
            const maxSize = 10 * 1024 * 1024; // 10MB max (adjust based on codec)
            while (audioChunksRef.current.length > 1) {
              const totalDuration = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size / 1024 / 1024) * 1000, 0);
              if (totalDuration > maxDurationMs) {
                audioChunksRef.current.shift(); // Remove oldest chunk
              } else {
                break;
              }
            }
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          console.log("Audio recording stopped, blob created:", blob);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // Collect chunks every 1 second for sliding window
        console.log("Started recording audio from peerStream");
      } catch (err) {
        console.error("Failed to start audio recording:", err);
         toast.error("Failed to start recording", {
          duration: 3000,
          style: {
            background: theme === "light" ? "#fff" : "#1e293b",
            color: theme === "light" ? "#1f2937" : "#f4f4f6",
            border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
          },
        });
        setIsRecording(false);
      }
    } else if (!isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording, peerStream, theme]);

  const enableMic = () => {
    setIsMicEnabled(true);
  };

  const toggleRecording = () => {
    if (!peerStream) {
      console.error("No peer stream available for recording");
      toast.error("No audio stream available for recording", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
      return;
    }
    setIsRecording((prev) => !prev);
  };

  const handleSubmit = async (prompt: string, audioBlob?: Blob | null) => {
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
      return;
    }
    const toastId = toast.loading("Generating response...", {
      style: {
        background: theme === "light" ? "#fff" : "#1e293b",
        color: theme === "light" ? "#1f2937" : "#f4f4f6",
        border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
      },
    });
    setIsResponseStreaming(true);
    setIsExpanded(true);
    try {
      const res = await onSubmit(prompt, audioBlob || undefined);
      toast.dismiss(toastId);
      if (res) {
        setResponse("");
        simulateStreaming(
          res,
          (chunk) => {
            setResponse((prev) => (prev || "") + chunk);
          },
          5,
          200
        ).then(() => {
          setIsResponseStreaming(false);
          toast.success("Response generated successfully", {
            duration: 3000,
            style: {
              background: theme === "light" ? "#fff" : "#1e293b",
              color: theme === "light" ? "#1f2937" : "#f4f4f6",
              border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
          });
        });
      } else {
        setIsResponseStreaming(false);
        setResponse(null);
        toast.error("No response received from AI", {
          duration: 3000,
          style: {
            background: theme === "light" ? "#fff" : "#1e293b",
            color: theme === "light" ? "#1f2937" : "#f4f4f6",
            border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
          },
        });
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast.dismiss(toastId);
      setIsResponseStreaming(false);
      setResponse(null);
      toast.error("Failed to generate response", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
    }
    setPrompt("");
    setAudioBlob(null);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { delta } = event;
    const width = isExpanded ? 448 : 320;
    const height = isExpanded ? 300 : 60;

    setPosition((prev) => ({
      x: Math.max(0, Math.min(prev.x + delta.x, window.innerWidth - width)),
      y: Math.max(0, Math.min(prev.y + delta.y, window.innerHeight - height)),
    }));

    setActiveId(null);
  };

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const width = isExpanded ? 448 : 320;
        const height = isExpanded ? 300 : 60;
        return {
          x: Math.max(0, Math.min(prev.x, window.innerWidth - width)),
          y: Math.max(0, Math.min(prev.y, window.innerHeight - height)),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  if (!isOpen) return null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AnimatePresence>
        {!isExpanded ? (
          <MiniAICallModal
            theme={theme}
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            onExpand={() => setIsExpanded(true)}
            position={position}
            isDragging={activeId === "mini-ai-call-modal"}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            peerStream={peerStream}
            isMicEnabled={isMicEnabled}
            enableMic={enableMic}
          />
        ) : (
          <ExpandedAICallModal
            theme={theme}
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            onMinimize={() => setIsExpanded(false)}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            peerStream={peerStream}
            audioBlob={audioBlob}
            position={position}
            isDragging={activeId === "expanded-ai-call-modal"}
            response={response}
            isResponseStreaming={isResponseStreaming}
            isMicEnabled={isMicEnabled}
            enableMic={enableMic}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}