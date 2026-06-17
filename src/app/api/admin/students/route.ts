import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { createUser, getStudents, getUserByEmail } from "@/lib/db";
import { Role } from "@/lib/types";

export async function GET() {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  return NextResponse.json({ students: getStudents() });
}

export async function POST(request: NextRequest) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { firstName, lastName, email, password, classId } = await request.json();

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
  const student = createUser({
    firstName,
    lastName,
    email,
    password: hashed,
    role: Role.STUDENT,
    classId,
  });

  return NextResponse.json({ student }, { status: 201 });
}
