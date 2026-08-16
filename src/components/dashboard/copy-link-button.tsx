"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/** Wie lange die Bestätigung im Button stehen bleibt. */
const CONFIRMATION_MS = 2000;

type CopyLinkButtonProps = {
  /** Pfad der öffentlichen Seite, z. B. `/u/marek`. Der Host kommt zur Laufzeit dazu. */
  path: string;
};

/**
 * Legt die vollständige öffentliche Adresse in die Zwischenablage.
 *
 * Der Host wird bewusst erst im Browser aus `window.location.origin` gelesen:
 * serverseitig ist die echte Domain nicht bekannt, und ein hart notierter
 * Platzhalter würde eine URL kopieren, die niemand öffnen kann.
 */
export function CopyLinkButton({ path }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer aufräumen, damit ein setState nach dem Unmount ausbleibt.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    } catch (error) {
      console.error("Adresse konnte nicht kopiert werden", error);
      return;
    }

    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      aria-label="Öffentliche Adresse in die Zwischenablage kopieren"
      className="bg-card h-11 min-w-11 shrink-0 gap-2 rounded-2xl px-3 text-sm font-medium transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-4"
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {/* Kurzform unter `sm`, damit die Kopfzeile bei 390 px einzeilig bleibt. */}
      <span className="hidden sm:inline">{copied ? "Kopiert!" : "Link kopieren"}</span>
      <span className="sm:hidden">{copied ? "Kopiert!" : "Kopieren"}</span>
      {/* Bestätigung auch für Screenreader — der Icon-Wechsel allein wird nicht vorgelesen. */}
      <span aria-live="polite" className="sr-only">
        {copied ? "Adresse wurde kopiert." : ""}
      </span>
    </Button>
  );
}
