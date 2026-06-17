"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateStudentFormProps {
  classes: { id: string; name: string }[];
}

export function CreateStudentForm({ classes }: CreateStudentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    classId: classes[0]?.id ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Fehler beim Erstellen");
      setLoading(false);
      return;
    }

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      classId: classes[0]?.id ?? "",
    });
    setSuccess(`Schüler ${data.student.firstName} ${data.student.lastName} erstellt.`);
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <input
        type="text"
        placeholder="Vorname"
        required
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
      />
      <input
        type="text"
        placeholder="Nachname"
        required
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
      />
      <input
        type="email"
        placeholder="E-Mail"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
      />
      <input
        type="text"
        placeholder="Passwort"
        required
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
      />
      <select
        value={form.classId}
        onChange={(e) => setForm({ ...form, classId: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-violet-500 focus:ring-2 md:col-span-2"
      >
        <option value="">Keine Klasse zuweisen</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "Wird erstellt..." : "Schüler anlegen"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-emerald-600">{success}</p>}
      </div>
    </form>
  );
}
