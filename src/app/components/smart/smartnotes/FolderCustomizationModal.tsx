import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface CustomizeFolderModalProps {
  theme: string;
  customTitle: string;
  setCustomTitle: (title: string) => void;
  customBgColor: string;
  setCustomBgColor: (color: string) => void;
  customImageUrl: string | null;
  setCustomImageUrl: (url: string | null) => void;
  customShadow: number;
  setCustomShadow: (shadow: number) => void;
  customOpacity: number;
  setCustomOpacity: (opacity: number) => void;
  customTitleColor: string;
  setCustomTitleColor: (color: string) => void;
  setCustomizingFolderId: (id: null) => void;
  handleSaveCustomization: () => void;
}

const CustomizeFolderModal: React.FC<CustomizeFolderModalProps> = ({
  theme,
  customTitle,
  setCustomTitle,
  customBgColor,
  setCustomBgColor,
  customImageUrl,
  setCustomImageUrl,
  customShadow,
  setCustomShadow,
  customOpacity,
  setCustomOpacity,
  customTitleColor,
  setCustomTitleColor,
  setCustomizingFolderId,
  handleSaveCustomization,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
        setError("Image size must be less than 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);
      setError(null);
    } else {
      setError("Please upload a valid image file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) { // Limit Jacobs 5MB
        setError("Image size must be less than 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);
      setError(null);
    } else {
      setError("Please upload a valid image file");
    }
  };

  const handleRemoveImage = () => {
    if (customImageUrl) {
      URL.revokeObjectURL(customImageUrl); // Clean up object URL
      setCustomImageUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
  };

  const shadowOptions = [
    { label: "None", value: 0 },
    { label: "Light", value: 1 },
    { label: "Medium", value: 2 },
    { label: "Heavy", value: 3 },
  ];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50 dark:bg-slate-900/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        className={`p-6 rounded-2xl shadow-xl w-full max-w-lg ${theme === "light" ? "bg-white" : "bg-slate-800"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${theme === "light" ? "text-gray-900" : "text-white"}`}
        >
          Customize Folder
        </h2>
        <div className="space-y-6">
          {/* Folder Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Folder Name
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === "light"
                ? "border-gray-200 bg-gray-50 text-gray-900"
                : "border-slate-700 bg-slate-900 text-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder="Enter folder name"
            />
          </div>

          {/* Colors */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Colors
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-2 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                  Title Color
                </label>
                <input
                  type="color"
                  value={customTitleColor || (theme === "light" ? "#1F2937" : "#FFFFFF")}
                  onChange={(e) => setCustomTitleColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer border-0"
                />
              </div>
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-2 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                  Background Color
                </label>
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer border-0"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Image
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : theme === "light"
                  ? "border-gray-200 bg-gray-50"
                  : "border-slate-700 bg-slate-900"
                }`}
            >
              {customImageUrl ? (
                <div className="flex items-center justify-between">
                  <img src={customImageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    onClick={handleRemoveImage}
                    className={`p-1 rounded-full ${theme === "light"
                      ? "text-red-500 hover:bg-red-100"
                      : "text-red-400 hover:bg-red-900/50"
                      }`}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div>
                  <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                    Drag and drop an image here or
                  </p>
                  <label
                    className={`inline-block mt-2 px-4 py-2 rounded-lg cursor-pointer ${theme === "light"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-blue-900 text-blue-300 hover:bg-blue-800"
                      }`}
                  >
                    Choose a file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              )}
              {error && (
                <p className={`text-sm text-red-500 mt-2`}>{error}</p>
              )}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Style
            </label>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-2 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                  Shadow
                </label>
                <div className="flex gap-2">
                  {shadowOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex-1 text-center p-2 rounded-lg cursor-pointer transition-colors ${customShadow === option.value
                        ? theme === "light"
                          ? "bg-neutral-300 text-neutral-700"
                          : "bg-neutral-900 text-neutral-300"
                        : theme === "light"
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-slate-900 text-gray-400 hover:bg-slate-800"
                        }`}
                    >
                      <input
                        type="radio"
                        name="shadow"
                        value={option.value}
                        checked={customShadow === option.value}
                        onChange={() => setCustomShadow(option.value)}
                        className="hidden"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-2 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                  Opacity
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={customOpacity}
                    onChange={(e) => setCustomOpacity(parseFloat(e.target.value))}
                    className="w-full accent-neutral-500"
                  />
                  <span className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    {customOpacity.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              onClick={() => setCustomizingFolderId(null)}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${theme === "light"
                ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                : "bg-slate-900 hover:bg-slate-800 text-gray-200"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSaveCustomization}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${theme === "light"
                ? "bg-neutral-800 hover:bg-neutral-900 text-white"
                : "bg-neutral-900 hover:bg-black text-white"
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