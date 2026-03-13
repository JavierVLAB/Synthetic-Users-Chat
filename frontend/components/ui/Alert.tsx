/**
 * Componente Alert — mensajes de estado para el usuario.
 *
 * Tipos:
 *   - error:   fondo rojo claro (#fff3f0), texto oscuro, ícono ✕
 *   - success: fondo verde claro (#f6ffed), texto oscuro, ícono ✓
 *   - info:    fondo azul claro (#f0f5ff), texto oscuro, ícono ℹ
 *
 * Acepta un botón de cierre opcional (`onClose`). Si no se proporciona,
 * la alerta no tiene botón de cierre (se asume que el componente padre
 * la desmonta cuando corresponde).
 */

import React from "react";

type AlertType = "error" | "success" | "info";

interface AlertProps {
  /** Tipo visual de la alerta. */
  type: AlertType;
  /** Mensaje principal mostrado al usuario. */
  message: string;
  /** Callback opcional para cerrar la alerta. */
  onClose?: () => void;
}

/** Configuración de estilos e íconos por tipo de alerta. */
const ALERT_CONFIG: Record<
  AlertType,
  { bg: string; border: string; icon: string; iconColor: string }
> = {
  error: {
    bg: "bg-[#fff3f0]",
    border: "border-error/30",
    icon: "✕",
    iconColor: "text-error",
  },
  success: {
    bg: "bg-[#f6ffed]",
    border: "border-green-300",
    icon: "✓",
    iconColor: "text-green-600",
  },
  info: {
    bg: "bg-[#f0f5ff]",
    border: "border-accent/30",
    icon: "ℹ",
    iconColor: "text-accent",
  },
};

export default function Alert({ type, message, onClose }: AlertProps) {
  const { bg, border, icon, iconColor } = ALERT_CONFIG[type];

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        bg,
        border,
      ].join(" ")}
    >
      {/* Ícono de tipo */}
      <span className={`mt-0.5 flex-shrink-0 font-bold ${iconColor}`}>
        {icon}
      </span>

      {/* Mensaje */}
      <p className="flex-1 text-text-primary">{message}</p>

      {/* Botón de cierre opcional */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar alerta"
          className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
