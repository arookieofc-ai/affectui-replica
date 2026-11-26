# App Shell Inset — replica report

## What was built
Standalone `index.html` (~26KB, inline CSS+JS, system fonts only) replicating the affectUI **App Shell Inset** (`app-shell`) demo:

- Collapsible left sidebar on page background: workspace switcher (Acme Workspace), sections **Workspace / Projects / Account**, nav items with **New chat** active, counts, profile row (Ada Lovelace), collapse control.
- Inset main panel (`layout: inset`, radius 16): top bar with sidebar toggle, breadcrumb `Acme Workspace / <active>`, Live pill, Share, theme toggle (top-right), avatar; work-area tab bar **Page / Artifacts (n) / Sources (3)** mapping to `workArea:{artifacts, newTab:{sources}}`; center scroll container with bare card **“Your page goes here” / “The shell brings both sidebars and the scroll container – put any screen inside.”**; resizable right panel (drag + keyboard) listing Artifacts/Sources; status bar with sync timer, `44k / 200k` context bar (3px) + tokens.
- Interactions: nav select updates breadcrumb/title in place; tabs switch panel in place; `+ Add artifact` appends in place; sidebar collapse (`B`), theme (`T`), panel toggle; 1s ticker cycles Live/Idle + sync text + context width in place; resize handle mouse + ArrowLeft/Right.

## Demo data (verbatim)
From `demo-original.js`: `layout: inset`, `active: New chat`, `workArea.artifacts`, `workArea.newTab.sources`, center `title: Your page goes here`, `text: The shell brings both sidebars and the scroll container – put any screen inside.` — all present as painted text. Workspace/Projects/Account names, artifact/source titles are plausible chrome in the same shape (noted as invented).

## What matches / clean-room
Written from description + demo behaviour only; no copied bundle source, no `innerHTML`/`insertAdjacentHTML`/`document.write` anywhere. DOM built once via `createElement`; ticks update `textContent/class/style` on existing nodes; loop restarts never rebuild. Tokens via CSS vars for light + dark; transitions 150–200ms; focus-visible; responsive (<900px stacked).

## v5 polish + v4
- `/*noflash*/` guard first in `<head>` + `html{background}` + `color-scheme` meta.
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (16 outer / 10 inner + borders for structure, shadows for elevation); avatar inset 1px ring black/white 10%; icon-button optical nudge.

## What could not be verified
No browser available (per task: node-only verification). Visual pixel-match vs original screenshots, real drag feel, and `prefers-color-scheme` first-paint in an actual engine were not eyeballed — only stub + token inspection.

## How to test
1. `node --check verify.js && node verify.js` — in this dir (no browser, no deps).
2. Open `index.html` in any browser: toggle sidebar, switch tabs, add artifact, drag divider, press `B`/`T`, switch sun/moon.
3. Confirm light AND dark: harness asserts visible center text in both themes; manually toggle top-right button — dark uses `#1c1c1f/#101012`, amber `#fbbf24 on #451a03`.

## Verification
- `node --check verify.js`: pass.
- `node verify.js`: ALL CHECKS PASSED — size <200KB, noflash order, tokens, hover/tap/tnum, verbatim text, zero `innerHTML`, syntax valid, stub init, VISIBLE text (New chat, Your page goes here, Workspace/Projects/Account/Artifacts/Sources), full-loop node identity (107 nodes, 4-tick loop ×2), zero innerHTML writes after init, light+dark toggle.
