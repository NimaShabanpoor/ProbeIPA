import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === Role.ADMIN) redirect("/admin");
  if (session?.role === Role.TEACHER) redirect("/lehrer");
  if (session?.role === Role.STUDENT) redirect("/schueler");

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <LoginForm
            role="ADMIN"
            title="Admin-Login"
            redirectTo="/admin"
          />
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="text-violet-600 hover:underline">
              ← Zurück zur Startseite
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
