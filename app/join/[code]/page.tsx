"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "../../components/PlayerContext";
import { useLanguage } from "../../components/LanguageContext";
import { NicknamePrompt } from "../../components/NicknamePrompt";
import { disconnectSocket } from "../../lib/socket";

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const { deviceToken, nickname, isReady, identify } = usePlayer();
  const [error, setError] = useState("");
  const [needsNickname, setNeedsNickname] = useState(false);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!isReady) return;
    if (!nickname) {
      setNeedsNickname(true);
      return;
    }
    if (!deviceToken) return;
    if (joinedRef.current) return;
    joinedRef.current = true;

    disconnectSocket();

    async function doJoin() {
      try {
        await identify();
        router.replace(`/room/${code}`);
      } catch {
        setError("Failed to join room");
      }
    }

    doJoin();
  }, [deviceToken, nickname, code, isReady, identify, router]);

  if (!isReady) return null;

  if (needsNickname) {
    return (
      <NicknamePrompt
        onDone={() => {
          setNeedsNickname(false);
        }}
      />
    );
  }

  return (
    <main className="flex items-center justify-center flex-1 p-8 min-h-screen">
      <div className="text-center space-y-4">
        {!error && (
          <>
            <p className="text-lg font-bold">{t.joinRoom}...</p>
            <p className="text-4xl font-bold tracking-widest">{code}</p>
            <p className="text-sm opacity-50 animate-pulse">{t.waiting}</p>
          </>
        )}

        {error && (
          <div className="space-y-2">
            <p className="text-lg font-bold text-[var(--color-danger)]">
              {error}
            </p>
            <p className="text-sm opacity-50">{code}</p>
          </div>
        )}
      </div>
    </main>
  );
}
