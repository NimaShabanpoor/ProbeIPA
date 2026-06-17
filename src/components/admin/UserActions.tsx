"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  id: string;
  type: "teachers" | "students";
  firstName: string;
  lastName: string;
  email: string;
}

export function UserActions({
  id,
  type,
  firstName,
  lastName,
  email,
}: UserActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName, lastName, email, password: "" });

  async function handleSave() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/${type}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Speichern fehlgeschlagen");
      setLoading(false);
      return;
    }

    setEditing(false);
    setForm((f) => ({ ...f, password: "" }));
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    const label = type === "teachers" ? "Lehrperson" : "Schüler";
    if (!confirm(`${label} wirklich löschen?`)) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Löschen fehlgeschlagen");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  function handleCancel() {
    setForm({ firstName, lastName, email, password: "" });
    setEditing(false);
    setError("");
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="Vorname"
            className="rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="Nachname"
            className="rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="E-Mail"
            className="rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Neues Passwort (optional)"
            className="rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="rounded-md bg-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "..." : "Speichern"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleCancel}
            className="rounded-md border border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Abbrechen
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => setEditing(true)}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Bearbeiten
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          className="rounded-md border border-red-800 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-60"
        >
          Löschen
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
