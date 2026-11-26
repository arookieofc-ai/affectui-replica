# REPORT — Message Actions replica

## What was built
`index.html` (30 KB, single self-contained file, no network, system fonts only):
a chat message (user ask + `Sonnet 5.5` row + answer) with the quiet action bar
underneath — copy, regenerate + version switcher, thumbs up/down, read-aloud —
plus the unfolding "What went wrong?" feedback panel, tooltips, and a polite
live region. Clean-room code written from the observed behaviour; no compiled
source copied.

## Original data / behaviour matched (from demo-original.js)
- Ask `Summarize the 2.4 release notes in one sentence.`, model `Sonnet 5.5`,
  and all three answer versions verbatim.
- Reasons verbatim: `Not accurate`, `Too long`, `Didn't follow instructions`,
  `Other`; input placeholder `Tell us more (optional)`;
  panel strings `What went wrong?`, `Send`, `Thanks!`, `Copy`/`Copied`,
  `Regenerate`/`Writing…`, `Good response`/`Thanks!`, `Bad response`,
  `Read aloud`/`Stop`, live announcements (`Copied`, `Regenerating`,
  `Marked as good/bad response…`, `Thanks for the feedback`, `Reading aloud`,
  `Stopped reading`, `Finished reading`, `Version X of Y`).
- Autoplay loop with the exact delays `[700, 1000, 700, 900, 2600, 2800, 2000, 3000]`
  (copy → dislike → 2nd chip → send → regenerate → prev → next → reset),
  stopping permanently on first user hover/click/keypress/focus. Regenerate busy
  1000 ms then lands on the newest version; copy flash clears after 1600 ms;
  thanks auto-closes the panel after 1500 ms (1200 ms reduced-motion); speech
  length `max(2600, words*380)` ms. Glyph paths (copy/check/redo/thumb/speaker/
  prev/next/close) redrawn via `createElementNS` + `setAttribute`.
- One deliberate simplification: the original enables copy text only after first
  interaction (`text` starts `undefined`); the replica always copies the current
  version text (the flash/announce behaviour is identical either way).

## Spec compliance
- Design tokens as CSS vars (light + dark sets from the spec), sun/moon toggle
  top-right switching `data-theme` on `<html>`, persisted as `ma-theme`;
  default theme = light (the original demo's appearance).
- `/*noflash*/` guard first in `<head>` (stored-key/`prefers-color-scheme`
  lookup before CSS paints) + inline paint background + `meta color-scheme`.
- No agent identities in this component, so no 3x3 pixel-marks (correctly omitted).
- In-place updates only: DOM built once at init; ticks/handlers mutate
  text/attrs/classes of existing nodes; zero `innerHTML` in the script;
  hover is CSS-only; popover dismiss uses pointerdown capture; `[hidden]`
  rule present; SVG classes set via `setAttribute` (stub throws on `.className`).
- Responsive narrow stacking; `prefers-reduced-motion` and coarse-pointer rules.

## Verification (node only — no browser available here)
- Script syntax: extracted `<script>` to temp file in-dir and `node --check`: OK.
- `node verify-harness.js`: **36/36 PASS**, incl.:
  - static: `/*noflash*/`, light+dark tokens, versions base hidden
    (`opacity:0`+`visibility:hidden`+`0fr`) vs `[data-open]` painted
    (`opacity:1`+`visibility:visible`+`1fr`), `[hidden]` rule, `meta color-scheme`,
    zero `innerHTML`, theme persistence, plus divergence regression
    (`setAnswer` syncs `data-open`/`inert`, `gotoVersion` routes via `setAnswer`);
  - manual path (both themes): click Regenerate → +1300 ms → pager painted
    (`data-open`, no `inert`/`hidden`/inline-hide), aria `Version 2 of 2`;
  - demo path (both themes, fresh reload, NO manual click): advance tour timers
    to version stage (~7500 ms, past regen-busy 1000 ms, before reset) → pager
    painted with same asserts + `2/2` count + Previous/Next present, and still
    painted after tour prev step. Light AND dark checked.
- Could not verify: real pixel rendering/animation smoothness (no browser in
  this environment). To test visually, open `index.html` in any browser.

## Re-QA fix (version pager invisible during auto-demo)
- Defect: manual Regenerate painted `< 2/2 >` correctly, but the auto-demo
  version stage (`Version 2 of 2` in DOM/a11y) never painted pixels.
- Divergence: click path went via `refreshVersions()` (sets `data-open`, clears
  `inert`), while tour path (`gotoVersion` → `setAnswer`) only set text/count/
  `aria-label` + `disabled` and never touched pager visibility, leaving it at
  `opacity:0`/`visibility:hidden`/`0fr`.
- Fix: `setAnswer()` now syncs pager visibility as the single source of truth
  (`versions>1` → set `data-open`, remove `inert`; else remove `data-open`, set
  `inert`), so demo-path paints exactly like click-path in both themes.
  Still build-once/in-place, no `innerHTML`, themes + `/*noflash*/` untouched.

## How to test
Open `index.html` in a browser (double-click works, no server needed). Watch one
full loop (~14 s), then interact: copy, vote, send feedback with/without
`Other`, regenerate through versions, read-aloud, and flip the sun/moon toggle.
Re-run `node verify-harness.js` after any edit.
