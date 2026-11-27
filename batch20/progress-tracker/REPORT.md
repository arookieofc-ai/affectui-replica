# REPORT — progress-tracker grey-ghost (double-print) targeted fix

## Hashes (prove the file changed)

- BEFORE: `87f1811267f88831bb6d124ccdc26e5e` (`./index.html` before editing; preserved byte-identical as `./original-backup.html`)
- AFTER:  `3b5d8815ce349ec5748587d18b0dae6b` (`./index.html` after the fix)
- The two hashes DIFFER. `md5sum ./original-backup.html` still prints the BEFORE hash above.

## Defect

Completed rows ("Connect your tools", "Create a project") painted a GREY GHOST / DOUBLE-PRINT:
beneath the struck-through label an offset pale copy of the same text. Uncompleted rows were crisp.
Browser toggle test bound the ghost to the completed state: unchecking removed ghost + strikethrough,
re-checking restored both instantly.

## Exact mechanism found (named)

The strikethrough was painted as a **second `currentColor` paint layer**: a 1.5px
`background: linear-gradient(currentColor,currentColor)` bar on the inner label span
(`./index.html`, old lines 228-236), grown from `background-size: 0% 1.5px` to
`background-size: 100% 1.5px` when `.pg-step[aria-checked="true"]`.
Real browsers composite that extra color coat over the text's line box as an offset pale
doubling (the ghost) in both themes. That is the "strike line implemented as a second
text layer" candidate.

Ruled OUT by static inspection + harness (they pass on the original file too):
- `::before`/`::after` with `content: attr(data-*)` duplicating the label — none exists;
  all label/step pseudos are forced to `content: none` (old line 234), no `attr(` anywhere.
- `text-shadow` on the completed label — every label rule already declares `text-shadow: none`.
- A duplicated label element shown only in the completed state — JS builds exactly one
  `.pg-label` + one inner text span per row and the toggle only flips `aria-checked`
  (in-place, no add/remove). The first fix's `text-shadow`/`content` guards could not remove
  the ghost because it was never a shadow or a pseudo-element — it was this background layer.

## `./demo-original.js` check (done before changing anything)

The original demo's strike uses the same gradient-wipe technique
(`.ui-progress__label > span { background: linear-gradient(currentColor,currentColor)
0 58% / 0% 1.5px no-repeat; }` growing to `100% 1.5px` on checked) and likewise contains
no `text-shadow`, no `attr()` pseudo duplication, and no duplicate label element
(verified by reading `./demo-original.js`). So there is no *separate* original-side defect
to report — the replica keeps the original's look, timing (380ms / 620ms + 220ms delay),
color (muted `currentColor` in both themes) and demo data; only the replica's
completed-state paint layer is replaced with a native `text-decoration` strike, which is
what the task's end state mandates. No demo behaviour or data was changed.

## Fix (targeted, CSS-only; JS untouched)

`./index.html` lines 228-239. Unchecked span: `background: none`,
`text-decoration-line: none`, `text-decoration-color: transparent`,
`text-decoration-thickness: 1.5px`. Checked span
(`.pg-step[aria-checked="true"] .pg-label>span`): `background: none`,
`text-decoration-line: line-through`, `text-decoration-color: currentColor`
(follows muted grey in light AND dark). The wipe-size transition became a
`text-decoration-color` fade with the same durations/delay. Pseudo guard extended to
`.pg-step::before/::after` (still `content: none !important`).
Remaining `linear-gradient` occurrences (lines 151/155) are the progress-bar shine only.

Preserved: `/*noflash*/` guard + `color-scheme` meta + theme key, in-place updates only
(toggle/reset/progress sync touch existing nodes; full-loop node identity asserted),
zero `innerHTML` writes after init (none in the page script at all — asserted by grep and
by a stub write-counter), demo data verbatim (title + all 5 step labels + `done` flag).

## Harness

`./harness.cjs` — node only, no installs. Parses the target file's CSS, runs the page's
inline script in a DOM stub (per theme), and asserts visible state: single label-text
carrier, no pseudo content, computed `text-shadow: none`, strike from `text-decoration`
only, plus uncheck/re-check toggle behaviour, full-loop node identity, zero innerHTML,
noflash guard, verbatim demo data. Exit 0 = PASS, 1 = FAIL.

### Harness on ORIGINAL (`node ./harness.cjs ./original-backup.html`) — FAILS as required

