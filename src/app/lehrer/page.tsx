import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export default async function TeacherDashboardPage() {
  const session = await requireRole(Role.TEACHER);
  if (!session) redirect("/login/lehrer");

  const [classes, openAbsences] = await Promise.all([
    prisma.class.findMany({
      where: { teacherId: session.id },
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.absence.count({
      where: {
        class: { teacherId: session.id },
        status: { in: ["ABSENT", "LATE", "EXCUSED"] },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Lehrer-Dashboard"
        subtitle="Absenzen erfassen und bearbeiten"
        userName={`${session.firstName} ${session.lastName}`}
        nav={[{ href: "/lehrer", label: "Übersicht" }]}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Meine Klassen</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{classes.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Offene Absenzen</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{openAbsences}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Heute</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {new Intl.DateTimeFormat("de-CH", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Meine Klassen</h2>
          {classes.length === 0 ? (
            <p className="text-slate-500">
              Ihnen wurden noch keine Klassen zugewiesen. Bitte wenden Sie sich an den
              Administrator.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/lehrer/klassen/${cls.id}`}
                  className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{cls.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {cls._count.students} Schüler
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-blue-600">
                    Absenzen erfassen →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
