import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { firstName, lastName, email, password } = await request.json();

  const student = await prisma.user.findFirst({
    where: { id, role: Role.STUDENT },
  });
  if (!student) {
    return NextResponse.json({ error: "Schüler nicht gefunden" }, { status: 404 });
  }

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Vorname, Nachname und E-Mail sind erforderlich" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail !== student.email) {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "E-Mail wird bereits verwendet" },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      ...(password?.trim()
        ? { password: await bcrypt.hash(password, 10) }
        : {}),
    },
  });

  return NextResponse.json({
    student: {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
    },
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;

  const student = await prisma.user.findFirst({
    where: { id, role: Role.STUDENT },
  });
  if (!student) {
    return NextResponse.json({ error: "Schüler nicht gefunden" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
