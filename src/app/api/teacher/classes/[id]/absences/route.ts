import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AbsenceStatus, Role } from "@/generated/prisma/client";

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

  const classData = await prisma.class.findFirst({
    where: { id, teacherId: session.id },
  });
  if (!classData) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  const absenceDate = new Date(date);
  absenceDate.setHours(0, 0, 0, 0);

  const validStatuses = Object.values(AbsenceStatus);
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const absence = await prisma.absence.upsert({
    where: {
      classId_studentId_date: {
        classId: id,
        studentId,
        date: absenceDate,
      },
    },
    create: {
      classId: id,
      studentId,
      date: absenceDate,
      status,
      note: note?.trim() || null,
    },
    update: {
      status,
      note: note?.trim() || null,
    },
  });

  return NextResponse.json({ absence });
}
