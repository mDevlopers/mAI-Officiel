"use client";

import { BookOpenCheck, Database, Store, Trophy, UserCircle2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const items = [
  { href: "/quizzly", label: "Jouer", icon: BookOpenCheck },
  { href: "/quizzly/social", label: "Amis & Chat", icon: Users },
  { href: "/quizzly/boutique", label: "Boutique", icon: Store },
  { href: "/quizzly/quests", label: "Quêtes", icon: Trophy },
  { href: "/quizzly/profile", label: "Profil", icon: UserCircle2 },
  { href: "/quizzly/data", label: "Statistiques", icon: Database },
] as const;

export default function QuizzlyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="quizzly-fun mx-auto flex h-full w-full max-w-7xl gap-4 p-4 md:p-8">
      <aside className="w-full rounded-3xl border border-violet-200/80 bg-gradient-to-b from-fuchsia-100/90 via-violet-50/90 to-cyan-50/80 p-4 shadow-xl md:w-72">
        <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm">
          <Image alt="Quizzly" className="size-11 rounded-xl" height={44} src="/logo.png" width={44} />
          <div>
            <h2 className="text-2xl font-black text-violet-700">Quizzly</h2>
            <p className="text-xs text-violet-500">Apprendre en s'amusant ✨</p>
          </div>
        </div>

        <nav className="mt-4 space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "border-violet-300 bg-violet-500 text-white shadow"
                    : "border-violet-200 bg-white/80 text-violet-800 hover:bg-violet-100"
                }`}
                href={item.href}
                key={item.href}
              >
                <item.icon className="size-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
