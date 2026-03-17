"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { ActiveSession } from "@/context/SessionContext";
import { TokenUsage } from "@/services/api";

export interface DebugEntry {
  turnIndex: number;
  systemPrompt: string;
  messagesSent: Array<{ role: string; content: string }>;
  usage: TokenUsage | null;
  totalMessages: number;
}

interface DebugPanelProps {
  debugHistory: DebugEntry[];
  session: ActiveSession | null;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "context" | "tokens";

export default function DebugPanel({
  debugHistory,
  isOpen,
  onClose,
}: DebugPanelProps) {
  const [tab, setTab] = useState<Tab>("context");
  const [expandedTurn, setExpandedTurn] = useState<number | null>(null);

  if (!isOpen) return null;

  const lastEntry = debugHistory[debugHistory.length - 1] ?? null;
  const expandedIndex = expandedTurn ?? (lastEntry?.turnIndex ?? null);

  const tabClass = (t: Tab) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      tab === t
        ? "bg-primary-btn text-primary-dark"
        : "text-text-secondary hover:text-text-primary"
    }`;

  const totalUsage = debugHistory.reduce(
    (acc, e) =>
      e.usage
        ? {
            prompt_tokens: acc.prompt_tokens + e.usage.prompt_tokens,
            completion_tokens: acc.completion_tokens + e.usage.completion_tokens,
            total_tokens: acc.total_tokens + e.usage.total_tokens,
          }
        : acc,
    { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  );
  const hasAnyUsage = debugHistory.some((e) => e.usage !== null);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white shadow-xl flex flex-col border-l border-split">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-split flex-shrink-0">
          <span className="text-sm font-medium text-primary-dark">Panel de debug</span>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Cerrar panel de debug"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-split flex-shrink-0">
          <button type="button" className={tabClass("context")} onClick={() => setTab("context")}>
            Contexto
          </button>
          <button type="button" className={tabClass("tokens")} onClick={() => setTab("tokens")}>
            Tokens
            {hasAnyUsage && (
              <span className="ml-1 text-[10px] text-text-secondary">
                {totalUsage.total_tokens.toLocaleString()}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Tab: Contexto ── */}
          {tab === "context" && (
            <div className="flex flex-col">
              {debugHistory.length === 0 ? (
                <p className="text-sm text-text-secondary text-center mt-8 px-4">
                  Envía el primer mensaje para ver el contexto enviado a la IA.
                </p>
              ) : (
                [...debugHistory].reverse().map((entry) => {
                  const isExpanded = expandedIndex === entry.turnIndex;
                  const isTruncated = entry.messagesSent.length < entry.totalMessages;
                  return (
                    <div key={entry.turnIndex} className="border-b border-split">
                      {/* Cabecera del turno */}
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedTurn(isExpanded ? null : entry.turnIndex)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-primary">
                            Turno {entry.turnIndex}
                          </span>
                          {isTruncated && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                              Ventana: {entry.messagesSent.length}/{entry.totalMessages} msgs
                            </span>
                          )}
                          {entry.usage && (
                            <span className="text-[10px] text-text-secondary">
                              {entry.usage.total_tokens.toLocaleString()} tokens
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ExpandLessIcon style={{ fontSize: "16px" }} className="text-text-secondary" />
                        ) : (
                          <ExpandMoreIcon style={{ fontSize: "16px" }} className="text-text-secondary" />
                        )}
                      </button>

                      {/* Contenido expandido */}
                      {isExpanded && (
                        <div className="px-4 pb-4 flex flex-col gap-3">
                          {/* System prompt */}
                          <div>
                            <p className="text-xs font-medium text-text-secondary mb-1">
                              System prompt
                            </p>
                            <textarea
                              readOnly
                              value={entry.systemPrompt}
                              className="w-full h-48 text-[11px] font-mono text-text-primary bg-gray-50 border border-split rounded-lg p-2 resize-none focus:outline-none"
                            />
                          </div>
                          {/* Mensajes enviados */}
                          <div>
                            <p className="text-xs font-medium text-text-secondary mb-1">
                              Mensajes enviados al LLM ({entry.messagesSent.length})
                            </p>
                            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-lg border border-split bg-gray-50 p-2">
                              {entry.messagesSent.map((m, i) => (
                                <div key={i} className="text-[11px] font-mono">
                                  <span className={`font-semibold ${m.role === "user" ? "text-blue-600" : "text-green-700"}`}>
                                    [{m.role}]
                                  </span>{" "}
                                  <span className="text-text-primary">
                                    {m.content.length > 200 ? m.content.slice(0, 200) + "…" : m.content}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Tab: Tokens ── */}
          {tab === "tokens" && (
            <div className="p-4">
              {debugHistory.length === 0 ? (
                <p className="text-sm text-text-secondary text-center mt-4">
                  Envía el primer mensaje para ver el uso de tokens.
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-split text-text-secondary">
                      <th className="text-left py-2 font-medium">Turno</th>
                      <th className="text-right py-2 font-medium">Prompt</th>
                      <th className="text-right py-2 font-medium">Respuesta</th>
                      <th className="text-right py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugHistory.map((entry) => (
                      <tr key={entry.turnIndex} className="border-b border-split last:border-0">
                        <td className="py-2 text-text-secondary">{entry.turnIndex}</td>
                        {entry.usage ? (
                          <>
                            <td className="py-2 text-right tabular-nums">{entry.usage.prompt_tokens.toLocaleString()}</td>
                            <td className="py-2 text-right tabular-nums">{entry.usage.completion_tokens.toLocaleString()}</td>
                            <td className="py-2 text-right tabular-nums font-medium">{entry.usage.total_tokens.toLocaleString()}</td>
                          </>
                        ) : (
                          <td colSpan={3} className="py-2 text-right text-text-secondary" title="Este proveedor no reporta tokens">
                            — — —
                          </td>
                        )}
                      </tr>
                    ))}
                    {hasAnyUsage && debugHistory.length > 1 && (
                      <tr className="border-t-2 border-split font-semibold">
                        <td className="py-2 text-text-secondary">Total</td>
                        <td className="py-2 text-right tabular-nums">{totalUsage.prompt_tokens.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums">{totalUsage.completion_tokens.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums">{totalUsage.total_tokens.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              {!hasAnyUsage && debugHistory.length > 0 && (
                <p className="text-xs text-text-secondary mt-3 text-center">
                  Este proveedor no reporta uso de tokens.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
