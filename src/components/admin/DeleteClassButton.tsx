"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteClassButtonProps {
  classId: string;
  className: string;
}

export function DeleteClassButton({ classId, className }: DeleteClassButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (
      !confirm(
        `Klasse „${className}" wirklich löschen? Schülerzuweisungen und Absenzen dieser Klasse werden entfernt.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/classes/${classId}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Löschen fehlgeschlagen");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        className="rounded-lg border border-red-800 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-950 disabled:opacity-60"
      >
        {loading ? "Wird gelöscht..." : "Klasse löschen"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
