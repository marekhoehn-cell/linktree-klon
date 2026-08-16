import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Vorlage greift für alle Unterseiten: aus `title: "Registrieren"` wird
  // "Registrieren · Linktree-Clone", die Startseite behält den reinen Namen.
  title: {
    default: "Linktree-Clone",
    template: "%s · Linktree-Clone",
  },
  description: "Alle deine Links auf einer Seite — kostenlos, in einer Minute eingerichtet.",
  // Ohne diesen Wert erzeugt Next relative Open-Graph-Adressen und warnt beim
  // Build. Die öffentlichen Profilseiten brauchen absolute — siehe src/lib/site-url.ts.
  metadataBase: getSiteUrl(),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Impressum ist eine Pflichtangabe und muss von jeder Seite aus erreichbar sein —
            deshalb hier im Root-Layout und nicht in den einzelnen Bereichs-Layouts. */}
        <SiteFooter />
        {/* Fehlermeldungen aus Server Actions — global, damit jede Seite sie nutzen kann. */}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
