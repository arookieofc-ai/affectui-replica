# REPORT — Profile Menu replica

## What was built
- Single self-contained `index.html` (21 KB, no network, system fonts) replicating the **Profile Menu** account card:
  - Gray tray (`6px` padding, outer radius `16+6px`) framing a white/ink card, exactly like the original `.ui-pm` structure.
  - Signed-in user header: 42px circular avatar (clean-room person fallback in component blue), name `Lena Hartmann`, email `lena.hartmann@fastmail.com`.
  - Menu `role="menu"` / `aria-label="Account"` with 4 verbatim actions: `Settings` (gear), `Docs` (file), `Apps` (grid-plus, badge `New`), `Logout` (logout glyph). Roving keyboard: `ArrowDown/Up/Home/End`.
  - Setup block: `Profile setup`, count `3/5` (`Intl.NumberFormat('en')`), `role="progressbar"` `0–100` value `60`, thin `4px` track, fill `scaleX(0.6)` animated `900ms ease 150ms` after reveal, `Next: Add a profile photo` with arrow.
  - Page chrome: header `Profile Menu · Lena Hartmann · 4 actions · Setup 3/5` + visible sun/moon theme toggle (top-right); demo panel with `Focus first item` / `Trigger next step` and a live `role="status"` line. Responsive (cards go full-width under 560px).
- Clean-room code: all HTML/CSS/JS rewritten; icons are own simplified strokes (gear spokes+hub, doc+fold, 3-tile+plus, logout arrow, right arrow, person). No compiled source pasted.
- No agent identities in this component, so no 3×3 pixel-marks (correctly omitted per “only if the component has agent identities”).

## Matched data / behaviour / timings
- Verbatim: `Lena Hartmann`, `lena.hartmann@fastmail.com`, `Settings/Docs/Apps/New/Logout`, `Profile setup`, `3/5`, `Next: Add a profile photo`, `aria 0/100/60`, `max-height 380px` scroll list, `IntersectionObserver threshold 0.3` reveal with `2500ms` safety fallback and `400ms` no-IO fallback.
- Interactions: item click reports `Selected: <label> — opening…` (logout: `signing out…`); Next click reports `continuing setup…`; focus management preserved; theme persists under `pm-theme`.
- In-place only: DOM built once at init via `createElement`/`createElementNS` + `setAttribute`; timers/handlers update `textContent`/attributes/`style.transform` on existing nodes. No `innerHTML` anywhere in page script; hover/focus never re-render.

## v5 polish compliance
- All `:hover` (8 rules) inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}` (+ count); concentric radii (tray `calc(16px+6px)`); borders for structure + layered shadows for elevation; avatar `img` 1px inset outline via `var(--content-outline)`; optical nudge (icon side 2px less padding on items and Next arrow).
- `/*noflash*/` guard first in `<head>` + `html{background}` paint block + `color-scheme` meta; `[hidden]{display:none!important}`; SVG classes only via `setAttribute`; no broad `svg{display}` override.

## Verification (node only, no browser)
- `node --check` on the extracted page script: **pass**.
- In-dir stub harness `verify-harness.js` (stays in this directory): fake DOM + fake timers, loads the real page script, advances timers through the full loop (fill reveal), clicks all 4 items + Next, tests Arrow/Home/End focus, toggles `light↔dark`, asserts **visible** `textContent` (not markup) contains all verbatim strings, asserts node identity preserved across the loop and **zero `innerHTML` writes after init**. Result: **HARNESS PASSED — light AND dark checked**.
- Checked: light default matches original (white card on `#fafaf9`); dark uses `#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33` with adjusted badge/track; no grey-on-grey.

## How to test
- Open `index.html` in a browser. Click menu items and `Next`; use keyboard arrows; toggle Dark/Light (persists); narrow the window to check stacking.
- Re-run: `node --check` on extracted script and `node verify-harness.js` in this directory.
