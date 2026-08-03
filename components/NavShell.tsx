"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, User, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Today", icon: Home },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/profile", label: "About me", icon: User },
];

export default function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:border-r lg:border-zinc-200 lg:bg-white lg:px-4 lg:py-6">
        <div className="mb-8 px-2 text-lg font-bold text-zinc-900">🥗 Meal Tracker</div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 pb-16 lg:pb-0">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white lg:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
