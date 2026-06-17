import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "E-Mail, Passwort und Rolle sind erforderlich" },
        { status: 400 }
      );
    }

    if (role !== Role.ADMIN && role !== Role.TEACHER && role !== Role.STUDENT) {
      return NextResponse.json({ error: "Ungültige Rolle" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.role !== role) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    await createSession({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Anmeldung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
