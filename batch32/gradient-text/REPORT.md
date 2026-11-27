# Gradient Text — replica report

## What was built
ONE self-contained `index.html` (inline CSS + JS, system fonts, no network, <200KB) in this directory.

- Page chrome: top bar with `Gradient Text` brand + visible sun/moon theme toggle (top-right), main card (`16px` outer / `10px` inner concentric, `6px` inset) containing the demo.
- Demo: `Interfaces people actually feel.` where `feel.` uses the liquid gradient; `Replay` pill button; `sweep` checkbox (default on); `speed` slider (default `8s`); meta line `flow 8s · sweep 1100ms · threshold 0.6 · state idle/in`; note about clean-room + reduced-motion.
- No agent identities in the original, so no 3×3 pixel-marks (spec conditional: only if the component has agent identities). No invented agent header/counts.

## Matched data / behaviour (verbatim from `demo-original.js`)
- Copy: `Interfaces people actually` + `feel.` + `Replay` — exact strings.
- Structure: `.ui-gt` wrapper with `data-state="idle"|"in"`, `data-sweep=""` when sweep on, inner `.ui-gt__base` (accessible) + `.ui-gt__fill` (`aria-hidden="true"`) duplicate.
- Palette light: `#dd0674 #5e3ee0 #ff5fae #7c5cff`; dark: `#f472b6 #a78bfa #f9a8d4 #c4b5fd`.
- Timings: flow `8s` (`--ui-gt-speed`), sweep `1100ms` (`--ui-gt-sweep`), base fade `240ms ease` with `calc(sweep-200ms)` delay, `threshold: 0.6` IntersectionObserver.
- Flow keyframes (4-stop radial + `100deg` linear, sizes `70% 170%, 80% 190%, 60% 160%, 100% 100%`, positions `-20% 30% …`) infinite `ease-in-out`; sweep via `clip-path: inset(-0.25em 100% …)` → full; `prefers-reduced-motion` forces final state with no animation.
- Replay: original remounts via key increment; replica resets `idle` → forced reflow → `in` after `60ms` **in place** (same nodes, no rebuild).
- Clean-room: rewritten CSS/JS (own names/order, e.g. `gt-drift`), same values only.

## Spec compliance
- Tokens via CSS vars for every colour; light `surface #ffffff / page #fafaf9 / ink #171717 / muted #78716c / subtle #f5f5f4 / border #e7e5e4`, dark `surface #1c1c1f / page #101012 / ink #ededed / muted #a1a1aa / subtle #26262a / border #2e2e33`; radius `16/10/6px`, pills `999px`, shadow `0 1px 2px + 0 4px 16px`.
- Dark toggle on `<html data-theme>`, persisted as `affectui-theme`. Default `light` = original demo appearance (overrides `prefers-color-scheme` default per task prompt).
- `/*noflash*/` guard first in `<head>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`.
- In-place only: DOM built once in static markup; timers/handlers update `data-state`/`style`/text only; zero `innerHTML` in page script.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric `16 = 10 + 6`; shadows for lift / borders for structure; `focus-visible` outlines; `150–200ms` transitions; `[hidden]{display:none!important}`; SVG icons static (no `.className` assignment in JS); optical nudge on replay icon.

## Verification (node only, no browser)
- `node --check` on extracted inline script: OK.
- In-dir stub harness `harness.js` (`node ./harness.js`): **ALL_CHECKS_PASS**.
  - Loads page script in a fake DOM, advances real timers (`600ms` > `60ms` fallback + `400ms` IO fallback) through `idle → in`, then Replay `in → idle → in`.
  - Asserts VISIBLE text (lead + base `feel.` + `Replay`; fill excluded as `aria-hidden`), `data-state` + meta sync.
  - Asserts node identity (`gt`, `base`, `fill`, `lead` same objects) across full loop + zero `innerHTML` writes after init.
  - Asserts default `light`, toggle to `dark` (persisted), visible text survives in both, toggle back; speed `8s → 12s` in place without rebuild.
  - Static asserts: noflash order, tap-highlight, tabular-nums, hidden rule, tokens, verbatim strings/colours, hover-media containment.
- Light AND dark both checked (toggle + CSS vars + visible text in each).

## Could not verify
- Pixel-perfect raster vs original site (no browser/screenshots in this env).
- Real `IntersectionObserver` viewport timing at `0.6` (covered by `400ms` fallback + stub path; behaviour identical).

## How to test
- Open `index.html` in a browser, scroll to view (sweep plays once), click `Replay`, toggle `Dark/Light`, uncheck `sweep`, drag `speed`, enable reduced-motion to see static final.
- Re-run: `python3 -c` extract last `<script>` → `node --check`; `node ./harness.js`.
