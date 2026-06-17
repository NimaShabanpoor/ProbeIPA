import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { countUsersByRole, countClasses } from "@/lib/db";
import { Role } from "@/lib/types";

export default async function AdminDashboardPage() {
  const session = await requireRole(Role.ADMIN);
  if (!session) redirect("/");

  const teacherCount = countUsersByRole(Role.TEACHER);
  const studentCount = countUsersByRole(Role.STUDENT);
  const classCount = countClasses();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title="Admin-Dashboard"
        subtitle="Schule verwalten"
        userName={`${session.firstName} ${session.lastName}`}
        nav={[
          { href: "/admin", label: "Übersicht" },
          { href: "/admin/lehrer", label: "Lehrpersonen" },
          { href: "/admin/schueler", label: "Schüler" },
          { href: "/admin/klassen", label: "Klassen" },
        ]}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Lehrpersonen</p>
            <p className="mt-1 text-3xl font-bold text-zinc-200">{teacherCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Schüler</p>
            <p className="mt-1 text-3xl font-bold text-zinc-200">{studentCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Klassen</p>
            <p className="mt-1 text-3xl font-bold text-zinc-200">{classCount}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/admin/lehrer", title: "Lehrpersonen verwalten", desc: "Neue Lehrpersonen anlegen und Logins erstellen." },
            { href: "/admin/schueler", title: "Schüler verwalten", desc: "Schüler anlegen und Klassen zuweisen." },
            { href: "/admin/klassen", title: "Klassen verwalten", desc: "Klassen erstellen und Lehrpersonen zuweisen." },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              <h2 className="font-semibold text-zinc-100">{item.title}</h2>
              <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
