# Cited Answer replica — REPORT

## What was built
Self-contained `index.html` (no network, no external assets, system fonts only):
an AI answer linked to sources. Six answer sentences carry inline numbered citation
markers; hovering/focusing a marker highlights its sentence(s), swaps the footer
caption to `Site · title`, AND opens the matching source preview (repeatable
`pointerenter` → open, `leave` → close, in both themes); hovering a source chip
shows `Site · cited in N sentences` + preview; clicking a marker/chip pins the
preview open (domain, date, number, title, quoted passage with `<mark>`
highlights, "Open source" link, "Copy quote" button with Copied state); Escape
closes and refocuses the marker; arrow keys move between chips. An auto-demo loop
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
- Footer-swap CORRECTION (earlier misread, now faithful): the footer line in
  `demo-original.js` is a state variable, not a pinned label — rest
  `<b>5</b> of 6 sentences backed by a source`, while a citation is
  marked/hovered REPLACED by `<b>{site}</b> · {title}` of that source, after
  copy `Quote copied`. Priority `copied → hot marker → hot chip → open
  (Quote from Site) → rest` is reproduced verbatim; caption returns when
  nothing is hovered/copied. Do NOT pin the rest caption.
- re-QA(1) WRONG SOURCE — **real defect, fixed.** Hovering citation `1` showed
  the preview for Source 2 (Latency Notes, `Designing cache-friendly prompts`)
  instead of Source 1 (Tokenwise). Cause: stale `lastOpen` preview content
  leaked into the visible panel. Fix: new `hoverId` state tracks the
  pointerenter source; `paintPreview()` renders `hoverId || openId ||
  lastOpen` with visibility gated on `hoverId || openId`, so citation N
  previews source N (`1→caching/Tokenwise`, `2→prompts`, `3→semantic`);
  `data-source`/`aria-label`/number/title all derive from `byId` mapping.
- re-QA(2) UNRELIABLE HOVER — **real defect, fixed.** A second hover on the
  same citation held 7s opened no preview (only highlight), because hover only
  ran `setHot` with an early-return dedup and never opened. Fix: markers/chips
  now listen to `pointerenter` (+`pointerover` compat, mouse-only, as the
  original uses `onPointerEnter`) → `hotOpen(source, segment?)` which sets
  `hot` + `hoverId` and `refresh()` on EVERY enter (no dedup skip), and
  `pointerleave`/`pointerout` + `blur` → `hotClose()` clears both and closes.
  Focus also opens (a11y); click still pins via `toggleOpen`; `Escape`/
  close-button clears `openId`+`hoverId` (keeps `hot` highlight). Repeatable
  in light AND dark.
- QA-2 "footer title truncated (`Prompt caching, explained: what gets st…`)" —
  kept fixed. `.ca-caption` wraps (`white-space:normal;
  overflow-wrap:break-word`, no single-line nowrap/ellipsis) so the full
  73-char hover title paints; `title` attribute mirrors full text in place.
- Harness fix: the `<head>` noflash snippet shadowed the main blocks under
  first-match extraction (0 markers found) — `verify.cjs` now selects the
  blocks containing `.ca-caption` / `__ca`.

## Verification (all in-dir: `node verify.cjs`, node only, no browser)
- `node --check` on the extracted inline script: passes.
- DOM-stub harness advances mock timers through the full loop (incl. repeat)
  and asserts visible text/state (hidden/opacity rules accounted for): meta, rest caption, 6 markers (1,1,2,1,3,3),
  chips, glyphs, hover highlight/caption/preview, open preview (title/quote/marks/
  domain/number visible), copy flow + 1800 ms revert, close + marker refocus,
  synthetic-vs-trusted demo stop, user-stop, Escape, ArrowRight, and theme toggle.
- re-QA asserts: footer shows backed-by caption at rest, swaps to hovered
  `site · title` while hovered, returns afterwards; hovering citation 1 via
  `pointerenter` previews source 1's title (`Prompt caching, explained…`,
  number `1`, not Latency Notes); 7s hold keeps preview open; three
  consecutive hover cycles each open + close; citation 2 → source 2 mapping;
  click still pins, Escape closes; full hover title visible + no
  single-line-ellipsis + `title` mirrors text; rest replaced by `Quote from…`
  while click-open and restored on close; node identity stable
  (DOM built once, in-place updates); classes via `setAttribute`,
  `[hidden]{display:none}` guard.
- Light AND dark checked: default `light`, toggle to `dark` and back, with
  caption (incl. full hover title), hover preview for source 1,
  markers/chips asserted visible in both; dark token overrides present.
- Result: **103 passed, 0 failed.**

## How to test
Open `index.html` in a browser. Watch the auto-demo (hover → open → close loop);
hover markers/chips, click to open, copy a quote, press Escape, toggle the theme.
Re-run checks with `node verify.cjs`.

## Not verified
Pixel-perfect match to the original site (no browser/screenshots available here);
`prefers-reduced-motion` disables animation via CSS only; clipboard needs a real
browser (guarded fallback included).
