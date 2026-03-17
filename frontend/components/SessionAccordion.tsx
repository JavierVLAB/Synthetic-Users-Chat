"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import ProfileSelect from "./ProfileSelect";
import BriefSelect from "./BriefSelect";
import DepartmentSelect from "./DepartmentSelect";
import { ActiveSession } from "@/context/SessionContext";
import { PromptSections } from "@/services/api";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import BugReportIcon from "@mui/icons-material/BugReport";

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
  // Prompt overrides (only relevant when session is active)
  textOverrides?: Partial<PromptSections>;
  originalSections?: PromptSections | null;
  onOverrideChange?: (section: keyof PromptSections, text: string) => void;
  onOverrideReset?: (section: keyof PromptSections) => void;
  // Debug panel toggle
  debugOpen?: boolean;
  onDebugToggle?: () => void;
}

export default function SessionAccordion({
  session,
  isLoading,
  isViewMode,
  onNewSession,
  onStart,
  onRequestClose,
  textOverrides = {},
  originalSections,
  onOverrideChange,
  onOverrideReset,
  debugOpen,
  onDebugToggle,
}: SessionAccordionProps) {
  const [open, setOpen] = useState(true);
  const [profileId, setProfileId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [briefId, setBriefId] = useState("");
  const [briefName, setBriefName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);

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

  // Cerrar el panel de prompt cuando cambia la sesión
  useEffect(() => {
    setPromptOpen(false);
  }, [session?.sessionId]);

  const canStart = Boolean(profileId && briefId && !isLoading);
  const hasOverrides = Object.keys(textOverrides).length > 0;

  /* ── Sesión activa o en modo lectura: barra siempre visible ── */
  if (session) {
    return (
      <div className="rounded-xl border border-split bg-white overflow-hidden">
        {/* Barra principal */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
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
          <div className="flex items-center gap-2">
            {!isViewMode && onDebugToggle && (
              <button
                type="button"
                onClick={onDebugToggle}
                className={[
                  "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors",
                  debugOpen
                    ? "border-primary-btn bg-primary-btn/10 text-primary-dark"
                    : "border-split text-text-secondary hover:text-primary-dark hover:border-primary-btn",
                ].join(" ")}
                title="Panel de debug"
              >
                <BugReportIcon style={{ fontSize: "14px" }} />
                Debug
              </button>
            )}
            {!isViewMode && originalSections && (
              <button
                type="button"
                onClick={() => setPromptOpen((v) => !v)}
                className={[
                  "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors",
                  promptOpen
                    ? "border-primary-btn bg-primary-btn/10 text-primary-dark"
                    : "border-split text-text-secondary hover:text-primary-dark hover:border-primary-btn",
                ].join(" ")}
                title="Ajustar texto del prompt"
              >
                <TuneIcon style={{ fontSize: "14px" }} />
                Ajustar prompt
                {hasOverrides && (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            )}
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
        </div>

        {/* Panel de ajuste de prompt (colapsable, altura máxima con scroll) */}
        {!isViewMode && originalSections && promptOpen && (
          <div className="border-t border-split bg-gray-50/50">
            <div className="max-h-[260px] overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <p className="text-xs text-text-secondary">
                Edita el texto inyectado en el siguiente mensaje. Los archivos fuente no se modifican.
              </p>
              <SectionEditor
                label="Perfil de comportamiento"
                original={originalSections.profile_text}
                current={textOverrides.profile_text ?? originalSections.profile_text}
                isOverridden={"profile_text" in textOverrides}
                onChange={(text) => onOverrideChange?.("profile_text", text)}
                onReset={() => onOverrideReset?.("profile_text")}
              />
              <SectionEditor
                label="Brief de producto"
                original={originalSections.brief_text}
                current={textOverrides.brief_text ?? originalSections.brief_text}
                isOverridden={"brief_text" in textOverrides}
                onChange={(text) => onOverrideChange?.("brief_text", text)}
                onReset={() => onOverrideReset?.("brief_text")}
              />
              {originalSections.department_text && (
                <SectionEditor
                  label="Departamento"
                  original={originalSections.department_text}
                  current={textOverrides.department_text ?? originalSections.department_text}
                  isOverridden={"department_text" in textOverrides}
                  onChange={(text) => onOverrideChange?.("department_text", text)}
                  onReset={() => onOverrideReset?.("department_text")}
                />
              )}
            </div>
          </div>
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

/* ── Editor de sección ── */

interface SectionEditorProps {
  label: string;
  original: string;
  current: string;
  isOverridden: boolean;
  onChange: (text: string) => void;
  onReset: () => void;
}

function SectionEditor({ label, original, current, isOverridden, onChange, onReset }: SectionEditorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          {isOverridden && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
              Editado
            </span>
          )}
        </div>
        {isOverridden && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-text-secondary hover:text-primary-dark transition-colors"
          >
            Restaurar original
          </button>
        )}
      </div>
      <textarea
        value={current}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full text-xs font-mono text-text-primary bg-white border border-split rounded-lg p-2 resize-y focus:outline-none focus:ring-1 focus:ring-primary-btn"
      />
      {isOverridden && (
        <details className="text-[10px] text-text-secondary">
          <summary className="cursor-pointer hover:text-text-primary">Ver texto original</summary>
          <pre className="mt-1 bg-gray-100 rounded p-2 whitespace-pre-wrap font-mono overflow-auto max-h-32">{original}</pre>
        </details>
      )}
    </div>
  );
}
