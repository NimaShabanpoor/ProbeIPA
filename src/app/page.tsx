import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { dashboardForRole, getSession } from "@/lib/auth";
import { DEMO_PASSWORD } from "@/lib/demo";

// Startseite: Login. Bereits eingeloggte User werden zum Dashboard weitergeleitet.
export default async function HomePage() {
  const session = await getSession();
  if (session) redirect(dashboardForRole(session.role));

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-600 bg-gradient-to-br from-zinc-700 to-zinc-900 text-2xl font-bold text-zinc-200 shadow-lg">
            A
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Absenzenverwaltung
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Melden Sie sich mit Ihren Zugangsdaten an.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur">
          <LoginForm />
        </div>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500">
          <p className="mb-2 font-medium text-zinc-400">Demo-Zugänge (Passwort: {DEMO_PASSWORD})</p>
          <p>Admin: admin@schule.ch</p>
          <p>Lehrer: mueller@schule.ch</p>
          <p>Schüler: lukas@schule.ch</p>
        </div>
      </div>
    </main>
  );
}
