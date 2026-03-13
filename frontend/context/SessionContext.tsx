/**
 * Contexto de sesión — estado global de la investigación activa.
 *
 * Proporciona a todos los componentes de la app acceso a:
 *   - La sesión activa (session_id, perfil, brief)
 *   - Acciones para iniciar y cerrar sesión
 *   - El historial de mensajes del chat
 *   - El estado de carga durante las llamadas al LLM
 *
 * Uso:
 *   const { session, messages, startSession, closeSession } = useSession();
 *
 * No se usa Redux ni Zustand para mantener las dependencias mínimas:
 * el estado es lo suficientemente simple para Context API + useReducer.
 */

"use client";

import React, { createContext, useCallback, useReducer } from "react";
import {
  createSession,
  sendChatMessage,
  sendQuestionnaire,
  closeSession as apiCloseSession,
  ChatMessage,
} from "@/services/api";

/* ── Tipos ──────────────────────────────────────────────────────────────── */

/** Información de la sesión activa. */
export interface ActiveSession {
  sessionId: string;
  profileId: string;
  profileName: string;
  briefId: string;
  briefName: string;
}

export interface SessionState {
  /** Sesión activa, o null si no hay sesión en curso. */
  session: ActiveSession | null;
  /** Historial de mensajes del chat en la sesión actual. */
  messages: ChatMessage[];
  /** true mientras se espera respuesta del LLM. */
  isLoading: boolean;
  /** Mensaje de error si la última operación falló. */
  error: string | null;
}

/* ── Acciones del reducer ────────────────────────────────────────────────── */

type SessionAction =
  | { type: "SESSION_STARTED"; payload: ActiveSession }
  | { type: "SESSION_CLOSED" }
  | { type: "MESSAGE_ADDED"; payload: ChatMessage }
  | { type: "LOADING_START" }
  | { type: "LOADING_END" }
  | { type: "ERROR_SET"; payload: string }
  | { type: "ERROR_CLEAR" };

/* ── Reducer ─────────────────────────────────────────────────────────────── */

function sessionReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case "SESSION_STARTED":
      return {
        ...state,
        session: action.payload,
        messages: [],
        error: null,
      };
    case "SESSION_CLOSED":
      return {
        ...state,
        session: null,
        messages: [],
        error: null,
        isLoading: false,
      };
    case "MESSAGE_ADDED":
      return { ...state, messages: [...state.messages, action.payload] };
    case "LOADING_START":
      return { ...state, isLoading: true, error: null };
    case "LOADING_END":
      return { ...state, isLoading: false };
    case "ERROR_SET":
      return { ...state, error: action.payload, isLoading: false };
    case "ERROR_CLEAR":
      return { ...state, error: null };
    default:
      return state;
  }
}

const initialState: SessionState = {
  session: null,
  messages: [],
  isLoading: false,
  error: null,
};

/* ── Contexto ────────────────────────────────────────────────────────────── */

export interface SessionContextValue extends SessionState {
  /**
   * Inicia una nueva sesión de investigación.
   *
   * Genera un UUID, llama a `POST /sessions` y actualiza el estado.
   *
   * @param profileId   - ID del perfil de comportamiento seleccionado
   * @param profileName - Nombre legible del perfil (para mostrar en UI)
   * @param briefId     - ID del brief de producto seleccionado
   * @param briefName   - Nombre legible del brief (para mostrar en UI)
   */
  startSession: (
    profileId: string,
    profileName: string,
    briefId: string,
    briefName: string
  ) => Promise<void>;

  /**
   * Cierra la sesión activa llamando a `DELETE /sessions/{id}`.
   * Resetea el estado para permitir iniciar una nueva sesión.
   */
  closeSession: () => Promise<void>;

  /**
   * Envía un mensaje del investigador y recibe la respuesta del LLM.
   * Añade ambos mensajes al historial.
   *
   * @param message - Texto del investigador
   */
  sendMessage: (message: string) => Promise<void>;

  /**
   * Envía un cuestionario (lista de preguntas) al LLM.
   * La respuesta se añade al historial como un mensaje del asistente.
   *
   * @param questions - Array de preguntas en texto plano
   */
  submitQuestionnaire: (questions: string[]) => Promise<void>;

  /** Limpia el error actual del estado. */
  clearError: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────────────────────── */

/**
 * Proveedor del contexto de sesión.
 *
 * Debe envolver el árbol de componentes que necesitan acceso al estado
 * de sesión. En esta aplicación, envuelve la página completa en `page.tsx`.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  /** Añade un mensaje al historial con timestamp actual. */
  const addMessage = useCallback(
    (role: "user" | "assistant", content: string) => {
      const message: ChatMessage = {
        role,
        content,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: "MESSAGE_ADDED", payload: message });
    },
    []
  );

  const startSession = useCallback(
    async (
      profileId: string,
      profileName: string,
      briefId: string,
      briefName: string
    ) => {
      dispatch({ type: "LOADING_START" });
      try {
        const sessionData = await createSession(profileId, briefId);
        dispatch({
          type: "SESSION_STARTED",
          payload: {
            sessionId: sessionData.session_id,
            profileId,
            profileName,
            briefId,
            briefName,
          },
        });
      } catch {
        dispatch({
          type: "ERROR_SET",
          payload: "No se pudo iniciar la sesión. ¿Está el servidor activo?",
        });
      } finally {
        dispatch({ type: "LOADING_END" });
      }
    },
    []
  );

  const closeSession = useCallback(async () => {
    if (!state.session) return;
    try {
      await apiCloseSession(state.session.sessionId);
    } catch {
      // Aunque falle la llamada al backend, limpiamos el estado local
      // para que el investigador no quede bloqueado.
    } finally {
      dispatch({ type: "SESSION_CLOSED" });
    }
  }, [state.session]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!state.session || state.isLoading) return;

      addMessage("user", message);
      dispatch({ type: "LOADING_START" });

      try {
        const response = await sendChatMessage(state.session.sessionId, message);
        addMessage("assistant", response.assistant_message.content);
      } catch {
        dispatch({
          type: "ERROR_SET",
          payload:
            "Error al contactar con el modelo de IA. Inténtalo de nuevo.",
        });
      } finally {
        dispatch({ type: "LOADING_END" });
      }
    },
    [state.session, state.isLoading, addMessage]
  );

  const submitQuestionnaire = useCallback(
    async (questions: string[]) => {
      if (!state.session || state.isLoading) return;

      dispatch({ type: "LOADING_START" });

      try {
        const response = await sendQuestionnaire(
          state.session.sessionId,
          questions
        );
        addMessage("assistant", response.assistant_message.content);
      } catch {
        dispatch({
          type: "ERROR_SET",
          payload: "Error al enviar el cuestionario. Inténtalo de nuevo.",
        });
      } finally {
        dispatch({ type: "LOADING_END" });
      }
    },
    [state.session, state.isLoading, addMessage]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "ERROR_CLEAR" });
  }, []);

  return (
    <SessionContext.Provider
      value={{
        ...state,
        startSession,
        closeSession,
        sendMessage,
        submitQuestionnaire,
        clearError,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
