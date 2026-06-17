import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export async function GET() {
  const session = await requireRole(Role.TEACHER);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    where: { teacherId: session.id },
    include: {
      _count: { select: { students: true, absences: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ classes });
}
