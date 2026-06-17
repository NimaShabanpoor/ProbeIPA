import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { absenceStatusColor, absenceStatusLabel, formatDate } from "@/lib/utils";
import { Role } from "@/generated/prisma/client";

export default async function StudentDashboardPage() {
  const session = await requireRole(Role.STUDENT);
  if (!session) redirect("/login/schueler");

  const [memberships, absences, stats] = await Promise.all([
    prisma.classStudent.findMany({
      where: { studentId: session.id },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
      },
    }),
    prisma.absence.findMany({
      where: {
        studentId: session.id,
        status: { not: "PRESENT" },
      },
      include: { class: true },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.absence.groupBy({
      by: ["status"],
      where: { studentId: session.id },
      _count: true,
    }),
  ]);

  const statMap = Object.fromEntries(
    stats.map((s) => [s.status, s._count])
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Mein Absenzen-Überblick"
        subtitle="Ihre Klassen und Absenzen auf einen Blick"
        userName={`${session.firstName} ${session.lastName}`}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Abwesend</p>
            <p className="mt-1 text-3xl font-bold text-red-600">{statMap.ABSENT ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Entschuldigt</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{statMap.EXCUSED ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Verspätet</p>
            <p className="mt-1 text-3xl font-bold text-orange-600">{statMap.LATE ?? 0}</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Meine Klassen</h2>
          {memberships.length === 0 ? (
            <p className="text-slate-500">Sie sind noch keiner Klasse zugewiesen.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <h3 className="font-semibold text-slate-900">{m.class.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Lehrperson: {m.class.teacher.firstName} {m.class.teacher.lastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Meine Absenzen</h2>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Klasse
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {absences.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Keine Absenzen erfasst. Gut gemacht!
                  </td>
                </tr>
              ) : (
                absences.map((absence) => (
                  <tr key={absence.id}>
                    <td className="px-6 py-4 text-slate-900">
                      {formatDate(absence.date)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{absence.class.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${absenceStatusColor(absence.status)}`}
                      >
                        {absenceStatusLabel(absence.status)}
                      </span>
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
