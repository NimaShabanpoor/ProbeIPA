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
    ABSENT: "Abwesend",
    EXCUSED: "Entschuldigt",
    LATE: "Verspätet",
    CLOSED: "Abgeschlossen",
  };
  return labels[status] ?? status;
}

export function absenceStatusColor(status: string) {
  const colors: Record<string, string> = {
    PRESENT: "bg-emerald-100 text-emerald-800",
    ABSENT: "bg-red-100 text-red-800",
    EXCUSED: "bg-amber-100 text-amber-800",
    LATE: "bg-orange-100 text-orange-800",
    CLOSED: "bg-slate-200 text-slate-700",
  };
  return colors[status] ?? "bg-slate-100 text-slate-800";
}
