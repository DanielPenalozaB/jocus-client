"use client";

import { PillButton } from "../components/PillButton";

export default function OfflinePage() {
  return (
    <main className="flex items-center justify-center flex-1 p-8 min-h-screen">
      <div className="text-center space-y-5 animate-scale-in max-w-sm">
        <p className="text-5xl">📡</p>
        <h1 className="text-2xl font-black">Sin conexion</h1>
        <p className="text-sm opacity-60">
          Jocus necesita conexion a internet para funcionar. Revisa tu conexion e intenta de nuevo.
        </p>
        <PillButton onClick={() => window.location.reload()}>
          Reintentar
        </PillButton>
      </div>
    </main>
  );
}
