import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === Role.ADMIN) redirect("/admin");
  if (session?.role === Role.TEACHER) redirect("/lehrer");
  if (session?.role === Role.STUDENT) redirect("/schueler");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
            A
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Absenzenverwaltung
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">
            Digitale Verwaltung von Schülerabsenzen für Administratoren,
            Lehrpersonen und Schülerinnen und Schüler.
          </p>
        </div>

        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-3">
          <Link
            href="/login/admin"
            className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
          >
            <div className="mb-4 inline-flex rounded-xl bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
              Administrator
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin-Login</h2>
            <p className="mt-2 text-slate-600">
              Lehrpersonen, Schüler und Klassen verwalten.
            </p>
            <span className="mt-6 inline-block text-sm font-medium text-violet-600 group-hover:underline">
              Jetzt anmelden →
            </span>
          </Link>

          <Link
            href="/login/lehrer"
            className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-4 inline-flex rounded-xl bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              Lehrperson
            </div>
            <h2 className="text-xl font-bold text-slate-900">Lehrer-Login</h2>
            <p className="mt-2 text-slate-600">
              Absenzen erfassen, entschuldigen und abschliessen.
            </p>
            <span className="mt-6 inline-block text-sm font-medium text-blue-600 group-hover:underline">
              Jetzt anmelden →
            </span>
          </Link>

          <Link
            href="/login/schueler"
            className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="mb-4 inline-flex rounded-xl bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Schüler/in
            </div>
            <h2 className="text-xl font-bold text-slate-900">Schüler-Login</h2>
            <p className="mt-2 text-slate-600">
              Eigene Absenzen einsehen und den Überblick behalten.
            </p>
            <span className="mt-6 inline-block text-sm font-medium text-emerald-600 group-hover:underline">
              Jetzt anmelden →
            </span>
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Demo-Zugänge werden in der README beschrieben.
        </p>
      </div>
    </main>
  );
}
