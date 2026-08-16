import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * In Next 16 heißt diese Datei `proxy.ts` mit Export `proxy` —
 * die frühere Konvention `middleware.ts` ist deprecated.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Alle Pfade außer:
     * - _next/static, _next/image (Build-Artefakte)
     * - favicon.ico
     * - Bilddateien
     * Der Auth-Check kostet sonst auf jedem Asset einen Durchlauf.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
