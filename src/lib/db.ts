// Datenbank-Schicht: SQLite-Verbindung, Schema, Seed-Daten und alle SQL-Abfragen.
// Wird beim ersten Zugriff initialisiert (Singleton über getDb).

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { DEMO_PASSWORD } from "./demo";
import { AbsenceStatus, Role, type User } from "./types";

let db: Database.Database | null = null;

// Öffnet die DB einmalig; Pfad kommt aus DATABASE_PATH oder ./data/app.db
function getDb() {
  if (!db) {
    const dbPath =
      process.env.DATABASE_PATH || path.join(process.cwd(), "data", "app.db");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma("foreign_keys = ON");
    initSchema();
    seedIfEmpty();
  }
  return db;
}

// Tabellen: User, Class, ClassStudent (n:m), Absence (pro Schüler/Klasse/Tag eindeutig)
function initSchema() {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Class (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      teacherId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS ClassStudent (
      id TEXT PRIMARY KEY,
      classId TEXT NOT NULL REFERENCES Class(id) ON DELETE CASCADE,
      studentId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE(classId, studentId)
    );
    CREATE TABLE IF NOT EXISTS Absence (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      classId TEXT NOT NULL REFERENCES Class(id) ON DELETE CASCADE,
      studentId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE(classId, studentId, date)
    );
  `);
}

// Demo-Daten nur wenn die DB leer ist: 1 Admin, 2 Lehrer, 10 Schüler, 2 Klassen
function seedIfEmpty() {
  const database = getDb();
  const count = database.prepare("SELECT COUNT(*) as c FROM User").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const password = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const adminId = randomUUID();
  const teacher1Id = randomUUID();
  const teacher2Id = randomUUID();
  const studentIds = Array.from({ length: 10 }, () => randomUUID());
  const classAId = randomUUID();
  const classBId = randomUUID();

  const insertUser = database.prepare(
    "INSERT INTO User (id, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertClass = database.prepare(
    "INSERT INTO Class (id, name, teacherId) VALUES (?, ?, ?)"
  );
  const insertMember = database.prepare(
    "INSERT INTO ClassStudent (id, classId, studentId) VALUES (?, ?, ?)"
  );
  const insertAbsence = database.prepare(
    "INSERT INTO Absence (id, date, status, note, classId, studentId) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  database.transaction(() => {
    insertUser.run(adminId, "admin@schule.ch", password, "Thomas", "Admin", Role.ADMIN);
    insertUser.run(teacher1Id, "mueller@schule.ch", password, "Anna", "Müller", Role.TEACHER);
    insertUser.run(teacher2Id, "meier@schule.ch", password, "Peter", "Meier", Role.TEACHER);

    const students = [
      { id: studentIds[0], firstName: "Lukas", lastName: "Meier", email: "lukas@schule.ch" },
      { id: studentIds[1], firstName: "Sara", lastName: "Keller", email: "sara@schule.ch" },
      { id: studentIds[2], firstName: "Noah", lastName: "Brunner", email: "noah@schule.ch" },
      { id: studentIds[3], firstName: "Emma", lastName: "Fischer", email: "emma@schule.ch" },
      { id: studentIds[4], firstName: "Lea", lastName: "Widmer", email: "lea@schule.ch" },
      { id: studentIds[5], firstName: "Tim", lastName: "Stein", email: "tim@schule.ch" },
      { id: studentIds[6], firstName: "Mia", lastName: "Huber", email: "mia@schule.ch" },
      { id: studentIds[7], firstName: "Jan", lastName: "Roth", email: "jan@schule.ch" },
      { id: studentIds[8], firstName: "Lina", lastName: "Vogel", email: "lina@schule.ch" },
      { id: studentIds[9], firstName: "Elias", lastName: "Zürcher", email: "elias@schule.ch" },
    ];
    for (const s of students) {
      insertUser.run(s.id, s.email, password, s.firstName, s.lastName, Role.STUDENT);
    }

    insertClass.run(classAId, "3a Mathematik", teacher1Id);
    insertClass.run(classBId, "3b Deutsch", teacher2Id);

    for (const sid of studentIds.slice(0, 5)) {
      insertMember.run(randomUUID(), classAId, sid);
    }
    for (const sid of studentIds.slice(5, 10)) {
      insertMember.run(randomUUID(), classBId, sid);
    }

    insertAbsence.run(randomUUID(), fmt(yesterday), AbsenceStatus.ABSENT, null, classAId, studentIds[0]);
    insertAbsence.run(randomUUID(), fmt(yesterday), AbsenceStatus.EXCUSED, "TERMIN", classAId, studentIds[1]);
    insertAbsence.run(randomUUID(), fmt(today), AbsenceStatus.EXCUSED, "TERMIN", classAId, studentIds[2]);
    insertAbsence.run(randomUUID(), fmt(today), AbsenceStatus.UNEXCUSED, null, classAId, studentIds[3]);
    insertAbsence.run(randomUUID(), fmt(today), AbsenceStatus.ABSENT, null, classBId, studentIds[5]);
    insertAbsence.run(randomUUID(), fmt(yesterday), AbsenceStatus.EXCUSED, "ARZTZEUGNIS", classBId, studentIds[7]);
  })();
}

function toDateString(date: Date | string) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

// --- Benutzer ---

export function getUserByEmail(email: string): User | undefined {
  return getDb()
    .prepare("SELECT * FROM User WHERE email = ?")
    .get(email.toLowerCase().trim()) as User | undefined;
}

export function getUserById(id: string, role?: Role): User | undefined {
  if (role) {
    return getDb()
      .prepare("SELECT * FROM User WHERE id = ? AND role = ?")
      .get(id, role) as User | undefined;
  }
  return getDb().prepare("SELECT * FROM User WHERE id = ?").get(id) as User | undefined;
}

export function countUsersByRole(role: Role) {
  const row = getDb()
    .prepare("SELECT COUNT(*) as c FROM User WHERE role = ?")
    .get(role) as { c: number };
  return row.c;
}

export function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  classId?: string;
}) {
  const id = randomUUID();
  getDb()
    .prepare(
      "INSERT INTO User (id, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      data.email.toLowerCase().trim(),
      data.password,
      data.firstName.trim(),
      data.lastName.trim(),
      data.role
    );
  if (data.classId) {
    getDb()
      .prepare("INSERT OR IGNORE INTO ClassStudent (id, classId, studentId) VALUES (?, ?, ?)")
      .run(randomUUID(), data.classId, id);
  }
  return { id, email: data.email.toLowerCase().trim(), firstName: data.firstName.trim(), lastName: data.lastName.trim() };
}

export function updateUser(
  id: string,
  data: { firstName: string; lastName: string; email: string; password?: string }
) {
  if (data.password) {
    getDb()
      .prepare(
        "UPDATE User SET firstName = ?, lastName = ?, email = ?, password = ? WHERE id = ?"
      )
      .run(data.firstName, data.lastName, data.email, data.password, id);
  } else {
    getDb()
      .prepare("UPDATE User SET firstName = ?, lastName = ?, email = ? WHERE id = ?")
      .run(data.firstName, data.lastName, data.email, id);
  }
  return getUserById(id)!;
}

export function deleteUser(id: string) {
  getDb().prepare("DELETE FROM User WHERE id = ?").run(id);
}

export function getTeachers() {
  return getDb()
    .prepare(
      `SELECT u.*, (SELECT COUNT(*) FROM Class c WHERE c.teacherId = u.id) as classCount
       FROM User u WHERE u.role = ? ORDER BY u.lastName, u.firstName`
    )
    .all(Role.TEACHER) as (User & { classCount: number })[];
}

export function getStudents() {
  const students = getDb()
    .prepare("SELECT * FROM User WHERE role = ? ORDER BY lastName, firstName")
    .all(Role.STUDENT) as User[];

  const memberships = getDb()
    .prepare(
      `SELECT cs.studentId, cs.id as membershipId, c.id, c.name
       FROM ClassStudent cs JOIN Class c ON c.id = cs.classId`
    )
    .all() as { studentId: string; membershipId: string; id: string; name: string }[];

  return students.map((s) => ({
    ...s,
    classMemberships: memberships
      .filter((m) => m.studentId === s.id)
      .map((m) => ({ id: m.membershipId, class: { id: m.id, name: m.name } })),
  }));
}

export function countClasses() {
  const row = getDb().prepare("SELECT COUNT(*) as c FROM Class").get() as { c: number };
  return row.c;
}

// --- Klassen ---

export function getClasses() {
  return getDb()
    .prepare(
      `SELECT c.*, u.firstName as teacherFirstName, u.lastName as teacherLastName,
        (SELECT COUNT(*) FROM ClassStudent cs WHERE cs.classId = c.id) as studentCount
       FROM Class c JOIN User u ON u.id = c.teacherId ORDER BY c.name`
    )
    .all() as {
    id: string;
    name: string;
    teacherId: string;
    teacherFirstName: string;
    teacherLastName: string;
    studentCount: number;
  }[];
}

export function getClassesWithStudents() {
  const classes = getClasses();
  const members = getDb()
    .prepare(
      `SELECT cs.id as membershipId, cs.classId, cs.studentId,
        u.firstName, u.lastName FROM ClassStudent cs
       JOIN User u ON u.id = cs.studentId`
    )
    .all() as {
    membershipId: string;
    classId: string;
    studentId: string;
    firstName: string;
    lastName: string;
  }[];

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    teacher: {
      id: c.teacherId,
      firstName: c.teacherFirstName,
      lastName: c.teacherLastName,
    },
    _count: { students: c.studentCount },
    students: members
      .filter((m) => m.classId === c.id)
      .map((m) => ({
        id: m.membershipId,
        studentId: m.studentId,
        student: { firstName: m.firstName, lastName: m.lastName },
      })),
  }));
}

export function createClass(name: string, teacherId: string) {
  const id = randomUUID();
  getDb().prepare("INSERT INTO Class (id, name, teacherId) VALUES (?, ?, ?)").run(id, name, teacherId);
  const teacher = getUserById(teacherId, Role.TEACHER)!;
  return { id, name, teacherId, teacher: { id: teacher.id, firstName: teacher.firstName, lastName: teacher.lastName } };
}

export function getClassById(id: string) {
  return getDb()
    .prepare("SELECT * FROM Class WHERE id = ?")
    .get(id) as { id: string; name: string; teacherId: string } | undefined;
}

// Lehrperson einer Klasse zuweisen oder ändern (Admin)
export function updateClassTeacher(classId: string, teacherId: string) {
  getDb().prepare("UPDATE Class SET teacherId = ? WHERE id = ?").run(teacherId, classId);
  const cls = getClassById(classId)!;
  const teacher = getUserById(teacherId, Role.TEACHER)!;
  return {
    id: cls.id,
    name: cls.name,
    teacherId: teacher.id,
    teacher: { id: teacher.id, firstName: teacher.firstName, lastName: teacher.lastName },
  };
}

// Prüft ob Schüler in der Klasse ist (Sicherheit bei Absenzen-Erfassung)
export function isStudentInClass(classId: string, studentId: string) {
  const row = getDb()
    .prepare("SELECT 1 FROM ClassStudent WHERE classId = ? AND studentId = ?")
    .get(classId, studentId);
  return !!row;
}

export function deleteClass(id: string) {
  getDb().prepare("DELETE FROM Class WHERE id = ?").run(id);
}

export function assignStudentToClass(classId: string, studentId: string) {
  getDb()
    .prepare("INSERT OR IGNORE INTO ClassStudent (id, classId, studentId) VALUES (?, ?, ?)")
    .run(randomUUID(), classId, studentId);
}

export function removeStudentFromClass(classId: string, studentId: string) {
  getDb()
    .prepare("DELETE FROM ClassStudent WHERE classId = ? AND studentId = ?")
    .run(classId, studentId);
}

export function getTeacherClassCount(teacherId: string) {
  const row = getDb()
    .prepare("SELECT COUNT(*) as c FROM Class WHERE teacherId = ?")
    .get(teacherId) as { c: number };
  return row.c;
}

// Nur Klassen die dieser Lehrperson zugewiesen sind
export function getTeacherClasses(teacherId: string) {
  return getDb()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM ClassStudent cs WHERE cs.classId = c.id) as studentCount
       FROM Class c WHERE c.teacherId = ? ORDER BY c.name`
    )
    .all(teacherId) as { id: string; name: string; teacherId: string; studentCount: number }[];
}

