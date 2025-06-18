"use client"
import { useUser } from "@/app/context/UserContext"
import { useTheme } from "@/app/themeContext"
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Peer from "simple-peer"
import { Socket } from "socket.io-client"
import CreateCallModal from "./modals/CreateCallModal"
import toast from "react-hot-toast"
import { useNotifications } from "@/app/context/NotificationContext"
import JoinCallModal from "./modals/JoinCallModal"

interface VideoCallViewProps {
    partnershipId: string
}
interface PeerConnection {
    peer: Peer.Instance
    userId: string
    stream: MediaStream
}

interface JoinCallData {
    callId: string;
    title: string;
}

export default function CollaborationVideoCallView({ partnershipId }: VideoCallViewProps) {
    const { theme } = useTheme()
    const { currentUser } = useUser()
    const { videoSocket, notifSocket, newCallData } = useNotifications();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [peers, setPeers] = useState<PeerConnection[]>([])
    const [callId, setCallId] = useState<string | null>(null)
    const [micEnabled, setMicEnabled] = useState(true)
    const [videoEnabled, setVideoEnabled] = useState(true)
    const [showCreateCallModal, setShowCreateCallModal] = useState(false)
    const [showJoinCallModal, setShowJoinCallModal] = useState<JoinCallData | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const isMediaSetup = useRef(false);
    const localVideoRef = useRef<HTMLVideoElement>(null)


    const userId = currentUser?.id

    const stopMediaStream = (stream: MediaStream | null) => {
        if (stream) {
            stream.getTracks().forEach((track) => {
                if (track.readyState === "live") {
                    track.stop();
                    console.log(`Track ${track.kind} stopped`);
                }
            });
            setLocalStream(null);
        }
    };

    const setupMedia = async () => {
        // Verifica suporte a getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setMediaError("Your browser does not support video calls");
            toast.error("Browser does not support video calls");
            isMediaSetup.current = false;
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setMediaError(null)
        } catch (err: any) {
            let errorMessage = "Failed to access camera/microphone";
            if (err.name === "NotAllowedError") {
                errorMessage = "Camera/microphone access denied. Please allow access in browser settings.";
            } else if (err.name === "NotFoundError") {
                errorMessage = "No camera or microphone found. Please connect a device.";
            } else if (err.name === "NotReadableError" || err.message.includes("Failed to allocate videosource")) {
                errorMessage = "Camera/microphone is in use by another application. Please close other apps.";
            }
            setMediaError(errorMessage);
            console.error("Failed to get local stream:", err);
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (!currentUser?.id || !videoSocket || !notifSocket) {
            toast.error("Please log in to access video calls");
            return;
        }

        // console.log(`Component mounted: userId=${userId}, partnershipId=${partnershipId}`);
        // console.log(`notifSocket state: connected=${notifSocket.connected}, id=${notifSocket.id}`);
        // setupMedia();

        // VideoGateway events
        videoSocket.on("user-joined", ({ userId: joinedUserId }) => {
            if (joinedUserId !== userId && localStream) {
                const peer = new Peer({ initiator: true, stream: localStream });
                peer.on("signal", (data) => {
                    videoSocket.emit("signal", { to: joinedUserId, from: userId, data });
                });
                peer.on("stream", (stream) => {
                    setPeers((prev) => [...prev, { peer, userId: joinedUserId, stream }]);
                });
                peer.on("error", (err) => console.error("Peer error:", err));
            }
        });

        videoSocket.on("signal", ({ from, data }) => {
            const existingPeer = peers.find((peer) => peer.userId === from);
            if (existingPeer) {
                existingPeer.peer.signal(data);
            } else if (localStream) {
                const peer = new Peer({ initiator: false, stream: localStream });
                peer.on("signal", (signalData) => {
                    videoSocket.emit("signal", { to: from, from: userId, data: signalData });
                });
                peer.on("stream", (stream) => {
                    setPeers((prev) => [...prev, { peer, userId: from, stream }]);
                });
                peer.signal(data);
            }
        });

        videoSocket.on("user-left", ({ userId: leftUserId }) => {
            setPeers((prev) => prev.filter((peer) => peer.userId !== leftUserId));
        });

        // NotificationGateway events
        notifSocket.on('call-created', ({ callId, title, partnershipId: pid }) => {
            console.log(`Received call-created: callId=${callId}, pid=${pid}, userId=${userId}`);
            if (pid === partnershipId) {
                setCallId(callId);
                videoSocket.emit('join-room', { callId });
                toast.success(`Joined call: ${title || 'Untitled'}`);
            }
        });

        // notifSocket.on("new-call", ({ callId, title, partnershipId: pid }) => {
        //     console.log(`Global new-call: callId=${callId}, pid=${pid}, userId=${localStorage.getItem('userId')}`);
        //     if (pid === partnershipId) {
        //         setShowJoinCallModal({ callId, title: title || "Untitled" });
        //     }
        // });

        notifSocket.on("call-ended", ({ callId: endedCallId }) => {
            if (endedCallId === callId) {
                setCallId(null);
                setPeers([]);
                localStream?.getTracks().forEach((track) => track.stop());
                setLocalStream(null);
                toast.success("Call ended");
            }
        });

        return () => {
            videoSocket.off("user-joined");
            videoSocket.off("signal");
            videoSocket.off("user-left");
            notifSocket.off("call-created");
            notifSocket.off("new-call");
            notifSocket.off("call-ended");
            localStream?.getTracks().forEach((track) => track.stop());
        };
    }, [currentUser?.id, videoSocket, notifSocket, partnershipId, userId, localStream]);

    const toggleMic = () => {
        if (localStream) {
            const enabled = !micEnabled;
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
                console.log(`Microphone ${enabled ? "enabled" : "disabled"}`);
            });
            setMicEnabled(enabled);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const enabled = !videoEnabled;
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
                console.log(`Video ${enabled ? "enabled" : "disabled"}`);
            });
            setVideoEnabled(enabled);
        }
    };

    const endCall = () => {
        if (callId && videoSocket) {
            videoSocket.emit("leave-room", callId);
            setCallId(null);
            setPeers([]);
            stopMediaStream(localStream);
            isMediaSetup.current = false;
            toast.success("You left the call");
        }
    };

    const createCall = (title: string) => {
        if (videoSocket) {
            videoSocket.emit("create-room", { partnershipId, title }, ({ callId }: { callId: string }) => {
                setCallId(callId);
                setShowCreateCallModal(false);
                toast.success(`Call created: ${title}`);
                console.log("chatt th")
            });
        } else {
            toast.error("Not connected to video call server");
        }
    };

    const joinCall = (callId: string) => {
        if (videoSocket) {
            videoSocket.emit("join-room", callId);
            setCallId(callId);
            setShowJoinCallModal(null);
            toast.success("Joined call");
        }
    };

    if (mediaError) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="mb-4">{mediaError}</p>
                <div className="flex gap-4">
                    <button
                        onClick={setupMedia}
                        className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white" : "bg-fuchsia-700 hover:bg-fuchsia-800 text-white"}`}
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => {
                            setMediaError(null);
                            setLocalStream(null);
                        }}
                        className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-gray-500 hover:bg-gray-600 text-white" : "bg-gray-700 hover:bg-gray-800 text-white"}`}
                    >
                        Continue Without Media
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full p-4 ${theme === "light" ? "bg-white" : "bg-slate-900"}`}>
            {!callId ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-400 mb-4">No active call</p>
                    <button
                        onClick={() => setShowCreateCallModal(true)}
                        className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white" : "bg-fuchsia-700 hover:bg-fuchsia-800 text-white"}`}
                    >
                        Start Call
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="relative h-full">
                        {localStream && videoEnabled ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center rounded-lg">
                                <p className="text-gray-400">Video disabled</p>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <button
                                onClick={toggleMic}
                                disabled={!localStream}
                                className={`p-2 rounded-full ${!localStream ? "opacity-50 cursor-not-allowed" : ""} ${theme === "light" ? "bg-gray-200" : "bg-gray-700"}`}
                            >
                                {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button
                                onClick={toggleVideo}
                                disabled={!localStream}
                                className={`p-2 rounded-full ${!localStream ? "opacity-50 cursor-not-allowed" : ""} ${theme === "light" ? "bg-gray-200" : "bg-gray-700"}`}
                            >
                                {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>
                            <button
                                onClick={endCall}
                                className="p-2 rounded-full bg-red-500 text-white"
                            >
                                <PhoneOff size={20} />
                            </button>
                        </div>
                    </div>
                    {peers.map((peer) => (
                        <div key={peer.userId} className="relative h-full">
                            <video
                                ref={(ref) => {
                                    if (ref) ref.srcObject = peer.stream;
                                }}
                                autoPlay
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <p className="absolute top-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                User {peer.userId}
                            </p>
                        </div>
                    ))}
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
        </div>
    );
}