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

  async function updateAbsence(
    studentId: string,
    status: string,
    note?: string
  ) {
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
          <h2 className="text-lg font-semibold text-slate-900">Absenzen erfassen</h2>
          <p className="text-sm text-slate-500">
            Absenzen können entschuldigt oder abgeschlossen werden.
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Schüler/in
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Erfassen
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bearbeiten
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
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
                      <p className="font-medium text-slate-900">
                        {student.lastName} {student.firstName}
                      </p>
                      {current?.note && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Notiz: {current.note}
                        </p>
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
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                                className="rounded-md border border-slate-300 px-2 py-1 text-xs outline-none ring-amber-500 focus:ring-2"
                              />
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() =>
                                  updateAbsence(student.id, "EXCUSED", excuseNote)
                                }
                                className="rounded-md bg-amber-500 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
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
                                className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
                              >
                                Entschuldigen
                              </button>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => updateAbsence(student.id, "CLOSED")}
                                className="rounded-md bg-slate-700 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800"
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
                          className="rounded-md bg-slate-700 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Abschliessen
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
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
