"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Links" },
  { href: "/dashboard/profil", label: "Profil" },
] as const;

/**
 * Bereichswechsel im Arbeitsbereich.
 *
 * Client-Komponente, weil nur der Browser weiß, welche Route gerade offen ist.
 * `aria-current` macht das auch für Screenreader sichtbar — die Unterstreichung
 * allein ist eine rein optische Information.
 */
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Bereiche" className="-mb-px flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring inline-flex h-11 items-center rounded-t-xl border-b-2 px-3 text-sm font-medium transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none",
              isActive
                ? "border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground hover:border-border border-transparent",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
