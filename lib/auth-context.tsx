"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthModal } from "@/components/auth/AuthModal";

export type AuthRole = "STUDENT" | "MENTOR" | "COORDINATOR" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  iitId: string | null;
  role: AuthRole;
  mentorId: string | null;
};

export type AuthModalMode = "signin" | "register";

type ModalState =
  | { open: false }
  | { open: true; mode: AuthModalMode; onSuccess?: () => void };

type ActionResult = { ok: boolean; error?: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  registrations: string[];
  registrationsLoading: boolean;
  modal: ModalState;
  openAuthModal: (opts?: { mode?: AuthModalMode; onSuccess?: () => void }) => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  registerForProject: (slug: string) => Promise<ActionResult>;
  unregisterFromProject: (slug: string) => Promise<ActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false });

  const refreshRegistrations = useCallback(async () => {
    setRegistrationsLoading(true);
    try {
      const res = await fetch("/api/registrations");
      if (!res.ok) {
        setRegistrations([]);
        return;
      }
      const data = await res.json();
      const slugs = Array.isArray(data.registrations)
        ? data.registrations.map((r: { projectSlug: string }) => r.projectSlug)
        : [];
      setRegistrations(slugs);
    } finally {
      setRegistrationsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json().catch(() => ({ user: null }));
    setUser(data.user ?? null);
    if (data.user) {
      await refreshRegistrations();
    } else {
      setRegistrations([]);
    }
    setLoading(false);
  }, [refreshRegistrations]);

  useEffect(() => {
    async function bootstrap() {
      await refreshUser();
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setRegistrations([]);
  }, []);

  const openAuthModal = useCallback(
    (opts?: { mode?: AuthModalMode; onSuccess?: () => void }) => {
      setModal({
        open: true,
        mode: opts?.mode ?? "signin",
        onSuccess: opts?.onSuccess,
      });
    },
    []
  );

  const closeAuthModal = useCallback(() => setModal({ open: false }), []);

  const registerForProject = useCallback(async (slug: string): Promise<ActionResult> => {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug: slug }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Something went wrong." };
    }
    setRegistrations((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    return { ok: true };
  }, []);

  const unregisterFromProject = useCallback(async (slug: string): Promise<ActionResult> => {
    const res = await fetch("/api/registrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug: slug }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Something went wrong." };
    }
    setRegistrations((prev) => prev.filter((s) => s !== slug));
    return { ok: true };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      registrations,
      registrationsLoading,
      modal,
      openAuthModal,
      closeAuthModal,
      refreshUser,
      logout,
      registerForProject,
      unregisterFromProject,
    }),
    [
      user,
      loading,
      registrations,
      registrationsLoading,
      modal,
      openAuthModal,
      closeAuthModal,
      refreshUser,
      logout,
      registerForProject,
      unregisterFromProject,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
