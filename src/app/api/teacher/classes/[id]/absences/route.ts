import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import {
  getAbsenceForStudent,
  getClassForTeacher,
  isStudentInClass,
  upsertAbsence,
} from "@/lib/db";
import { AbsenceStatus, Role } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.TEACHER);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const dateParam = request.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();
  date.setHours(0, 0, 0, 0);

  const classData = getClassForTeacher(id, session.id, date);
  if (!classData) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({ class: classData, date: date.toISOString() });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.TEACHER);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { studentId, date, status, note } = await request.json();
  const absenceDate = new Date(date);
  absenceDate.setHours(0, 0, 0, 0);

  if (!getClassForTeacher(id, session.id)) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  if (!isStudentInClass(id, studentId)) {
    return NextResponse.json({ error: "Schüler gehört nicht zu dieser Klasse" }, { status: 400 });
  }

  const existing = getAbsenceForStudent(id, studentId, absenceDate);
  if (
    existing &&
    (existing.status === AbsenceStatus.EXCUSED || existing.status === AbsenceStatus.UNEXCUSED)
  ) {
    return NextResponse.json(
      { error: "Diese Absenz wurde bereits vom Admin eingestuft" },
      { status: 403 }
    );
  }

  const validStatuses = [AbsenceStatus.PRESENT, AbsenceStatus.ABSENT];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const absence = upsertAbsence({
    classId: id,
    studentId,
    date: absenceDate,
    status,
    note: note?.trim() || null,
  });

  return NextResponse.json({ absence });
}
