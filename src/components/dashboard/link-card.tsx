"use client";

import { ChevronDown, ChevronUp, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Link } from "@/lib/supabase/links";

/** Zeigt `https://beispiel.de/pfad/` als `beispiel.de/pfad` — Protokoll und Schrägstrich am Ende sind Rauschen. */
export function formatUrlForDisplay(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

type LinkCardProps = {
  link: Link;
  /** Während eine Änderung unterwegs ist, wird die Karte gedämpft und gesperrt. */
  isPending: boolean;
  /** `false` bei der obersten bzw. untersten Karte — die passende Pfeiltaste ist dann deaktiviert. */
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  /** Feuert genau einmal pro Ziehvorgang — hier wird gespeichert, nicht in `onReorder`. */
  onDragEnd: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function LinkCard({
  link,
  isPending,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDragEnd,
  onEdit,
  onDelete,
}: LinkCardProps) {
  const dragControls = useDragControls();

  // Rein visueller Zustand dieser einen Karte — nicht die Reihenfolge. Die liegt
  // ausschließlich im optimistischen State der `LinksWorkspace`.
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={link.id}
      // Pflicht-Maßnahme 1: Die Karte selbst reagiert nicht auf Ziehen, nur der Griff
      // startet es über `dragControls`.
      dragListener={false}
      dragControls={dragControls}
      // Pflicht-Maßnahme 4: Ohne `position: relative` greift Motions Ebenen-Verwaltung
      // nicht und die gezogene Karte rutscht unter ihre Nachbarn.
      style={{ position: "relative" }}
      // Hervorhebung bewusst ueber Motion statt ueber Klassen: Motion verwaltet
      // z-index und Transform des gezogenen Items per Inline-Style, und der
      // schlaegt jede Utility-Klasse. Der Schatten kommt als Token, nicht als Hex.
      whileDrag={{ scale: 1.02, boxShadow: "var(--shadow-xl)" }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd();
      }}
      data-pending={isPending}
      data-dragging={isDragging}
      // `rounded-xl` statt `rounded-2xl`: In diesem Theme sind `--radius-2xl` 36 px —
      // bei 60 px Kartenhöhe mehr als die halbe Höhe, der Browser skaliert die Radien
      // herunter und die Karte wird zur verzogenen Kapsel. Gleiche Korrektur wie auf
      // der öffentlichen Seite (`link-button.tsx`), damit beide Ansichten sich decken.
      className="group border-border bg-card shadow-sm hover:shadow-md data-[pending=true]:opacity-60 data-[dragging=true]:border-ring flex min-h-[60px] items-center gap-1 overflow-hidden rounded-xl border px-2 py-2.5 transition-shadow duration-200 ease-out sm:gap-2 sm:px-3"
    >
      {/*
        Pflicht-Maßnahme 2: `touch-none` (touch-action: none) sitzt ausschließlich
        hier. Läge es auf der Karte, ließe sich die Seite auf dem Telefon nicht mehr
        durch Wischen über der Liste scrollen.
      */}
      {/*
        `tabIndex={-1}`: Der Griff lässt sich nur mit Zeigegerät bedienen — Motion
        bringt keine Tastatur-Bedienung mit. Als Tab-Stop wäre er eine Sackgasse
        (fünf Stationen pro Liste, die nichts auslösen). Der Tastatur-Weg sind die
        Pfeil-Schaltflächen; das `aria-label` bleibt für Zeigegerät-Nutzer stehen.
      */}
      <Button
        type="button"
        variant="ghost"
        tabIndex={-1}
        aria-label="Reihenfolge ändern"
        onPointerDown={(event) => dragControls.start(event)}
        className="text-muted-foreground hover:text-foreground size-11 shrink-0 cursor-grab touch-none rounded-xl transition-colors duration-200 ease-out active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{link.title}</p>
        <p className="text-muted-foreground truncate text-xs">
          {formatUrlForDisplay(link.url)}
        </p>
      </div>

      {/*
        Der einzige Weg für Tastaturnutzer: Motion `Reorder` bringt keine
        Tastatur-Bedienung mit (`guidelines.md` 003).
      */}
      <div className="flex shrink-0 flex-col">
        <Button
          type="button"
          variant="ghost"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label={`„${link.title}“ nach oben`}
          className="h-6 w-11 rounded-lg transition-all duration-200 ease-out"
        >
          <ChevronUp className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label={`„${link.title}“ nach unten`}
          className="h-6 w-11 rounded-lg transition-all duration-200 ease-out"
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex shrink-0 items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onEdit}
          disabled={isPending}
          aria-label={`„${link.title}“ bearbeiten`}
          className="size-11 rounded-xl transition-all duration-200 ease-out"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onDelete}
          disabled={isPending}
          aria-label={`„${link.title}“ löschen`}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-11 rounded-xl transition-all duration-200 ease-out"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </Reorder.Item>
  );
}
