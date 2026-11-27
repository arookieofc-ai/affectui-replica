# Model Menu — targeted fix report (ghosted Llama row)

## Defect (from real-browser QA)
The 7th row (Llama) was GHOSTED in both themes:
- light: light-grey text + pale-blue icon on white (barely readable)
- dark: dark grey/blue text on dark (barely readable)
while the other 6 rows painted solid readable text. Row selection worked
(Gemini click moves the band + check) — kept working.

## Original-behaviour check (`./REPLICATE_SPEC.md` / `./demo-original.js`)
Per instructions I checked the original before changing anything, with RELATIVE paths
from THIS directory (`batch30/model-menu`):

```
$ ls ./REPLICATE_SPEC.md ./demo-original.js
ls: cannot access './REPLICATE_SPEC.md': No such file or directory
ls: cannot access './demo-original.js': No such file or directory
```

Neither file exists in THIS directory, so there was no original demo to confirm a
deliberate “coming soon” dimming. The prior `REPORT.md` claimed “last row dimmed,
as in the demo chunk”, but the QA brief states: per the original all rows paint at
full strength. With no original source to match, I restored full opacity/colour per
the QA instruction (do NOT keep the ghosting).

## Fix (targeted, 2 lines in `./index.html`, no rebuild)
```diff
-.mmn__row[data-last] .mmn__name{color:var(--row-faint)}
-.mmn__row[data-last] .mmn__logo{opacity:.75}
+.mmn__row[data-last] .mmn__name{color:var(--row-ink)}
+.mmn__row[data-last] .mmn__logo{opacity:1}
```
- Llama name now resolves to `var(--row-ink)` in both themes:
  light `rgba(0,0,0,.88)`, dark `rgba(255,255,255,.92)` — same as the other 6 rows.
- Llama logo opacity `1` (was `.75`).
- `data-last` attribute and `mark()` Llama glyph (`#0467DF`) untouched; demo data verbatim
  `["DeepSeek","GPT","Claude Opus","Gemini","Mistral Large","Qwen","Llama"]`.
- Preserved: `/*noflash*/` guard (first script, before CSS + `color-scheme` meta +
  dual first-paint backgrounds), in-place updates only (`--at` / `data-active` /
  text of existing nodes), zero `innerHTML` writes after init (and none in source),
  Gemini-click selection (band + check), full-loop node identity, theme toggle +
  `model-menu-theme` persistence key.

## Hard proof (a) — md5 BEFORE / AFTER differ
```
BEFORE: 81a54dd900133816d82dea332a7529db  ./index.html
AFTER:  809d6c8d050fe64ddeff58ffc4119234  ./index.html
```
- BEFORE was captured with `md5sum ./index.html` prior to editing, then
  `cp ./index.html ./original-backup.html` (both hashed `81a54dd9…`).
- AFTER is `md5sum ./index.html` post-edit (`809d6c8d…`); `diff -u` shows only the
  2 CSS lines above. Hashes differ — requirement met.

## Hard proof (b) — harness FAILs on original, PASSes on fixed
Harness: `./harness.js` (in-dir, node only, DOM stub). It asserts VISIBLE state as
computed opacity/visibility/colours (not just DOM presence) in light AND dark,
plus Gemini selection (band `--at` + check), full-loop node identity, zero
`innerHTML` after init, `/*noflash*/`, demo data verbatim. Run both ways:

### FAIL — `node ./harness.js ./original-backup.html` (exit=1)
```
TARGET: ./original-backup.html
  PASS noflash-guard — /*noflash*/ present
  PASS no-innerHTML-in-source — occurrences=0
  PASS demo-data-verbatim — 7 names verbatim
  INFO light --row-ink=rgba(0,0,0,.88) --row-faint=rgba(0,0,0,.36)
  INFO dark  --row-ink=rgba(255,255,255,.92) --row-faint=rgba(255,255,255,.4)
  INFO [data-last] rules found: 2
  INFO rule0: .mmn__row[data-last] .mmn__name{color:var(--row-faint)}
  INFO rule1: .mmn__row[data-last] .mmn__logo{opacity:.75}
  INFO effective Llama name colour decl=var(--row-faint) logo opacity=0.75
  INFO computed light: text=var(--row-faint) icon-opacity=0.75 on white card
  INFO computed dark:  text=var(--row-faint) icon-opacity=0.75 on dark card
  FAIL llama-light-visible — name=var(--row-faint) opacity=0.75 (need full-strength light)
  FAIL llama-dark-visible — name=var(--row-faint) opacity=0.75 (need full-strength dark)
  PASS main-script-found — bytes=8882
  PASS hook-exposed — window.__modelMenu
  PASS row-count-7 — rows=7
  PASS names-verbatim-runtime — DeepSeek,GPT,Claude Opus,Gemini,Mistral Large,Qwen,Llama
  PASS gemini-select-moves-band — selected=3 --at=3
  PASS band-check-present — band children=1
  PASS band-node-stable — band identity
  PASS full-loop-node-identity — 7 rows + container identical after walk+selects
  PASS zero-innerHTML-after-init — writes=0

RESULT: FAILURES: llama-light-visible, llama-dark-visible (12 passed, 2 failed)
```

### PASS — `node ./harness.js ./index.html` (exit=0)
```
TARGET: ./index.html
  PASS noflash-guard — /*noflash*/ present
  PASS no-innerHTML-in-source — occurrences=0
  PASS demo-data-verbatim — 7 names verbatim
  INFO light --row-ink=rgba(0,0,0,.88) --row-faint=rgba(0,0,0,.36)
  INFO dark  --row-ink=rgba(255,255,255,.92) --row-faint=rgba(255,255,255,.4)
  INFO [data-last] rules found: 2
  INFO rule0: .mmn__row[data-last] .mmn__name{color:var(--row-ink)}
  INFO rule1: .mmn__row[data-last] .mmn__logo{opacity:1}
  INFO effective Llama name colour decl=var(--row-ink) logo opacity=1
  INFO computed light: text=var(--row-ink) icon-opacity=1 on white card
  INFO computed dark:  text=var(--row-ink) icon-opacity=1 on dark card
  PASS llama-light-visible — name=var(--row-ink) opacity=1 (need full-strength light)
  PASS llama-dark-visible — name=var(--row-ink) opacity=1 (need full-strength dark)
  PASS main-script-found — bytes=8882
  PASS hook-exposed — window.__modelMenu
  PASS row-count-7 — rows=7
  PASS names-verbatim-runtime — DeepSeek,GPT,Claude Opus,Gemini,Mistral Large,Qwen,Llama
  PASS gemini-select-moves-band — selected=3 --at=3
  PASS band-check-present — band children=1
  PASS band-node-stable — band identity
  PASS full-loop-node-identity — 7 rows + container identical after walk+selects
  PASS zero-innerHTML-after-init — writes=0

RESULT: ALL CHECKS PASSED (14 passed, 0 failed)
```

## Verification (node only, no installs/downloads)
- `node --check ./harness.js` — OK (`CHECK-OK`).
- Component JS executes cleanly in the stub (`hook-exposed`, no-throw); `diff -u`
  confirms only the 2-line CSS change; `md5sum` BEFORE/AFTER differ (above).
- All files (`index.html`, `original-backup.html`, `harness.js`, `REPORT.md`) live
  IN THIS DIRECTORY; no access outside it; no `rm` on `/tmp` paths.
