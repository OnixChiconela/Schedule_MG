"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

type CustomizeFolderModalProps = {
    theme: string;
    customTitle: string;
    setCustomTitle: (title: string) => void;
    customBgColor: string;
    setCustomBgColor: (color: string) => void;
    customImageUrl: string | null;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: () => void;
    customShadow: string;
    setCustomShadow: (shadow: string) => void;
    customOpacity: number;
    setCustomOpacity: (opacity: number) => void;
    customTitleColor: string;
    setCustomTitleColor: (color: string) => void;
    setCustomizingFolderId: (id: number | null) => void;
    handleSaveCustomization: () => void;
};

const CustomizeFolderModal = ({
    theme,
    customTitle,
    setCustomTitle,
    customBgColor,
    setCustomBgColor,
    customImageUrl,
    handleImageUpload,
    handleRemoveImage,
    customShadow,
    setCustomShadow,
    customOpacity,
    setCustomOpacity,
    customTitleColor,
    setCustomTitleColor,
    setCustomizingFolderId,
    handleSaveCustomization,
}: CustomizeFolderModalProps) => {
    return (
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
                <div className="flex justify-between items-center mb-6">
                    <h2
                        className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}
                    >
                        Customize Folder
                    </h2>
                    <button onClick={() => setCustomizingFolderId(null)} className="p-1">
                        <X size={20} className={theme === "light" ? "text-gray-600" : "text-gray-300"} />
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Folder Title
                        </label>
                        <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className={`w-full p-2 rounded-md border ${theme === "light"
                                ? "border-gray-300 bg-white text-gray-900"
                                : "border-slate-600 bg-slate-800 text-gray-200"
                                } focus:outline-none focus:ring-2 focus:ring-fuchsia-700`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Background Color
                        </label>
                        <input
                            type="color"
                            value={customBgColor}
                            onChange={(e) => setCustomBgColor(e.target.value)}
                            className="w-full h-10 rounded-md border-none"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Title Color
                        </label>
                        <input
                            type="color"
                            value={customTitleColor}
                            onChange={(e) => setCustomTitleColor(e.target.value)}
                            className="w-full h-10 rounded-md border-none"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className={`w-full p-2 rounded-md border ${theme === "light"
                                ? "border-gray-300 bg-white text-gray-900"
                                : "border-slate-600 bg-slate-800 text-gray-200"
                                }`}
                        />
                        {customImageUrl && (
                            <button
                                onClick={handleRemoveImage}
                                className={`mt-2 text-sm ${theme === "light" ? "text-red-600 hover:text-red-700" : "text-red-500 hover:text-red-400"}`}
                            >
                                Remove Image
                            </button>
                        )}
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Shadow
                        </label>
                        <select
                            value={customShadow}
                            onChange={(e) => setCustomShadow(e.target.value)}
                            className={`w-full p-2 rounded-md border ${theme === "light"
                                ? "border-gray-300 bg-white text-gray-900"
                                : "border-slate-600 bg-slate-800 text-gray-200"
                                }`}
                        >
                            <option value="0px 4px 6px rgba(0, 0, 0, 0.1)">Light</option>
                            <option value="0px 8px 12px rgba(0, 0, 0, 0.15)">Medium</option>
                            <option value="0px 12px 18px rgba(0, 0, 0, 0.2)">Heavy</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Opacity
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={customOpacity}
                            onChange={(e) => setCustomOpacity(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <motion.button
                            onClick={() => setCustomizingFolderId(null)}
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
                            onClick={handleSaveCustomization}
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
    );
};

export default CustomizeFolderModal;
