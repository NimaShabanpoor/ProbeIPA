import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, AbsenceStatus, Role } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.absence.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("demo123", 10);

  await prisma.user.create({
    data: {
      email: "admin@schule.ch",
      password,
      firstName: "Thomas",
      lastName: "Admin",
      role: Role.ADMIN,
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      email: "mueller@schule.ch",
      password,
      firstName: "Anna",
      lastName: "Müller",
      role: Role.TEACHER,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: "meier@schule.ch",
      password,
      firstName: "Peter",
      lastName: "Meier",
      role: Role.TEACHER,
    },
  });

  const students = await Promise.all(
    [
      { firstName: "Lukas", lastName: "Meier", email: "lukas@schule.ch" },
      { firstName: "Sara", lastName: "Keller", email: "sara@schule.ch" },
      { firstName: "Noah", lastName: "Brunner", email: "noah@schule.ch" },
      { firstName: "Emma", lastName: "Fischer", email: "emma@schule.ch" },
      { firstName: "Lea", lastName: "Widmer", email: "lea@schule.ch" },
    ].map((s) =>
      prisma.user.create({
        data: { ...s, password, role: Role.STUDENT },
      })
    )
  );

  const classA = await prisma.class.create({
    data: {
      name: "3a Mathematik",
      teacherId: teacher1.id,
      students: {
        create: students.slice(0, 3).map((s) => ({ studentId: s.id })),
      },
    },
  });

  const classB = await prisma.class.create({
    data: {
      name: "3b Deutsch",
      teacherId: teacher2.id,
      students: {
        create: students.slice(2, 5).map((s) => ({ studentId: s.id })),
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.absence.createMany({
    data: [
      {
        classId: classA.id,
        studentId: students[0].id,
        date: yesterday,
        status: AbsenceStatus.ABSENT,
      },
      {
        classId: classA.id,
        studentId: students[1].id,
        date: yesterday,
        status: AbsenceStatus.EXCUSED,
        note: "Arzttermin",
      },
      {
        classId: classA.id,
        studentId: students[2].id,
        date: today,
        status: AbsenceStatus.LATE,
      },
      {
        classId: classB.id,
        studentId: students[4].id,
        date: today,
        status: AbsenceStatus.ABSENT,
      },
    ],
  });

  console.log("Demo-Daten erstellt:");
  console.log("Admin: admin@schule.ch / demo123");
  console.log("Lehrer 1: mueller@schule.ch / demo123");
  console.log("Lehrer 2: meier@schule.ch / demo123");
  console.log("Schüler: lukas@schule.ch, sara@schule.ch, ... / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
