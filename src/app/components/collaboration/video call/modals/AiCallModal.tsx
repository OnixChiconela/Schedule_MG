// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useTheme } from "@/app/themeContext";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mic, MicOff, Send, X, Sparkles } from "lucide-react";
// import { DndContext, useDraggable, useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
// import { simulateStreaming } from "@/app/api/actions/AI/hugging_face/generateText";
// import toast from "react-hot-toast";

// interface AICallModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (prompt: string, audioBlob?: Blob) => Promise<string | null>;
//   peerStream?: MediaStream | null;
// }

// interface MiniAICallModalProps {
//   theme: string;
//   prompt: string;
//   setPrompt: (value: string) => void;
//   onSubmit: (prompt: string, audioBlob?: Blob | null) => void;
//   onExpand: () => void;
//   position: { x: number; y: number };
//   isDragging?: boolean;
//   isRecording: boolean;
//   toggleRecording: () => void;
//   peerStream?: MediaStream | null;
//   isMicEnabled: boolean
//   enableMic: () => void
// }

// interface ExpandedAICallModalProps {
//   theme: string;
//   prompt: string;
//   setPrompt: (value: string) => void;
//   onSubmit: (prompt: string, audioBlob?: Blob | null) => void;
//   onMinimize: () => void;
//   isRecording: boolean;
//   toggleRecording: () => void;
//   peerStream?: MediaStream | null;
//   audioBlob: Blob | null;
//   position: { x: number; y: number };
//   isDragging?: boolean;
//   response: string | null;
//   isResponseStreaming: boolean;
//   isMicEnabled: boolean
//   enableMic: () => void
// }

// function MiniAICallModal({
//   theme,
//   prompt,
//   setPrompt,
//   onSubmit,
//   onExpand,
//   position,
//   isDragging,
//   isRecording,
//   toggleRecording,
//   peerStream,
//   isMicEnabled,
//   enableMic
// }: MiniAICallModalProps) {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: "mini-ai-call-modal",
//   });

//   const style = {
//     position: "fixed" as const,
//     left: `${position.x}px`,
//     top: `${position.y}px`,
//     transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
//     transition: transform ? "none" : "transform 0.05s ease-out",
//     cursor: isDragging ? "grabbing" : "grab",
//     zIndex: isDragging ? 1002 : 1000,
//   };

//   return (
//     <motion.div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       initial={{ opacity: 0, scale: 0.8 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.8 }}
//       className={`rounded-xl p-4 w-85 shadow-lg flex items-center gap-2 ${theme === "light" ? "bg-white border border-gray-200" : "bg-slate-900 border border-slate-600"
//         } hover:shadow-xl transition-shadow duration-200 select-none`}
//     >
//       <input
//         type="text"
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//         placeholder="Ask AI..."
//         className={`flex-1 p-2 rounded-lg text-sm ${theme === "light" ? "bg-gray-50/20 text-neutral-800" : "bg-slate-800/20 text-neutral-200"
//           } focus:outline-none`}
//         onClick={(e) => e.stopPropagation()}
//       />
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           toggleRecording();
//           if (!isMicEnabled) {
//             enableMic();
//             toast.success("Microphone enabled", {
//               duration: 3000,
//               style: {
//                 background: theme === "light" ? "#fff" : "#1e293b",
//                 color: theme === "light" ? "#1f2937" : "#f4f4f6",
//                 border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//               },
//             });
//           } else {
//             toggleRecording();
//             toast.success(isRecording ? "Recording stopped" : "Recording started", {
//               duration: 3000,
//               style: {
//                 background: theme === "light" ? "#fff" : "#1e293b",
//                 color: theme === "light" ? "#1f2937" : "#f4f4f6",
//                 border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//               },
//             });
//           }
//         }}
//         disabled={!peerStream || (!isMicEnabled && !isRecording)}
//         className={`p-2 rounded-full ${!peerStream || (!isMicEnabled && !isRecording)
//           ? "opacity-50 cursor-not-allowed"
//           : isRecording
//             ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
//             : theme === "light"
//               ? "bg-gray-200 hover:bg-gray-300"
//               : "bg-slate-700 hover:bg-slate-600"
//           }`}
//         title={isRecording ? "Stop recording" : "Record audio"}
//       >
//         {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
//       </button>
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           prompt.trim() && onSubmit(prompt);
//         }}
//         disabled={!prompt.trim()}
//         className={`p-2 rounded-full ${prompt.trim()
//           ? theme === "light"
//             ? "bg-neutral-800 hover:bg-neutral-900 text-white"
//             : "bg-neutral-950 hover:bg-black text-white"
//           : "opacity-50 cursor-not-allowed"
//           }`}
//         title="Send prompt"
//       >
//         <Send size={16} />
//       </button>
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onExpand();
//         }}
//         className={`p-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-600"
//           }`}
//         title="Expand"
//       >
//         <X size={16} className="rotate-45" />
//       </button>
//     </motion.div>
//   );
// }

