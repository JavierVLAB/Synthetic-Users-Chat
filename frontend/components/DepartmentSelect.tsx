"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { fetchDepartments, fetchDepartment, DepartmentSummary } from "@/services/api";
import CreateDepartmentModal from "@/components/CreateDepartmentModal";
import ContentViewerModal from "@/components/ContentViewerModal";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface DepartmentSelectProps {
  value: string;
  onChange: (id: string, name: string) => void;
  disabled?: boolean;
}

/**
 * Selector de departamento de Moeve.
 *
 * La selección es opcional — el usuario puede dejar "Sin departamento".
 * Incluye:
 * - Botón "+" para crear un nuevo departamento inline.
 * - Icono ⓘ para ver (y editar si admin token) el contenido del departamento seleccionado.
 */
export default function DepartmentSelect({ value, onChange, disabled }: DepartmentSelectProps) {
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewerContent, setViewerContent] = useState<Record<string, unknown> | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const loadDepartments = () => {
    fetchDepartments()
      .then(setDepartments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleChange = (selectedId: string) => {
    if (selectedId === "") {
      onChange("", "");
      return;
    }
    const dept = departments.find((d) => d.id === selectedId);
    onChange(selectedId, dept?.name ?? selectedId);
  };

  const handleCreated = (id: string, name: string) => {
    setShowCreate(false);
    fetchDepartments().then((newDepts) => {
      setDepartments(newDepts);
      onChange(id, name);
    });
  };

  const handleViewContent = async () => {
    if (!value || loadingContent) return;
    setLoadingContent(true);
    try {
      const data = await fetchDepartment(value);
      setViewerContent(data.content);
    } finally {
      setLoadingContent(false);
    }
  };

  const selectedName = departments.find((d) => d.id === value)?.name ?? value;
  const editable = !!(process.env.NEXT_PUBLIC_ADMIN_TOKEN);

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary">
          Departamento
          <span className="text-xs text-text-secondary font-normal">(opcional)</span>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            disabled={disabled}
            aria-label="Crear nuevo departamento"
            title="Crear nuevo departamento"
            className="inline-flex items-center text-text-secondary hover:text-primary-dark transition-colors disabled:opacity-40"
          >
            <AddIcon style={{ fontSize: "16px" }} />
          </button>
          <button
            type="button"
            onClick={handleViewContent}
            disabled={!value || loadingContent || disabled}
            aria-label="Ver contenido del departamento seleccionado"
            title="Ver contenido del departamento"
            className="ml-auto inline-flex items-center text-text-secondary hover:text-primary-dark transition-colors disabled:opacity-40"
          >
            <InfoOutlinedIcon style={{ fontSize: "16px" }} />
          </button>
        </label>
        <Select
          label="Departamento"
          placeholder={loading ? "Cargando…" : "Sin departamento"}
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled || loading}
        />
      </div>

      {showCreate && (
        <CreateDepartmentModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      {viewerContent && (
        <ContentViewerModal
          title={selectedName}
          itemId={value}
          itemType="department"
          content={viewerContent}
          editable={editable}
          onClose={() => setViewerContent(null)}
        />
      )}
    </>
  );
}
