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
import AIModal from "@/app/components/smart/smartnotes/subfolders/AIModal";
import { Save, Sparkles } from "lucide-react";
import { generateText } from "@/app/api/actions/AI/hugging_face/generateText";

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
                [{ color: [""] }],
                ["clean"],
            ],
        },
        placeholder: "Start typing your notes here...",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isInitialized = useRef(false);

    // Depuração e inicialização do Quill
    useEffect(() => {
        console.log("quill:", quill);
        console.log("quillRef:", quillRef);
        if (quill && !isInitialized.current) {
            console.log("Inicializando Quill com conteúdo:", noteContent);
            quill.setContents([]); // Limpar o editor
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
                        console.log("Texto alterado:", newContent);
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
            console.log("Resposta da API:", response);
            quill.setContents([]); // Limpar o editor
            quill.clipboard.dangerouslyPasteHTML(response);
            const newContent = quill.root.innerHTML;
            console.log("Novo conteúdo após AI Edit:", newContent);
            setNoteContent(newContent);
        }
        setIsModalOpen(false);
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
                <div className="z-[15]">
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
                                className={`px-5 py-1 rounded-xl font-semibold transition-colors ${theme === "light"
                                    ? "bg-neutral-800 hover:bg-black text-white"
                                    : "bg-neutral-900 hover:bg-black text-gray-200"
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Save />
                            </motion.button>
                            <motion.button
                                onClick={openAIModal}
                                className={`px-5 py-1 rounded-xl font-semibold transition-colors ${theme === "light"
                                    ? "bg-neutral-800 hover:bg-black text-white"
                                    : "bg-neutral-900 hover:bg-black text-gray-200"
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
                    <div className="flex flex-col h-full">
                        <div
                            ref={quillRef}
                            className={`w-full rounded-xl border ${theme === "light"
                                ? "border-gray-100 bg-white text-black"
                                : "border-slate-600 bg-slate-800 text-white"
                                } quill-editor`}
                            style={{ minHeight: "300px", maxHeight: "80vh", overflow: "auto" }}
                        />
                    </div>

                    <AIModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleAISubmit}
                    />
                </main>
            </div>
            <style jsx>{`
                .quill-editor :global(.ql-container) {
                    border: none !important;
                    font-size: 16px;
                    height: 100%;
                }
                .quill-editor :global(.ql-toolbar) {
                    border: none !important;
                    background: ${theme === "light" ? "#f3f4f6" : "#1f2937"};
                    border-radius: 8px;
                    padding: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .quill-editor :global(.ql-editor) {
                    min-height: 250px;
                    padding: 12px;
                    overflow-y: auto;
                }
                .quill-editor :global(.ql-editor:focus) {
                    outline: none;
                }
                /* Estilizar headings */
                .quill-editor :global(.ql-editor h1) {
                    font-size: 20px;
                    font-weight: bold;
                }
                .quill-editor :global(.ql-editor h2) {
                    font-size: 17.5px;
                    font-weight: bold;
                }
                /* Ajustar cor do texto sem sobrescrever cores aplicadas */
                .quill-editor :global(.ql-editor p) {
                    color: ${theme === "light" ? "#000" : "#fff"};
                }
                /* Estilizar botões e dropdowns */
                .quill-editor :global(.ql-format) {
                    padding: 6px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                .quill-editor :global(.ql-format:hover),
                .quill-editor :global(.ql-format.ql-active) {
                    background: ${theme === "light" ? "#e5e7eb" : "#374151"};
                }
                .quill-editor :global(.ql-picker) {
                    color: ${theme === "light" ? "#000" : "#fff"} !important;
                    border-radius: 4px;
                    padding: 6px;
                }
                .quill-editor :global(.ql-picker-label) {
                    color: ${theme === "light" ? "#000" : "#fff"} !important;
                }
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-label),
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-options) {
                    color: ${theme === "light" ? "#000" : "#fff"} !important;
                    border-color: ${theme === "light" ? "#000" : "#fff"} !important;
                }
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-label:hover),
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-label.ql-active) {
                    color: ${theme === "light" ? "#000" : "#fff"} !important;
                    background: ${theme === "light" ? "#e5e7eb" : "#374151"} !important;
                }
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-options) {
                    background: ${theme === "light" ? "#fff" : "#1f2937"} !important;
                    border: 1px solid ${theme === "light" ? "#000" : "#fff"} !important;
                    border-radius: 8px;
                    padding: 5px;
                    min-width: 120px;
                    max-width: 150px;
                }
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-item) {
                    color: ${theme === "light" ? "#000" : "#fff"} !important;
                    border-radius: 4px;
                    padding: 4px 8px;
                }
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-item:hover),
                .quill-editor :global(.ql-picker.ql-expanded .ql-picker-item.ql-selected) {
                    background: ${theme === "light" ? "#e5e7eb" : "#374151"} !important;
                    color: ${theme === "light" ? "#000" : "#fff"} !important;
                }
                /* Responsividade para celulares */
                @media (max-width: 600px) {
                    .quill-editor :global(.ql-toolbar) {
                        font-size: 14px;
                        padding: 4px;
                    }
                    .quill-editor :global(.ql-format) {
                        padding: 4px;
                    }
                    .quill-editor :global(.ql-picker) {
                        padding: 4px;
                    }
                    .quill-editor :global(.ql-picker.ql-expanded .ql-picker-options) {
                        min-width: 100px;
                        max-width: 120px;
                        font-size: 12px;
                        padding: 3px;
                    }
                    .quill-editor :global(.ql-picker.ql-expanded .ql-picker-item) {
                        padding: 3px 6px;
                    }
                }
            `}</style>
        </ClientOnly>
    );
};

export default SubfolderNote;