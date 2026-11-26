# Cited Answer replica — REPORT

## What was built
Self-contained `index.html` (38.8 KB, no network, no external assets, system fonts only):
an AI answer linked to sources. Six answer sentences carry inline numbered citation
markers; hovering/focusing a marker highlights its sentence(s) and shows
`Site · title` in the footer caption; hovering a source chip shows
`Site · cited in N sentences`; clicking a marker/chip opens a source preview
(domain, date, number, title, quoted passage with `<mark>` highlights,
"Open source" link, "Copy quote" button with Copied state); Escape closes and
refocuses the marker; arrow keys move between chips. An auto-demo loop
(hover caching → unhover → open prompts → close, then repeat) stops on the first
real user input. Header follows the item pattern (project name + source/page
counts) with a visible sun/moon theme toggle top-right; light default (the
original demo's appearance), dark via `data-theme` on `<html>`.

## Original data/behaviour matched (verbatim from `demo-original.js`)
- All 3 sources verbatim (ids `caching`/`prompts`/`semantic`, sites Tokenwise /
  Latency Notes / Inference Weekly, titles, URLs, dates Sep 18 / Aug 2 / Jul 24
  2026, full quotes and highlight phrases).
- All 6 segments verbatim incl. citations and the `paragraph:true` break;
  `12 pages read`; action label `Follow up`.
- Exact loop timings `[700, 2600, 500, 3800, 1800]` and steps
  (pointerover caching → pointerout → click prompts marker → close click).
- Caption logic: `5 of 6 sentences backed by a source`, `Site · cited in N
  sentences`, `read, not cited`, `Quote from Site`, `Quote copied` (1800 ms).
- Copy format `"quote" – title, site (url)`; tone hash + first-alphanumeric glyph
  letters (T/L/I); hostname display (`latencynotes.io`); numbered markers with
  `Source N: site – title` labels; last-word + marker kept on one line.
- No agent identities in this component, so the 3×3 pixel-mark rule is N/A
  (sources use single-letter glyphs, as in the original).

## Hard-won rules applied
- DOM built once; hover/open/copy only toggle classes/text/attrs — the hovered
  element is never rebuilt.
- Synthetic demo events carry `isTrusted:false`; only trusted pointerdown/keydown/
  focus stops the loop, so real clicks survive (verified: loop alive after the
  synthetic open).
- Explicit `[hidden]{display:none}` rule; all SVGs get classes via
  `setAttribute`; no browser used — verified with node only.

## Browser-QA triage (all checked against `demo-original.js` ground truth)
- QA-1 "hovering a marker never opens the preview within 5s" — **not a defect
  (QA wrong).** The original wires markers as `onPointerEnter (mouse only) →
  setHot` (sentence highlight + `Site · title` caption) and opens **only** via
  `onClick → toggle`; the demo loop `[700,2600,500,3800,1800]` is
  hover-caching → unhover → **click**-prompts → close → noop. No hover-open
  delay/condition exists to match. No change: hover highlights, click opens.
- QA-2 "footer title truncated (`Prompt caching, explained: what gets st…`)" —
  **real defect, fixed.** The hover caption (`Tokenwise ·` + 60-char title,
  73 chars) could not fit the ~316 px caption lane single-line at 12.5 px, so
  the ellipsis cut it. Fix in `index.html`: `.ca-caption` now wraps
  (`white-space:normal; overflow-wrap:break-word`, single-line
  nowrap/ellipsis removed) so the full title paints across two lines; short
  captions still render single-line. `refresh()` also mirrors the full plain
  caption text into a `title` attribute (in-place attr update, no rebuild).
- QA-3 "`5 of 6 sentences backed by a source` disappears once a preview is
  open" — **not a defect (QA wrong).** The original caption priority is
  copied → hot marker → hot chip → **open (`Quote from Site`)** → rest, so an
  open preview replaces the rest caption by design. No change.
- Harness fix: the `<head>` noflash snippet shadowed the main blocks under
  first-match extraction (0 markers found) — `verify.cjs` now selects the
  blocks containing `.ca-caption` / `__ca`.

## Verification (all in-dir: `node verify.cjs`, node only, no browser)
- `node --check` on the extracted inline script: passes.
- DOM-stub harness advances mock timers through the full loop (incl. repeat)
  and asserts visible text/state (hidden/opacity rules accounted for): meta, rest caption, 6 markers (1,1,2,1,3,3),
  chips, glyphs, hover highlight/caption, open preview (title/quote/marks/
  domain/number visible), copy flow + 1800 ms revert, close + marker refocus,
  synthetic-vs-trusted demo stop, user-stop, Escape, ArrowRight, and theme toggle.
- QA-specific asserts: hover highlights yet preview stays closed after a 5 s
  hover and click still opens (QA-1); full 60-char hover title present in the
  visible caption + no single-line-ellipsis rule on `.ca-caption` + title
  attribute mirrors full text (QA-2); rest caption replaced by `Quote from…`
  while open and restored on close (QA-3); caption/segment/marker/preview
  node identity stable across ticks (DOM built once, in-place updates);
  classes via `setAttribute`, `[hidden]{display:none}` guard.
- Light AND dark checked: default `light`, toggle to `dark` and back, with
  caption (incl. full hover title)/markers/chips asserted visible in both;
  dark token overrides present.
- Result: **84 passed, 0 failed.**

## How to test
Open `index.html` in a browser. Watch the auto-demo (hover → open → close loop);
hover markers/chips, click to open, copy a quote, press Escape, toggle the theme.
Re-run checks with `node verify.cjs`.

## Not verified
Pixel-perfect match to the original site (no browser/screenshots available here);
`prefers-reduced-motion` disables animation via CSS only; clipboard needs a real
browser (guarded fallback included).
