# REPORT — model-menu Llama-row readability (targeted fix)

## 1. What was done
Targeted 3-line CSS fix in `./index.html` (no rebuild, no DOM/JS changes):
- `--row-faint` (light): `rgba(0,0,0,.36)` → `rgba(0,0,0,.66)`
- `--row-faint` (dark): `rgba(255,255,255,.4)` → `rgba(255,255,255,.78)`
- `.mmn__row[data-last] .mmn__logo` opacity: `.75` → `.9`

The `data-last` faint distinction for the Llama row is **kept** (still dimmer than normal rows: faint alpha .66 < ink .88 light; .78 < .92 dark), but the text now passes the 4.5:1 readability threshold in both themes. Logo raised to .9 so the mark is no longer ghosted. The selector that paints it (`.mmn__row[data-last] .mmn__name{color:var(--row-faint)}`) is untouched — the fix flows through the same rule, so the painted result provably changes (this is what the previous byte-only fix missed: it never altered the resolved value of that rule).

## 2. demo-original.js check — which case?
**Case A: the original deliberately styles this row as dimmed.** Evidence from `./demo-original.js`:
- `.ui-mmn__row[data-last] .ui-mmn__name{color: var(--ui-mmn-faint)}`
- `.ui-mmn__row[data-last] .ui-mmn__logo{opacity: 0.6}`
- `--ui-mmn-faint` = `rgba(0,0,0,0.36)` (light) / `rgba(255,255,255,0.4)` (dark)
- `data-last` is set on `n===e.length-1` (always the last model, Llama: models are DeepSeek, GPT, Claude Opus, Gemini, Mistral Large, Qwen, Llama)
- No "coming soon" / "disabled" / "unavailable" marker text anywhere in the original (grep finds none).

Per the task instruction I therefore **kept the dimmed styling** (no conversion to full-ink solid row, no invented marker pill — the original carries no textual marker, so none was added; demo data kept verbatim) and made it **readable**: light contrast 2.52→7.26, dark 3.83→11.39.

## 3. Stalling state transition (why the old harness passed but the browser still ghosted)
**Stalled transition: `data-last (faint) → data-picked / band-selected (solid)` for row index 6 (Llama) never fires during the demo loop.**
Why: the demo state machine auto-walks only `walk=3` rows (`selected=(selected+1)%3`, i.e. DeepSeek→GPT→Claude Opus every 2200 ms, `hold=2200`, start `selected=1`). Llama (index 6) is outside the walk window, so the only way it ever leaves the faint phase is a manual row click (`select(6,true)` stops autoplay). A stub harness that sets `data-picked`/`data-active` attributes directly on row 6 "passes" without ever firing the page's own `tick`/`select` path — but the real browser, driven solely by the page's timers, keeps Llama in `data-last` for every phase (t0…t3, light and dark). Hence the previous fix changed bytes that were never on the painted path. The new harness (`./harness.js`) drives **only** the page's own timers (`setInterval` fake clock) and its own handlers (timer tick, theme toggle click), and asserts the **resolved painted color/contrast/opacity/geometry** at each phase — so a fix only passes if the `data-last` rule itself resolves to a readable color.

## 4. Hard proof
### md5 BEFORE / AFTER (must differ — they do)
- BEFORE: `81a54dd900133816d82dea332a7529db  ./index.html`
- AFTER:  `690f7729fcb7fbf2936b1f2cf4fad401  ./index.html`
- `diff original-backup.html index.html` = exactly 3 changed lines (the two `--row-faint` vars + the logo opacity), nothing else.

