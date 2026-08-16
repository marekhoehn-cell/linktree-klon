import { ImageResponse } from "next/og";

import { getInitials } from "@/lib/initials";
import { getPublicProfile } from "@/lib/supabase/public-profile";
import { validateUsername } from "@/lib/username";

export const alt = "Profilseite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Die Bild-Erzeugung läuft außerhalb des Browsers: Es gibt kein Stylesheet,
 * keine CSS-Variablen und kein `oklch`. Die Farben sind deshalb ausgerechnete
 * sRGB-Entsprechungen der Dark-Tokens aus `globals.css` — die einzige Stelle im
 * Projekt, an der Hex-Werte stehen dürfen (`rules/design-system.md`).
 *
 * Ändern sich die Tokens, müssen diese Werte mitgezogen werden.
 */
const COLORS = {
  background: "#1e1b18",
  card: "#2c2825",
  border: "#3a3633",
  foreground: "#e2e8f0",
  mutedForeground: "#9ca3af",
  primary: "#818cf8",
} as const;

/**
 * Vorschaubild für Messenger und soziale Netzwerke.
 *
 * Bewusst **ohne** das Avatar-Bild des Nutzers: Die Adresse zeigt auf einen
 * beliebigen fremden Host: Ist er langsam oder tot, wäre das ganze Bild
 * betroffen. Die Initialen sind immer verfügbar und sehen überall gleich aus.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const validation = validateUsername(raw);
  const profile = validation.ok ? await getPublicProfile(validation.username) : null;

  const username = profile?.username ?? (validation.ok ? validation.username : "");
  const heading = profile?.displayName ?? (username ? `@${username}` : "Link in Bio");
  const linkCount = profile?.links.length ?? 0;

  // Satori verlangt bei jedem Element mit mehr als einem Kind ein explizites
  // `display`. Ausdrücke wie `@{username}` erzeugen still zwei Kinder — deshalb
  // stehen die Texte hier fertig, nicht im Markup zusammengesetzt.
  // Die Bio darf Zeilenumbrüche enthalten; im Bild steht sie einzeilig.
  const BIO_MAX = 110;
  const rawBio = profile?.bio?.replace(/\s+/g, " ").trim() ?? null;
  const bio =
    rawBio === null
      ? null
      : rawBio.length > BIO_MAX
        ? `${rawBio.slice(0, BIO_MAX)}…`
        : rawBio;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: 88,
          backgroundColor: COLORS.background,
          backgroundImage: `radial-gradient(circle at 22% 18%, ${COLORS.primary}33, transparent 55%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 220,
            height: 220,
            flexShrink: 0,
            borderRadius: 9999,
            border: `2px solid ${COLORS.border}`,
            backgroundColor: COLORS.card,
            color: COLORS.foreground,
            fontSize: 88,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          {getInitials(profile?.displayName ?? null, username || "?")}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: COLORS.foreground,
              lineHeight: 1.1,
              // Satori bricht nicht automatisch um — die Grenze verhindert,
              // dass ein langer Name über den Bildrand hinausläuft.
              overflow: "hidden",
            }}
          >
            {heading.slice(0, 32)}
          </div>

          {profile?.displayName ? (
            <div style={{ marginTop: 12, fontSize: 34, color: COLORS.primary }}>
              {`@${username}`}
            </div>
          ) : null}

          {bio ? (
            <div
              style={{
                marginTop: 20,
                fontSize: 30,
                lineHeight: 1.4,
                color: COLORS.mutedForeground,
              }}
            >
              {bio}
            </div>
          ) : null}

          {linkCount > 0 ? (
            <div
              style={{
                display: "flex",
                marginTop: 32,
                alignSelf: "flex-start",
                padding: "10px 22px",
                borderRadius: 9999,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.card,
                color: COLORS.mutedForeground,
                fontSize: 26,
              }}
            >
              {linkCount === 1 ? "1 Link" : `${linkCount} Links`}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
