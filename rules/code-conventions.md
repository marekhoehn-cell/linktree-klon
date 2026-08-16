# Code-Konventionen

Verbindlich für allen Code in `src/`.

## Namensgebung

| Was | Konvention | Beispiel |
|---|---|---|
| Dateinamen | kebab-case (Kleinbuchstaben, Bindestriche) | `link-card.tsx`, `use-links.ts` |
| Komponenten | PascalCase | `export function LinkCard()` |
| Hooks | `use`-Präfix, camelCase | `useLinks`, `useProfile` |
| Variablen/Funktionen | camelCase | `sortedLinks`, `getProfile()` |
| Konstanten | UPPER_SNAKE_CASE | `DEFAULT_ACCENT` |
| Next.js-Spezialdateien | wie vom Framework vorgegeben | `page.tsx`, `layout.tsx`, `route.ts` |

```
gut:     src/components/link-card.tsx  →  export function LinkCard()
schlecht: src/components/LinkCard.tsx  →  export default function linkcard()
```

## Server- vs. Client-Komponenten

**Server-Komponenten sind der Default.** Jede Datei in `src/app/` und `src/components/` ist automatisch eine Server-Komponente, solange oben **kein** `"use client"` steht.

Kurz erklärt:
- **Server-Komponente:** läuft nur auf dem Server. Kann direkt Daten laden (z. B. Supabase abfragen), sendet nur fertiges HTML an den Browser. Kein JavaScript-Ballast beim Nutzer. Kann **kein** `useState`, `useEffect`, `onClick`.
- **Client-Komponente:** läuft im Browser. Nötig für alles Interaktive — State, Effekte, Event-Handler, Framer-Motion-Animationen, Browser-APIs.

Regel: `"use client"` so **weit unten im Baum wie möglich**. Nicht die ganze Seite zur Client-Komponente machen, nur weil ein Button darin interaktiv ist — stattdessen den Button als eigene Client-Komponente auslagern.

```tsx
// gut: Seite lädt serverseitig, nur der interaktive Teil ist Client
// src/app/dashboard/page.tsx  (Server)
export default async function DashboardPage() {
  const links = await getLinks();
  return <LinkList links={links} />;   // LinkList-Kind hat "use client"
}

// schlecht: ganze Seite wird Client, Daten müssen per fetch nachgeladen werden
"use client";
export default function DashboardPage() {
  const [links, setLinks] = useState([]);
  useEffect(() => { fetch("/api/links")... }, []);
}
```

## TypeScript

- **Strict Mode** ist aktiv und bleibt aktiv.
- **Kein `any`.** Unbekannte Werte sind `unknown` und werden vor der Nutzung geprüft.
- **Kein `@ts-ignore` / `@ts-expect-error`.** Ein Typfehler ist ein echter Fehler — nicht stummschalten, sondern beheben.
- DB-Typen kommen aus `src/lib/database.types.ts` (generiert, nicht von Hand editieren).

```ts
// gut
type Link = Database["public"]["Tables"]["links"]["Row"];
function renderLink(link: Link) { ... }

// schlecht
function renderLink(link: any) { ... }
// @ts-ignore
```

## Kein `console.log` im committeten Code

Debug-Ausgaben vor dem Commit entfernen. Für echtes Fehler-Logging `console.error` in einem `catch`-Block — bewusst gesetzt, nicht als Debug-Rest.

```ts
// gut
try { await saveLink(data); }
catch (error) { console.error("Link konnte nicht gespeichert werden", error); }

// schlecht
console.log("hier bin ich", data);
```

## Ordnerkonvention

| Ordner | Inhalt |
|---|---|
| `src/app/` | Routen (App Router): `page.tsx`, `layout.tsx`, `route.ts`, Server Actions, `globals.css` |
| `src/components/` | UI-Komponenten (eigene + shadcn/ui unter `src/components/ui/`) |
| `src/lib/` | Utilities, Supabase-Clients (Server/Browser), `database.types.ts`, Validierungs-Helper |

Regeln:
- Keine Business-Logik in `src/app/`-Seiten, die mehrfach gebraucht wird — ab nach `src/lib/`.
- Keine Datenbankzugriffe direkt in Client-Komponenten — nur über Server-Komponenten oder Server Actions.
- Eine Komponente pro Datei, Dateiname = Komponentenname in kebab-case.
