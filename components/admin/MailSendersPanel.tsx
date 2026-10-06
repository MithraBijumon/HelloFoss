"use client";

import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import type { AdminMailSender } from "@/lib/admin";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const inputClasses =
  "h-9 w-full rounded-md border border-border-strong bg-background px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring";
const smallButton = cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-8 px-3 text-xs");

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type CheckResult = { ok: boolean; remaining?: number; error?: string };

async function request(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function SenderForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: AdminMailSender;
  submitLabel: string;
  onSubmit: (values: { label: string; webhookUrl: string; secret: string }) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [webhookUrl, setWebhookUrl] = useState(initial?.webhookUrl ?? "");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(await onSubmit({ label, webhookUrl, secret }));
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. hellofoss.mailer1@gmail.com"
          className={inputClasses}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Web app URL
        <input
          required
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://script.google.com/macros/s/…/exec"
          className={cn(inputClasses, "font-mono text-xs")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Secret
        <input
          required={!initial}
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder={initial ? `Leave blank to keep the current one (${initial.secretHint})` : "The MAIL_SECRET script property"}
          autoComplete="off"
          className={inputClasses}
        />
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={cn(buttonBaseClasses, buttonVariantClasses.primary, "h-9 px-4 text-sm")}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={cn(buttonBaseClasses, buttonVariantClasses.ghost, "h-9 px-4 text-sm")}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function MailSendersPanel({
  initialSenders,
  envConfigured,
}: {
  initialSenders: AdminMailSender[];
  envConfigured: boolean;
}) {
  const [senders, setSenders] = useState(initialSenders);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, CheckResult | "pending">>({});
  const [error, setError] = useState<string | null>(null);

  async function mutate(url: string, method: string, body?: unknown): Promise<string | null> {
    const { ok, data } = await request(url, method, body);
    if (!ok) return data.error ?? "Something went wrong.";
    setSenders(data.senders);
    return null;
  }

  async function act(url: string, method: string, body?: unknown) {
    setError(await mutate(url, method, body));
  }

  async function check(id: string) {
    setChecks((c) => ({ ...c, [id]: "pending" }));
    const { data } = await request(`/api/admin/mail-senders/${id}/check`, "POST");
    setChecks((c) => ({ ...c, [id]: data as CheckResult }));
  }

  const enabledCount = senders.filter((s) => s.enabled).length;

  return (
    <div className="mt-4">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Verification emails go out through the first enabled sender. If it fails (for example after
        hitting Gmail&apos;s daily limit of 100, or 1,500 on Workspace), the next one is tried
        automatically. Each sender is a copy of <code className="font-mono text-xs">scripts/gas-mailer.gs</code>{" "}
        deployed under a different Google account.
      </p>

      {enabledCount === 0 && (
        <p className="mt-4 rounded-r-md border-l-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm">
          {envConfigured
            ? "No enabled senders here, so mail uses the GAS_MAIL_* environment variables."
            : "No enabled senders. In production, registration and password reset are switched off until you add one."}
        </p>
      )}

      <ol className="mt-4 flex flex-col gap-3">
        {senders.map((sender, i) => {
          const result = checks[sender.id];
          if (editingId === sender.id) {
            return (
              <li key={sender.id}>
                <SenderForm
                  initial={sender}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (values) => {
                    const err = await mutate(`/api/admin/mail-senders/${sender.id}`, "PATCH", values);
                    if (!err) setEditingId(null);
                    return err;
                  }}
                />
              </li>
            );
          }
          return (
            <li
              key={sender.id}
              className={cn(
                "rounded-lg border border-border bg-card p-4",
                !sender.enabled && "opacity-60"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="font-mono text-xs text-muted-subtle">{i + 1}.</span>
                    <span className="truncate">{sender.label}</span>
                    {!sender.enabled && <span className="text-xs font-normal text-muted-subtle">(disabled)</span>}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-muted-subtle">{sender.webhookUrl}</p>
                  <p className="mt-2 text-xs text-muted">
                    {sender.lastUsedAt ? `Last sent ${timeFormat.format(new Date(sender.lastUsedAt))}` : "Not used yet"}
                    {" · "}secret {sender.secretHint}
                  </p>
                  {sender.lastError && sender.lastErrorAt && (
                    <p className="mt-1 text-xs text-red-500">
                      Last error ({timeFormat.format(new Date(sender.lastErrorAt))}): {sender.lastError}
                    </p>
                  )}
                  {result && result !== "pending" && (
                    <p className={cn("mt-1 text-xs", result.ok ? "text-accent" : "text-red-500")}>
                      {result.ok
                        ? `Working. ${result.remaining ?? "?"} emails left today.`
                        : `Check failed: ${result.error ?? "unknown error"}`}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => act(`/api/admin/mail-senders/${sender.id}`, "PATCH", { move: "up" })}
                    className={cn(smallButton, "px-2")}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={i === senders.length - 1}
                    onClick={() => act(`/api/admin/mail-senders/${sender.id}`, "PATCH", { move: "down" })}
                    className={cn(smallButton, "px-2")}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" disabled={result === "pending"} onClick={() => check(sender.id)} className={smallButton}>
                    {result === "pending" ? "Checking…" : "Check"}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(`/api/admin/mail-senders/${sender.id}`, "PATCH", { enabled: !sender.enabled })}
                    className={smallButton}
                  >
                    {sender.enabled ? "Disable" : "Enable"}
                  </button>
                  <button type="button" onClick={() => setEditingId(sender.id)} className={smallButton}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete sender "${sender.label}"?`)) {
                        act(`/api/admin/mail-senders/${sender.id}`, "DELETE");
                      }
                    }}
                    className={cn(smallButton, "text-red-500")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {envConfigured && (
          <li className="rounded-lg border border-dashed border-border-strong p-4 text-sm text-muted">
            <span className="font-mono text-xs text-muted-subtle">{senders.length + 1}.</span> GAS_MAIL_* environment
            variables (always tried last; change them in Coolify)
          </li>
        )}
      </ol>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-4">
        {adding ? (
          <SenderForm
            submitLabel="Add sender"
            onCancel={() => setAdding(false)}
            onSubmit={async (values) => {
              const err = await mutate("/api/admin/mail-senders", "POST", values);
              if (!err) setAdding(false);
              return err;
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={cn(buttonBaseClasses, buttonVariantClasses.secondary, "h-9 px-4 text-sm")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add sender
          </button>
        )}
      </div>
    </div>
  );
}
