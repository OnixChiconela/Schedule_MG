"use client";

import { useTheme } from "@/app/themeContext";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CustomizeFolderModal from "../smart/smartnotes/FolderCustomizationModal";

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
};

type NotesFoldersProps = {
    onOpenFolder: (folderId: number) => void;
    panelWidth: number; // Largura do painel
};

const NotesFolders = ({ onOpenFolder, panelWidth }: NotesFoldersProps) => {
    const { theme } = useTheme();
    const [folders, setFolders] = useState<Folder[]>([
        {
            id: 1,
            title: "Meeting Notes",
            description: "Notes from the team meeting on May 31st.",
            imageUrl: null,
            bgColor: theme === "light" ? "#F3F4F6" : "#1F2937",
            borderColor: '',
            shadow: 1,
            opacity: 1,
            titleColor: theme === "light" ? "#1F2937" : "#FFFFFF",
        },
        {
            id: 2,
            title: "Project Ideas",
            description: "Brainstorming ideas for the new project.",
            imageUrl: null,
            borderColor: '',
            bgColor: theme === "light" ? "#F3F4F6" : "#1F2937",
            shadow: 1,
            opacity: 1,
            titleColor: theme === "light" ? "#1F2937" : "#FFFFFF",
        },
    ]);
    const [customizingFolderId, setCustomizingFolderId] = useState<number | null>(null);
    const [customTitle, setCustomTitle] = useState("");
    const [customTitleColor, setCustomTitleColor] = useState(
        theme === "light" ? "#1F2937" : "#FFFFFF"
    );
    const [customBgColor, setCustomBgColor] = useState("#ffffff");
    const [customBorderColor, setCustomBorderColor] = useState("#F5F5F5");
    const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
    const [customShadow, setCustomShadow] = useState(1); // Default to "Light" shadow
    const [customOpacity, setCustomOpacity] = useState(1);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const getTitleLimit = useCallback(() => {
        if (panelWidth >= 1280) return 20; // xl
        if (panelWidth >= 1024) return 15; // lg
        if (panelWidth >= 768) return 12; // md
        return 10; // sm and below
    }, [panelWidth]);

    const getDescriptionLimit = useCallback(() => {
        if (panelWidth >= 1280) return 40; // xl
        if (panelWidth >= 1024) return 30; // lg
        if (panelWidth >= 768) return 25; // md
        return 20; // sm and below
    }, [panelWidth]);

    const getColumnCount = useCallback(() => {
        const fixedFolderWidth = 165; // Largura fixa das pastas em pixels
        const minColumns = 2; // Mínimo de colunas
        const maxColumns = 6; // Máximo de colunas

        // Calcula o número de colunas com base no panelWidth e na largura fixa
        const maxPossibleColumns = Math.floor(panelWidth / (fixedFolderWidth + 12)); // +12 para considerar o gap-3 (3px entre colunas)
        return Math.min(maxColumns, Math.max(minColumns, maxPossibleColumns));
    }, [panelWidth]);

    const handleOpenFolder = (folderId: number) => {
        onOpenFolder(folderId);
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

    const handleRenameFolder = (folderId: number) => {
        const newTitle = prompt("Enter new folder title:");
        if (newTitle) {
            setFolders((prev) =>
                prev.map((folder) =>
                    folder.id === folderId ? { ...folder, title: newTitle } : folder
                )
            );
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setCustomImageUrl(null);
    };

    const handleDuplicateFolder = (folderId: number) => {
        const folder = folders.find((f) => f.id === folderId);
        if (folder) {
            setFolders((prev) => [
                ...prev,
                { ...folder, id: Date.now(), title: `${folder.title} (Copy)` },
            ]);
        }
    };

    const handleDeleteFolder = (folderId: number) => {
        setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    };

    const handleSaveCustomization = () => {
        const updatedFolders = folders.map((folder) =>
            folder.id === customizingFolderId
                ? {
                    ...folder,
                    title: customTitle || folder.title, // Evitar sobrescrever com vazio
                    bgColor: customBgColor || folder.bgColor,
                    borderColor: customBorderColor || folder.borderColor,
                    imageUrl: customImageUrl !== undefined ? customImageUrl : folder.imageUrl,
                    shadow: customShadow || folder.shadow,
                    opacity: customOpacity !== undefined ? customOpacity : folder.opacity,
                    titleColor: customTitleColor || (theme === "light" ? "#1F2937" : "#FFFFFF"),
                }
                : folder
        );

        setFolders(updatedFolders);

        // Persistir no localStorage com a versão atualizada
        // if (typeof window !== "undefined") {
        //   localStorage.setItem("smartNotesFolders", JSON.stringify(updatedFolders));
        // }

        setCustomizingFolderId(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            className={`grid grid-cols-${getColumnCount()} gap-3 space-y-4`}
            style={{
                gridTemplateColumns: `repeat(${getColumnCount()}, 165px)`, // Largura fixa de 140px por coluna
                // justifyContent: "center",
                padding: "0 6px", // Padding para evitar cortes nas bordas
                boxSizing: "border-box",
            }}
        >
            <AnimatePresence>
                {folders.map((folder) => (
                    <motion.div
                        key={folder.id}
                        layout
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-[160px] h-[180px]" // Tamanho fixo para largura e altura
                    >
                        <motion.div
                            className="rounded-xl transition border-2 flex flex-col overflow-hidden h-full"
                            style={{
                                backgroundColor: folder.bgColor,
                                // boxShadow: folder.shadow,
                                opacity: folder.opacity,
                                borderColor: theme === "light" ? "#F5F5F5" : "#94a3b8",
                            }}
                            onClick={() => handleOpenFolder(folder.id)}
                            whileHover={{ scale: 1.05, boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)" }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            <div
                                className="w-full h-18"
                                style={{
                                    backgroundImage: folder.imageUrl ? `url(${folder.imageUrl})` : "none",
                                    backgroundColor: !folder.imageUrl ? (theme === "light" ? "#e5e7eb" : "#475569") : "transparent",
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
                            <div className="p-2 flex flex-col justify-between flex-grow">
                                <h2
                                    className="text-sm font-semibold"
                                    style={{
                                        color: folder.titleColor || (theme === "light" ? "#1F2937" : "#FFFFFF"),
                                    }}
                                >
                                    {folder.title.length > getTitleLimit() ? folder.title.slice(0, getTitleLimit()) + "..." : folder.title}
                                </h2>
                                <p className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"} mt-1 flex-grow`}>
                                    {folder.description && folder.description.length > getDescriptionLimit() ? folder.description.slice(0, getDescriptionLimit()) + "..." : folder.description}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCustomizeFolder(folder.id);
                                    }}
                                    className={`p-1 rounded-full self-end mt-1 ${theme === "light" ? "bg-white text-gray-900 hover:bg-gray-200" : "bg-slate-800 text-gray-100 hover:bg-slate-600"}`}
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
                        <div className="py-1 flex items-center justify-between px-1 relative">
                            <div className={`text-xs ${theme === "light" ? "text-neutral-700" : "text-neutral-300"}`}>
                            </div>
                            <div
                                className={`p-1 ${theme === "light" ? "text-neutral-700 hover:bg-neutral-200" : "text-neutral-300 hover:bg-slate-700"} rounded-full cursor-pointer`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === folder.id ? null : folder.id);
                                }}
                            >
                                <MoreHorizontal size={18} />
                            </div>
                            <AnimatePresence>
                                {openMenuId === folder.id && (
                                    <motion.div
                                        ref={menuRef}
                                        className={`absolute right-1 p-1 top-6 z-10 rounded-md shadow-lg ${theme === "light" ? "bg-white" : "bg-slate-800"}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        <div className="py-1">
                                            <button
                                                className={`block w-full text-left px-3 py-1 text-xs ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRenameFolder(folder.id);
                                                }}
                                            >
                                                Rename
                                            </button>
                                            <button
                                                className={`block w-full text-left px-3 py-1 text-xs ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDuplicateFolder(folder.id);
                                                }}
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                className={`block w-full text-left px-3 py-1 text-xs ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
                                                onClick={(e) => console.log("Share your thoughts, may be good for someone else!")}
                                            >
                                                Share
                                            </button>
                                            <button
                                                className={`block w-full text-left px-3 py-1 text-xs ${theme === "light" ? "text-red-600 hover:bg-red-400/10" : "text-red-500 hover:bg-red-700/20"}`}
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

        </div>
    );
};

export default NotesFolders;