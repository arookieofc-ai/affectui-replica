# REPORT — settings-general replica

## What was built
Standalone `index.html` (self-contained, inline CSS+JS, ~25KB, no external deps) replicating affectUI **Settings / General** (`slug settings-general`, Screen, App screens, Pro).

Public description implemented: **Workspace settings with sidebar, identity rows, assistant context, danger zone.**

Layout:
- Top bar: gradient mark + `Acme Studio` + `Pro` pill + `App screens` pill, theme toggle (sun/moon, top-right), avatar.
- Left sidebar nav: Workspace (General active, Members with count 12, Subscription, Integrations) + Project (Prompts, Evals).
- Main: `General` title + subtitle, live `Synced / Saving… · Saved · Xs ago` line.
- Card 1 — **Workspace identity**: rows for Name (`Acme Studio`, inline Edit/Save/Cancel, Enter/Esc), Slug (`acme-studio`, Copy with clipboard + `Copied` feedback), Icon (gradient mark, Change cycles 4 styles), Description (inline edit).
- Card 2 — **Assistant context**: Default model select (`Muse Spark` / `AffectUI Pro` / `AffectUI Fast`), Tone select, instructions textarea, token counter `X / 200,000` with thin 3px bar (right-aligned label), 3 switches (memory on, web on, code off).
- Card 3 — **Danger zone**: Leave / Transfer / Delete workspace rows; Delete opens confirm modal requiring typing the workspace name; Leave/Transfer show demo toasts.
- Toast (`aria-live`) + modal dialog (Esc/backdrop close, focus on open, confirm disabled until name matches).

## What matches the original intent
- Tokens exactly per spec (light + dark), cards with 1px border + soft shadow, 150–200ms transitions, focus-visible outline, pills `999px`, base 14px system sans.
- Dark theme via `data-theme` on `<html>`, toggle overrides `prefers-color-scheme`; amber/red/green adjusted for dark.
- No-flash first paint: `/*noflash*/` script first in `<head>`, `html{background}` inline style, `color-scheme` meta.
- In-place updates only: DOM built once (static HTML); ticker/edit/toggles/theme mutate `textContent`/`class`/`attributes`/`style` on existing nodes; **zero `innerHTML`/`outerHTML`/`document.write` in the file**.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `tap-highlight: transparent`, `tabular-nums` on `body`, concentric radii, shadows for elevation / borders for structure, image outline on logo, optical icon-button padding (`padding-left:8px; padding-right:10px`).
- Responsive: `≤860px` stacks to single column, sidebar becomes horizontal.

## What could not be verified
- `demo-original.js` in this directory is a 289-byte stub (`DemoStage` wrapper, no names/models/tasks). Per spec rules, plausible demo data in the same shape was used (workspace `Acme Studio` / `acme-studio`, model `Muse Spark`, instructions text, 200k context). No Pro `.tsx` source was fetched or copied; all code is clean-room.
- No pixel comparison against the live Pro screenshot was possible in this environment (no browser launch per task constraints).

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` + visit page).
- Click sidebar items, Edit/Save name + description, Copy slug, Change icon, type in instructions (token bar moves), flip switches, change model, open Delete modal (type `Acme Studio` to enable), toggle sun/moon, resize narrow.
- Node-only verification (no browser):
  - `node --check ./harness.js`
  - extract main script and `node --check` it
  - `node ./harness.js` — asserts visible painted text, full-loop node identity (ticker ×40), zero innerHTML writes after init, in-place edit, light AND dark themes + toggle flip.

## Checks performed
- `node --check` on harness + extracted main script: pass.
- `node ./harness.js`: ALL HARNESS CHECKS PASSED (17 visible strings, node identity stable, zero innerHTML, light→dark→light, toggle flip).
- Light AND dark modes confirmed via harness theme switch with node stability; CSS contrast uses spec dark tokens (`#ededed` on `#101012`, `#a1a1aa` muted, `#2e2e33` borders).
