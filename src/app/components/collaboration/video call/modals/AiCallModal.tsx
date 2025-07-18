"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/themeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, X, Sparkles, Download, Brain } from "lucide-react";
import { DndContext, useDraggable, useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { simulateStreaming, simulateStreamingBChunk } from "@/app/api/actions/AI/hugging_face/generateText";
import toast from "react-hot-toast";
import { transcribeAndGenerate } from "@/app/api/actions/collaboration/video-call/transcribeAndGenerate";
import { useUser } from "@/app/context/UserContext";
import { checkAIUsage } from "@/app/api/actions/AI/checkAIUsage";
import { useRouter } from "next/navigation";
import { transcribeAudio } from "@/app/api/actions/collaboration/video-call/transcribeAudio";
import { FaExchangeAlt } from "react-icons/fa";
import { useNotifications } from "@/app/context/NotificationContext";
import ExpandedAICallModal from "./aiModalComponents/ExpandedAICallModal";

export interface AICallContent {
  id: string;
  callId: string;
  userId: string;
  prompt: string;
  response?: string;
  transcription?: string
  isShared: boolean;
  createdAt: string;
}

interface AICallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    prompt: string,
    audioBlob?: Blob | null,
    transcription?: string,
    history?: AICallContent[]
  ) => Promise<string | { prompt: string; transcription?: string; response?: string } | null>;
  peerStream?: MediaStream | null;
  localStream?: MediaStream | null;
  callId: string;
}

