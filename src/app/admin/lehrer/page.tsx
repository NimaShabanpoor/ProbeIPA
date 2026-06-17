import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CreateTeacherForm } from "@/components/admin/CreateTeacherForm";
import { UserActions } from "@/components/admin/UserActions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export default async function AdminTeachersPage() {
  const session = await requireRole(Role.ADMIN);
  if (!session) redirect("/login/admin");

  const teachers = await prisma.user.findMany({
    where: { role: Role.TEACHER },
    include: { _count: { select: { classes: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="min-h-screen bg-slate-50">
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
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Neue Lehrperson anlegen
          </h2>
          <CreateTeacherForm />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Alle Lehrpersonen</h2>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Klassen
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Noch keine Lehrpersonen erfasst.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {teacher.lastName} {teacher.firstName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{teacher.email}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {teacher._count.classes}
                    </td>
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
