import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CreateTeacherForm } from "@/components/admin/CreateTeacherForm";
import { UserActions } from "@/components/admin/UserActions";
import { requireRole } from "@/lib/auth";
import { getTeachers } from "@/lib/db";
import { Role } from "@/lib/types";

export default async function AdminTeachersPage() {
  const session = await requireRole(Role.ADMIN);
  if (!session) redirect("/");

  const teachers = getTeachers();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title="Lehrpersonen"
        subtitle="Lehrpersonen anlegen, bearbeiten und löschen"
        userName={`${session.firstName} ${session.lastName}`}
        nav={[
          { href: "/admin", label: "Übersicht" },
          { href: "/admin/lehrer", label: "Lehrpersonen" },
          { href: "/admin/schueler", label: "Schüler" },
          { href: "/admin/klassen", label: "Klassen" },
        ]}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Neue Lehrperson anlegen</h2>
          <CreateTeacherForm />
        </section>

        <section className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
          <div className="border-b border-zinc-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-100">Alle Lehrpersonen</h2>
          </div>
          <table className="min-w-full divide-y divide-zinc-700">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">E-Mail</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Klassen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    Noch keine Lehrpersonen erfasst.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 font-medium text-zinc-100">
                      {teacher.lastName} {teacher.firstName}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{teacher.email}</td>
                    <td className="px-6 py-4 text-zinc-400">{teacher.classCount}</td>
                    <td className="px-6 py-4">
                      <UserActions
                        id={teacher.id}
                        type="teachers"
                        firstName={teacher.firstName}
                        lastName={teacher.lastName}
                        email={teacher.email}
                      />
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
