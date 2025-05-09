"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Corner = {
  id: number;
  title: string;
  tasks: {
    id: number;
    title: string;
    status: "To Do" | "In Progress" | "Done";
    createdDate: string;
    dueDate: string;
    priority: "Low" | "Medium" | "High";
    isCompleted: boolean;
  }[];
};

interface ProjectSelectorProps {
  corners: Corner[];
  selectedCornerId: number | null;
  onSelect: (id: number | null) => void;
  onCornerDelete: (id: number) => void; // Nova prop para deletar Corner
  theme: "light" | "dark";
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  corners,
  selectedCornerId,
  onSelect,
  onCornerDelete,
  theme,
}) => {
  console.log(`ProjectSelector: Theme applied ${theme}`);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCorners = corners.filter((corner) =>
    corner.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: number) => {
    console.log(`ProjectSelector: Selected corner ${id}`);
    onSelect(id);
    setIsOpen(false);
    setSearch("");
  };

  const handleDelete = (id: number) => {
    console.log(`ProjectSelector: Deleting corner ${id}`);
    onCornerDelete(id);
    if (selectedCornerId === id) {
      onSelect(corners.length > 1 ? corners[0]?.id : null);
    }
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full max-w-md">
      <button
        onClick={() => {
          console.log(`ProjectSelector: Toggling dropdown`);
          setIsOpen(!isOpen);
        }}
        className={`w-full border rounded-xl px-4 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          theme === "light"
            ? "bg-white border-gray-300 text-black"
            : "bg-slate-700 border-slate-500 text-gray-200"
        } transition-colors duration-300`}
        data-testid="project-selector"
      >
        <span>
          {selectedCornerId
            ? corners.find((c) => c.id === selectedCornerId)?.title || "Select a Corner"
            : "Select a Corner"}
        </span>
        <svg
          className={`w-5 h-5 transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute z-40 w-full mt-1 border rounded-xl shadow-lg max-h-64 overflow-y-auto ${
            theme === "light" ? "bg-white border-gray-300" : "bg-slate-700 border-slate-500"
          } transition-colors duration-300`}
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Search Corners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === "light"
                  ? "bg-white border-gray-300 text-black"
                  : "bg-slate-700 border-slate-500 text-gray-200"
              }`}
              autoFocus
              data-testid="corner-search"
            />
          </div>
          {filteredCorners.length === 0 ? (
            <div
              className={`px-4 py-2 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
              data-testid="no-corners"
            >
              No Corners found.
            </div>
          ) : (
            filteredCorners.map((corner) => (
              <div
                key={corner.id}
                className="flex items-center justify-between px-4 py-2"
              >
                <button
                  onClick={() => handleSelect(corner.id)}
                  className={`w-full text-left transition ${
                    theme === "light"
                      ? "text-black hover:bg-gray-100"
                      : "text-gray-200 hover:bg-slate-600"
                  }`}
                  data-testid={`corner-${corner.id}`}
                >
                  {corner.title}
                </button>
                <button
                  onClick={() => handleDelete(corner.id)}
                  className={`p-1 rounded-full ${
                    theme === "light"
                      ? "text-red-600 hover:bg-gray-100"
                      : "text-red-400 hover:bg-slate-600"
                  } transition-colors duration-200`}
                  data-testid={`delete-corner-${corner.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
          {filteredCorners.length > 0 && (
            <hr
              className={`my-2 ${
                theme === "light" ? "border-gray-200" : "border-slate-500"
              }`}
            />
          )}
          <div
            className={`px-4 py-2 ${
              theme === "light" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <button
              onClick={() => setIsOpen(false)}
              className={`w-full text-left transition ${
                theme === "light" ? "hover:bg-gray-100" : "hover:bg-slate-600"
              } opacity-50 cursor-not-allowed`}
              disabled
              data-testid="new-view"
            >
              New View (Coming Soon)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;