/**
 * AnimatedLoader — tres puntos que pulsan mientras el LLM genera la respuesta.
 */
export default function AnimatedLoader() {
  return (
    <div className="flex items-center gap-1 px-4 py-3" aria-label="Generando respuesta…" role="status">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-primary-dark opacity-60"
          style={{
            animation: "dot-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
