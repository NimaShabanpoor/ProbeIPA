"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClassStudentListProps {
  classId: string;
  students: {
    membershipId: string;
    studentId: string;
    firstName: string;
    lastName: string;
  }[];
}

export function ClassStudentList({ classId, students }: ClassStudentListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleRemove(studentId: string, name: string) {
    if (!confirm(`${name} aus dieser Klasse entfernen?`)) return;

    setLoadingId(studentId);
    await fetch(`/api/admin/classes/${classId}/students`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    router.refresh();
    setLoadingId(null);
  }

  if (students.length === 0) {
    return <p className="mt-4 text-sm text-zinc-500">Noch keine Schüler in dieser Klasse.</p>;
  }

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {students.map((entry) => (
        <li
          key={entry.membershipId}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-600 bg-zinc-800 pl-3 pr-1 py-1 text-sm text-zinc-300"
        >
          <span>
            {entry.lastName} {entry.firstName}
          </span>
          <button
            type="button"
            disabled={loadingId === entry.studentId}
            onClick={() =>
              handleRemove(
                entry.studentId,
                `${entry.firstName} ${entry.lastName}`
              )
            }
            className="rounded-full px-2 py-0.5 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-60"
            title="Aus Klasse entfernen"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
