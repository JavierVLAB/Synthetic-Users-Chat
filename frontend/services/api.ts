/**
 * Cliente HTTP centralizado para comunicarse con el backend FastAPI.
 *
 * Usa axios con una instancia configurada a partir de la variable de entorno
 * `NEXT_PUBLIC_API_URL`. Si la variable no está definida, apunta a
 * `http://localhost:8000` para que funcione en desarrollo sin configuración.
 *
 * Todos los módulos de la app deben importar desde aquí, nunca crear
 * instancias de axios directamente, para que los headers y la base URL
 * estén definidos en un único lugar.
 */

import axios from "axios";

/** URL base del backend, configurable por variable de entorno. */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "moeve-auth-token";
const COOKIE_NAME = "auth-token";

/**
 * Instancia de axios preconfigurada.
 *
 * - `baseURL`: URL del backend FastAPI
 * - `headers`: Content-Type JSON por defecto
 * - `timeout`: 90 segundos (las respuestas del LLM pueden tardar)
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90_000,
});

// Interceptor de request: añade el JWT en todas las llamadas
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: si el backend devuelve 401, limpia el token y redirige a /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

/* ── Tipos de respuesta del backend ─────────────────────────────────────── */

/** Resumen de un perfil de comportamiento listado en el dropdown. */
export interface ProfileSummary {
  id: string;
  name: string;
}

/** Resumen de un brief de producto listado en el dropdown. */
export interface BriefSummary {
  id: string;
  name: string;
}

/** Respuesta de creación de sesión. */
export interface SessionResponse {
  session_id: string;
  profile_id: string;
  brief_id: string;
  status: "active" | "closed";
  created_at: string;
}

/** Un mensaje del historial de conversación. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/** Respuesta del endpoint de chat. */
export interface ChatResponse {
  session_id: string;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

/** Respuesta del endpoint de cuestionario. */
export interface QuestionnaireResponse {
  session_id: string;
  questionnaire_message: ChatMessage;
  assistant_message: ChatMessage;
}

/* ── Funciones de acceso a la API ────────────────────────────────────────── */

/**
 * Obtiene la lista de perfiles de comportamiento disponibles.
 * Mapea al endpoint `GET /profiles`.
 */
export async function fetchProfiles(): Promise<ProfileSummary[]> {
  const { data } = await api.get<ProfileSummary[]>("/profiles");
  return data;
}

/**
 * Obtiene la lista de briefs de producto disponibles.
 * Mapea al endpoint `GET /briefs`.
 */
export async function fetchBriefs(): Promise<BriefSummary[]> {
  const { data } = await api.get<BriefSummary[]>("/briefs");
  return data;
}

/**
 * Crea una nueva sesión de investigación.
 * Mapea al endpoint `POST /sessions`.
 *
 * @param sessionId - UUID v4 generado en el cliente
 * @param profileId - ID del perfil de comportamiento seleccionado
 * @param briefId   - ID del brief de producto seleccionado
 */
export async function createSession(
  profileId: string,
  briefId: string
): Promise<SessionResponse> {
  const { data } = await api.post<SessionResponse>("/sessions", {
    profile_id: profileId,
    brief_id: briefId,
  });
  return data;
}

/**
 * Envía un mensaje del investigador al usuario sintético.
 * Mapea al endpoint `POST /sessions/{id}/chat`.
 *
 * @param sessionId - ID de la sesión activa
 * @param message   - Texto del mensaje del investigador
 */
export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>(
    `/sessions/${sessionId}/chat`,
    { message }
  );
  return data;
}

/**
 * Envía un cuestionario (lista de preguntas) al usuario sintético.
 * El LLM responde todas las preguntas en un solo mensaje.
 * Mapea al endpoint `POST /sessions/{id}/questionnaire`.
 *
 * @param sessionId - ID de la sesión activa
 * @param questions - Array de strings con cada pregunta
 */
export async function sendQuestionnaire(
  sessionId: string,
  questions: string[]
): Promise<QuestionnaireResponse> {
  const { data } = await api.post<QuestionnaireResponse>(
    `/sessions/${sessionId}/questionnaire`,
    { questions }
  );
  return data;
}

/**
 * Cierra una sesión de investigación.
 * Mapea al endpoint `DELETE /sessions/{id}`.
 *
 * @param sessionId - ID de la sesión a cerrar
 */
export async function closeSession(sessionId: string): Promise<void> {
  await api.delete(`/sessions/${sessionId}`);
}

/**
 * Devuelve la URL para descargar el PDF de una sesión.
 * Se usa como `href` en un <a> tag o con `window.open`.
 * Mapea al endpoint `GET /sessions/{id}/pdf`.
 *
 * @param sessionId - ID de la sesión
 */
export function getPdfUrl(sessionId: string): string {
  return `${BASE_URL}/sessions/${sessionId}/pdf`;
}
