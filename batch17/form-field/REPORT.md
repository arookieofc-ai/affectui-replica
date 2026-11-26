# Form Field — replica report

## What was built
- ONE self-contained `index.html` in this directory (inline CSS + JS, no network, no external assets, system fonts, ~14KB).
- Clean-room rewrite of the `Form Field` frame (`ui-fld`): label + required `*` / `Optional` badge, control slot, hint-or-error message + live counter footer, with full accessibility wiring (`for`/`id`, `aria-describedby` → message + count, `aria-invalid`, `aria-required`, `aria-live="polite"` only on error, `data-invalid`).
- Demo card `New run` with the exact 4 fields from `demo-original.js`:
  1. `Agent name` required, `Release notes writer`, `20/40`, `maxlength=40`.
  2. `Model` select `Claude Sonnet` (default) / `Claude Opus` / `Claude Haiku`, hint `Opus thinks longer and costs more.`
  3. `Budget per run` input `inputmode=decimal`, initial `140` → error `Your plan allows up to $100 per run.`, hint `In US dollars – the run stops once it's spent.` (en-dash U+2013 + straight apostrophe, verbatim).
  4. `Brief` optional, textarea `rows=2` `maxlength=280`, `Summarise merged pull requests for the changelog.`, `49/280`.
- Budget validation verbatim: empty → `Enter an amount.`; non-finite or <0 → `Use a number, like 40.`; >100 → `Your plan allows up to $100 per run.`; else hint.
- Design tokens as CSS variables (light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`; dark: `#1c1c1f`/`#101012`/`#ededed`/`#a1a1aa`/`#26262a`/`#2e2e33`; danger `#c4320a` light / `#ff8a7a` dark; amber waiting preserved). Radius `16px/10px/6px`, shadow, 14px system sans, 150–200ms transitions, card border+shadow+hover lift, focus-visible outline.
- Visible theme toggle (top-right, `Dark`/`Light` pill) switching `data-theme="light"|"dark"` on `<html>` with `localStorage` key `affectui-form-field-theme`. Default = stored → `prefers-color-scheme` → light (original demo appearance is light).
- `/*noflash*/` guard as first child of `<head>`: inline script sets `data-theme` before paint + inline `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`.
- In-place updates only: static markup built once; `input`/`click` handlers update only `textContent` / attributes on existing nodes. No `innerHTML` anywhere in the page. No timers in the original (interaction loop is typing → counter/validation). Hover/focus never re-render. Includes `[hidden]{display:none!important}`. No SVG class assignment (toggle uses text + dot span).
- No agent identities in this component, so no 3x3 pixel-marks (spec conditional — correctly omitted).

## Matched data / behaviour
- Names, numbers, strings verbatim (checked by harness): all labels, values, hints, errors, options, counters above.
- Behaviour: live counters (`len/40`, `len/280`); live budget hint↔error swap with `data-invalid`/`aria-invalid`/`aria-live` toggling; `novalidate` + `preventDefault` on submit; `required`, `maxlength`, `rows`, `inputmode` preserved.
- Timings/loop: original has no timers; loop = full validation-state cycle (empty → NaN → negative → valid → boundary 100 → over-limit) + counter edit/restore + theme light↔dark. Harness advances through the entire cycle.

## What could not be verified
- Pixel-perfect screenshot vs original Pro site (no browser in this env; verified via stub + token/style inspection only).
- Real browser paint / first-frame flash timing (guard code inspected, not painted).
- `useId`-generated IDs (original uses React `useId`); replica uses stable `ff-*` IDs with identical wiring semantics.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit). Type in Agent name / Budget / Brief, change Model, toggle Dark/Light (top-right). Check counters and budget error states.
- Node verification (in this dir only):
  - `node --check ./.page-script.check.js` (extracted page script)
  - `node ./harness.cjs` (DOM-stub: asserts visible text, state, node identity, zero innerHTML writes)

## Verification results
- `node --check ./.page-script.check.js`: PASS
- `node --check ./harness.cjs`: PASS
- `node ./harness.cjs`: ALL PASS (103 assertions) — initial visible `20/40`, `49/280`, over-limit error, model hint; full budget matrix (9 cases) with `data-invalid`/`aria-live`; counter restore; theme default light → dark → light via API + click; node identity preserved for all unchanged nodes; `innerHTML` writes = 0 after init and after full loop.
- Light AND dark checked: harness asserts `data-theme` switching, toggle label flip, and token presence for both themes; CSS inspected for dark tokens and contrast (muted `#a1a1aa` on `#1c1c1f`, borders `#2e2e33`).
