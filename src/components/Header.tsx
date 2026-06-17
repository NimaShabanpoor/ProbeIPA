import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  nav?: { href: string; label: string }[];
}

export function Header({ title, subtitle, userName, nav = [] }: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">Absenzenverwaltung</p>
          <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
          <span className="text-sm text-zinc-500">{userName}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
