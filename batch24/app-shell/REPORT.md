# App Shell — status-bar 3rd-item fix (REPORT)

## Defect (real-browser QA)
The bottom status bar's third item `Theme light` / `Theme dark` existed in the
DOM but never painted in either theme, and the page did not scroll to reveal
it — only `Synced · Ns ago` and `44k / 200k tokens` were visible.

## Root cause
Not bar width/overflow pushing the item out of view. The Theme label lived in
the screen-reader-only live region:

- CSS: `.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  — the classic visually-hidden pattern: removed from flex flow (`absolute`)
  and clipped to a 1px box, so it can never paint.
- JS (`build()`): `var sr=el('span','sr','')` with `aria-live="polite"`, and
  `setTheme()` writes `'Theme '+t` into it. The text was in the DOM (hence
  found by QA) but painted zero pixels in both themes.
- The same node doubled as the `Artifact N added` announcer (`addArtifact()`
  overwrote the Theme text), so simply un-hiding it would also have leaked
  transient announcements into the visible bar permanently.

## Note on ./demo-original.js (checked before changing)
The original demo chunk defines only the shell layout (`layout: inset`,
`active: New chat`, `workArea.artifacts`, `workArea.newTab.sources`, center
title/text). It specifies **no** status-bar items at all — no `Synced`, no
`44k / 200k tokens`, no Theme label. All three bar items are replica chrome,
so there was no original three-item behaviour to preserve; the hidden node
was a replica-side a11y announcer misused as the visible Theme label. Fixing
it as a visible bar item is correct and contradicts nothing in the original.

## Fix (targeted, everything else identical)
`./index.html` only — 3 small edits, no rebuild:

1. CSS: the Theme span changed from class `sr` to a new visible class
   `tstat` (in-flow flex item). Added:
   - `.statusbar{...;overflow:hidden}` — bar can never push the page into
     horizontal scroll;
   - `.statusbar .grow{flex:1;min-width:4px}` — spacer yields first;
   - `.statusbar>span:not(.sr){min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`
     — long labels truncate inside the bar instead of scrolling the page
     (`:not(.sr)` keeps the announcer hidden);
   - `.tstat{flex:0 1 auto}`. The `.sr` clip rule is untouched.
2. JS `build()`: theme span is now `el('span','tstat','')` (same
   `refs.sr`/`state.srStatus` identity, so `setTheme()` is byte-identical and
   still updates the node in place); a separate hidden
   `el('span','sr','')` announcer (`refs.announcer`/`state.announcer`,
   `aria-live="polite"`) appended after it carries transient messages.
3. JS `addArtifact()`: announces via `state.announcer` instead of
   `state.srStatus`, so artifact messages no longer clobber the visible
   `Theme light/dark` label.

Preserved: `/*noflash*/` guard first in `<head>` (+ bg style + color-scheme
meta), in-place updates only (`textContent`/`className`/`style` on existing
nodes), zero `innerHTML` writes after init (none in source), demo data
verbatim (`Your page goes here`, shell text, `44k / 200k`, `New chat`),
single file <200KB, all tokens/hover/tap/tnums polish.

## Verification (node only, no browser/deps)
- `node --check ./harness.js` — syntax OK.
- `node ./harness.js` — **ALL CHECKS PASSED (42/42)** via an in-dir DOM stub:
  - VISIBLE state asserted for `Theme light` (light) and `Theme dark`
    (dark): in-flow class `tstat`, no clip rule, child of `.statusbar`,
    alongside visible `Synced …` and `44k / 200k tokens`; negative control
    proves the old `.sr`-clipped node evaluates HIDDEN.
  - Light AND dark: `setTheme('dark'/'light')` flips `data-theme` and the
    label on the same node (in-place identity held).
  - Full-loop node identity: all 40 refs identical across a 4-tick loop ×2.
  - Zero `innerHTML` writes after init (stub setter counter = 0; none in
    source).
  - No page scroll: `.statusbar` has `overflow:hidden` + fixed 34px flex row,
    items shrink with ellipsis; bar order
    `dot,sync,grow,tok,theme,announcer`.
- Manual (browser, not run here): open `./index.html`, toggle the sun/moon
  button (or press `T`) — the bar's third item reads `Theme dark`/`Theme
  light` in both themes with no horizontal scrollbar at desktop or 320px
  widths.

## Files in this directory
- `./index.html` — fixed (targeted edits above).
- `./harness.js` — DOM-stub verification harness (`node ./harness.js`).
- `./REPORT.md` — this file.
- `./REPLICATE_SPEC.md`, `./demo-original.js` — untouched inputs.
