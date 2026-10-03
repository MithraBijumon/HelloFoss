"use client";

import { useAuth } from "@/lib/auth-context";
import { buttonBaseClasses, buttonVariantClasses, buttonSizeClasses, type ButtonSize } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function SignInButton({
  size = "md",
  fullWidth = false,
  className,
}: {
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const { openAuthModal } = useAuth();

  return (
    <button
      type="button"
      onClick={() => openAuthModal({ mode: "signin" })}
      className={cn(
        buttonBaseClasses,
        buttonVariantClasses.primary,
        buttonSizeClasses[size],
        fullWidth && "w-full",
        className
      )}
    >
      Sign In
    </button>
  );
}
