"use client";

import ClientOnly from "@/app/components/ClientOnly";
import Navbar from "@/app/components/navbars/Navbar";
import { useTheme } from "@/app/themeContext";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { format, isSameYear } from "date-fns";
import SideNavbar from "@/app/components/navbars/SideNavbar";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CreateSubfolderModal from "@/app/components/smart/smartnotes/folders/createSubfolderModal";

type Subfolder = {
    id: number;
    title: string;
    description: string;
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

// Componente para cada card de subfolder com suporte a drag-and-drop
const SubfolderCard = ({
    subfolder,
    theme,
    openMenuId,
    setOpenMenuId,
    handleOpenSubfolder,
    handleEditSubfolder,
    handleDeleteSubfolder,
    isDraggable,
}: {
    subfolder: Subfolder;
    theme: string;
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
    handleOpenSubfolder: (subfolderId: number) => void;
    handleEditSubfolder: (subfolderId: number) => void;
    handleDeleteSubfolder: (subfolderId: number) => void;
    isDraggable: boolean;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: subfolder.id.toString(),
        disabled: !isDraggable,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setOpenMenuId]);

    return (
        <motion.div
            layout
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <motion.div
                ref={setNodeRef}
                style={style}
                {...(isDraggable ? { ...attributes, ...listeners } : {})}
                className={`rounded-xl border-2 cursor-pointer p-4 flex flex-col gap-2 h-[180px] ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-slate-600"} relative`}
                onClick={() => handleOpenSubfolder(subfolder.id)}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
            >
                <div className="flex justify-between items-start">
                    <h2 className={`text-lg font-semibold line-clamp-2 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
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
                                className={`absolute right-0 p-1 top-10 z-10 rounded-md shadow-lg ${theme === "light" ? "bg-white" : "bg-slate-800"} sm:w-32`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                            >
                                <div className="py-1">
                                    <button
                                        className={`block w-full text-left rounded-md px-4 py-2 text-sm ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-slate-700"}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSubfolder(subfolder.id);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`block w-full text-left rounded-md px-4 py-2 text-sm ${theme === "light" ? "text-red-600 hover:bg-red-400/10" : "text-red-500 hover:bg-red-700/20"}`}
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
                <p className={`text-sm flex-1 line-clamp-3 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                    {subfolder.description.length > 100 ? subfolder.description.slice(0, 100) + "..." : subfolder.description}
                </p>
                <p className={`text-xs ${theme === "light" ? "text-gray-400" : "text-gray-500"}`}>
                    Created: {(() => {
                        const createdDate = new Date(subfolder.createdAt);
                        const currentDate = new Date();
                        const formatString = isSameYear(createdDate, currentDate) ? "dd MMM" : "dd MMM yyyy";
                        return format(createdDate, formatString);
                    })()}
                </p>
                {isDraggable && (
                    <div className="absolute bottom-2 right-2">
                        <GripVertical size={16} className="text-gray-400 cursor-grab" />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

const FolderPage = () => {
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
    const { theme, toggleTheme } = useTheme();
    const folder = folders.find((f) => f.id === parseInt(folderId as string));
    const [isSubfolderModalOpen, setIsSubfolderModalOpen] = useState(false);
    const [subfolderTitle, setSubfolderTitle] = useState("");
    const [subfolderDescription, setSubfolderDescription] = useState("");
    const [subfolderContent, setSubfolderContent] = useState("");
    const [editingSubfolderId, setEditingSubfolderId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("smartNotesFolders", JSON.stringify(folders));
        }
    }, [folders]);

    const handleCreateSubfolder = () => {
        setIsSubfolderModalOpen(true);
        setSubfolderTitle("");
        setSubfolderDescription("");
        setSubfolderContent("");
        setEditingSubfolderId(null);
    };

    const handleEditSubfolder = (subfolderId: number) => {
        const subfolder = folder?.subfolders.find((sf) => sf.id === subfolderId);
        if (subfolder) {
            setIsSubfolderModalOpen(true);
            setSubfolderTitle(subfolder.title);
            setSubfolderDescription(subfolder.description);
            setSubfolderContent(subfolder.content);
            setEditingSubfolderId(subfolderId);
            setOpenMenuId(null);
        }
    };

    const handleSaveSubfolder = (title: string, description: string, content: string) => {
        if (!title.trim()) {
            toast.error("Subfolder title cannot be empty");
            return;
        }

        if (description.length > 150) {
            toast.error("Description cannot exceed 150 characters");
            return;
        }

        const updatedFolders = folders.map((f) => {
            if (f.id !== parseInt(folderId as string)) return f;
            if (editingSubfolderId !== null) {
                const updatedSubfolders = f.subfolders.map((sf) =>
                    sf.id === editingSubfolderId
                        ? { ...sf, title, description, content }
                        : sf
                );
                return { ...f, subfolders: updatedSubfolders };
            } else {
                const newSubfolder: Subfolder = {
                    id: f.subfolders.length ? Math.max(...f.subfolders.map((sf) => sf.id)) + 1 : 1,
                    title,
                    description,
                    content,
                    createdAt: new Date().toISOString(),
                };
                return { ...f, subfolders: [...f.subfolders, newSubfolder] };
            }
        });

        setFolders(updatedFolders);
        setIsSubfolderModalOpen(false);
        setSubfolderTitle("");
        setSubfolderDescription("");
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

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id && folder?.subfolders.length! > 1) {
            const updatedFolders = folders.map((f) => {
                if (f.id !== parseInt(folderId as string)) return f;
                const subfolders = [...f.subfolders];
                const oldIndex = subfolders.findIndex((sf) => sf.id.toString() === active.id);
                const newIndex = subfolders.findIndex((sf) => sf.id.toString() === over.id);
                const [movedSubfolder] = subfolders.splice(oldIndex, 1);
                subfolders.splice(newIndex, 0, movedSubfolder);
                return { ...f, subfolders };
            });
            setFolders(updatedFolders);
        }

        setActiveId(null);
    };

    if (!folder) {
        return <div>Folder not found</div>;
    }

    const activeSubfolder = activeId ? folder.subfolders.find((sf) => sf.id.toString() === activeId) : null;
    const isDraggable = folder.subfolders.length > 1;

    return (
        <ClientOnly>
            <Navbar
                themeButton={false}
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
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={folder.subfolders.map((sf) => sf.id.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                                        <AnimatePresence>
                                            {folder.subfolders.map((subfolder) => (
                                                <SubfolderCard
                                                    key={subfolder.id}
                                                    subfolder={subfolder}
                                                    theme={theme}
                                                    openMenuId={openMenuId}
                                                    setOpenMenuId={setOpenMenuId}
                                                    handleOpenSubfolder={handleOpenSubfolder}
                                                    handleEditSubfolder={handleEditSubfolder}
                                                    handleDeleteSubfolder={handleDeleteSubfolder}
                                                    isDraggable={isDraggable}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </SortableContext>
                                <DragOverlay>
                                    {activeSubfolder && isDraggable ? (
                                        <motion.div
                                            className={`rounded-xl border-2 cursor-pointer p-4 flex flex-col gap-2 h-[180px] ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-slate-600"} relative opacity-75`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h2 className={`text-lg font-semibold line-clamp-2 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                                                    {activeSubfolder.title}
                                                </h2>
                                            </div>
                                            <p className={`text-sm flex-1 line-clamp-3 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                                                {activeSubfolder.description.length > 100 ? activeSubfolder.description.slice(0, 100) + "..." : activeSubfolder.description}
                                            </p>
                                            <p className={`text-xs ${theme === "light" ? "text-gray-400" : "text-gray-500"}`}>
                                                Created: {(() => {
                                                    const createdDate = new Date(activeSubfolder.createdAt);
                                                    const currentDate = new Date();
                                                    const formatString = isSameYear(createdDate, currentDate) ? "dd MMM" : "dd MMM yyyy";
                                                    return format(createdDate, formatString);
                                                })()}
                                            </p>
                                            <div className="absolute bottom-2 right-2">
                                                <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        )}
                    </div>

                    <CreateSubfolderModal
                        isOpen={isSubfolderModalOpen}
                        onClose={() => {
                            setIsSubfolderModalOpen(false);
                            setSubfolderTitle("");
                            setSubfolderDescription("");
                            setSubfolderContent("");
                            setEditingSubfolderId(null);
                        }}
                        onSubmit={handleSaveSubfolder}
                        initialTitle={subfolderTitle}
                        initialDescription={subfolderDescription}
                        initialContent={subfolderContent}
                        isEditing={editingSubfolderId !== null}
                    />
                </main>
            </div>
        </ClientOnly>
    );
};

export default FolderPage;