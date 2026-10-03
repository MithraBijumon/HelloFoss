"use client";

import { useAuth } from "@/lib/auth-context";
import {
  buttonBaseClasses,
  buttonVariantClasses,
  buttonSizeClasses,
  type ButtonVariant,
  type ButtonSize,
} from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function RegisterMenu({
  variant = "primary",
  size = "md",
  className,
  label = "Register Now",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  label?: string;
  fullWidth?: boolean;
}) {
  const { openAuthModal } = useAuth();

  return (
    <button
      type="button"
      onClick={() => openAuthModal({ mode: "register" })}
      className={cn(
        buttonBaseClasses,
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        fullWidth && "w-full",
        className
      )}
    >
      {label}
    </button>
  );
}
