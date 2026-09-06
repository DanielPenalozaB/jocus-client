"use client";

import { useEffect, useState } from "react";
import { PillButton } from "./PillButton";

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setUpdateAvailable(true);
          }
        });
      });
    }).catch(() => {});
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-fade-in-up">
      <div className="bg-[var(--color-deep)] border border-foreground/20 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-lg max-w-sm w-full">
        <p className="text-sm flex-1">Nueva version disponible</p>
        <PillButton size="sm" onClick={() => window.location.reload()}>
          Actualizar
        </PillButton>
      </div>
    </div>
  );
}
