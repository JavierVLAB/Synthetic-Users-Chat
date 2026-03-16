/**
 * AssistantMessage — mensaje del usuario sintético (rol "assistant").
 *
 * Renderiza el contenido como Markdown usando react-markdown para que las
 * respuestas del LLM puedan incluir listas, negritas, etc.
 * Se muestra alineado a la izquierda con fondo blanco y borde sutil.
 */

import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/services/api";
import AnswerActions from "./AnswerActions";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface AssistantMessageProps {
  message: ChatMessage;
}

export default function AssistantMessage({ message }: AssistantMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        {/* Avatar */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center mt-0.5">
            <span className="text-primary-btn text-xs font-bold">S</span>
          </div>
          <div className="flex-1">
            <div className="text-base font-light leading-relaxed text-primary-dark">
              <div className="prose prose-sm max-w-none
                prose-p:my-1 prose-ul:my-1 prose-ol:my-1
                prose-li:my-0.5 prose-headings:my-2
                prose-strong:font-bold prose-strong:text-primary-dark
                prose-a:text-accent prose-a:underline">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <p className="inline-flex items-center gap-0.5 text-xs text-text-secondary">
                <AccessTimeIcon fontSize="inherit" />
                {new Date(message.timestamp).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <AnswerActions content={message.content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
