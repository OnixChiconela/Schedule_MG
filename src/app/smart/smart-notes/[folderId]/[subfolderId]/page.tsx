"use client";

import ClientOnly from "@/app/components/ClientOnly";
import TrackingNav from "@/app/components/navbars/trackingNav";
import ToolsNavbar from "@/app/components/navbars/ToolsNavbar";
import { useTheme } from "@/app/themeContext";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.core.css";

import AIModal from "@/app/components/smart/smartnotes/subfolders/AIModal";
import { Save, Sparkles } from "lucide-react";
import { generateText } from "@/app/api/actions/AI/hugging_face/generateText";
import { canUseAI } from "@/app/api/actions/AI/CanUseAI";

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

const SubfolderNote = () => {
    const { theme } = useTheme();
    const [folders, setFolders] = useState<Folder[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("smartNotesFolders");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const { folderId, subfolderId } = useParams();
    const folder = folders.find((f) => f.id === parseInt(folderId as string));
    const subfolder = folder?.subfolders.find((sf) => sf.id === parseInt(subfolderId as string));
    const [noteContent, setNoteContent] = useState<string>(() => {
        if (subfolder && subfolder.content) {
            try {
                const parsedContent = JSON.parse(subfolder.content);
                if (parsedContent.textLines && Array.isArray(parsedContent.textLines)) {
                    return parsedContent.textLines
                        .map((line: any) => (typeof line === "string" ? line : line.text || ""))
                        .join("\n");
                }
                return parsedContent || "";
            } catch (e) {
                console.error("Failed to parse subfolder content:", e);
                return "";
            }
        }
        return "";
    });
    const { quill, quillRef } = useQuill({
        theme: "snow",
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline"],
                [{ color: [] }],
                ["clean"],
            ],
        },
        placeholder: "Start typing your notes here...",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showEnhanceButton, setShowEnhanceButton] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [selectionBounds, setSelectionBounds] = useState<{ top: number; left: number } | null>(null);
    const isInitialized = useRef(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Depuração e inicialização do Quill
    useEffect(() => {
        if (quill && !isInitialized.current) {
            quill.setContents([]);
            quill.clipboard.dangerouslyPasteHTML(noteContent || "<p></p>");
            isInitialized.current = true;
        }
    }, [quill, noteContent]);

    // Sincronizar mudanças do Quill com o estado (com debounce)
    useEffect(() => {
        if (quill) {
            let timeout: NodeJS.Timeout;
            const handleTextChange = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    const newContent = quill.root.innerHTML;
                    if (newContent !== noteContent) {
                        setNoteContent(newContent);
                    }
                }, 300);
            };

            quill.on("text-change", handleTextChange);

            return () => {
                quill.off("text-change", handleTextChange);
                clearTimeout(timeout);
            };
        }
    }, [quill, noteContent]);

    // Detectar seleção de texto no Quill
    useEffect(() => {
        if (quill) {
            const handleSelectionChange = () => {
                const selection = quill.getSelection();
                if (selection && selection.length > 0) {
                    const selectedContent = quill.getText(selection.index, selection.length);
                    setSelectedText(selectedContent);
                    setShowEnhanceButton(true);

                    // Obter a posição da seleção
                    const bounds = quill.getBounds(selection.index, selection.length);
                    const editor = quillRef.current?.querySelector(".ql-editor");
                    if (editor) {
                        const editorRect = editor.getBoundingClientRect();
                        setSelectionBounds({
                            top: editorRect.top + bounds!.top - 40, // Ajustar para aparecer acima
                            left: editorRect.left + bounds!.left + bounds!.width / 2 - 50, // Centralizar o botão
                        });
                    }
                } else {
                    setShowEnhanceButton(false);
                    setSelectedText("");
                    setSelectionBounds(null);
                }
            };

            quill.on("selection-change", handleSelectionChange);

            return () => {
                quill.off("selection-change", handleSelectionChange);
            };
        }
    }, [quill, quillRef]);

    // Salvar no localStorage a cada mudança (com debounce)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const timeout = setTimeout(() => {
                const updatedFolders = folders.map((f) => {
                    if (f.id !== folder?.id) return f;
                    const updatedSubfolders = f.subfolders.map((sf) =>
                        sf.id === subfolder?.id ? { ...sf, content: JSON.stringify(noteContent) } : sf
                    );
                    return { ...f, subfolders: updatedSubfolders };
                });
                localStorage.setItem("smartNotesFolders", JSON.stringify(updatedFolders));
                setFolders(updatedFolders);
            }, 500);

            return () => clearTimeout(timeout);
        }
    }, [noteContent, folder, subfolder]);

    if (!folder || !subfolder) {
        return <div>Subfolder not found</div>;
    }

    const handleSave = () => {
        toast.success("Subfolder updated");
    };

    const openAIModal = () => {
        setIsModalOpen(true);
    };

    const handleAISubmit = async (prompt: string) => {
        const response = await generateText(prompt);
        if (!response) {
            toast.error("Oops. Please try again.");
            return;
        }

        if (quill) {
            quill.setContents([]);
            quill.clipboard.dangerouslyPasteHTML(response);
            const newContent = quill.root.innerHTML;
            setNoteContent(newContent);
        }
        setIsModalOpen(false);
    };

    const handleEnhanceText = async () => {
        if (!selectedText || !quill) return;

        const prompt = `Enhance this text: ${selectedText}`;
        const response = await generateText(prompt);
        if (!response) {
            toast.error("Oops. Please try again.");
            return;
        }

        const selection = quill.getSelection();
        if (selection) {
            quill.deleteText(selection.index, selection.length);
            quill.insertText(selection.index, response);
            const newContent = quill.root.innerHTML;
            setNoteContent(newContent);
        }
        setShowEnhanceButton(false);
        setSelectedText("");
        setSelectionBounds(null);
    };

    return (
        <ClientOnly>
            <TrackingNav themeButton={true} />
            <div
                className={`min-h-screen flex ${theme === "light" ? "bg-white" : "bg-slate-900"} transition-colors duration-300`}
                style={{
                    paddingTop: "env(safe-area-inset-top, 0px)",
                }}
            >
                <div className="">
                    <ToolsNavbar />
                </div>

                <header
                    className={`fixed w-full border-b-[1px] z-10 top-[80px] pt-4 pb-2 bg-opacity-90 ${theme === "light" ? "bg-white border-b-neutral-300" : "bg-slate-700 border-b-neutral-800"}`}
                    style={{
                        backdropFilter: "blur(5px)",
                    }}
                >
                    <div className="flex justify-between items-center lg:ml-[260px] mx-auto px-6">
                        <h1 className={`text-lg font-semibold ${theme === "light" ? "text-neutral-700" : "text-neutral-300"}`}>
                            {folder.title} / {subfolder.title}
                        </h1>
                        <div className="flex space-x-2">
                            <motion.button
                                onClick={handleSave}
                                className={`px-2 py-1 rounded-2xl font-semibold transition-colors ${theme === "light"
                                    ? "bg-neutral-800 hover:bg-black text-white"
                                    : "bg-neutral-200 hover:bg-neutral-100 text-gray-800"
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Save />
                            </motion.button>
                            <motion.button
                                onClick={openAIModal}
                                className={`px-2 py-1 rounded-2xl font-semibold transition-colors ${theme === "light"
                                    ? "bg-neutral-800 hover:bg-black text-white"
                                    : "bg-neutral-200 hover:bg-neutral-100 text-gray-800"
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Sparkles />
                            </motion.button>
                        </div>
                    </div>
                </header>
                <main
                    className="flex-1 p-6 lg:ml-[240px] overscroll-y-contain"
                    style={{
                        paddingTop: `calc(5rem + env(safe-area-inset-top, 0px) + 105px)`,
                    }}
                >
                    <div className="flex flex-col h-full -mt-7">
                        <div
                            ref={quillRef}
                            className={`w-full h-screen rounded-xl border -pt- ${theme === "light"
                                ? "border-gray-100 bg-white text-black"
                                : "border-slate-600 bg-slate-800 text-white"
                                } quill-editor`}
                            style={{ minHeight: "300px", maxHeight: "80vh", overflow: "auto" }}
                        />
                        {showEnhanceButton && selectionBounds && (
                            <div
                                ref={buttonRef}
                                className={`absolute px-3 py-1 rounded-full shadow-md cursor-pointer transition-colors ${theme === "light"
                                    ? "bg-neutral-200 text-gray-700 hover:bg-neutral-300"
                                    : "bg-slate-700 text-gray-200 hover:bg-slate-600"
                                    }`}
                                style={{
                                    position: "absolute",
                                    zIndex: 20,
                                    top: `${selectionBounds.top}px`,
                                    left: `${selectionBounds.left}px`,
                                }}
                                onClick={handleEnhanceText}
                            >
                                Enhance with AI
                            </div>
                        )}
                    </div>

                    <AIModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleAISubmit}
                    />
                </main>
            </div>
            <style jsx global>{`
                .ql-toolbar {
                    background: ${theme == "light" ? "#f9fafb" : "#1f2937"} !important;
                    border: none !important;
                    margin-bottom: 10px;
                    display: flex;
                    border-radius: 12px;
                }
                
                .ql-toolbar .ql-picker-label {
                    color: ${theme == "light" ? "#111827" : "#e5e7eb"} !important
                }
                .ql-toolbar button.ql-active,
                .ql-toolbar .ql-picker.ql-active .ql-picker-label {
                    text-color: #7c3aed !important;
                    border-color: #c4b5fd !important;
                }
                .quill-editor :global(.ql-container) {
                    border: none !important;
                    font-size: 16px;
                    height: 100%;
                }
                .quill-editor :global(.ql-toolbar) {
                    border: none !important;
                    background: ${theme === "light" ? "#f3f4f6" : "#1f2937"};
                }
                .quill-editor :global(.ql-editor h1) {
                    font-size: 18px;
                    font-weight: bold;
                }
                .quill-editor :global(.ql-editor h2) {
                    font-size: 16px;
                    font-weight: bold;
                }
                .quill-editor :global(.ql-editor) {
                    color: ${theme === "light" ? "#000" : "#fff"};
                    min-height: 250px;
                    padding: 12px;
                    overflow-y: auto;
                }
                .quill-editor :global(.ql-editor:focus) {
                    outline: none;
                }
                
                @media (max-width: 600px) {
                .ql-toolbar {
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: flex-start
                }
                .ql-toolbar button svg {
                    width: 15px !important;
                    height: 15px !important;
                    horizontal-align: middle;
                }

                .ql-toolbar button {
                    line-height: 1 !important;
                    padding: 6px !important;
                }
                    
            `}</style>
        </ClientOnly>
    );
};

export default SubfolderNote;