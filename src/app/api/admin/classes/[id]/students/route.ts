import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { studentId } = await request.json();

  const classData = await prisma.class.findUnique({ where: { id } });
  if (!classData) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  const student = await prisma.user.findFirst({
    where: { id: studentId, role: Role.STUDENT },
  });
  if (!student) {
    return NextResponse.json({ error: "Schüler nicht gefunden" }, { status: 404 });
  }

  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: id, studentId } },
    create: { classId: id, studentId },
    update: {},
  });

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

  const membership = await prisma.classStudent.findUnique({
    where: { classId_studentId: { classId: id, studentId } },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "Schüler ist dieser Klasse nicht zugewiesen" },
      { status: 404 }
    );
  }

  await prisma.classStudent.delete({
    where: { classId_studentId: { classId: id, studentId } },
  });

  return NextResponse.json({ success: true });
}
