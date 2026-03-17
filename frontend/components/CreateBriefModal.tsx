"use client";

import { useState } from "react";
import { createBrief } from "@/services/api";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@/components/ui/Button";

interface CreateBriefModalProps {
  onClose: () => void;
  onCreated: (id: string, name: string) => void;
}

/**
 * Modal inline para crear un nuevo brief de producto.
 * Al guardar, llama a POST /briefs con el contenido del formulario.
 */
export default function CreateBriefModal({
  onClose,
  onCreated,
}: CreateBriefModalProps) {
  const [form, setForm] = useState({
    name: "",
    descripcion: "",
    problema: "",
    propuesta_de_valor: "",
    funcionalidades: "",
    contexto_de_uso: "",
    riesgos: "",
    datos_de_uso: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre del brief es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Filtrar campos vacíos para no enviar claves con valor ""
      const content = Object.fromEntries(
        Object.entries(form)
          .map(([k, v]) => [k, v.trim()])
          .filter(([, v]) => v !== "")
      );
      const result = await createBrief(content);
      onCreated(result.id, result.name);
    } catch {
      setError(
        "No se pudo guardar el brief. Verifica que NEXT_PUBLIC_ADMIN_TOKEN está configurado."
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-split flex-shrink-0">
          <h2 className="text-base font-medium text-primary-dark">
            Nuevo brief de producto
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

        {/* Formulario — scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Field
            id="brief-name"
            label="Nombre"
            required
            value={form.name}
            onChange={set("name")}
            type="input"
            placeholder="Ej. IngenIA, Portal Operaciones…"
          />

          <Field
            id="brief-descripcion"
            label="Descripción general"
            value={form.descripcion}
            onChange={set("descripcion")}
            type="textarea"
            placeholder="Qué es y para qué sirve el producto."
            rows={3}
          />

          <Field
            id="brief-problema"
            label="Problema que resuelve"
            value={form.problema}
            onChange={set("problema")}
            type="textarea"
            placeholder="Qué necesidad o dolor del usuario aborda."
            rows={3}
          />

          <Field
            id="brief-propuesta"
            label="Propuesta de valor"
            value={form.propuesta_de_valor}
            onChange={set("propuesta_de_valor")}
            type="textarea"
            placeholder="Por qué es diferente o mejor que la alternativa actual."
            rows={3}
          />

          <Field
            id="brief-funcionalidades"
            label="Funcionalidades principales"
            value={form.funcionalidades}
            onChange={set("funcionalidades")}
            type="textarea"
            placeholder="Qué puede hacer el usuario con el producto."
            rows={4}
          />

          <Field
            id="brief-contexto"
            label="Contexto de uso"
            value={form.contexto_de_uso}
            onChange={set("contexto_de_uso")}
            type="textarea"
            placeholder="Cuándo, cómo y desde qué dispositivo se usa."
            rows={3}
          />

          <Field
            id="brief-riesgos"
            label="Riesgos o limitaciones"
            value={form.riesgos}
            onChange={set("riesgos")}
            type="textarea"
            placeholder="Posibles fricciones, limitaciones técnicas o riesgos de adopción."
            rows={3}
          />

          <div className="border-t border-split pt-4">
            <Field
              id="brief-datos-uso"
              label="Datos reales de uso"
              value={form.datos_de_uso}
              onChange={set("datos_de_uso")}
              type="textarea"
              placeholder="Métricas reales que el usuario sintético podrá referenciar: tasas de adopción, frecuencia de uso, NPS, % de usuarios activos, tiempo medio de sesión, feedback cualitativo conocido... La IA usará estos datos en lugar de inventárselos."
              rows={5}
            />
            <p className="text-xs text-text-secondary mt-1">
              Si no tienes datos aún, déjalo vacío. El usuario sintético no inventará métricas cuando este campo esté en blanco.
            </p>
          </div>
        </form>

        {/* Footer con botones */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-split flex-shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="brief-form" variant="primary" size="sm" loading={saving} disabled={!form.name.trim()} onClick={handleSubmit}>
            Crear brief
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Campo de formulario reutilizable ──────────────────────────────────── */

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type: "input" | "textarea";
  placeholder?: string;
  rows?: number;
}

function Field({ id, label, required, value, onChange, type, placeholder, rows }: FieldProps) {
  const inputClass =
    "w-full rounded-lg border border-split px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-btn";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-secondary" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {type === "input" ? (
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
          required={required}
        />
      ) : (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows ?? 3}
          className={`${inputClass} resize-none`}
        />
      )}
    </div>
  );
}
