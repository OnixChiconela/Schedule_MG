"use client";

import ClientOnly from "@/app/components/ClientOnly";
import Navbar from "@/app/components/navbars/Navbar";
import SideNavbar from "@/app/components/navbars/SideNavbar";
import FolderModal from "@/app/components/smart/smartnotes/FolderModal";
import { MoreHorizontal, Plus } from "lucide-react";
import { useTheme } from "@/app/themeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CustomizeFolderModal from "@/app/components/smart/smartnotes/FolderCustomizationModal";

type Subfolder = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export type Folder = {
  id: number;
  title: string;
  description?: string;
  titleColor: string;
  bgColor: string;
  borderColor: string;
  imageUrl: string | null;
  shadow: number; // Changed from string to number to match CustomizeFolderModal
  opacity: number;
  subfolders: Subfolder[];
};

const SmartNotes = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("smartNotesFolders");
      return saved
        ? JSON.parse(saved).map((folder: Folder) => ({
            ...folder,
            shadow: typeof folder.shadow === "string" ? 1 : folder.shadow, // Convert legacy string shadows to number
          }))
        : [];
    }
    return [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customizingFolderId, setCustomizingFolderId] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customTitleColor, setCustomTitleColor] = useState(theme === "light" ? "#1F2937" : "#FFFFFF");
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [customBorderColor, setCustomBorderColor] = useState("#F5F5F5");
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [customShadow, setCustomShadow] = useState(1); // Default to "Light" shadow
  const [customOpacity, setCustomOpacity] = useState(1);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("smartNotesFolders", JSON.stringify(folders));
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [folders]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreateFolder = (title: string) => {
    const newId = folders.length ? Math.max(...folders.map((f) => f.id)) + 1 : 1;
    const newFolder: Folder = {
      id: newId,
      title,
      titleColor: theme === "light" ? "#1F2937" : "#ffffff",
      bgColor: theme === "light" ? "#ffffff" : "#1e293b",
      borderColor: theme === "light" ? "#F5F5F5" : "#94a3b8",
      imageUrl: null,
      shadow: 1, // Default to "Light" shadow
      opacity: 1,
      subfolders: [],
    };
    setFolders([...folders, newFolder]);
    toast.success("Folder created");
  };

  const handleCustomizeFolder = (folderId: number) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      setCustomizingFolderId(folderId);
      setCustomTitle(folder.title);
      setCustomBgColor(folder.bgColor);
      setCustomBorderColor(folder.borderColor);
      setCustomImageUrl(folder.imageUrl);
      setCustomShadow(folder.shadow);
      setCustomOpacity(folder.opacity);
      setCustomTitleColor(folder.titleColor || (theme === "light" ? "#1F2937" : "#FFFFFF"));
    }
  };

  const handleSaveCustomization = () => {
    const updatedFolders = folders.map((folder) =>
      folder.id === customizingFolderId
        ? {
            ...folder,
            title: customTitle || folder.title,
            bgColor: customBgColor || folder.bgColor,
            borderColor: customBorderColor || folder.borderColor,
            imageUrl: customImageUrl !== undefined ? customImageUrl : folder.imageUrl,
            shadow: customShadow !== undefined ? customShadow : folder.shadow,
            opacity: customOpacity !== undefined ? customOpacity : folder.opacity,
            titleColor: customTitleColor || (theme === "light" ? "#1F2937" : "#FFFFFF"),
          }
        : folder
    );

    setFolders(updatedFolders);
    if (typeof window !== "undefined") {
      localStorage.setItem("smartNotesFolders", JSON.stringify(updatedFolders));
    }
    setCustomizingFolderId(null);
    toast.success("Folder customized");
  };

  const handleDeleteFolder = (folderId: number) => {
    setFolders(folders.filter((folder) => folder.id !== folderId));
    setOpenMenuId(null);
    toast.success("Folder deleted");
  };

  const handleRenameFolder = (folderId: number) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      setRenamingFolderId(folderId);
      setRenameTitle(folder.title);
      setIsRenameModalOpen(true);
      setOpenMenuId(null);
    }
  };

  const handleSaveRename = () => {
    if (renamingFolderId !== null && renameTitle.trim()) {
      setFolders(
        folders.map((folder) =>
          folder.id === renamingFolderId ? { ...folder, title: renameTitle } : folder
        )
      );
      toast.success("Folder renamed");
      setIsRenameModalOpen(false);
      setRenamingFolderId(null);
      setRenameTitle("");
    }
  };

  const handleDuplicateFolder = (folderId: number) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      const newId = folders.length ? Math.max(...folders.map((f) => f.id)) + 1 : 1;
      const newFolder = { ...folder, id: newId, title: `${folder.title} (Copy)` };
      setFolders([...folders, newFolder]);
      setOpenMenuId(null);
      toast.success("Folder duplicated");
    }
  };

  const handleOpenFolder = (folderId: number) => {
    router.push(`/smart/smart-notes/${folderId}`);
  };

  const getTitleLimit = () => {
    if (windowWidth >= 1536) return 45; // 2xl
    if (windowWidth >= 1280) return 40; // xl
    if (windowWidth >= 1024) return 25; // lg
    if (windowWidth >= 768) return 20; // md
    return 17; // sm and below
  };

  const shadowStyles: { [key: number]: string } = {
    0: "none",
    1: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    2: "0px 8px 12px rgba(0, 0, 0, 0.15)",
    3: "0px 12px 18px rgba(0, 0, 0, 0.2)",
  };

  return (
    <ClientOnly>
      <Navbar
        themeButton={false}
        showToggleSidebarButton={true}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div
        className={`min-h-screen flex ${theme === "light" ? "bg-white" : "bg-slate-900"} transition-colors duration-300`}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <SideNavbar
          theme={theme}
          toggleTheme={toggleTheme}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isVisible={isSidebarOpen}
        />
        <main
          className="flex-1 overflow-y-auto p-6 pt-20 lg:ml-[260px]"
          style={{
            paddingTop: `calc(5rem + env(safe-area-inset-top, 0px))`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1
              className={`text-2xl font-semibold ${theme === "light" ? "text-neutral-900" : "text-neutral-200"}`}
            >
              Smart Notes
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                theme === "light" ? "bg-black text-white hover:bg-neutral-800" : "bg-slate-900 text-gray-200 hover:bg-slate-700"
              }`}
            >
              <Plus size={16} />
              Create Vault
            </button>
          </div>

          <div>
            {folders.length === 0 ? (
              <div
                className={`h-full flex items-center ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
              >
                No folders yet. Create one to start organizing your notes.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 p-4">
                <AnimatePresence>
                  {folders.map((folder) => (
                    <motion.div
                      key={folder.id}
                      layout
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <motion.div
                        className={`aspect-square rounded-2xl transition border-2 flex overflow-hidden ${
                          theme === "light" ? "border-white" : "border-slate-900"
                        }`}
                        style={{
                          backgroundColor: folder.bgColor,
                          borderColor: folder.borderColor,
                          boxShadow: shadowStyles[folder.shadow],
                          opacity: folder.opacity,
                        }}
                        onClick={() => handleOpenFolder(folder.id)}
                        whileHover={{ scale: 1.05, boxShadow: shadowStyles[2] }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div
                          className="w-[38%] h-full"
                          style={{
                            backgroundImage: folder.imageUrl ? `url(${folder.imageUrl})` : "none",
                            backgroundColor: !folder.imageUrl
                              ? theme === "light"
                                ? "#e5e7eb"
                                : "#475569"
                              : "transparent",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {!folder.imageUrl && (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Image
                            </div>
                          )}
                        </div>
                        <div className="w-[60%] p-2 flex flex-col justify-between">
                          <h2
                            className="text-base font-semibold"
                            style={{
                              color: folder.titleColor || (theme === "light" ? "#1F2937" : "#FFFFFF"),
                            }}
                          >
                            {folder.title.length > getTitleLimit()
                              ? folder.title.slice(0, getTitleLimit()) + "..."
                              : folder.title}
                          </h2>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCustomizeFolder(folder.id);
                            }}
                            className={`p-1 rounded-full self-end ${
                              theme === "light"
                                ? "bg-white text-gray-900 hover:bg-gray-200"
                                : "bg-slate-800 text-gray-100 hover:bg-slate-600"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
                              />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                      <div className="py-1 flex items-center justify-between px-2 relative">
                        <div
                          className={`${theme === "light" ? "text-neutral-700" : "text-neutral-300"}`}
                        >
                          {folder.subfolders.length} fragments
                        </div>
                        <div
                          className={`p-1 ${
                            theme === "light" ? "text-neutral-700 hover:bg-neutral-200" : "text-neutral-300 hover:bg-slate-700"
                          } rounded-full cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === folder.id ? null : folder.id);
                          }}
                        >
                          <MoreHorizontal size={22} />
                        </div>
                        <AnimatePresence>
                          {openMenuId === folder.id && (
                            <motion.div
                              ref={menuRef}
                              className={`absolute right-2 p-1 top-8 z-10 rounded-md shadow-lg ${
                                theme === "light" ? "bg-white" : "bg-slate-800"
                              }`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                            >
                              <div className="py-1">
                                <button
                                  className={`block w-full text-left px-4 rounded-md py-2 text-sm ${
                                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameFolder(folder.id);
                                  }}
                                >
                                  Rename
                                </button>
                                <button
                                  className={`block w-full text-left px-4 rounded-md py-2 text-sm ${
                                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateFolder(folder.id);
                                  }}
                                >
                                  Duplicate
                                </button>
                                <button
                                  className={`block w-full text-left px-4 rounded-md py-2 text-sm ${
                                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"
                                  }`}
                                  onClick={(e) => toast.success("Share your thoughts, may be good for someone else!")}
                                >
                                  Share
                                </button>
                                <button
                                  className={`block w-full text-left px-4 rounded-md py-2 text-sm ${
                                    theme === "light"
                                      ? "text-red-600 hover:bg-red-400/10"
                                      : "text-red-500 hover:bg-red-700/20"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(folder.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {customizingFolderId !== null && (
            <CustomizeFolderModal
              theme={theme}
              customTitle={customTitle}
              setCustomTitle={setCustomTitle}
              customBgColor={customBgColor}
              setCustomBgColor={setCustomBgColor}
              // customBorderColor={customBorderColor}
              // setCustomBorderColor={setCustomBorderColor}
              customImageUrl={customImageUrl}
              setCustomImageUrl={setCustomImageUrl}
              customShadow={customShadow}
              setCustomShadow={setCustomShadow}
              customOpacity={customOpacity}
              setCustomOpacity={setCustomOpacity}
              customTitleColor={customTitleColor}
              setCustomTitleColor={setCustomTitleColor}
              setCustomizingFolderId={setCustomizingFolderId}
              handleSaveCustomization={handleSaveCustomization}
            />
          )}

          {isRenameModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50 dark:bg-slate-800/50"
              style={{
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.div
                className={`p-6 rounded-xl shadow-lg w-full max-w-sm ${
                  theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-gray-700"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h2
                  className={`text-xl font-semibold mb-6 ${theme === "light" ? "text-gray-900" : "text-white"}`}
                >
                  Rename Folder
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      New Folder Name
                    </label>
                    <input
                      type="text"
                      value={renameTitle}
                      onChange={(e) => setRenameTitle(e.target.value)}
                      className={`w-full p-2 rounded-md border ${
                        theme === "light"
                          ? "border-gray-300 bg-white text-gray-900"
                          : "border-slate-600 bg-slate-800 text-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-fuchsia-700`}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <motion.button
                      onClick={() => {
                        setIsRenameModalOpen(false);
                        setRenamingFolderId(null);
                        setRenameTitle("");
                      }}
                      className={`px-5 py-2 rounded-xl font-semibold transition-colors ${
                        theme === "light"
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                          : "bg-slate-600 hover:bg-slate-500 text-gray-200"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSaveRename}
                      className={`px-5 py-2 rounded-xl font-semibold transition-colors ${
                        theme === "light"
                          ? "bg-neutral-800 hover:bg-black text-white"
                          : "bg-neutral-900 hover:bg-black text-gray-200"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Save
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          <FolderModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateFolder}
            theme={theme}
          />
        </main>
      </div>
    </ClientOnly>
  );
};

export default SmartNotes;