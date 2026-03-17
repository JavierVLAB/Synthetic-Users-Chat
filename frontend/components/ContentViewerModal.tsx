"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@/components/ui/Button";
import { updateProfile, updateBrief, updateDepartment } from "@/services/api";
import yaml from "js-yaml";

type ItemType = "profile" | "brief" | "department";

interface ContentViewerModalProps {
  title: string;
  itemId: string;
  itemType: ItemType;
  content: Record<string, unknown>;
  editable: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * Modal genérico para ver y editar el contenido de un perfil, brief o departamento.
 *
 * Modo lectura: muestra cada campo del objeto como sección con label + valor.
 * Modo edición (si editable=true): textarea con YAML raw, guardar via PUT /.../{id}.
 */
export default function ContentViewerModal({
  title,
  itemId,
  itemType,
  content,
  editable,
  onClose,
  onSaved,
}: ContentViewerModalProps) {
  const [editing, setEditing] = useState(false);
  const [rawYaml, setRawYaml] = useState(() => {
    try {
      return yaml.dump(content, { indent: 2, lineWidth: 80 });
    } catch {
      return JSON.stringify(content, null, 2);
    }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let parsed: Record<string, unknown>;
      try {
        parsed = yaml.load(rawYaml) as Record<string, unknown>;
      } catch {
        setError("El YAML no es válido. Revisa la sintaxis.");
        return;
      }

      if (itemType === "profile") await updateProfile(itemId, parsed);
      else if (itemType === "brief") await updateBrief(itemId, parsed);
      else await updateDepartment(itemId, parsed);

      setSaved(true);
      setEditing(false);
      onSaved?.();
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al guardar. Verifica el token de administración.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  /** Renderiza el contenido como secciones legibles */
  const renderContent = () => {
    const entries = Object.entries(content);
    if (entries.length === 0) {
      return <p className="text-sm text-text-secondary italic">Sin contenido.</p>;
    }

    return (
      <div className="flex flex-col gap-4">
        {entries.map(([key, value]) => {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);

          return (
            <div key={key}>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
                {label}
              </p>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                {text}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-split flex-shrink-0">
          <div>
            <h2 className="text-base font-medium text-primary-dark">{title}</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {editing ? "Modo edición — YAML" : "Contenido del prompt"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editable && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary-dark transition-colors px-2 py-1 rounded-lg hover:bg-conv-bg"
              >
                <EditIcon style={{ fontSize: "14px" }} />
                Editar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Cerrar"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {saved && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
              Guardado correctamente.
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          {editing ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-text-secondary">
                Edita el YAML directamente. Mantén la estructura de campos existente.
              </p>
              <textarea
                value={rawYaml}
                onChange={(e) => setRawYaml(e.target.value)}
                rows={20}
                className="w-full rounded-lg border border-split px-3 py-2 text-sm font-mono text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary-btn"
                spellCheck={false}
              />
            </div>
          ) : (
            renderContent()
          )}
        </div>

        {/* Footer — solo visible en modo edición */}
        {editing && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-split flex-shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => { setEditing(false); setError(null); }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSave}
            >
              Guardar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
