"use client";

// Dropdown: Lehrperson einer bestehenden Klasse zuweisen oder ändern

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface ClassTeacherSelectProps {
  classId: string;
  teachers: Teacher[];
  currentTeacherId: string;
}

export function ClassTeacherSelect({
  classId,
  teachers,
  currentTeacherId,
}: ClassTeacherSelectProps) {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState(currentTeacherId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTeacherId(currentTeacherId);
  }, [currentTeacherId]);

  async function handleChange(nextTeacherId: string) {
    setTeacherId(nextTeacherId);
    setError("");
    setLoading(true);

    const res = await fetch(`/api/admin/classes/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: nextTeacherId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Zuweisung fehlgeschlagen");
      setTeacherId(currentTeacherId);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  if (teachers.length === 0) {
    return <p className="text-sm text-zinc-500">Keine Lehrpersonen vorhanden.</p>;
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
        Lehrperson
      </label>
      <select
        value={teacherId}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:opacity-60"
      >
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.lastName} {teacher.firstName}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
