"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PillButton } from "../components/PillButton";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useLanguage, type Language } from "../components/LanguageContext";
import { usePlayer } from "../components/PlayerContext";
import { api } from "../lib/api";

export default function CreateRoom() {
  const { t, languageNames, language } = useLanguage();
  const { player, deviceToken, nickname, identify } = usePlayer();
  const router = useRouter();

  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [roomLanguage, setRoomLanguage] = useState<Language>(language);
  const [hostMode, setHostMode] = useState<"host_and_play" | "host_only">(
    "host_and_play"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");

    try {
      if (!player) {
        await identify();
      }

      const { code } = await api.createRoom({
        host_id: deviceToken,
        nickname,
        password: requirePassword ? password : undefined,
        language: roomLanguage,
        host_mode: hostMode,
      });

      router.push(`/room/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="flex justify-end items-center p-4">
        <LanguageSwitcher />
      </header>
      <main className="flex items-center justify-center flex-1 p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center">{t.roomSettings}</h1>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-3">
              <span className="font-medium">{t.requirePassword}</span>
              <input
                type="checkbox"
                checked={requirePassword}
                onChange={(e) => setRequirePassword(e.target.checked)}
                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
              />
            </label>

            {requirePassword && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full bg-transparent border-2 border-foreground/20 rounded-lg px-4 py-2 text-foreground placeholder:text-foreground/40 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              />
            )}

            <label className="flex items-center justify-between gap-3">
              <span className="font-medium">{t.roomLanguage}</span>
              <select
                value={roomLanguage}
                onChange={(e) => setRoomLanguage(e.target.value as Language)}
                className="bg-background text-foreground border border-foreground/20 rounded-lg px-3 py-2 cursor-pointer"
              >
                {(Object.entries(languageNames) as [Language, string][]).map(
                  ([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  )
                )}
              </select>
            </label>

            <div className="space-y-2">
              <span className="font-medium">{t.hostMode}</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setHostMode("host_and_play")}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    hostMode === "host_and_play"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-foreground/20"
                  }`}
                >
                  {t.hostAndPlay}
                </button>
                <button
                  type="button"
                  onClick={() => setHostMode("host_only")}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                    hostMode === "host_only"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-foreground/20"
                  }`}
                >
                  {t.hostOnly}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Link href="/">
              <PillButton variant="secondary" size="lg">
                {t.back}
              </PillButton>
            </Link>
            <PillButton size="lg" onClick={handleCreate} disabled={loading}>
              {loading ? "..." : t.create}
            </PillButton>
          </div>
        </div>
      </main>
    </>
  );
}
