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

/** Resumen de un departamento de Moeve listado en el dropdown. */
export interface DepartmentSummary {
  id: string;
  name: string;
  descripcion?: string;
}

/** Resumen de sesión para el sidebar de historial. */
export interface SessionListItem {
  session_id: string;
  profile_id: string;
  profile_name: string;
  brief_id: string;
  brief_name: string;
  department_id?: string;
  department_name?: string;
  llm_provider: string;
  created_at: string;
  closed_at?: string;
  message_count: number;
  status: "active" | "closed";
}

/** Respuesta de creación de sesión. */
export interface SessionResponse {
  session_id: string;
  profile_id: string;
  brief_id: string;
  department_id?: string;
  status: "active" | "closed";
  created_at: string;
  closed_at?: string;
  profile_name?: string;
  brief_name?: string;
  department_name?: string;
  messages?: ChatMessage[];
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
 * @param profileId    - ID del perfil de comportamiento seleccionado
 * @param briefId      - ID del brief de producto seleccionado
 * @param departmentId - ID del departamento de Moeve (opcional)
 */
export async function createSession(
  profileId: string,
  briefId: string,
  departmentId?: string,
): Promise<SessionResponse> {
  const { data } = await api.post<SessionResponse>("/sessions", {
    profile_id: profileId,
    brief_id: briefId,
    ...(departmentId ? { department_id: departmentId } : {}),
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
 * Obtiene la lista de departamentos disponibles.
 * Mapea al endpoint `GET /departments`.
 */
export async function fetchDepartments(): Promise<DepartmentSummary[]> {
  const { data } = await api.get<DepartmentSummary[]>("/departments");
  return data;
}

/**
 * Obtiene la lista de todas las sesiones para el historial.
 * Mapea al endpoint `GET /sessions`.
 */
export async function fetchSessions(): Promise<SessionListItem[]> {
  const { data } = await api.get<SessionListItem[]>("/sessions");
  return data;
}

/**
 * Obtiene el detalle completo de una sesión (con mensajes).
 * Mapea al endpoint `GET /sessions/{id}`.
 *
 * @param sessionId - ID de la sesión
 */
export async function fetchSession(sessionId: string): Promise<SessionResponse> {
  const { data } = await api.get<SessionResponse>(`/sessions/${sessionId}`);
  return data;
}

/**
 * Crea un nuevo brief de producto.
 * Requiere NEXT_PUBLIC_ADMIN_TOKEN configurado en el entorno.
 * Mapea al endpoint `POST /briefs`.
 *
 * @param content - Contenido del brief
 */
export async function createBrief(
  content: Record<string, unknown>
): Promise<{ id: string; name: string }> {
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";
  const { data } = await api.post(
    "/briefs",
    { content },
    { headers: { "X-Admin-Token": adminToken } }
  );
  return data;
}

/**
 * Obtiene el detalle completo de un perfil de comportamiento.
 * Mapea al endpoint `GET /profiles/{id}`.
 */
export async function fetchProfile(profileId: string): Promise<{ id: string; content: Record<string, unknown> }> {
  const { data } = await api.get(`/profiles/${profileId}`);
  return data;
}

/**
 * Actualiza el contenido de un perfil de comportamiento.
 * Requiere NEXT_PUBLIC_ADMIN_TOKEN. Mapea a `PUT /profiles/{id}`.
 */
export async function updateProfile(profileId: string, content: Record<string, unknown>): Promise<void> {
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";
  await api.put(`/profiles/${profileId}`, { content }, { headers: { "X-Admin-Token": adminToken } });
}

/**
 * Obtiene el detalle completo de un brief de producto.
 * Mapea al endpoint `GET /briefs/{id}`.
 */
export async function fetchBrief(briefId: string): Promise<{ id: string; content: Record<string, unknown> }> {
  const { data } = await api.get(`/briefs/${briefId}`);
  return data;
}

/**
 * Actualiza el contenido de un brief de producto.
 * Requiere NEXT_PUBLIC_ADMIN_TOKEN. Mapea a `PUT /briefs/{id}`.
 */
export async function updateBrief(briefId: string, content: Record<string, unknown>): Promise<void> {
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";
  await api.put(`/briefs/${briefId}`, { content }, { headers: { "X-Admin-Token": adminToken } });
}

/**
 * Obtiene el detalle completo de un departamento.
 * Mapea al endpoint `GET /departments/{id}`.
 */
export async function fetchDepartment(deptId: string): Promise<{ id: string; content: Record<string, unknown> }> {
  const { data } = await api.get(`/departments/${deptId}`);
  return data;
}

/**
 * Actualiza el contenido de un departamento.
 * Requiere NEXT_PUBLIC_ADMIN_TOKEN. Mapea a `PUT /departments/{id}`.
 */
export async function updateDepartment(deptId: string, content: Record<string, unknown>): Promise<void> {
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";
  await api.put(`/departments/${deptId}`, { content }, { headers: { "X-Admin-Token": adminToken } });
}

/**
 * Crea un nuevo departamento.
 * Requiere NEXT_PUBLIC_ADMIN_TOKEN configurado en el entorno.
 * Mapea al endpoint `POST /departments`.
 *
 * @param content - Contenido del departamento
 */
export async function createDepartment(
  content: Record<string, unknown>
): Promise<{ id: string; name: string }> {
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";
  const { data } = await api.post(
    "/departments",
    { content },
    { headers: { "X-Admin-Token": adminToken } }
  );
  return data;
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
