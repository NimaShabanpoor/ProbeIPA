import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAbsenceById, updateAbsenceByAdmin } from "@/lib/db";
import { AbsenceReason, AbsenceStatus, Role } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireRole(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await context.params;
  const absence = getAbsenceById(id);
  if (!absence) {
    return NextResponse.json({ error: "Absenz nicht gefunden" }, { status: 404 });
  }

  const { classification, reason } = await request.json();
  const validClassifications = [AbsenceStatus.EXCUSED, AbsenceStatus.UNEXCUSED];

  if (!validClassifications.includes(classification)) {
    return NextResponse.json({ error: "Ungültige Einstufung" }, { status: 400 });
  }

  if (classification === AbsenceStatus.UNEXCUSED) {
    const validReasons = Object.values(AbsenceReason);
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json({ error: "Bitte einen gültigen Grund wählen" }, { status: 400 });
    }
  }

  const updated = updateAbsenceByAdmin(
    id,
    classification,
    classification === AbsenceStatus.UNEXCUSED ? reason : null
  );

  return NextResponse.json({ absence: updated });
}
