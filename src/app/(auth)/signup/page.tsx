import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signUp } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserId } from "@/lib/supabase/auth";
import { validateUsername } from "@/lib/username";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation/credentials";

export const metadata: Metadata = {
  title: "Registrieren",
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (await getUserId()) {
    redirect("/dashboard");
  }

  // Kommt der Besucher von der Claim-Seite, trägt die Adresse den gewünschten
  // Namen. Geprüft wird er trotzdem: Query-Parameter sind Nutzereingaben.
  const { username } = await searchParams;
  const preset = validateUsername(username);
  const presetUsername = preset.ok ? preset.username : null;

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Konto erstellen</CardTitle>
        <CardDescription>
          {presetUsername ? (
            <>
              Noch zwei Angaben, dann gehört{" "}
              <span className="text-foreground font-medium">@{presetUsername}</span> dir.
            </>
          ) : (
            "Zwei Angaben genügen — den Usernamen wählst du im nächsten Schritt."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AuthForm
          action={signUp}
          submitLabel="Konto erstellen"
          pendingLabel="Konto wird erstellt …"
          passwordAutoComplete="new-password"
          passwordHint={`Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`}
          presetUsername={presetUsername}
        />
        <p className="text-muted-foreground text-center text-sm">
          Schon registriert?{" "}
          <Link
            href="/login"
            className="text-foreground hover:text-primary focus-visible:ring-ring rounded-sm font-medium underline underline-offset-4 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
          >
            Zur Anmeldung
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
