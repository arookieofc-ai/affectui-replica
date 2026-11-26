# Skeleton — replica report

## What was built
ONE self-contained `./index.html` (14.8KB, no network, system fonts only).
Card `Recent runs` with `Data` / `Loading` preview toggle, 5 placeholder rows in
loading state and 5 agent rows in data state. Theme toggle (moon/sun) top-right
switching `data-theme="light" | "dark"` on `<html>` with `localStorage` persist.

Clean-room: all HTML/CSS/JS written from observed behaviour in
`./demo-original.js`. No bundle source copied; class/variable names and comments
are original. Public API values (labels, colours, timings, widths) reproduced
verbatim to match behaviour.

## Matched data (verbatim from demo-original.js)
- Header: `Recent runs`, group `Preview state`, buttons `Data` / `Loading`.
- Loading wrapper: `role=status`, `aria-busy=true`, `aria-label="Loading runs"`.
- Default state: Loading (`useState(true)` in original).
- Runs (id / title / meta / time / colour):
  - `research` / `Summarize competitor pricing pages` / `Research agent · 14 sources` / `2m` / `rgba(0, 96, 226, 0.78)`
  - `triage` / `Triage new support tickets` / `Support agent · 23 tickets` / `8m` / `rgba(166, 81, 240, 0.85)`
  - `review` / `Review pull request #482` / `Code agent · 6 files` / `21m` / `rgba(19, 179, 160, 0.9)`
  - `digest` / `Draft the weekly product digest` / `Writer agent · 1 draft` / `1h` / `rgba(242, 138, 46, 0.9)`
  - `sync` / `Sync CRM contacts` / `Ops agent · 312 records` / `3h` / `rgba(95, 200, 138, 0.95)`
- Skeleton geometry: mark `16x16 radius 4`, title `h 10`, meta `h 8`,
  time `w 20 h 8`, row widths `[[212,136],[164,124],[176,104],[196,112],[128,128]]`.
- Motion: sheen `1.6s` sweep (`60%,100% → translate 100% 0`), wrapper fade
  `300ms ease` with `150ms` delay (loads <150ms never flash), sheen hidden
  under `prefers-reduced-motion`.
- Colours: fill `#efefef` / sheen `rgba(255,255,255,0.8)` light,
  fill `#242428` / sheen `rgba(255,255,255,0.05)` dark.
- Pixel-marks: deterministic symmetric 3x3 per agent id (`[a,b,a]` mirroring,
  `>=5` filled, LCG reseed), rendered as 9 `<i>` cells, filled cells use the
  run colour. Exactly 9 cells per mark asserted in harness.

## Behaviour / loop
- Original is manual toggle only. Replica keeps manual `Data`/`Loading` buttons
  (`aria-pressed`, native `<button>` keyboard support) and adds a gentle 4s
  auto-cycle for demo liveliness so timers can be advanced in tests.
- Manual click applies state immediately and restarts the 4s cycle.
- IN-PLACE ONLY: DOM built once at init (`buildOnce`). `setLoading` toggles
  `hidden`, classes, `role`/`aria-busy`/`aria-label`, `aria-pressed` on existing
  nodes. No `innerHTML` anywhere in the page script (asserted statically and
  via stub setter count). Hover/focus are CSS-only, never re-render.

## v5 / tokens / guards
- Tokens for every colour; light = spec (`surface #ffffff`, `page #fafaf9`,
  `ink #171717`, `muted #78716c`, `subtle #f5f5f4`, `border #e7e5e4`,
  `radius-lg 16px`, `radius 10px`, `radius-sm 6px`, shadow as specified);
  dark = spec (`surface #1c1c1f`, `page #101012`, `ink #ededed`,
  `muted #a1a1aa`, `subtle #26262a`, `border #2e2e33`, darker shadows,
  amber `#fbbf24` on `#451a03` text `#fde68a`).
- `<head>` starts with `/*noflash*/` guard reading `skd-theme` then
  `prefers-color-scheme`, plus `html{background:#fafaf9}` /
  `html[data-theme="dark"]{background:#101012}` and
  `<meta name="color-scheme" content="light dark">`. Default = original light
  appearance unless stored/dark-preferred.
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`;
  concentric pills (`999px` + `2px` padding); rows are separate surfaces;
  borders only for card/divider/selected, depth via layered shadows;
  `[hidden]{display:none !important}`; no SVG (no `.className` hazard);
  no popovers/dialogs (pointerdown rule N/A); optical padding on theme button.

## Verification (all in-dir, no installs)
- `node --check ./.__main_check.js` → OK (extracted page script).
- `node --check ./harness.js` → OK.
- `node ./harness.js` → ALL 60+ CHECKS PASSED:
  - default Loading, `role=status`, `aria-busy`, `aria-label="Loading runs"`;
  - loading hides data text; Data shows all 5 titles/metas/times verbatim;
  - each mark exactly 9 cells, `>=5` filled;
  - timer ticks flip `Data↔Loading`; button clicks work;
  - row nodes keep object identity across full loop;
  - `innerHTML` writes after init = `0`;
  - skeleton widths match `[[212,136],…]` px;
  - `setTheme("dark")` / `setTheme("light")` both apply to `<html>` and persist
    to the same key the noflash guard reads;
  - markup contains noflash, color-scheme, first-paint style, `[hidden]` rule,
    guarded hover, tap-highlight, tabular-nums, and no unguarded `:hover`.
- Light AND dark checked via `setTheme` in harness + token review (no
  grey-on-grey, borders visible in both).

## What could not be verified
- No browser available (per instructions, no launch attempted); pixel-perfect
  screenshot diff vs the original site was not possible. Timing curves and
  1lh line centring were matched by value, not by rendered measurement.
- Original has no auto-cycle; the 4s cycle is an additive demo loop, disclosed
  above. Manual behaviour is otherwise 1:1.

## How to test
Open `./index.html` in a browser (double-click or `python3 -m http.server` then
visit the file). Click `Data`/`Loading`, toggle moon/sun, resize narrow, enable
dark mode + reduced motion. Re-run `node ./harness.js` for the stub suite.