// function ExpandedAICallModal({
//   theme,
//   prompt,
//   setPrompt,
//   onSubmit,
//   onMinimize,
//   isRecording,
//   toggleRecording,
//   peerStream,
//   audioBlob,
//   position,
//   isDragging,
//   response,
//   isResponseStreaming,
//   isMicEnabled,
//   enableMic,
// }: ExpandedAICallModalProps) {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: "expanded-ai-call-modal",
//   });

//   const style = {
//     position: "fixed" as const,
//     left: `${position.x}px`,
//     top: `${position.y}px`,
//     transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
//     transition: transform ? "none" : "transform 0.05s ease-out",
//     cursor: "default",
//     zIndex: isDragging ? 1002 : 1000,
//   };

//   return (
//     <motion.div
//       ref={setNodeRef}
//       style={style}
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       className={`rounded-xl p-6 w-[80%] max-w-lg h-[400px] flex flex-col shadow-xl ${
//         theme === "light" ? "bg-white border border-gray-200" : "bg-slate-900 border border-slate-600"
//       } hover:shadow-xl transition-shadow duration-200 select-none`}
//     >
//       <div
//         className="flex justify-between items-center mb-4 cursor-grab flex-shrink-0"
//         {...attributes}
//         {...listeners}
//         style={{ cursor: isDragging ? "grabbing" : "grab" }}
//       >
//         <div className="flex items-center gap-2">
//           <Sparkles size={18} />
//           <h2 className={`text-xl font-semibold ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
//             AI Interaction
//           </h2>
//         </div>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onMinimize();
//           }}
//           className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
//           title="Minimize"
//           aria-label="Minimize AI modal"
//         >
//           <X size={20} />
//         </button>
//       </div>
//       <div className="flex-1 mb-4">
//         {response !== null && (
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <Sparkles size={16} />
//               <h3 className={`text-sm font-medium ${theme === "light" ? "text-neutral-800" : "text-neutral-300"}`}>
//                 AI Response
//               </h3>
//             </div>
//             {isResponseStreaming && !response?.length ? (
//               <div className="flex justify-center items-center ">
//                 <div
//                   className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
//                     theme === "light" ? "border-neutral-800" : "border-neutral-300"
//                   }`}
//                   data-testid="response-loading-spinner"
//                 ></div>
//               </div>
//             ) : (
//               <p
//                 className={`w-full p-3 rounded-lg h-[100px] overflow-y-auto ${
//                   theme === "light" ? "bg-gray-50/20 text-neutral-800 border border-gray-200/30" : "bg-slate-800/20 text-neutral-200 border border-slate-600/30"
//                 }`}
//                 data-testid="response-text"
//                 aria-live="polite"
//               >
//                 {response || "Generating response..."}
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//       <textarea
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//         placeholder="Enter your prompt for the AI..."
//         className={`w-full h-24 p-3 rounded-lg mb-4 resize-none ${
//           theme === "light" ? "bg-gray-50/20 text-neutral-800 border border-gray-200" : "bg-slate-800/20 text-neutral-200 border border-slate-600"
//         } focus:outline-none`}
//         onClick={(e) => e.stopPropagation()}
//         aria-label="Enter prompt for AI"
//       />
//       <div className="flex justify-end gap-2 mb-2 flex-shrink-0">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onMinimize();
//           }}
//           className={`px-4 py-2 rounded-lg font-medium ${
//             theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-600"
//           }`}
//           aria-label="Minimize AI modal"
//         >
//           Minimize
//         </button>
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onSubmit(prompt, audioBlob);
//           }}
//           disabled={!prompt.trim()}
//           className={`px-4 py-2 rounded-lg font-medium ${
//             !prompt.trim()
//               ? "opacity-50 cursor-not-allowed"
//               : theme === "light"
//               ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
//               : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
//           }`}
//           aria-label="Send prompt to AI"
//         >
//           <Send size={20} className="inline mr-2" />
//           Send to AI
//         </button>
//       </div>
//       <div className="flex justify-between items-center flex-shrink-0">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             if (!isMicEnabled) {
//               enableMic();
//               toast.success("Microphone enabled", {
//                 duration: 3000,
//                 style: {
//                   background: theme === "light" ? "#fff" : "#1e293b",
//                   color: theme === "light" ? "#1f2937" : "#f4f4f6",
//                   border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//                 },
//               });
//             } else {
//               toggleRecording();
//               toast.success(isRecording ? "Recording stopped" : "Recording started", {
//                 duration: 3000,
//                 style: {
//                   background: theme === "light" ? "#fff" : "#1e293b",
//                   color: theme === "light" ? "#1f2937" : "#f4f4f6",
//                   border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//                 },
//               });
//             }
//           }}
//           disabled={!peerStream || (!isMicEnabled && !isRecording)}
//           className={`p-2 rounded-full ${
//             !peerStream || (!isMicEnabled && !isRecording)
//               ? "opacity-50 cursor-not-allowed"
//               : isRecording
//               ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
//               : theme === "light"
//               ? "bg-gray-200 hover:bg-gray-300"
//               : "bg-slate-700 hover:bg-slate-600"
//           }`}
//           title={isRecording ? "Stop recording" : "Record audio"}
//           aria-label={isRecording ? "Stop recording audio" : "Start recording audio"}
//         >
//           {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
//         </button>
//         <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
//           {isRecording ? "Recording audio..." : "Record participant audio"}
//         </p>
//       </div>
//     </motion.div>
//   );
// }

