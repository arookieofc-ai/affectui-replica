# Filter Menu — replica report

## What was built
- ONE self-contained `./index.html` (24 KB, no network, no external assets, system fonts). Inline CSS + two inline scripts (component + theme toggle).
- Clean-room recreation of the `Filter Menu` component from `./demo-original.js`: grouped filters with removable chips, collapsible groups, clear-all, full keyboard control.
- Page: centered 420 px tray + card on a page background, visible Light/Dark toggle top-right. Component header is the original `Filters` + `Clear all` (no generic toolbar).

## Demo data used verbatim (from `demo-original.js`)
- Title `Filters`, hints on.
- Groups exactly as shipped:
  - `Stage`: `New lead`, `Qualified`, `Proposal sent`, `Negotiation`
  - `Deal size` (`chipPrefix: "Deal: "`): `Under $5k`, `$5k–20k` (en-dash U+2013), `$20k–50k`, `Over $50k`
  - `Region`: `DACH`, `Nordics`, `UK & Ireland`, `North America`, `APAC`
- `defaultValue = { stage: ["qualified"], value: ["m"], region: ["dach"] }` → initial chips `Qualified | Deal: $5k–20k | DACH`.
- `defaultOpen` = first group only (`Stage`); counts `4 / 4 / 5`; picked text `1 filter` / `N filters`; chip remove `aria-label="Remove <label>"`; hints `To navigate` (up/down kbd) + `To select` (return kbd).
- Behaviour matched: chip add/remove with wrap + height animation, group expand/collapse (grid-rows + opacity), checkbox `role="checkbox"` + `aria-checked`, `aria-expanded`/`aria-controls`, roving `tabindex` via `data-key` (`g:gi` / `o:gi:oi`), keys `ArrowDown/Up`, `Home/End`, `ArrowRight/Left`, `Enter/Space`, `Clear all` disabled when empty, `aria-live="polite"` on chips and picked counts.

## Spec compliance
- Design tokens as CSS custom properties; light default (original demo appearance: white card on `#f0f0f0` tray, ink `#171717`); dark theme via `html[data-theme="dark"]` (`surface #1c1c1f`, `page #101012`, `ink #ededed`, `muted #a1a1aa`, `subtle #26262a`, `border #2e2e33`). Toggle overrides + persists to `localStorage` (`filter-menu-theme`).
- `/*noflash*/` guard is the first script in `<head>`, sets `data-theme` from the stored key else `light` before paint, plus `html{background…}` inline style and `<meta name="color-scheme" content="light dark">`.
- No agent identities in this component, so no 3×3 pixel-marks (requirement applies only when agent identities exist).
- IN-PLACE updates only: DOM built once at init with `createElement`/`createElementNS`; state changes mutate text/attributes/classes on existing nodes (chip map diff, `textContent` updates, `insertBefore`/`removeChild` for chips only). Zero occurrences of `innerHTML`/`outerHTML`/`insertAdjacentHTML` in the page. Hover is CSS-only; focus updates roving `tabindex` in place, never rebuilds.
- Hard-won rules: `[hidden]{display:none!important}` present; SVG classes set only via `setAttribute("class",…)` (never `.className` on SVG); no broad `svg{display:block}` rule (icons use scoped `.fm-chip-icon`/`.fm-check` classes); no dialogs/popovers in this component so no pointer-capture issue; responsive narrow layout stacks full-width.

## Verification (node only, no browser, no installs)
- `node --check` on both extracted inline scripts: PASS (main + theme toggle).
- In-dir stub harness `./harness.cjs` (minimal DOM stub, no packages): loads `./index.html` scripts in order (noflash → main → toggle), flushes `requestAnimationFrame`, drives a full loop via `window.__filterMenu` (add/remove option, open/close groups, add prefixed + region chips, `clearAll`, restore defaults, arrow/Home/End keydown dispatches, theme toggle clicks).
  - Asserts VISIBLE `textContent` (never attributes): `Filters`, `Clear all`, all group/option labels verbatim, `Deal: $5k–20k` with prefix + en-dash, `To navigate`/`To select`.
  - Initial chips `Qualified | Deal: $5k–20k | DACH`, `open = ["stage"]`; after loop chips + open restored exactly.
  - Unchanged nodes keep object identity (`card`, `groups`, `chips`, all three sections, heads, option buttons `===` across the loop).
  - `innerHTMLWrites === 0` after init and after the full loop.
  - Light AND dark checked: noflash defaults to `light`; toggle click → `dark` (label `Dark`) with text intact; click → `light` (label `Light`). Final result: `HARNESS PASS chips=["Qualified","Deal: $5k–20k","DACH"] open=["stage"] theme=light innerHTMLWrites=0`.
- No package installs or downloads were used. Temp extracts were removed; `./harness.cjs` is kept in-dir for re-runs (`node ./harness.cjs`).

## How to test
- Open `./index.html` in a browser. Toggle Light/Dark top-right; toggle options, remove chips, collapse groups, use arrow keys + Enter/Space, press `Clear all`.
- Re-run verification: `node ./harness.cjs` (expects `HARNESS PASS … innerHTMLWrites=0`).

## Notes / not verified
- Pixel-perfect screenshot comparison against the live site was not possible (no browser in this environment); styling was matched from the compiled demo CSS values (spacing, radii, animation durations) rewritten as clean-room CSS.
- `ResizeObserver` height smoothing is best-effort (stubbed in harness, live in browsers).
