'use client';

import { useUser } from '@/app/context/UserContext';
import { useTheme } from '@/app/themeContext';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Peer from 'simple-peer';
import CreateCallModal from './modals/CreateCallModal';
import JoinCallModal from './modals/JoinCallModal';
import toast from 'react-hot-toast';
import { useNotifications } from '@/app/context/NotificationContext';
import AICallModal from './modals/AiCallModal';
import { PartnershipDetails } from '../CollaborationChatView';
import { getCollabById } from '@/app/api/actions/collaboration/getCollabById';
import { getCollabMembers } from '@/app/api/actions/collaboration/getCollabMembers';
import { transcribeAndGenerate } from '@/app/api/actions/collaboration/video-call/transcribeAndGenerate';
import { checkAIUsage } from '@/app/api/actions/AI/checkAIUsage';
import { callAITextOnly, processAudioWithAI } from '@/app/api/actions/collaboration/video-call/processAudioWithAI';

interface VideoCallViewProps {
    partnershipId: string;
}

interface PeerConnection {
    peer: Peer.Instance;
    userId: string;
    stream: MediaStream | null;
}

interface JoinCallData {
    callId: string;
    title: string;
}

type PartnershipMembership = {
    userId: string;
    partnershipId: string;
    role: "OWNER" | "ADMIN" | "COLABORATOR" | "GUEST";
    joinedAt: Date;
};

