"use client";

import { getUserMasterKey } from "@/app/api/actions/user/getUserMasterkey";
import { getUsers } from "@/app/api/actions/user/getUsers";
import api from "@/app/api/api";
import { useTheme } from "@/app/themeContext";
import { Plus, Settings, Send, Mic, ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import sodium from "libsodium-wrappers";
import getTeamDetails from "@/app/api/actions/teams/getTeamDetais";
import { useUser } from "@/app/context/UserContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Tipos
type Message = {
  id: string;
  chatId: string;
  userId: string;
  encryptedContent: string;
  contentNonce: string;
  timestamp: Date;
};

type User = {
  id: string;
  email: string;
  lastName: string;
  firstName: string;
  // role não existe aqui
};

type TeamMembership = {
  userId: string;
  teamId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: Date;
};

type Chat = {
  id: string;
  name: string;
  teamId: string;
  visibleTo: string[];
  createdBy: string;
  messages: Message[];
};

type TeamDetails = {
  id: string;
  encryptedName: string;
  description: string;
  encryptedKeys: Record<string, { encryptedKey: string; nonce: string }>;
  role?: string; // Removido, pois não deve ser usado diretamente
  createdAt: Date;
  nameNonce: string;
  descriptionNonce: string;
  members: TeamMembership[]; // Garantir que members seja preenchido
};

const TeamChatView = ({ teamId }: { teamId: string }) => {
  const { theme } = useTheme();
  const { currentUser, userLoading } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState<string | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isMobileChatListVisible, setIsMobileChatListVisible] = useState(true);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasJoinedTeam = useRef(false);

  // Verificar se o usuário é OWNER ou ADMIN no time atual
  const isAuthorized = teamDetails?.members?.find(
    (member) => member.userId === currentUser?.id
  )?.role === "OWNER" || teamDetails?.members?.find(
    (member) => member.userId === currentUser?.id
  )?.role === "ADMIN" || false;

  // Conexão WebSocket
  useEffect(() => {
    let isMounted = true;

    if (userLoading || !currentUser || !isMounted) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("No authentication token found. Please log in.", {
        duration: 3000,
      });
      router.push("/my-space/auth/login");
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io("http://localhost:8050/team/chat", {
        query: { userId: currentUser.id, token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketRef.current;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => {
      if (isMounted) {
        toast.error("Failed to connect to chat server", {
          duration: 3000,
        });
        console.error("WebSocket connection error:", err.message);
      }
    });
    socket.on("error", (err) => {
      if (isMounted) {
        toast.error(err.message || "Connection failed", {
          duration: 3000,
        });
        console.error("Socket error:", err);
      }
    });
    socket.on("JoinedTeam", (data) => {
      console.log(`Joined team: ${data.teamId}`);
    });
    socket.on("receiveMessage", (message) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        )
      );
    });

    if (!hasJoinedTeam.current) {
      socket.emit("joinTeam", { teamId, userId: currentUser.id });
      hasJoinedTeam.current = true;
    }

    return () => {
      isMounted = false;
      socket.disconnect();
      socketRef.current = null;
      hasJoinedTeam.current = false;
    };
  }, [currentUser?.id, teamId, router]);

  // Carregamento de dados
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (userLoading || !currentUser || !isMounted) return;

      try {
        const users = await getUsers();
        if (!users && isMounted) {
          toast.error("Failed to load users", { duration: 3000 });
          return;
        }

        const details = await getTeamDetails(teamId, currentUser.id);
        console.log("Loading team details for userId:", currentUser.id, "teamId:", teamId);
        if (!details && isMounted) {
          toast.error("Failed to load team details", { duration: 3000 });
          return;
        }

        // Buscar teamMembership separadamente se getTeamDetails não retorna members
        const membershipRes = await api.get(`/teams/${teamId}/members`);
        const members = membershipRes.data || [];

        if (isMounted) {
          setTeamDetails({
            ...details,
            members: members.map((member: any) => ({
              userId: member.userId,
              teamId: member.teamId,
              role: member.role,
              joinedAt: new Date(member.joinedAt),
            })),
          });
        }

        if (details?.encryptedKeys && isMounted) {
          const memberIds = Object.keys(details.encryptedKeys);
          const filteredUsers = users.filter((u: User) => memberIds.includes(u.id));
          setTeamUsers(filteredUsers);
        }

        const chatsRes = await api.get(`/chats/team-chat/${teamId}`);
        if (chatsRes.data && isMounted) {
          setChats(
            chatsRes.data.map((chat: any) => ({
              id: chat.id,
              name: chat.name,
              teamId: chat.teamId,
              visibleTo: chat.visibleTo || [],
              createdBy: chat.createdBy || "",
              messages: chat.messages || [],
            }))
          );
        } else if (isMounted) {
          toast.error("Failed to load chats", { duration: 3000 });
        }
      } catch (err) {
        if (isMounted) {
          toast.error("An unexpected error occurred", { duration: 3000 });
          console.error(err);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [teamId, currentUser?.id]);

  const decryptMessage = async (encryptedContent: string, contentNonce: string, key: string): Promise<string> => {
    await sodium.ready;
    const decrypted = sodium.crypto_secretbox_open_easy(
      sodium.from_base64(encryptedContent),
      sodium.from_base64(contentNonce),
      sodium.from_base64(key)
    );
    return sodium.to_string(decrypted);
  };

  const visibleChats = chats.filter(
    (chat) =>
      chat.visibleTo.includes(currentUser?.id || "") ||
      (teamDetails?.members?.find((member) => member.userId === currentUser?.id)?.role === "OWNER" ||
        teamDetails?.members?.find((member) => member.userId === currentUser?.id)?.role === "ADMIN")
  );

  const createChat = async () => {
    if (!currentUser) {
      toast.error("Cannot create chat: user not authenticated", { duration: 3000 });
      return;
    }
    try {
      const newChat = await api.post("/chats/create-chat", {
        teamId,
        userId: currentUser.id,
        name: `Chat ${chats.length + 1}`,
        visibleTo: [currentUser.id],
      });
      setChats((prev) => [...prev, newChat.data]);
      toast.success("Chat created successfully", { duration: 3000 });
    } catch (err) {
      toast.error("Failed to create chat", { duration: 3000 });
      console.error(err);
    }
  };

  // const createTeam = async () => {
  //   if (!currentUser) {
  //     toast.error("Cannot create team: user not authenticated", { duration: 3000 });
  //     return;
  //   }
  //   if (!newTeamName.trim()) {
  //     toast.error("Team name is required", { duration: 3000 });
  //     return;
  //   }

  //   try {
  //     const newTeam = await api.post("/teams/create-team", {
  //       name: newTeamName,
  //       description: newTeamDescription,
  //       userId: currentUser.id,
  //     });
  //     toast.success("Team created successfully", { duration: 3000 });
  //     setShowCreateTeamModal(false);
  //     setNewTeamName("");
  //     setNewTeamDescription("");
  //     router.push(`/teams/${newTeam.data.id}`);
  //   } catch (err) {
  //     toast.error("Failed to create team", { duration: 3000 });
  //     console.error(err);
  //   }
  // };

  const updateChatPermissions = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, visibleTo: selectedUsers } : chat
      )
    );
    setShowPermissionModal(null);
    setSelectedUsers([]);
    toast.success("Chat permissions updated successfully", { duration: 3000 });
  };

  const encryptMessage = async (content: string, key: string): Promise<{ encrypted: string; nonce: string }> => {
    await sodium.ready;
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const encrypted = sodium.crypto_secretbox_easy(content, nonce, sodium.from_base64(key));
    return {
      encrypted: sodium.to_base64(encrypted),
      nonce: sodium.to_base64(nonce),
    };
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId || !currentUser || !teamDetails) {
      toast.error("Cannot send message: missing required data", { duration: 3000 });
      return;
    }

    try {
      const userKey = teamDetails.encryptedKeys[currentUser.id];
      if (!userKey) {
        toast.error("Encryption key not found for current user", { duration: 3000 });
        return;
      }

      const masterKey = await getUserMasterKey(currentUser.id);
      const teamKeyUint8 = sodium.crypto_secretbox_open_easy(
        sodium.from_base64(userKey.encryptedKey),
        sodium.from_base64(userKey.nonce),
        sodium.from_base64(masterKey)
      );

      const teamKey = sodium.to_base64(teamKeyUint8);

      const { encrypted: encryptedContent, nonce: contentNonce } = await encryptMessage(messageInput, teamKey);

      socketRef.current?.emit("sendMessage", {
        chatId: selectedChatId,
        encryptedContent,
        contentNonce,
        userId: currentUser.id,
      });
      setMessageInput("");
      toast.success("Message sent successfully", { duration: 3000 });
    } catch (err) {
      toast.error("Failed to send message", { duration: 3000 });
      console.error(err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);

  return (
    <div
      className={`p-4 ${theme === "light" ? "bg-white text-black" : "bg-slate-900 text-white"} h-[84vh]`}
    >
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        Team Chats

      </h2>
      <div className="flex flex-col md:flex-row h-[calc(100%-2rem)]">
        <div
          className={`${selectedChatId && !isMobileChatListVisible ? "hidden md:block" : "block"} w-full md:w-1/3 lg:w-1/4 p-2 border-r ${theme === "light" ? "border-gray-200" : "border-slate-700"} overflow-auto`}
        >
          {isAuthorized && (
            <button
              onClick={createChat}
              className={`flex gap-0.5 items-center p-2 mb-2 rounded-full ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <Plus size={18} className="font-bold"/>
              {/* <div className="hidden lg:flex">create chat</div> */}
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
                  className={`w-full text-left p-2 rounded ${theme === "light" ? "hover:bg-neutral-200" : "hover:bg-slate-700"} ${selectedChatId === chat.id ? "bg-neutral-200" : ""}`}
                >
                  {chat.name}
                </button>
                {isAuthorized && (
                  <button
                    onClick={() => {
                      setShowPermissionModal(chat.id);
                      setSelectedUsers(chat.visibleTo);
                    }}
                    className={`p-1 rounded ${theme === "light" ? "hover:bg-neutral-200" : "hover:bg-slate-700"}`}
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
                  className={`md:hidden mr-2 p-2 rounded ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
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
                      className={`p-2 mb-2 rounded ${theme === "light" ? (isCurrentUser ? "bg-blue-100 ml-auto" : "bg-gray-100") : (isCurrentUser ? "bg-blue-900 ml-auto" : "bg-slate-700")} max-w-[70%] ${isCurrentUser ? "text-right" : "text-left"}`}
                    >
                      {message.encryptedContent} {/* Descriptografia pendente */}
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
                    className={`flex-1 p-2 rounded ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-500"} resize-none h-12`}
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={sendMessage}
                    className={`p-2 rounded ${theme === "light" ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                  >
                    <Send size={20} />
                  </button>
                  <button
                    className={`p-2 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-600 hover:bg-slate-500"}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-center text-gray-500">Select a chat to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-80 p-4 rounded-lg ${theme === "light" ? "bg-white text-black" : "bg-slate-900 text-white"}`}
          >
            <h3 className="text-lg font-semibold mb-4">Manage Chat Permissions</h3>
            <div className="space-y-2">
              {teamUsers.map((user) => (
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
                className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-600 hover:bg-slate-500"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => updateChatPermissions(showPermissionModal)}
                className={`px-3 py-1 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamChatView;