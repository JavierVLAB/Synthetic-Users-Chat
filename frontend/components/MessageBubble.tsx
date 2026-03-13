/**
 * MessageBubble — burbuja de mensaje del investigador (rol "user").
 * Se muestra alineada a la derecha con fondo verde menta.
 */

import { ChatMessage } from "@/services/api";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[70%]">
        <div className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl bg-[rgba(4,125,186,0.1)] text-primary-dark px-4 py-3 text-base font-light leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <p className="text-xs text-text-secondary mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