export function countOpenAbsences(teacherId: string) {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as c FROM Absence a
       JOIN Class c ON c.id = a.classId
       WHERE c.teacherId = ? AND a.status IN ('ABSENT', 'LATE', 'EXCUSED')`
    )
    .get(teacherId) as { c: number };
  return row.c;
}

// Klasse nur wenn teacherId übereinstimmt — verhindert Zugriff auf fremde Klassen
export function getClassForTeacher(classId: string, teacherId: string, date?: Date) {
  const cls = getDb()
    .prepare("SELECT * FROM Class WHERE id = ? AND teacherId = ?")
    .get(classId, teacherId) as { id: string; name: string; teacherId: string } | undefined;
  if (!cls) return null;

  const students = getDb()
    .prepare(
      `SELECT u.id, u.firstName, u.lastName FROM ClassStudent cs
       JOIN User u ON u.id = cs.studentId
       WHERE cs.classId = ? ORDER BY u.lastName, u.firstName`
    )
    .all(classId) as { id: string; firstName: string; lastName: string }[];

  const dateStr = date ? toDateString(date) : null;
  const absences = dateStr
    ? (getDb()
        .prepare("SELECT * FROM Absence WHERE classId = ? AND date = ?")
        .all(classId, dateStr) as { studentId: string; status: string; note: string | null }[])
    : [];

  return {
    ...cls,
    students: students.map((s) => ({
      student: {
        ...s,
        absences: absences.filter((a) => a.studentId === s.id),
      },
    })),
  };
}

export function getAbsenceForStudent(classId: string, studentId: string, date: Date) {
  const dateStr = toDateString(date);
  return getDb()
    .prepare("SELECT id, status, note FROM Absence WHERE classId = ? AND studentId = ? AND date = ?")
    .get(classId, studentId, dateStr) as
    | { id: string; status: string; note: string | null }
    | undefined;
}

// Absenz anlegen oder aktualisieren (ein Eintrag pro Schüler/Klasse/Tag)
export function upsertAbsence(data: {
  classId: string;
  studentId: string;
  date: Date;
  status: string;
  note?: string | null;
}) {
  const dateStr = toDateString(data.date);
  const existing = getDb()
    .prepare("SELECT id FROM Absence WHERE classId = ? AND studentId = ? AND date = ?")
    .get(data.classId, data.studentId, dateStr) as { id: string } | undefined;

  if (existing) {
    getDb()
      .prepare("UPDATE Absence SET status = ?, note = ? WHERE id = ?")
      .run(data.status, data.note ?? null, existing.id);
    return { id: existing.id, ...data, date: dateStr };
  }

  const id = randomUUID();
  getDb()
    .prepare(
      "INSERT INTO Absence (id, date, status, note, classId, studentId) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(id, dateStr, data.status, data.note ?? null, data.classId, data.studentId);
  return { id, ...data, date: dateStr };
}

// --- Schüler-Dashboard ---

export function getStudentMemberships(studentId: string) {
  return getDb()
    .prepare(
      `SELECT cs.id, c.id as classId, c.name as className,
        t.firstName as teacherFirstName, t.lastName as teacherLastName
       FROM ClassStudent cs
       JOIN Class c ON c.id = cs.classId
       JOIN User t ON t.id = c.teacherId
       WHERE cs.studentId = ?`
    )
    .all(studentId) as {
    id: string;
    classId: string;
    className: string;
    teacherFirstName: string;
    teacherLastName: string;
  }[];
}

export function getStudentAbsences(studentId: string, limit = 30) {
  return getDb()
    .prepare(
      `SELECT a.*, c.name as className FROM Absence a
       JOIN Class c ON c.id = a.classId
       WHERE a.studentId = ? AND a.status != 'PRESENT'
       ORDER BY a.date DESC LIMIT ?`
    )
    .all(studentId, limit) as {
    id: string;
    date: string;
    status: string;
    note: string | null;
    className: string;
  }[];
}

// Alle offenen und eingestuften Absenzen für die Admin-Übersicht
export function getAdminAbsences() {
  return getDb()
    .prepare(
      `SELECT a.id, a.date, a.status, a.note,
        u.id as studentId, u.firstName as studentFirstName, u.lastName as studentLastName,
        c.name as className
       FROM Absence a
       JOIN User u ON u.id = a.studentId
       JOIN Class c ON c.id = a.classId
       WHERE a.status IN ('ABSENT', 'EXCUSED', 'UNEXCUSED')
       ORDER BY a.date DESC, u.lastName, u.firstName`
    )
    .all() as {
    id: string;
    date: string;
    status: string;
    note: string | null;
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    className: string;
  }[];
}

export function getAbsenceById(id: string) {
  return getDb()
    .prepare("SELECT * FROM Absence WHERE id = ?")
    .get(id) as
    | { id: string; date: string; status: string; note: string | null; classId: string; studentId: string }
    | undefined;
}

// Admin stuft Absenz als EXCUSED (mit Grund in note) oder UNEXCUSED ein
export function updateAbsenceByAdmin(id: string, status: string, note: string | null) {
  getDb().prepare("UPDATE Absence SET status = ?, note = ? WHERE id = ?").run(status, note, id);
  return getAbsenceById(id);
}

export function getStudentAbsenceStats(studentId: string) {
  return getDb()
    .prepare(
      "SELECT status, COUNT(*) as count FROM Absence WHERE studentId = ? GROUP BY status"
    )
    .all(studentId) as { status: string; count: number }[];
}
