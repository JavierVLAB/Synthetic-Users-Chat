"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "moeve-auth-token";
const COOKIE_NAME = "auth-token";

function setAuthCookie(token: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${COOKIE_NAME}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, { password });
      const token: string = data.access_token;

      localStorage.setItem(TOKEN_KEY, token);
      setAuthCookie(token);
      router.push("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Password incorrecto");
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafe]">
      {/* Header */}
      <header className="h-16 bg-white border-b border-[#9bcbe3] flex items-center px-6">
        <Image
          src="/logo.png"
          alt="Moeve"
          width={98}
          height={18}
          priority
          className="object-contain"
        />
        <span className="ml-6 text-[#047dba] text-xl font-light font-sans whitespace-nowrap">
          Syntropic
        </span>
      </header>

      {/* Contenido centrado */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-[#004656] text-2xl font-light font-sans mb-8 text-center">
            Acceder
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-[#004656] text-sm font-sans"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce el password de acceso"
                className="w-full px-4 py-3 rounded-lg bg-[#f2f6f7] border-0 outline-none text-[#004656] text-base font-light font-sans placeholder-[#6b7280] focus:ring-2 focus:ring-[#047dba]"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-[#d52b1e] text-sm font-sans">{error}</p>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 rounded-lg bg-[#90ffbb] text-[#004656] font-sans font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95 transition-all"
            >
              {loading ? "Verificando..." : "Acceder"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-[65px] border-t border-[#9bcbe3] bg-white flex items-center justify-between px-6">
        <span className="text-[#004656] text-sm font-light font-sans">
          Syntropic
        </span>
        <span className="text-[#004656] text-sm font-sans">© Moeve 2026</span>
      </footer>
    </div>
  );
}
