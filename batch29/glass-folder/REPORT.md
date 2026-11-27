# REPORT — glass-folder replica

## What was built
Single standalone `index.html` (23 KB, inline CSS+JS, system fonts only) replicating affectUI **Glass Folder** (slug `glass-folder`): a glassy blue folder with documents behind a frosted pocket that tips open on hover.

Scene:
- Blue glass folder back with tab + shine, 4 document cards peeking out, frosted pocket front (`backdrop-filter: blur(14px) saturate(1.35)`) with highlight edge.
- Hover (pointer-fine only) tips the pocket `rotateX(14°)`, lifts the top doc; click / Enter / Space toggles `.is-open` (`rotateX(16°)` + docs fan out); Esc closes.
- Side panels: Editors (deterministic 3×3 pixel-marks, working twinkle) + Documents list with small circular type icons (PDF/SK/CSV/MD), click-to-open details, keyboard `←/→` selection, focus-visible outlines.
- Header follows v3 pattern: project name `glass-folder` + counts (`1 open`, `2 editors`) + theme toggle top-right; thin 3 px context bar with counts `1.8 MB / 10 MB` right-aligned.
- Live timers: auto-advance selection every 4.2 s + `Synced Ns ago` ticking every 1 s, all in-place.

## Demo data
`./demo-original.js` contains no verbatim data (single line re-exporting a compiled chunk: `import{t as e}... function r(){...glass-folder-demo...}`). So plausible data in the same shape was used:
- `Brand refresh brief.pdf · 2.4 MB · 2h ago`
- `Homepage hero.sketch · 8.1 MB · 5h ago`
- `Q3 invoice — Acme.csv · 184 KB · 1d ago`
- `Launch checklist.md · 12 KB · 2d ago`
- Editors Ana (working) / Leo (idle).

## What matches
- Look: blue glass, frosted pocket, doc stack, pills (999 px), 14 px system sans, card padding 12–16 px, gaps 8–12 px.
- Behaviour: hover tip-open, click toggle, doc select → details, keyboard, responsive stack <640 px, dimmed opacity 0.78 (≥0.75), single-line ellipsis titles.
- Tokens via CSS vars; dark theme via same tokens; amber/green/blue states adjusted for dark.
- v4: `/*noflash*/` guard first in `<head>`, inline `html{background…}` + `meta color-scheme`, DOM built once, all ticks/hover/focus mutate nodes in place, no `innerHTML` in app code.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radius (card 20 px = inner 12 px + 8 px padding), shadows for elevation / borders for structure, inset-outline via `inset 0 0 0 1px` neutral 10%, icon-side 2 px less padding on theme/btn.

## What could not be verified
- No original screenshot / Pro `.tsx` available (per spec, not fetched); match is to the prompt description + generic affectUI tokens. Exact blue hues, blur radius, doc fan angles are best-effort.
- Visual paint checked via DOM-stub only (no browser launch per task); backdrop-filter blur assumed supported.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit). Hover the folder, click to open/close, click docs, try keyboard, toggle sun/moon, resize narrow.
- Node-only verification (no browser):
  - `node --check harness.cjs`
  - `node -e "…extract __glass script to extracted.check.js…"` then `node --check extracted.check.js`
  - `node harness.cjs` — asserts visible painted text, full-loop node identity, zero innerHTML writes after init, light AND dark themes.

## Theme check
Confirmed both: `setTheme('light')` → `data-theme="light"` with full painted text; `setTheme('dark')` → `data-theme="dark"` with full painted text, dark tokens (`#1c1c1f/#101012`, amber `#fbbf24` on `#451a03`). Toggle persists to `glass-folder-theme`, defaults to `prefers-color-scheme`. Harness: ALL CHECKS PASSED.
