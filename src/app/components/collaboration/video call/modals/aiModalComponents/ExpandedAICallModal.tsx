"use client"

import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Sparkles, Mic, MicOff, X, Download, Send, Brain } from 'lucide-react';
import { FaExchangeAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useUser } from '@/app/context/UserContext';


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
}

interface AICallContent {
  id: string;
  callId: string;
  userId: string;
  prompt: string;
  response?: string;
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


  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        console.log('[AICall] Cleaned up localStream');
      }
      if (peerStream) {
        peerStream.getTracks().forEach((track) => track.stop());
        console.log('[AICall] Cleaned up peerStream');
      }
    };
  }, [localStream, peerStream]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSharing = async () => {
    try {
      // Check media stream availability
      // if (audioSource === 'local' && !localStream) {
      //   throw new Error('Local stream unavailable');
      // }
      // if (audioSource === 'peer' && !peerStream) {
      //   throw new Error('Peer stream unavailable');
      // }
      // if (audioSource === 'mixed' && (!localStream || !peerStream)) {
      //   throw new Error('Mixed stream unavailable');
      // }

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

  const style = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transform ? 'none' : 'transform 0.05s ease-out',
    cursor: 'default',
    zIndex: isDragging ? 1002 : 1000,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-xl p-6 w-[80%] max-w-lg max-h-[400px] overflow-y-auto flex flex-col shadow-xl ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-slate-900 border border-slate-600'
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
              className={`text-xl font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'
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
      <div className="mb-4 max-h-[120px] overflow-y-auto">
        {(response !== null || suggestion !== null || isResponseStreaming) && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} />
              <h3
                className={`text-sm font-medium ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'
                  }`}
              >
                AI Response {isShared && <span className="text-xs text-teal-500">(Shared)</span>}
              </h3>
            </div>
            {isResponseStreaming && !response?.length && !suggestion?.length ? (
              <div className="flex justify-center items-center h-[100px]">
                <div
                  className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme === 'light' ? 'border-neutral-800' : 'border-neutral-300'
                    }`}
                  data-testid="response-loading-spinner"
                ></div>
              </div>
            ) : (
              <p
                className={`w-full p-3 rounded-lg h-[100px] overflow-y-auto ${theme === 'light'
                  ? 'bg-gray-50/20 text-neutral-800 border border-gray-200/30'
                  : 'bg-slate-800/20 text-neutral-200 border border-slate-600/30'
                  }`}
                data-testid="response-text"
                aria-live="polite"
              >
                {response || suggestion || 'No response yet'}
              </p>
            )}
          </div>
        )}
        {transcription !== null && (
          <div className="mb-2">
            <h3
              className={`text-sm font-medium ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'
                }`}
            >
              Transcription {isShared && <span className="text-xs text-teal-500">(Shared)</span>}
            </h3>
            <p
              className={`w-full p-3 rounded-lg h-[80px] overflow-y-auto ${theme === 'light'
                ? 'bg-gray-50/20 text-neutral-800 border border-gray-200/30'
                : 'bg-slate-800/20 text-neutral-200 border border-slate-600/30'
                }`}
            >
              {transcription}
            </p>
          </div>
        )}
        {/* {aiContentHistory.length > 0 && (
          <div className="mb-2">
            <h3
              className={`text-sm font-medium ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'
                }`}
            > */}
              {/* Shared AI Content History
            </h3>
            <ul
              className={`w-full p-3 rounded-lg h-[80px] overflow-y-auto ${theme === 'light'
                ? 'bg-gray-50/20 text-neutral-800 border border-gray-200/30'
                : 'bg-slate-800/20 text-neutral-200 border border-slate-600/30'
                }`}
            >
              {aiContentHistory
                .filter((content) => content.isShared)
                .map((content) => (
                  <li key={content.id} className="mb-2">
                    <strong>{content.userId === currentUser?.id ? 'You' : 'Participant'}:</strong>{' '}
                    {content.prompt} <br />
                    <em>Response:</em> {content.response || 'Pending...'} <br />
                    <small>{new Date(content.createdAt).toLocaleTimeString()}</small>
                  </li>
                ))}
            </ul>
          </div>
        )} */}
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
                ? "bg-neutral-800 hover:bg-neutral-900 text-white"
                : "bg-neutral-950 hover:bg-black text-white"
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