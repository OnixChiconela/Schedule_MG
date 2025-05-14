"use client";

import ClientOnly from "@/app/components/ClientOnly";
import Navbar from "@/app/components/navbars/Navbar";
import { useTheme } from "@/app/themeContext";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal } from "lucide-react";
import { format, isSameYear } from "date-fns";

type Subfolder = {
    id: number;
    title: string;
    description: string; // Novo campo para descrição (máximo 150 caracteres)
    content: string;
    createdAt: string;
};

type Folder = {
    id: number;
    title: string;
    bgColor: string;
    borderColor: string;
    imageUrl: string | null;
    shadow: string;
    opacity: number;
    subfolders: Subfolder[];
};

const FolderPage = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { folderId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [folders, setFolders] = useState<Folder[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("smartNotesFolders");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const folder = folders.find((f) => f.id === parseInt(folderId as string));
    const [isSubfolderModalOpen, setIsSubfolderModalOpen] = useState(false);
    const [subfolderTitle, setSubfolderTitle] = useState("");
    const [subfolderDescription, setSubfolderDescription] = useState(""); // Novo estado para descrição
    const [subfolderContent, setSubfolderContent] = useState("");
    const [editingSubfolderId, setEditingSubfolderId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("smartNotesFolders", JSON.stringify(folders));
        }
    }, [folders]);

    const handleCreateSubfolder = () => {
        setIsSubfolderModalOpen(true);
        setSubfolderTitle("");
        setSubfolderDescription(""); // Limpar descrição
        setSubfolderContent("");
        setEditingSubfolderId(null);
    };

    const handleEditSubfolder = (subfolderId: number) => {
        const subfolder = folder?.subfolders.find((sf) => sf.id === subfolderId);
        if (subfolder) {
            setIsSubfolderModalOpen(true);
            setSubfolderTitle(subfolder.title);
            setSubfolderDescription(subfolder.description); // Carregar descrição
            setSubfolderContent(subfolder.content);
            setEditingSubfolderId(subfolderId);
            setOpenMenuId(null);
        }
    };

    const handleSaveSubfolder = () => {
        if (!subfolderTitle.trim()) {
            toast.error("Subfolder title cannot be empty");
            return;
        }

        if (subfolderDescription.length > 150) {
            toast.error("Description cannot exceed 150 characters");
            return;
        }

        const updatedFolders = folders.map((f) => {
            if (f.id !== parseInt(folderId as string)) return f;
            if (editingSubfolderId !== null) {
                // Editar subpasta existente
                const updatedSubfolders = f.subfolders.map((sf) =>
                    sf.id === editingSubfolderId
                        ? { ...sf, title: subfolderTitle, description: subfolderDescription, content: subfolderContent }
                        : sf
                );
                return { ...f, subfolders: updatedSubfolders };
            } else {
                // Criar nova subpasta
                const newSubfolder: Subfolder = {
                    id: f.subfolders.length ? Math.max(...f.subfolders.map((sf) => sf.id)) + 1 : 1,
                    title: subfolderTitle,
                    description: subfolderDescription, // Salvar descrição
                    content: subfolderContent,
                    createdAt: new Date().toISOString(),
                };
                return { ...f, subfolders: [...f.subfolders, newSubfolder] };
            }
        });

        setFolders(updatedFolders);
        setIsSubfolderModalOpen(false);
        setSubfolderTitle("");
        setSubfolderDescription(""); // Limpar descrição
        setSubfolderContent("");
        setEditingSubfolderId(null);
        toast.success(editingSubfolderId !== null ? "Subfolder updated" : "Subfolder created");
    };

    const handleDeleteSubfolder = (subfolderId: number) => {
        const updatedFolders = folders.map((f) => {
            if (f.id !== parseInt(folderId as string)) return f;
            const updatedSubfolders = f.subfolders.filter((sf) => sf.id !== subfolderId);
            return { ...f, subfolders: updatedSubfolders };
        });
        setFolders(updatedFolders);
        setOpenMenuId(null);
        toast.success("Subfolder deleted");
    };

    const handleOpenSubfolder = (subfolderId: number) => {
        router.push(`/smart/smart-notes/${folderId}/${subfolderId}`);
    };

    if (!folder) {
        return <div>Folder not found</div>;
    }

    return (
        <ClientOnly>
            <Navbar
                themeButton={true}
                showToggleSidebarButton={true}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div
                className={`min-h-screen flex ${theme === "light" ? "bg-white" : "bg-slate-900"} transition-colors duration-300`}
                style={{
                    paddingTop: "env(safe-area-inset-top, 0px)",
                }}
            >
                <main
                    className="flex-1 overflow-y-auto p-6 pt-20 lg:ml-[260px]"
                    style={{
                        paddingTop: `calc(5rem + env(safe-area-inset-top, 0px))`,
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h1 className={`text-2xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                            {folder.title}
                        </h1>
                        <button
                            onClick={handleCreateSubfolder}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${theme === "light"
                                ? "bg-black text-white hover:bg-neutral-800"
                                : "bg-slate-900 text-gray-200 hover:bg-slate-700"
                                }`}
                        >
                            <Plus size={16} />
                            New Fragment
                        </button>
                    </div>

                    <div>
                        {folder.subfolders.length === 0 ? (
                            <div className={`h-full flex items-center ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                No fragments yet. Create one to get started.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                                <AnimatePresence>
                                    {folder.subfolders.map((subfolder) => (
                                        <motion.div
                                            key={subfolder.id}
                                            layout
                                            initial={{ opacity: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <motion.div
                                                className={`rounded-xl border-2 p-4 flex flex-col gap-2 ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-slate-600"}`}
                                                onClick={() => handleOpenSubfolder(subfolder.id)}
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h2 className={`text-lg font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                                                        {subfolder.title}
                                                    </h2>
                                                    <div
                                                        className={`p-1 ${theme === "light" ? "text-neutral-700 hover:bg-gray-200" : "text-neutral-300 hover:bg-slate-600"} rounded-full cursor-pointer`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === subfolder.id ? null : subfolder.id);
                                                        }}
                                                    >
                                                        <MoreHorizontal size={20} />
                                                    </div>
                                                    <AnimatePresence>
                                                        {openMenuId === subfolder.id && (
                                                            <motion.div
                                                                ref={menuRef}
                                                                className={`absolute right-2 top-8 z-10 rounded-md shadow-lg ${theme === "light" ? "bg-white" : "bg-slate-800"}`}
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                transition={{ duration: 0.1 }}
                                                            >
                                                                <div className="py-1">
                                                                    <button
                                                                        className={`block w-full text-left px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditSubfolder(subfolder.id);
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        className={`block w-full text-left px-4 py-2 text-sm ${theme === "light" ? "text-red-600 hover:bg-gray-100" : "text-red-500 hover:bg-slate-700"}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteSubfolder(subfolder.id);
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                                                    {subfolder.description.length > 100 ? subfolder.description.slice(0, 100) + "..." : subfolder.description}
                                                </p>
                                                <p className={`text-xs ${theme === "light" ? "text-gray-400" : "text-gray-500"}`}>
                                                    Created: {(() => {
                                                        const createdDate = new Date(subfolder.createdAt);
                                                        const currentDate = new Date(); // 14 de maio de 2025, 18:28 CAT
                                                        const formatString = isSameYear(createdDate, currentDate) ? "dd MMM" : "dd MMM yyyy";
                                                        return format(createdDate, formatString);
                                                    })()}
                                                </p>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {isSubfolderModalOpen && (
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
                                className={`p-6 rounded-xl shadow-lg w-full max-w-md ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-gray-700"}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <h2
                                    className={`text-xl font-semibold mb-6 ${theme === "light" ? "text-gray-900" : "text-white"}`}
                                >
                                    {editingSubfolderId !== null ? "Edit Subfolder" : "Create Subfolder"}
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                                            Subfolder Title
                                        </label>
                                        <input
                                            type="text"
                                            value={subfolderTitle}
                                            onChange={(e) => setSubfolderTitle(e.target.value)}
                                            className={`w-full p-2 rounded-md border ${theme === "light"
                                                ? "border-gray-300 bg-white text-gray-900"
                                                : "border-slate-600 bg-slate-800 text-gray-200"
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                                            Description (max 150 characters)
                                        </label>
                                        <textarea
                                            value={subfolderDescription}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 150) {
                                                    setSubfolderDescription(e.target.value);
                                                }
                                            }}
                                            className={`w-full p-2 rounded-md border ${theme === "light"
                                                ? "border-gray-300 bg-white text-gray-900"
                                                : "border-slate-600 bg-slate-800 text-gray-200"
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none`}
                                            placeholder="Enter a brief description..."
                                        />
                                        <p className={`text-xs mt-1 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                            {subfolderDescription.length}/150 characters
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <motion.button
                                            onClick={() => {
                                                setIsSubfolderModalOpen(false);
                                                setSubfolderTitle("");
                                                setSubfolderDescription("");
                                                setSubfolderContent("");
                                                setEditingSubfolderId(null);
                                            }}
                                            className={`px-5 py-2 rounded-xl font-semibold transition-colors ${theme === "light"
                                                ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                                                : "bg-slate-600 hover:bg-slate-500 text-gray-200"
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            onClick={handleSaveSubfolder}
                                            className={`px-5 py-2 rounded-xl font-semibold transition-colors ${theme === "light"
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
                </main>
            </div>
        </ClientOnly>
    );
};

export default FolderPage;