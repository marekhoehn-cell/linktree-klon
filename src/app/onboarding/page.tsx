import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsernameForm } from "@/components/username-form";
import { getProfile, requireUserId } from "@/lib/supabase/auth";
import { validateUsername } from "@/lib/username";

export const metadata: Metadata = {
  title: "Username wählen",
};

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  // Gegenstück zum Forced Redirect: Wer den Schritt hinter sich hat, sieht ihn nicht erneut.
  if (profile?.username) {
    redirect("/dashboard");
  }

  // Über die Claim-Seite mitgebrachter Name. Er belegt das Feld nur vor — die
  // Verfügbarkeitsprüfung und das Sichern laufen unverändert im Formular.
  const { username } = await searchParams;
  const preset = validateUsername(username);

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Wähle deinen Usernamen</CardTitle>
        <CardDescription>
          Er steht in der Adresse deiner öffentlichen Seite und lässt sich später nicht mehr
          ändern.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <UsernameForm initialUsername={preset.ok ? preset.username : ""} />
        <form action={signOut} className="text-center">
          <Button
            type="submit"
            variant="link"
            className="text-muted-foreground hover:text-foreground h-auto p-0 text-sm transition-colors duration-200 ease-out"
          >
            Abmelden
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
