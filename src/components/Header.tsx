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
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Absenzenverwaltung</p>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
          <span className="text-sm text-slate-600">{userName}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