```text
harness target: original-backup.html
[PASS] noflash guard kept (/*noflash*/ + color-scheme + theme key)
[PASS] demo data verbatim (title + 5 step labels)
[PASS] zero innerHTML writes (no innerHTML in page script)
[FAIL] no gradient second-layer strike on label (no linear-gradient on label rules) -- found linear-gradient strike layer on label
[FAIL] completed strike comes from text-decoration only (line-through on checked label) -- no line-through text-decoration on [aria-checked="true"] label
[FAIL] no background paint layer on completed label span -- background residue: 100% 1.5px
[PASS] no text-shadow declared on any label rule
[PASS] no pseudo-element duplicates label (content:none, no attr())
[PASS] [light] page booted (__pg hooks)
[PASS] [light] completed row carries label text exactly once
[FAIL] [light] completed strike is text-decoration line-through -- got none
[FAIL] [light] completed label has no gradient background layer -- got linear-gradient(currentColor,currentColor) 0 58%/0% 1.5px no-repeat
[PASS] [light] completed label text-shadow is none
[PASS] [light] no pseudo content duplicates label
[FAIL] [light] checking a row adds line-through, keeps text-shadow none -- deco=none shadow=none
[FAIL] [light] unchecking removes strike entirely (no ghost layer) -- deco=none bg=linear-gradient(currentColor,currentColor) 0 58%/0% 1.5px no-repeat
[PASS] [light] full-loop node identity (in-place updates only)
[PASS] [dark] page booted (__pg hooks)
[PASS] [dark] completed row carries label text exactly once
[FAIL] [dark] completed strike is text-decoration line-through -- got none
[FAIL] [dark] completed label has no gradient background layer -- got linear-gradient(currentColor,currentColor) 0 58%/0% 1.5px no-repeat
[PASS] [dark] completed label text-shadow is none
[PASS] [dark] no pseudo content duplicates label
[FAIL] [dark] checking a row adds line-through, keeps text-shadow none -- deco=none shadow=none
[FAIL] [dark] unchecking removes strike entirely (no ghost layer) -- deco=none bg=linear-gradient(currentColor,currentColor) 0 58%/0% 1.5px no-repeat
[PASS] [dark] full-loop node identity (in-place updates only)
[PASS] zero innerHTML writes after init (stub counter incl. full loop)
RESULT: FAIL (16 pass, 11 fail)
```

### Harness on FIXED (`node ./harness.cjs ./index.html`) — PASSES

```text
harness target: index.html
[PASS] noflash guard kept (/*noflash*/ + color-scheme + theme key)
[PASS] demo data verbatim (title + 5 step labels)
[PASS] zero innerHTML writes (no innerHTML in page script)
[PASS] no gradient second-layer strike on label (no linear-gradient on label rules)
[PASS] completed strike comes from text-decoration only (line-through on checked label)
[PASS] no background paint layer on completed label span
[PASS] no text-shadow declared on any label rule
[PASS] no pseudo-element duplicates label (content:none, no attr())
[PASS] [light] page booted (__pg hooks)
[PASS] [light] completed row carries label text exactly once
[PASS] [light] completed strike is text-decoration line-through
[PASS] [light] completed label has no gradient background layer
[PASS] [light] completed label text-shadow is none
[PASS] [light] no pseudo content duplicates label
[PASS] [light] checking a row adds line-through, keeps text-shadow none
[PASS] [light] unchecking removes strike entirely (no ghost layer)
[PASS] [light] full-loop node identity (in-place updates only)
[PASS] [dark] page booted (__pg hooks)
[PASS] [dark] completed row carries label text exactly once
[PASS] [dark] completed strike is text-decoration line-through
[PASS] [dark] completed label has no gradient background layer
[PASS] [dark] completed label text-shadow is none
[PASS] [dark] no pseudo content duplicates label
[PASS] [dark] checking a row adds line-through, keeps text-shadow none
[PASS] [dark] unchecking removes strike entirely (no ghost layer)
[PASS] [dark] full-loop node identity (in-place updates only)
[PASS] zero innerHTML writes after init (stub counter incl. full loop)
RESULT: PASS (27 pass, 0 fail)
```

Also verified with node only: `node --check ./harness.cjs` OK,
page script extracted from `./index.html` passes `node --check` OK.

## How to test

Open `./index.html` in a browser (light and dark via the Theme button): check/uncheck any
row — completed rows show a single crisp struck-through label with no offset pale copy;
unchecking removes strike + ghost, re-checking restores a clean strike. Re-run
`node ./harness.cjs ./index.html` (expect PASS) and
`node ./harness.cjs ./original-backup.html` (expect FAIL).
