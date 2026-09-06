"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { sounds } from "../lib/sounds";
import "./PillButton.css";

type PillButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "warning";

type PillButtonSize = "sm" | "md" | "lg";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: string;
  variant?: PillButtonVariant;
  size?: PillButtonSize;
}

const variantColors: Record<PillButtonVariant, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",
  danger: "var(--color-danger)",
  warning: "var(--color-warning)",
};

export function PillButton({
  children,
  color,
  variant = "primary",
  size = "md",
  style,
  className,
  ...props
}: PillButtonProps) {
  const resolvedColor = color ?? variantColors[variant];

  return (
    <button
      className={`pill-button pill-button--${size}${className ? ` ${className}` : ""}`}
      style={{ ...style, "--pill-color": resolvedColor } as React.CSSProperties}
      onMouseEnter={() => sounds.buttonHover()}
      {...props}
    >
      <div>
        <div>
          <div>{children}</div>
        </div>
      </div>
    </button>
  );
}
