"use client";

import { LinkIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Zustand ohne Links. Bewusst gestaltet statt leer, und bewusst **ohne**
 * vorbefüllte Beispieldaten (`guidelines.md` 006).
 */
export function EmptyState({ onAdd }: { onAdd: () => void }) {
  // Volle `card`-Fläche statt auslaufendem Gradient: sonst verschwimmt die
  // Karte im Light Mode mit dem Seitenhintergrund.
  return (
    <div className="border-border bg-card shadow-sm relative overflow-hidden rounded-2xl border border-dashed px-6 py-14 text-center">
      <div
        aria-hidden="true"
        className="bg-primary/10 pointer-events-none absolute -top-16 left-1/2 size-56 -translate-x-1/2 rounded-full blur-3xl"
      />
      <div className="border-border from-muted to-muted/40 text-muted-foreground shadow-sm mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border bg-gradient-to-b">
        <LinkIcon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Noch keine Links</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        Füge deinen ersten Link hinzu — er erscheint sofort in der Vorschau und auf deiner
        öffentlichen Seite.
      </p>
      <Button
        type="button"
        onClick={onAdd}
        className="mt-7 h-11 min-w-11 gap-2 rounded-2xl px-5 text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Plus className="size-4" aria-hidden="true" />
        Ersten Link hinzufügen
      </Button>
    </div>
  );
}
