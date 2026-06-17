import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getStudentMemberships, getStudentAbsences, getStudentAbsenceStats } from "@/lib/db";
import { Role } from "@/lib/types";

export async function GET() {
  const session = await requireRole(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const memberships = getStudentMemberships(session.id).map((m) => ({
    id: m.id,
    class: {
      id: m.classId,
      name: m.className,
      teacher: { firstName: m.teacherFirstName, lastName: m.teacherLastName },
    },
  }));

  const absences = getStudentAbsences(session.id, 50).map((a) => ({
    ...a,
    class: { name: a.className },
  }));

  const stats = getStudentAbsenceStats(session.id).map((s) => ({
    status: s.status,
    _count: s.count,
  }));

  return NextResponse.json({ memberships, absences, stats });
}
