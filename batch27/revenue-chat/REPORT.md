# Revenue Chat — targeted fix report (3 defects from real-browser QA)

Targeted fix of the existing `./index.html` (no rebuild). Only `index.html` was edited;
`demo-original.js` was read first to check original behaviour. New files in this directory:
`./original-backup.html` (pre-fix copy), `./harness-fix.cjs` (proof harness), plus the
`./harness-orig.log` / `./harness-fixed.log` transcripts. No files touched outside this
directory, no installs/downloads, no `rm` on `/tmp` paths.

## Hard proof — hashes (they differ)

- BEFORE: `md5sum ./index.html` = `223b00b9b4c7daebba380faefb6adf78`
- AFTER:  `md5sum ./index.html` = `1a77cb2c9b28051017cb99808b0e6b01`
- (`./original-backup.html` still hashes to the BEFORE value.)

## `demo-original.js` check (before changing anything)

The original does NOT sit idle: its default turns are pre-seeded (`S = [u1 "How did revenue
develop last quarter?", a1 Q3 answer]`, rendered immediately with the typewriter), and its
demo frame auto-clicks the `Split it by region` chip 2200 ms after mount
(`setTimeout(...,2200)` finding the button whose text starts with `Split it by region`),
cancelled by the first user pointer/key interaction (`onPointerDownCapture` /
`onKeyDownCapture` flag). So defect (1) is a real regression — the replica's
`/* seed nothing: start screen stays until user asks */` line — and was fixed, not noted away.
The original contains zero occurrences of `messages` and zero of `44k`: both counters are
replica additions (v3 header pattern), so there is no original singular/plural handling to
match — the fix uses correct English (`1 message` / `N messages`), noted here instead.

## What was changed in `./index.html` (3 small, targeted edits)

1. AUTO-DEMO FROZEN — replaced the `/* seed nothing ... */` line with the original's loop:
   auto-send `How did revenue develop last quarter?` 900 ms after load (idle only), then
   when that Q1 answer finishes typing, auto-send `Split it by region` 2200 ms later (same
   cadence as the original), both skipped once the user interacts (`pointerdown`/`keydown`
   capture sets the cancel flag) or any turn/busy state exists. Reuses the existing `send()`
   path, so thinking state, typewriter, counts and drill-downs behave exactly as on click.
2. HEADER TOUCHING / ICON INTRUSION — `.colhead` margin was `0 0 -8px`, pulling the turns
   column 8 px up over the `Revenue answers with charts` line (and the busy 3x3 mark with
   it). Now `margin:0 0 14px`, restoring reserved space above the first card.
3. BUBBLE COVERING `44k / 200k` + `1 messages` — same root cause as (2): the first
   right-aligned user bubble was pulled up over the colhead's right-side `44k / 200k`
   counter; the 14 px margin fixes the overlap (header stays above turns in DOM order, both
   stay VISIBLE together). `setCount()` now writes `1 message` vs `N messages` in the
   `hdrCount` pill (nbsp separator preserved, matching the original `&nbsp;` markup).

Kept intact: `/*noflash*/` guard first in `<head>`, in-place updates only (no new
`innerHTML`/`insertAdjacentHTML`/`outerHTML`/`document.write` — source-scanned), zero
innerHTML writes after init (setter trap), demo data verbatim (`$1.24M`, `Back to school`,
`1052000`, `$1.41M`, `78%`, composer placeholder), click-to-answer flow (~1400 ms wait +
typewriter, unchanged).

## Verification (node only, in this directory)

- `node --check ./harness-fix.cjs` — parses.
- Inline script check — `vm.Script` over the shipped inline JS (the `node --check`
  equivalent for code inside HTML): passes.
- `node ./harness-fix.cjs ./original-backup.html` — MUST FAIL (exit 1). It does (see below).
- `node ./harness-fix.cjs ./index.html` — MUST PASS (exit 0). It does: **HARNESS OK (47 checks)**.
- The harness asserts VISIBLE painted state (not internals): auto content with no clicks,
  header + counter visible beside thinking row and after turns, singular/plural counter,
  full-loop node identity (user/answer elements + typed text node `===`), zero innerHTML
  writes after init, and painted text in light AND dark.
- Note: the older `./harness.js` (written for the manual-only build) now fails 2 checks on
  the fixed file (`VISIBLE painted text at start`, `two turns after Q1`) because it encodes
  the buggy idle behaviour; `./harness-fix.cjs` supersedes it and covers the same invariants
  (visible state, identity, zero innerHTML, both themes) plus the fixed auto-demo.

### Harness output vs ORIGINAL (`./original-backup.html`, exit 1) — pasted