interface MiniAICallModalProps {
  theme: string;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (prompt: string, audioBlob?: Blob | null, transcription?: string) => void;
  onExpand: () => void;
  position: { x: number; y: number };
  isDragging?: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
  peerStream?: MediaStream | null;
  localStream?: MediaStream | null;
  audioSource: "local" | "peer" | "mixed";
  setAudioSource: (source: "local" | "peer" | "mixed") => void;
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
  localStream,
  audioSource,
  setAudioSource,
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
      className={`rounded-xl p-4  shadow-lg flex items-center gap-2 ${theme === "light" ? "bg-white border border-gray-200" : "bg-slate-900 border border-slate-600"
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
      <select
        value={audioSource}
        onChange={(e) => setAudioSource(e.target.value as "local" | "peer" | "mixed")}
        className={`p-2 rounded-lg text-sm ${theme === "light" ? "bg-gray-50/20 text-neutral-800" : "bg-slate-800/20 text-neutral-200"
          }`}
        disabled={!localStream && !peerStream}
      >
        <option value="local" disabled={!localStream}>Your audio</option>
        <option value="peer" disabled={!peerStream}>Participant audio</option>
        <option value="mixed" disabled={!localStream || !peerStream}>All audio</option>
      </select>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleRecording();
          toast.success(isRecording ? "Recording stopped" : "Recording started", {
            duration: 3000,
            style: {
              background: theme === "light" ? "#fff" : "#1e293b",
              color: theme === "light" ? "#1f2937" : "#f4f4f6",
              border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
          });
        }}
        disabled={!localStream && !peerStream}
        className={`p-2 rounded-full ${!localStream && !peerStream
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

function getSupportedMimeType(): string | null {
  const mimeTypes = [
    // "audio/webm;codecs=opus",
    // "audio/webm;codecs=pcm",
    // "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/wav",
    "audio/mpeg"
  ];
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      console.log(`[AICall] Supported MIME type: ${mimeType}`);
      return mimeType;
    }
  }
  console.error("[AICall] No supported MIME types for MediaRecorder");
  return null;
}

function validateStream(stream: MediaStream, source: string): boolean {
  const audioTracks = stream.getAudioTracks();
  console.log(`[AICall] Validating ${source} stream:`, {
    trackCount: audioTracks.length,
    tracks: audioTracks.map((t) => ({ enabled: t.enabled, readyState: t.readyState, muted: t.muted })),
  });
  if (!audioTracks.length) {
    console.error(`[AICall] No audio tracks in ${source} stream`);
    return false;
  }
  const hasActiveTrack = audioTracks.some((track) => track.enabled && track.readyState === 'live' && !track.muted);
  if (!hasActiveTrack) {
    console.error(`[AICall] No active audio tracks in ${source} stream`);
    return false;
  }
  return true;
}

function cloneStream(stream: MediaStream): MediaStream {
  const audioTracks = stream.getAudioTracks().filter((track) => track.enabled && track.readyState === 'live');
  console.log(`[AICall] Cloning stream: tracks=${audioTracks.length}`);
  return new MediaStream(audioTracks);
}

export default function AICallModal({ isOpen, onClose, onSubmit, peerStream, localStream, callId }: AICallModalProps) {
  const { theme } = useTheme();
  const { currentUser } = useUser()
  const { videoSocket } = useNotifications()
  const [prompt, setPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const [isResponseStreaming, setIsResponseStreaming] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<"local" | "peer" | "mixed">("local");
  const [isShared, setIsShared] = useState(false)
  const [aiContentHistory, setAIContentHistory] = useState<AICallContent[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimestampsRef = useRef<{ blob: Blob; timestamp: number }[]>([])
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const dataReceivedRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isGenerating, setIsGenerating] = useState(false);

  const bufferIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const suggestionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // useEffect(() => {
  //   if (!videoSocket || !currentUser?.id || !callId || !isOpen) {
  //     console.log(`[AICallModal] Skipping socket setup:  videoSocket=${!!videoSocket}, userId=${currentUser?.id}`)
  //     return
  //   }

  //   console.log(`[AICallModal] Setting up videoScoket listiners for callId=${callId}, userId=${currentUser.id}`)
  //   videoSocket.emit('join-room', { callId })

  //   const handleAIContentUpdate = async (content: AICallContent) => {
  //     console.log(`[AICallModal] Received ai-content-update:`, content)
  //     if (content && typeof content === 'object' && 'isShared' in content) {
  //       const tempId = `temp-${Date.now()}`
  //       setAIContentHistory((prev) => [
  //         ...prev,
  //         { ...content, id: tempId, response: content.response ? '' : content.response }
  //       ])

  //       if (content.isShared && content.response && typeof content.response === 'string') {
  //         setIsGenerating(true)
  //         // setResponse('');
  //         setIsResponseStreaming(true);
  //         try {
  //           await simulateStreamingBChunk(
  //             content.response,
  //             (chunk) =>
  //               setAIContentHistory((prev) =>
  //                 prev.map((item) =>
  //                   item.id === tempId ? { ...item, response: item.response ? item.response + ' ' + chunk : chunk } : item
  //                 )
  //               ),
  //             5,
  //             200,
  //             abortControllerRef.current?.signal
  //           );
  //           console.log(`[AICallModal] Shared AI response streamed: ${content.response}`);
  //           toast.success('New shared AI content received', {
  //             duration: 3000,
  //             style: {
  //               background: theme === 'light' ? '#fff' : '#1e293b',
  //               color: theme === 'light' ? '#1f2937' : '#f4f4f6',
  //               border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
  //             },
  //           });
  //           setAIContentHistory((prev) => prev.map((item) => (item.id === tempId ? { ...item, id: content.id } : item)))
  //         } catch (error: any) {
  //           console.error(`[AICallModal] Streaming failed: ${error.message}`);
  //           toast.error(`Failed to stream AI response: ${error.message}`, {
  //             duration: 3000,
  //             style: {
  //               background: theme === 'light' ? '#fff' : '#1e293b',
  //               color: theme === 'light' ? '#1f2937' : '#f4f4f6',
  //               border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
  //             },
  //           });
  //           //Remove em caso de error
  //           setAIContentHistory((prev) => prev.filter((item) => item.id !== tempId))
  //         }
  //         setIsResponseStreaming(false);
  //         setIsGenerating(false)
  //         setTranscription(content.transcription || null);
  //       } else {
  //         setTranscription(content.transcription || null);
  //         console.warn(`[AICallModal] Streaming skipped for ai-content-update: isShared=${content.isShared}, response=${content.response}`);
  //       }
  //     } else {
  //       console.warn(`[AICallModal] Invalid ai-content-update received:`, content);
  //     }
  //   }

  //   const handleAISharingUpdated = ({ callId: updatedCallId, isShared }: { callId: string; isShared: boolean }) => {
  //     if (updatedCallId === callId) {
  //       console.log(`[AICallModal] Received ai-sharing-updated: isShared=${isShared}`);
  //       setIsShared(isShared);
  //       toast.success(isShared ? 'AI sharing enabled' : 'AI sharing disabled', {
  //         duration: 3000,
  //         style: {
  //           background: theme === 'light' ? '#fff' : '#1e293b',
  //           color: theme === 'light' ? '#1f2937' : '#f4f4f6',
  //           border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
  //         },
  //       });
  //     }
  //   };

  //   videoSocket.on('ai-content-update', handleAIContentUpdate)
  //   videoSocket.on('ai-sharing-updated', handleAISharingUpdated)
  //   videoSocket.on('connect_error', (err) => {
  //     console.error(`[AICall] videoSocket connect_error:`, err);
  //     toast.error(`Video call connection error: ${err.message}`, {
  //       duration: 3000,
  //       style: {
  //         background: theme === 'light' ? '#fff' : '#1e293b',
  //         color: theme === 'light' ? '#1f2937' : '#f4f4f6',
  //         border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
  //       },
  //     });
  //   });

  //   return () => {
  //     videoSocket.off('ai-content-update', handleAIContentUpdate)
  //     videoSocket.off('ai-sharing-updated', handleAISharingUpdated)
  //     videoSocket.off('connect_error')
  //   }
  // }, [videoSocket, currentUser?.id, callId, isOpen, theme, setIsShared, setTranscription, setIsGenerating, setAIContentHistory])

  useEffect(() => {
    if (!videoSocket || !currentUser?.id || !callId || !isOpen) {
      console.log(`[AICallModal] Skipping socket setup: videoSocket=${!!videoSocket}, userId=${currentUser?.id}, callId=${callId}, isOpen=${isOpen}`);
      return;
    }

    console.log(`[AICallModal] Setting up videoSocket listeners for callId=${callId}, userId=${currentUser.id}`);
    videoSocket.emit('join-room', { callId });

    const handleAIContentUpdate = async (content: AICallContent) => {
      console.log(`[AICallModal] Received ai-content-update:`, content);
      if (!content || typeof content !== 'object' || !('isShared' in content)) {
        console.warn(`[AICallModal] Invalid ai-content-update received:`, content);
        return;
      }

      if (content.isShared && content.response && typeof content.response === 'string') {
        console.log(`[AICallModal] Processing shared response with streaming: response=${content.response.substring(0, 50)}...`);
        const tempId = `temp-${Date.now()}`;
        setAIContentHistory((prev) => [
          ...prev,
          { ...content, id: tempId, response: '' }, // Entrada temporária para streaming
        ]);
        setIsResponseStreaming(true);
        setIsGenerating(true);
        try {
          await simulateStreamingBChunk(
            content.response,
            (chunk) => {
              console.log(`[AICallModal] Streaming chunk: ${chunk}`);
              setAIContentHistory((prev) =>
                prev.map((item) =>
                  item.id === tempId ? { ...item, response: item.response ? item.response + ' ' + chunk : chunk } : item
                )
              );
            },
            5,
            200,
            abortControllerRef.current?.signal
          );
          console.log(`[AICallModal] Shared AI response streamed successfully: id=${content.id}`);
          // toast.success('New shared AI content received', {
          //   duration: 3000,
          //   style: {
          //     background: theme === 'light' ? '#fff' : '#1e293b',
          //     color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          //     border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          //   },
          // });
          // Atualizar o ID real após o streaming
          setAIContentHistory((prev) =>
            prev.map((item) => (item.id === tempId ? { ...item, id: content.id } : item))
          );
        } catch (error: any) {
          console.error(`[AICallModal] Streaming failed: ${error.message}`);
          toast.error(`Failed to stream AI response: ${error.message}`, {
            duration: 3000,
            style: {
              background: theme === 'light' ? '#fff' : '#1e293b',
              color: theme === 'light' ? '#1f2937' : '#f4f4f6',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
            },
          });
          setAIContentHistory((prev) => prev.filter((item) => item.id !== tempId));
        } finally {
          // setIsResponseStreaming(false);
          setIsGenerating(false);
          // setTranscription(content.transcription || null);
        }
        setIsResponseStreaming(false);
        setIsGenerating(false);
        setTranscription(content.transcription || null);
      } else {
        console.log(`[AICallModal] Adding non-shared response to history: response=${content.response?.substring(0, 50) || 'none'}...`);
        setAIContentHistory((prev) => [...prev, { ...content }]);
        setTranscription(content.transcription || null);
        console.log(`[AICallModal] Non-streamed content added:`, content);
      }
    };

    const handleAISharingUpdated = ({ callId: updatedCallId, isShared }: { callId: string; isShared: boolean }) => {
      if (updatedCallId === callId) {
        console.log(`[AICallModal] Received ai-sharing-updated: isShared=${isShared}`);
        setIsShared(isShared);
        // toast.success(isShared ? 'AI sharing enabled' : 'AI sharing disabled', {
        //   duration: 3000,
        //   style: {
        //     background: theme === 'light' ? '#fff' : '#1e293b',
        //     color: theme === 'light' ? '#1f2937' : '#f4f4f6',
        //     border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        //   },
        // });
      }
    };

    videoSocket.on('ai-content-update', handleAIContentUpdate);
    videoSocket.on('ai-sharing-updated', handleAISharingUpdated);
    videoSocket.on('connect_error', (err) => {
      console.error(`[AICall] videoSocket connect_error:`, err);
      toast.error(`Video call connection error: ${err.message}`, {
        duration: 3000,
        style: {
          background: theme === 'light' ? '#fff' : '#1e293b',
          color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        },
      });
    });

    return () => {
      videoSocket.off('ai-content-update', handleAIContentUpdate);
      videoSocket.off('ai-sharing-updated', handleAISharingUpdated);
      videoSocket.off('connect_error');
    };
  }, [videoSocket, currentUser?.id, callId, isOpen, theme, setIsShared, setTranscription, setIsGenerating, setIsResponseStreaming, setAIContentHistory]);

  const toggleSharing = () => {
    if (!videoSocket || !currentUser?.id || !callId) {
      console.error(`[AICall] Cannot toggle sharing: videoSocket=${!!videoSocket}, userId=${currentUser?.id}, callId=${callId}`);
      toast.error('Cannot toggle sharing: connection issue', {
        duration: 3000,
        style: {
          background: theme === 'light' ? '#fff' : '#1e293b',
          color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        },
      });
      return;
    }

    const newIsShared = !isShared
    console.log(`[AICall] Emitting toggle-ai-sharing: callId=${callId}, isShared=${newIsShared}`);
    videoSocket.emit('toggle-ai-sharing', { callId, isShared: newIsShared },
      (response: { success: boolean; isShared: boolean; error?: string }) => {
        if (response.error) {
          console.error(`[AICall] toggle-ai-sharing failed:`, response.error);
          toast.error(`Failed to toggle sharing: ${response.error}`, {
            duration: 3000,
            style: {
              background: theme === 'light' ? '#fff' : '#1e293b',
              color: theme === 'light' ? '#1f2937' : '#f4f4f6',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
            },
          });
        } else {
          setIsShared(newIsShared)
          console.log(`[AICall] Sharing toggled: isShared=${newIsShared}`)
        }
      }

    )
  }

  const downloadAudio = () => {
    if (!audioBlob || audioBlob.size === 0) {
      console.error("[AICall] No valid audio blob for download");
      toast.error("No audio available to download", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
      return;
    }
    const extension = audioBlob.type.split("/")[1].split(";")[0];
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("[AICall] Audio blob downloaded:", { size: audioBlob.size, type: audioBlob.type });
    toast.success("Audio downloaded", {
      duration: 3000,
      style: {
        background: theme === "light" ? "#fff" : "#1e293b",
        color: theme === "light" ? "#1f2937" : "#f4f4f6",
        border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
      },
    });
  };

  //Maintain a 30 sec rolling buffer
  const maintainAudioBuffer = () => {
    if (!isRecording) return; // Skip if not recording
    const now = Date.now();
    const thirtySecondsAgo = now - 30 * 1000;
    audioTimestampsRef.current = audioTimestampsRef.current.filter(({ timestamp }) => timestamp >= thirtySecondsAgo);
    console.log(`[AICall] Audio buffer updated: ${audioTimestampsRef.current.length} chunks`);
  };

  //Generate suggestions from peer audio
  // const generateSuggestions = async () => {
  //   if (!isRecording || !audioTimestampsRef.current.length || !currentUser?.id) {
  //     console.error("[AICall] Cannot generate suggestions: recording off, no audio, or no user ID");
  //     toast.error("Cannot generate suggestions: recording off or no audio", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     return;
  //   }

  //   toast.error("Audio suggestions require PRO plan. Enter a text prompt instead.", {
  //     duration: 3000,
  //     style: {
  //       background: theme === "light" ? "#fff" : "#1e293b",
  //       color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //       border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //     },
  //   });
  // const canUse = await checkAIUsage(currentUser.id);
  // if (!canUse) {
  //   setIsRecording(false);
  //   toast.error("Daily AI usage limit reached", {
  //     duration: 3000,
  //     style: {
  //       background: theme === "light" ? "#fff" : "#1e293b",
  //       color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //       border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //     },
  //   });
  //   return;
  // }

  // try {
  //   const blobs = audioTimestampsRef.current.map(({ blob }) => blob);
  //   const blob = new Blob(blobs, { type: mediaRecorderRef.current?.mimeType });
  //   if (blob.size === 0) {
  //     console.error("[AICall] Empty audio blob for suggestion");
  //     toast.error("No audio recorded for suggestions", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     return;
  //   }
  //   console.log(`[AICall] Generating suggestion from audio: size=${blob.size}, type=${blob.type}`);
  //   const transcriptionText = await transcribeAndGenerate("", "", "transcribe", blob, currentUser.id);
  //   if (!transcriptionText) {
  //     console.error("[AICall] No transcription for suggestion");
  //     return;
  //   }
  //   // Filter generic transcriptions
  //   const genericPrompts = ["bom dia", "good morning", "hello", "hi"];
  //   if (genericPrompts.some((gp) => transcriptionText.toLowerCase().trim().startsWith(gp))) {
  //     console.warn("[AICall] Generic transcription ignored:", transcriptionText);
  //     return;
  //   }
  //   const suggestionText = await transcribeAndGenerate(transcriptionText, transcriptionText, "suggest", undefined, currentUser.id);
  //   if (suggestionText) {
  //     setSuggestion("");
  //     await simulateStreamingBChunk(suggestionText, (chunk) => setSuggestion((prev) => (prev ? prev + chunk : chunk)), 5, 200, abortControllerRef.current?.signal);
  //   }
  // } catch (error: any) {
  //   console.error("[AICall] Failed to generate suggestion:", error);
  //   if (error.message.includes("Daily AI usage limit reached")) {
  //     setIsRecording(false);
  //     toast.error("Daily AI usage limit reached", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //   }
  // }
  // };


  // useEffect(() => {
  //   console.log(`[AICall] Rendering: isOpen=${isOpen}, localStream=${!!localStream}, 
  //   peerStream=${!!peerStream}, isRecording=${isRecording}, audioSource=${audioSource}userId=${currentUser?.id}`);

  //   if (!currentUser?.id) {
  //     toast.error("Oops seems like you're not authenticated", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     })
  //     setIsRecording(false)
  //     router.push("/my-space/auth/login")
  //     return
  //   }

  //   if (isRecording) {
  //     const startRecording = async () => {
  //       const canUse = await checkAIUsage(currentUser.id)
  //       if (!canUse) {
  //         setIsRecording(false)
  //         toast.error("Daily AI usage limit reached", {
  //           duration: 3000,
  //           style: {
  //             background: theme === "light" ? "#fff" : "#1e293b",
  //             color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //             border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //           },
  //         });
  //         return;
  //       }

  //       let audioSourceStream: MediaStream | null = null;
  //       if (audioSource === "peer" && peerStream) {
  //         if (!validateStream(peerStream, "peer")) {
  //           toast.error("Participant's audio is muted or unavailable", {
  //             duration: 3000,
  //             style: {
  //               background: theme === "light" ? "#fff" : "#1e293b",
  //               color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //               border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //             },
  //           });
  //           setIsRecording(false);
  //           return;
  //         }
  //         audioSourceStream = cloneStream(peerStream);
  //       } else if (audioSource === "mixed" && localStream && peerStream) {
  //         audioContextRef.current = new AudioContext();
  //         destinationRef.current = audioContextRef.current.createMediaStreamDestination();
  //         let hasValidStream = false;
  //         if (peerStream && validateStream(peerStream, "peer")) {
  //           const peerSource = audioContextRef.current.createMediaStreamSource(peerStream);
  //           peerSource.connect(destinationRef.current);
  //           hasValidStream = true;
  //         }
  //         if (localStream && validateStream(localStream, "local")) {
  //           const localSource = audioContextRef.current.createMediaStreamSource(localStream);
  //           localSource.connect(destinationRef.current);
  //           hasValidStream = true;
  //         }
  //         audioSourceStream = destinationRef.current.stream;
  //         if (!hasValidStream || !validateStream(audioSourceStream, "mixed")) {
  //           toast.error("No active audio in mixed stream", {
  //             duration: 3000,
  //             style: {
  //               background: theme === "light" ? "#fff" : "#1e293b",
  //               color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //               border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //             },
  //           });
  //           setIsRecording(false);
  //           return;
  //         }
  //       } else if (audioSource === "local" && localStream) {
  //         if (!validateStream(localStream, "local")) {
  //           toast.error("Your microphone is muted or unavailable", {
  //             duration: 3000,
  //             style: {
  //               background: theme === "light" ? "#fff" : "#1e293b",
  //               color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //               border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //             },
  //           });
  //           setIsRecording(false);
  //           return;
  //         }
  //         audioSourceStream = cloneStream(localStream);
  //       }

  //       if (!audioSourceStream) {
  //         console.error("[AICall] No audio stream available");
  //         toast.error("No audio stream available for recording", {
  //           duration: 3000,
  //           style: {
  //             background: theme === "light" ? "#fff" : "#1e293b",
  //             color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //             border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //           },
  //         });
  //         setIsRecording(false);
  //         return;
  //       }

  //       const mimeType = getSupportedMimeType();
  //       if (!mimeType) {
  //         console.error("[AICall] No supported MIME types for MediaRecorder");
  //         toast.error("Your browser does not support audio recording", {
  //           duration: 3000,
  //           style: {
  //             background: theme === "light" ? "#fff" : "#1e293b",
  //             color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //             border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //           },
  //         });
  //         setIsRecording(false);
  //         return;
  //       }

  //       try {
  //         const mediaRecorder = new MediaRecorder(audioSourceStream, { mimeType });
  //         audioChunksRef.current = [];
  //         audioTimestampsRef.current = []
  //         dataReceivedRef.current = false;

  //         mediaRecorder.ondataavailable = (event) => {
  //           if (event.data.size > 0) {
  //             // audioChunksRef.current.push(event.data);
  //             audioTimestampsRef.current.push({ blob: event.data, timestamp: Date.now() })
  //             dataReceivedRef.current = true;
  //             console.log(`[AICall] Audio chunk received: size=${event.data.size}, timestamp=${Date.now()}`);
  //             maintainAudioBuffer()
  //           }
  //         };

  //         mediaRecorder.onstop = async () => {
  //           const blobs = audioTimestampsRef.current.map(({ blob }) => blob);
  //           const blob = new Blob(blobs, { type: mimeType });
  //           setAudioBlob(blob);
  //           console.log(`[AICall] Audio recording stopped, blob created: size=${blob.size}, type=${blob.type}`);
  //           if (blob.size > 0) {
  //             const transcriptionText = await transcribeAudio(blob, currentUser.id);
  //             setTranscription(transcriptionText || null);
  //           } else {
  //             console.error("[AICall] Empty audio blob, skipping transcription");
  //             toast.error("No audio recorded", {
  //               duration: 3000,
  //               style: {
  //                 background: theme === "light" ? "#fff" : "#1e293b",
  //                 color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //                 border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //               },
  //             });
  //           }
  //         };

  //         mediaRecorderRef.current = mediaRecorder;
  //         mediaRecorder.start(1000);
  //         console.log(`[AICall] Started recording audio with MIME type: ${mimeType}`);

  //         //periodically clean up buffer to keep last 30 secs
  //         const bufferInterval = setInterval(maintainAudioBuffer, 100)
  //         const suggestionInterval = setInterval(generateSuggestions, 10000)

  //         // Timeout to check if data is being received
  //         const timeout = setTimeout(() => {
  //           if (!dataReceivedRef.current && mediaRecorder.state === "recording") {
  //             console.error("[AICall] No audio data received after 3 seconds");
  //             mediaRecorder.stop();
  //             toast.error("No audio detected during recording", {
  //               duration: 3000,
  //               style: {
  //                 background: theme === "light" ? "#fff" : "#1e293b",
  //                 color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //                 border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //               },
  //             });
  //             setIsRecording(false);
  //           }
  //         }, 3000);

  //         return () => {
  //           clearInterval(bufferInterval)
  //           clearInterval(suggestionInterval)
  //           clearTimeout(timeout)
  //         }
  //       } catch (err) {
  //         console.error("[AICall] Failed to start audio recording:", err);
  //         toast.error(
  //           err instanceof DOMException && err.name === "NotSupportedError"
  //             ? "Your browser does not support this audio format"
  //             : "Failed to start recording",
  //           {
  //             duration: 3000,
  //             style: {
  //               background: theme === "light" ? "#fff" : "#1e293b",
  //               color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //               border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //             },
  //           }
  //         );
  //         setIsRecording(false);
  //       }
  //     }

  //     startRecording()
  //   } else if (!isRecording && mediaRecorderRef.current) {
  //     mediaRecorderRef.current.stop();
  //     if (sourceNodeRef.current) {
  //       sourceNodeRef.current.disconnect();
  //       sourceNodeRef.current = null;
  //     }
  //     if (destinationRef.current) {
  //       destinationRef.current.disconnect();
  //       destinationRef.current = null;
  //     }
  //     if (audioContextRef.current) {
  //       audioContextRef.current.close();
  //       audioContextRef.current = null;
  //     }
  //   }
  //   return () => {
  //     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
  //       mediaRecorderRef.current.stop();
  //     }
  //   };
  // }, [isRecording, localStream, peerStream, audioSource, theme]);

  // const toggleRecording = async () => {
  //   if (!localStream && !peerStream) {
  //     console.error("[AICall] No stream available for recording");
  //     toast.error("No audio stream available for recording", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     return;
  //   }

  //   if (!currentUser?.id) {
  //     console.error("[AICall] No user ID available");
  //     toast.error("User not authenticated", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     return;
  //   }

  //   const canUse = await checkAIUsage(currentUser.id);
  //   if (!canUse) {
  //     toast.error("Daily AI usage limit reached", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     return;
  //   }

  //   try {
  //     if (audioSource === "local" || audioSource === "mixed") {
  //       await navigator.mediaDevices.getUserMedia({ audio: true });
  //     }
  //     setIsRecording((prev) => !prev);
  //     toast.success(isRecording ? "Recording stopped" : "Recording started", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //   } catch (err) {
  //     console.error("[AICall] Microphone permission denied:", err);
  //     toast.error("Microphone access denied. Please allow in browser settings.", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //   }
  // };

  const toggleRecording = async () => {
    if (!localStream && !peerStream) {
      console.error("[AICall] No stream available for recording");
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

    if (!currentUser?.id) {
      console.error("[AICall] No user ID available");
      toast.error("User not authenticated", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
      router.push("/my-space/auth/login");
      return;
    }

    const canUse = await checkAIUsage(currentUser.id);
    if (!canUse) {
      toast.error("Daily AI usage limit reached", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
      return;
    }

    if (!isRecording) {
      try {
        let stream: MediaStream;
        if (audioSource === "local" && localStream) {
          if (!validateStream(localStream, "local")) {
            throw new Error("Your microphone is muted or unavailable");
          }
          stream = cloneStream(localStream);
        } else if (audioSource === "peer" && peerStream) {
          if (!validateStream(peerStream, "peer")) {
            throw new Error("Participant's audio is muted or unavailable");
          }
          stream = cloneStream(peerStream);
        } else if (audioSource === "mixed" && localStream && peerStream) {
          audioContextRef.current = new AudioContext();
          destinationRef.current = audioContextRef.current.createMediaStreamDestination();
          let hasValidStream = false;
          if (validateStream(peerStream, "peer")) {
            const peerSource = audioContextRef.current.createMediaStreamSource(peerStream);
            peerSource.connect(destinationRef.current);
            hasValidStream = true;
          }
          if (validateStream(localStream, "local")) {
            const localSource = audioContextRef.current.createMediaStreamSource(localStream);
            localSource.connect(destinationRef.current);
            hasValidStream = true;
          }
          stream = destinationRef.current.stream;
          if (!hasValidStream || !validateStream(stream, "mixed")) {
            throw new Error("No active audio in mixed stream");
          }
        } else {
          throw new Error("No valid audio stream");
        }

        const mimeType = getSupportedMimeType();
        if (!mimeType) {
          throw new Error("No supported MIME types for MediaRecorder");
        }

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        audioTimestampsRef.current = [];
        dataReceivedRef.current = false;

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioTimestampsRef.current.push({ blob: event.data, timestamp: Date.now() });
            dataReceivedRef.current = true;
            console.log(`[AICall] Audio buffer updated: ${audioTimestampsRef.current.length} chunks, size=${event.data.size}`);
          } else {
            console.warn("[AICall] Empty audio chunk received");
          }
        };

        // mediaRecorderRef.current.onstart = () => {
        //   console.log(`[AICall] Recording started with MIME type: ${mimeType}`);
        //   bufferIntervalRef.current = setInterval(maintainAudioBuffer, 1000);
        //   suggestionIntervalRef.current = setInterval(generateSuggestions, 10000);
        // };
        mediaRecorderRef.current.onstart = () => {
          console.log(`[AICall] Recording started with MIME type: ${mimeType}`);
          setTimeout(() => maintainAudioBuffer(), 1000);
        };

        mediaRecorderRef.current.onstop = async () => {
          console.log("[AICall] Recording stopped");
          if (bufferIntervalRef.current) {
            clearInterval(bufferIntervalRef.current);
            bufferIntervalRef.current = null;
          }
          if (suggestionIntervalRef.current) {
            clearInterval(suggestionIntervalRef.current);
            suggestionIntervalRef.current = null;
          }
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
          }
          if (destinationRef.current) {
            destinationRef.current.disconnect();
            destinationRef.current = null;
          }
          if (audioContextRef.current) {
            await audioContextRef.current.close();
            audioContextRef.current = null;
          }
          const blobs = audioTimestampsRef.current.map(({ blob }) => blob);
          const blob = new Blob(blobs, { type: mimeType });
          if (blob.size > 0) {
            setAudioBlob(blob);
            console.log(`[AICall] Audio blob created: size=${blob.size}, type=${blob.type}`);
            try {
              const transcriptionText = await transcribeAudio(blob, currentUser.id);
              setTranscription(transcriptionText || null);
            } catch (error: any) {
              console.error("[AICall] Transcription failed:", error);
              toast.error(`Transcription failed: ${error.message}`, {
                duration: 3000,
                style: {
                  background: theme === "light" ? "#fff" : "#1e293b",
                  color: theme === "light" ? "#1f2937" : "#f4f4f6",
                  border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
              });
            }
          } else {
            console.error("[AICall] Empty audio blob, skipping transcription");
            setAudioBlob(null);
            toast.error("No audio recorded", {
              duration: 3000,
              style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
              },
            });
          }
          setIsRecording(false);
        };

        mediaRecorderRef.current.onerror = (error) => {
          console.error("[AICall] MediaRecorder error:", error);
          toast.error(`Recording error: ${error}`, {
            duration: 3000,
            style: {
              background: theme === "light" ? "#fff" : "#1e293b",
              color: theme === "light" ? "#1f2937" : "#f4f4f6",
              border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
          });
          setIsRecording(false);
        };

        mediaRecorderRef.current.start(1000);
        setIsRecording(true);
        toast.success("Recording started", {
          duration: 3000,
          style: {
            background: theme === "light" ? "#fff" : "#1e293b",
            color: theme === "light" ? "#1f2937" : "#f4f4f6",
            border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
          },
        });

        setTimeout(() => {
          if (!dataReceivedRef.current && mediaRecorderRef.current?.state === "recording") {
            console.error("[AICall] No audio data received after 3 seconds");
            mediaRecorderRef.current?.stop();
            toast.error("No audio detected during recording", {
              duration: 3000,
              style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
              },
            });
            setIsRecording(false);
          }
        }, 3000);
      } catch (error: any) {
        console.error("[AICall] Failed to start recording:", error);
        toast.error(`Failed to start recording: ${error.message}`, {
          duration: 3000,
          style: {
            background: theme === "light" ? "#fff" : "#1e293b",
            color: theme === "light" ? "#1f2937" : "#f4f4f6",
            border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
          },
        });
        setIsRecording(false);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        // setIsRecording(false) moved to onstop to ensure state sync
      }
    }
  };

  // const handleSubmit = async (prompt: string, audioBlob?: Blob | null, transcription?: string) => {
  //   if (!currentUser?.id) {
  //     console.error("[AICall] No user ID available");
  //     toast.error("User not authenticated", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     router.push("/my-space/auth/login");
  //     return;
  //   }

  //   const payload = {
  //     callId,
  //     userId: currentUser.id,
  //     prompt,
  //     transcription,
  //     isShared,
  //     createdAt: new Date().toISOString()
  //   }

  //   if (!prompt.trim()) {
  //     toast.error("Prompt cannot be empty", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     return;
  //   }

  //   const canUse = await checkAIUsage(currentUser.id);
  //   if (!canUse) {
  //     toast.error("Daily AI usage limit reached", {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //     return;
  //   }

  //   const toastId = toast.loading("Generating response...", {
  //     style: {
  //       background: theme === "light" ? "#fff" : "#1e293b",
  //       color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //       border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //     },
  //   });
  //   setIsResponseStreaming(true);
  //   setIsExpanded(true);
  //   try {
  //     abortControllerRef.current = new AbortController();
  //     let finalBlob = audioBlob;
  //     let finalTranscription = transcription;

  //     if (isRecording && mediaRecorderRef.current && audioTimestampsRef.current.length > 0) {
  //       mediaRecorderRef.current.stop();
  //       await new Promise((resolve) => {
  //         mediaRecorderRef.current!.onstop = resolve;
  //       });
  //       const blobs = audioTimestampsRef.current.map(({ blob }) => blob);
  //       finalBlob = new Blob(blobs, { type: mediaRecorderRef.current?.mimeType });
  //       console.log(`[AICall] Using buffered audio for prompt: size=${finalBlob.size}, type=${finalBlob.type}`);
  //       if (finalBlob.size > 0) {
  //         // finalTranscription = await transcribeAudio(finalBlob, currentUser.id);
  //         setAudioBlob(finalBlob);
  //         // setTranscription(finalTranscription || null);
  //       } else {
  //         console.error("[AICall] Buffered audio is empty");
  //         toast.error("No audio recorded for transcription", {
  //           duration: 3000,
  //           style: {
  //             background: theme === "light" ? "#fff" : "#1e293b",
  //             color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //             border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //           },
  //         });
  //       }
  //     }

  //     const res = await onSubmit(prompt, finalBlob ?? undefined, finalTranscription);
  //     toast.dismiss(toastId);
  //     if (res) {
  //       setResponse("");
  //       await simulateStreamingBChunk(res, (chunk) => setResponse((prev) => (prev ? prev + chunk : chunk)),
  //         5,
  //         200,
  //         abortControllerRef.current.signal
  //       );
  //       console.log(`[AICallModal] AI response received: ${res}`)

  //       if (isShared && videoSocket && callId) {
  //         console.log(`[AICall Emitn submit-ai-content callId=${callId}]`)
  //         videoSocket.emit(
  //           'submit-ai-content',
  //           { payload },
  //           (response: { success: boolean; contentId: string; error?: string }) => {
  //             if (response.error) {
  //               console.error(`[AICall] submit-ai-content failed:`, response.error);
  //               toast.error(`Failed to share AI content: ${response.error}`, {
  //                 duration: 3000,
  //                 style: {
  //                   background: theme === 'light' ? '#fff' : '#1e293b',
  //                   color: theme === 'light' ? '#1f2937' : '#f4f4f6',
  //                   border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
  //                 },
  //               });
  //             } else {
  //               console.log(`[AICall] AI content shared: contentId=${response.contentId}`);
  //               toast.success('AI content shared', {
  //                 duration: 3000,
  //                 style: {
  //                   background: theme === 'light' ? '#fff' : '#1e293b',
  //                   color: theme === 'light' ? '#1f2937' : '#f4f4f6',
  //                   border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
  //                 },
  //               });
  //             }
  //           }
  //         )
  //       }

  //       toast.success("Response generated successfully", {
  //         duration: 3000,
  //         style: {
  //           background: theme === "light" ? "#fff" : "#1e293b",
  //           color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //           border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //         },
  //       });
  //     } else {
  //       toast.error("No response received from AI", {
  //         duration: 3000,
  //         style: {
  //           background: theme === "light" ? "#fff" : "#1e293b",
  //           color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //           border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //         },
  //       });
  //     }
  //   } catch (error: any) {
  //     console.error("[AICall] Failed to get AI response:", error);
  //     toast.dismiss(toastId);
  //     toast.error(`Failed to generate response: ${error.message}`, {
  //       duration: 3000,
  //       style: {
  //         background: theme === "light" ? "#fff" : "#1e293b",
  //         color: theme === "light" ? "#1f2937" : "#f4f4f6",
  //         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
  //       },
  //     });
  //   } finally {
  //     setIsResponseStreaming(false);
  //     // Do not reset audioBlob or transcription here to preserve download button
  //   }
  // };

  const handleSubmit = async (prompt: string, audioBlob?: Blob | null, transcription?: string) => {
    if (!currentUser?.id || !callId) {
      console.error(`[AICall] Cannot submit: userId=${currentUser?.id}, callId=${callId}`);
      toast.error('Cannot submit: invalid user or call', {
        duration: 3000,
        style: {
          background: theme === 'light' ? '#fff' : '#1e293b',
          color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        },
      });
      return;
    }

    const toastId = toast.loading('Generating AI response...', {
      style: {
        background: theme === 'light' ? '#fff' : '#1e293b',
        color: theme === 'light' ? '#1f2937' : '#f4f4f6',
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
      },
    });

    const canUse = await checkAIUsage(currentUser.id);
    if (!canUse) {
      toast.error("Daily AI usage limit reached", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
      router.push("/pricing")
      return;
    }

    setIsGenerating(true);
    try {
      console.log(`[AICall] Submitting prompt: ${prompt}, audioBlob=${!!audioBlob}, transcription=${transcription}`);
      const result = await onSubmit(prompt, audioBlob, transcription, aiContentHistory);
      console.log(`[AICall] Received result: type=${typeof result}, value=`, result);
      toast.dismiss(toastId);

      if (!result) {
        toast.error('No response received from AI', {
          duration: 3000,
          style: {
            background: theme === 'light' ? '#fff' : '#1e293b',
            color: theme === 'light' ? '#1f2937' : '#f4f4f6',
            border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          },
        });
        setIsGenerating(false);
        return;
      }

      const payload = {
        callId,
        userId: currentUser.id,
        prompt,
        transcription: transcription || undefined,
        response: typeof result === 'string' ? result : result.response,
        isShared,
        createdAt: new Date().toISOString(),
        id: `temp-${Date.now()}`,
        history: aiContentHistory, // Adicionar histórico ao payload
      };

      console.log(`[AICall] Processing submission: response=${payload.response?.substring(0, 50) || 'none'}...`);

      // Adicionar respostas não compartilhadas diretamente
      if (payload.response && typeof payload.response === 'string') {
        setAIContentHistory((prev) => [
          ...prev,
          { ...payload, response: '', history: undefined }, // Start with empty response for streaming
        ]);
        setIsResponseStreaming(true);
        try {
          await simulateStreamingBChunk(
            payload.response,
            (chunk) => {
              console.log(`[AICall] Streaming chunk: ${chunk}`);
              setAIContentHistory((prev) =>
                prev.map((item) =>
                  item.id === payload.id ? { ...item, response: item.response ? item.response + ' ' + chunk : chunk } : item
                )
              );
            },
            5, // Chunk size
            200, // Delay in ms
            abortControllerRef.current?.signal
          );
        } catch (error: any) {
          console.error(`[AICall] Streaming failed: ${error.message}`);
          toast.error(`Failed to stream AI response: ${error.message}`, {
            duration: 3000,
            style: {
              background: theme === 'light' ? '#fff' : '#1e293b',
              color: theme === 'light' ? '#1f2937' : '#f4f4f6',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
            },
          });
          setAIContentHistory((prev) => prev.filter((item) => item.id !== payload.id));
        } finally {
          setIsResponseStreaming(false);
          setIsGenerating(false);
        }
      } else {
        // Handle non-string or invalid responses
        setAIContentHistory((prev) => [...prev, { ...payload, history: undefined }]);
        setIsGenerating(false);
        console.log(`[AICall] Non-string content added:`, payload);
      }

      if (videoSocket) {
        console.log(`[AICall] Emitting submit-ai-content: callId=${callId}, payload=`, payload);
        videoSocket.emit('submit-ai-content', payload, (response: { success: boolean; contentId?: string; error?: string }) => {
          if (response.error) {
            console.error(`[AICall] submit-ai-content failed:`, response.error);
            toast.error(`Failed to share AI content: ${response.error}`, {
              duration: 3000,
              style: {
                background: theme === 'light' ? '#fff' : '#1e293b',
                color: theme === 'light' ? '#1f2937' : '#f4f4f6',
                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
              },
            });
            setAIContentHistory((prev) => prev.filter((item) => item.id !== payload.id));
          } else {
            console.log(`[AICall] AI content shared: contentId=${response.contentId}`);
            setAIContentHistory((prev) =>
              prev.map((item) =>
                item.id === payload.id ? { ...item, id: response.contentId || item.id } : item
              )
            );
            // toast.success('AI content shared', {
            //   duration: 3000,
            //   style: {
            //     background: theme === 'light' ? '#fff' : '#1e293b',
            //     color: theme === 'light' ? '#1f2937' : '#f4f4f6',
            //     border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
            //   },
            // });
          }
        });
      }
    } catch (error: any) {
      console.error('[AICall] Failed to process prompt:', error);
      toast.dismiss(toastId);
      toast.error(`Failed to generate response: ${error.message}`, {
        duration: 3000,
        style: {
          background: theme === 'light' ? '#fff' : '#1e293b',
          color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        },
      });
      setIsGenerating(false);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { delta } = event;
    const modalElement = document.getElementById(isExpanded ? "expanded-ai-call-modal" : "mini-ai-call-modal");
    const { width, height } = modalElement?.getBoundingClientRect() || {
      width: isExpanded ? 448 : 320,
      height: isExpanded ? 300 : 60,
    };
    setPosition((prev) => ({
      x: Math.max(0, Math.min(prev.x + delta.x, window.innerWidth - width)),
      y: Math.max(0, Math.min(prev.y + delta.y, window.innerHeight - height)),
    }));
    setActiveId(null);
  };

  useEffect(() => {
    if (!isOpen) {
      console.log(`[AICallModal] Resetting state: isOpen=${isOpen}`);
      setPrompt('');
      setResponse(null);
      setTranscription(null);
      setIsExpanded(false);
      setIsRecording(false);
      setAudioBlob(null);
      setSuggestion(null);
      setAIContentHistory([]);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (destinationRef.current) {
        destinationRef.current.disconnect();
        destinationRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const modalElement = document.getElementById(isExpanded ? "expanded-ai-call-modal" : "mini-ai-call-modal");
        const { width, height } = modalElement?.getBoundingClientRect() || {
          width: isExpanded ? 448 : 320,
          height: isExpanded ? 300 : 60,
        };
        return {
          x: Math.max(0, Math.min(prev.x, window.innerWidth - width)),
          y: Math.max(0, Math.min(prev.y, window.innerHeight - height)),
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, [isExpanded]);

  useEffect(() => {
    console.log(`[AICallModal] isExpanded changed: isExpanded=${isExpanded}, callId=${callId}, localStream=${!!localStream}, peerStream=${!!peerStream}`);
  }, [isExpanded, callId, localStream, peerStream]);

  if (!isOpen) return null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AnimatePresence mode="wait">
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
            localStream={localStream}
            audioSource={audioSource}
            setAudioSource={setAudioSource}
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
            localStream={localStream}
            audioBlob={audioBlob}
            position={position}
            isDragging={activeId === "expanded-ai-call-modal"}
            response={response}
            isResponseStreaming={isResponseStreaming}
            audioSource={audioSource}
            setAudioSource={setAudioSource}
            transcription={transcription}
            downloadAudio={downloadAudio}
            suggestion={suggestion}
            isShared={isShared}
            setIsShared={setIsShared}
            aiContentHistory={aiContentHistory}
            toggleSharing={toggleSharing}
            isGenerating={isGenerating}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}