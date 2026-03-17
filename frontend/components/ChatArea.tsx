"use client";

/**
 * ChatArea — área de conversación con scroll automático.
 */

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/services/api";
import MessageBubble from "./MessageBubble";
import AssistantMessage from "./AssistantMessage";
import AnimatedLoader from "./AnimatedLoader";

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-conv-bg rounded-xl border border-gray-100">
        <div className="text-center text-text-secondary">
          <p className="text-lg mb-1">Conversación vacía</p>
          <p className="text-sm">Escribe un mensaje para comenzar la entrevista.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-conv-bg rounded-xl border border-gray-100 p-4">
      <div className="flex flex-col gap-4">
        {messages.map((msg, i) => {
          if (msg.role === "user") {
            const next = messages[i + 1];
            const debug = next?.system_prompt
              ? {
                  system_prompt: next.system_prompt,
                  messages_sent: next.messages_sent
                    ? (JSON.parse(next.messages_sent) as Array<{ role: string; content: string }>)
                    : [],
                  usage:
                    next.prompt_tokens != null
                      ? {
                          prompt_tokens: next.prompt_tokens!,
                          completion_tokens: next.completion_tokens!,
                          total_tokens: next.total_tokens!,
                        }
                      : null,
                }
              : undefined;
            return <MessageBubble key={i} message={msg} debug={debug} />;
          }
          return <AssistantMessage key={i} message={msg} />;
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center">
                <span className="text-primary-btn text-xs font-bold">S</span>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm">
                <AnimatedLoader />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
