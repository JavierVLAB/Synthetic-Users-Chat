"use client";

/**
 * QuestionnaireUpload — sube un archivo .txt con preguntas.
 *
 * Lee el contenido del archivo, separa las preguntas por líneas no vacías
 * y llama a onSubmit con el array resultante.
 */

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import AttachFileIcon from "@mui/icons-material/AttachFile";

interface QuestionnaireUploadProps {
  onSubmit: (questions: string[]) => Promise<void>;
  disabled?: boolean;
}

export default function QuestionnaireUpload({
  onSubmit,
  disabled,
}: QuestionnaireUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.name.endsWith(".txt")) {
      setError("Solo se admiten archivos .txt");
      return;
    }

    const text = await file.text();
    const questions = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (questions.length === 0) {
      setError("El archivo no contiene preguntas válidas.");
      return;
    }

    setFileName(file.name);
    await onSubmit(questions);

    // Reset input para permitir subir el mismo archivo de nuevo
    e.target.value = "";
    setFileName(null);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Subir cuestionario .txt"
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        title="Subir cuestionario (.txt)"
      >
        <AttachFileIcon fontSize="small" />
      </Button>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
