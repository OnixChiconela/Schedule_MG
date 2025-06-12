"use client";

import { useTheme } from "@/app/themeContext";
import { X } from "lucide-react";
import { useState } from "react";
import SimpleCalendar from "../teams/SimpleCalendar";

const TeamSideNavbar = ({
  isOpen,
  setIsOpen,
  isSmallScreen,
  onSectionSelect,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isSmallScreen: boolean;
  onSectionSelect: (section: string) => void;
}) => {
  const { theme } = useTheme();

  const items = ["Overview","Projects", "Tasks", "Notes", "Chat", "Private"];

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-64 z-20 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${theme === "light" ? "bg-neutral-100 text-neutral-800" : "bg-slate-800 text-neutral-200"} lg:translate-x-0 lg:static lg:z-0`}
      style={{ paddingTop: "calc(4.5rem + env(safe-area-inset-top, 0px))" }}
    >
      <div className="p-4 h-full overflow-auto">
        <div className="flex justify-end items-center -mt-1">
          {isSmallScreen && (
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "dark:hover:bg-gray-700"} lg:hidden`}
            >
              <X size={20} />
            </button>
          )}
        </div>
        <SimpleCalendar onDateSelect={onSectionSelect} />
        <ul className="space-y-2 mt-4">
          {items.map((item) => (
            <li key={item}>
              <button
                draggable
                onClick={() => onSectionSelect(item)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", item);
                }}
                className={`w-full text-left p-2 rounded ${theme === "light" ? "hover:bg-neutral-200" : "hover:bg-slate-700"}`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamSideNavbar;