import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CreateClassForm } from "@/components/admin/CreateClassForm";
import { AssignStudentForm } from "@/components/admin/AssignStudentForm";
import { ClassStudentList } from "@/components/admin/ClassStudentList";
import { DeleteClassButton } from "@/components/admin/DeleteClassButton";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export default async function AdminClassesPage() {
  const session = await requireRole(Role.ADMIN);
  if (!session) redirect("/login/admin");

  const [classes, teachers, students] = await Promise.all([
    prisma.class.findMany({
      include: {
        teacher: true,
        students: { include: { student: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: Role.TEACHER },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Klassenverwaltung"
        subtitle="Klassen erstellen und Schüler zuweisen"
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
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Neue Klasse erstellen</h2>
          <CreateClassForm teachers={teachers} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Alle Klassen</h2>
          {classes.length === 0 ? (
            <p className="text-slate-500">Noch keine Klassen vorhanden.</p>
          ) : (
            classes.map((cls) => {
              const assignedIds = new Set(cls.students.map((s) => s.studentId));
              const unassigned = students.filter((s) => !assignedIds.has(s.id));

              return (
                <div
                  key={cls.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{cls.name}</h3>
                      <p className="text-sm text-slate-500">
                        Lehrperson: {cls.teacher.lastName} {cls.teacher.firstName} ·{" "}
                        {cls._count.students} Schüler
                      </p>
                    </div>
                    <DeleteClassButton classId={cls.id} className={cls.name} />
                  </div>

                  <ClassStudentList
                    classId={cls.id}
                    students={cls.students.map((entry) => ({
                      membershipId: entry.id,
                      studentId: entry.studentId,
                      firstName: entry.student.firstName,
                      lastName: entry.student.lastName,
                    }))}
                  />

                  <AssignStudentForm classId={cls.id} students={unassigned} />
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
