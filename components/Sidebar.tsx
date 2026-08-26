"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/", label: "Entries" },
  { href: "/actions", label: "All Actions" },
  { href: "/demo", label: "Public Demo" },
];

export function Sidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
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
      <p className="truncate text-xs text-neutral-500">{userEmail}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-left text-sm font-medium hover:bg-neutral-100"
        >
          Log out
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      onClick={() => setOpen(false)}
      className="block rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
    >
      Log in
    </Link>
  );

  return (
    <>
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 md:hidden">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ReadAct
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-md border border-neutral-200 p-2"
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
      </header>
      {open && (
        <div className="space-y-3 border-b border-neutral-200 px-4 py-3 md:hidden">
          {navLinks}
          {account}
        </div>
      )}
      <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-neutral-200 p-4 md:flex">
        <div>
          <Link href="/" className="mb-6 block text-lg font-bold tracking-tight">
            ReadAct
          </Link>
          {navLinks}
        </div>
        {account}
      </aside>
    </>
  );
}
