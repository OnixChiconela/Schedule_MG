"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { useTheme } from "@/app/themeContext";
import { IoMdClose } from "react-icons/io";

interface BaseAuthModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const BaseAuthModal = ({ isOpen, onClose, title, children }: BaseAuthModalProps) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black/80 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50`}>
      <div
        className={`
          w-[90vw] h-[80%] max-w-4xl rounded-lg shadow-lg overflow-hidden flex
          transition-all duration-300
          ${showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
          ${theme === "light" ? "bg-white" : "bg-slate-900"}
        `}
      >
        {/* Imagem à esquerda (escondida em telas pequenas) */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth-image.jpg')" }}
          role="img"
          aria-label="Authentication illustration"
        />
        
        {/* Conteúdo à direita */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <button
              onClick={handleClose}
              className={`p-2 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-slate-700"}`}
              aria-label="Close modal"
            >
              <IoMdClose size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseAuthModal;
