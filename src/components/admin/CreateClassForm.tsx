"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface CreateClassFormProps {
  teachers: Teacher[];
}

export function CreateClassForm({ teachers }: CreateClassFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, teacherId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Fehler beim Erstellen");
      setLoading(false);
      return;
    }

    setName("");
    router.refresh();
    setLoading(false);
  }

  if (teachers.length === 0) {
    return (
      <p className="text-sm text-amber-700">
        Bitte zuerst mindestens eine Lehrperson anlegen.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="z.B. 3a Mathematik"
        required
        className="flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
      />
      <select
        value={teacherId}
        onChange={(e) => setTeacherId(e.target.value)}
        required
        className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
      >
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.lastName} {t.firstName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-300 px-4 py-2 font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
      >
        {loading ? "Erstellen..." : "Klasse erstellen"}
      </button>
      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
