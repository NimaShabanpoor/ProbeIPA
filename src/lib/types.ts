export const Role = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const AbsenceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  EXCUSED: "EXCUSED",
  LATE: "LATE",
  CLOSED: "CLOSED",
} as const;

export type AbsenceStatus = (typeof AbsenceStatus)[keyof typeof AbsenceStatus];

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}
