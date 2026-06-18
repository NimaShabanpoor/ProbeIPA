import { DEMO_PASSWORD } from "@/lib/demo";

interface DemoLogin {
  firstName: string;
  lastName: string;
  email: string;
  classes: string[];
}

interface DemoLoginsPanelProps {
  teachers: DemoLogin[];
  students: DemoLogin[];
}

export function DemoLoginsPanel({ teachers, students }: DemoLoginsPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold text-zinc-100">Demo-Zugänge</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Alle Demo-Benutzer verwenden das Passwort{" "}
        <span className="font-mono text-zinc-400">{DEMO_PASSWORD}</span>.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Klassenlehrpersonen
          </h3>
          {teachers.length === 0 ? (
            <p className="text-sm text-zinc-500">Keine Lehrpersonen vorhanden.</p>
          ) : (
            <ul className="space-y-3">
              {teachers.map((teacher) => (
                <li
                  key={teacher.email}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-zinc-100">
                    {teacher.lastName} {teacher.firstName}
                  </p>
                  <p className="mt-1 font-mono text-zinc-400">{teacher.email}</p>
                  <p className="mt-1 text-zinc-500">
                    Passwort: <span className="font-mono text-zinc-400">{DEMO_PASSWORD}</span>
                  </p>
                  {teacher.classes.length > 0 && (
                    <p className="mt-1 text-zinc-500">
                      Klasse: {teacher.classes.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Schüler
          </h3>
          {students.length === 0 ? (
            <p className="text-sm text-zinc-500">Keine Schüler vorhanden.</p>
          ) : (
            <ul className="space-y-3">
              {students.map((student) => (
                <li
                  key={student.email}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-zinc-100">
                    {student.lastName} {student.firstName}
                  </p>
                  <p className="mt-1 font-mono text-zinc-400">{student.email}</p>
                  <p className="mt-1 text-zinc-500">
                    Passwort: <span className="font-mono text-zinc-400">{DEMO_PASSWORD}</span>
                  </p>
                  {student.classes.length > 0 && (
                    <p className="mt-1 text-zinc-500">
                      Klasse: {student.classes.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
