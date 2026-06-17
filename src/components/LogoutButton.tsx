"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
    >
      Abmelden
    </button>
  );
}
