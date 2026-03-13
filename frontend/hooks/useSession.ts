/**
 * Hook useSession — acceso conveniente al SessionContext.
 *
 * Encapsula el patrón useContext(SessionContext) con validación de que el hook
 * se use dentro del árbol del SessionProvider. Todos los componentes que
 * necesiten el estado de sesión deben usar este hook en lugar de importar
 * SessionContext directamente.
 *
 * Uso:
 *   const { session, messages, sendMessage, isLoading } = useSession();
 */

"use client";

import { useContext } from "react";
import { SessionContext, SessionContextValue } from "@/context/SessionContext";

/**
 * Devuelve el valor actual del contexto de sesión.
 *
 * @throws Error si se usa fuera del SessionProvider.
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession debe usarse dentro de un <SessionProvider>. " +
        "Verifica que SessionProvider envuelve el árbol de componentes."
    );
  }

  return context;
}
