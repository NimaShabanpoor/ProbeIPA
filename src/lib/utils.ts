export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateInput(date: Date | string) {
  return new Date(date).toISOString().split("T")[0];
}

export function absenceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PRESENT: "Anwesend",
    ABSENT: "Abwesend (offen)",
    EXCUSED: "Entschuldigt",
    UNEXCUSED: "Unentschuldigt",
    LATE: "Verspätet",
    CLOSED: "Abgeschlossen",
  };
  return labels[status] ?? status;
}

export function absenceReasonLabel(reason: string | null | undefined) {
  const labels: Record<string, string> = {
    ARZTZEUGNIS: "Arztzeugnis",
    TERMIN: "Termin",
    VERSPAETET: "Verspätet",
  };
  return reason ? labels[reason] ?? reason : "";
}

export function absenceStatusColor(status: string) {
  const colors: Record<string, string> = {
    PRESENT: "bg-emerald-900/50 text-emerald-300 border border-emerald-800",
    ABSENT: "bg-orange-900/50 text-orange-300 border border-orange-800",
    UNEXCUSED: "bg-red-900/50 text-red-300 border border-red-800",
    EXCUSED: "bg-amber-900/50 text-amber-300 border border-amber-800",
    LATE: "bg-orange-900/50 text-orange-300 border border-orange-800",
    CLOSED: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  };
  return colors[status] ?? "bg-zinc-800 text-zinc-400";
}
