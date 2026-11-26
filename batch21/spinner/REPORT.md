# Spinner — replica report

## What was built
Single self-contained `index.html` (~17.9KB) in this directory. Inline CSS + JS, system fonts only, no external deps, no build step.

- Page chrome: `affectUI · Spinner` eyebrow with live `0/4 working` → `4/4 done` count, title `Small turning arc for current work`, theme toggle (sun/moon, top-right).
- Classic demo card `Checks` with header `Checks 0/4…4/4`, action button `Running` (spinner icon, `aria-disabled="true"`) → `Re-run` (retry icon), 4 status rows, sizes row `12 / 14 / 16 / 20`, and a short Usage card.
- Spinner is a clean-room SVG: `viewBox 0 0 16 16`, faint track `circle r=6 stroke-width 2 opacity 0.2` + quarter arc `M8 2a6 6 0 0 1 6 6` round cap, `animation: ui-spn-turn var(--ui-spn-speed) linear infinite`, `--ui-spn-speed: 750ms`, `2400ms` under `prefers-reduced-motion`, keyframe `to { rotate: 360deg }`. `label` → `role="status" aria-label`, else `aria-hidden="true"`. Tick is `M3.5 8.5 6.5 11.5 12.5 4.5` stroke 1.8; retry icon `M13 8a5 5 0 1 1-1.5-3.55M13 3v2.5h-2.5` stroke 1.6 — same geometry/behaviour as `demo-original.js`, rewritten by hand.

## Matches the original
- Demo data verbatim from `demo-original.js`: `Type check / 12s / 1100`, `Lint / 8s / 1900`, `Unit tests / 41s / 3200`, `Eval suite / 1m 04s / 4300`; loop `7600ms`, tick `100ms`; sizes `[12,14,16,20]`; default spinner size 14.
- Behaviour: rows flip spinner→tick + reveal `took` at their `at` thresholds; header count `l/4`; button `Running`→`Re-run`; `Re-run` only works when done; whole loop restarts in place every 7.6s.
- Timing/state machine identical (elapsed from start, reset + runId bump on overflow).
- Accessibility: running rows expose `"<name> running"` status labels; done rows expose `Passed` tick; button uses `aria-disabled` while running.

## What could not be verified
- No browser was launched (per task constraints). Visual pixel-parity vs the original site was not screenshot-compared; colours/spacing follow the spec tokens and the demo chunk's structure.
- `prefers-color-scheme` default and `prefers-reduced-motion` slow-spin were asserted in CSS/DOM-stub only, not in a real compositor.

## How to test
- Open `index.html` in a browser. Watch 0/4 → 4/4 over ~4.3s, button flip, auto-loop at 7.6s, `Re-run` click.
- Toggle sun/moon top-right; reload to confirm persistence (`affectui-spinner-theme`).
- Node-only verification (no browser): `node --check harness.js && node harness.js` — 92 assertions.

## Verification (node only)
- `node --check harness.js` — pass.
- Main inline script extracted and `node --check` — pass.
- In-dir DOM-stub `harness.js` asserts: VISIBLE painted text (`Checks`, all 4 names, `12s/8s/41s/1m 04s`, `Running/Re-run`, `0/4…4/4`), full-loop node identity (count/button/rows/list stable across the 7600ms restart), zero `innerHTML` writes after init (0 total), light AND dark (dark token block, toggle flips `data-theme` + persists, `/*noflash*/` stored-dark / stored-light / prefers-dark / default-light).
- Checked light AND dark: tokens for both themes present and toggle verified in stub; page uses CSS vars only, no hard-coded ad-hoc hex per element.

## Spec compliance notes
- v4 no-flash: `<head>` starts with `/*noflash*/` setter + `html{background…}` + `meta color-scheme`; dark has no white first frame.
- v4 in-place: DOM built once at init; ticks update `textContent/class/attributes/style/display` only; no `innerHTML` anywhere.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radius (card 16 = row 10 + inset); shadows for lift, borders for dividers/inputs; img inset outline rule; button optical padding `6px 12px 6px 10px`.
