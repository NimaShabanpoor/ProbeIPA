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

  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    include: {
      classMemberships: { include: { class: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return NextResponse.json({ students });
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
  const student = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: Role.STUDENT,
      ...(classId
        ? { classMemberships: { create: { classId } } }
        : {}),
    },
  });

  return NextResponse.json(
    {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
    },
    { status: 201 }
  );
}
