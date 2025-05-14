import { motion } from "framer-motion";
import { X } from "lucide-react";

type CustomizeFolderModalProps = {
  theme: string;
  customTitle: string;
  setCustomTitle: (title: string) => void;
  customBgColor: string;
  setCustomBgColor: (color: string) => void;
  customImageUrl: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        <h2
          className={`text-xl font-semibold mb-6 ${theme === "light" ? "text-gray-900" : "text-white"}`}
        >
          Customize Folder
        </h2>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Folder Name
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className={`w-full p-2 rounded-md border ${theme === "light"
                ? "border-gray-300 bg-white text-gray-900"
                : "border-slate-600 bg-slate-800 text-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Title Color
            </label>
            <input
              type="color"
              value={customTitleColor || (theme === "light" ? "#1F2937" : "#FFFFFF")}
              onChange={(e) => setCustomTitleColor(e.target.value)}
              className="w-[50%] h-10 rounded-xl cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Background Color
            </label>
            <input
              type="color"
              value={customBgColor}
              onChange={(e) => setCustomBgColor(e.target.value)}
              className="w-[50%] h-10 rounded-xl cursor-pointer"
            />
          </div>
          <div className="">
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Image
            </label>
            <div className="flex flex-col gap-4">
              <label
                className={`inline-flex items-center px-4 py-2 rounded-md cursor-pointer ${theme === "light"
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-slate-600 text-gray-200 hover:bg-slate-500"}`}
              >
                Choose a file
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden rounded"
                />
              </label>
              {!customImageUrl && (
                <span className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  No image selected
                </span>
              )}
              {customImageUrl && (
                <div className="mt-2 flex gap-4">
                  <img src={customImageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
                  <button
                    onClick={handleRemoveImage}
                    className={`px-1 py-1 rounded-full h-8 text-sm border-2 justify-center ${theme === "light"
                      ? "border-red-500/40 text-slate-800 hover:bg-red-600/10"
                      : "border-red-600 text-gray-200 hover:bg-red-700"} items-center flex`}
                  >
                    <X />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Shadow
            </label>
            <select
              value={customShadow}
              onChange={(e) => setCustomShadow(e.target.value)}
              className={`w-[50%] p-2 rounded-md border ${theme === "light"
                ? "border-gray-300 bg-white text-gray-900"
                : "border-slate-600 bg-slate-800 text-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="0px 4px 6px rgba(0, 0, 0, 0.1)">Light</option>
              <option value="0px 8px 12px rgba(0, 0, 0, 0.15)">Medium</option>
              <option value="0px 12px 18px rgba(0, 0, 0, 0.2)">Heavy</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
              Opacity
            </label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={customOpacity}
              onChange={(e) => setCustomOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              {customOpacity}
            </span>
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