# 03 — Onboarding: Username wählen

## Ziel
Direkt nach der Registrierung wählt der Nutzer seinen Wunschnamen und sieht dabei sofort, ob dieser noch frei ist. Danach steht seine öffentliche Adresse `/u/<username>` fest, und er gelangt ins Dashboard. Solange kein Name gewählt ist, führt jeder Weg zurück auf diesen Schritt.

## Abhängigkeiten
- `01-datenmodell-ergaenzungen.md` ✅ (`username` muss nullable sein)
- `02-auth-email-passwort.md` ✅ (ohne Session kein Onboarding)

## Out of Scope
- Display-Name, Bio und Avatar-URL → `07-profil-section.md`. Das Onboarding fragt **nur** den Username ab (`guidelines.md` 002)
- Späteres Ändern des Usernamens (nicht im MVP; Backlog-Kandidat)
- Gestaltung des Dashboards → `04-dashboard-shell.md`

## Reservierte Namen
Diese Namen dürfen nicht vergeben werden:
`admin`, `root`, `api`, `auth`, `login`, `logout`, `signup`, `dashboard`, `settings`, `onboarding`, `u`, `www`, `support`, `help`

Als Konstante `RESERVED_USERNAMES` in `src/lib/username.ts`, verwendet von Client **und** Server.

## Akzeptanzkriterien
- [x] Ein frisch registrierter Nutzer landet auf `/onboarding`
- [x] Das Formular hat genau **ein** Feld: Username
- [x] Während der Eingabe erscheint eine Verfügbarkeitsanzeige („frei" / „schon vergeben"), verzögert um ca. 400 ms (Debounce)
- [x] Eingaben werden automatisch in Kleinbuchstaben umgewandelt
- [x] Namen unter 3 oder über 30 Zeichen werden abgelehnt, mit konkreter Meldung
- [x] Namen mit unerlaubten Zeichen (Leerzeichen, Punkt, Umlaut, Großbuchstabe) werden abgelehnt, mit konkreter Meldung
- [x] Reservierte Namen werden abgelehnt, mit eigener Meldung („Dieser Name ist reserviert.")
- [x] Unter dem Feld steht eine Vorschau der künftigen Adresse: `deine-domain.de/u/<eingabe>`
- [x] Nach dem Speichern landet der Nutzer auf `/dashboard`
- [x] Ein Nutzer **mit** Username, der `/onboarding` aufruft, wird auf `/dashboard` umgeleitet
- [x] Ein Nutzer **ohne** Username, der `/dashboard` aufruft, wird auf `/onboarding` umgeleitet
- [x] Wird derselbe Name gleichzeitig von zwei Nutzern abgeschickt, erhält der zweite die Meldung „Dieser Name ist leider schon vergeben." statt eines Absturzes

## Tasks
- [x] `src/lib/username.ts` — Regex `^[a-z0-9_-]{3,30}$`, `RESERVED_USERNAMES`, Funktion `validateUsername()` mit sprechenden Fehlermeldungen
- [x] `src/app/onboarding/page.tsx` — Server Component, prüft per `getClaims()` und lädt das Profil; leitet bei vorhandenem Username auf `/dashboard`
- [x] Client-Komponente `UsernameForm` mit `useActionState`, Debounce und Verfügbarkeitsanzeige
- [x] Server Action `checkUsernameAvailability(username)` — validiert erneut und fragt `profiles` ab
- [x] Server Action `claimUsername(formData)` — validiert, schreibt, fängt den Unique-Verletzungsfehler (`23505`) ab und übersetzt ihn in eine lesbare Meldung
- [x] Guard-Helper `requireProfile()` in `src/lib/supabase/auth.ts`, der bei fehlendem Username auf `/onboarding` umleitet — wird ab 04 in allen geschützten Layouts genutzt
- [x] Empty-/Ladezustände und Focus-States gemäß `rules/design-system.md`

## Validation
- `npx tsc --noEmit` grün
- Klickpfad: registrieren → `/onboarding` → `ab` eingeben (Meldung „zu kurz") → `admin` (Meldung „reserviert") → `Max Mustermann` (Meldung „unerlaubte Zeichen") → `maxmuster` (Anzeige „frei") → Absenden → `/dashboard`
- Kollisionstest: In zwei privaten Fenstern zwei Nutzer registrieren, beide denselben Namen abschicken → der zweite bekommt eine Meldung, keine Fehlerseite
- Redirect-Test: als Nutzer **mit** Username `/onboarding` aufrufen → landet auf `/dashboard`
- Redirect-Test umgekehrt: Username in der DB manuell auf `NULL` setzen, `/dashboard` aufrufen → landet auf `/onboarding`
- Datenbank: `select username from profiles where id = '<id>'` zeigt exakt den eingegebenen Namen in Kleinbuchstaben

## Relevante Rules/Skills
- `guidelines.md` 002 (Username-Regeln, Sperrliste, Forced Redirect)
- `CLAUDE.md` Kernprinzip 2: User-Input ist unsicher — Validierung client **und** server
- `rules/code-conventions.md`, `rules/design-system.md`

## Status
✅ fertig

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Die Trennung in `src/lib/username.ts` (regelrein, ohne Server-Imports) und `src/lib/username-form-state.ts` (Typen) hat dieselbe Prüfung ohne Duplikat auf beide Seiten gebracht. Der Guard `requireProfile()` bündelt den Forced Redirect an einer Stelle — Spec 04 ff. brauchen nichts weiter als diesen einen Aufruf im Layout. Die Card-Bühne aus `(auth)/layout.tsx` wurde nach `src/components/auth-shell.tsx` gezogen, statt sie für `/onboarding` zu kopieren.
- **Was war unerwartet:** Zwei Punkte. Erstens hat ESLint (`react-hooks/set-state-in-effect`) den naheliegenden Debounce-Aufbau abgelehnt — synchrones `setState` im Effect-Body ist verboten. Zweitens war der Submit-Button anfangs bei „schon vergeben" deaktiviert; damit wäre der in der Spec geforderte Kollisionstest (`23505`) über die UI gar nicht auslösbar gewesen.
- **Was fließt in `learning.md`:** Der Effect-Umbau (lokale Validierung beim Rendern ableiten, Effect nur für den Server-Call), die Regel „Komfortprüfung darf den Server-Pfad nicht unerreichbar machen", und dass das CDP-Klickskript aus AP 02 an diesem Formular nicht mehr greift, weil der Input controlled ist.
