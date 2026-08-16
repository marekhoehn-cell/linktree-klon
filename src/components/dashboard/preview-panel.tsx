import { MobilePreviewSheet } from "@/components/dashboard/mobile-preview-sheet";
import { PhoneFrame } from "@/components/dashboard/phone-frame";

/**
 * Zwei Auftritte derselben Vorschau: ab `lg` als sticky Spalte im Split-View,
 * darunter als Sheet hinter einem Umschalter.
 *
 * Server-Komponente — der Inhalt wird als `children` in die Client-Komponente
 * durchgereicht, damit `"use client"` nur am Sheet hängt.
 */
export function PreviewPanel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* `top-32` statt `top-24`: Die Kopfzeile ist seit der Bereichs-Navigation zweizeilig. */}
      <aside className="sticky top-32 hidden self-start lg:block">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Vorschau
        </p>
        <PhoneFrame>{children}</PhoneFrame>
      </aside>

      <MobilePreviewSheet>
        <PhoneFrame>{children}</PhoneFrame>
      </MobilePreviewSheet>
    </>
  );
}
