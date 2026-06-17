import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { assignStudentToClass, getClassForTeacher, getUserById } from "@/lib/db";
import { Role } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.TEACHER);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const classData = getClassForTeacher(id, session.id);
  if (!classData) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({ class: classData });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.TEACHER);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { studentId } = await request.json();

  if (!getClassForTeacher(id, session.id)) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  if (!getUserById(studentId, Role.STUDENT)) {
    return NextResponse.json({ error: "Schüler nicht gefunden" }, { status: 404 });
  }

  assignStudentToClass(id, studentId);
  return NextResponse.json({ success: true });
}
