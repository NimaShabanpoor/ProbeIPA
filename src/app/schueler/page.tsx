import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { getStudentMemberships, getStudentAbsences, getStudentAbsenceStats } from "@/lib/db";
import {
  absenceReasonLabel,
  absenceStatusColor,
  formatDate,
  studentAbsenceLabel,
} from "@/lib/utils";
import { AbsenceStatus, Role } from "@/lib/types";

export default async function StudentDashboardPage() {
  const session = await requireRole(Role.STUDENT);
  if (!session) redirect("/");

  const memberships = getStudentMemberships(session.id);
  const absences = getStudentAbsences(session.id);
  const stats = getStudentAbsenceStats(session.id);
  const statMap = Object.fromEntries(stats.map((s) => [s.status, s.count]));

  const excusedCount = statMap[AbsenceStatus.EXCUSED] ?? 0;
  const unexcusedCount = statMap[AbsenceStatus.UNEXCUSED] ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title="Meine Absenzen"
        subtitle="Übersicht Ihrer Abwesenheiten"
        userName={`${session.firstName} ${session.lastName}`}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Entschuldigt</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">{excusedCount}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {excusedCount === 1 ? "Absenz" : "Absenzen"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Unentschuldigt</p>
            <p className="mt-1 text-3xl font-bold text-red-400">{unexcusedCount}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {unexcusedCount === 1 ? "Absenz" : "Absenzen"}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Meine Klassen</h2>
          {memberships.length === 0 ? (
            <p className="text-zinc-500">Sie sind noch keiner Klasse zugewiesen.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {memberships.map((m) => (
                <div key={m.id} className="rounded-xl border border-zinc-700 p-5">
                  <h3 className="font-semibold text-zinc-100">{m.className}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Lehrperson: {m.teacherFirstName} {m.teacherLastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
          <div className="border-b border-zinc-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-100">Alle Absenzen</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Hier sehen Sie, ob eine Absenz entschuldigt oder unentschuldigt ist.
            </p>
          </div>
          <table className="min-w-full divide-y divide-zinc-700">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                  Klasse
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                  Einstufung
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                  Grund
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {absences.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    Keine Absenzen erfasst. Gut gemacht!
                  </td>
                </tr>
              ) : (
                absences.map((absence) => (
                  <tr key={absence.id}>
                    <td className="px-6 py-4 text-zinc-200">{formatDate(absence.date)}</td>
                    <td className="px-6 py-4 text-zinc-400">{absence.className}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${absenceStatusColor(absence.status)}`}
                      >
                        {studentAbsenceLabel(absence.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {absence.status === AbsenceStatus.EXCUSED && absence.note
                        ? absenceReasonLabel(absence.note)
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
