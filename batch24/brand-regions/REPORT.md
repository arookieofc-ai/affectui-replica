# fix-brand-regions — dark-theme bubble invisibility (targeted fix)

## Defect (real-browser QA)
Dark theme only: the map bubbles turned dark grey, nearly identical to the dark
background, so the map's data encoding was lost in dark. Light theme bubbles
were vivid blue; the right-hand list text stayed readable in dark.

## Original behaviour (checked `./demo-original.js`)
Not the same as the bug — no fix declined. The original keeps data fills visible
in dark:
- `--br-blue: 0,96,226` (light) → `77,141,255` (dark), both vivid blue.
- `--br-land: rgba(0,0,0,0.07)` (light) → `rgba(255,255,255,0.09)` (dark), used
  only for non-data land via `.ui-br-land{fill: var(--br-land)}`.
- Data countries: `.ui-br-land[data-data]{fill: rgba(var(--br-blue), var(--v))}`
  with `--v = .18 + normalized*.62`, plus
  `.ui-br-land[data-on]{fill: rgba(var(--br-blue),0.9); stroke: rgb(var(--br-blue))}`.
- Dark only redefines the `--br-blue` / `--br-land` variables; there is no
  dark-specific `fill` rule that overrides `[data-data]`. So data stays blue in dark.

## Root cause in `./index.html`
Specificity inversion introduced by the replica's dark base rule:
- Base: `.land{fill:rgba(0,0,0,.07)}` — spec (0,1,0).
- Data: `.land[data-data]{fill:rgba(var(--blue),var(--v,.4))}` — spec (0,2,0), wins in light. Good.
- Dark base (before fix): `html[data-theme="dark"] .land{fill:rgba(255,255,255,.09)}` — spec (0,2,1).
  The extra `html` element beats `.land[data-data]` (0,2,0), so in dark every
  bubble (circles with `class="land"` + `data-data`) was repainted with the
  background-land grey instead of the blue accent. Effective result: dark-grey
  bubbles on a near-black map — invisible data encoding.

## Fix (one line, `./index.html` only)
```css
html[data-theme="dark"] .land:not([data-data]){fill:rgba(255,255,255,.09)}
```
Scopes the dark background-land grey to non-data shapes only, so data bubbles
fall through to the existing accent rule in both themes:
`.land[data-data]{fill:rgba(var(--blue),var(--v,.4))}` with
`--blue 0,96,226 → 77,141,255`, plus unchanged
`.land[data-on]{fill:rgba(var(--blue),.92);stroke:rgb(var(--blue))}`.
Light rendering is untouched (same winner, same tokens). Stroke left as-is
(`stroke:var(--surface)`); fill dominates visibility.

Nothing else changed: `/*noflash*/` guard, in-place updates only, zero
`innerHTML` writes after init, demo `REGIONS`/`POS`/`RAD` data verbatim, and the
Share of Voice list interaction (`setMeasure('sov')` + hover/tooltip/zoom) intact.

## Verification (node only, in-dir)
- `node --check ./harness.js` — OK.
- Extracted inline script `node --check` — OK (also `vm.Script` parse inside harness).
- `node ./harness.js` — ALL PASSED (see console):
  - VISIBLE light: data-bubble winner is `rgba(var(--blue),…)` with `--blue 0,96,226`.
  - VISIBLE dark: data-bubble winner is `rgba(var(--blue),…)` with `--blue 77,141,255`
    (contrast vs `#101012` ≈ 5.95, vs buggy grey ≈ 1.3); dark base no longer matches `[data-data]`.
  - Share of Voice: `setMeasure('sov')` updates head to “Share of voice”, hover sets
    `data-on` + tooltip, clear removes it.
  - Full loop (measures × periods × hovers × zooms × light/dark): row `_li/_btn/_val/_delta`
    and bubble path object identity preserved; `--v` retained; zero `innerHTML` writes
    during init and across the loop.

## How to test in a browser
Open `./index.html`, toggle the sun/moon button: bubbles stay vivid blue in both
themes; hover a bubble/row highlights both and shows the tooltip; “Share of Voice”
re-sorts the list; no white first-frame flash in dark.
