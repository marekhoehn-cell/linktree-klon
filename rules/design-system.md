# Design-System-Regeln

Verbindliche UI-Regeln für dieses Projekt. Gilt für jede Komponente, jede Seite, jedes Arbeitspaket.

## Ziel-Niveau

**Orientierung an:** Bento.me, Cal.com, Linear, Raycast, Vercel, Arc Browser, Framer.

**Ausdrücklich nicht:** Default-Bootstrap-Look, unveränderte shadcn-Demo, generische Link-Listen mit grauen Buttons untereinander.

Faustregel: Wenn ein Screenshot der Seite auch aus einem beliebigen Tutorial stammen könnte, ist sie nicht fertig.

## Harte Regeln

| # | Regel | Warum |
|---|---|---|
| 1 | **Dark-Mode-Tokens von Anfang an** — jede Komponente wird gegen Light **und** Dark gebaut und in beiden geprüft. Ein Umschalter fehlt bewusst: das Root-Layout setzt keine `.dark`-Klasse, die Prüfung läuft über die Farbschema-Emulation des Browsers | Nachgerüsteter Dark Mode führt immer zu Farbfehlern und hardcodeten Werten |
| 2 | **Keine flachen Farben** — Flächen bekommen Gradients, Abstufungen oder Layering (Karte auf Hintergrund, subtiler Border, leichter Innenschein) | Flache Einfarbflächen sind das Hauptmerkmal von Amateur-UI |
| 3 | **Keine harten `#000` / `#fff`** — immer abgestufte Neutrals (z. B. `#0a0a0b` statt Schwarz, `#fafafa` statt Weiß) | Reines Schwarz/Weiß wirkt hart und ermüdet die Augen |
| 4 | **Hover- UND Focus-State auf jedem interaktiven Element** — Pflicht, kein Element ohne beides | Focus = Tastaturbedienung/Barrierefreiheit. Hover allein reicht nicht |
| 5 | **Smooth Transitions, min. 150 ms, `ease-out`** — keine harten Sprünge bei Hover/Focus/Öffnen | `ease-out` startet schnell und bremst ab — wirkt reaktionsschnell |
| 6 | **`rounded-2xl` als Default für große Flächen, `rounded-xl` für flache Elemente** — keine rechteckigen Cards. In diesem Theme sind `--radius-2xl` **36 px**: bei einer rund 60 px hohen Link-Karte ist das mehr als die halbe Höhe, der Browser skaliert die Radien herunter und die Karte wird zur verzogenen Kapsel | Konsistente Rundung, die aber zur Elementhöhe passen muss; Ausnahmen bewusst und begründet |
| 7 | **Weiche, mehrschichtige Shadows** — mehrere gestapelte Schatten (nah+eng, weit+weich) statt einem harten Kasten-Schatten | Erzeugt echte Tiefe statt "Box mit grauem Rand drunter" |

### Kurz erklärt
- **Layering:** Ein Element wirkt nur dann erhaben, wenn Hintergrund, Fläche, Border und Schatten zusammenspielen — nicht durch Schatten allein.
- **Focus-State:** Der sichtbare Ring, wenn ein Element per Tab-Taste angesteuert wird. Nie `outline: none` ohne Ersatz.

## Theming-Architektur (zweistufig)

### Ebene 1 — Globale Design-Tokens (statisch)

- Quelle: Export von **tweakcn.com** (visueller Theme-Generator für shadcn/Tailwind).
- Ablage: **`src/app/globals.css`** — das ist die **Single Source of Truth**.
- Enthält u. a. `--background`, `--foreground`, `--radius`, `--shadow-*` sowie die restlichen shadcn-Tokens.
- Diese Werte sind **statisch**. Sie werden nicht zur Laufzeit verändert und nicht in Komponenten überschrieben.
- Farbwerte gehören ausschließlich hierher — in Komponenten nur Token-Klassen (`bg-background`, `text-foreground`), niemals rohe Hex-Werte.

### Ebene 2 — Dynamischer Accent pro Public-Page

- Überschrieben wird **ausschließlich der eigene Token `--brand`** (Wert kommt aus `profiles.accent_color`) — **nicht `--accent`**. Begründung in `guidelines.md` 004: `--accent` ist in `globals.css` bereits shadcns heller Hover-Ton für Ghost-Buttons, Dropdown-Items und Command-Menü. Ein Override mit einer gesättigten Nutzerfarbe würde jeden Hover-State der Seite knallbunt machen.
- Umsetzung **als CSS-Variable**, nicht als Style-Injektion:

```tsx
// gut: Wert landet in einer CSS-Variablen, das Styling bleibt in CSS
<div style={{ "--brand": safeAccent(profile.accent_color) } as React.CSSProperties}>

// schlecht: roher CSS-/Style-String aus der DB
<div style={{ background: profile.accent_css }}>
<style>{`.page { ${profile.custom_css} }`}</style>
```

- **`<style dangerouslySetInnerHTML>` ist im gesamten Projekt verboten** — dort greift Reacts Escaping nicht, der `</style>`-Breakout ist echter Stored XSS.
- Kein Farbwert erreicht JSX, ohne durch **`safeAccent()`** aus `src/lib/theme.ts` gegangen zu sein. Die Funktion wirft nie, sondern fällt auf den Default zurück.
- Abgeleitete Töne (Hover, Subtle, Ring) über `color-mix(in oklab, …)`. Die Textfarbe auf der Akzentfläche wird automatisch als `--brand-foreground` auf denselben Wrapper gesetzt (Luminanz-Schwelle 0.17913).
- Alles andere (Radius, Shadows, Neutrals) bleibt global identisch — der Accent ist der einzige Freiheitsgrad.

## Sicherheitsregel: Accent-Color

Die Accent-Farbe ist ein **User-Input, der in CSS landet** — also potenzieller Injection-Vektor.

| Ebene | Prüfung |
|---|---|
| Client | `/^#[0-9a-f]{6}$/i` vor dem Absenden |
| Server (Server Action / Route Handler) | dieselbe Prüfung erneut — Client-Validierung ist nur Komfort, nie Schutz |
| Datenbank | zusätzliche `CHECK`-Constraint auf `profiles.accent_color` (bereits vorhanden) |

Regeln:
- Erlaubt ist **ausschließlich** ein 6-stelliger Hex-String mit führendem `#`. Keine Kurzform (`#fff`), kein `rgb()`, kein `hsl()`, keine Farbnamen.
- **Niemals** einen rohen CSS- oder Style-String aus der DB akzeptieren oder rendern.
- Bei ungültigem Wert: auf den globalen Default-Accent zurückfallen, nicht rendern und nicht raten.

```ts
// gut
const ACCENT_RE = /^#[0-9a-f]{6}$/i;
const accent = ACCENT_RE.test(input) ? input : DEFAULT_ACCENT;

// schlecht
const accent = input; // ungeprüft in CSS
```

## Checkliste vor "fertig"

- [ ] Dark Mode geprüft (nicht nur Light)
- [ ] Kein `#000` / `#fff`, keine flache Einfarbfläche ohne Gradient/Layering
- [ ] Jedes interaktive Element hat Hover **und** Focus
- [ ] Transitions ≥ 150 ms, `ease-out`
- [ ] Cards `rounded-2xl` (flache Elemente wie Link-Karten `rounded-xl`), Shadows mehrschichtig
- [ ] Keine Hex-Werte in Komponenten — nur Tokens aus `globals.css`
- [ ] Accent client- und serverseitig gegen `/^#[0-9a-f]{6}$/i` validiert
