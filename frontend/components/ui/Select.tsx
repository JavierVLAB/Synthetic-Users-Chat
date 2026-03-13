/**
 * Componente Select — dropdown accesible.
 *
 * Envuelve el elemento nativo <select> con estilos coherentes con el sistema
 * de diseño Moeve. Muestra una flecha personalizada (▼) alineada a la derecha.
 *
 * Recibe las opciones como un array de `{ value, label }` para mantener el
 * componente desacoplado de los tipos de datos del dominio.
 */

import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  /** Opciones del dropdown. */
  options: SelectOption[];
  /** Texto del placeholder mostrado cuando no hay selección. */
  placeholder?: string;
  /** Etiqueta accesible del campo (para aria-label). */
  label?: string;
}

export default function Select({
  options,
  placeholder = "Selecciona una opción",
  label,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        aria-label={label}
        className={[
          "w-full appearance-none rounded-lg border border-split bg-white",
          "px-3 py-1.5 pr-8 text-sm text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
          "disabled:bg-conv-bg disabled:cursor-not-allowed disabled:opacity-60",
          "transition-colors duration-150",
          className,
        ].join(" ")}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Flecha decorativa — pointer-events-none para no bloquear el click */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">
        ▼
      </span>
    </div>
  );
}
