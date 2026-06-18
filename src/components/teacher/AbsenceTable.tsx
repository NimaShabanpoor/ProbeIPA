"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  absences: { status: string; note: string | null }[];
}

interface AbsenceTableProps {
  classId: string;
  students: StudentRow[];
  initialDate: string;
}

function isPresent(status: string | undefined) {
  return !status || status === "PRESENT";
}

export function AbsenceTable({ classId, students, initialDate }: AbsenceTableProps) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function setAttendance(studentId: string, present: boolean) {
    setLoadingId(studentId);
    await fetch(`/api/teacher/classes/${classId}/absences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        date,
        status: present ? "PRESENT" : "ABSENT",
      }),
    });
    router.refresh();
    setLoadingId(null);
  }

  function handleDateChange(newDate: string) {
    setDate(newDate);
    router.push(`/lehrer/klassen/${classId}?date=${newDate}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Schüler</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {students.length === 0 ? (
        <p className="rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 py-8 text-center text-zinc-500">
          Noch keine Schüler in dieser Klasse.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-700">
          {students.map((student) => {
            const currentStatus = student.absences[0]?.status;
            const present = isPresent(currentStatus);
            const isLoading = loadingId === student.id;

            return (
              <li
                key={student.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-medium text-zinc-100">
                  {student.lastName} {student.firstName}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setAttendance(student.id, true)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                      present
                        ? "bg-emerald-600 text-white"
                        : "border border-zinc-600 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Anwesend
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setAttendance(student.id, false)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                      !present
                        ? "bg-red-600 text-white"
                        : "border border-zinc-600 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Nicht anwesend
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
