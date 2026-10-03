"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { buttonBaseClasses, buttonVariantClasses, buttonSizeClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MAX_PROJECTS = 2;

export function RegisterButton({
  projectSlug,
  className,
}: {
  projectSlug: string;
  className?: string;
}) {
  const { user, registrations, registrationsLoading, registerForProject, unregisterFromProject, openAuthModal } =
    useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegistered = registrations.includes(projectSlug);
  const limitReached = !isRegistered && registrations.length >= MAX_PROJECTS;

  async function runRegister() {
    setPending(true);
    const result = await registerForProject(projectSlug);
    setPending(false);
    if (!result.ok) setError(result.error ?? "Something went wrong.");
  }

  function handleRegisterClick() {
    setError(null);
    if (!user) {
      openAuthModal({ onSuccess: runRegister });
      return;
    }
    runRegister();
  }

  async function handleWithdrawClick() {
    setError(null);
    setPending(true);
    const result = await unregisterFromProject(projectSlug);
    setPending(false);
    if (!result.ok) setError(result.error ?? "Something went wrong.");
  }

  if (isRegistered) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleWithdrawClick}
          disabled={pending}
          className={cn(buttonBaseClasses, buttonVariantClasses.secondary, buttonSizeClasses.md, "w-full")}
        >
          <Check className="h-4 w-4 text-accent" aria-hidden="true" />
          {pending ? "Withdrawing…" : "Registered — withdraw"}
        </button>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleRegisterClick}
        disabled={pending || registrationsLoading || limitReached}
        className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
      >
        {pending
          ? "Registering…"
          : limitReached
            ? "Project limit reached (2/2)"
            : "Register for this project"}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
