import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export async function GET() {
  const session = await requireRole(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const [memberships, absences, stats] = await Promise.all([
    prisma.classStudent.findMany({
      where: { studentId: session.id },
      include: { class: { include: { teacher: true } } },
    }),
    prisma.absence.findMany({
      where: {
        studentId: session.id,
        status: { not: "PRESENT" },
      },
      include: { class: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.absence.groupBy({
      by: ["status"],
      where: { studentId: session.id },
      _count: true,
    }),
  ]);

  return NextResponse.json({ memberships, absences, stats });
}
