"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/", label: "Entries" },
  { href: "/actions", label: "All Actions" },
  { href: "/stats", label: "Progress" },
  { href: "/discover", label: "Discover" },
  { href: "/activity", label: "Activity" },
  { href: "/demo", label: "Public Demo" },
];

export function Sidebar({
  userEmail,
  streak,
}: {
  userEmail: string | null;
  streak: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const streakBadge =
    userEmail && streak > 0 ? (
      <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-gold-soft px-3 py-2 text-sm font-semibold text-gold">
        <span>🔥</span>
        <span>
          {streak}-day streak
        </span>
      </div>
    ) : null;

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-white"
                : "text-forest-ink/80 hover:bg-forest-soft hover:text-forest-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const account = userEmail ? (
    <div className="space-y-2">
      <p className="truncate text-xs text-forest-ink/60">{userEmail}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-lg border border-forest-ink/20 px-3 py-2.5 text-left text-sm font-medium text-forest-ink hover:bg-forest-soft"
        >
          Log out
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      onClick={() => setOpen(false)}
      className="block rounded-lg bg-gold px-3 py-2.5 text-center text-sm font-semibold text-forest hover:brightness-95"
    >
      Log in
    </Link>
  );

  return (
    <>
      <header className="flex items-center justify-between bg-forest px-4 py-3 md:hidden">
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-tight text-forest-ink"
        >
          ReadAct
        </Link>
        <div className="flex items-center gap-2">
          {userEmail && streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold">
              🔥 {streak}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg border border-forest-ink/20 p-2.5 text-forest-ink"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 4.5h14M2 9h14M2 13.5h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>
      {open && (
        <div className="space-y-3 bg-forest px-4 py-3 md:hidden">
          {navLinks}
          {account}
        </div>
      )}
      <aside className="hidden w-60 shrink-0 flex-col justify-between bg-forest p-5 md:flex">
        <div>
          <Link
            href="/"
            className="mb-6 block font-serif text-xl font-bold tracking-tight text-forest-ink"
          >
            ReadAct
          </Link>
          {streakBadge}
          {navLinks}
        </div>
        {account}
      </aside>
    </>
  );
}
