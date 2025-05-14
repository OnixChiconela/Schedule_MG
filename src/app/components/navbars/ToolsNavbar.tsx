"use client";

import { useTheme } from "@/app/themeContext";
import { useSubfolderContext } from "@/app/context/SubfolderContext";

const ToolsNavbar = () => {
  const { theme } = useTheme();
  const { activeTool, setActiveTool } = useSubfolderContext();

  return (
    <div
      className={`fixed top-0 left-0 w-[260px] h-full ${theme === "light" ? "bg-gray-100" : "bg-slate-800"} hidden lg:block z-10 transition-colors duration-300`}
      style={{
        paddingTop: `calc(5rem + env(safe-area-inset-top, 0px))`,
      }}
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
    </div>
  );
};

export default ToolsNavbar;