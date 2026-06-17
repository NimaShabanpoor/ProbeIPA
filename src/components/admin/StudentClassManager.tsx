"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StudentClassManagerProps {
  studentId: string;
  assignedClasses: { id: string; name: string }[];
  allClasses: { id: string; name: string }[];
}

export function StudentClassManager({
  studentId,
  assignedClasses,
  allClasses,
}: StudentClassManagerProps) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const assignedIds = new Set(assignedClasses.map((c) => c.id));
  const availableClasses = allClasses.filter((c) => !assignedIds.has(c.id));

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/classes/${classId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Zuweisung fehlgeschlagen");
      setLoading(false);
      return;
    }

    setClassId("");
    router.refresh();
    setLoading(false);
  }

  async function handleRemove(classIdToRemove: string, className: string) {
    if (!confirm(`Aus Klasse „${className}" entfernen?`)) return;

    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/classes/${classIdToRemove}/students`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Entfernen fehlgeschlagen");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      {assignedClasses.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {assignedClasses.map((cls) => (
            <li
              key={cls.id}
              className="inline-flex items-center gap-1 rounded-full bg-violet-100 pl-3 pr-1 py-1 text-sm text-violet-800"
            >
              <span>{cls.name}</span>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRemove(cls.id, cls.name)}
                className="rounded-full px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                title="Aus Klasse entfernen"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Keiner Klasse zugewiesen.</p>
      )}

      {availableClasses.length > 0 && (
        <form onSubmit={handleAssign} className="flex flex-wrap gap-2">
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none ring-violet-500 focus:ring-2"
          >
            <option value="">Klasse hinzufügen...</option>
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !classId}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "..." : "Zuweisen"}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
