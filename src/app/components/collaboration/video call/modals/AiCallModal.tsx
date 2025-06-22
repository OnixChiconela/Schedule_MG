"use client";

import { useTheme } from "@/app/themeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { DndContext, useDraggable, useSensors, useSensor, PointerSensor, DragOverlay } from "@dnd-kit/core";

interface AICallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, audioBlob?: Blob) => void;
  peerStream?: MediaStream | null;
}

interface MiniAICallModalProps {
  theme: string;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (prompt: string) => void;
  onExpand: () => void;
  position: { x: number; y: number };
  isDragging?: boolean;
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
}

function MiniAICallModal({ theme, prompt, setPrompt, onSubmit, onExpand, position, isDragging }: MiniAICallModalProps) {
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
    opacity: isDragging ? 1 : 1, // Ocultar elemento original durante o drag
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
      className={`rounded-xl p-4 w-80 shadow-lg flex items-center gap-2 ${
        theme === "light" ? "bg-white border border-gray-200" : "bg-gray-800 border border-gray-700"
      } hover:shadow-xl transition-shadow duration-200 select-none`}
    >
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask AI..."
        className={`flex-1 p-2 rounded-lg text-sm ${
          theme === "light" ? "bg-gray-100 text-gray-900" : "bg-gray-700 text-white"
        } focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          prompt.trim() && onSubmit(prompt);
        }}
        disabled={!prompt.trim()}
        className={`p-2 rounded-full ${
          prompt.trim()
            ? theme === "light"
              ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
              : "bg-fuchsia-700 hover:bg-fuchsia-800 text-white"
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
        className={`p-2 rounded-full ${
          theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-600 hover:bg-gray-500"
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
    opacity: isDragging ? 1 : 1, // Ocultar elemento original durante o drag
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-xl p-6 w-full max-w-lg shadow-xl ${
        theme === "light" ? "bg-white border border-gray-200" : "bg-gray-800 border border-gray-700"
      } hover:shadow-xl transition-shadow duration-200 select-none`}
    >
      <div
        className="flex justify-between items-center mb-3 cursor-grab"
        {...attributes}
        {...listeners}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <h2 className={`text-lg font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
          AI Interaction
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"}`}
          title="Minimize"
        >
          <X size={20} />
        </button>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt for the AI..."
        className={`w-full h-24 p-2 rounded-lg border mb-4 ${
          theme === "light" ? "border-gray-300 bg-white text-gray-900" : "border-gray-600 bg-gray-700 text-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRecording();
          }}
          disabled={!peerStream}
          className={`p-2 rounded-full ${
            !peerStream
              ? "opacity-50 cursor-not-allowed"
              : theme === "light"
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-gray-700 hover:bg-gray-600"
          } ${isRecording ? "animate-pulse" : ""}`}
          title={isRecording ? "Stop recording" : "Record audio"}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
          {isRecording ? "Recording audio..." : "Record participant audio"}
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`px-4 py-2 rounded-lg ${
            theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Minimize
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSubmit(prompt, audioBlob);
          }}
          disabled={!prompt.trim()}
          className={`px-4 py-2 rounded-lg ${
            !prompt.trim()
              ? "opacity-50 cursor-not-allowed"
              : theme === "light"
              ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
              : "bg-fuchsia-700 hover:bg-fuchsia-800 text-white"
          }`}
        >
          <Send size={20} className="inline mr-2" />
          Send to AI
        </button>
      </div>
    </motion.div>
  );
}

export default function AICallModal({ isOpen, onClose, onSubmit, peerStream }: AICallModalProps) {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
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
      try {
        audioContextRef.current = new AudioContext();
        sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(peerStream);
        const mediaRecorder = new MediaRecorder(peerStream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          setAudioBlob(blob);
          console.log("Audio recording stopped, blob created:", blob);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        console.log("Started recording audio from peerStream");
      } catch (err) {
        console.error("Failed to start audio recording:", err);
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
  }, [isRecording, peerStream]);

  const toggleRecording = () => {
    if (!peerStream) {
      console.error("No peer stream available for recording");
      return;
    }
    setIsRecording((prev) => !prev);
  };

  const handleSubmit = (prompt: string, audioBlob?: Blob | null) => {
    if (!prompt.trim()) {
      console.error("Prompt is empty");
      return;
    }
    onSubmit(prompt, audioBlob || undefined);
    setPrompt("");
    setAudioBlob(null);
    setIsExpanded(false);
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

  // Ajustar posição ao redimensionar a janela
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
          />
        )}
      </AnimatePresence>
      {/* <DragOverlay style={{ zIndex: 1003 }}>
        {activeId === "mini-ai-call-modal" && (
          <MiniAICallModal
            theme={theme}
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            onExpand={() => setIsExpanded(true)}
            position={position}
            isDragging={true}
          />
        )}
        {activeId === "expanded-ai-call-modal" && (
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
            isDragging={true}
          />
        )}
      </DragOverlay> */}
    </DndContext>
  );
}