### Harness vs ORIGINAL (must FAIL — it does, exit 1)
```
TARGET: ./original-backup.html
  ok: noflash guard kept — /*noflash*/ in <head>
  ok: color-scheme meta kept
  ok: first-paint bg init kept
  ok: dark vars present — "rgba(255,255,255,.4)"
  ok: light faint var present — "rgba(0,0,0,.36)"
  ok: last-row faint rule kept (distinction preserved)
  ok: demo data: 7 names — NAMES verbatim
  ok: row height 32px — rowH=32
  ok: page exposes __modelMenu hook
  ok: 7 rows built once — rows=7
  ok: walk=3 hold=2200 — walk=3 hold=2200
  ok: initial selected=1 (GPT) — selected=1
  ok: data-last on Llama only at init
  ok: zero innerHTML writes after init — writes=0
LIGHT timeline (fake clock through page timers):
  [light t0 init] selected=1 --at=1 bandY=32px Llama(color=rgba(0,0,0,.36) c=2.52 logoOp=0.75) row0(c=16.56)
  ok: light t0 init: band tracks selected (1*32=32px)
  ok: light t0 init: Llama still marked data-last (distinction kept)
  FAIL: light t0 init: Llama text READABLE (contrast>=4.5) — contrast=2.52 color=rgba(0,0,0,.36) on #ffffff
  FAIL: light t0 init: Llama logo not ghosted (opacity>=0.8) — opacity=0.75
  ok: light t0 init: normal row readable — contrast=16.56
  ok: light t0 init: Llama still dimmer than normal (faint<ink alpha)
  ok: light tick1: selected 1->2 via own timer — selected=2
  [light t1 +2200ms] selected=2 --at=2 bandY=64px Llama(color=rgba(0,0,0,.36) c=2.52 logoOp=0.75) row0(c=16.56)
  ok: light t1 +2200ms: band tracks selected (2*32=64px)
  ok: light t1 +2200ms: Llama still marked data-last (distinction kept)
  FAIL: light t1 +2200ms: Llama text READABLE (contrast>=4.5) — contrast=2.52 color=rgba(0,0,0,.36) on #ffffff
  FAIL: light t1 +2200ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.75
  ok: light t1 +2200ms: normal row readable — contrast=16.56
  ok: light t1 +2200ms: Llama still dimmer than normal (faint<ink alpha)
  ok: light tick2: selected 2->0 (walk wrap) — selected=0
  [light t2 +4400ms] selected=0 --at=0 bandY=0px Llama(color=rgba(0,0,0,.36) c=2.52 logoOp=0.75) row0(c=16.56)
  ok: light t2 +4400ms: band tracks selected (0*32=0px)
  ok: light t2 +4400ms: Llama still marked data-last (distinction kept)
  FAIL: light t2 +4400ms: Llama text READABLE (contrast>=4.5) — contrast=2.52 color=rgba(0,0,0,.36) on #ffffff
  FAIL: light t2 +4400ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.75
  ok: light t2 +4400ms: normal row readable — contrast=16.56
  ok: light t2 +4400ms: Llama still dimmer than normal (faint<ink alpha)
  ok: light tick3: selected 0->1 (full loop) — selected=1
  [light t3 +6600ms full-loop] selected=1 --at=1 bandY=32px Llama(color=rgba(0,0,0,.36) c=2.52 logoOp=0.75) row0(c=16.56)
  ok: light t3 +6600ms full-loop: band tracks selected (1*32=32px)
  ok: light t3 +6600ms full-loop: Llama still marked data-last (distinction kept)
  FAIL: light t3 +6600ms full-loop: Llama text READABLE (contrast>=4.5) — contrast=2.52 color=rgba(0,0,0,.36) on #ffffff
  FAIL: light t3 +6600ms full-loop: Llama logo not ghosted (opacity>=0.8) — opacity=0.75
  ok: light t3 +6600ms full-loop: normal row readable — contrast=16.56
  ok: light t3 +6600ms full-loop: Llama still dimmer than normal (faint<ink alpha)
  ok: in-place: row node identity preserved across loop
  ok: in-place: name node identity preserved
  ok: zero innerHTML writes after loop — writes=0
DARK timeline (theme via page's own toggle handler):
  ok: theme toggled via own handler to dark — light->dark
  [dark dark t3] selected=1 --at=1 bandY=32px Llama(color=rgba(255,255,255,.4) c=3.83 logoOp=0.75) row0(c=15.62)
  ok: dark dark t3: band tracks selected (1*32=32px)
  ok: dark dark t3: Llama still marked data-last (distinction kept)
  FAIL: dark dark t3: Llama text READABLE (contrast>=4.5) — contrast=3.83 color=rgba(255,255,255,.4) on #141414
  FAIL: dark dark t3: Llama logo not ghosted (opacity>=0.8) — opacity=0.75
  ok: dark dark t3: normal row readable — contrast=15.62
  ok: dark dark t3: Llama still dimmer than normal (faint<ink alpha)
  [dark dark t4 +2200ms] selected=2 --at=2 bandY=64px Llama(color=rgba(255,255,255,.4) c=3.83 logoOp=0.75) row0(c=15.62)
  ok: dark dark t4 +2200ms: band tracks selected (2*32=64px)
  ok: dark dark t4 +2200ms: Llama still marked data-last (distinction kept)
  FAIL: dark dark t4 +2200ms: Llama text READABLE (contrast>=4.5) — contrast=3.83 color=rgba(255,255,255,.4) on #141414
  FAIL: dark dark t4 +2200ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.75
  ok: dark dark t4 +2200ms: normal row readable — contrast=15.62
  ok: dark dark t4 +2200ms: Llama still dimmer than normal (faint<ink alpha)
  [dark dark t5 +4400ms] selected=0 --at=0 bandY=0px Llama(color=rgba(255,255,255,.4) c=3.83 logoOp=0.75) row0(c=15.62)
  ok: dark dark t5 +4400ms: band tracks selected (0*32=0px)
  ok: dark dark t5 +4400ms: Llama still marked data-last (distinction kept)
  FAIL: dark dark t5 +4400ms: Llama text READABLE (contrast>=4.5) — contrast=3.83 color=rgba(255,255,255,.4) on #141414
  FAIL: dark dark t5 +2200ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.75
  ok: dark dark t5 +4400ms: normal row readable — contrast=15.62
  ok: dark dark t5 +4400ms: Llama still dimmer than normal (faint<ink alpha)
  ok: theme toggled back to light via own handler
RESULT: FAIL (14 failing checks)
```

