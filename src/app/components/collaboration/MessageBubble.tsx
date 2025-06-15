"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Users } from "@/app/types";
import { useTheme } from "@/app/themeContext";
import { Message } from "./CollaborationChatView";
import Avatar from "../Avatar";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  user?: Users;
}



const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, user }) => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarFallback = useMemo(() => {
    const name = user ? `${user.firstName} ${user.lastName}` : `User ${message.userId}`;
    return name.charAt(0).toUpperCase();
  }, [user, message.userId]);

  const formattedTime = format(new Date(message.timestamp), "HH:mm");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`w-full flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
      data-testid="message-bubble"
    >
      <div
        className={`flex flex-col p-3 max-w-[70%] lg:max-w-[60%] rounded-lg ${
          theme === "light"
            ? isCurrentUser
              ? "bg-fuchsia-200"
              : "bg-gray-100"
            : isCurrentUser
            ? "bg-fuchsia-950/50"
            : "bg-slate-700"
        } ${isCurrentUser ? "items-end" : "items-start"}`}
      >
        {/* Avatar e Nome */}
        <div className={`flex items-center gap-1 ${isCurrentUser ? "flex-row-reverse" : "flex-row"} mb-1`}>
          <Avatar
            name={user ? `${user.firstName} ${user.lastName}` : `User ${message.userId}`}
            visualType={user?.visualType}
            visualValue={user?.visualValue}
            size="small"
          />
          <span className="text-sm font-semibold">
            {user ? `${user.firstName} ${user.lastName}` : `User Unknow`}
          </span>
        </div>
        {/* Conteúdo da Mensagem */}
        <p className="text-sm break-words">{message.content}</p>
        {/* Hora de Envio */}
        <span
          className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-300"} mt-1 self-${
            isCurrentUser ? "end" : "start"
          }`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;