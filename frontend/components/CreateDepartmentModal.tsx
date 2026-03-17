"use client";

import { useState } from "react";
import { createDepartment } from "@/services/api";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@/components/ui/Button";

interface CreateDepartmentModalProps {
  onClose: () => void;
  onCreated: (id: string, name: string) => void;
}

/**
 * Modal inline para crear un nuevo departamento de Moeve.
 * Al guardar, llama a POST /departments con el contenido del formulario.
 */
export default function CreateDepartmentModal({
  onClose,
  onCreated,
}: CreateDepartmentModalProps) {
  const [name, setName] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre del departamento es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await createDepartment({ name: name.trim(), descripcion: descripcion.trim() });
      onCreated(result.id, result.name);
    } catch {
      setError(
        "No se pudo guardar el departamento. Verifica que NEXT_PUBLIC_ADMIN_TOKEN está configurado."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-split">
          <h2 className="text-base font-medium text-primary-dark">
            Nuevo departamento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="dept-name">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="dept-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Operaciones, Mantenimiento, IT…"
              className="w-full rounded-lg border border-split px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-btn"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="dept-descripcion">
              Descripción
            </label>
            <textarea
              id="dept-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el departamento: qué hace, cómo trabaja, qué herramientas usa, cuáles son sus principales preocupaciones..."
              rows={5}
              className="w-full rounded-lg border border-split px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary-btn"
            />
            <p className="text-xs text-text-secondary">
              Esta descripción se incluirá en el prompt del usuario sintético para contextualizar su perspectiva departamental.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} disabled={!name.trim()}>
              Crear departamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