### Harness vs FIXED (must PASS — it does, exit 0)
```
TARGET: ./index.html
  ok: noflash guard kept — /*noflash*/ in <head>
  ok: color-scheme meta kept
  ok: first-paint bg init kept
  ok: dark vars present — "rgba(255,255,255,.78)"
  ok: light faint var present — "rgba(0,0,0,.66)"
  ok: last-row faint rule kept (distinction preserved)
  ok: demo data: 7 names — NAMES verbatim
  ok: row height 32px — rowH=32
  ok: page exposes __modelMenu hook
  ok: 7 rows built once — rows=7
  ok: walk=3 hold=2200 — walk=3 hold=2200
  ok: initial selected=1 (GPT) — selected=1
  ok: data-last on Llama only at init
  ok: zero innerHTML writes after init — writes=0
LIGHT timeline (fake clock through page timers):
  [light t0 init] selected=1 --at=1 bandY=32px Llama(color=rgba(0,0,0,.66) c=7.26 logoOp=0.9) row0(c=16.56)
  ok: light t0 init: band tracks selected (1*32=32px)
  ok: light t0 init: Llama still marked data-last (distinction kept)
  ok: light t0 init: Llama text READABLE (contrast>=4.5) — contrast=7.26 color=rgba(0,0,0,.66) on #ffffff
  ok: light t0 init: Llama logo not ghosted (opacity>=0.8) — opacity=0.9
  ok: light t0 init: normal row readable — contrast=16.56
  ok: light t0 init: Llama still dimmer than normal (faint<ink alpha)
  ok: light tick1: selected 1->2 via own timer — selected=2
  [light t1 +2200ms] selected=2 --at=2 bandY=64px Llama(color=rgba(0,0,0,.66) c=7.26 logoOp=0.9) row0(c=16.56)
  ok: light t1 +2200ms: band tracks selected (2*32=64px)
  ok: light t1 +2200ms: Llama still marked data-last (distinction kept)
  ok: light t1 +2200ms: Llama text READABLE (contrast>=4.5) — contrast=7.26 color=rgba(0,0,0,.66) on #ffffff
  ok: light t1 +2200ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.9
  ok: light t1 +2200ms: normal row readable — contrast=16.56
  ok: light t1 +2200ms: Llama still dimmer than normal (faint<ink alpha)
  ok: light tick2: selected 2->0 (walk wrap) — selected=0
  [light t2 +4400ms] selected=0 --at=0 bandY=0px Llama(color=rgba(0,0,0,.66) c=7.26 logoOp=0.9) row0(c=16.56)
  ok: light t2 +4400ms: band tracks selected (0*32=0px)
  ok: light t2 +4400ms: Llama still marked data-last (distinction kept)
  ok: light t2 +4400ms: Llama text READABLE (contrast>=4.5) — contrast=7.26 color=rgba(0,0,0,.66) on #ffffff
  ok: light t2 +2200ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.9
  ok: light t2 +4400ms: normal row readable — contrast=16.56
  ok: light t2 +4400ms: Llama still dimmer than normal (faint<ink alpha)
  ok: light tick3: selected 0->1 (full loop) — selected=1
  [light t3 +6600ms full-loop] selected=1 --at=1 bandY=32px Llama(color=rgba(0,0,0,.66) c=7.26 logoOp=0.9) row0(c=16.56)
  ok: light t3 +6600ms full-loop: band tracks selected (1*32=32px)
  ok: light t3 +6600ms full-loop: Llama still marked data-last (distinction kept)
  ok: light t3 +6600ms full-loop: Llama text READABLE (contrast>=4.5) — contrast=7.26 color=rgba(0,0,0,.66) on #ffffff
  ok: light t3 +6600ms full-loop: Llama logo not ghosted (opacity>=0.8) — opacity=0.9
  ok: light t3 +6600ms full-loop: normal row readable — contrast=16.56
  ok: light t3 +6600ms full-loop: Llama still dimmer than normal (faint<ink alpha)
  ok: in-place: row node identity preserved across loop
  ok: in-place: name node identity preserved
  ok: zero innerHTML writes after loop — writes=0
DARK timeline (theme via page's own toggle handler):
  ok: theme toggled via own handler to dark — light->dark
  [dark dark t3] selected=1 --at=1 bandY=32px Llama(color=rgba(255,255,255,.78) c=11.39 logoOp=0.9) row0(c=15.62)
  ok: dark dark t3: band tracks selected (1*32=32px)
  ok: dark dark t3: Llama still marked data-last (distinction kept)
  ok: dark dark t3: Llama text READABLE (contrast>=4.5) — contrast=11.39 color=rgba(255,255,255,.78) on #141414
  ok: dark dark t3: Llama logo not ghosted (opacity>=0.8) — opacity=0.9
  ok: dark dark t3: normal row readable — contrast=15.62
  ok: dark dark t3: Llama still dimmer than normal (faint<ink alpha)
  [dark dark t4 +2200ms] selected=2 --at=2 bandY=64px Llama(color=rgba(255,255,255,.78) c=11.39 logoOp=0.9) row0(c=15.62)
  ok: dark dark t4 +2200ms: band tracks selected (2*32=64px)
  ok: dark dark t4 +2200ms: Llama still marked data-last (distinction kept)
  ok: dark dark t4 +2200ms: Llama text READABLE (contrast>=4.5) — contrast=11.39 color=rgba(255,255,255,.78) on #141414
  ok: dark dark t4 +2200ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.9
  ok: dark dark t4 +2200ms: normal row readable — contrast=15.62
  ok: dark dark t4 +2200ms: Llama still dimmer than normal (faint<ink alpha)
  [dark dark t5 +4400ms] selected=0 --at=0 bandY=0px Llama(color=rgba(255,255,255,.78) c=11.39 logoOp=0.9) row0(c=15.62)
  ok: dark dark t5 +4400ms: band tracks selected (0*32=0px)
  ok: dark dark t5 +4400ms: Llama still marked data-last (distinction kept)
  ok: dark dark t5 +4400ms: Llama text READABLE (contrast>=4.5) — contrast=11.39 color=rgba(255,255,255,.78) on #141414
  ok: dark dark t5 +2200ms: Llama logo not ghosted (opacity>=0.8) — opacity=0.9
  ok: dark dark t5 +4400ms: normal row readable — contrast=15.62
  ok: dark dark t5 +4400ms: Llama still dimmer than normal (faint<ink alpha)
  ok: theme toggled back to light via own handler
RESULT: PASS
```
(Run: `node ./harness.js ./original-backup.html` → exit 1 FAIL; `node ./harness.js ./index.html` → exit 0 PASS. Raw logs also saved as `./harness-original.log` / `./harness-fixed.log`.)

