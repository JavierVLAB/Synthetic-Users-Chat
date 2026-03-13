"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { fetchBriefs, BriefSummary } from "@/services/api";

interface BriefSelectProps {
  value: string;
  onChange: (id: string, name: string) => void;
  disabled?: boolean;
}

export default function BriefSelect({
  value,
  onChange,
  disabled,
}: BriefSelectProps) {
  const [briefs, setBriefs] = useState<BriefSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefs()
      .then(setBriefs)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (selectedId: string) => {
    const brief = briefs.find((b) => b.id === selectedId);
    onChange(selectedId, brief?.name ?? selectedId);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-secondary">
        Brief de producto
      </label>
      <Select
        label="Brief de producto"
        placeholder={loading ? "Cargando briefs…" : "Selecciona un brief"}
        options={briefs.map((b) => ({ value: b.id, label: b.name }))}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled || loading}
      />
    </div>
  );
}
