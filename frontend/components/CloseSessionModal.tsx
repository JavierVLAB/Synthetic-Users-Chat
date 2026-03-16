"use client";

/**
 * CloseSessionModal — modal de confirmación para cerrar la sesión.
 *
 * Ofrece dos opciones:
 *  1. Descargar el PDF de la sesión antes de cerrar.
 *  2. Cerrar directamente sin descargar.
 *
 * Al confirmar, llama a onConfirm() que cierra la sesión y resetea el estado.
 */

import Button from "@/components/ui/Button";
import { getPdfUrl } from "@/services/api";

interface CloseSessionModalProps {
  sessionId: string;
  sessionName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CloseSessionModal({
  sessionId,
  sessionName,
  onConfirm,
  onCancel,
  isLoading,
}: CloseSessionModalProps) {
  const pdfUrl = getPdfUrl(sessionId);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-modal-title"
    >
      {/* Panel */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-split">
          <h2
            id="close-modal-title"
            className="text-base font-medium text-primary-dark"
          >
            ¿Cerrar la sesión?
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-base text-text-secondary leading-relaxed">
            Vas a finalizar la sesión con{" "}
            <span className="font-medium text-text-primary">{sessionName}</span>
            . Esta acción no se puede deshacer.
          </p>

          <div className="rounded-xl border border-split bg-app-bg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Descargar resumen PDF
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Incluye el historial completo de la conversación.
              </p>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                bg-primary-btn text-primary-dark text-sm font-medium hover:brightness-95 transition-all"
            >
              ⬇ PDF
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <Button variant="secondary" size="md" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={isLoading}
            onClick={onConfirm}
          >
            Cerrar chat
          </Button>
        </div>
      </div>
    </div>
  );
}
