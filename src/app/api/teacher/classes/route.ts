import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getTeacherClasses } from "@/lib/db";
import { Role } from "@/lib/types";

export async function GET() {
  const session = await requireRole(Role.TEACHER);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const classes = getTeacherClasses(session.id).map((c) => ({
    ...c,
    _count: { students: c.studentCount },
  }));

  return NextResponse.json({ classes });
}
