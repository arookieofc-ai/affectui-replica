# REPORT — assistant-home (AI Chat / Start)

## What was built
Standalone `index.html` (~26KB, inline CSS+JS, system fonts only) replicating the
affectUI **AI Chat / Start** page (slug `assistant-home`):
- Top bar: brand mark + "Assistant" + Ready/Working pill, theme toggle (top-right), avatar.
- Greeting: "Good afternoon, Alex" (time-aware on init: morning/afternoon/evening) + "How can I help you today?"
- Prompt box: textarea ("Ask anything…"), Attach / Voice, model pill "Auto · 200k context", send button. Enter sends, Esc clears, typing enables send.
- Send flow: user message appended, "Working" status + animated typing dots, then a canned assistant reply typed char-by-char in place; context token counter (`0 / 200k tokens`, thin 3px bar) updates in place.
- Tools: 6 small circular icon buttons (Search, Code, Image, Canvas, Research, Voice) with `aria-pressed` toggles + live "N of 6 on" count.
- Connected apps: 6 cards (Gmail, Google Calendar, Google Drive, Slack, Notion, GitHub) with On/Off toggles, state text, live "N of 6 connected" count.
- Suggestions: 6 "Try asking" cards (click or keys 1–6 fills the prompt box); one is highlighted at a time and the highlight auto-rotates every 5s.
- Footer disclaimer + context card. Responsive: grids stack at ≤640px; keyboard support (Enter/Esc/1–6, focus-visible outlines).

## What matches the original
Description coverage (greeting, prompt box, tools, connected apps, suggestions) with interactive states (working/waiting/idle via status pill + typing indicator), hover/focus lift, card styles, radius/pills, muted secondary text, transitions 150–200ms.

## What could not be verified
`demo-original.js` in this directory is a 1-line re-export stub with **no demo data** (no names, models, tools, tasks). So all names/content above are plausible stand-ins in the same shape — not verbatim demo data. No browser was used (per instructions); verification is node-only via the DOM-stub harness. Real pixel fidelity vs. the production screenshot could not be checked.

## Spec compliance notes
- Tokens: all colours via CSS custom properties for light + dark (incl. amber waiting tokens reserved).
- Dark mode: `data-theme="light"|"dark"` on `<html>`, default from `prefers-color-scheme`, override persisted under key `assistant-home-theme`; verified both themes.
- v4: `<head>` starts with the `/*noflash*/` guard (stored key → `prefers-color-scheme` → `data-theme` before paint) + `html{background:#fafaf9}` / `html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`.
- v4 in-place: DOM built once (static HTML + cached refs); timers (suggestion rotation, typing) only mutate `textContent`/`classList`/`style`/`value` on existing nodes; the script contains zero `innerHTML`/`outerHTML`/`insertAdjacentHTML`.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (prompt card 16px outer / 10px inner + 6px padding); shadows for elevation + 1px borders only for structure/inputs/selected; image/logo inset outline `inset 0 0 0 1px var(--img-outline)` (black/white 10%); send arrow optically nudged with extra right padding compensation.
- Clean-room: written from the prompt description only; no compiled source copied.

## How to test
1. `open index.html in a browser` (double-click the file) — no server or build needed.
2. Node-only verification (no browser, no installs):
   - `node --check harness.cjs`
   - `node harness.cjs` — asserts visible painted text, full-loop (6-tick) node identity, zero `innerHTML` writes after init/loop, light AND dark themes, hover scoping, tokens, noflash guard.
   - Inline script syntax: extract last `<script>` to `main-check.js` and `node --check main-check.js` (artifact removed after check).
3. Toggle the moon/sun button to check dark mode; narrow the window to check stacked layout.

## Verification result
`node harness.cjs` → **HARNESS PASS** (66 checks); `node --check` clean on harness and extracted main script. Light AND dark themes confirmed via `data-theme` switching + persisted key.
