// PATCH /api/admin/classes/[id] — Lehrperson einer Klasse zuweisen
// DELETE — Klasse löschen

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { deleteClass, getClassById, getUserById, updateClassTeacher } from "@/lib/db";
import { Role } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const { teacherId } = await request.json();

  if (!getClassById(id)) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  if (!teacherId || !getUserById(teacherId, Role.TEACHER)) {
    return NextResponse.json({ error: "Lehrperson nicht gefunden" }, { status: 404 });
  }

  const updated = updateClassTeacher(id, teacherId);
  return NextResponse.json({ class: updated });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  deleteClass(id);
  return NextResponse.json({ success: true });
}
