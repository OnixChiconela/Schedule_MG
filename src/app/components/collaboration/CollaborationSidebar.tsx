"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { Partnership } from "./CollaborationCard";
import { useTheme } from "@/app/themeContext";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

interface CollaborationSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isSmallScreen: boolean;
  onSectionSelect: (section: string) => void;
  partnership: Partnership;
}

export default function CollaborationSidebar({
  isOpen,
  setIsOpen,
  isSmallScreen,
  onSectionSelect,
  partnership,
}: CollaborationSidebarProps) {
  const { theme } = useTheme();
  const sections = ["Chat", "Notes", "Emails", "Video call", "Summary"];

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
          <h2 className="text-lg font-semibold">{partnership.name}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
          >
            <X size={20} />
          </button>
        </div>
        <ul className="p-4">
          {sections.map((section) => (
            <li
              key={section}
              className={`p-2 mb-2 rounded cursor-pointer draggable
              ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", section)}
              onClick={() => {
                onSectionSelect(section);
                if (isSmallScreen) setIsOpen(false);
              }}
            >
              {section}
            </li>
          ))}
        </ul>
      </div>

      {/* Botão Flutuante para Abrir Sidebar (Telas Maiores, Sidebar Fechada) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed top-14 left-4 z-50 p-2 rounded-full
          ${theme === "light" ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : "bg-slate-800 text-white hover:bg-slate-700"}`}
        >
          <MdOutlineKeyboardDoubleArrowRight size={16} />
        </button>
      )}
    </>
  );
}