```
PASS index.html < 200KB (48388 bytes)
PASS noflash guard present
PASS noflash guard before CSS paint
PASS meta color-scheme present
PASS tabular-nums for changing numbers
PASS tap highlight transparent
PASS hover rules gated behind media query
PASS inline scripts present (noflash + app)
PASS zero innerHTML in app script source
PASS no HTML-string injection APIs
PASS verbatim demo payload (trend)
PASS verbatim demo payload (split)
PASS verbatim demo payload (forecast)
FAIL colhead bottom margin non-negative (header spacing, no intrusion/overlap) — got: margin:0 0 -8
PASS inline script parses (node --check equivalent)
PASS zero innerHTML writes during init
PASS zero innerHTML writes at app init
PASS harness bridge window.__rcb exposed
PASS VISIBLE start screen at load
PASS 3 start chips painted
PASS VISIBLE header + counter at load
PASS counter starts at 0 messages
FAIL auto-demo started on its own (1 turn, no click needed)
FAIL singular counter reads '1 message' (not '1 messages')
PASS counter keeps nbsp separator
FAIL auto user bubble painted
FAIL thinking state painted while working
PASS header + counter still VISIBLE beside thinking row (no touch/cover)
FAIL auto answer painted ($1.24M KPI)
FAIL auto answer trend annotation painted
FAIL auto-advance to Split painted (original loops on its own)
FAIL auto loop produced 4 turns (Q1 + Split)
FAIL plural counter reads '4 messages'
PASS counter still VISIBLE after auto turns (user bubbles do not cover it)
PASS header sits above turns in DOM order
FAIL auto turns present for identity check
PASS manual click-to-answer flow still works ($1.41M forecast)
FAIL manual send appended (6 turns)
FAIL counter follows manual send
FAIL full-loop node identity (user + answer elements)
FAIL full-loop node identity (typed text node)
FAIL first answer text intact after full loop
PASS zero innerHTML writes after init
PASS dark theme applies
FAIL VISIBLE painted text in dark theme
FAIL VISIBLE painted text in light theme

HARNESS FAILED (18 failed, 29 passed) [./original-backup.html]
```

### Harness output vs FIXED (`./index.html`, exit 0) — pasted

```
PASS index.html < 200KB (49317 bytes)
PASS noflash guard present
PASS noflash guard before CSS paint
PASS meta color-scheme present
PASS tabular-nums for changing numbers
PASS tap highlight transparent
PASS hover rules gated behind media query
PASS inline scripts present (noflash + app)
PASS zero innerHTML in app script source
PASS no HTML-string injection APIs
PASS verbatim demo payload (trend)
PASS verbatim demo payload (split)
PASS verbatim demo payload (forecast)
PASS colhead bottom margin non-negative (header spacing, no intrusion/overlap) — got: margin:0 0 14
PASS inline script parses (node --check equivalent)
PASS zero innerHTML writes during init
PASS zero innerHTML writes at app init
PASS harness bridge window.__rcb exposed
PASS VISIBLE start screen at load
PASS 3 start chips painted
PASS VISIBLE header + counter at load
PASS counter starts at 0 messages
PASS auto-demo started on its own (1 turn, no click needed)
PASS singular counter reads '1 message' (not '1 messages')
PASS counter keeps nbsp separator
PASS auto user bubble painted
PASS thinking state painted while working
PASS header + counter still VISIBLE beside thinking row (no touch/cover)
PASS auto answer painted ($1.24M KPI)
PASS auto answer trend annotation painted
PASS auto-advance to Split painted (original loops on its own)
PASS auto loop produced 4 turns (Q1 + Split)
PASS plural counter reads '4 messages'
PASS counter still VISIBLE after auto turns (user bubbles do not cover it)
PASS header sits above turns in DOM order
PASS auto turns present for identity check
PASS manual click-to-answer flow still works ($1.41M forecast)
PASS manual send appended (6 turns)
PASS counter follows manual send
PASS full-loop node identity (user + answer elements)
PASS full-loop node identity (typed text node)
PASS first answer text intact after full loop
PASS zero innerHTML writes after init
PASS dark theme applies
PASS VISIBLE painted text in dark theme
PASS light theme applies
PASS VISIBLE painted text in light theme

HARNESS OK (47 checks) [./index.html]
```

## How to test in a browser

Open `index.html`. On load the start screen paints, then Q1 appears on its own (`Reading
Stripe and HubSpot…` → `$1.24M` answer), followed by the Split answer — matching the
original's loop. Clicking any suggestion still answers (~1.4 s + typewriter). Toggle the
sun/moon button to check dark mode. Header lines no longer touch; user bubbles never cover
`44k / 200k`; the pill reads `1 message` after one turn.
