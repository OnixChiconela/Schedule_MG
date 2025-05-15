"use client";

import { useTheme } from "@/app/themeContext";
import { useSubfolderContext } from "@/app/context/SubfolderContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ToolsNavbar = () => {
  const { theme } = useTheme();
  const { activeTool, setActiveTool } = useSubfolderContext();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsExpanded(true); 
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <motion.button
        className={`fixed top-[67px] left-4 lg:hidden z-20 p-2 rounded-md ${theme === "light" ? "bg-white text-gray-900 hover:bg-gray-200" : "bg-slate-700 text-gray-200 hover:bg-slate-600"} transition-all duration-200 ease-in-out`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.95 }}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </motion.button>

      <motion.div
        className={`fixed top-0 left-0 w-[260px] h-full ${theme === "light" ? "bg-gray-100" : "bg-slate-800"} ${isExpanded || "hidden"} lg:block z-10`}
        style={{
          paddingTop: `calc(5rem + env(safe-area-inset-top, 0px))`,
        }}
        initial={{ x: "-100%", opacity: 0, scale: 0.95 }} 
        animate={{ x: isExpanded ? 0 : "-100%", opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 0.95 }} // Animação ao expandir/colapsar
        transition={{ duration: 0.3, ease: "easeInOut" }} 
      >
        <div className="p-4">
          <h2 className={`text-lg font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
            Tools
          </h2>
          <div className="space-y-2">
            <button
              className={`w-full text-left px-4 py-2 rounded-md ${activeTool === "text"
                ? theme === "light" ? "bg-gray-300 text-gray-900" : "bg-slate-600 text-gray-200"
                : theme === "light" ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-slate-700 text-gray-200 hover:bg-slate-600"
                }`}
              onClick={() => setActiveTool("text")}
            >
              Text
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-md ${activeTool === "freeDraw"
                ? theme === "light" ? "bg-gray-300 text-gray-900" : "bg-slate-600 text-gray-200"
                : theme === "light" ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-slate-700 text-gray-200 hover:bg-slate-600"
                }`}
              onClick={() => setActiveTool("freeDraw")}
            >
              Free Draw
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ToolsNavbar;