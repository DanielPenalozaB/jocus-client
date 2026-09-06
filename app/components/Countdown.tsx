"use client";

import { useState, useEffect } from "react";
import { sounds } from "../lib/sounds";

interface CountdownProps {
  from?: number;
  onComplete: () => void;
}

export function Countdown({ from = 3, onComplete }: CountdownProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count === 0) {
      sounds.countdownGo();
      onComplete();
      return;
    }
    sounds.countdownTick();
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div key={count} className="animate-countdown-pop">
        {count > 0 ? (
          <span className="text-8xl font-black text-white drop-shadow-lg">
            {count}
          </span>
        ) : (
          <span className="text-6xl font-black text-[var(--color-accent)] drop-shadow-lg">
            GO!
          </span>
        )}
      </div>
    </div>
  );
}
