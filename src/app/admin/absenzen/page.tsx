import { redirect } from "next/navigation";
import { AbsenceReviewRow } from "@/components/admin/AbsenceReviewRow";
import { Header } from "@/components/Header";
import { requireRole } from "@/lib/auth";
import { getAdminAbsences } from "@/lib/db";
import { Role } from "@/lib/types";

const adminNav = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/absenzen", label: "Absenzen" },
  { href: "/admin/lehrer", label: "Lehrpersonen" },
  { href: "/admin/schueler", label: "Schüler" },
  { href: "/admin/klassen", label: "Klassen" },
];

// Admin: offene Absenzen prüfen und als entschuldigt/unentschuldigt einstufen
export default async function AdminAbsencesPage() {
  const session = await requireRole(Role.ADMIN);
  if (!session) redirect("/");

  const absences = getAdminAbsences();
  const pendingCount = absences.filter((a) => a.status === "ABSENT").length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        title="Absenzen"
        subtitle="Abwesenheiten prüfen und einstufen"
        userName={`${session.firstName} ${session.lastName}`}
        nav={adminNav}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {pendingCount > 0 && (
          <p className="rounded-xl border border-amber-800 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
            {pendingCount} offene {pendingCount === 1 ? "Absenz" : "Absenzen"} warten auf Ihre Einstufung.
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
          <div className="border-b border-zinc-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-100">Alle Abwesenheiten</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Von Lehrpersonen als «Nicht anwesend» erfasst — hier als entschuldigt oder unentschuldigt einstufen (nur Admin).
            </p>
          </div>
          <table className="min-w-full divide-y divide-zinc-700">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Datum</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Schüler/in</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Klasse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Einstufung</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {absences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Keine Abwesenheiten erfasst.
                  </td>
                </tr>
              ) : (
                absences.map((absence) => <AbsenceReviewRow key={absence.id} absence={absence} />)
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
