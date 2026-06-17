import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;

  const classData = await prisma.class.findUnique({ where: { id } });
  if (!classData) {
    return NextResponse.json({ error: "Klasse nicht gefunden" }, { status: 404 });
  }

  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
