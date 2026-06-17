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
      <p className="mt-3 text-sm text-slate-500">Alle Schüler sind dieser Klasse zugewiesen.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none ring-violet-500 focus:ring-2"
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
        className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
      >
        {loading ? "..." : "Zuweisen"}
      </button>
    </form>
  );
}
