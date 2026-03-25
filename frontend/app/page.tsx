"use client";

/**
 * Página principal — conecta todos los componentes de la aplicación.
 *
 * Estructura:
 *  - SessionProvider   → contexto global de sesión
 *  - Header            → barra superior fija
 *  - SessionAccordion  → configurar / ver sesión activa
 *  - ChatArea          → historial de mensajes (solo con sesión activa)
 *  - InputBar          → entrada de mensajes
 *  - Footer            → barra inferior fija
 *  - CloseSessionModal → modal de confirmación (condicional)
 */

import { useState } from "react";
import { SessionProvider } from "@/context/SessionContext";
import { useSession } from "@/hooks/useSession";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionAccordion from "@/components/SessionAccordion";
import ChatArea from "@/components/ChatArea";
import InputBar from "@/components/InputBar";
import CloseSessionModal from "@/components/CloseSessionModal";
import Alert from "@/components/ui/Alert";

/**
 * Contenido interior que consume el contexto de sesión.
 * Separado del Provider para poder usar useSession() dentro del Provider.
 */
function AppContent() {
  const {
    session,
    messages,
    isLoading,
    error,
    startSession,
    closeSession,
    sendMessage,
    submitQuestionnaire,
    clearError,
  } = useSession();

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingSession, setClosingSession] = useState(false);
  // Texto del input bar — compartido con las píldoras de sugerencias
  const [inputText, setInputText] = useState("");

  /** Preguntas sugeridas que el investigador puede insertar con un click */
  const SUGGESTED_QUESTIONS = [
    "¿Qué te parece la interfaz?",
    "¿Qué barreras encuentras al producto?",
    "¿Qué le cambiarías?",
  ];

  const handleConfirmClose = async () => {
    setClosingSession(true);
    await closeSession();
    setClosingSession(false);
    setShowCloseModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col min-h-0 max-w-4xl w-full mx-auto px-4 py-4 gap-3">
        {/* Error global */}
        {error && (
          <Alert type="error" message={error} onClose={clearError} />
        )}

        {/* Barra de sesión (siempre visible) */}
        <SessionAccordion
          session={session}
          isLoading={isLoading}
          onStart={startSession}
          onRequestClose={() => setShowCloseModal(true)}
        />

        {/* Píldoras de preguntas sugeridas — visibles solo con sesión activa */}
        {session && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setInputText(q)}
                className="px-4 py-1.5 rounded-full text-sm font-light text-accent bg-[#f0f5ff] border border-accent/30 hover:bg-[#ddeaff] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Área de conversación — ocupa el espacio restante */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <ChatArea messages={messages} isLoading={isLoading} />

          <InputBar
            onSend={sendMessage}
            onQuestionnaire={submitQuestionnaire}
            isLoading={isLoading}
            disabled={!session}
            value={inputText}
            onValueChange={setInputText}
          />
        </div>
      </main>

      <Footer />

      {/* Modal de cierre de sesión */}
      {showCloseModal && session && (
        <CloseSessionModal
          sessionId={session.sessionId}
          sessionName={session.profileName}
          onConfirm={handleConfirmClose}
          onCancel={() => setShowCloseModal(false)}
          isLoading={closingSession}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
