import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { AbsenceTable } from "@/components/teacher/AbsenceTable";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateInput } from "@/lib/utils";
import { Role } from "@/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function ClassDetailPage({ params, searchParams }: PageProps) {
  const session = await requireRole(Role.TEACHER);
  if (!session) redirect("/login/lehrer");

  const { id } = await params;
  const { date: dateParam } = await searchParams;

  const date = dateParam ? new Date(dateParam) : new Date();
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const classData = await prisma.class.findFirst({
    where: { id, teacherId: session.id },
    include: {
      students: {
        include: {
          student: {
            include: {
              absences: {
                where: {
                  classId: id,
                  date: { gte: date, lt: nextDay },
                },
              },
            },
          },
        },
        orderBy: { student: { lastName: "asc" } },
      },
    },
  });

  if (!classData) redirect("/lehrer");

  const students = classData.students.map((entry) => ({
    id: entry.student.id,
    firstName: entry.student.firstName,
    lastName: entry.student.lastName,
    absences: entry.student.absences,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={classData.name}
        subtitle="Tägliche Absenzen erfassen"
        userName={`${session.firstName} ${session.lastName}`}
        nav={[{ href: "/lehrer", label: "Übersicht" }]}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Link href="/lehrer" className="text-sm font-medium text-blue-600 hover:underline">
          ← Zurück zur Übersicht
        </Link>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <AbsenceTable
            classId={classData.id}
            students={students}
            initialDate={formatDateInput(date)}
          />
        </section>
      </main>
    </div>
  );
}
