"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { fetchProfiles, ProfileSummary } from "@/services/api";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BoltIcon from "@mui/icons-material/Bolt";
import SpeedIcon from "@mui/icons-material/Speed";
import ExploreIcon from "@mui/icons-material/Explore";
import HelpModal from "./HelpModal";

const profiles = [
  {
    icon: <EngineeringIcon fontSize="small" className="text-primary-dark" />,
    name: "Especialista Técnico",
    role: "El experto técnico",
    description: "Resuelve dudas complejas de forma rápida y directa.",
  },
  {
    icon: <BoltIcon fontSize="small" className="text-primary-dark" />,
    name: "Power User",
    role: "El colaborador constante",
    description: "Utiliza la IA como un asistente de largo aliento para proyectos extensos.",
  },
  {
    icon: <SpeedIcon fontSize="small" className="text-primary-dark" />,
    name: "Operativo Rápido",
    role: "El buscador de datos",
    description: "Obtiene respuestas rápidas a tareas simples para no interrumpir el flujo.",
  },
  {
    icon: <ExploreIcon fontSize="small" className="text-primary-dark" />,
    name: "Explorador",
    role: "El usuario ocasional/nuevo",
    description: "Realiza consultas estándar, saludos o pruebas iniciales del sistema.",
  },
];

const PROFILE_HELP_CONTENT = (
  <div className="flex flex-col gap-3">
    <p className="text-sm text-text-secondary leading-relaxed">
      Selecciona el tipo de usuario sintético que participará en la conversación. Cada perfil simula un patrón de uso diferente.
    </p>
    <div className="flex flex-col gap-2">
      {profiles.map((p) => (
        <div
          key={p.name}
          className="flex items-start gap-3 px-1 py-2"
        >
          <div className="flex-shrink-0 mt-0.5">{p.icon}</div>
          <div>
            <p className="text-sm font-medium text-text-primary">{p.name}</p>
            <p className="text-xs text-text-secondary">{p.role} — {p.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
  const [profileOptions, setProfileOptions] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchProfiles()
      .then(setProfileOptions)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (selectedId: string) => {
    const profile = profileOptions.find((p) => p.id === selectedId);
    onChange(selectedId, profile?.name ?? selectedId);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary">
        Perfil de comportamiento
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          aria-label="Más información sobre Perfil de comportamiento"
          className="inline-flex items-center text-text-secondary hover:text-primary-dark transition-colors"
        >
          <HelpOutlineIcon fontSize="inherit" />
        </button>
      </label>
      <Select
        label="Perfil de comportamiento"
        placeholder={loading ? "Cargando perfiles…" : "Selecciona un perfil"}
        options={profileOptions.map((p) => ({ value: p.id, label: p.name }))}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled || loading}
      />
      {showHelp && (
        <HelpModal
          title="Perfiles de comportamiento"
          content={PROFILE_HELP_CONTENT}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}
