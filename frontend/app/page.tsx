"use client";

/**
 * Página principal — conecta todos los componentes de la aplicación.
 *
 * Estructura:
 *  - SessionProvider   → contexto global de sesión
 *  - Header            → barra superior fija
 *  - aside             → sidebar de historial (solo en desktop lg+)
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
import ConversationSidebar from "@/components/ConversationSidebar";
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
    isViewMode,
    error,
    startSession,
    closeSession,
    sendMessage,
    submitQuestionnaire,
    clearError,
  } = useSession();

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingSession, setClosingSession] = useState(false);

  const handleConfirmClose = async () => {
    setClosingSession(true);
    await closeSession();
    setClosingSession(false);
    setShowCloseModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />

      {/* Layout principal: sidebar + contenido */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar de historial — visible solo en pantallas lg+ */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-shrink-0 border-r border-split overflow-y-auto">
          <ConversationSidebar />
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col min-h-0 max-w-4xl w-full mx-auto px-4 py-4 gap-3 overflow-hidden">
          {/* Error global */}
          {error && (
            <Alert type="error" message={error} onClose={clearError} />
          )}

          {/* Barra de sesión (siempre visible) */}
          <SessionAccordion
            session={session}
            isLoading={isLoading}
            isViewMode={isViewMode}
            onNewSession={closeSession}
            onStart={startSession}
            onRequestClose={() => setShowCloseModal(true)}
          />

          {/* Banner de solo lectura */}
          {isViewMode && session && (
            <div className="text-xs text-center text-text-secondary bg-conv-bg rounded-lg px-4 py-2 border border-split">
              Sesión cerrada — modo solo lectura
              {session.closedAt && (
                <span>
                  {" "}·{" "}
                  {new Date(session.closedAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          )}

          {/* Área de conversación — ocupa el espacio restante */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <ChatArea messages={messages} isLoading={isLoading} />

            <InputBar
              onSend={sendMessage}
              onQuestionnaire={submitQuestionnaire}
              isLoading={isLoading}
              disabled={!session || isViewMode}
            />
          </div>
        </main>
      </div>

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
