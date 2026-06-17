import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export async function GET() {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const teachers = await prisma.user.findMany({
    where: { role: Role.TEACHER },
    include: {
      _count: { select: { classes: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

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

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "E-Mail wird bereits verwendet" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  const teacher = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: Role.TEACHER,
    },
  });

  return NextResponse.json(
    {
      teacher: {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
      },
    },
    { status: 201 }
  );
}
