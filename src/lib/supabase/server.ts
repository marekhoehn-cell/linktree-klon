import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Supabase-Client für Server-Komponenten, Server Actions und Route Handler.
 *
 * Wichtig: `createClient()` gehört pro Request neu aufgerufen — der Client hält den
 * Cookie-Store fest und darf nicht modulweit geteilt werden.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // Das zweite Argument (`headers`) wird hier bewusst ignoriert: Server-Komponenten
      // können keine Response-Header setzen. Die Cache-Control-Header aus @supabase/ssr
      // werden stattdessen im Proxy gesetzt — siehe src/lib/supabase/proxy.ts.
      setAll(cookiesToSet, _headers) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Aus einer Server-Komponente heraus ist das Schreiben von Cookies nicht erlaubt.
          // Der Token-Refresh läuft dann über den Proxy, deshalb ist das kein Fehlerfall.
        }
      },
    },
  });
}
