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
import { createPortal } from "react-dom";
import { marked } from "marked"
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
    const [isGenerating, setIsGenerating] = useState(false);

    const [showSummarizeButton, setShowSummarizeButton] = useState(false);
    const MIN_WORDS_FOR_SUMMARIZE = 50;
    const portalContainerRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        portalContainerRef.current = document.createElement("div");
        document.body.appendChild(portalContainerRef.current);
        return () => {
            if (portalContainerRef.current) {
                document.body.removeChild(portalContainerRef.current);
            }
        };
    }, []);

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
                // console.log("Evento de seleção disparado");
                const selection = quill.getSelection();
                if (selection && selection.length > 0) {
                    const selectedContent = quill.getText(selection.index, selection.length);
                    // console.log("Texto selecionado:", selectedContent);
                    setSelectedText(selectedContent);

                    const wordCount = selectedContent.trim().split(/\s+/).filter(word => word.length > 0).length;
                    // console.log("Contagem de palavras:", wordCount);
                    setShowEnhanceButton(true);
                    setShowSummarizeButton(wordCount >= MIN_WORDS_FOR_SUMMARIZE);
                    // console.log("Estado dos botões:", { showEnhanceButton: true, showSummarizeButton: wordCount >= MIN_WORDS_FOR_SUMMARIZE });

                    const bounds = quill.getBounds(selection.index, selection.length);
                    // console.log("Bounds da seleção:", bounds);
                    const editor = quillRef.current?.querySelector(".ql-editor");
                    if (editor) {
                        const editorRect = editor.getBoundingClientRect();
                        // console.log("Editor rect:", editorRect);
                        setSelectionBounds({
                            top: Math.max(0, editorRect.top + bounds!.top - 40),
                            left: Math.max(0, editorRect.left + bounds!.left + bounds!.width / 2 - (wordCount >= MIN_WORDS_FOR_SUMMARIZE ? 150 : 75)),
                        });
                        // console.log("Selection bounds! definidos:", {
                        //     top: Math.max(0, editorRect.top + bounds!.top - 40),
                        //     left: Math.max(0, editorRect.left + bounds!.left + bounds!.width / 2 - (wordCount >= MIN_WORDS_FOR_SUMMARIZE ? 150 : 75)),
                        // });
                    } else {
                        console.error("Elemento .ql-editor não encontrado");
                    }
                } else {
                    // console.log("Nenhuma seleção detectada");
                    setShowEnhanceButton(false);
                    setShowSummarizeButton(false);
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
        // console.log("handleAISubmit chamado com prompt:", prompt);
        const sendPrompt = `Provide an objective answer, without conversational introductions: ${prompt}`;
        setIsModalOpen(false);
        setIsGenerating(true);
        try {
            const response = await generateText(prompt);
            // console.log("Resposta da API:", response);
            if (!response) {
                toast.error("No response from AI. Please try again.");
                setIsGenerating(false);
                return;
            }

            if (quill) {
                const selection = quill.getSelection();
                const insertIndex = selection ? selection.index : quill.getLength() - 1;
                quill.insertText(insertIndex, "\n<p><span style=\"opacity: 0.5;\">Creating...</span> </p>\n");

                // Converter Markdown para HTML
                const htmlContent = marked.parse(response) as string;
                let currentContent = "";
                await simulateStreaming(
                    htmlContent,
                    (chunk: string) => {
                        currentContent += chunk;
                        quill.deleteText(insertIndex, quill.getLength() - insertIndex);
                        quill.clipboard.dangerouslyPasteHTML(insertIndex, currentContent);
                        setNoteContent(quill.root.innerHTML);
                    },
                    5,
                    200
                );
            }
        } catch (err) {
            console.error("Erro em handleAISubmit:", err);
            toast.error("Failed to generate AI content.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEnhanceText = async () => {
        if (!selectedText || !quill) {
            toast.error("Please select text to enhance.");
            return;
        }

        setIsGenerating(true);
        try {
            const prompt = `Enhance this text: ${selectedText}`;
            // console.log("Enhance prompt:", prompt);
            const response = await generateText(prompt);
            // console.log("Resposta da API (enhance):", response);
            if (!response) {
                toast.error("Failed to enhance text.");
                return;
            }

            const selection = quill.getSelection();
            if (selection) {
                const insertIndex = selection.index;
                const selectionLength = selection.length
                // quill.deleteText(insertIndex, selection.length);

                // Converter Markdown para HTML
                const htmlContent = marked.parse(response) as string;
                let currentContent = "";
                await simulateStreaming(
                    htmlContent,
                    (chunk: string) => {
                        currentContent += chunk;
                        quill.deleteText(insertIndex, selectionLength);
                        quill.clipboard.dangerouslyPasteHTML(insertIndex, currentContent);
                        setNoteContent(quill.root.innerHTML);
                    },
                    5,
                    200
                );
            }
        } catch (err) {
            console.error("Erro em handleEnhanceText:", err);
            toast.error("Error enhancing text.");
        } finally {
            setShowEnhanceButton(false);
            setShowSummarizeButton(false);
            setSelectedText("");
            setSelectionBounds(null);
            setIsGenerating(false);
        }
    };

    const handleSummarizeText = async () => {
        if (!selectedText || !quill) {
            toast.error("Please select text to summarize.");
            return;
        }

        setIsGenerating(true);
        try {
            const prompt = `Summarize this text in a concise manner: ${selectedText}`;
            // console.log("Summarize prompt:", prompt);
            const response = await generateText(prompt);
            // console.log("Resposta da API (summarize):", response);
            if (!response) {
                toast.error("Failed to summarize text.");
                return;
            }

            const selection = quill.getSelection();
            if (selection) {
                const insertIndex = selection.index;
                const selectionLength = selection.length
                // quill.deleteText(insertIndex, selection.length);

                // Converter Markdown para HTML
                const htmlContent = marked.parse(response) as string;
                let currentContent = "";
                await simulateStreaming(
                    htmlContent,
                    (chunk: string) => {
                        currentContent += chunk;
                        quill.deleteText(insertIndex, selectionLength);
                        quill.clipboard.dangerouslyPasteHTML(insertIndex, currentContent);
                        setNoteContent(quill.root.innerHTML);
                    },
                    5,
                    200
                );
            }
        } catch (err) {
            console.error("Erro em handleSummarizeText:", err);
            toast.error("Error summarizing text.");
        } finally {
            setShowEnhanceButton(false);
            setShowSummarizeButton(false);
            setSelectedText("");
            setSelectionBounds(null);
            setIsGenerating(false);
        }
    };

    // Componente dos botões renderizado via Portal
    const ButtonsOverlay = () => {
        if (!showEnhanceButton || !selectionBounds || !portalContainerRef.current) {
            return null;
        }

        return createPortal(
            <div
                className="flex space-x-2"
                style={{
                    position: "absolute",
                    top: `${selectionBounds.top}px`,
                    left: `${selectionBounds.left}px`,
                    zIndex: 1000000, // Aumentado
                    pointerEvents: "auto",
                }}
            >
                <button
                    type="button"
                    className={`px-4 py-2 rounded-full shadow-md cursor-pointer transition-colors ${theme === "light"
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-slate-700 text-gray-200 hover:bg-gray-600"
                        }`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // console.log("Botão Enhance clicado");
                        handleEnhanceText();
                    }}
                    aria-label="Enhance selected text with AI"
                >
                    Enhance with AI
                </button>
                {showSummarizeButton && (
                    <button
                        type="button"
                        className={`px-4 py-2 rounded-full shadow-md cursor-pointer transition-colors ${theme === "light"
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-slate-700 text-gray-200 hover:bg-slate-600"
                            }`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // console.log("Botão Summarize clicado");
                            handleSummarizeText();
                        }}
                        aria-label="Summarize selected text with AI"
                    >
                        Summarize with AI
                    </button>
                )}
                {/* Botão de teste fixo */}
                {/* <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-full cursor-pointer"
                    style={{ position: "fixed", top: "100px", left: "100px", zIndex: 1000000, pointerEvents: "auto" }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toast.error("Calma!");
                        console.log("Botão de teste clicado");
                    }}
                >
                    Botão de Teste
                </button> */}
            </div>,
            portalContainerRef.current
        );
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
                                onClick={openAIModal}
                                className={`px-2 py-1 rounded-2xl font-semibold transition-colors ${theme === "light"
                                    ? "bg-neutral-100 hover:bg-neutral-400 text-neutral-800"
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
                    className="flex-1 lg:ml-[240px] overscroll-y-contain"
                    style={{ paddingTop: `calc(5rem + env(safe-area-inset-top, 0px) + 105px)`, position: "relative" }}
                >
                    {isGenerating && (
                        <div className="-mt-10 flex items-center space-x-2">
                            <svg
                                className="animate-spin h-5 w-5 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>Generating...</span>
                        </div>
                    )}
                    <div className="relative flex flex-col h-full">
                        <div
                            ref={quillRef}
                            className={`w-full h-screen rounded-xl ${theme === "light" ? "border-gray-50/20 bg-white text-black" : "border-slate-800 bg-slate-900 text-white"
                                } quill-editor`}
                            style={{ minHeight: "300px", maxHeight: "80vh", overflow: "auto", zIndex: 0 }}
                            spellCheck="false"
                        />
                        {/* Botões renderizados em um contêiner separado */}
                        <ButtonsOverlay />
                        {/* <div className="buttons-overlay" style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100%",
                            zIndex: 10000,
                            pointerEvents: "none",
                        }}
                        >
                            {showEnhanceButton && selectionBounds && (
                                <div
                                    className="flex space-x-2"
                                    style={{
                                        position: "absolute",
                                        top: `${selectionBounds.top}px`,
                                        left: `${selectionBounds.left}px`,
                                        pointerEvents: "auto",
                                    }}
                                >
                                    <div
                                        ref={buttonRef}
                                        className={`rounded-full shadow-md cursor-pointer transition-colors px-4 py-2 ${theme === "light"
                                            ? "bg-neutral-200 text-gray-700 hover:bg-neutral-300"
                                            : "bg-slate-700 text-gray-200 hover:bg-slate-600"
                                            }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log("Botão Enhance clicado");
                                            handleEnhanceText();
                                        }}
                                        aria-label="Enhance selected text with AI"
                                    >
                                        Enhance with AI
                                    </div>
                                    {showSummarizeButton && (
                                        <div
                                            className={`summarize-button px-4 py-1 rounded-full shadow-md cursor-pointer transition-colors ${theme === "light"
                                                ? "bg-neutral-200 text-gray-700 hover:bg-neutral-300"
                                                : "bg-slate-700 text-gray-200 hover:bg-slate-600"
                                                }`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log("Botão Summarize clicado");
                                                handleSummarizeText();
                                            }}
                                            aria-label="Summarize selected text with AI"
                                        >
                                            Summarize with AI
                                        </div>
                                    )}
                                </div>
                            )}
                        </div> */}
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
                    padding: 6px 8px;
                    box-shadow: ${theme === "light"
                    ? "0 1px 3px rgba(0, 0, 0, 0.1)"
                    : "0 1px 3px rgba(0, 0, 0, 0.3)"
                };
                }

                /* Estilizando o botão/label do dropdown */
                .ql-toolbar .ql-picker-label {
                    color: ${theme === "light" ? "#111827" : "#e5e7eb"} !important;
                    background: ${theme === "light" ? "#ffffff" : "#2d3748"} !important;
                    border: 1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"
                } !important;
                    border-radius: 8px !important;
                    padding: 4px 8px !important;
                    transition: all 0.2s ease !important;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }

                /* Rotacionar a seta quando o dropdown está aberto */
                .ql-toolbar .ql-picker-label.ql-active::after {
                    transform: rotate(180deg);
                }

                /* Estilizando o dropdown aberto */
                .ql-toolbar .ql-picker-options {
                    background: ${theme === "light" ? "#ffffff" : "#2d3748"} !important;
                    border: 1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"
                } !important;
                    border-radius: 8px !important;
                    box-shadow: ${theme === "light"
                    ? "0 2px 8px rgba(0, 0, 0, 0.15)"
                    : "0 2px 8px rgba(0, 0, 0, 0.3)"
                } !important;
                    margin-top: 4px !important;
                    animation: fadeIn 0.2s ease;
                }

                .ql-color-picker .ql-picker-options .ql-picker-item {
                    width: 20px !important;
                    height: 20px !important;
                    padding: 0 !important;
                    border: 1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"
                } !important;
                    border-radius: 4px !important;
                }

                /* Hover nos itens do dropdown */
                .ql-toolbar .ql-picker-item:hover {
                    border-color: ${theme === "light" ? "#f3f4f6" : "#4b5563"} !important;
                }

                /* Item selecionado no dropdown */
                .ql-toolbar .ql-picker-item.ql-selected {
                    background: ${theme === "light" ? "#e5e7eb" : "#6b7280"} !important;
                    font-weight: 600 !important;
                }

                /* Estilizando botões da toolbar */
                .ql-toolbar button {
                    border-radius: 8px !important;
                    padding: 4px !important;
                    transition: background 0.2s ease !important;
                }

                .ql-toolbar button:hover {
                    background: ${theme === "light" ? "#e5e7eb" : "#4b5563"} !important;
                    text-color: ${theme == "light" ? "black" : "white"}
                }

                /* Ícones pretos quando selecionados (Bold, Italic, Underline) */
                .ql-toolbar button.ql-active svg,
                .ql-toolbar .ql-picker.ql-active .ql-picker-label svg {
                    fill: ${theme === "light" ? "#000000" : "#ffffff"} !important;
                    stroke: ${theme === "light" ? "#000000" : "#ffffff"} !important;
                }


                .ql-toolbar button.ql-active,
                .ql-toolbar .ql-picker.ql-active .ql-picker-label {
                    color: #7c3aed !important;
                    border-color: #c4b5fd !important;
                    background: ${theme === "light" ? "#f3f4f6" : "#4b5563"} !important;
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

                /* Animação para o dropdown */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 600px) {
                    .ql-toolbar {
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                    }

                    .ql-toolbar button svg,
                    .ql-toolbar .ql-picker-label svg {
                        width: 15px !important;
                        height: 15px !important;
                        vertical-align: middle;
                    }

                    .ql-toolbar button,
                    .ql-toolbar .ql-picker-label {
                        line-height: 1 !important;
                        padding: 6px !important;
                    }

                    .ql-toolbar .ql-picker-options {
                        max-height: 150px;
                        overflow-y: auto;
                    }
                }
            `}</style>
        </ClientOnly>
    );
};

export default SubfolderNote;