import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@/lib/username";

/**
 * Gestaltete 404 für den Profil-Namespace.
 *
 * Sie erscheint nur bei formal unmöglichen Namen — ein freier, aber gültiger
 * Name landet stattdessen auf der Claim-Seite. Deshalb erklärt der Text die
 * Regel, statt „Seite nicht gefunden" zu wiederholen.
 */
export default function ProfileNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <span className="border-border/60 bg-card/70 text-muted-foreground flex size-14 items-center justify-center rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-16px_rgba(0,0,0,0.35)]">
        <Compass className="size-6" aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Diese Seite gibt es nicht</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Der Name in der Adresse ist als Username nicht möglich. Erlaubt sind{" "}
          {USERNAME_MIN_LENGTH} bis {USERNAME_MAX_LENGTH} Zeichen — Kleinbuchstaben, Ziffern,
          Bindestrich und Unterstrich.
        </p>
      </div>

      <Button
        asChild
        variant="secondary"
        className="h-11 gap-2 rounded-2xl px-5 text-sm font-medium transition-all duration-200 ease-out hover:shadow-lg"
      >
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Zur Startseite
        </Link>
      </Button>
    </main>
  );
}