## 5. Guards / invariants (all verified by harness)
- `/*noflash*/` guard + `color-scheme` meta + first-paint bg init: kept, asserted.
- In-place updates only: row and name node identity preserved across a full timer loop; band moves via `--at` custom property; zero `innerHTML` writes after init (counter asserted at init and after loop).
- Demo data verbatim: `["DeepSeek","GPT","Claude Opus","Gemini","Mistral Large","Qwen","Llama"]`, `walk=3`, `hold=2200`, `rowH=32`, start `selected=1` — all asserted from the page's own script.
- No new files referenced; no external deps; fix is CSS-variable-only so it cannot break the timer/state machine.

## 6. What matches the original / what could not be verified
- Matches: 7-row menu, order, provider marks, `data-last` faint treatment of Llama, pink band glide (520 ms ease, 32 px steps), auto-walk of first three models every 2.2 s, theme toggle with same tokens, header/meta layout.
- Could not be verified here: real-browser raster (no browser in this environment) — the harness instead resolves the exact painted values the browser computes (same CSS cascade: `data-last` rule → `var(--row-faint)` → contrast vs `--card`) at every demo phase in both themes, which is the closest mechanical proxy; please re-check visually by opening `./index.html` in a browser.
- How to test: open `./index.html` in a browser (light + toggle to dark via the sun/moon button); watch the band cycle DeepSeek→GPT→Claude Opus; confirm Llama stays last, visibly dimmer than the others yet clearly legible in both themes; or run `node ./harness.js ./index.html` (expect `RESULT: PASS`) and `node ./harness.js ./original-backup.html` (expect `RESULT: FAIL`).

## 7. Files in this directory
- `./index.html` (fixed; md5 `690f7729fcb7fbf2936b1f2cf4fad401`)
- `./original-backup.html` (pre-fix copy; md5 `81a54dd900133816d82dea332a7529db`)
- `./harness.js` (timeline-driven painted-state harness)
- `./harness-original.log`, `./harness-fixed.log` (raw runs)
- `./REPORT.md` (this file)