// export default function AICallModal({ isOpen, onClose, onSubmit, peerStream }: AICallModalProps) {
//   const { theme } = useTheme();
//   const [prompt, setPrompt] = useState("");
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isMicEnabled, setIsMicEnabled] = useState(false);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [response, setResponse] = useState<string | null>(null);
//   const [isResponseStreaming, setIsResponseStreaming] = useState(false);
//   const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 1,
//       },
//     })
//   );

//   useEffect(() => {
//     if (isRecording && peerStream) {
//       const audioTracks = peerStream.getAudioTracks();
//       if (audioTracks.length === 0) {
//         console.error("No audio tracks in peerStream");
//         toast.error("No audio detected in peer stream", {
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
//         audioContextRef.current = new AudioContext();
//         sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(peerStream);
//         const mediaRecorder = new MediaRecorder(peerStream);
//         audioChunksRef.current = [];

//         mediaRecorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//             // Keep only the last 10 seconds of audio (assuming 1MB/s for estimation)
//             const maxDurationMs = 10000; // 10 seconds
//             const maxSize = 10 * 1024 * 1024; // 10MB max (adjust based on codec)
//             while (audioChunksRef.current.length > 1) {
//               const totalDuration = audioChunksRef.current.reduce((sum, chunk) => sum + (chunk.size / 1024 / 1024) * 1000, 0);
//               if (totalDuration > maxDurationMs) {
//                 audioChunksRef.current.shift(); // Remove oldest chunk
//               } else {
//                 break;
//               }
//             }
//           }
//         };

//         mediaRecorder.onstop = () => {
//           const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//           setAudioBlob(blob);
//           console.log("Audio recording stopped, blob created:", blob);
//         };

//         mediaRecorderRef.current = mediaRecorder;
//         mediaRecorder.start(1000); // Collect chunks every 1 second for sliding window
//         console.log("Started recording audio from peerStream");
//       } catch (err) {
//         console.error("Failed to start audio recording:", err);
//          toast.error("Failed to start recording", {
//           duration: 3000,
//           style: {
//             background: theme === "light" ? "#fff" : "#1e293b",
//             color: theme === "light" ? "#1f2937" : "#f4f4f6",
//             border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//           },
//         });
//         setIsRecording(false);
//       }
//     } else if (!isRecording && mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       if (sourceNodeRef.current) {
//         sourceNodeRef.current.disconnect();
//         sourceNodeRef.current = null;
//       }
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//     }

