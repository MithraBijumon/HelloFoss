import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "hf_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const MIN_PASSWORD_LENGTH = 8;

function pepper(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return secret;
}

function hashToken(value: string): string {
  return crypto.createHash("sha256").update(`${value}:${pepper()}`).digest("hex");
}

function generateOtpCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(":");
  if (!salt || !derivedHex) return false;
  const derived = Buffer.from(derivedHex, "hex");
  const candidate = crypto.scryptSync(password, salt, derived.length);
  return derived.length === candidate.length && crypto.timingSafeEqual(derived, candidate);
}

export async function hasActiveOtpCooldown(userId: string): Promise<boolean> {
  const recentOtp = await prisma.otpCode.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return Boolean(recentOtp && Date.now() - recentOtp.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS);
}

export async function createOtp(userId: string) {
  const code = generateOtpCode();
  const codeHash = hashToken(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await prisma.otpCode.create({ data: { userId, codeHash, expiresAt } });
  return { code, expiresAt };
}

export async function consumeOtp(userId: string, code: string): Promise<boolean> {
  const codeHash = hashToken(code);
  const otp = await prisma.otpCode.findFirst({
    where: { userId, codeHash, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
  return true;
}

/**
 * Used to complete registration and to reset a forgotten password — both
 * are "prove you own this email, then set a password" flows.
 */
export async function verifyOtpAndSetPassword(
  userId: string,
  code: string,
  password: string
): Promise<boolean> {
  const valid = await consumeOtp(userId, code);
  if (!valid) return false;
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashPassword(password) },
  });
  return true;
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { userId, tokenHash, expiresAt } });
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  iitId: string | null;
  role: Role;
  mentorId: string | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    iitId: session.user.iitId,
    role: session.user.role,
    mentorId: session.user.mentorId,
  };
}
