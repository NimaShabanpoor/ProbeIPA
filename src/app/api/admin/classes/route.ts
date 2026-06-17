import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export async function GET() {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    include: {
      teacher: true,
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ classes });
}

export async function POST(request: NextRequest) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { name, teacherId } = await request.json();

  if (!name?.trim() || !teacherId) {
    return NextResponse.json(
      { error: "Klassenname und Lehrperson sind erforderlich" },
      { status: 400 }
    );
  }

  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: Role.TEACHER },
  });
  if (!teacher) {
    return NextResponse.json(
      { error: "Lehrperson nicht gefunden" },
      { status: 404 }
    );
  }

  const newClass = await prisma.class.create({
    data: {
      name: name.trim(),
      teacherId,
    },
    include: { teacher: true },
  });

  return NextResponse.json({ class: newClass }, { status: 201 });
}
