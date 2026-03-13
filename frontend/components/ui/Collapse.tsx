/**
 * Componente Collapse — acordeón animado.
 *
 * Muestra u oculta su contenido (`children`) según la prop `open`.
 * La animación de apertura/cierre se logra interpolando `max-height` y `opacity`
 * con transiciones CSS, evitando dependencias externas de animación.
 *
 * Este componente es "controlado": el padre maneja el estado `open` y provee
 * el callback `onToggle` para alternar. Esto permite que `SessionAccordion`
 * controle explícitamente cuándo colapsar (al iniciar sesión) o expandir
 * (al cerrar sesión), sin depender del estado interno del acordeón.
 */

"use client";

import React from "react";

interface CollapseProps {
  /** Cuando es true, el contenido es visible. */
  open: boolean;
  /** Callback que se llama al hacer click en el header del acordeón. */
  onToggle: () => void;
  /** Contenido del header clickeable (siempre visible). */
  header: React.ReactNode;
  /** Contenido colapsable. */
  children: React.ReactNode;
}

export default function Collapse({
  open,
  onToggle,
  header,
  children,
}: CollapseProps) {
  return (
    <div className="w-full">
      {/* Header clickeable — siempre visible */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {header}
      </button>

      {/* Contenido colapsable con transición CSS */}
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
