import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { assignStudentToClass, removeStudentFromClass, getUserById } from "@/lib/db";
import { Role } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { studentId } = await request.json();

  if (!getUserById(studentId, Role.STUDENT)) {
    return NextResponse.json({ error: "Schüler nicht gefunden" }, { status: 404 });
  }

  assignStudentToClass(id, studentId);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { studentId } = await request.json();

  if (!studentId) {
    return NextResponse.json({ error: "Schüler-ID ist erforderlich" }, { status: 400 });
  }

  removeStudentFromClass(id, studentId);
  return NextResponse.json({ success: true });
}
