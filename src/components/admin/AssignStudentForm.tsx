"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AssignStudentFormProps {
  classId: string;
  students: { id: string; firstName: string; lastName: string }[];
}

export function AssignStudentForm({ classId, students }: AssignStudentFormProps) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);

    await fetch(`/api/admin/classes/${classId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });

    router.refresh();
    setLoading(false);
  }

  if (students.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-500">Alle Schüler sind dieser Klasse zugewiesen.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
      >
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.lastName} {s.firstName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
      >
        {loading ? "..." : "Zuweisen"}
      </button>
    </form>
  );
}
