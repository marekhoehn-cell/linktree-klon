import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserId } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Anmelden",
};

export default async function LoginPage() {
  if (await getUserId()) {
    redirect("/dashboard");
  }

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Willkommen zurück</CardTitle>
        <CardDescription>Melde dich an, um deine Links zu verwalten.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AuthForm
          action={signIn}
          submitLabel="Anmelden"
          pendingLabel="Wird angemeldet …"
          passwordAutoComplete="current-password"
        />
        <p className="text-muted-foreground text-center text-sm">
          Noch kein Konto?{" "}
          <Link
            href="/signup"
            className="text-foreground hover:text-primary focus-visible:ring-ring rounded-sm font-medium underline underline-offset-4 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
          >
            Jetzt registrieren
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
