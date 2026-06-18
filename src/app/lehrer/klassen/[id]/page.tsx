import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { AbsenceTable } from "@/components/teacher/AbsenceTable";
import { requireRole } from "@/lib/auth";
import { getClassForTeacher } from "@/lib/db";
import { formatDateInput } from "@/lib/utils";
import { Role } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function ClassDetailPage({ params, searchParams }: PageProps) {
  const session = await requireRole(Role.TEACHER);
  if (!session) redirect("/");

  const { id } = await params;
  const { date: dateParam } = await searchParams;

  const date = dateParam ? new Date(dateParam) : new Date();
  date.setHours(0, 0, 0, 0);

  const classData = getClassForTeacher(id, session.id, date);
  if (!classData) redirect("/lehrer");

  const students = classData.students.map((entry) => ({
    id: entry.student.id,
    firstName: entry.student.firstName,
    lastName: entry.student.lastName,
    absences: entry.student.absences,
  }));

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title={classData.name}
        subtitle="Anwesenheit erfassen"
        userName={`${session.firstName} ${session.lastName}`}
        nav={[{ href: "/lehrer", label: "Klassen" }]}
      />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Link href="/lehrer" className="text-sm font-medium text-zinc-400 hover:text-zinc-200">
          ← Zurück zu Klassen
        </Link>

        <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
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
