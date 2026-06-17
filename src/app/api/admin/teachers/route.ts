import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { createUser, getTeachers, getUserByEmail } from "@/lib/db";
import { Role } from "@/lib/types";

export async function GET() {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const teachers = getTeachers().map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    _count: { classes: t.classCount },
  }));

  return NextResponse.json({ teachers });
}

export async function POST(request: NextRequest) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { firstName, lastName, email, password } = await request.json();

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
    return NextResponse.json(
      { error: "Vorname, Nachname, E-Mail und Passwort sind erforderlich" },
      { status: 400 }
    );
  }

  if (getUserByEmail(email)) {
    return NextResponse.json({ error: "E-Mail wird bereits verwendet" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const teacher = createUser({
    firstName,
    lastName,
    email,
    password: hashed,
    role: Role.TEACHER,
  });

  return NextResponse.json({ teacher }, { status: 201 });
}