//     return () => {
//       if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//         mediaRecorderRef.current.stop();
//       }
//       if (sourceNodeRef.current) {
//         sourceNodeRef.current.disconnect();
//       }
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//       }
//     };
//   }, [isRecording, peerStream, theme]);

//   const enableMic = () => {
//     setIsMicEnabled(true);
//   };

//   const toggleRecording = () => {
//     if (!peerStream) {
//       console.error("No peer stream available for recording");
//       toast.error("No audio stream available for recording", {
//         duration: 3000,
//         style: {
//           background: theme === "light" ? "#fff" : "#1e293b",
//           color: theme === "light" ? "#1f2937" : "#f4f4f6",
//           border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//         },
//       });
//       return;
//     }
//     setIsRecording((prev) => !prev);
//   };

//   const handleSubmit = async (prompt: string, audioBlob?: Blob | null) => {
//     if (!prompt.trim()) {
//       toast.error("Prompt cannot be empty", {
//         duration: 3000,
//         style: {
//           background: theme === "light" ? "#fff" : "#1e293b",
//           color: theme === "light" ? "#1f2937" : "#f4f4f6",
//           border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//         },
//       });
//       return;
//     }
//     const toastId = toast.loading("Generating response...", {
//       style: {
//         background: theme === "light" ? "#fff" : "#1e293b",
//         color: theme === "light" ? "#1f2937" : "#f4f4f6",
//         border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//       },
//     });
//     setIsResponseStreaming(true);
//     setIsExpanded(true);
//     try {
//       const res = await onSubmit(prompt, audioBlob || undefined);
//       toast.dismiss(toastId);
//       if (res) {
//         setResponse("");
//         simulateStreaming(
//           res,
//           (chunk) => {
//             setResponse((prev) => (prev || "") + chunk);
//           },
//           5,
//           200
//         ).then(() => {
//           setIsResponseStreaming(false);
//           toast.success("Response generated successfully", {
//             duration: 3000,
//             style: {
//               background: theme === "light" ? "#fff" : "#1e293b",
//               color: theme === "light" ? "#1f2937" : "#f4f4f6",
//               border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//             },
//           });
//         });
//       } else {
//         setIsResponseStreaming(false);
//         setResponse(null);
//         toast.error("No response received from AI", {
//           duration: 3000,
//           style: {
//             background: theme === "light" ? "#fff" : "#1e293b",
//             color: theme === "light" ? "#1f2937" : "#f4f4f6",
//             border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//           },
//         });
//       }
//     } catch (error) {
//       console.error("Failed to get AI response:", error);
//       toast.dismiss(toastId);
//       setIsResponseStreaming(false);
//       setResponse(null);
//       toast.error("Failed to generate response", {
//         duration: 3000,
//         style: {
//           background: theme === "light" ? "#fff" : "#1e293b",
//           color: theme === "light" ? "#1f2937" : "#f4f4f6",
//           border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
//         },
//       });
//     }
//     setPrompt("");
//     setAudioBlob(null);
//   };

//   const handleDragStart = (event: any) => {
//     setActiveId(event.active.id);
//   };

//   const handleDragEnd = (event: any) => {
//     const { delta } = event;
//     const width = isExpanded ? 448 : 320;
//     const height = isExpanded ? 300 : 60;

//     setPosition((prev) => ({
//       x: Math.max(0, Math.min(prev.x + delta.x, window.innerWidth - width)),
//       y: Math.max(0, Math.min(prev.y + delta.y, window.innerHeight - height)),
//     }));

