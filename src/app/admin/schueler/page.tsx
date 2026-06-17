import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CreateStudentForm } from "@/components/admin/CreateStudentForm";
import { UserActions } from "@/components/admin/UserActions";
import { StudentClassManager } from "@/components/admin/StudentClassManager";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export default async function AdminStudentsPage() {
  const session = await requireRole(Role.ADMIN);
  if (!session) redirect("/login/admin");

  const [students, classes] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      include: { classMemberships: { include: { class: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Schülerverwaltung"
        subtitle="Schüler anlegen und Klassen zuweisen"
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
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Neuen Schüler anlegen</h2>
          <CreateStudentForm classes={classes} />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Alle Schüler</h2>
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Noch keine Schüler erfasst.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="align-top">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {student.lastName} {student.firstName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.email}</td>
                    <td className="px-6 py-4">
                      <StudentClassManager
                        studentId={student.id}
                        assignedClasses={student.classMemberships.map((m) => ({
                          id: m.class.id,
                          name: m.class.name,
                        }))}
                        allClasses={classes}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <UserActions
                        id={student.id}
                        type="students"
                        firstName={student.firstName}
                        lastName={student.lastName}
                        email={student.email}
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
