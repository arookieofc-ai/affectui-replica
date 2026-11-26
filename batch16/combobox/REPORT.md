# Combobox — Replica Report

## What was built
Single self-contained `index.html` (43KB, system fonts, no network) replicating the `Combobox` demo from `demo-original.js` as clean-room code. Page has a header (`Reviewers` + `N selected · 10 people` + open/closed + sun/moon toggle top-right) and a card containing the combobox. No pixel-marks: the component has no agent identities (reviewers only), so the 3×3 rule is N/A.

## Matched data (verbatim from demo-original.js)
- Options (10): `maya/Maya Chen/Product Designer/Design`, `jonas/Jonas Weber/Design Lead/Design`, `priya/Priya Raman/Brand Designer/Design`, `sara/Sara Okafor/Staff Engineer/Engineering`, `leo/Leo Martins/Frontend/Engineering`, `nina/Nina Petrova/Backend/Engineering`, `tom/Tom Becker/iOS/Engineering`, `elif/Elif Yilmaz/Head of Product/Product`, `daniel/Daniel Kim/Product Manager/Product`, `lucas/Lucas Moreau/Product Analyst/Product`; all `avatar:true` → initials (MC, JW, PR, SO, LM, NP, TB, EY, DK, LM).
- Demo props: `label="Reviewers"`, `defaultValue=["maya","sara"]`, `placeholder="Add reviewers…"`, `maxVisibleTags=4`, `creatable=true`, `createLabel=Invite “q”`, `defaultOpen=true`, `emptyText="No results"`, `multiple=true`.
- Strings: `No results for “q”`, footer `N selected` (nbsp), keys `↑ ↓ to move ↵ to toggle`, live `Label selected/removed`, `Label removed`, `Label – press Backspace again to remove`, aria `Selected`, `Remove X`, `Open/Close list`, `Options`.
- Behaviour: grouped filter (NFD-normalised, diacritic-insensitive), `<mark>` highlight, hover sets active, click toggles, Enter picks active/create, ArrowUp/Down wraps, Escape closes/clears, Tab closes, Backspace double-press removes, outside `pointerdown` closes, toggle button, overflow `+N` chip, footer count roll with up/down direction, pill highlights active option, chip leave 420ms.
- Timings: chip grid 260ms, chip inner 340ms, pop open 240ms, pill 220ms, list/roll 300ms, leave timeout 420ms.

## Match / deliberate simplifications
- CSS rewritten clean-room with required tokens; same radii/shadows/spacing, not copied verbatim.
- Field/list height ResizeObserver logic simplified to CSS max-height; pill positioned via `offsetTop/offsetHeight` guarded for stub.
- No React; vanilla DOM built once at init, all updates in place (`textContent`/`setAttribute`/`appendChild` only, zero `innerHTML`).

## Hard rules compliance
- `/*noflash*/` script is first child of `<head>`, plus `html{background:#fafaf9}html[data-theme=dark]{background:#101012}` and `meta color-scheme`.
- `data-theme="light"|"dark"` on `<html>`, default `light` (original appearance); toggle overrides and persists to `ui-theme`.
- DOM built once; timers only clear/add single chip nodes; hover/focus update classes only; `[hidden]{display:none}` present; SVG classes via `setAttribute` only; open on `pointerdown`/`mousedown` capture.

## Verification (node only, in-dir)
- `node harness.cjs` — **PASSED** (see below). Harness lives in this dir, uses a DOM stub, fake timers, counts `innerHTML` writes.
- Static: noflash at head top, tokens, toggle, hidden rule, verbatim names/hints/placeholder/label, `Invite “`, `No results`, no `http` src/href (only `xmlns`), default light.
- `node --check` on extracted script: passes.
- Runtime: initial visible `Maya Chen`, `Sara Okafor`, `Jonas Weber`, groups `Design/Engineering/Product`, `2 selected`; `defaultValue maya,sara`, `open true`; filter `pro` shows Product hides Jonas; choose `leo` → `3 selected`; remove + `advance(500)` → `2 selected`; Backspace arms `sara` then removes; `setQuery("Alex Rivera")` shows `Invite “Alex Rivera”` + `No results for “Alex Rivera”`; create selects it; ArrowDown moves active; option nodes keep identity 10/10 across loop; zero `innerHTML` writes.
- Themes: starts `light`, toggle → `dark`, toggle → `light`; dark tokens (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`, amber `#fbbf24/#451a03/#fde68a`) checked in markup; page verified finished in both (no grey-on-grey via token contrast).

## How to test
Open `index.html` in a browser. Type to filter, Enter to pick, Backspace twice to remove, click toggle. Use sun/moon button for light/dark. Or run `node harness.cjs` in this directory.

## Not verified in browser
Pixel-perfect screenshot diff and real `offsetTop` pill animation positions (stub returns 0/36); reduced-motion and container queries rely on CSS only.
