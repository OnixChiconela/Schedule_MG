import { getCollabById } from "@/app/api/actions/collaboration/getCollabById";
import { getCollabChats } from "@/app/api/actions/collaboration/chat/getCollabChats";
import { getUsers } from "@/app/api/actions/user/getUsers";
import { useUser } from "@/app/context/UserContext"
import { useTheme } from "@/app/themeContext"
import { Users } from "@/app/types";
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { createCollabChat } from "@/app/api/actions/collaboration/chat/createCollabChat";
import { getCollabMembers } from "@/app/api/actions/collaboration/getCollabMembers";
import { ArrowLeft, Mic, Plus, Send, Settings } from "lucide-react";
import { summarizeChat } from "@/app/api/actions/collaboration/chat/summarizeChat";

type Message = {
    id: string;
    chatId: string;
    userId: string;
    content: string;
    timestamp: Date;
};

type PartnershipMembership = {
    userId: string;
    partnershipId: string;
    role: "OWNER" | "ADMIN" | "COLABORATOR" | "GUEST";
    joinedAt: Date;
};

type Chat = {
    id: string;
    name: string;
    partnershipId: string;
    visibleTo: string[];
    createdBy: string;
    messages: Message[];
}

type PartnershipDetails = {
    id: string;
    name: string; // Sem criptografia
    description: string;
    createdAt: Date;
    members: PartnershipMembership[];
};

