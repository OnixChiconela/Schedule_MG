"use client"

import { useDraggable } from '@dnd-kit/core';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, Mic, MicOff, X, Download, Send, Brain } from 'lucide-react';
import { FaExchangeAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useUser } from '@/app/context/UserContext';
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm';


interface AICallContent {
  id: string;
  callId: string;
  userId: string;
  prompt: string;
  response?: string;
  isShared: boolean;
  createdAt: string;
}

interface ExpandedAICallModalProps {
  theme: string;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (prompt: string, audioBlob?: Blob | null, transcription?: string) => void;
  onMinimize: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  peerStream: MediaStream | null | undefined;
  localStream: MediaStream | null | undefined
  audioBlob: Blob | null;
  position: { x: number; y: number };
  isDragging: boolean;
  response: string | null;
  isResponseStreaming: boolean;
  audioSource: 'local' | 'peer' | 'mixed';
  setAudioSource: (value: 'local' | 'peer' | 'mixed') => void;
  transcription: string | null;
  downloadAudio: () => void;
  suggestion: string | null;
  isShared: boolean;
  setIsShared: (value: boolean) => void;
  aiContentHistory: AICallContent[];
  toggleSharing: () => void;
  isGenerating: boolean
}

interface AICallContent {
  id: string;
  callId: string;
  userId: string;
  prompt: string;
  response?: string;
  transcription?: string
  isShared: boolean;
  createdAt: string;
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
  downloadAudio,
  suggestion,
  isShared,
  setIsShared,
  aiContentHistory,
  toggleSharing,
  isGenerating
}: ExpandedAICallModalProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'expanded-ai-call-modal',
  });
  const { currentUser } = useUser();

  const [recordingTime, setRecordingTime] = useState(0);

  // Dynamic recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSharing = async () => {
    try {
      await toggleSharing();
      toast.success(isShared ? 'Stopped sharing AI content' : 'Started sharing AI content', {
        duration: 3000,
        style: {
          background: theme === 'light' ? '#fff' : '#1e293b',
          color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        },
      });
    } catch (error: any) {
      console.error('[AICall] Toggle sharing failed:', error);
      toast.error('Failed to toggle sharing: ' + (error.message || 'Unknown error'), {
        duration: 4000,
        style: {
          background: theme === 'light' ? '#fff' : '#1e293b',
          color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        },
      });
    }
  };

  const shareButtonControls = useAnimation();

  useEffect(() => {
    if (isShared) {
      shareButtonControls.start({
        backgroundColor: ['#2dd4bf', '#14b8a6', '#2dd4bf'],
        transition: {
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
        },
      });
    } else {
      shareButtonControls.stop();
      shareButtonControls.set({
        backgroundColor: theme === 'light' ? '#e5e7eb' : '#374151',
      });
    }
  }, [isShared, theme, shareButtonControls]);

  useEffect(() => {
    if (isResponseStreaming) {
      toast.loading('Generating AI response...', {
        id: 'generating-toast', // ID único para o toast
        style: {
          background: theme === 'light' ? '#fff' : '#1e293b',
          color: theme === 'light' ? '#1f2937' : '#f4f4f6',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
        },
      });
    } else {
      toast.dismiss('generating-toast'); // Remove o toast quando o streaming termina
    }
  }, [isResponseStreaming, theme]);

  const style = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transform ? 'none' : 'transform 0.05s ease-out',
    cursor: 'default',
    zIndex: isDragging ? 1002 : 1000,
  };

  const latestContent = aiContentHistory[aiContentHistory.length - 1]

  const sortedHistory = [...aiContentHistory].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return aTime - bTime;
  });

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-xl p-6 w-[80%] max-w-lg max-h-[500px] flex flex-col shadow-xl ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-slate-900 border border-slate-600'
        } hover:shadow-xl transition-shadow duration-200 select-none`}
      role="dialog"
      aria-modal="true"
      aria-label="AI Interaction Modal"
    >
      {/* Header */}
      <div
        className="flex justify-between items-center mb-4 cursor-grab flex-shrink-0"
        {...attributes}
        {...listeners}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <h2
              className={`text-lg font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'
                }`}
            >
              AI Interaction
            </h2>
          </div>
          <div className="flex justify-between gap-2 items-center">
            <select
              value={audioSource}
              onChange={(e) => setAudioSource(e.target.value as 'local' | 'peer' | 'mixed')}
              className={`p-2 rounded-lg text-sm ${theme === 'light' ? 'bg-gray-50/20 text-neutral-800' : 'bg-slate-800/20 text-neutral-200'
                }`}
              disabled={!localStream && !peerStream}
            >
              <option value="local" disabled={!localStream}>
                Your audio
              </option>
              <option value="peer" disabled={!peerStream}>
                Participant audio
              </option>
              <option value="mixed" disabled={!localStream || !peerStream}>
                All audio
              </option>
            </select>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRecording();
                toast.success(isRecording ? 'Recording stopped' : 'Recording started', {
                  duration: 3000,
                  style: {
                    background: theme === 'light' ? '#fff' : '#1e293b',
                    color: theme === 'light' ? '#1f2937' : '#f4f4f6',
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                  },
                });
              }}
              disabled={!localStream && !peerStream}
              className={`p-2 rounded-full ${!localStream && !peerStream
                ? 'opacity-50 cursor-not-allowed'
                : isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : theme === 'light'
                    ? 'bg-gray-200 hover:bg-gray-300'
                    : 'bg-slate-700 hover:bg-slate-600'
                } flex gap-2 items-center`}
              title={isRecording ? 'Stop recording' : 'Record audio'}
              aria-label={isRecording ? 'Stop recording audio' : 'Start recording audio'}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              {isRecording && <span>{formatTime(recordingTime)}</span>}
            </button>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`p-1 rounded-full ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-slate-700'
            }`}
          title="Minimize"
          aria-label="Minimize AI modal"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content Area */}
      <div className="mb-4 ">
        {isGenerating && !latestContent && !suggestion ? (
          <div className="flex justify-center items-center h-[100px]">
            <motion.p
              animate={{
                opacity: [0.5, 1, 0.5],
                transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
              }}
              className={`text-sm font-medium ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'
                }`}
              data-testid="generating-indicator"
            >
              Generating...
            </motion.p>
          </div>
        ) : latestContent ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} />
              <h3
                className={`text-base font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'
                  }`}
              >
                Response {isResponseStreaming && <span className="text-gray-500 ml-1">generating...</span>}
                {isShared && <span className="text-xs text-teal-500">(Telepathy)</span>}
              </h3>
            </div>
            {latestContent.response ? (
              <div
                className={`w-full p-4 h-[200px] rounded-lg overflow-y-auto ${theme === 'light'
                  ? 'bg-gray-50/20 text-neutral-800 border border-gray-200/30'
                  : 'bg-slate-800/20 text-neutral-200 border border-slate-600/30'
                  }`}
                data-testid={`response-text-${latestContent.id}`}
                aria-live="polite"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className={`text-xl font-bold mb-3 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className={`text-base font-medium mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </h3>
                    ),
                    // p: ({ children }) => (
                    //   <p className={`text-sm mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                    //     {children}
                    //     {isResponseStreaming && <span className="text-gray-500 ml-1">generating...</span>}
                    //   </p>
                    // ),
                    ul: ({ children }) => (
                      <ul className={`list-disc list-inside mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className={`list-decimal list-inside mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className={`bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className={`border-l-4 border-gray-300 pl-4 italic mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {latestContent.response}
                </ReactMarkdown>
              </div>
            ) : (
              <div />
            )}
            {(latestContent.transcription || transcription) && (
              <div className="mt-4">
                <h4
                  className={`text-sm font-medium ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'
                    }`}
                >
                  Transcription {isShared && <span className="text-xs text-teal-500">(Shared)</span>}
                </h4>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className={`text-sm mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className={`list-disc list-inside mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className={`list-decimal list-inside mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                  }}
                >
                  {latestContent.transcription || transcription}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ) : suggestion ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} />
              <h3
                className={`text-base font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'
                  }`}
              >
                Suggestion {isShared && <span className="text-xs text-teal-500">(Telepathy)</span>}
              </h3>
            </div>
            <div
              className={`w-full p-4 rounded-lg overflow-y-auto ${theme === 'light'
                ? 'bg-gray-50/20 text-neutral-800 border border-gray-200/30'
                : 'bg-slate-800/20 text-neutral-200 border border-slate-600/30'
                }`}
              data-testid="suggestion-text"
              aria-live="polite"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className={`text-xl font-bold mb-3 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`text-base font-medium mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className={`text-sm mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className={`list-disc list-inside mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className={`list-decimal list-inside mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className={`bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-4 border-gray-300 pl-4 italic mb-2 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {suggestion}
              </ReactMarkdown>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask AI..."
        className={`w-full h-14 p-3 rounded-lg mb-4 resize-none ${theme === 'light'
          ? 'bg-gray-50/20 text-neutral-800 border border-gray-200'
          : 'bg-slate-800/20 text-neutral-200 border border-slate-600'
          } focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
        aria-label="Enter prompt for AI"
      />
      <div className="flex justify-between gap-2 items-center flex-shrink-0">
        <div className="flex gap-2 items-center">
          <p
            className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}
          >
            {isRecording
              ? `Recording ${audioSource === 'local'
                ? 'your audio'
                : audioSource === 'peer'
                  ? 'participant audio'
                  : 'all audio'
              }...`
              : 'Select audio source and record'}
          </p>
          {audioBlob && audioBlob.size > 0 && (
            <div>
              <button
                onClick={downloadAudio}
                className={`p-2 rounded-full ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                title="Download recorded audio"
              >
                <Download size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-1 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSharing();
            }}
            className={`p-2 rounded-full ${isShared
              ? 'bg-teal-500 hover:bg-teal-600 text-white'
              : theme === 'light'
                ? 'bg-gray-200 hover:bg-gray-300'
                : 'bg-slate-700 hover:bg-slate-600'
              } flex gap-2`}
            title={isShared ? 'Stop sharing AI content with participants' : 'Share AI content with participants'}
            aria-label={isShared ? 'Stop sharing AI content with participants' : 'Share AI content with participants'}
          >
            <Brain size={12} />
            <FaExchangeAlt size={12} />
            <Brain size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSubmit(prompt, audioBlob, transcription ?? undefined);
            }}
            disabled={!prompt.trim()}
            className={`px-4 py-2 rounded-lg font-medium ${!prompt.trim()
              ? 'opacity-50 cursor-not-allowed'
              : theme === 'light'
                ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
                : 'bg-neutral-950 hover:bg-black text-white'
              }`}
            aria-label="Send prompt to AI"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ExpandedAICallModal;