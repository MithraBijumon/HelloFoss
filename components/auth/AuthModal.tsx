"use client";

import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { iits } from "@/data/iits";
import { useAuth, type AuthModalMode } from "@/lib/auth-context";
import { buttonBaseClasses, buttonVariantClasses, buttonSizeClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const instituteDomains = iits.flatMap((iit) => iit.emailDomains).join(", ");

const RESEND_COOLDOWN_S = 30;
const MIN_PASSWORD_LENGTH = 8;

const inputClasses =
  "h-10 rounded-md border border-border-strong bg-background px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";

function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={cn(inputClasses, "w-full pr-10")} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-subtle transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

type Step =
  | { kind: "signin" }
  | { kind: "register-details" }
  | { kind: "register-otp" }
  | { kind: "forgot-email" }
  | { kind: "forgot-otp" };

export function AuthModal() {
  const { modal } = useAuth();
  if (!modal.open) return null;
  return <AuthModalDialog initialMode={modal.mode} onSuccess={modal.onSuccess} />;
}

function AuthModalDialog({
  initialMode,
  onSuccess,
}: {
  initialMode: AuthModalMode;
  onSuccess?: () => void;
}) {
  const { closeAuthModal, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>(
    initialMode === "register" ? { kind: "register-details" } : { kind: "signin" }
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeAuthModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeAuthModal]);

  function resetMessages() {
    setError(null);
  }

  async function postJson(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  async function finishAuth() {
    closeAuthModal();
    await refreshUser();
    onSuccess?.();
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    resetMessages();
    setSubmitting(true);
    try {
      const { ok, data } = await postJson("/api/auth/login", { email, password });
      if (!ok) {
        setError(data.error ?? "Incorrect email or password.");
        return;
      }
      await finishAuth();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestRegisterOtp(e?: FormEvent) {
    e?.preventDefault();
    if (submitting) return;
    resetMessages();
    setSubmitting(true);
    try {
      const { ok, data } = await postJson("/api/auth/request-otp", { email, name });
      if (!ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDevCode(data.devCode ?? null);
      setNewPassword("");
      setConfirmPassword("");
      setCode("");
      setStep({ kind: "register-otp" });
      setCooldown(RESEND_COOLDOWN_S);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteRegistration(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    resetMessages();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const { ok, data } = await postJson("/api/auth/verify-otp", { email, code, password: newPassword });
      if (!ok) {
        setError(data.error ?? "Invalid or expired code.");
        return;
      }
      await finishAuth();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestReset(e?: FormEvent) {
    e?.preventDefault();
    if (submitting) return;
    resetMessages();
    setSubmitting(true);
    try {
      const { ok, data } = await postJson("/api/auth/forgot-password", { email });
      if (!ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDevCode(data.devCode ?? null);
      setNewPassword("");
      setConfirmPassword("");
      setCode("");
      setStep({ kind: "forgot-otp" });
      setCooldown(RESEND_COOLDOWN_S);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteReset(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    resetMessages();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const { ok, data } = await postJson("/api/auth/reset-password", { email, code, password: newPassword });
      if (!ok) {
        setError(data.error ?? "Invalid or expired code.");
        return;
      }
      await finishAuth();
    } finally {
      setSubmitting(false);
    }
  }

  function switchTo(kind: Step["kind"]) {
    resetMessages();
    setStep({ kind } as Step);
  }

  const heading =
    step.kind === "signin"
      ? "Sign in"
      : step.kind === "register-details"
        ? "Create your account"
        : step.kind === "register-otp"
          ? "Verify your email"
          : step.kind === "forgot-email"
            ? "Reset your password"
            : "Check your email";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={closeAuthModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{heading}</h2>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close"
            className="text-muted hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {step.kind === "signin" && (
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleSignIn}>
            <label className="flex flex-col gap-1.5 text-sm">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@iitb.ac.in"
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Password
              <PasswordInput
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-sm text-muted">
              <button type="button" onClick={() => switchTo("register-details")} className="hover:text-foreground">
                New here? Register
              </button>
              <button type="button" onClick={() => switchTo("forgot-email")} className="hover:text-foreground">
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {step.kind === "register-details" && (
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleRequestRegisterOtp}>
            <label className="flex flex-col gap-1.5 text-sm">
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Institute email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@iitb.ac.in"
                autoComplete="email"
              />
              <span className="text-xs text-muted-subtle">
                Use your institute email ({instituteDomains}). We&apos;ll detect your IIT from it.
              </span>
            </label>

            {error && (
              <div className="text-sm text-red-500">
                {error}
                {error.includes("already registered") && (
                  <button
                    type="button"
                    onClick={() => switchTo("signin")}
                    className="ml-1 font-medium underline hover:text-foreground"
                  >
                    Sign in
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
            >
              {submitting ? "Sending…" : "Send verification code"}
            </button>

            <button
              type="button"
              onClick={() => switchTo("signin")}
              className="text-sm text-muted hover:text-foreground"
            >
              Already have an account? Sign in
            </button>
          </form>
        )}

        {step.kind === "register-otp" && (
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleCompleteRegistration}>
            <p className="text-sm text-muted">
              We sent a 6-digit code to <span className="text-foreground">{email}</span>.
            </p>

            {devCode && (
              <p className="rounded-md border border-dashed border-border-strong bg-background px-3 py-2 font-mono text-sm">
                Dev mode: no email configured. Your code is{" "}
                <span className="font-semibold">{devCode}</span>
              </p>
            )}

            <label className="flex flex-col gap-1.5 text-sm">
              Verification code
              <input
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={cn(inputClasses, "text-center font-mono text-lg tracking-[0.5em]")}
                placeholder="------"
                autoComplete="one-time-code"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              Choose a password
              <PasswordInput
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Confirm password
              <PasswordInput
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
            >
              {submitting ? "Verifying…" : "Verify & create account"}
            </button>

            <div className="flex items-center justify-between text-sm text-muted">
              <button type="button" onClick={() => switchTo("register-details")} className="hover:text-foreground">
                Edit details
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || submitting}
                onClick={() => handleRequestRegisterOtp()}
                className="hover:text-foreground disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {step.kind === "forgot-email" && (
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleRequestReset}>
            <p className="text-sm text-muted">
              Enter your account email and we&apos;ll send you a verification code to set a new password.
            </p>
            <label className="flex flex-col gap-1.5 text-sm">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@iitb.ac.in"
                autoComplete="email"
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
            >
              {submitting ? "Sending…" : "Send verification code"}
            </button>

            <button
              type="button"
              onClick={() => switchTo("signin")}
              className="text-sm text-muted hover:text-foreground"
            >
              Back to sign in
            </button>
          </form>
        )}

        {step.kind === "forgot-otp" && (
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleCompleteReset}>
            <p className="text-sm text-muted">
              We sent a 6-digit code to <span className="text-foreground">{email}</span>.
            </p>

            {devCode && (
              <p className="rounded-md border border-dashed border-border-strong bg-background px-3 py-2 font-mono text-sm">
                Dev mode: no email configured. Your code is{" "}
                <span className="font-semibold">{devCode}</span>
              </p>
            )}

            <label className="flex flex-col gap-1.5 text-sm">
              Verification code
              <input
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={cn(inputClasses, "text-center font-mono text-lg tracking-[0.5em]")}
                placeholder="------"
                autoComplete="one-time-code"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              New password
              <PasswordInput
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Confirm new password
              <PasswordInput
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={cn(buttonBaseClasses, buttonVariantClasses.primary, buttonSizeClasses.md, "w-full")}
            >
              {submitting ? "Saving…" : "Set new password & sign in"}
            </button>

            <div className="flex items-center justify-between text-sm text-muted">
              <button type="button" onClick={() => switchTo("forgot-email")} className="hover:text-foreground">
                Edit email
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || submitting}
                onClick={() => handleRequestReset()}
                className="hover:text-foreground disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
