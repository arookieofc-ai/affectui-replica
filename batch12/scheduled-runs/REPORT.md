# Scheduled Runs — replica report

## What was built
`index.html` (~49 KB, single self-contained file, no network, system fonts) replicating
the affectUI **Scheduled Runs** component: agent tasks sorted into weekly sessions
(Tue 27 / Wed 28 / Thu 29 × 07:00 / 12:00 / 17:00) with per-session usage limits
(100/session, max 2 tasks per cell, 15 minimum piece) and automatic splitting of
large tasks across sessions.

Clean-room implementation: own HTML/CSS/JS written from the observed behaviour;
no verbatim code taken from the compiled demo bundle.

## Original data/behaviour matched (verbatim from `demo-original.js`)
- Header: title `This week`, note `5-hour sessions`, agent crew filter
  (Claude Code, Codex, Gemini CLI), `11 tasks` total, Auto/Manual segmented control.
- All 11 tasks with exact titles, agents, details, usages and stats, e.g.
  `Upgrade to React 19` (30, files 48 / pr 1), `Migrate auth to OAuth 2.1`
  (140 → visibly splits into parts `1/2` + `2/2`), `No room this week` /
  `Everything's scheduled` states, `Over` / `Full` / `Only N% left` cell labels,
  session-limit `%` tags, thin bottom usage bars, `···` now-line in the current
  session (Tue 07:00→12:00 boundary, i.e. cell index 1), past sessions dimmed.
- Timings: auto-run starts after 1200 ms, fly animation 640 ms, 160 ms gap between
  placements, week resets and loops after 3200 ms (`loop: true`).
- Scheduling core ported 1:1 (same fit/split rules: booked cells forced,
  drop-wrap from the current session, min-piece 15, max 2 per cell).
- Interactions: pointer-drag with ghost + snap-back, click/Enter details popover
  (`Needs`, `Agent`, `Session`, hint rows), Space pickup + arrows + Space/Enter
  drop + Escape cancel with polite live-region announcements, agent filter dim,
  Manual mode (pauses engine, keeps booked + hand-placed), Auto resumes.
- Full grid roles (`grid`/`row`/`gridcell`/`columnheader`/`rowheader`), focus-visible
  rings, stacked layout under 640 px.

## Deliberate deviations (per worker spec v3)
- Agent identity is a deterministic 3×3 pixel-mark per agent id (EXACTLY 9 cells,
  hue hashed from the name; fresh/working marks twinkle) instead of the demo's
  assorted logo SVGs. Dimmed tiles use opacity 0.75 (spec legibility floor).
- Session-share context kept as the original's `%` + 3 px bottom bar.
- Default theme is light (the original demo's appearance); OS `prefers-color-scheme`
  is honoured when dark, and the sun/moon toggle (top-right of the bar) overrides.

## Hard-won rules applied
- No DOM rebuild in any fast path: `render()` runs only on state changes
  (placements, mode, filter, dialog open/close); pointermove only moves the ghost
  and flips `data-over` classes; hover/focus are CSS-only (`:hover`, `:focus-visible`).
- Popover outside-close uses a `pointerdown` listener in the capture phase; tile taps
  open on click without `preventDefault`, so real clicks survive.
- Explicit `[hidden]{display:none !important}` rule; help paragraphs use `hidden`.
- SVG classes set only via `setAttribute('class', …)` — never `.className` on SVG.
- No browser launched; verification is node-only.

## Verification (light AND dark checked)
`node verify-harness.cjs` (in-dir stub-DOM + fake-timer harness): **45 passed, 0 failed**.
- `node --check` passes on the extracted script.
- Initial light render: all task titles, agents, days, times, `30%`/`140%`, tray count 6.
- Every `.px` pixel-mark has EXACTLY 9 cells; CSS scan finds no `display:none` /
  `visibility:hidden` / `font-size:0` / `color:transparent` on text elements (only
  `[hidden]`, `sr-only`, collapsed-tray and landing-chip rules).
- Dialog opens on tap (detail + `split over 2 sessions`), closes on Escape.
- Theme toggle → dark: key texts still visible; toggles back to light.
- Full loop driven through fake timers: tray drains to `0` with `Everything's
  scheduled`, split labels `1/2` seen, week resets and auto-scheduling restarts.
- Keyboard: Space pickup announces, Escape cancels, Manual/Auto radios switch.

## How to test
Open `index.html` in a browser. Watch the tray auto-schedule (~1.2 s start, split
task flies in two parts), drag chips between sessions, click tiles for details,
filter by agent, switch Manual, and flip the sun/moon toggle for dark mode.
