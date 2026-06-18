// Authentifizierung: JWT-Session im httpOnly-Cookie, rollenbasierte Zugriffskontrolle.

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "@/lib/types";

export const SESSION_COOKIE = "absenzen-session";

// JWT-Secret aus .env — ohne JWT_SECRET startet die App nicht
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET ist nicht gesetzt");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

// Nach Login: JWT erzeugen und als Cookie setzen (7 Tage gültig)
export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

// Cookie auslesen und JWT prüfen; bei ungültigem Token null
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.id as string,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Gibt Session nur zurück wenn Rolle passt (ADMIN, TEACHER oder STUDENT)
export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session || session.role !== role) {
    return null;
  }
  return session;
}

// Weiterleitung nach Login je nach Rolle
export function dashboardForRole(role: Role) {
  if (role === Role.ADMIN) return "/admin";
  if (role === Role.TEACHER) return "/lehrer";
  return "/schueler";
}
