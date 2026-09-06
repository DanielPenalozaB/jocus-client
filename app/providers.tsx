"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "./components/LanguageContext";
import { PlayerProvider } from "./components/PlayerContext";
import { SoundProvider } from "./components/SoundContext";
import { ToastProvider } from "./components/ToastContext";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <PlayerProvider>
        <SoundProvider>
          <ToastProvider>
            <ServiceWorkerRegistration />
            {children}
          </ToastProvider>
        </SoundProvider>
      </PlayerProvider>
    </LanguageProvider>
  );
}
