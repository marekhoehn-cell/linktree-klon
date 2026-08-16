# Verifikations-Regeln

Kein Arbeitspaket gilt als fertig, weil der Code geschrieben ist. Fertig heißt: **nachweislich funktioniert**.

## Pflicht-Ablauf nach JEDEM Arbeitspaket

| # | Schritt | Konkret |
|---|---|---|
| 1 | Akzeptanzkriterien abhaken | Spec in `specs/` öffnen, jedes Kriterium einzeln prüfen — nicht überfliegen |
| 2 | Validation durchlaufen | Die für den Paket-Typ passende Verifikation aus der Liste unten wirklich ausführen |
| 3 | Typecheck grün | `npm run typecheck` — 0 Fehler. Zusätzlich `npm run lint` |
| 4 | Spec-Status auf ✅ | Status-Feld der Spec-Datei aktualisieren |
| 5 | `changelog.md` | Was wurde gebaut (Ergebnis, nicht Dateiliste) |
| 6 | `learning.md` | Was war überraschend, was ging schief, was würde man anders machen |
| 7 | Commit | **Erst ab Arbeitspaket 10.** Bis dahin gilt `CLAUDE.md` Kernprinzip 4: nichts wird committet oder gepusht, der Stand liegt unversioniert im Arbeitsverzeichnis. Ab Paket 10 dann ein Commit pro Arbeitspaket mit aussagekräftiger Message |

Wenn ein Schritt fehlschlägt: **zurück zur Umsetzung**, nicht weiter zum nächsten Paket.

## Verifikation nach Arbeitspaket-Typ

### Supabase-Schema / Migration
- `list_tables` (Supabase MCP): Existieren Tabellen, Spalten, Typen, Constraints und Foreign Keys wie in der Spec?
- Policies prüfen: Ist RLS auf jeder Tabelle **aktiv**? Gibt es die geplanten Policies (public SELECT, Owner-Policies für INSERT/UPDATE/DELETE)?
- `get_advisors` (Security + Performance): Keine offenen Security-Warnungen. Fehlende Indizes auf Foreign Keys bewusst entscheiden.
- **RLS-Test mit zweitem User:** Mit User B einloggen und versuchen, die Links/das Profil von User A zu lesen (muss gehen, public SELECT) und zu ändern/löschen (muss fehlschlagen). Ohne diesen Test ist RLS nicht verifiziert.
- Nach Schema-Änderung: Types neu generieren (`generate_typescript_types`), danach Typecheck.

### Auth-Flow
- Sign-Up real durchklicken: neuer Account, E-Mail + Passwort, landet auf der erwarteten Seite.
- Sign-In real durchklicken, inklusive **falsches Passwort** → verständliche Fehlermeldung, kein Crash.
- Sign-Out: Session weg, geschützte Route ist danach nicht mehr erreichbar.
- **Session nach Reload prüfen:** eingeloggt, F5 — noch eingeloggt? (Häufigster Fehler bei Next.js: Cookie-Handling im Server-Client.)
- Geschützte Route direkt per URL aufrufen, ohne Login → Redirect.

### UI-Komponente
- **Visual Verification Loop** mit `browser-use --headed`: Seite aufrufen, ansehen, Abweichung zum Ziel benennen, korrigieren, erneut ansehen.
- **3–4 Iterationen sind normal** — der erste Versuch sieht nie fertig aus. Nach einem Durchgang aufhören ist der Fehler.
- Pro Durchgang prüfen: **Hover-State**, **Focus-State** (Tab-Taste durchsteppen), **Dark Mode**, Mobile-Breite.
- Abgleich mit `rules/design-system.md`: keine flachen Farben, kein `#000`/`#fff`, `rounded-2xl`, weiche Shadows, Transitions ≥ 150 ms.

### API-Route / Server Action
- **Happy Path:** gültige Eingabe → korrektes Ergebnis, in der DB nachprüfen.
- **Fehlerfall:** ungültige Eingabe (leerer Titel, kaputte URL, ungültige Hex-Farbe) → sauberer Fehler, kein 500er, nichts in der DB gespeichert.
- **Unauthentifizierter Zugriff:** ohne Session aufrufen → abgelehnt (401/Redirect), kein Datenleck.
- **Fremder Datensatz:** eingeloggt als User B eine Ressource von User A ändern → abgelehnt.

### Deployment
- Preview-Build auf Vercel läuft durch (Build-Log ohne Fehler, nicht nur lokal).
- Env-Vars in Vercel gesetzt (Supabase-URL + Publishable Key) — für Preview **und** Production.
- Öffentliche Profilseite über die Preview-URL aufrufen: lädt, zeigt Links, Accent-Farbe korrekt.
- Login auf der Preview-URL testen — nicht nur auf `localhost`.
