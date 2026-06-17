import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { deleteClass } from "@/lib/db";
import { Role } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  deleteClass(id);
  return NextResponse.json({ success: true });
}
