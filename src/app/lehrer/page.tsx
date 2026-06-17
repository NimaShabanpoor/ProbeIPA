import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { getTeacherClasses, countOpenAbsences } from "@/lib/db";
import { Role } from "@/lib/types";

export default async function TeacherDashboardPage() {
  const session = await requireRole(Role.TEACHER);
  if (!session) redirect("/");

  const classes = getTeacherClasses(session.id);
  const openAbsences = countOpenAbsences(session.id);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title="Lehrer-Dashboard"
        subtitle="Absenzen erfassen und bearbeiten"
        userName={`${session.firstName} ${session.lastName}`}
        nav={[{ href: "/lehrer", label: "Übersicht" }]}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Meine Klassen</p>
            <p className="mt-1 text-3xl font-bold text-zinc-200">{classes.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Offene Absenzen</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">{openAbsences}</p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Heute</p>
            <p className="mt-1 text-lg font-semibold text-zinc-200">
              {new Intl.DateTimeFormat("de-CH", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Meine Klassen</h2>
          {classes.length === 0 ? (
            <p className="text-zinc-500">
              Ihnen wurden noch keine Klassen zugewiesen. Bitte wenden Sie sich an den Administrator.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/lehrer/klassen/${cls.id}`}
                  className="rounded-xl border border-zinc-700 p-5 transition hover:border-zinc-500 hover:bg-zinc-800"
                >
                  <h3 className="text-lg font-semibold text-zinc-100">{cls.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{cls.studentCount} Schüler</p>
                  <span className="mt-4 inline-block text-sm font-medium text-zinc-400">
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
