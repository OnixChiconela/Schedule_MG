"use client";

import ClientOnly from "@/app/components/ClientOnly";
import TrackingNav from "@/app/components/navbars/trackingNav";
import ToolsNavbar from "@/app/components/navbars/ToolsNavbar";
import { useTheme } from "@/app/themeContext";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSubfolderContext } from "@/app/context/SubfolderContext";
import AIModal from "@/app/components/smart/smartnotes/subfolders/AIModal";
import { Sparkles, X } from "lucide-react";
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

type Line = {
    points: { x: number; y: number }[];
};

type TextLine = {
    text: string;
    x: number;
    y: number;
    width: number;
};

type CanvasState = {
    textLines: TextLine[];
    lines: Line[];
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
    const { activeTool } = useSubfolderContext();
    const [canvasState, setCanvasState] = useState<CanvasState>(() => {
        if (subfolder && subfolder.content) {
            try {
                const parsedContent = JSON.parse(subfolder.content);
                const textLines = Array.isArray(parsedContent.textLines)
                    ? parsedContent.textLines.map((line: any) => {
                          if (typeof line === "string") {
                              return { text: line, x: 10, y: 30, width: 0 };
                          }
                          return {
                              text: line.text || "",
                              x: 10,
                              y: line.y || 30,
                              width: line.width || 0,
                          };
                      })
                    : [];
                return {
                    textLines,
                    lines: Array.isArray(parsedContent.lines) ? parsedContent.lines : [],
                };
            } catch (e) {
                console.error("Failed to parse subfolder content:", e);
                return { textLines: [], lines: [] };
            }
        }
        return { textLines: [], lines: [] };
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastX, setLastX] = useState<number | null>(null);
    const [lastY, setLastY] = useState<number | null>(null);
    const [currentLine, setCurrentLine] = useState<{ x: number; y: number }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
    const [cursorVisible, setCursorVisible] = useState(true);
    const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(null);

    // Cursor blinking animation
    useEffect(() => {
        if (!isTyping) return;
        const interval = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, [isTyping]);

    // Line breaking function
    const breakLines = (text: string, x: number, y: number, maxWidth: number, ctx: CanvasRenderingContext2D) => {
        const lines: TextLine[] = [];
        let currentY = y;
        const manualLines = text.split("\n");

        manualLines.forEach((manualLine) => {
            let currentLine = "";
            const words = manualLine.split(" ");
            for (let word of words) {
                const testLine = currentLine + (currentLine ? " " : "") + word;
                const metrics = ctx.measureText(testLine);
                if (metrics.width <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push({ text: currentLine, x, y: currentY, width: metrics.width });
                        currentY += 20 * scaleFactor;
                        currentLine = word;
                    }
                }
            }
            if (currentLine) {
                lines.push({ text: currentLine, x, y: currentY, width: ctx.measureText(currentLine).width });
                currentY += 20 * scaleFactor;
            }
        });

        return lines;
    };

    // Canvas resizing and scaling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const referenceWidth = 1200;
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = Math.max(
                ...canvasState.textLines.map((line) => line.y + 20),
                ...canvasState.lines.flatMap((line) => line.points.map((p) => p.y)),
                window.innerHeight - 100
            );

            const newScaleFactor = Math.max(rect.width / referenceWidth, 0.3);
            setScaleFactor(newScaleFactor);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, [canvasState]);

    // Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.scale(scaleFactor, scaleFactor);

        const margin = 10 / scaleFactor;
        const maxWidth = (canvas.width / scaleFactor) - 2 * margin;

        ctx.font = `${16 / scaleFactor}px Arial`;
        ctx.fillStyle = theme === "light" ? "#000000" : "#ffffff";
        canvasState.textLines.forEach((line, index) => {
            if (line && typeof line.text === "string" && (!isTyping || editingTextIndex !== index)) {
                ctx.fillText(line.text, margin, line.y / scaleFactor);
            }
        });

        if (isTyping && textPosition) {
            const lines = breakLines(currentText || "", margin, textPosition.y / scaleFactor, maxWidth, ctx);
            if (lines.length > 0) {
                lines.forEach((line) => {
                    if (line && typeof line.text === "string") {
                        ctx.fillStyle = theme === "light" ? "#000000" : "#ffffff";
                        ctx.fillText(line.text, line.x, line.y);
                    }
                });

                if (editingTextIndex !== null) {
                    const originalLine = canvasState.textLines[editingTextIndex];
                    const textWidth = ctx.measureText(currentText || "").width;
                    ctx.fillStyle = theme === "light" ? "rgba(0, 0, 255, 0.1)" : "rgba(0, 255, 255, 0.1)";
                    ctx.fillRect(margin - 2, originalLine.y / scaleFactor - 14, textWidth + 4, Math.max(18, lines.length * 20));
                    ctx.strokeStyle = theme === "light" ? "rgba(0, 0, 255, 0.7)" : "rgba(0, 255, 255, 0.7)";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(margin - 2, originalLine.y / scaleFactor - 14, textWidth + 4, Math.max(18, lines.length * 20));
                }

                if (cursorVisible) {
                    const lastLine = lines[lines.length - 1];
                    if (lastLine && typeof lastLine.text === "string") {
                        const textWidth = ctx.measureText(lastLine.text).width;
                        const cursorX = margin + textWidth;
                        const cursorY = lastLine.y - 12;
                        ctx.fillStyle = theme === "light" ? "#000000" : "#ffffff";
                        ctx.fillRect(cursorX, cursorY, 1, 16);
                    }
                }
            } else if (cursorVisible) {
                ctx.fillStyle = theme === "light" ? "rgba(0, 0, 255, 0.7)" : "rgba(0, 255, 255, 0.7)";
                ctx.fillRect(margin, textPosition.y / scaleFactor - 12, 1, 16);
            }
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        canvasState.lines.forEach((line) => {
            ctx.beginPath();
            line.points.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point.x / scaleFactor, point.y / scaleFactor);
                else ctx.lineTo(point.x / scaleFactor, point.y / scaleFactor);
            });
            ctx.strokeStyle = theme === "light" ? "#000000" : "#ffffff";
            ctx.lineWidth = 2 / scaleFactor;
            ctx.lineCap = "round";
            ctx.stroke();
        });
    }, [canvasState, theme, isTyping, currentText, textPosition, cursorVisible, editingTextIndex, scaleFactor]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const updatedFolders = folders.map((f) => {
                if (f.id !== folder?.id) return f;
                const updatedSubfolders = f.subfolders.map((sf) =>
                    sf.id === subfolder?.id ? { ...sf, content: JSON.stringify(canvasState) } : sf
                );
                return { ...f, subfolders: updatedSubfolders };
            });
            localStorage.setItem("smartNotesFolders", JSON.stringify(updatedFolders));
            setFolders(updatedFolders);
        }
    }, [canvasState]);

    if (!folder || !subfolder) {
        return <div>Subfolder not found</div>;
    }

    const saveCurrentText = () => {
        if (!isTyping || !textPosition || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const canvas = canvasRef.current;
        const margin = 10 / scaleFactor;
        const maxWidth = (canvas.width / scaleFactor) - 2 * margin;
        const lines = breakLines(currentText || "", margin, textPosition.y / scaleFactor, maxWidth, ctx);

        if (editingTextIndex !== null) {
            if (currentText.trim()) {
                setCanvasState((prev) => ({
                    ...prev,
                    textLines: prev.textLines.map((line, index) =>
                        index === editingTextIndex
                            ? { ...line, text: currentText, x: margin * scaleFactor, width: ctx.measureText(currentText).width }
                            : line
                    ),
                }));
            } else {
                setCanvasState((prev) => ({
                    ...prev,
                    textLines: prev.textLines.filter((_, index) => index !== editingTextIndex),
                }));
            }
        } else if (currentText.trim()) {
            setCanvasState((prev) => ({
                ...prev,
                textLines: [
                    ...prev.textLines,
                    ...lines.map((line) => ({ ...line, x: margin * scaleFactor, width: ctx.measureText(line.text).width })),
                ],
            }));
        }

        setIsTyping(false);
        setCurrentText("");
        setTextPosition(null);
        setEditingTextIndex(null);
        if (inputRef.current) {
            inputRef.current.blur();
        }
        setIsPopupOpen(false);
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (activeTool !== "freeDraw") return;

        if (isTyping) {
            saveCurrentText();
        }

        setIsDrawing(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setLastX(x);
        setLastY(y);
        setCurrentLine([{ x, y }]);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || activeTool !== "freeDraw" || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx || lastX === null || lastY === null) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = theme === "light" ? "#000000" : "#ffffff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        setLastX(currentX);
        setLastY(currentY);
        setCurrentLine((prev) => [...prev, { x: currentX, y: currentY }]);
    };

    const stopDrawing = () => {
        if (isDrawing && currentLine.length > 0) {
            setCanvasState((prev) => ({
                ...prev,
                lines: [...prev.lines, { points: currentLine }],
            }));
            setCurrentLine([]);
        }
        setIsDrawing(false);
        setLastX(null);
        setLastY(null);
    };

    const startTyping = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (activeTool !== "text") return;

        if (isTyping) {
            saveCurrentText();
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const clickedTextIndex = canvasState.textLines.findIndex((line) => {
            const yRange = clickY >= line.y - 20 && clickY <= line.y + 20;
            const xRange = clickX >= line.x && clickX <= line.x + line.width;
            return yRange && xRange;
        });

        const margin = 10; // Fixed margin in pixels (unscaled)

        if (clickedTextIndex !== -1) {
            setEditingTextIndex(clickedTextIndex);
            setCurrentText(canvasState.textLines[clickedTextIndex].text || "");
            setTextPosition({
                x: margin * scaleFactor,
                y: canvasState.textLines[clickedTextIndex].y,
            });
            setSelectedTextIndex(clickedTextIndex);
            const textLine = canvasState.textLines[clickedTextIndex];
            const adjustedX = margin * scaleFactor + textLine.width + 10;
            const adjustedY = textLine.y + 20;
            setPopupPosition({ x: adjustedX, y: adjustedY });
            setIsPopupOpen(true);
        } else {
            setTextPosition({ x: margin * scaleFactor, y: clickY });
            setCurrentText("");
            setEditingTextIndex(null);
            setSelectedTextIndex(null);
            setIsPopupOpen(false);
        }
        setIsTyping(true);
        e.preventDefault();
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isTyping) return;

        e.preventDefault();

        if (e.key === "Enter") {
            setCurrentText((prev) => prev + "\n");
        } else if (e.key === "Escape") {
            if (editingTextIndex !== null && !currentText.trim()) {
                setCanvasState((prev) => ({
                    ...prev,
                    textLines: prev.textLines.filter((_, index) => index !== editingTextIndex),
                }));
            } else if (currentText.trim()) {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext("2d");
                if (ctx && textPosition) {
                    const margin = 10 / scaleFactor;
                    const maxWidth = (canvas!.width / scaleFactor) - 2 * margin;
                    const newLines = breakLines(currentText, margin, textPosition.y / scaleFactor, maxWidth, ctx);
                    if (editingTextIndex !== null) {
                        setCanvasState((prev) => ({
                            ...prev,
                            textLines: prev.textLines.map((line, index) =>
                                index === editingTextIndex
                                    ? { ...line, text: currentText, x: margin * scaleFactor, width: ctx.measureText(currentText).width }
                                    : line
                            ),
                        }));
                    } else {
                        setCanvasState((prev) => ({
                            ...prev,
                            textLines: [
                                ...prev.textLines,
                                ...newLines.map((line) => ({ ...line, x: margin * scaleFactor, width: ctx.measureText(line.text).width })),
                            ],
                        }));
                    }
                }
            }
            setIsTyping(false);
            setCurrentText("");
            setTextPosition(null);
            setEditingTextIndex(null);
            if (inputRef.current) {
                inputRef.current.blur();
            }
            setIsPopupOpen(false);
            setSelectedTextIndex(null);
        } else if (e.key.length === 1 || e.key === " ") {
            setCurrentText((prev) => prev + e.key);
        } else if (e.key === "Backspace") {
            setCurrentText((prev) => prev.slice(0, -1));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isTyping) return;
        setCurrentText(e.target.value);
    };

    const handleSave = () => {
        toast.success("Subfolder updated");
    };

    const openAIModal = () => {
        if (!textPosition) {
            toast.error("Please click on the canvas to set a position for the AI response");
            return;
        }
        setIsModalOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedTextIndex(null);
    };

    const handleAISubmit = async (prompt: string) => {
        if (!textPosition) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        const response = await generateText(prompt);
        if (!response) {
            toast.error("Oops. Please try again.");
            return;
        }

        const margin = 10 / scaleFactor;
        const maxWidth = (canvas!.width / scaleFactor) - 2 * margin;
        const lines = breakLines(response, margin, textPosition.y / scaleFactor, maxWidth, ctx);

        setCanvasState((prev) => ({
            ...prev,
            textLines: [
                ...prev.textLines,
                ...lines.map((line) => ({ ...line, x: margin * scaleFactor, width: ctx.measureText(line.text).width })),
            ],
        }));

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
                <div  className="z-[15]"><ToolsNavbar /></div>
                
                <header
                    className={`fixed w-full z-10 top-[80px] py-4 bg-opacity-90 ${theme === "light" ? "bg-white" : "bg-slate-700"}`}
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
                                className={`px-5 py-2 rounded-xl font-semibold transition-colors ${theme === "light"
                                    ? "bg-neutral-800 hover:bg-black text-white"
                                    : "bg-neutral-900 hover:bg-black text-gray-200"
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Save
                            </motion.button>
                            <motion.button
                                onClick={openAIModal}
                                className={`px-5 py-2 rounded-xl font-semibold transition-colors ${theme === "light"
                                    ? "bg-neutral-800 hover:bg-black text-white"
                                    : "bg-neutral-900 hover:bg-black text-gray-200"
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                AI Edit
                            </motion.button>
                        </div>
                    </div>
                </header>
                <main
                    className="flex-1 overflow-y-auto p-6 lg:ml-[260px] overscroll-y-contain"
                    style={{
                        paddingTop: `calc(5rem + env(safe-area-inset-top, 0px) + 90px)`, // Ajustado para a altura do header
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        width={window.innerWidth - (theme === "light" ? 300 : 300)}
                        height={window.innerHeight - 100}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            startDrawing(e);
                            startTyping(e);
                        }}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const rect = canvasRef.current?.getBoundingClientRect();
                            if (rect) {
                                startTyping({
                                    clientX: touch.clientX - rect.left,
                                    clientY: touch.clientY - rect.top,
                                    preventDefault: () => {},
                                    currentTarget: canvasRef.current as HTMLCanvasElement,
                                } as React.MouseEvent<HTMLCanvasElement>);
                            }
                            if (inputRef.current) {
                                inputRef.current.focus();
                            }
                        }}
                        onMouseMove={draw}
                        onTouchMove={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const rect = canvasRef.current?.getBoundingClientRect();
                            if (rect) {
                                draw({
                                    clientX: touch.clientX - rect.left,
                                    clientY: touch.clientY - rect.top,
                                    preventDefault: () => {},
                                } as React.MouseEvent<HTMLCanvasElement>);
                            }
                        }}
                        onMouseUp={stopDrawing}
                        onTouchEnd={stopDrawing}
                        onMouseOut={stopDrawing}
                        onKeyDown={handleKeyDown}
                        className={`w-full rounded-xl border ${theme === "light"
                            ? "border-gray-300 bg-white"
                            : "border-slate-600 bg-slate-800"
                            } focus:outline-none focus:ring-2 focus:ring-fuchsia-700`}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        style={{ position: "absolute", opacity: 0, pointerEvents: "none", top: 0, left: 0 }}
                    />

                    {isPopupOpen && selectedTextIndex !== null && (
                        <div
                            style={{
                                position: "absolute",
                                top: popupPosition.y,
                                left: popupPosition.x,
                                backgroundColor: theme === "light" ? "#ffffff" : "#2d3748",
                                border: `1px solid ${theme === "light" ? "#e2e8f0" : "#4a5568"}`,
                                borderRadius: "4px",
                                padding: "10px",
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                zIndex: 1000,
                            }}
                            className="flex items-center"
                        >
                            <button
                                onClick={() => {
                                    setIsPopupOpen(false);
                                    setIsModalOpen(true);
                                }}
                                className={`px-3 flex gap-1 py-1 rounded bg-transparent border-1 
                                    ${theme === "light" 
                                        ? "border-neutral-700 hover:bg-neutral-100 text-neutral-800 hover:text-neutral-900" 
                                        : "border-neutral-800 hover:border-neutral-900 text-neutral-200 hover:text-neutral-50"}                                 `}
                            >
                                Improve with AI
                                <Sparkles />
                            </button>
                            <button
                                onClick={closePopup}
                                className={`ml-2 px-3 py-1 rounded-full ${theme === "light" ? "bg-neutral-800 hover:bg-neutral-900" : "bg-neutral-700 hover:bg-neutral-900"} text-white`}
                            >
                                <X />
                            </button>
                        </div>
                    )}

                    <AIModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleAISubmit}
                    />
                </main>
            </div>
        </ClientOnly>
    );
};

export default SubfolderNote;