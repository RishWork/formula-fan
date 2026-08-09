"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/standings", label: "Standings" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800/60 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-[#e10600] shadow-[0_0_8px_rgba(225,6,0,0.7)]" />
          <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">
            Formula Fan
          </span>
        </Link>

        <ul className="flex gap-1">
          {items.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                    isActive
                      ? "bg-white/5 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}