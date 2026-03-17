/**
 * MessageBubble — burbuja de mensaje del investigador (rol "user").
 * Se muestra alineada a la derecha. Incluye un apartado de debug
 * colapsable si hay datos de contexto disponibles para ese turno.
 */

import { ChatMessage, TokenUsage } from "@/services/api";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface MessageDebug {
  system_prompt: string;
  messages_sent: Array<{ role: string; content: string }>;
  usage: TokenUsage | null;
}

interface MessageBubbleProps {
  message: ChatMessage;
  debug?: MessageDebug;
}

export default function MessageBubble({ message, debug }: MessageBubbleProps) {
  return (
    <div className="flex justify-end">
      {/* Columna derecha: burbuja + debug, alineados a la derecha */}
      <div className="flex flex-col items-end gap-1 max-w-[80%]">
        {/* Burbuja del mensaje */}
        <div className="max-w-full">
          <div className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl bg-[rgba(4,125,186,0.1)] text-primary-dark px-4 py-3 text-base font-light leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          <p className="inline-flex items-center justify-end gap-0.5 w-full text-xs text-text-secondary mt-1">
            <AccessTimeIcon fontSize="inherit" />
            {new Date(message.timestamp).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Panel de debug — ancho propio, independiente del ancho de la burbuja */}
        {debug && (
          <details className="w-full">
            <summary className="cursor-pointer list-none flex justify-end select-none">
              <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary border border-split rounded-full px-2 py-0.5 hover:bg-gray-100 hover:text-primary-dark transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M10 2a.75.75 0 0 1 .75.75v.258a3.25 3.25 0 0 1 2.384 1.737l.505-.292a.75.75 0 0 1 .75 1.299l-.505.292c.044.233.066.473.066.716v.5h1.25a.75.75 0 0 1 0 1.5H14v.5c0 .243-.022.483-.066.716l.505.292a.75.75 0 1 1-.75 1.299l-.505-.292A3.25 3.25 0 0 1 10.75 12.5v.25H12a.75.75 0 0 1 0 1.5h-1.25V15.5a.75.75 0 0 1-1.5 0v-1.25H8a.75.75 0 0 1 0-1.5h1.25v-.25a3.25 3.25 0 0 1-2.434-1.737l-.505.292a.75.75 0 1 1-.75-1.299l.505-.292A3.27 3.27 0 0 1 6 8.76v-.5H4.75a.75.75 0 0 1 0-1.5H6v-.5c0-.243.022-.483.066-.716l-.505-.292a.75.75 0 0 1 .75-1.299l.505.292A3.25 3.25 0 0 1 9.25 3.008V2.75A.75.75 0 0 1 10 2Z" />
                </svg>
                debug
              </span>
            </summary>

            <div className="mt-1 w-full min-w-[300px] bg-gray-50 border border-split rounded-lg p-3 flex flex-col gap-2 text-left">
              {/* Token usage */}
              {debug.usage && (
                <p className="text-[10px] text-text-secondary">
                  Tokens:{" "}
                  <span className="font-medium text-text-primary">
                    {debug.usage.prompt_tokens.toLocaleString()} prompt +{" "}
                    {debug.usage.completion_tokens.toLocaleString()} respuesta ={" "}
                    <strong>{debug.usage.total_tokens.toLocaleString()}</strong> total
                  </span>
                </p>
              )}
              {!debug.usage && (
                <p className="text-[10px] text-text-secondary italic">
                  Este proveedor no reporta tokens.
                </p>
              )}

              {/* System prompt */}
              <details>
                <summary className="cursor-pointer text-[10px] font-medium text-text-secondary hover:text-text-primary">
                  System prompt
                </summary>
                <textarea
                  readOnly
                  value={debug.system_prompt}
                  className="mt-1 w-full h-36 text-[10px] font-mono text-text-primary bg-white border border-split rounded p-1.5 resize-none focus:outline-none"
                />
              </details>

              {/* Messages sent */}
              <details>
                <summary className="cursor-pointer text-[10px] font-medium text-text-secondary hover:text-text-primary">
                  Mensajes enviados al LLM ({debug.messages_sent.length})
                </summary>
                <div className="mt-1 flex flex-col gap-0.5 max-h-36 overflow-y-auto rounded border border-split bg-white p-1.5">
                  {debug.messages_sent.map((m, i) => (
                    <div key={i} className="text-[10px] font-mono">
                      <span
                        className={`font-semibold ${
                          m.role === "user" ? "text-blue-600" : "text-green-700"
                        }`}
                      >
                        [{m.role}]
                      </span>{" "}
                      <span className="text-text-primary break-words">
                        {m.content.length > 150
                          ? m.content.slice(0, 150) + "…"
                          : m.content}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
