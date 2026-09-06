"use client";

import { useEffect, useState } from "react";

const COLORS = ["#f4d1b5", "#f2a3c7", "#ce7d6c", "#a45d7c", "#8d4c9f", "#5c3a8e"];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  drift: number;
}

export function Confetti({ duration = 4000 }: { duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.floor((i / 50) * 100) + Math.floor(Math.sin(i * 2.5) * 8),
      color: COLORS[i % COLORS.length],
      delay: (i % 8) * 0.12,
      size: 6 + (i % 5) * 2,
      drift: ((i % 3) - 1) * 30,
    }));
    setParticles(items);

    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall 3s ease-in ${p.delay}s both`,
            transform: `translateX(${p.drift}px)`,
          }}
        />
      ))}
    </div>
  );
}