export default function CollaborationVideoCallView({ partnershipId }: VideoCallViewProps) {
    const { theme } = useTheme();
    const { currentUser } = useUser();
    const { videoSocket, notifSocket, newCallData } = useNotifications();
    const [partnershipDetails, setPartnershipDetails] = useState<PartnershipDetails | null>(null)

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<PeerConnection[]>([]);
    const [callId, setCallId] = useState<string | null>(null);
    const [micEnabled, setMicEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>('initializing');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const isMediaSetup = useRef(false);
    const userId = currentUser?.id || '';
    const [showCreateCallModal, setShowCreateCallModal] = useState(false);
    const [showJoinCallModal, setShowJoinCallModal] = useState<JoinCallData | null>(null);
    const lastSignalTimes = useRef<Map<string, number>>(new Map());
    const pendingPeers = useRef<Set<string>>(new Set());
    const isCreatorRef = useRef<boolean>(false);

    const isAuthorized = partnershipDetails?.members.find((member) => member.userId === currentUser?.id)?.role === "OWNER"
        || partnershipDetails?.members.find((member) => member.userId === currentUser?.id)?.role === "ADMIN"
        || partnershipDetails?.members.find((member) => member.userId === currentUser?.id)?.role === "COLABORATOR"
        || false

    useEffect(() => {
        console.log(`[VideoCallView] Mounted: userId=${userId}, partnershipId=${partnershipId}, videoSocketConnected=${videoSocket?.connected}`);
        if (videoSocket) {
            console.log(`[Socket] Initial videoSocket state: id=${videoSocket.id}, connected=${videoSocket.connected}`);
        }
    }, [userId, partnershipId, videoSocket]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!currentUser || !isMounted) return;

            try {

                const details: PartnershipDetails = await getCollabById(partnershipId);
                if (!details && isMounted) {
                    toast.error("Failed to load partnership details", { duration: 3000 });
                    return;
                }

                const members = await getCollabMembers(partnershipId);

                if (isMounted) {
                    setPartnershipDetails({
                        id: details.id,
                        name: details.name,
                        description: details.description || "",
                        createdAt: new Date(details.createdAt),
                        members: members.map((member: PartnershipMembership) => ({
                            userId: member.userId,
                            partnershipId: member.partnershipId,
                            role: member.role,
                            joinedAt: new Date(member.joinedAt),
                        })),
                    });
                }

            } catch (err) {
                if (isMounted) {
                    // toast.error("An unexpected error occurred", { duration: 3000 });
                    console.error(err);
                }
            }
        };
        loadData();

        return () => {
            isMounted = false;
        };
    }, [partnershipId, currentUser?.id]);


    const stopMediaStream = (stream: MediaStream | null) => {
        if (stream) {
            stream.getTracks().forEach((track) => {
                if (track.readyState === 'live') {
                    track.stop();
                    console.log(`[Media] Track ${track.kind} stopped for userId=${userId}`);
                }
            });
            setLocalStream(null);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
                console.log(`[Media] Cleared video srcObject for userId=${userId}`);
            }
        }
    };

    const isPrivateBrowsingRef = useRef<boolean>(false);

    const setupMedia = async () => {
        if (isMediaSetup.current) {
            console.log(`[Media] setupMedia skipped: already setup for userId=${userId}`);
            return;
        }
        isMediaSetup.current = true;

        try {
            await navigator.storage.estimate(); // May throw in private browsing
        } catch {
            isPrivateBrowsingRef.current = true;
            console.warn(`[Media] Private browsing detected for userId=${userId}`);
            toast("Private browsing may restrict camera/microphone access. Allow permissions in settings.", {
                duration: 5000,
            });
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setMediaError('Your browser does not support video calls');
            toast.error('Browser does not support video calls');
            isMediaSetup.current = false;
            setConnectionStatus('error');
            return;
        }

        try {
            console.log(`[Media] Requesting media stream for userId=${userId}`);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const videoTracks = stream.getVideoTracks();
            console.log(`[Media] Stream acquired for userId=${userId}, video tracks: ${videoTracks.length}, state: ${videoTracks[0]?.readyState}, enabled: ${videoTracks[0]?.enabled}`);
            setLocalStream(stream);
            setMediaError(null);
            setConnectionStatus('connected');
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch((err) => {
                    console.error(`[Media] Failed to play video on setup for userId=${userId}:`, err);
                    toast.error('Failed to play video stream');
                    setConnectionStatus('error');
                });
            }
        } catch (err: any) {
            let errorMessage = 'Failed to access camera/microphone';
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Camera/microphone access denied. Please allow access in browser settings.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'No camera or microphone found. Please connect a device.';
            } else if (err.name === 'NotReadableError' || err.message.includes('Failed to allocate videosource')) {
                errorMessage = 'Camera/microphone is in use by another application. Please close other apps.';
            }
            setMediaError(errorMessage);
            console.error(`[Media] Failed to get local stream for userId=${userId}:`, err);
            // toast.error(errorMessage);
            isMediaSetup.current = false;
            setConnectionStatus('error');
        }
    };

    const createPeer = useCallback((joinedUserId: string, initiator: boolean) => {
        if (!localStream || !callId || !videoSocket) {
            console.log(`[Peer] Cannot create peer for ${joinedUserId}: localStream=${!!localStream}, callId=${callId}, videoSocketConnected=${videoSocket?.connected}`);
            return null;
        }
        if (pendingPeers.current.has(joinedUserId)) {
            console.log(`[Peer] Skipping peer creation for ${joinedUserId}: already pending`);
            return null;
        }
        pendingPeers.current.add(joinedUserId);
        console.log(`[Peer] Creating peer connection for ${joinedUserId}, initiator=${initiator}`);
        const peer = new Peer({
            initiator,
            stream: localStream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    // Replace with real TURN server
                    // {
                    //     urls: 'turn:your-turn-server.com:3478',
                    //     username: 'your-username',
                    //     credential: 'your-password'
                    // }
                ],
            },
        });
        let signalingState: string = initiator ? "stable" : "stable";
        peer.on('signal', (data) => {
            const now = Date.now();
            const lastSignal = lastSignalTimes.current.get(joinedUserId) || 0;
            if (now - lastSignal > 50) {
                console.log(`[Peer] Sending signal to ${joinedUserId} from ${userId}`);
                videoSocket.emit('signal', { to: joinedUserId, from: userId, data });
                lastSignalTimes.current.set(joinedUserId, now);

                if (data.type == "offer") signalingState = "have-local-offer"
                else if (data.type == "answer") signalingState = "stable"
            }
        });

        peer.on('stream', (stream) => {
            console.log(`[Peer] Received stream from ${joinedUserId}, tracks: ${stream.getTracks().length}`);

            if (!stream.getAudioTracks().length) {
                console.warn(`[Peer] No audio track in stram from ${joinedUserId}`)
            }
            setPeers((prev) => {
                const existing = prev.find((p) => p.userId === joinedUserId);
                if (existing) {
                    console.log(`[Peer] Updating stream for existing peer ${joinedUserId}`);
                    return prev.map((p) => (p.userId === joinedUserId ? { ...p, stream } : p));
                }
                return [...prev, { peer, userId: joinedUserId, stream }];
            });
            pendingPeers.current.delete(joinedUserId);
            setConnectionStatus('connected');
        });

        peer.on('error', (err) => {
            console.error(`[Peer] Error for ${joinedUserId}:`, err);
            // toast.error(`Connection error with user ${joinedUserId}`);
            setPeers((prev) => prev.filter((p) => p.userId !== joinedUserId));
            pendingPeers.current.delete(joinedUserId);
            setConnectionStatus('error');
        });

        peer.on('iceStateChange', (iceConnectionState) => {
            console.log(`[Peer] ICE state for ${joinedUserId}: ${iceConnectionState}`);
            setConnectionStatus(iceConnectionState);
            if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected') {
                toast.error(`Connection failed with user ${joinedUserId}`);
                setPeers((prev) => {
                    const peerConn = prev.find((p) => p.userId === joinedUserId);
                    if (peerConn) peerConn.peer.destroy();
                    return prev.filter((p) => p.userId !== joinedUserId);
                });
                pendingPeers.current.delete(joinedUserId);
            }
        });

        //Signaling state check
        peer.signal = ((originalSignal) => {
            return function (data: any) {
                if (data.type === "offer" && signalingState !== "stable") {
                    console.warn(`[Peer] Ignoring offer for ${joinedUserId}: state=${signalingState}`);
                    return;
                }
                if (data.type === "answer" && signalingState !== "have-local-offer") {
                    console.warn(`[Peer] Ignoring answer for ${joinedUserId}: state=${signalingState}`);
                    return;
                }
                originalSignal.call(peer, data);
                if (data.type === "offer") signalingState = "have-remote-offer";
                else if (data.type === "answer") signalingState = "stable";
            };
        })(peer.signal);

        return peer;
    }, [localStream, callId, videoSocket, userId]);

    useEffect(() => {
        if (currentUser?.id) {
            setupMedia();
        }
        return () => {
            console.log(`[Media] Cleanup: userId=${userId}`);
            stopMediaStream(localStream);
            peers.forEach((p) => p.peer.destroy());
            setPeers([]);
            pendingPeers.current.clear();
            setConnectionStatus('disconnected');
        };
    }, [currentUser?.id]);

    useEffect(() => {
        console.log(`[Video] Updating video srcObject: userId=${userId}, localStream=${!!localStream}, videoEnabled=${videoEnabled}, callId=${callId}`);
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            if (videoEnabled) {
                localVideoRef.current.play().catch((err) => {
                    console.error(`[Media] Failed to play video for userId=${userId}:`, err);
                    toast.error('Failed to play video stream');
                    setConnectionStatus('error');
                });
            } else {
                localVideoRef.current.pause();
                console.log(`[Media] Video paused due to videoEnabled=false for userId=${userId}`);
            }
        } else if (localVideoRef.current && !localStream) {
            localVideoRef.current.srcObject = null;
            console.log(`[Media] Video srcObject cleared for userId=${userId}`);
        }
    }, [localStream, videoEnabled, callId, userId]);

    useEffect(() => {
        if (!currentUser?.id || !videoSocket || !notifSocket) {
            console.error(`[Socket] Invalid setup: userId=${currentUser?.id}, videoSocket=${!!videoSocket}, notifSocket=${!!notifSocket}`);
            toast.error('Please log in to access video calls');
            setConnectionStatus('error');
            return;
        }

        console.log(`[Socket] Setting up listeners: videoSocketConnected=${videoSocket.connected}, notifSocketConnected=${notifSocket.connected}, socketId=${videoSocket.id}`);

        const handleConnect = () => {
            console.log(`[Socket] videoSocket connected: userId=${userId}, socketId=${videoSocket.id}`);
            videoSocket.emit('join', userId);
            if (callId) {
                console.log(`[Socket] Re-joining call: callId=${callId}, userId=${userId}`);
                videoSocket.emit('join-room', { callId });
            }
        };

        const handleUserJoined = ({ userId: joinedUserId }: { userId: string }) => {
            console.log(`[Socket] User ${joinedUserId} joined, callId=${callId}, localStream=${!!localStream}, peersCount=${peers.length}`);
            if (joinedUserId !== userId && localStream && callId) {
                setPeers((prev) => {
                    if (prev.find((p) => p.userId === joinedUserId)) {
                        console.log(`[Peer] Peer for ${joinedUserId} already exists, skipping`);
                        return prev;
                    }
                    const peer = createPeer(joinedUserId, true);
                    return peer ? [...prev, { peer, userId: joinedUserId, stream: null }] : prev;
                });
                setConnectionStatus('connecting');
            }
        };

        const handleSignal = ({ from, data }: { from: string; data: any }) => {
            console.log(`[Socket] Received signal from ${from} with data:`, data);
            setPeers((prev) => {
                const existingPeer = prev.find((peer) => peer.userId === from);
                if (existingPeer && !existingPeer.peer.destroyed) {
                    console.log(`[Peer] Signaling existing peer for ${from}, type=${data.type}`);
                    existingPeer.peer.signal(data);
                    return prev;
                }
                if (localStream && callId && !pendingPeers.current.has(from)) {
                    console.log(`[Peer] Creating peer for incoming signal from ${from}`);
                    const peer = createPeer(from, false);
                    if (peer) {
                        peer.signal(data);
                        return [...prev, { peer, userId: from, stream: null }];
                    }
                }
                return prev;
            });
            setConnectionStatus("connecting");
        };

        const handleUserLeft = ({ userId: leftUserId }: { userId: string }) => {
            console.log(`[Socket] User ${leftUserId} left callId=${callId}`);
            setPeers((prev) => {
                const peer = prev.find((p) => p.userId === leftUserId);
                if (peer) {
                    peer.peer.destroy();
                    console.log(`[Peer] Destroyed peer for ${leftUserId}`);
                }
                return prev.filter((p) => p.userId !== leftUserId);
            });
            pendingPeers.current.delete(leftUserId);
            setConnectionStatus(peers.length > 0 ? 'connected' : 'waiting');
        };

        const handleCallCreated = ({ callId: newCallId, title, partnershipId: pid, createdById }: { callId: string; title: string; partnershipId: string; createdById: string }) => {
            console.log(`[Socket] Received call-created: callId=${newCallId}, pid=${pid}, userId=${userId}, createdById=${createdById}`);
            if (pid === partnershipId && !callId && !isCreatorRef.current) {
                setShowCreateCallModal(false);
                setShowJoinCallModal({ callId: newCallId, title });
                toast.success(`New call available: ${title}`);
            }
        };

        const handleCallEnded = ({ callId: endedCallId }: { callId: string }) => {
            console.log(`[Socket] Received call-ended: callId=${endedCallId}, userId=${userId}`);
            if (endedCallId === callId) {
                setCallId(null);
                peers.forEach((p) => p.peer.destroy());
                setPeers([]);
                stopMediaStream(localStream);
                isMediaSetup.current = false;
                setConnectionStatus('disconnected');
                toast.success('Call ended');
            }
        };

        videoSocket.on('connect', handleConnect);
        videoSocket.on('user-joined', handleUserJoined);
        videoSocket.on('signal', handleSignal);
        videoSocket.on('user-left', handleUserLeft);
        videoSocket.on('call-created', handleCallCreated); // Use videoSocket
        videoSocket.on('call-ended', handleCallEnded); // Use videoSocket
        videoSocket.on('connect_error', (err) => {
            console.error(`[Socket] videoSocket connect_error for userId=${userId}:`, err);
            // toast.error(`Video call connection error: ${err.message}`);
            setConnectionStatus('error');
        });
        videoSocket.on('error', (data) => {
            console.error(`[Socket] videoSocket error for userId=${userId}:`, data.message);
            // toast.error(`Video call error: ${data.message}`);
            setConnectionStatus('error');
        });

        return () => {
            console.log(`[Socket] Cleanup listeners: userId=${userId}`);
            videoSocket.off('connect', handleConnect);
            videoSocket.off('user-joined', handleUserJoined);
            videoSocket.off('signal', handleSignal);
            videoSocket.off('user-left', handleUserLeft);
            videoSocket.off('call-created', handleCallCreated);
            videoSocket.off('call-ended', handleCallEnded);
        };
    }, [userId, partnershipId, currentUser?.id, videoSocket, callId, localStream]);

    useEffect(() => {
        console.log(`[Notification] newCallData updated:`, newCallData);
        if (newCallData && newCallData.partnershipId === partnershipId && !callId && !isCreatorRef.current) {
            console.log(`[Socket] Showing call ${newCallData.callId} modal for ${userId}`);
            setShowJoinCallModal({ callId: newCallData.callId, title: newCallData.title });
            toast.success(`New call available: ${newCallData.title}`);
        } else if (newCallData) {
            console.log(`[Network] ${newCallData.title} ignored for userId=${userId}`);
        }
    }, [newCallData, partnershipId, currentUser?.id, callId, userId]);

    const toggleMic = () => {
        if (localStream) {
            const enabled = !micEnabled;
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
                console.log(`[Media] Microphone ${enabled ? 'enabled' : 'disabled'} for ${userId}`);
            });
            setMicEnabled(enabled);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const enabled = !videoEnabled;
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
                console.log(`[Media] Video track ${enabled ? 'enabled' : 'disabled'} for ${userId}`);
            });
            setVideoEnabled(enabled);
            if (enabled && localVideoRef.current) {
                localVideoRef.current.play().catch((err) => {
                    console.error(`[Media] Failed to play video after toggle for ${userId}:`, err);
                    toast.error('Failed to play video stream');
                    setConnectionStatus('error');
                });
            }
        } else {
            console.log(`[Media] toggleVideo failed: no localStream for ${userId}`);
            toast.error('Camera not available. Try restarting the call.');
            setConnectionStatus('error');
        }
    };

    const endCall = () => {
        if (callId && videoSocket) {
            console.log(`[Call] Ending call: callId=${callId}, userId=${userId}`);
            videoSocket.emit('end-room', { callId });
            peers.forEach((p) => p.peer.destroy());
            setPeers([]);
            stopMediaStream(localStream);
            isMediaSetup.current = false;
            setCallId(null);
            isCreatorRef.current = false; // Reset creator status
            setConnectionStatus('disconnected');
            toast.success('Call ended');
        }
    };

    const createCall = (title: string) => {
        if (videoSocket && !callId) {
            console.log(`[Call] Creating call: title=${title}, userId=${userId}, partnershipId=${partnershipId}`);
            isCreatorRef.current = true;
            videoSocket.emit('create-room', { partnershipId, title, createdById: userId }, ({ callId }: { callId: string }) => {
                console.log(`[Call] Created call: callId=${callId}, userId=${userId}`);
                setCallId(callId);
                videoSocket.emit('join-room', { callId });
                setShowCreateCallModal(false);
                setConnectionStatus('waiting');
                toast.success(`Call created: ${title}`);
            });
        } else if (callId) {
            console.log(`[Call] Already in call: callId=${callId}, userId=${userId}`);
            toast.error('Already in a call');
        } else {
            console.error(`[Call] Not connected to video call server for userId=${userId}`);
            // toast.error('Not connected to video call server');
            setConnectionStatus('error');
        }
    };

    const joinCall = (callId: string) => {
        if (videoSocket) {
            console.log(`[Call] Attempting to join call: callId=${callId}, userId=${userId}`);
            setCallId(callId);
            setConnectionStatus('connecting');
            videoSocket.emit('join-room', { callId }, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    console.log(`[Call] Successfully joined call: callId=${callId}, userId=${userId}`);
                    setShowJoinCallModal(null);
                    setConnectionStatus('waiting');
                    setupMedia();
                    toast.success('Joined call');
                } else {
                    console.error(`[Call] Failed to join call: callId=${callId}, error=${response.error}`);
                    setCallId(null);
                    setConnectionStatus('error');
                    toast.error(`Failed to join call: ${response.error}`);
                }
            });
        } else {
            console.error(`[Call] Failed to join call: videoSocket not available for userId=${userId}`);
            toast.error('Failed to connect to call server');
            setConnectionStatus('error');
        }
    };

    const participantCount = (localStream ? 1 : 0) + peers.filter((p) => p.stream).length;
    const gridClass = participantCount === 1 ? 'grid-cols-1' :
        participantCount === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4';

    if (!currentUser?.id) {
        return <div className="h-full flex items-center justify-center text-gray-400">Please log in</div>;
    }

    const handleAICallSubmit = async (
        prompt: string,
        audioBlob?: Blob,
        transcription?: string
    ) => {

        if (!currentUser?.id) {
            toast.error("User not authenticated", {
                duration: 3000,
                style: {
                    background: theme === "light" ? "#fff" : "#1e293b",
                    color: theme === "light" ? "#1f2937" : "#f4f4f6",
                    border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
            });
            return null;
        }

        if (!prompt.trim()) {
            toast.error("Prompt cannot be empty", {
                duration: 3000,
                style: {
                    background: theme === "light" ? "#fff" : "#1e293b",
                    color: theme === "light" ? "#1f2937" : "#f4f4f6",
                    border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
            });
            return null;
        }

        const canUse = await checkAIUsage(currentUser.id)
        if (!canUse) {
            console.error("[AICall] Daily AI usage limit reached");
            toast.error("Daily AI usage limit reached", {
                duration: 3000,
                style: {
                    background: theme === "light" ? "#fff" : "#1e293b",
                    color: theme === "light" ? "#1f2937" : "#f4f4f6",
                    border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
            });
            return null;
        }
        toast.success("Here")
        console.log(`[AiCall] Prompt: ${prompt}, Audio Blob:`, audioBlob, `Transcription: ${transcription}`)
        try {
            const fullPrompt = transcription ? `${prompt} (Context): ${transcription}` : prompt;

            let res;
            if (audioBlob) {
                // Chamada com audio: usa multipart/form-data
                res = await processAudioWithAI("generate", audioBlob, currentUser.id, {
                    prompt: fullPrompt,
                    transcription,
                });
            } else {
                // Chamada sem audio: usa JSON
                res = await callAITextOnly("generate", {
                    prompt: fullPrompt,
                    userId: currentUser.id,
                });
            }

            if (!res?.text) {
                throw new Error("No response received");
            }

            return res.text;
        } catch (error: any) {
            console.error("[AICall] Failed to process prompt:", error);
            toast.error("Failed to get AI response", { /* ... estilo omitido */ });
            return null;
        }
    }

    if (mediaError) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <p className="mb-4">{mediaError}</p>
                <div className="flex gap-4">
                    <button
                        onClick={setupMedia}
                        className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white' : 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white'}`}
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => {
                            setMediaError(null);
                            setLocalStream(null);
                            isMediaSetup.current = false;
                            setConnectionStatus('pending');
                        }}
                        className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                    >
                        Continue Without Media
                    </button>
                </div>
            </div>
        );
    }

    const stablePeerStream = useMemo(() => {
        const validPeer = peers.find((p) => p.userId !== userId && p.stream && p.stream?.getAudioTracks().length > 0)
        return validPeer ? validPeer.stream : null
    }, [peers, userId])

    const PeerVideo = ({ stream, userId }: { stream: MediaStream | null; userId: string }) => {
        const videoRef = useRef<HTMLVideoElement>(null);

        useEffect(() => {
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;

                const play = async () => {
                    try {
                        await videoRef.current?.play();
                    } catch (err) {
                        console.error(`[Peer] Failed to play video for ${userId}:`, err);
                    }
                };

                play();
            }
        }, [stream]);

        return (
            <video
                ref={videoRef}
                data-user-id={userId}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg"
            />
        );
    };

    return (
        <div
            className={`h-full p-1 md:p-4 ${theme === "light" ? "bg-white text-gray-800" : "bg-gray-900 text-gray-200"
                }`}
        >
            {mediaError && (
                <div className="text-red-500 p-4 text-center">{mediaError}</div>
            )}
            {!callId ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-400 mb-4">No active call</p>
                    <button
                        onClick={() => setShowCreateCallModal(true)}
                        className={`px-4 py-2 rounded-lg ${theme === "light"
                            ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
                            : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                            }`}
                    >
                        Start Call
                    </button>
                </div>
            ) : (
                <div className="h-full">
                    <div className="mb-4 text-center">
                        <p
                            className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"
                                }`}
                        >
                            {connectionStatus === "connected" && participantCount > 1
                                ? `Connected: ${participantCount} participants`
                                : connectionStatus === "connecting"
                                    ? "Connecting to call..."
                                    : connectionStatus === "error"
                                        ? "Connection error. Please try again."
                                        : "Waiting for others to join..."}
                        </p>
                    </div>
                    <div className={`grid ${gridClass} gap-4 h-[calc(100%-2rem)]`}>
                        {localStream && (
                            <div className="relative h-full">
                                {videoEnabled ? (
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                            console.error(`[Media] Local video error for userId=${userId}:`, e);
                                            toast.error("Failed to play local video stream");
                                            setConnectionStatus("error");
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 rounded-lg">
                                        <p>Video Disabled</p>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <button
                                        onClick={toggleMic}
                                        disabled={!localStream}
                                        className={`p-2 rounded-full ${!localStream ? "opacity-50 cursor-not-allowed" : ""
                                            } ${theme === "light"
                                                ? "bg-gray-200 text-gray-800"
                                                : "bg-gray-700 text-gray-200"
                                            }`}
                                    >
                                        {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                                    </button>
                                    <button
                                        onClick={toggleVideo}
                                        disabled={!localStream}
                                        className={`p-2 rounded-full ${!localStream ? "opacity-50 cursor-not-allowed" : ""
                                            } ${theme === "light"
                                                ? "bg-gray-200 text-gray-800"
                                                : "bg-gray-700 text-gray-200"
                                            }`}
                                    >
                                        {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                                    </button>
                                    <button
                                        onClick={endCall}
                                        className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <PhoneOff size={20} />
                                    </button>
                                </div>
                                <p className="absolute top-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                    You ({userId})
                                </p>
                            </div>
                        )}
                        {peers.map((peer) => (
                            <div key={peer.userId} className="relative h-full">
                                {peer.stream ? (
                                    <PeerVideo key={peer.userId} stream={peer.stream} userId={peer.userId} />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 rounded-lg">
                                        <p>Waiting for {peer.userId}...</p>
                                    </div>
                                )}
                                <p className="absolute top-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                    User {peer.userId}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {showCreateCallModal && (
                <CreateCallModal
                    isOpen={showCreateCallModal}
                    onClose={() => setShowCreateCallModal(false)}
                    onCreate={createCall}
                    theme={theme}
                />
            )}
            {showJoinCallModal && (
                <JoinCallModal
                    isOpen={!!showJoinCallModal}
                    onClose={() => setShowJoinCallModal(null)}
                    onJoin={() => joinCall(showJoinCallModal.callId)}
                    title={showJoinCallModal.title}
                />
            )}
            {isAuthorized && (
                <AICallModal
                    isOpen={!!callId}
                    onClose={() => { }}
                    onSubmit={handleAICallSubmit}
                    peerStream={stablePeerStream}
                    localStream={localStream}
                />
            )}
        </div>
    );
}