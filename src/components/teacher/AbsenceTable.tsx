"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { absenceStatusColor, absenceStatusLabel } from "@/lib/utils";

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

const basicStatuses = ["PRESENT", "ABSENT", "LATE"] as const;

export function AbsenceTable({ classId, students, initialDate }: AbsenceTableProps) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [excuseId, setExcuseId] = useState<string | null>(null);
  const [excuseNote, setExcuseNote] = useState("");

  async function updateAbsence(studentId: string, status: string, note?: string) {
    setLoadingId(studentId);
    await fetch(`/api/teacher/classes/${classId}/absences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, date, status, note }),
    });
    setExcuseId(null);
    setExcuseNote("");
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
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Absenzen erfassen</h2>
          <p className="text-sm text-zinc-500">
            Absenzen können entschuldigt oder abgeschlossen werden.
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Schüler/in
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Erfassen
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Bearbeiten
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Noch keine Schüler in dieser Klasse.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const current = student.absences[0];
                const currentStatus = current?.status ?? "PRESENT";
                const needsAction = ["ABSENT", "LATE"].includes(currentStatus);
                const isLoading = loadingId === student.id;

                return (
                  <tr key={student.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100">
                        {student.lastName} {student.firstName}
                      </p>
                      {current?.note && (
                        <p className="mt-0.5 text-xs text-zinc-500">Notiz: {current.note}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${absenceStatusColor(currentStatus)}`}
                      >
                        {absenceStatusLabel(currentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {basicStatuses.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={isLoading}
                            onClick={() => updateAbsence(student.id, status)}
                            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                              currentStatus === status
                                ? "bg-zinc-300 text-zinc-900"
                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                          >
                            {absenceStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {needsAction ? (
                        <div className="space-y-2">
                          {excuseId === student.id ? (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                type="text"
                                value={excuseNote}
                                onChange={(e) => setExcuseNote(e.target.value)}
                                placeholder="Grund der Entschuldigung"
                                className="rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              />
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => updateAbsence(student.id, "EXCUSED", excuseNote)}
                                className="rounded-md bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-500"
                              >
                                Speichern
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => setExcuseId(student.id)}
                                className="rounded-md border border-amber-800 bg-amber-950/50 px-2 py-1 text-xs font-medium text-amber-300 hover:bg-amber-900/50"
                              >
                                Entschuldigen
                              </button>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => updateAbsence(student.id, "CLOSED")}
                                className="rounded-md bg-zinc-600 px-2 py-1 text-xs font-medium text-zinc-100 hover:bg-zinc-500"
                              >
                                Abschliessen
                              </button>
                            </div>
                          )}
                        </div>
                      ) : currentStatus === "EXCUSED" ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => updateAbsence(student.id, "CLOSED")}
                          className="rounded-md bg-zinc-600 px-2 py-1 text-xs font-medium text-zinc-100 hover:bg-zinc-500"
                        >
                          Abschliessen
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
