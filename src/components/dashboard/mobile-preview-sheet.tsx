"use client";

import { Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Umschalter für die Vorschau unter `lg` (`guidelines.md` 002: mobil **kein**
 * geteiltes Layout).
 *
 * Der Auslöser schwebt unten rechts, damit er beim Scrollen durch eine lange
 * Linkliste erreichbar bleibt. Fokus-Falle, ESC und Overlay kommen von Radix.
 */
export function MobilePreviewSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          className="shadow-lg fixed right-5 bottom-5 z-40 h-12 min-w-12 gap-2 rounded-2xl px-5 text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 lg:hidden"
        >
          <Smartphone className="size-4" aria-hidden="true" />
          Vorschau
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[92dvh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Vorschau</SheetTitle>
          <SheetDescription>So sieht deine öffentliche Seite aus.</SheetDescription>
        </SheetHeader>
        <div className="flex justify-center overflow-y-auto px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
