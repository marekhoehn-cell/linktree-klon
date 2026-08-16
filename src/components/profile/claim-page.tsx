import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PUBLIC_PROFILE_HOST } from "@/lib/username";

/**
 * Antwort auf einen freien Namen — statt einer 404 (`guidelines.md` 002).
 *
 * Der Name wandert als Query-Parameter an die Registrierung weiter und von dort
 * ins Onboarding, damit er beim Ankommen bereits im Feld steht. Vorreserviert
 * wird dabei nichts: Verbindlich ist erst der Klick auf „Namen sichern".
 */
export function ClaimPage({ username }: { username: string }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 py-20 text-center">
      <span className="border-border/60 bg-card/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Noch nicht vergeben
      </span>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Dieser Name ist noch frei</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Niemand hat sich <span className="text-foreground font-medium">@{username}</span> bisher
          gesichert. Leg dir ein Konto an, dann gehört die Adresse dir.
        </p>
      </div>

      {/* Zeigt, was der Nutzer bekommt — dieselbe Vorschau wie im Onboarding. */}
      <p className="border-border/60 bg-card/70 from-card to-card/60 text-muted-foreground w-full rounded-2xl border bg-gradient-to-b px-4 py-3 font-mono text-xs break-all shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-16px_rgba(0,0,0,0.35)]">
        {PUBLIC_PROFILE_HOST}/u/<span className="text-foreground">{username}</span>
      </p>

      <Button
        asChild
        className="h-11 w-full gap-2 rounded-2xl text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:shadow-xl"
      >
        <Link href={`/signup?username=${encodeURIComponent(username)}`}>
          Namen sichern
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>

      <p className="text-muted-foreground text-sm">
        Schon registriert?{" "}
        <Link
          href="/login"
          className="text-foreground hover:text-primary focus-visible:ring-ring rounded-sm font-medium underline underline-offset-4 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