//     setActiveId(null);
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       setPosition((prev) => {
//         const width = isExpanded ? 448 : 320;
//         const height = isExpanded ? 300 : 60;
//         return {
//           x: Math.max(0, Math.min(prev.x, window.innerWidth - width)),
//           y: Math.max(0, Math.min(prev.y, window.innerHeight - height)),
//         };
//       });
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [isExpanded]);

//   if (!isOpen) return null;

//   return (
//     <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
//       <AnimatePresence>
//         {!isExpanded ? (
//           <MiniAICallModal
//             theme={theme}
//             prompt={prompt}
//             setPrompt={setPrompt}
//             onSubmit={handleSubmit}
//             onExpand={() => setIsExpanded(true)}
//             position={position}
//             isDragging={activeId === "mini-ai-call-modal"}
//             isRecording={isRecording}
//             toggleRecording={toggleRecording}
//             peerStream={peerStream}
//             isMicEnabled={isMicEnabled}
//             enableMic={enableMic}
//           />
//         ) : (
//           <ExpandedAICallModal
//             theme={theme}
//             prompt={prompt}
//             setPrompt={setPrompt}
//             onSubmit={handleSubmit}
//             onMinimize={() => setIsExpanded(false)}
//             isRecording={isRecording}
//             toggleRecording={toggleRecording}
//             peerStream={peerStream}
//             audioBlob={audioBlob}
//             position={position}
//             isDragging={activeId === "expanded-ai-call-modal"}
//             response={response}
//             isResponseStreaming={isResponseStreaming}
//             isMicEnabled={isMicEnabled}
//             enableMic={enableMic}
//           />
//         )}
//       </AnimatePresence>
//     </DndContext>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/themeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, X, Sparkles, Download } from "lucide-react";
import { DndContext, useDraggable, useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { simulateStreaming } from "@/app/api/actions/AI/hugging_face/generateText";
import toast from "react-hot-toast";

interface AICallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, audioBlob?: Blob, transcription?: string) => Promise<string | null>;
  peerStream?: MediaStream | null;
  localStream?: MediaStream | null;
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

interface ExpandedAICallModalProps {
  theme: string;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (prompt: string, audioBlob?: Blob | null, transcription?: string) => void;
  onMinimize: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  peerStream?: MediaStream | null;
  localStream?: MediaStream | null;
  audioBlob: Blob | null;
  position: { x: number; y: number };
  isDragging?: boolean;
  response: string | null;
  isResponseStreaming: boolean;
  audioSource: "local" | "peer" | "mixed";
  setAudioSource: (source: "local" | "peer" | "mixed") => void;
  transcription: string | null;
  downloadAudio: () => void;
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
      className={`rounded-xl p-4 w-120 shadow-lg flex items-center gap-2 ${theme === "light" ? "bg-white border border-gray-200" : "bg-slate-900 border border-slate-600"
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

function ExpandedAICallModal({
  theme,
  prompt,
  setPrompt,
  onSubmit,
  onMinimize,
  isRecording,
  toggleRecording,
  peerStream,
  localStream,
  audioBlob,
  position,
  isDragging,
  response,
  isResponseStreaming,
  audioSource,
  setAudioSource,
  transcription,
  downloadAudio
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
      className={`rounded-xl p-6 w-[80%] max-w-lg h-[400px] flex flex-col shadow-xl ${theme === "light" ? "bg-white border border-gray-200" : "bg-slate-900 border border-slate-600"
        } hover:shadow-xl transition-shadow duration-200 select-none`}
      role="dialog"
      aria-modal="true"
      aria-label="AI Interaction Modal"
    >
      <div
        className="flex justify-between items-center mb-4 cursor-grab flex-shrink-0"
        {...attributes}
        {...listeners}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h2
            className={`text-xl font-semibold ${theme === "light" ? "text-neutral-800" : "text-neutral-200"
              }`}
          >
            AI Interaction
          </h2>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"
            }`}
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
              <h3
                className={`text-sm font-medium ${theme === "light" ? "text-neutral-800" : "text-neutral-300"
                  }`}
              >
                AI Response
              </h3>
            </div>
            {isResponseStreaming && !response?.length ? (
              <div className="flex justify-center items-center ">
                <div
                  className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme === "light" ? "border-neutral-800" : "border-neutral-300"
                    }`}
                  data-testid="response-loading-spinner"
                ></div>
              </div>
            ) : (
              <p
                className={`w-full p-3 rounded-lg h-[100px] overflow-y-auto ${theme === "light"
                  ? "bg-gray-50/20 text-neutral-800 border border-gray-200/30"
                  : "bg-slate-800/20 text-neutral-200 border border-slate-600/30"
                  }`}
                data-testid="response-text"
                aria-live="polite"
              >
                {response || "Generating response..."}
              </p>
            )}
          </div>
        )}
        {transcription && (
          <div className="mt-2">
            <h3
              className={`text-sm font-medium ${theme === "light" ? "text-neutral-800" : "text-neutral-300"
                }`}
            >
              Transcription
            </h3>
            <p
              className={`w-full p-3 rounded-lg h-[80px] overflow-y-auto ${theme === "light"
                ? "bg-gray-50/20 text-neutral-800 border border-gray-200/30"
                : "bg-slate-800/20 text-neutral-200 border border-slate-600/30"
                }`}
            >
              {transcription}
            </p>
          </div>
        )}
        {audioBlob && (
          <div className="mt-2">
            <button
              onClick={downloadAudio}
              className={`p-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-600"
                }`}
              title="Download recorded audio"
            >
              <Download size={16} />
            </button>
          </div>
        )}
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt for the AI..."
        className={`w-full h-24 p-3 rounded-lg mb-4 resize-none ${theme === "light"
          ? "bg-gray-50/20 text-neutral-800 border border-gray-200"
          : "bg-slate-800/20 text-neutral-200 border border-slate-600"
          } focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
        aria-label="Enter prompt for AI"
      />
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
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
          aria-label={isRecording ? "Stop recording audio" : "Start recording audio"}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>
      <div className="flex justify-end gap-2 mb-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`px-4 py-2 rounded-lg font-medium ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-600"
            }`}
          aria-label="Minimize AI modal"
        >
          Minimize
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSubmit(prompt, audioBlob, transcription ?? undefined);
          }}
          disabled={!prompt.trim()}
          className={`px-4 py-2 rounded-lg font-medium ${!prompt.trim()
            ? "opacity-50 cursor-not-allowed"
            : theme === "light"
              ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
              : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            }`}
          aria-label="Send prompt to AI"
        >
          <Send size={12} />
        </button>
      </div>
      <p
        className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
      >
        {isRecording
          ? `Recording ${audioSource === "local" ? "your audio" : audioSource === "peer" ? "participant audio" : "all audio"}...`
          : "Select audio source and record"}
      </p>
    </motion.div>
  );
}

async function transcribeAudio(audioBlob: Blob, retries = 2): Promise<string> {
  if (audioBlob.size === 0) {
    console.error("[AICall] Empty audio blob, cannot transcribe");
    toast.error("No audio recorded to transcribe", {
      duration: 3000,
    });
    return "";
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `audio.${audioBlob.type.split("/")[1]}`);
      const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large-v3", {
        method: "POST",
        headers: {
          Authorization: "Bearer YOUR_HUGGING_FACE_API_KEY", // Replace with your actual API key
        },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AICall] Transcription API error (attempt ${attempt}): ${response.status} ${errorText}`);
        if (attempt === retries) {
          toast.error("Transcription service unavailable", {
            duration: 3000,
          });
          return "";
        }
        continue;
      }
      const result = await response.json();
      if (result.text) {
        console.log("[AICall] Transcription successful:", result.text);
        return result.text;
      }
      console.error("[AICall] Transcription API returned no text");
      return "";
    } catch (error) {
      console.error(`[AICall] Transcription failed (attempt ${attempt}):`, error);
      if (attempt === retries) {
        toast.error("Failed to transcribe audio", {
          duration: 3000,
        });
        return "";
      }
    }
  }
  return "";
}

