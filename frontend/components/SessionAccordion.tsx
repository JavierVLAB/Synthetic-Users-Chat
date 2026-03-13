"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ProfileSelect from "./ProfileSelect";
import BriefSelect from "./BriefSelect";
import { ActiveSession } from "@/context/SessionContext";

interface SessionAccordionProps {
  session: ActiveSession | null;
  isLoading: boolean;
  onStart: (
    profileId: string,
    profileName: string,
    briefId: string,
    briefName: string
  ) => Promise<void>;
  onRequestClose: () => void;
}

export default function SessionAccordion({
  session,
  isLoading,
  onStart,
  onRequestClose,
}: SessionAccordionProps) {
  const [open, setOpen] = useState(true);
  const [profileId, setProfileId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [briefId, setBriefId] = useState("");
  const [briefName, setBriefName] = useState("");

  const handleStart = async () => {
    if (!profileId || !briefId) return;
    await onStart(profileId, profileName, briefId, briefName);
  };

  const canStart = Boolean(profileId && briefId && !isLoading);

  /* ── Sesión activa: barra siempre visible, sin colapso ── */
  if (session) {
    return (
      <div className="rounded-xl border border-split bg-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs bg-primary-btn text-primary-dark px-2 py-0.5 rounded-full font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
            Sesión activa
          </span>
          <span className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Perfil:</span>{" "}
            {session.profileName}
          </span>
          <span className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Brief:</span>{" "}
            {session.briefName}
          </span>
        </div>
        <Button variant="danger" size="sm" onClick={onRequestClose}>
          Cerrar sesión
        </Button>
      </div>
    );
  }

  /* ── Sin sesión: acordeón colapsable para configurar ── */
  return (
    <div className="rounded-xl border border-split bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-conv-bg transition-colors"
        aria-expanded={open}
      >
        <span className="text-base font-medium text-primary-dark">
          Configurar sesión
        </span>
        <span className="text-text-secondary text-sm select-none">
          {open ? "▲" : "▼"}
        </span>
      </button>

      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="px-5 py-3 border-t border-split flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <ProfileSelect
              value={profileId}
              onChange={(id, name) => {
                setProfileId(id);
                setProfileName(name);
              }}
              disabled={isLoading}
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <BriefSelect
              value={briefId}
              onChange={(id, name) => {
                setBriefId(id);
                setBriefName(name);
              }}
              disabled={isLoading}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={isLoading}
            disabled={!canStart}
            onClick={handleStart}
          >
            Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
