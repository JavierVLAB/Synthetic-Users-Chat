"use client";

import { useState } from "react";

interface AnswerActionsProps {
  content: string;
}

export default function AnswerActions({ content }: AnswerActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={handleCopy}
        className="text-xs text-text-secondary hover:text-primary-dark transition-colors px-2 py-1 rounded hover:bg-conv-bg"
        title="Copiar respuesta"
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}
