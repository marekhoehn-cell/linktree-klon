# 02 — Auth mit E-Mail und Passwort

## Ziel
Ein Besucher kann sich mit E-Mail und Passwort registrieren, anmelden und wieder abmelden. Angemeldete Nutzer erreichen geschützte Bereiche, nicht angemeldete werden zur Anmeldung geschickt — und die öffentlichen Profilseiten bleiben für alle frei zugänglich.

## Abhängigkeiten
- `01-datenmodell-ergaenzungen.md` ✅ (ohne den Trigger entsteht beim Sign-up kein Profil)
- `.env.local` mit `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Supabase Dashboard: „Confirm email" **ausgeschaltet** (sonst liefert `signUp` keine Session)
- Supabase Dashboard: Passwort-Minimum auf 8 gesetzt

## Out of Scope
- Username-Vergabe und der Onboarding-Screen → `03-onboarding-username.md`
- Passwort-zurücksetzen und E-Mail-Änderung (nicht im MVP)
- OAuth, Magic Links (dauerhaft draußen)
- Gestaltung des Dashboards → `04-dashboard-shell.md`

## Kritische Vorgaben
Diese Punkte sind in `guidelines.md` 005 begründet und **nicht verhandelbar**, weil sie von verbreiteten Tutorials abweichen:

1. Die Datei heißt **`proxy.ts`** mit Export `proxy` — nicht `middleware.ts`. In Next 16 ist die alte Konvention deprecated.
2. `setAll` wird mit **beiden** Argumenten implementiert: `setAll(cookiesToSet, headers)`. Die Header werden im Proxy auf die Response gesetzt. Werden sie weggelassen, kann ein CDN eine Session-Response cachen und **die Session eines Nutzers an einen anderen ausliefern**.
3. Zwischen `createServerClient(...)` und `getClaims()` gehört **kein** Code.
4. Verwendet wird **`getClaims()`**, nicht `getUser()`. `getSession()` serverseitig gar nicht.
5. Die Proxy-Whitelist muss `/`, `/login`, `/signup`, `/auth` und **`/u`** enthalten — sonst sperrt der Proxy die öffentlichen Profilseiten aus.

## Akzeptanzkriterien
- [x] Sign-up mit E-Mail + Passwort legt einen Auth-User an und leitet direkt auf `/onboarding` weiter (Session besteht sofort, ohne Bestätigungsmail)
- [x] Nach dem Sign-up existiert dank Trigger eine Profilzeile mit `username = NULL`
- [x] Sign-in mit korrekten Daten leitet auf `/dashboard`
- [x] Sign-in mit falschem Passwort zeigt **im Formular** die Meldung „E-Mail oder Passwort ist falsch." — die Seite wechselt nicht
- [x] Die Fehlermeldung ist bei unbekannter E-Mail **identisch** zu der bei falschem Passwort (keine User-Enumeration)
- [x] Ein Passwort unter 8 Zeichen wird abgelehnt, mit Meldung im Formular
- [x] Sign-out beendet die Sitzung und leitet auf `/login`
- [x] Aufruf von `/dashboard` ohne Anmeldung landet auf `/login`
- [x] Aufruf von `/u/<username>` **ohne** Anmeldung funktioniert und wird nicht umgeleitet — liefert 404, weil die Route erst in Spec 08 entsteht; entscheidend ist: **kein** Redirect auf `/login`
- [x] Nach 5 Minuten Inaktivität und einem Reload ist der Nutzer weiterhin angemeldet (Token-Refresh im Proxy greift) — zusätzlich mit künstlich abgelaufenem Token geprüft: der Proxy refresht und setzt neue Cookies
- [x] Beide Formulare zeigen während des Absendens einen Ladezustand und sind dabei nicht doppelt auslösbar

## Tasks
- [x] `src/lib/supabase/client.ts` — `createBrowserClient`
- [x] `src/lib/supabase/server.ts` — `createServerClient`, `await cookies()`, `setAll` mit `try/catch`, zweites Argument bewusst als `_headers` ignoriert (Server Components können keine Header setzen)
- [x] `src/lib/supabase/proxy.ts` — `updateSession()` inkl. Header-Weitergabe und Pfad-Whitelist
- [x] `proxy.ts` im Projekt-Root (bzw. `src/`) — Export `proxy` + `config.matcher` mit Ausschluss von `_next/static`, `_next/image`, Bilddateien
- [x] `src/lib/supabase/auth.ts` — Helper `requireUserId()` auf Basis von `getClaims()`
- [x] `src/app/(auth)/actions.ts` — `signUp`, `signIn`, `signOut` als Server Actions; `redirect()` **außerhalb** von `try/catch`; `revalidatePath('/', 'layout')`
- [x] `src/app/(auth)/login/page.tsx` und `src/app/(auth)/signup/page.tsx` mit `useActionState`
- [x] Gemeinsame Formular-Komponente mit Feld-Fehlern, Ladezustand, Hover- und Focus-States
- [x] Zod-Schema für E-Mail und Passwort, serverseitig in der Action geprüft
- [x] Zusätzlich: `src/lib/supabase/env.ts` (Guard für fehlende Env-Variablen), `src/lib/auth-form-state.ts` (State-Typ; eine `"use server"`-Datei darf keine Konstanten exportieren), schlanke Platzhalter für `/onboarding` und `/dashboard` inkl. Layout-Guard — werden in Spec 03 und 04 ersetzt

## Validation
- `npx tsc --noEmit` grün, `npm run build` ohne Fehler
- Klickpfad Sign-up: `/signup` → Daten eingeben → Absenden → landet auf `/onboarding`; in Supabase erscheint ein Auth-User **und** eine Profilzeile
- Klickpfad Sign-in falsch: `/login` → falsches Passwort → Meldung erscheint im Formular, URL bleibt `/login`
- Klickpfad Guard: abmelden → `/dashboard` direkt aufrufen → landet auf `/login`
- Klickpfad öffentlich: in einem **privaten Fenster** `/u/<irgendwas>` aufrufen → **kein** Redirect auf `/login`
- Refresh-Test: anmelden, 5 Minuten warten, Seite neu laden → weiterhin angemeldet, keine Abmeldung
- Header-Test: in den Antwort-Headern einer Seite nach dem Login prüfen, dass `Cache-Control: private, no-cache, no-store, …` gesetzt ist
  → **Teilweise erfüllt.** Mit künstlich abgelaufenem Token refresht der Proxy und setzt die Header aus `@supabase/ssr`: `Expires: 0` und `Pragma: no-cache` kommen unverändert an, `Cache-Control` normalisiert Next.js für dynamische Routen jedoch auf `no-cache, must-revalidate` — `private` und `no-store` fallen dabei weg. Die Response trägt `Set-Cookie`, wird also von Vercel und gängigen CDNs ohnehin nicht im Shared Cache abgelegt, und `must-revalidate` erzwingt Revalidierung. Vor dem Deployment (Spec 10) auf der Vercel-Preview gegenprüfen.

## Relevante Rules/Skills
- Skill `supabase` laden. **Bei Unsicherheit zu `@supabase/ssr`-APIs Context7 befragen, nicht aus dem Gedächtnis arbeiten** (`CLAUDE.md`, Tools)
- Next-16-Spezifika: `node_modules/next/dist/docs/`
- `guidelines.md` 005 · `rules/code-conventions.md` · `rules/verification.md` (Auth-Flow)

## Status
✅ fertig

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Die fünf kritischen Vorgaben ließen sich ohne Umweg umsetzen; `setAll(cookiesToSet, headers)` ist in `node_modules/@supabase/ssr/dist/main/types.d.ts` samt CDN-Warnung dokumentiert, die Vorgabe war also direkt am Typ belegbar. Der komplette Klickpfad wurde deterministisch per CDP im echten Browser gefahren (Skript ohne LLM-Agent), inklusive Screenshots — dadurch waren Ladezustand, Fehlermeldung, Dark Mode und Focus-Ring in einem Durchlauf prüfbar.
- **Was war unerwartet:** (1) Supabase lehnt E-Mail-Adressen auf `.test` grundsätzlich ab — der erste Testlauf scheiterte daran, nicht am Code. (2) „Confirm email" war entgegen der Annahme noch aktiv; die generische Fehlermeldung im Formular verdeckte die Ursache vollständig, erst das serverseitige `console.error` brachte `email_not_confirmed` zutage. (3) Zwei fehlgeschlagene Sign-ups reichten, um das Free-Tier-Mailkontingent zu sprengen (`over_email_send_rate_limit`). (4) Next.js überschreibt `Cache-Control` auf dynamischen Routen und schluckt dabei `private` und `no-store` — siehe Anmerkung unter Validation.
- **Was fließt in `learning.md`:** Generische Fehlermeldungen brauchen von Anfang an ein serverseitiges Log, sonst ist jede Fehlersuche blind; Dashboard-Einstellungen vor dem Testlauf verifizieren statt abfragen; Testadressen brauchen eine von Supabase akzeptierte Domain; das CDP-Skript als wiederverwendbares Muster für die Klickpfade in Spec 03–09.
