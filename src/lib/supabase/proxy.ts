import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Startseite und Impressum — exakte Treffer, sonst wäre jeder Pfad öffentlich.
 * Das Impressum ist eine gesetzliche Pflichtangabe: Ein Login-Redirect davor
 * würde die Anbieterkennzeichnung faktisch unerreichbar machen.
 */
const PUBLIC_EXACT_PATHS = ["/", "/impressum"];

/** Öffentliche Bereiche inklusive Unterpfaden. `/u` muss drin bleiben, sonst sperrt der Proxy die Profilseiten aus. */
const PUBLIC_PATH_PREFIXES = ["/login", "/signup", "/auth", "/u"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Erneuert bei jedem Request das Auth-Token und schützt nicht-öffentliche Routen.
 *
 * Zwei Dinge sind hier nicht verhandelbar:
 * 1. `setAll` setzt die von @supabase/ssr übergebenen Header auf die Response.
 *    Ohne sie darf ein CDN eine Session-Response cachen und die Sitzung eines
 *    Nutzers an einen anderen ausliefern.
 * 2. Zwischen `createServerClient()` und `getClaims()` steht kein weiterer Code —
 *    ein Refresh, der nach dem Absenden der Response fertig wird, ginge verloren.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, publishableKey } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, headerValue] of Object.entries(headers)) {
          response.headers.set(key, headerValue);
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  if (!isSignedIn && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    const redirectResponse = NextResponse.redirect(loginUrl);
    // Cookies und Header aus dem Token-Refresh mitnehmen, sonst gehen sie beim Redirect verloren.
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    response.headers.forEach((headerValue, key) => {
      redirectResponse.headers.set(key, headerValue);
    });
    return redirectResponse;
  }

  return response;
}
