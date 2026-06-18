"use client";

// Login-Formular: ein Login für alle Rollen, Weiterleitung je nach Rolle

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/types";

// Ziel-Dashboard nach erfolgreichem Login
const redirects: Record<Role, string> = {
  [Role.ADMIN]: "/admin",
  [Role.TEACHER]: "/lehrer",
  [Role.STUDENT]: "/schueler",
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Anmeldung fehlgeschlagen");
        return;
      }

      router.push(redirects[data.user.role as Role]);
      router.refresh();
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          placeholder="name@schule.ch"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-zinc-300 to-zinc-400 px-4 py-2.5 font-semibold text-zinc-900 transition hover:from-zinc-200 hover:to-zinc-300 disabled:opacity-60"
      >
        {loading ? "Wird angemeldet..." : "Anmelden"}
      </button>
    </form>
  );
}
