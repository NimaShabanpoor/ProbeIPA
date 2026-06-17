import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { getUserByEmail, getUserById, updateUser, deleteUser } from "@/lib/db";
import { Role } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { firstName, lastName, email, password } = await request.json();

  const student = getUserById(id, Role.STUDENT);
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
  if (normalizedEmail !== student.email && getUserByEmail(normalizedEmail)) {
    return NextResponse.json({ error: "E-Mail wird bereits verwendet" }, { status: 409 });
  }

  const updated = updateUser(id, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    ...(password?.trim() ? { password: await bcrypt.hash(password, 10) } : {}),
  });

  return NextResponse.json({
    student: { id: updated.id, firstName: updated.firstName, lastName: updated.lastName, email: updated.email },
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!getUserById(id, Role.STUDENT)) {
    return NextResponse.json({ error: "Schüler nicht gefunden" }, { status: 404 });
  }

  deleteUser(id);
  return NextResponse.json({ success: true });
}
