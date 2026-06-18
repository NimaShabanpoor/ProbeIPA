import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { getTeacherClasses } from "@/lib/db";
import { Role } from "@/lib/types";

export default async function TeacherDashboardPage() {
  const session = await requireRole(Role.TEACHER);
  if (!session) redirect("/");

  const classes = getTeacherClasses(session.id);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title="Klassen"
        subtitle="Wählen Sie eine Klasse aus"
        userName={`${session.firstName} ${session.lastName}`}
        nav={[{ href: "/lehrer", label: "Klassen" }]}
      />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {classes.length === 0 ? (
          <p className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-500">
            Ihnen wurden noch keine Klassen zugewiesen. Bitte wenden Sie sich an den Administrator.
          </p>
        ) : (
          <ul className="space-y-3">
            {classes.map((cls) => (
              <li key={cls.id}>
                <Link
                  href={`/lehrer/klassen/${cls.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-5 transition hover:border-zinc-500 hover:bg-zinc-800"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">{cls.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {cls.studentCount} {cls.studentCount === 1 ? "Schüler" : "Schüler"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-zinc-400">Öffnen →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
