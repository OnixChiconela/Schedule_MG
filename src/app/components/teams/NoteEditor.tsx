"use client";

import { useTheme } from "@/app/themeContext";
import { parseISO, format, isSameYear } from "date-fns";
import { ChevronLeft, Save, Sparkles, Image as ImageIcon, FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.core.css";
import toast from "react-hot-toast";
import { generateText, simulateStreaming } from "@/app/api/actions/AI/hugging_face/generateText";
import { canUseAI } from "@/app/api/actions/AI/CanUseAI";
import { motion } from "framer-motion";

type NoteMedia = {
    type: "image" | "pdf";
    url: string;
    name: string;
    width?: number; // Para controle de tamanho de imagens
};

type Note = {
    id: number;
    title: string;
    content: string;
    createdDate: string;
    media: NoteMedia[];
};

type NoteEditorProps = {
    folderId: number;
    onBack: () => void;
};

const NoteEditor = ({ folderId, onBack }: NoteEditorProps) => {
    const { theme } = useTheme();
    const [notes, setNotes] = useState<Note[]>(() => {
        const initialNote: Note = {
            id: Date.now(),
            title: `Note for Folder ${folderId}`,
            content: "Start writing your note here...",
            createdDate: new Date().toISOString(),
            media: [],
        };
        return [initialNote];
    });
    const [selectedNoteId] = useState<number>(notes[0]?.id || Date.now());
    const [noteContent, setNoteContent] = useState<string>(notes[0]?.content || "");
    const [showEnhanceButton, setShowEnhanceButton] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [selectionBounds, setSelectionBounds] = useState<{ top: number; left: number } | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [imageWidth, setImageWidth] = useState<number>(100); // Largura inicial em %
    const [showPdfModal, setShowPdfModal] = useState<string | null>(null); // URL do PDF a ser exibido
    const isInitialized = useRef(false);

    const { quill, quillRef } = useQuill({
        theme: "snow",
        modules: {
            toolbar: {
                container: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline"],
                    [{ color: [] }],
                    ["clean"],
                ],
            },
            clipboard: {
                matchVisual: false,
            },
        },
        placeholder: "Start typing your note here...",
    });

    // Handler para upload de imagem
    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = e.target?.result as string;
                    const range = quill!.getSelection(true);
                    quill!.insertEmbed(range.index, "image", url);
                    updateMedia("image", url, file.name);
                };
                reader.readAsDataURL(file);
            }
        };
    };

    // Handler para upload de PDF (como board)
    const pdfHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", ".pdf");
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = e.target?.result as string;
                    const range = quill!.getSelection(true);
                    const pdfBoard = `<div class="pdf-board" data-url="${url}" style="border: 1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"}; padding: 8px; margin: 10px 0; cursor: pointer; display: flex; align-items: center; gap: 8px; background: ${theme === "light" ? "#f3f4f6" : "#1f2937"};">
                        <span class="pdf-icon">📄</span>
                        <span>${file.name}</span>
                    </div>`;
                    quill!.clipboard.dangerouslyPasteHTML(range.index, pdfBoard);
                    updateMedia("pdf", url, file.name);
                };
                reader.readAsDataURL(file);
            }
        };
    };

    // Atualiza o estado de mídia
    const updateMedia = (type: "image" | "pdf", url: string, name: string, width?: number) => {
        setNotes((prev) =>
            prev.map((n) =>
                n.id === selectedNoteId
                    ? { ...n, media: [...n.media, { type, url, name, width }] }
                    : n
            )
        );
    };

    // Ajusta o tamanho da imagem selecionada
    const adjustImageSize = () => {
        if (selectedImageIndex !== null && quill) {
            const media = notes.find((n) => n.id === selectedNoteId)?.media[selectedImageIndex];
            if (media?.type === "image") {
                const images = quillRef.current?.querySelectorAll(".ql-editor img");
                if (images && images[selectedImageIndex]) {
                    images[selectedImageIndex].setAttribute("width", `${imageWidth}%`);
                    images[selectedImageIndex].setAttribute("height", "auto");
                    const newContent = quill.root.innerHTML;
                    setNotes((prev) =>
                        prev.map((n) =>
                            n.id === selectedNoteId ? { ...n, content: newContent } : n
                        )
                    );
                    setSelectedImageIndex(null);
                }
            }
        }
    };

    // Listener para cliques em imagens e PDFs
    useEffect(() => {
        if (quill && quillRef.current) {
            const editor = quillRef.current.querySelector(".ql-editor");
            if (editor) {
                const handleClick = (e: Event) => {
                    const target = e.target as HTMLElement;
                    // Clique em imagem
                    if (target.tagName === "IMG") {
                        const images = editor.querySelectorAll("img");
                        const index = Array.from(images).indexOf(target as HTMLImageElement);
                        setSelectedImageIndex(index);
                        setImageWidth(parseInt(target.getAttribute("width") || "100"));
                    }
                    // Clique em PDF board
                    if (target.closest(".pdf-board")) {
                        const pdfBoard = target.closest(".pdf-board") as HTMLElement;
                        const url = pdfBoard.getAttribute("data-url");
                        if (url) {
                            setShowPdfModal(url);
                        }
                    }
                };
                editor.addEventListener("click", handleClick);
                return () => editor.removeEventListener("click", handleClick);
            }
        }
    }, [quill, quillRef]);

    // Inicializa o Quill com o conteúdo da nota selecionada
    useEffect(() => {
        if (quill && !isInitialized.current) {
            const selectedNote = notes.find((n) => n.id === selectedNoteId);
            quill.setContents([]);
            quill.clipboard.dangerouslyPasteHTML(selectedNote?.content || "<p></p>");
            isInitialized.current = true;
        }
    }, [quill, selectedNoteId, notes]);

    // Sincronizar mudanças do Quill com o estado
    useEffect(() => {
        if (quill) {
            let timeout: NodeJS.Timeout;
            const handleTextChange = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    const newContent = quill.root.innerHTML;
                    setNotes((prev) =>
                        prev.map((n) =>
                            n.id === selectedNoteId ? { ...n, content: newContent } : n
                        )
                    );
                    setNoteContent(newContent);
                }, 300);
            };

            quill.on("text-change", handleTextChange);

            return () => {
                quill.off("text-change", handleTextChange);
                clearTimeout(timeout);
            };
        }
    }, [quill, selectedNoteId]);

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

    // Função para formatar a data e hora
    const formatDateTime = (dateString: string) => {
        const date = parseISO(dateString);
        const currentYear = new Date().getFullYear(); // 2025
        const isCurrentYear = isSameYear(date, new Date());

        const datePart = isCurrentYear
            ? format(date, "d MMM") // Ex.: "1 Jun"
            : format(date, "d MMM yyyy"); // Ex.: "1 Jun 2026"
        const timePart = format(date, "HH:mm"); // Ex.: "12:03"

        return `${datePart} ${timePart}`;
    };

    return (
        <div className="w-full h-full">
            <header className={`flex items-center justify-between mb-4 border-b-[1px] pb-2 ${theme === "light" ? "bg-white border-b-neutral-300" : "bg-slate-800 border-b-neutral-700"}`}>
                <button
                    onClick={onBack}
                    className={`pr-3 py-1 flex items-center rounded-xl transition ${theme === "light" ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-slate-600 text-gray-200 hover:bg-slate-500"}`}
                >
                    <ChevronLeft />
                    Back
                </button>
                <div className="flex space-x-2">
                    <motion.button
                        onClick={imageHandler}
                        className={`flex items-center gap-2 px-2 py-1 rounded-xl transition ${theme === "light" ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-slate-600 text-gray-200 hover:bg-slate-500"}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ImageIcon size={14} />
                        Image
                    </motion.button>
                    <motion.button
                        onClick={pdfHandler}
                        className={`flex items-center gap-2 px-2 py-1 rounded-xl transition ${theme === "light" ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-slate-600 text-gray-200 hover:bg-slate-500"}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FileText size={14} />
                        PDF
                    </motion.button>
                </div>
            </header>

            <div className="flex flex-col h-[calc(100%-80px)]">
                <div
                    ref={quillRef}
                    className={`w-full h-full rounded-xl border ${theme === "light" ? "bg-white text-black border-gray-200" : "bg-slate-900 text-white border-slate-700"} quill-editor`}
                    style={{ minHeight: "300px", maxHeight: "80vh", overflow: "auto" }}
                />
                {showEnhanceButton && selectionBounds && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute px-3 py-1 rounded-full shadow-md cursor-pointer transition-colors ${theme === "light" ? "bg-neutral-200 text-gray-700 hover:bg-neutral-300" : "bg-slate-700 text-gray-200 hover:bg-slate-600"}`}
                        style={{
                            position: "absolute",
                            zIndex: 20,
                            top: `${selectionBounds.top}px`,
                            left: `${selectionBounds.left}px`,
                        }}
                    >
                        <Sparkles size={16} />
                    </motion.div>
                )}
            </div>

            {selectedImageIndex !== null && (
                <div className={`mt-2 flex items-center space-x-2 ${theme === "light" ? "text-black" : "text-white"}`}>
                    <input
                        type="number"
                        min="10"
                        max="100"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(parseInt(e.target.value))}
                        className={`w-16 p-1 rounded ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-slate-700 border-slate-500"}`}
                    />
                    <button
                        onClick={adjustImageSize}
                        className={`px-2 py-1 rounded-xl transition ${theme === "light" ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-slate-600 text-gray-200 hover:bg-slate-500"}`}
                    >
                        Apply Size
                    </button>
                </div>
            )}

            <div className={`text-xs mt-2 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                {formatDateTime(notes.find((n) => n.id === selectedNoteId)?.createdDate || new Date().toISOString())}
            </div>

            {showPdfModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <div className={`relative w-11/12 h-5/6 ${theme === "light" ? "bg-white" : "bg-slate-800"} rounded-lg p-4`}>
                        <button
                            onClick={() => setShowPdfModal(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        <iframe
                            src={showPdfModal}
                            className="w-full h-full border-none"
                            title="PDF Viewer"
                        />
                    </div>
                </motion.div>
            )}

            <style jsx global>{`
                .ql-toolbar {
                    background: ${theme === "light" ? "#f9fafb" : "#1f2937"} !important;
                    border: none !important;
                    margin-bottom: 10px;
                    display: flex;
                    border-radius: 12px;
                    padding: 6px 8px;
                    box-shadow: ${theme === "light" ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.3)"};
                }
                .ql-container {
                    border: none !important;
                }
                .ql-editor {
                    color: ${theme === "light" ? "#000" : "#fff"};
                    min-height: 250px;
                    padding: 12px;
                    overflow-y: auto;
                }
                .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    margin: 10px 0;
                    cursor: pointer;
                }
                .ql-editor .pdf-board {
                    border: 1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"};
                    padding: 8px;
                    margin: 10px 0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: ${theme === "light" ? "#f3f4f6" : "#1f2937"};
                }
                .ql-editor .pdf-board:hover {
                    background: ${theme === "light" ? "#e5e7eb" : "#374151"};
                }
                .ql-editor .pdf-icon {
                    font-size: 20px;
                }
                .ql-editor:focus {
                    outline: none;
                }
                .ql-editor img:hover {
                    outline: 2px solid ${theme === "light" ? "#3b82f6" : "#60a5fa"};
                }
            `}</style>
        </div>
    );
};

export default NoteEditor;