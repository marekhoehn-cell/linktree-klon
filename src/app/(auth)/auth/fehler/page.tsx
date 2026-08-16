import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Bestätigung fehlgeschlagen",
};

/**
 * Ziel der Confirm-Route, wenn der Link nicht mehr gültig ist. Bewusst ohne
 * technische Details: Der Grund steht im Server-Log, hier hilft nur der Weg
 * zurück ins Formular.
 */
export default function AuthErrorPage() {
  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Der Link hat nicht funktioniert</CardTitle>
        <CardDescription>
          Bestätigungslinks laufen nach einiger Zeit ab und gelten nur einmal. Registriere dich
          erneut, um eine frische E-Mail zu erhalten — oder melde dich an, falls dein Konto bereits
          bestätigt ist.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-center text-sm">
        <Link
          href="/signup"
          className="text-foreground hover:text-primary focus-visible:ring-ring rounded-sm font-medium underline underline-offset-4 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Neue Bestätigungsmail anfordern
        </Link>
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Zur Anmeldung
        </Link>
      </CardContent>
    </Card>
  );
}
