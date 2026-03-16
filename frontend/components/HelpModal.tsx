"use client";

/**
 * HelpModal — modal de ayuda genérico.
 *
 * Muestra un título y contenido ReactNode (texto, iconos, listas…).
 * Se cierra con el botón "Cerrar", clic en el backdrop o tecla Escape.
 */

import { useEffect } from "react";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

interface HelpModalProps {
  title: string;
  content: ReactNode;
  onClose: () => void;
}

export default function HelpModal({ title, content, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-split">
          <h2 id="help-modal-title" className="text-base font-medium text-primary-dark">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {content}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end border-t border-split pt-4">
          <Button variant="primary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
