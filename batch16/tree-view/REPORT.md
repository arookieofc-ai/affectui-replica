# Tree View — replica report

## What was built
ONE self-contained `index.html` (25 KB, no network, system fonts only) replicating the affectUI **Tree View** file-explorer demo as clean-room code. Layout: centered card with header (`Workspace` / `research-agent`), scrollable `role="tree"`, footer breadcrumb. Design tokens via CSS custom properties; light + dark themes with a fixed top-right sun/moon toggle (`data-theme` on `<html>`, persisted as `tree-view-theme`). `<head>` starts with the `/*noflash*/` guard + `html{background}` paint style + `meta color-scheme`. Includes the required `[hidden]{display:none}` rule; all SVG classes set via `setAttribute` (no `.className` on SVG); hover/focus are CSS-only.

No agent identities exist in this component (file tree, not an agent crew), so no 3×3 pixel-marks were added — correctly omitted per the "EXACTLY 9 cells **if** the component has agent identities" rule.

## Matched data / behaviour (verbatim from demo-original.js)
- Tree data verbatim: `prompts` (meta `3`) → `system.md`, `tools.md`, `style-guide.md`; `runs` → `run-418` (`Today`) → `report.md` (`12 KB`), `sources.csv` (`48 rows`), `charts` → `revenue-by-region.png`; `run-417` (`Yesterday`) → `report.md` (`9 KB`); `run-409 · archived` (disabled, empty children); `memory` (empty → `Empty`); `knowledge` → `pricing-2026-competitor-analysis-final-v3-reviewed.pdf` (`2.4 MB`); `agent.yaml`; `README.md`. Titles `Workspace`, `research-agent`; foot `Pick a file` → breadcrumb joined with ` / ` (final `runs / run-418 / report.md`).
- Behaviour: chevron rotation, indent guides (`data-guides` + `::before`, highlighted on selected branch), folder open/closed icon swap, selection highlight + 500-weight label, disabled row (no select/toggle, mousedown prevented), `Empty` row for childless folders, grid-rows fold animation, roving tabindex, full keyboard model (ArrowUp/Down/Home/End, ArrowLeft/Right with RTL awareness, Enter select+toggle, Space select, `*` expand siblings, 700 ms typeahead), focus-restore to parent when the focused node unmounts from view.
- Timings/loop verbatim: 3 one-shot timeouts at **900 / 2000 / 3100 ms** (`900+i*1100`): `[runs]/null` → `[runs,runs/418]/null` → `[runs,runs/418]/runs/418/report`. Pointerdown/keydown capture on the demo root clears pending timers (user takes over). No auto-restart — matches the original effect (runs once, then stays).
- In-place only: full tree built once at init; timers/keyboard/clicks update only `aria-expanded`/`aria-selected`/`tabindex`/`data-open`/`data-kind`/icon child/`textContent` on existing nodes. No `innerHTML`/`insertAdjacentHTML` anywhere; nothing rebuilds from hover/focus.

## Verification (node only, in-dir files, no browser/packages)
- `node --check verify-extracted.js` (main `<script>` extracted from `index.html`) → OK.
- `node verify.cjs` (in-dir DOM-stub harness): loads the page script in a `vm` sandbox with a fake document, captures the 3 timers, advances the full loop, asserts **visible** `textContent` (labels, metas, foot — never aria-only), exact foot breadcrumb, expanded/selected state per step, roving tabindex start (`prompts`) → end (selected), theme toggle flips `light↔dark` + persists, `localStorage` key, node identity (`li` objects for 7 ids `===` before/after loop), and `innerHTML` write count == 0. All 40+ assertions pass (`VERIFY OK`).
- Light AND dark checked: toggle flip both directions + dark-token CSS (`[data-theme="dark"]` overrides for surface/page/ink/muted/subtle/border, tree wash/fill/guide/focus) asserted; page legible in both (no grey-on-grey, borders visible).
- Static checks: noflash guard position (<500 chars), color-scheme meta, tokens, header strings, zero `innerHTML`, zero `.className=`, SVG namespace is the only `http*` string (no fetches).

## How to test
Open `index.html` in a browser. Wait ~3 s: `runs` expands → `run-418` expands → `report.md` selects with breadcrumb. Click rows/chevrons, use arrow keys/Home/End/Enter/Space/`*`/typing, toggle the ◐/☾ button (persists). Narrow window stacks cleanly.

## Not verified / notes
- Pixel-perfect icon paths differ (clean-room glyphs); semantics (folder/file/csv/image/pdf/yaml) match.
- No browser run attempted per constraints; animation smoothness and screen-reader narration not manually verified beyond ARIA attributes.
