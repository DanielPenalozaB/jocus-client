"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import * as adventurer from "@dicebear/adventurer";

export type AvatarStyle = "adventurer";

interface AvatarProps {
  seed: string;
  style?: AvatarStyle;
  size?: number;
  className?: string;
}

function generateAvatarDataUri(seed: string, size: number): string {
  const avatar = createAvatar(adventurer, { seed, size });
  return avatar.toDataUri();
}

export function Avatar({ seed, size = 48, className }: AvatarProps) {
  const dataUri = useMemo(() => generateAvatarDataUri(seed, size), [seed, size]);

  return (
    <img
      src={dataUri}
      alt="avatar"
      width={size}
      height={size}
      className={`rounded-full ${className || ""}`}
    />
  );
}

export function generateSeeds(base: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${base}-${i}`);
}

export const AVATAR_STYLES: AvatarStyle[] = ["adventurer"];
