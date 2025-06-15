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
import { ArrowLeft, Mic, Plus, Send, Settings, Sparkles, X } from "lucide-react";
import { summarizeChat } from "@/app/api/actions/collaboration/chat/summarizeChat";
import PermissionModal from "./modals/PermissionModal";
import SummaryModal from "./modals/SummaryModal";
import ChatActionModal from "./modals/ChatActionModal";
import { answerChat, createScheduledMessage } from "@/app/api/actions/collaboration/chat/AIChatActions";
import AnswerModal from "./modals/AnswerModal";
import MessageBubble from "./MessageBubble";
import { AnimatePresence, motion } from "framer-motion";

export type Message = {
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
    const [answer, setAnswer] = useState<string | null>(null)
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false)
    const [showActionModal, setShowActionModal] = useState(false);

    const [showCreateChatModal, setShowCreateChatModal] = useState(false);
    const [newChatName, setNewChatName] = useState("");

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

        socket.on("newChat", (newChat) => {
            if (isMounted) {
                setChats((prev) => [
                    ...prev,
                    {
                        id: newChat.id,
                        name: newChat.name,
                        partnershipId: newChat.partnershipId,
                        visibleTo: newChat.visibleTo || [],
                        createdBy: newChat.createdBy || "",
                        messages: [],
                    },
                ]);
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

                if (members && isMounted) {
                    const memberIds = members.map((member: PartnershipMembership) => member.userId)
                    const filteredUsers = users.filter((user: Users) => memberIds.includes(user.id))
                    setPartnershipUsers(filteredUsers)
                }

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
            toast.error("Cannot create chat: user not authenticated", { duration: 3000 });
            return;
        }
        if (!newChatName.trim()) {
            toast.error("Chat name is required", { duration: 3000 });
            return;
        }

        const data = {
            partnershipId,
            userId: currentUser.id,
            name: newChatName,
            visibleTo: [currentUser.id],
        };

        try {
            const res = await createCollabChat(data);
            setChats((prev) => [
                ...prev,
                {
                    id: res.id,
                    name: res.name,
                    partnershipId: res.partnershipId,
                    visibleTo: res.visibleTo || [],
                    createdBy: res.createdBy || currentUser.id,
                    messages: [],
                },
            ]);
            setSelectedChatId(res.id);
            setShowCreateChatModal(false);
            setNewChatName("");
            socketRef.current?.emit("createChat", { data }); // Notificar outros clientes
            toast.success("Chat created successfully", { duration: 4000 });
        } catch (error) {
            toast.error("Failed to create chat", { duration: 3000 });
            console.error("Error creating chat:", error);
        }
    };

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
    const sendMessage = async (content: string) => {
        if (!content.trim() || !selectedChatId || !currentUser) {
            toast.error("Cannot send message: missing required data", { duration: 3000 })
            return
        }

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            chatId: selectedChatId,
            userId: currentUser.id,
            content,
            timestamp: new Date(),
        };

        // Atualização otimista
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === selectedChatId
                    ? { ...chat, messages: [...chat.messages, tempMessage] }
                    : chat
            )
        );
        setShouldScrollToBottom(true);
        setMessageInput("");


        try {
            socketRef.current?.emit("sendMessage", {
                chatId: selectedChatId,
                content,
                userId: currentUser.id,
                partnershipId
            })
            setMessageInput("")
            toast.success("Message sent successfyllu", { duration: 3000 })
        } catch (error) {
            toast.error("Failed to send message", { duration: 3000 })
            console.log(error)

            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === selectedChatId
                        ? { ...chat, messages: chat.messages.filter((msg) => msg.id !== tempMessage.id) }
                        : chat
                )
            );
        }
    }

    //summarize the last 200 messages with AI
    const summarize = async () => {
        if (!selectedChatId || !currentUser) {
            toast.error("Cannot summarize: no chat selected or user not authenticated", { duration: 3000 })
            return
        }

        try {
            const selectedChat = chats.find((chat) => chat.id === selectedChatId);
            if (!selectedChat || selectedChat.messages.length === 0) {
                toast.error("No messages to summarize", { duration: 3000 });
                return;
            }
            const res = await summarizeChat(partnershipId, selectedChatId, currentUser.id);
            console.log("Summarize response:", res);
            setSummary(res);
            toast.success("Chat summarized successfully", { duration: 3000 });
        } catch (error) {
            toast.error("Failed to summarize chat", { duration: 3000 });
            console.error("Summarize error:", error);
        }
    }

    const answerCht = async () => {
        if (!selectedChatId || !currentUser) {
            toast.error("Cannot answer: no chat selected or user not authenticated", { duration: 3000 });
            return;
        }

        try {
            const selectedChat = chats.find((chat) => chat.id === selectedChatId)
            if (!selectedChat || selectedChat.messages.length === 0) {
                toast.error("No messages to answer", { duration: 3000 });
                return;
            }
            const res = await answerChat(partnershipId, selectedChatId, currentUser.id)
            setAnswer(res)
            toast.success("Chat answered successfully", { duration: 3000 });
        } catch (error) {
            toast.error("Failed to answer chat", { duration: 3000 });
            console.error(error);
        }
    }

    const createScheduled = async (prompt: string, scheduledTime: string) => {
        if (!selectedChatId || !currentUser) {
            toast.error("Cannot create message: no chat selected or user not authenticated", { duration: 3000 });
            return;
        }

        try {
            await createScheduledMessage(partnershipId, selectedChatId, currentUser.id, prompt, scheduledTime);
            toast.success("Message scheduled successfully", { duration: 3000 });
        } catch (error) {
            toast.error("Failed to schedule message", { duration: 3000 });
            console.error(error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(messageInput);
        }
    };

    const handleConfirmAnswer = async (editedAnswer: string) => {
        await sendMessage(editedAnswer);
    };

    const handleReplyWithSummary = async (summary: string) => {
        await sendMessage(summary);
        setSummary(null); // Fecha o modal após enviar
    };

    const selectedChat = chats.find((chat) => chat.id === selectedChatId);

    useEffect(() => {
        if (shouldScrollToBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            setShouldScrollToBottom(false);
        }
    }, [selectedChat?.messages, shouldScrollToBottom]);

    return (
        <div
            className={`p-4 ${theme === "light" ? "bg-white text-neutral-800" : "bg-slate-900 text-neutral-200"} h-[92.5vh] lg:h-[88.5vh]`}
        >
            <AnimatePresence>
                {showCreateChatModal && (
                    <motion.div
                        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={`rounded-lg p-6 w-full max-w-md ${theme === "light" ? "bg-white" : "bg-gray-800"
                                }`}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-semibold">Create New Chat</h2>
                                <button
                                    onClick={() => setShowCreateChatModal(false)}
                                    className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"
                                        }`}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={newChatName}
                                onChange={(e) => setNewChatName(e.target.value)}
                                placeholder="Enter chat name"
                                maxLength={50}
                                className={`w-full p-2 rounded-lg mb-3 ${theme === "light"
                                    ? "bg-gray-100 text-gray-900 border-gray-300"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                    }`}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowCreateChatModal(false)}
                                    className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createChat}
                                    className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-neutral-800 hover:bg-neutral-900 text-white" : "bg-neutral-900 hover:bg-black text-white"
                                        }`}
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* <h2 className="text-xl font-semibold mb-3 flex items-center justify-between"> */}
            {/* {selectedChat && (
                <button
                    onClick={() => setShowActionModal(true)}
                    className={` absolute px-3 py-1 right-7 lg:top-4 rounded border-[1px] ${theme === "light" ? "text-neutral-900 border-gray-200 hover:bg-gray-200"
                        : "text-gray-100 border-gray-600 hover:bg-gray-700"
                        } z-50 ${showCreateChatModal == true ? "hidden" : ""}`}
                    data-testid="sparkles-button"
                >
                    <Sparkles />
                </button>
            )} */}
            {/* </h2> */}
            <div className="flex flex-col md:flex-row h-[calc(100%-2rem)]">
                <div
                    className={`${selectedChatId && !isMobileChatListVisible ? "hidden md:block" : "block"} w-full md:w-1/3 lg:w-1/4 p-2 border-r ${theme === "light" ? "border-gray-200" : "border-gray-600"
                        } overflow-auto`}
                >
                    {isAuthorized && (
                        <button
                            onClick={() => setShowCreateChatModal(true)} // Abrir modal
                            className={`flex items-center gap-2 p-2 mb-3 rounded-lg w-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-900" : "bg-gray-700 hover:bg-gray-600 text-gray-100"
                                }`}
                        >
                            <Plus size={18} />
                            <span className={`${!isMobileChatListVisible ? "hidden" : ""}`}>New Chat</span>
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
                                    className={`w-full text-left p-2 rounded-lg ${theme === "light"
                                        ? "hover:bg-gray-200 text-gray-600"
                                        : "hover:bg-gray-700 text-gray-200"
                                        } ${selectedChatId === chat.id ? (theme === "light" ? "bg-gray-100" : "bg-gray-800") : ""}`}
                                >
                                    {chat.name}
                                </button>
                                {isAuthorized && (
                                    <button
                                        onClick={() => {
                                            setShowPermissionModal(chat.id);
                                            setSelectedUsers([...chat.visibleTo]);
                                        }}
                                        className={`p-1 rounded ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"}`}
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
                            <div className={`flex items-center pb-3 px-4 border-b ${theme === "light" ? "border-gray-200" : "border-gray-600"}`}>
                                <button
                                    onClick={() => setIsMobileChatListVisible(true)}
                                    className={`md:hidden mr-2 p-2 rounded-lg ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"}`}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h3 className="text-base font-medium flex lg:hidden">{selectedChat.name}</h3>
                                {selectedChat && (
                                    <button
                                        onClick={() => setShowActionModal(true)}
                                        className={` absolute px-3 py-1 right-7 lg:-top-7 rounded border-[1px] ${theme === "light" ? "text-neutral-900 border-gray-200 hover:bg-gray-200"
                                            : "text-gray-100 border-gray-600 hover:bg-gray-700"
                                            } z-50 ${showCreateChatModal == true ? "hidden" : ""}`}
                                        data-testid="sparkles-button"
                                    >
                                        <Sparkles />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 pb-4">
                                {selectedChat.messages.length > 0 ? (
                                    selectedChat.messages.map((message) => {
                                        const isCurrentUser = message.userId === currentUser?.id;
                                        const user = partnershipUsers.find((u) => u.id === message.userId);
                                        return (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                isCurrentUser={isCurrentUser}
                                                user={user}
                                                data-testid="message-bubble"
                                            />
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-400">No messages yet.</p>
                                )}
                                {/* {answer} */}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className={`p-4 bottom-0 relative border-t-1 ${theme === "light" ? "border-gray-200" : "border-gray-600"}`}>
                                <div className="mt-5" />
                                <div className="absolute bottom-0 left-4 right-0 flex items-center gap-2">
                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className={`flex-1 p-3 rounded-lg ${theme === "light"
                                            ? "bg-gray-100 text-gray-900 border-gray-300"
                                            : "bg-gray-800 text-gray-100 border-gray-600"
                                            } resize-none h-12 focus:ring-1 focus:ring-fuchsia-500`}
                                        placeholder="Type a message..."
                                    />
                                    <button
                                        onClick={() => sendMessage(messageInput)}
                                        className={`p-3 rounded-lg ${theme === "light" ? "bg-fuchsia-500 hover:bg-blue-600 text-white" : "bg-fuchsia-700 hover:bg-fuchsia-800 text-white"
                                            }`}
                                    >
                                        <Send size={20} />
                                    </button>
                                    <button
                                        className={`p-3 rounded-lg ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"
                                            }`}
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

            <PermissionModal
                isOpen={!!showPermissionModal}
                onClose={() => setShowPermissionModal(null)}
                partnershipUsers={partnershipUsers}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                onSave={updateChatPermissions}
                chatId={showPermissionModal || ""}
            />

            <SummaryModal
                isOpen={!!summary}
                onClose={() => setSummary(null)}
                summary={summary}
            />

            <AnswerModal
                isOpen={!!answer}
                onClose={() => setAnswer(null)}
                answer={answer}
                onConfirm={handleConfirmAnswer}
            />

            <ChatActionModal
                isOpen={showActionModal}
                onClose={() => setShowActionModal(false)}
                onAnswer={answerCht}
                onSummarize={summarize}
                onCreate={createScheduled}
                messages={selectedChat?.messages || []}
            />
        </div>
    );
}

export default CollaborationChatView