"use client";

import { Reorder } from "motion/react";

import { LinkCard } from "@/components/dashboard/link-card";
import type { Link } from "@/lib/supabase/links";

type LinkListProps = {
  links: Link[];
  /** IDs, deren Änderung gerade noch beim Server liegt. */
  pendingIds: ReadonlySet<string>;
  /** Feuert während des Ziehens, sobald sich die Reihenfolge ändert — nur lokal. */
  onReorder: (linkIds: string[]) => void;
  /** Feuert einmal beim Loslassen — erst hier wird gespeichert. */
  onDragEnd: () => void;
  /** Verschiebt die Karte an `index` um eine Position (`-1` hoch, `+1` runter). */
  onMove: (index: number, offset: -1 | 1) => void;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
};

/**
 * Reine Darstellung — die Reihenfolge kommt aus dem optimistischen State der
 * `LinksWorkspace` und wird von dort auch gespeichert.
 *
 * `values` und `value` sind Link-**IDs**, keine Link-Objekte: Strings haben eine
 * stabile Identität über Renders hinweg, weshalb Motion die Positionen zuverlässig
 * zuordnet. Nebeneffekt: Was `onReorder` liefert, ist bereits genau das Format,
 * das die Server Action erwartet.
 */
export function LinkList({
  links,
  pendingIds,
  onReorder,
  onDragEnd,
  onMove,
  onEdit,
  onDelete,
}: LinkListProps) {
  const linkIds = links.map((link) => link.id);

  return (
    <Reorder.Group
      axis="y"
      values={linkIds}
      onReorder={onReorder}
      // `overscroll-contain` verhindert, dass Pull-to-Refresh einen laufenden
      // Ziehvorgang auf dem Telefon abbricht.
      className="flex flex-col gap-3 overscroll-contain"
    >
      {links.map((link, index) => (
        <LinkCard
          key={link.id}
          link={link}
          isPending={pendingIds.has(link.id)}
          canMoveUp={index > 0}
          canMoveDown={index < links.length - 1}
          onMoveUp={() => onMove(index, -1)}
          onMoveDown={() => onMove(index, 1)}
          onDragEnd={onDragEnd}
          onEdit={() => onEdit(link)}
          onDelete={() => onDelete(link)}
        />
      ))}
    </Reorder.Group>
  );
}
