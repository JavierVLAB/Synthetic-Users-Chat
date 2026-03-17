"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ProfileSelect from "./ProfileSelect";
import BriefSelect from "./BriefSelect";
import DepartmentSelect from "./DepartmentSelect";
import { ActiveSession } from "@/context/SessionContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

interface SessionAccordionProps {
  session: ActiveSession | null;
  isLoading: boolean;
  isViewMode: boolean;
  onNewSession: () => void;
  onStart: (
    profileId: string,
    profileName: string,
    briefId: string,
    briefName: string,
    departmentId?: string,
    departmentName?: string,
  ) => Promise<void>;
  onRequestClose: () => void;
}

export default function SessionAccordion({
  session,
  isLoading,
  isViewMode,
  onNewSession,
  onStart,
  onRequestClose,
}: SessionAccordionProps) {
  const [open, setOpen] = useState(true);
  const [profileId, setProfileId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [briefId, setBriefId] = useState("");
  const [briefName, setBriefName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  const handleStart = async () => {
    if (!profileId || !briefId) return;
    await onStart(
      profileId,
      profileName,
      briefId,
      briefName,
      departmentId || undefined,
      departmentName || undefined,
    );
  };

  const canStart = Boolean(profileId && briefId && !isLoading);

  /* ── Sesión activa o en modo lectura: barra siempre visible ── */
  if (session) {
    return (
      <div className="rounded-xl border border-split bg-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={[
              "inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium",
              isViewMode
                ? "bg-gray-100 text-gray-600"
                : "bg-primary-btn text-primary-dark",
            ].join(" ")}
          >
            {isViewMode ? (
              <>
                <VisibilityIcon style={{ fontSize: "10px" }} />
                Solo lectura
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                Sesión activa
              </>
            )}
          </span>
          <span className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Perfil:</span>{" "}
            {session.profileName}
          </span>
          <span className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Brief:</span>{" "}
            {session.briefName}
          </span>
          {session.departmentName && (
            <span className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Depto:</span>{" "}
              {session.departmentName}
            </span>
          )}
        </div>
        {isViewMode ? (
          <Button variant="secondary" size="sm" onClick={onNewSession}>
            <AddIcon fontSize="small" /> Nueva sesión
          </Button>
        ) : (
          <Button variant="danger" size="sm" onClick={onRequestClose}>
            <StopIcon fontSize="small" /> Cerrar sesión
          </Button>
        )}
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
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
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
          <div className="flex-1 min-w-[180px]">
            <DepartmentSelect
              value={departmentId}
              onChange={(id, name) => {
                setDepartmentId(id);
                setDepartmentName(name);
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
            <PlayArrowIcon fontSize="small" /> Iniciar chat
          </Button>
        </div>
      </div>
    </div>
  );
}