function getSupportedMimeType(): string | null {
  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm;codecs=pcm",
    "audio/ogg;codecs=opus",
    "audio/wav",
    "audio/mp4",
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
  if (!audioTracks.length) {
    console.error(`[AICall] No audio tracks in ${source} stream`);
    return false;
  }
  const hasActiveTrack = audioTracks.some((track) => track.enabled && track.readyState === "live");
  if (!hasActiveTrack) {
    console.error(`[AICall] No active audio tracks in ${source} stream`);
    return false;
  }
  return true;
}

export default function AICallModal({ isOpen, onClose, onSubmit, peerStream, localStream }: AICallModalProps) {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [isResponseStreaming, setIsResponseStreaming] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<"local" | "peer" | "mixed">("local");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording.${audioBlob.type.split("/")[1]}`;
      a.click();
      URL.revokeObjectURL(url);
      console.log("[AICall] Audio blob downloaded:", audioBlob);
      toast.success("Audio downloaded", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
    }
  };

  useEffect(() => {
    console.log(
      `[AICall] Rendering: isOpen=${isOpen}, localStream=${!!localStream}, peerStream=${!!peerStream}, isRecording=${isRecording}, audioSource=${audioSource}`
    );
    if (isRecording) {
      let audioSourceStream: MediaStream | null = null;
      if (audioSource === "local" && localStream) {
        if (!validateStream(localStream, "local")) {
          toast.error("No active audio in your microphone", {
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
        audioSourceStream = localStream;
      } else if (audioSource === "peer" && peerStream) {
        if (!validateStream(peerStream, "peer")) {
          toast.error("No active audio from participant", {
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
        audioSourceStream = peerStream;
      } else if (audioSource === "mixed" && localStream && peerStream) {
        audioContextRef.current = new AudioContext();
        destinationRef.current = audioContextRef.current.createMediaStreamDestination();
        if (localStream && validateStream(localStream, "local")) {
          const localSource = audioContextRef.current.createMediaStreamSource(localStream);
          localSource.connect(destinationRef.current);
        }
        if (peerStream && validateStream(peerStream, "peer")) {
          const peerSource = audioContextRef.current.createMediaStreamSource(peerStream);
          peerSource.connect(destinationRef.current);
        }
        audioSourceStream = destinationRef.current.stream;
        if (!validateStream(audioSourceStream, "mixed")) {
          toast.error("No active audio in mixed stream", {
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
      }

      if (!audioSourceStream) {
        console.error("[AICall] No audio stream available");
        toast.error("No audio stream available for recording", {
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

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        console.error("[AICall] No supported MIME types for MediaRecorder");
        toast.error("Your browser does not support audio recording", {
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
        const mediaRecorder = new MediaRecorder(audioSourceStream, { mimeType });
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log(`[AICall] Audio chunk received: size=${event.data.size}`);
          }
        };
        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlob(blob);
          console.log(`[AICall] Audio recording stopped, blob created: size=${blob.size}, type=${blob.type}`);
          if (blob.size > 0) {
            const transcriptionText = await transcribeAudio(blob);
            setTranscription(transcriptionText || null);
          } else {
            console.error("[AICall] Empty audio blob, skipping transcription");
            toast.error("No audio recorded", {
              duration: 3000,
              style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
              },
            });
          }
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000);
        console.log(`[AICall] Started recording audio with MIME type: ${mimeType}`);
      } catch (err) {
        console.error("[AICall] Failed to start audio recording:", err);
        toast.error(
          err instanceof DOMException && err.name === "NotSupportedError"
            ? "Your browser does not support this audio format"
            : "Failed to start recording",
          {
            duration: 3000,
            style: {
              background: theme === "light" ? "#fff" : "#1e293b",
              color: theme === "light" ? "#1f2937" : "#f4f4f6",
              border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
          }
        );
        setIsRecording(false);
      }
    } else if (!isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
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
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording, localStream, peerStream, audioSource, theme]);

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
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording((prev) => !prev);
      toast.success(isRecording ? "Recording stopped" : "Recording started", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
    } catch (err) {
      console.error("[AICall] Microphone permission denied:", err);
      toast.error("Microphone access denied. Please allow in browser settings.", {
        duration: 3000,
        style: {
          background: theme === "light" ? "#fff" : "#1e293b",
          color: theme === "light" ? "#1f2937" : "#f4f4f6",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
        },
      });
    }
  };

  const handleSubmit = async (prompt: string, audioBlob?: Blob | null, transcription?: string) => {
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
      const res = await onSubmit(prompt, audioBlob ?? undefined, transcription);
      toast.dismiss(toastId);
      if (res) {
        setResponse("");
        // Simulate streaming (replace with real streaming if API supports it)
        setTimeout(() => {
          setResponse(res);
          setIsResponseStreaming(false);
          toast.success("Response generated successfully", {
            duration: 3000,
            style: {
              background: theme === "light" ? "#fff" : "#1e293b",
              color: theme === "light" ? "#1f2937" : "#f4f4f6",
              border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
          });
        }, 1000);
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
      console.error("[AICall] Failed to get AI response:", error);
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
    setTranscription(null);
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
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}