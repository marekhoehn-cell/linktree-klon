/**
 * Beide Werte sind bewusst öffentlich (NEXT_PUBLIC_*) — der Zugriffsschutz kommt
 * aus Row Level Security. Der Guard existiert nur, damit ein fehlender Eintrag in
 * `.env.local` sofort mit klarer Meldung auffliegt statt später als "Invalid API key".
 */
function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Umgebungsvariable ${name} fehlt. Eintrag in .env.local ergänzen und den Dev-Server neu starten.`,
    );
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}