const CollaborationChatView = ({ partnershipId }: { partnershipId: string }) => {
    const { theme } = useTheme()
    const { currentUser, userLoading } = useUser()
    const router = useRouter()
    const [chats, setChats] = useState<Chat[]>([])
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [showPermissionModal, setShowPermissionModal] = useState<string | null>(null)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [messageInput, setMessageInput] = useState("")
    const [isMobileChatListVisible, setIsMobileChatListVisible] = useState(true)
    const [partnershipUsers, setPartnershipUsers] = useState<Users[]>([])
    const [partnershipDetails, setPartnershipDetails] = useState<PartnershipDetails | null>(null)
    const [summary, setSummary] = useState<string | null>(null)
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<Socket | null>(null)
    const hasJoinedPartnership = useRef(false)

    const isAuthorized = partnershipDetails?.members.find((member) => member.userId === currentUser?.id)?.role === "OWNER"
        || partnershipDetails?.members.find((member) => member.userId === currentUser?.id)?.role === "ADMIN"
        || false

    //WS
    useEffect(() => {
        let isMounted = true
        if (userLoading || !currentUser || !isMounted) return

        const token = localStorage.getItem("access_token")
        if (!token) {
            toast.error("No authemtication token found. Make sure you're logged in", { duration: 300 })
            router.push("/my-space/auth/login")
            return
        }

        if (!socketRef.current || !socketRef.current.connected) {
            socketRef.current = io("http://localhost:8050/partnership/chat", {
                query: { userId: currentUser.id, token },
                transports: ["websocket"],
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 1000
            })
        }

        const socket = socketRef.current

        socket.on("connect", () => console.log("socket connected:", socket.id))
        socket.on("connect_error", (err) => {
            if (isMounted) {
                toast.error("Failed to connect to chat server", { duration: 3000 });
                console.error("WebSocket connection error:", err.message);
            }
        });
        socket.on("error", (err) => {
            if (isMounted) {
                toast.error(err.message || "Connection failed", { duration: 3000 });
                console.error("Socket error:", err);
            }
        });
        socket.on("joinedPartnership", (data) => {
            if (isMounted) {
                console.log(`Joined partnership: ${data.partnershipId}`);
            }
        });
        socket.on("receiveMessage", (message) => {
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === message.chatId
                        ? { ...chat, messages: [...chat.messages, { ...message, timestamp: new Date(message.createdAt) }] }
                        : chat
                )
            );
            if (message.chatId === selectedChatId) {
                setShouldScrollToBottom(true);
            }
        });

        if (!hasJoinedPartnership.current) {
            socket.emit("joinPartnership", { partnershipId, userId: currentUser.id })
            hasJoinedPartnership.current = true
        }

        return () => {
            isMounted = false
            socket.disconnect()
            socketRef.current = null
            hasJoinedPartnership.current = false
        }
    }, [currentUser?.id, partnershipId, router])

    useEffect(() => {
        let isMounted = true

        const loadData = async () => {
            if (userLoading || !currentUser || !isMounted) {
                toast.error("back")
                return
            }

            try {
                const users: Users[] = await getUsers()
                if (!users && isMounted) {
                    toast.error("Failed to load users", { duration: 3000 })
                    return
                }

                const details: PartnershipDetails = await getCollabById(partnershipId)
                if (!details && isMounted) {
                    toast.error("Failed to load partnership details", { duration: 3000 })
                    return
                }

                toast.success("here")
                const members = await getCollabMembers(partnershipId)
                
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
                            joinedAt: new Date(member.joinedAt)
                        }))
                    })
                }
                toast.success("here---1")
                
                if (members && isMounted) {
                    const memberIds = members.map((member: PartnershipMembership) => member.userId)
                    const filteredUsers = users.filter((user: Users) => memberIds.includes(user.id))
                    setPartnershipUsers(filteredUsers)
                }
                
                toast.success("here---22")
                const chatsRes = await getCollabChats(partnershipId)
                console.log("chat", chatsRes)
                if (chatsRes && isMounted) {
                    setChats(
                        chatsRes.map((chat: Chat) => ({
                            id: chat.id,
                            name: chat.name,
                            partnershipId: chat.partnershipId,
                            visibleTo: chat.visibleTo || [],
                            createdBy: chat.createdBy || "",
                            messages: (chat.messages || []).map((msg: Message) => ({
                                ...msg,
                                timestamp: new Date(msg.timestamp),
                            })),
                        }))
                    )
                } else if (isMounted) {
                    toast.error("Failed to load chats", { duration: 3000 })
                }
            } catch (err) {
                if (isMounted) {
                    toast.error("An unexpected error occurred", { duration: 3000 });
                    console.error(err);
                }
            }
        }
        loadData()

        return () => {
            isMounted = false
        }
    }, [partnershipId, currentUser?.id])

    const visibleChats = chats.filter((chat) =>
        chat.visibleTo.includes(currentUser?.id || "") ||
        (partnershipDetails?.members.find((member) => member.userId == currentUser?.id)?.role == "OWNER" ||
            partnershipDetails?.members.find((member) => member.userId == currentUser?.id)?.role == "ADMIN")
    )

    const createChat = async () => {
        if (!currentUser) {
            toast.error("Cannot create chat: user not authenticated", {
                duration: 3000
            })
            return
        }
        const data = {
            partnershipId,
            userId: currentUser.id,
            name: `Chat ${chats.length + 1}`,
            visibleTo: [currentUser.id]
        }
        try {
            const res = await createCollabChat(data)
            toast.success("Chat created successfully", { duration: 4000 })
        } catch (error) {
            toast.error("Failded to create chat", { duration: 3000 })
            console.error(error)
        }

    }

    const updateChatPermissions = (chatId: string) => {
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId ? { ...chat, visibleTo: selectedUsers } : chat)
        )
        setShowPermissionModal(null);
        setSelectedUsers([])
        toast.success("Chat permission updated successfully", { duration: 3000 })
    }

    //send m
    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedChatId || !currentUser) {
            toast.error("Cannot send message: missing required data", { duration: 3000 })
            return
        }

        try {
            socketRef.current?.emit("sendMessage", {
                chatId: selectedChatId,
                content: messageInput,
                userId: currentUser.id,
                partnershipId
            })
            setMessageInput("")
            toast.success("Message sent successfyllu", { duration: 3000 })
        } catch (error) {
            toast.error("Failed to send message", { duration: 3000 })
            console.log(error)
        }
    }

    //summarize the last 200 messages with AI
    const summarize = async () => {
        if (!selectedChatId || !currentUser) {
            toast.error("Cannot summarize: no chat selected or user not authenticated", { duration: 3000 })
            return
        }

        try {
            const selectedChat = chats.find((chat) => chat.id === selectedChatId)
            if (!selectedChat || selectedChat.messages.length === 0) {
                toast.error("No messages to summarize", { duration: 3000 });
                return;
            }
            const messageToSummarize = selectedChat.messages
                .slice(-200)
                .map((message) => ({
                    userId: message.userId,
                    content: message.content,
                    timestamp: message.timestamp
                }))

            const res = await summarizeChat()
            setSummary(res)
            toast.success("You're summarized chat", { duration: 3000 })
        } catch (error) {
            toast.error("Failed to summarize chat", { duration: 3000 });
            console.error(error);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const selectedChat = chats.find((chat) => chat.id === selectedChatId);

    useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [selectedChat?.messages, shouldScrollToBottom]);

    console.log(selectedChat?.messages)
    console.log(chats.map((ct) => ct.messages))

    return (
        <div
            className={`p-4 ${theme === "light" ? "bg-white text-neutral-800" : "bg-slate-900 text-neutral-200"} h-[100vh]`}
        >
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                Partnership Chats
                {selectedChat && (
                    <button
                        onClick={summarizeChat}
                        className={`px-3 py-1 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        Summarize Chat
                    </button>
                )}
            </h2>
            <div className="flex flex-col md:flex-row h-[calc(100%-2rem)]">
                <div
                    className={`${selectedChatId && !isMobileChatListVisible ? "hidden md:block" : "block"} w-full md:w-1/3 lg:w-1/4 p-2 border-r ${theme === "light" ? "border-gray-200" : "border-blue-700"} overflow-auto`}
                >
                    {isAuthorized && (
                        <button
                            onClick={createChat}
                            className={`flex items-center gap-2 p-2 mb-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-neutral-950 hover:bg-black"}`}
                        >
                            <Plus size={18} />
                            New Chat
                        </button>
                    )}
                    <ul className="space-y-2">
                        {visibleChats.map((chat) => (
                            <li key={chat.id} className="flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        setSelectedChatId(chat.id);
                                        setIsMobileChatListVisible(false);
                                    }}
                                    className={`w-full text-left p-2 rounded ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-blue-700"} ${selectedChatId === chat.id ? (theme === "light" ? "bg-gray-100" : "bg-blue-800") : ""}`}
                                >
                                    {chat.name}
                                </button>
                                {isAuthorized && (
                                    <button
                                        onClick={() => {
                                            setShowPermissionModal(chat.id);
                                            setSelectedUsers([...chat.visibleTo]);
                                        }}
                                        className={`p-1 rounded ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-blue-700"}`}
                                    >
                                        <Settings size={14} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div
                    className={`${selectedChatId && !isMobileChatListVisible ? "block" : "hidden md:block"} w-full md:w-2/3 lg:w-3/4 flex flex-col relative h-full`}
                >
                    {selectedChat ? (
                        <div className="flex flex-col h-full">
                            <div className="flex items-center mb-2 p-4">
                                <button
                                    onClick={() => setIsMobileChatListVisible(true)}
                                    className={`md:hidden mr-2 p-2 rounded ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-blue-600"}`}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h3 className="text-lg font-medium">{selectedChat.name}</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {selectedChat.messages.map((message) => {
                                    const isCurrentUser = message.userId === currentUser?.id;
                                    return (
                                        <p
                                            key={message.id}
                                            className={`p-2 mb-2 rounded ${theme === "light" ? (isCurrentUser ? "bg-blue-100 ml-auto" : "bg-gray-100") : (isCurrentUser ? "bg-blue-500 ml-auto" : "bg-blue-700")} max-w-[70%] ${isCurrentUser ? "text-right" : "text-left"}`}
                                        >
                                            {message.content}
                                        </p>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="relative p-4">
                                <div className="absolute bottom-0 left-4 right-0 flex items-center gap-2">
                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className={`flex-1 p-2 rounded ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-blue-700 border-blue-200"} resize-none h-12`}
                                        placeholder="Type a message..."
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className={`p-2 rounded ${theme === "light" ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700"}`}
                                    >
                                        <Send size={20} />
                                    </button>
                                    <button
                                        className={`p-2 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
                                    >
                                        <Mic size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full p-4">
                            <p className="text-center text-gray-400">Select a chat to start messaging.</p>
                        </div>
                    )}
                </div>
            </div>

            {showPermissionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className={`w-80 rounded-lg p-4 ${theme === "light" ? "bg-white text-black" : "bg-blue-900 text-white"}`}
                    >
                        <h3 className="text-lg font-semibold mb-4">Manage Chat Permissions</h3>
                        <div className="space-y-2 mb-4">
                            {partnershipUsers.map((user) => (
                                <div key={user.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUsers((prev) => [...prev, user.id]);
                                            } else {
                                                setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <label>{`${user.firstName} ${user.lastName}`}</label>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowPermissionModal(null)}
                                className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateChatPermissions(showPermissionModal)}
                                className={`px-3 py-1 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {summary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className={`w-96 p-4 rounded ${theme === "light" ? "bg-white text-gray-900" : "bg-blue-900 text-white"}`}
                    >
                        <h3 className="text-lg font-semibold mb-4">Chat Summary</h3>
                        <p className="mb-4">{summary}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setSummary(null)}
                                className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CollaborationChatView