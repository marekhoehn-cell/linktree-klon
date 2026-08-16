"use client";

import { useState } from "react";

import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  /** Geprüfte `https://`-Adresse oder `null`. Ungeprüfte Werte gehören hier nicht hinein. */
  src: string | null;
  /** Anzeigename, falls gesetzt — sonst wird aus dem Username abgeleitet. */
  displayName: string | null;
  username: string;
  className?: string;
};

/**
 * Profilbild mit gestaltetem Rückfall.
 *
 * Zwei Fälle führen zum selben Ergebnis: keine Adresse hinterlegt, oder das Bild
 * lädt nicht (tote Adresse, kein Bild, blockierter Host). Beide zeigen die
 * Initialen — nie das kaputte Bildsymbol des Browsers.
 *
 * Der Fehlerzustand merkt sich die **gescheiterte Adresse**, nicht nur ein
 * Ja/Nein. So versucht eine neu eingetippte Adresse von selbst wieder zu laden,
 * ohne dass ein `useEffect` den Zustand zurücksetzen müsste.
 *
 * Kein `next/image`: Die Adressen kommen von Nutzern, die Hosts sind also
 * beliebig und lassen sich nicht in `remotePatterns` auflisten.
 */
export function ProfileAvatar({ src, displayName, username, className }: ProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src !== null && src !== failedSrc;

  return (
    <div
      className={cn(
        // Größe und Schriftgröße stehen zusammen im Wrapper: Die Initialen erben
        // sie, damit ein `className` von außen beides in einem Rutsch ändern kann.
        // `ring-brand-subtle`: zweite, dezente Fläche für die Nutzerfarbe — ein
        // weicher Hof ums Bild, der auch dann trägt, wenn jemand keine Links hat.
        "border-border/60 from-muted to-muted/40 text-muted-foreground ring-brand-subtle relative size-24 shrink-0 overflow-hidden rounded-full border bg-linear-to-b text-xl shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_-12px_rgba(0,0,0,0.35)] ring-4",
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- beliebige Fremd-Hosts, siehe Kommentar oben
        <img
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-semibold tracking-wide select-none"
        >
          {getInitials(displayName, username)}
        </span>
      )}
    </div>
  );
}
