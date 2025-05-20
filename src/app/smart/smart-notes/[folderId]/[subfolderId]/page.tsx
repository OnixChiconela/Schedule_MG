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
import { generateText, simulateStreaming } from "@/app/api/actions/AI/hugging_face/generateText";
import { canUseAI } from "@/app/api/actions/AI/CanUseAI";
import Quill from "quill";

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
    const [isGenerating, setIsGenerating] = useState(false);

    // Inicializa o Quill Editor
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

                    const bounds = quill.getBounds(selection.index, selection.length);
                    const editor = quillRef.current?.querySelector(".ql-editor");
                    if (editor) {
                        const editorRect = editor.getBoundingClientRect();
                        setSelectionBounds({
                            top: editorRect.top + bounds!.top - 40,
                            left: editorRect.left + bounds!.left + bounds!.width / 2 - 50,
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

    // Remove o prefixo "Creating..." quando a geração termina
    useEffect(() => {
        if (!isGenerating && quill) {
            const currentHTML = quill.root.innerHTML;
            const prefix = '<p><span style="opacity: 0.5;">Creating...</span> </p>';
            if (currentHTML.includes(prefix)) {
                const cleanedContent = currentHTML.replace(prefix, '');
                quill.clipboard.dangerouslyPasteHTML(cleanedContent);
                setNoteContent(cleanedContent);
            }
        }
    }, [isGenerating, quill]);

    const handleAISubmit = async (prompt: string) => {
        setIsModalOpen(false); // Fecha o modal imediatamente após o envio
        setIsGenerating(true);
        const response = await generateText(prompt);

        if (!response) {
            toast.error("Oops. Please try again.");
            setIsGenerating(false);
            return;
        }

        if (quill) {
            const selection = quill.getSelection();
            const insertIndex = selection ? selection.index : quill.getLength() - 1;

            // Adiciona o prefixo "Creating..." com opacidade reduzida
            quill.insertText(insertIndex, '\n<p><span style="opacity: 0.5;">Creating...</span> </p>\n');

            let currentContent = '';

            // Simula o streaming do texto a partir da posição do cursor
            await simulateStreaming(
                response,
                (chunk: string) => {
                    currentContent += chunk;
                    quill.deleteText(insertIndex, currentContent.length); // Remove o texto temporário anterior
                    quill.insertText(insertIndex, currentContent);
                    setNoteContent(quill.root.innerHTML);
                },
                5, // Tamanho do chunk (5 palavras por vez)
                200 // Atraso entre chunks (200ms)
            );

            // Remove o prefixo após a geração (já feito no useEffect)
            setNoteContent(quill.root.innerHTML);
        }

        setIsGenerating(false);
    };

    const handleEnhanceText = async () => {
        if (!selectedText || !quill) return;

        const prompt = `Enhance this text: ${selectedText}`;
        setIsGenerating(true);
        const response = await generateText(prompt);
        if (!response) {
            toast.error("Oops. Please try again.");
            setIsGenerating(false);
            return;
        }

        const selection = quill.getSelection();
        if (selection) {
            const insertIndex = selection.index;
            quill.deleteText(insertIndex, selection.length);

            await simulateStreaming(
                response,
                (chunk: string) => {
                    quill.insertText(insertIndex, chunk);
                    setNoteContent(quill.root.innerHTML);
                },
                5,
                200
            );
        }

        setIsGenerating(false);
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
                                    : "bg-slate-700 hover:bg-slate-600 text-neutral-200"
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
                                    : "bg-slate-700 hover:bg-slate-600 text-neutral-200"
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
                            className={`w-full h-screen rounded-xl border ${theme === "light"
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
                        {isGenerating && (
                            <div className="mt-4 flex items-center space-x-2">
                                <svg
                                    className="animate-spin h-5 w-5 text-blue-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                </svg>
                                <span
                                    className={theme === "light" ? "text-gray-600" : "text-gray-400"}
                                >
                                    Generating...
                                </span>
                            </div>
                        )}
                    </div>

                    <AIModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleAISubmit}
                        isGenerating={isGenerating}
                    />
                </main>
            </div>
            <style jsx global>{`
                .ql-toolbar {
                    background: ${theme === "light" ? "#f9fafb" : "#1f2937"} !important;
                    border: none !important;
                    margin-bottom: 10px;
                    display: flex;
                    border-radius: 12px;
                }
                
                .ql-toolbar .ql-picker-label {
                    color: ${theme === "light" ? "#111827" : "#e5e7eb"} !important
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
                }
            `}</style>
        </ClientOnly>
    );
};

export default SubfolderNote;