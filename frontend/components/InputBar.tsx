"use client";

/**
 * InputBar — barra de entrada de mensajes.
 *
 * Permite al investigador escribir un mensaje o subir un cuestionario .txt.
 * Se deshabilita mientras el LLM está procesando (isLoading).
 * Envía el mensaje con Enter (sin Shift) o con el botón.
 */

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import QuestionnaireUpload from "./QuestionnaireUpload";
import SendIcon from "@mui/icons-material/Send";

interface InputBarProps {
  onSend: (message: string) => Promise<void>;
  onQuestionnaire: (questions: string[]) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export default function InputBar({
  onSend,
  onQuestionnaire,
  isLoading,
  disabled,
}: InputBarProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !isLoading && !disabled;

  const handleSend = async () => {
    if (!canSend) return;
    const msg = text.trim();
    setText("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-split bg-white pt-3 pb-2 px-0">
      <div className="flex items-end gap-2 bg-[#f2f6f7] rounded-lg px-3 py-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            disabled
              ? "Inicia el chat para escribir…"
              : "Escribe una pregunta…"
          }
          disabled={disabled || isLoading}
          rows={1}
          className={[
            "flex-1 resize-none bg-transparent text-base font-light text-primary-dark placeholder:text-text-secondary",
            "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[40px] max-h-[160px] py-1 leading-relaxed",
            disabled ? "text-center" : "",
          ].join(" ")}
          aria-label="Mensaje al usuario sintético"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <QuestionnaireUpload
            onSubmit={onQuestionnaire}
            disabled={disabled || isLoading}
          />
          <Button
            variant="primary"
            size="sm"
            loading={isLoading}
            disabled={!canSend}
            onClick={handleSend}
            aria-label="Enviar mensaje"
          >
            <SendIcon fontSize="small" /> Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
