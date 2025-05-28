"use client"

import { ReactNode, useEffect, useRef } from "react"
import { useTheme } from "../themeContext"
import { Heart, Smile, Star, User } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface VisualOption {
    type: "image" | 'icon' | 'emoji'
    value: string | React.ReactNode
}

interface Item {
    value: string | ReactNode;
    label: string;
}

interface ProfileVisualProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (visual: VisualOption) => void;
    emojis?: string[]; // Lista de emojis configurável
    icons?: Item[]; // Lista de ícones configurável
    images?: Item[]; // Lista de imagens configurável
}

const ProfileVisualDropdown: React.FC<ProfileVisualProps> = ({
 isOpen,
  onClose,
  onSelect,
  emojis = ['😊', '🚀', '🌟', '👤', '🎉', '🐱', '🦁', '🌈', '🍎', '💡'], // Valores padrão
  icons = [],
  images = [],
}) => {
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-20 mt-2 left-0 w-64 rounded-md shadow-lg ${theme === 'light' ? 'bg-white border border-gray-300' : 'bg-slate-600 border border-slate-500'}`}
        >
          <div className="p-4">
            {/* Seção de Imagens */}
            {images.length > 0 && (
              <>
                <h3 className={`text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}>
                  Images
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-3 gap-2 mb-4">
                  {images.map((img, index) => (
                    <div
                      key={`image-${index}`}
                      onClick={() => onSelect({ type: 'image', value: img.value })}
                      className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-fuchsia-100' : 'hover:bg-fuchsia-700'}`}
                    >
                      <img src={img.value as string} alt={img.label} className="w-8 h-8 rounded-full" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Seção de Ícones */}
            {icons.length > 0 && (
              <>
                <h3 className={`text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}>
                  Icons
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-3 gap-2 mb-4">
                  {icons.map((icon, index) => (
                    <div
                      key={`icon-${index}`}
                      onClick={() => onSelect({ type: 'icon', value: icon.value })}
                      className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-fuchsia-100' : 'hover:bg-fuchsia-700'}`}
                    >
                      <span className="text-xl">{icon.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Seção de Emojis */}
            {emojis.length > 0 && (
              <>
                <h3 className={`text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-neutral-200'}`}>
                  Emojis
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-3 gap-2">
                  {emojis.map((emoji, index) => (
                    <div
                      key={`emoji-${index}`}
                      onClick={() => onSelect({ type: 'emoji', value: emoji })}
                      className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-fuchsia-100' : 'hover:bg-fuchsia-700'}`}
                    >
                      <span className="text-xl">{emoji}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default ProfileVisualDropdown