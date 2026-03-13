"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { fetchProfiles, ProfileSummary } from "@/services/api";

interface ProfileSelectProps {
  value: string;
  onChange: (id: string, name: string) => void;
  disabled?: boolean;
}

export default function ProfileSelect({
  value,
  onChange,
  disabled,
}: ProfileSelectProps) {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles()
      .then(setProfiles)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (selectedId: string) => {
    const profile = profiles.find((p) => p.id === selectedId);
    onChange(selectedId, profile?.name ?? selectedId);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-secondary">
        Perfil de comportamiento
      </label>
      <Select
        label="Perfil de comportamiento"
        placeholder={loading ? "Cargando perfiles…" : "Selecciona un perfil"}
        options={profiles.map((p) => ({ value: p.id, label: p.name }))}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled || loading}
      />
    </div>
  );
}
