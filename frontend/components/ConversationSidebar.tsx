"use client";

import { useEffect, useState } from "react";
import { fetchSessions, SessionListItem } from "@/services/api";
import { useSession } from "@/hooks/useSession";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";

/**
 * Sidebar izquierdo con el historial de conversaciones.
 *
 * Muestra todas las sesiones almacenadas en el backend, ordenadas de más
 * reciente a más antigua. Al hacer clic:
 *   - Sesión activa: se reanuda (modo edición)
 *   - Sesión cerrada: se carga en modo solo lectura
 *
 * La lista se refresca automáticamente cuando cambia la sesión activa.
 */
interface ConversationSidebarProps {
  onNavigate?: () => void;
}

export default function ConversationSidebar({ onNavigate }: ConversationSidebarProps = {}) {
  const { session, messages, isLoading, loadSession } = useSession();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const refreshList = () => {
    fetchSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  // Carga inicial
  useEffect(() => {
    refreshList();
  }, []);

  // Refresca cuando cambia la sesión activa (nueva sesión, cierre, carga)
  useEffect(() => {
    refreshList();
  }, [session?.sessionId]);

  /** Formatea una fecha ISO como texto legible relativo o absoluto. */
  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMinutes < 2) return "Ahora mismo";
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  const isCurrentSession = (s: SessionListItem) =>
    session?.sessionId === s.session_id;

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Cabecera */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-split">
        <HistoryIcon fontSize="small" className="text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">Historial</span>
        {sessions.length > 0 && (
          <span className="ml-auto text-xs text-text-secondary bg-conv-bg px-1.5 py-0.5 rounded-full">
            {sessions.length}
          </span>
        )}
      </div>

      {/* Lista de sesiones */}
      <div className="flex-1 overflow-y-auto">
        {loadingList && (
          <div className="px-4 py-6 text-xs text-text-secondary text-center">
            Cargando...
          </div>
        )}

        {!loadingList && sessions.length === 0 && (
          <div className="px-4 py-6 text-xs text-text-secondary text-center leading-relaxed">
            Aún no hay conversaciones.
            <br />
            Inicia una sesión para empezar.
          </div>
        )}

        {!loadingList && sessions.map((s) => {
          const isCurrent = isCurrentSession(s);
          const isClosed = s.status === "closed";

          return (
            <button
              key={s.session_id}
              type="button"
              disabled={isLoading}
              onClick={() => { loadSession(s.session_id); onNavigate?.(); }}
              className={[
                "w-full text-left px-4 py-3 border-b border-split transition-colors",
                "hover:bg-conv-bg focus:outline-none focus:bg-conv-bg",
                isCurrent
                  ? "bg-blue-50 border-l-2 border-l-primary-btn"
                  : "bg-white",
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
              aria-current={isCurrent ? "true" : undefined}
            >
              {/* Nombre del perfil + badge estado */}
              <div className="flex items-center gap-1.5 mb-0.5">
                {isClosed ? (
                  <LockIcon
                    fontSize="inherit"
                    className="text-text-secondary flex-shrink-0"
                    style={{ fontSize: "11px" }}
                  />
                ) : (
                  <RadioButtonCheckedIcon
                    fontSize="inherit"
                    className="text-green-600 flex-shrink-0"
                    style={{ fontSize: "11px" }}
                  />
                )}
                <span
                  className={[
                    "text-xs font-medium truncate",
                    isCurrent ? "text-primary-dark" : "text-text-primary",
                  ].join(" ")}
                >
                  {s.profile_name}
                </span>
              </div>

              {/* Brief + departamento */}
              <div className="text-xs text-text-secondary truncate mb-1">
                {s.brief_name}
                {s.department_name && (
                  <span className="text-text-secondary"> · {s.department_name}</span>
                )}
              </div>

              {/* Fecha + conteo de mensajes */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  {formatDate(s.created_at)}
                </span>
                <span className="text-xs text-text-secondary">
                  {isCurrent ? messages.length : s.message_count} msg
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
