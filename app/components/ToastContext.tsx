"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastVariant = "error" | "warning" | "success" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const VARIANT_STYLES: Record<ToastVariant, string> = {
  error: "bg-[var(--color-danger)] text-white",
  warning: "bg-[var(--color-warning)] text-white",
  success: "bg-[var(--color-primary)] text-white",
  info: "bg-[var(--color-secondary)] text-white",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  error: "✕",
  warning: "⚠",
  success: "✓",
  info: "ℹ",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "error") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-[100] flex flex-col items-center gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 max-w-sm w-full animate-fade-in-up ${VARIANT_STYLES[toast.variant]}`}
            >
              <span className="text-sm font-bold opacity-80">{VARIANT_ICONS[toast.variant]}</span>
              <p className="text-sm font-medium flex-1">{toast.message}</p>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
