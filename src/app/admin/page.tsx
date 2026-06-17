import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export default async function AdminDashboardPage() {
  const session = await requireRole(Role.ADMIN);
  if (!session) redirect("/login/admin");

  const [teacherCount, studentCount, classCount] = await Promise.all([
    prisma.user.count({ where: { role: Role.TEACHER } }),
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.class.count(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
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
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Lehrpersonen</p>
            <p className="mt-1 text-3xl font-bold text-violet-700">{teacherCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Schüler</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{studentCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Klassen</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{classCount}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/lehrer"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-300"
          >
            <h2 className="font-semibold text-slate-900">Lehrpersonen verwalten</h2>
            <p className="mt-2 text-sm text-slate-500">
              Neue Lehrpersonen anlegen und Logins erstellen.
            </p>
          </Link>
          <Link
            href="/admin/schueler"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-300"
          >
            <h2 className="font-semibold text-slate-900">Schüler verwalten</h2>
            <p className="mt-2 text-sm text-slate-500">
              Schüler anlegen und Klassen zuweisen.
            </p>
          </Link>
          <Link
            href="/admin/klassen"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-300"
          >
            <h2 className="font-semibold text-slate-900">Klassen verwalten</h2>
            <p className="mt-2 text-sm text-slate-500">
              Klassen erstellen und Lehrpersonen zuweisen.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
