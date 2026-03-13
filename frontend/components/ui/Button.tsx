/**
 * Componente Button — botón primario y variantes.
 *
 * Variantes:
 *   - primary: fondo verde menta (#90ffbb) con texto oscuro (#004656), para
 *              acciones principales como "Iniciar sesión"
 *   - secondary: borde sutil con fondo blanco, para acciones secundarias
 *   - danger: fondo rojo (#d52b1e) con texto blanco, para acciones destructivas
 *
 * Tamaños:
 *   - sm: compacto, para acciones dentro de tarjetas
 *   - md: tamaño estándar (por defecto)
 *   - lg: para CTAs principales
 *
 * El botón muestra un estado deshabilitado visual cuando `disabled` o `loading`
 * están activos, y bloquea la interacción durante la carga.
 */

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del botón. Por defecto: "primary". */
  variant?: ButtonVariant;
  /** Tamaño del botón. Por defecto: "md". */
  size?: ButtonSize;
  /** Muestra un spinner y bloquea la interacción. */
  loading?: boolean;
  /** Contenido del botón. */
  children: React.ReactNode;
}

/** Clases de estilo por variante. */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-btn text-primary-dark hover:brightness-95 disabled:bg-primary-btn/50",
  secondary:
    "bg-white text-primary-dark border border-split hover:bg-conv-bg disabled:bg-conv-bg",
  danger:
    "bg-error text-white hover:brightness-90 disabled:bg-error/50",
};

/** Clases de padding y tipografía por tamaño. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-normal",
        "transition-all duration-150 cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
