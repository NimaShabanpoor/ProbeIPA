import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AbsenceStatus, Role } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.TEACHER);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const classData = await prisma.class.findFirst({
    where: { id, teacherId: session.id },
    include: {
      students: {
        include: {
          student: true,
        },
        orderBy: {
          student: { lastName: "asc" },
        },
      },
    },
  });

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

  const classData = await prisma.class.findFirst({
    where: { id, teacherId: session.id },
  });
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
    where: {
      classId_studentId: { classId: id, studentId },
    },
    create: { classId: id, studentId },
    update: {},
  });

  return NextResponse.json({ success: true });
}
