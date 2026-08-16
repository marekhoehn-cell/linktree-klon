/**
 * Basis-Adresse der Anwendung.
 *
 * Open-Graph-Tags brauchen **absolute** Adressen — ein Messenger hat keinen
 * Kontext, aus dem er `/u/max/opengraph-image` auflösen könnte. Next leitet sie
 * aus `metadataBase` ab, deshalb muss dieser Wert stimmen.
 *
 * Reihenfolge der Quellen:
 * 1. `NEXT_PUBLIC_SITE_URL` — die eigene Domain, sobald es sie gibt
 * 2. `VERCEL_URL` — die automatisch vergebene Preview-Adresse (ohne Protokoll)
 * 3. `localhost` für die Entwicklung
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return new URL(explicit);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`);
  }

  return new URL("http://localhost:3000");
}
