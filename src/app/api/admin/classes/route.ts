import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClass, getClasses, getUserById } from "@/lib/db";
import { Role } from "@/lib/types";

export async function GET() {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const classes = getClasses().map((c) => ({
    id: c.id,
    name: c.name,
    teacherId: c.teacherId,
    teacher: { id: c.teacherId, firstName: c.teacherFirstName, lastName: c.teacherLastName },
    _count: { students: c.studentCount },
  }));

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

  if (!getUserById(teacherId, Role.TEACHER)) {
    return NextResponse.json({ error: "Lehrperson nicht gefunden" }, { status: 404 });
  }

  const newClass = createClass(name.trim(), teacherId);
  return NextResponse.json({ class: newClass }, { status: 201 });
}
