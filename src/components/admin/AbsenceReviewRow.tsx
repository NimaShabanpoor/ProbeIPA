"use client";

// Admin-UI: Absenz als Entschuldigt (mit Dropdown-Grund) oder Unentschuldigt einstufen

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AbsenceReason, AbsenceStatus } from "@/lib/types";
import { absenceReasonLabel, absenceStatusLabel } from "@/lib/utils";

interface AbsenceReviewRowProps {
  absence: {
    id: string;
    date: string;
    status: string;
    note: string | null;
    studentFirstName: string;
    studentLastName: string;
    className: string;
  };
}

const reasonOptions = [
  { value: AbsenceReason.ARZTZEUGNIS, label: "Arztzeugnis" },
  { value: AbsenceReason.TERMIN, label: "Termin" },
] as const;

export function AbsenceReviewRow({ absence }: AbsenceReviewRowProps) {
  const router = useRouter();
  const initialClassification =
    absence.status === AbsenceStatus.EXCUSED
      ? AbsenceStatus.EXCUSED
      : absence.status === AbsenceStatus.UNEXCUSED
        ? AbsenceStatus.UNEXCUSED
        : "";

  const [classification, setClassification] = useState(initialClassification);
  const [reason, setReason] = useState(
    absence.status === AbsenceStatus.EXCUSED ? absence.note ?? "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");

    if (!classification) {
      setError("Bitte Entschuldigt oder Unentschuldigt wählen.");
      return;
    }

    if (classification === AbsenceStatus.EXCUSED && !reason) {
      setError("Bitte einen Grund auswählen.");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/admin/absences/${absence.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classification,
        reason: classification === AbsenceStatus.EXCUSED ? reason : null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Speichern fehlgeschlagen");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  const isPending = absence.status === AbsenceStatus.ABSENT;

  return (
    <tr className={isPending ? "bg-amber-950/20" : undefined}>
      <td className="px-6 py-4 text-zinc-200">
        {new Intl.DateTimeFormat("de-CH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(absence.date))}
      </td>
      <td className="px-6 py-4 font-medium text-zinc-100">
        {absence.studentLastName} {absence.studentFirstName}
      </td>
      <td className="px-6 py-4 text-zinc-400">{absence.className}</td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setClassification(AbsenceStatus.EXCUSED)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              classification === AbsenceStatus.EXCUSED
                ? "bg-amber-600 text-white"
                : "border border-zinc-600 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Entschuldigt
          </button>
          <button
            type="button"
            onClick={() => {
              setClassification(AbsenceStatus.UNEXCUSED);
              setReason("");
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              classification === AbsenceStatus.UNEXCUSED
                ? "bg-red-600 text-white"
                : "border border-zinc-600 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Unentschuldigt
          </button>
        </div>

        {classification === AbsenceStatus.EXCUSED && (
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-3 w-full max-w-xs rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          >
            <option value="">Grund wählen…</option>
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="px-6 py-4">
        {!isPending && absence.status !== AbsenceStatus.ABSENT ? (
          <p className="mb-2 text-sm text-zinc-400">
            {absenceStatusLabel(absence.status)}
            {absence.status === AbsenceStatus.EXCUSED && absence.note
              ? ` · ${absenceReasonLabel(absence.note)}`
              : ""}
          </p>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className="rounded-lg bg-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
        >
          {loading ? "..." : "Speichern"}
        </button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </td>
    </tr>
  );
}
