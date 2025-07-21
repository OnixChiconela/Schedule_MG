"use client";

import { Mail, MessageCircle, Notebook, Video, X } from "lucide-react";
import { Partnership } from "./CollaborationCard";
import { useTheme } from "@/app/themeContext";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { IconType } from "react-icons";

interface CollaborationSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isSmallScreen: boolean;
  onSectionSelect: (section: string) => void;
  partnership: Partnership;
}

interface SectionIconProps {
  icon: IconType
  label: string
  onClick: () => void
  theme: string
}

const SectionItem = ({icon: Icon, label, onClick, theme}: SectionIconProps) => {
  return (
    <li
      className={`p-2 mb-2 rounded cursor-pointer draggable
      ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", label)}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Icon size={20} />
        {label}
      </div>
    </li>
  )
}

export default function CollaborationSidebar({
  isOpen,
  setIsOpen,
  isSmallScreen,
  onSectionSelect,
  partnership,
}: CollaborationSidebarProps) {
  const { theme } = useTheme();
   const sections = [
    { key: 'Chat', icon: MessageCircle, label: 'Chat' },
    { key: 'Notes', icon: Notebook, label: 'Notes' },
    { key: 'Emails', icon: Mail, label: 'Emails' },
    { key: 'Video call', icon: Video, label: 'Video call' },
    { key: 'Summary', icon: MessageCircle, label: 'Summary' },
  ];

  // const Input = ({
  //   key,
  //   icon: Icon,
  //   label
  // } : {
  //   key: string, 
  //   icon: IconType, 
  //   label: string
  // }) => {
  //   return (
  //     <div key={key} className="flex gap-1 ">
  //       <Icon size={20} />
  //       {label}
  //     </div>
  //   )
  // }
  // const sections = [
  //   <Input key="Chat" icon={MessageCircle} label="Chats"/>,
  //   <Input key="Notes" icon={Notebook} label="Notes"/>,
  //   <Input key="Emails" icon={Mail} label="Emails"/>,
  //   <Input key="Video calls" icon={HiOutlineVideoCamera} label="Video call"/>,
  //   <Input key="Summary" icon={MessageCircle} label="Summary"/>,
  // ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-full z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        ${isSmallScreen ? "w-64" : "w-48"}
        ${theme === "light" ? "bg-gray-100 ext-neutral-800" : "bg-slate-800 text-neutral-200"}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{partnership.name}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
          >
            <X size={20} />
          </button>
        </div>
         <ul className="p-4">
          {sections.map(({ key, icon, label }) => (
            <SectionItem
              key={key}
              icon={icon}
              label={label}
              theme={theme}
              onClick={() => {
                onSectionSelect(label);
                if (isSmallScreen) setIsOpen(false);
              }}
            />
          ))}
        </ul>
      </div>

      {/* Botão Flutuante para Abrir Sidebar (Telas Maiores, Sidebar Fechada) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed top-14 left-4 z-50 p-2 rounded-full
          ${theme === "light" ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : "bg-slate-700 text-white hover:bg-slate-700"}`}
        >
          <MdOutlineKeyboardDoubleArrowRight size={16} />
        </button>
      )}
    </>
  );
}