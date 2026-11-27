# Integration Flow — replica report

## What was built
Standalone `index.html` (22.8 KB, inline CSS + JS, zero external deps) replicating the
affectUI **Integration Flow** illustration (slug `integration-flow`, Product scenes, Pro):
integration pills on a dashed arc beaming data into a central hub.

- Layout: warm blob field, dashed orbit arc (SVG, `stroke-dasharray 40 40`), glow
  out/in washes, beam link (core + blurred glow), hub card left, 6 pills right.
- Hub: **Data Analysis** / **Centralized Data Processing** (verbatim).
- Pills: title **API Integration** + sub name, rotating through verbatim demo data
  **Okta (mono), Snowflake, Slack, ClickUp, Zendesk (mono)** — 5 items over 6 slots
  with the original modulo rotation (`((n-1-b) % j + j) % j`), so one name repeats,
  exactly like the demo. `data-fill="black"|"color"` preserved for mono handling.
- Loop timing mirrors the demo constants (`FOCUS 900 / CHARGE 620 / SWEEP 1100 /
  base width 2400`, initial 700 ms, hub lights ~605 ms after sweep, next index after
  1360 ms, restart 1220 ms after focus). Beam re-triggers via class toggle;
  `prefers-reduced-motion` pauses the loop and parks the beam mid-track.
- Clean-room: all icons are original approximations (initials / 4-dot Slack grid /
  gradient triangle), not the compiled SVG paths. No source copied.
- `role="img"` + verbatim `aria-label`:
  “Integrations like Slack, Okta and Snowflake sending data into a central data
  analysis hub”. Stage is `aria-hidden`; live `role="status"` line narrates
  hub/pills/sweep for AT. Toggle is a real button with `aria-pressed`.
- Responsive: JS `scale = clientWidth / 2400` (ResizeObserver + fallback);
  ≤640 px collapses to a stacked list (arc/beam/glow hidden, cards static).
- v5 polish: hover rules only inside `@media (hover: hover) and (pointer: fine)`,
  `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:
  tabular-nums}`, concentric pill radius, borders on dividers/inputs only,
  1 px inset outline on badges, optical padding tweak on the toggle icon.

## What matches the original
Copy (hub titles, 5 names, aria-label, “API Integration” fallback), 6-slot phase
system (`data-phase 0–6`, phase 3 = charged/solid, 0/6 = faded exits), charge/glow
pairing (pills + out-glow, hub + in-glow), 1.1 s beam sweep, amber/dark-mode token
shifts, fade-to-surface at the bottom.

## What was approximated / not verified
- Blob field reduced from 14 blobs to 6 radial washes (same palette/feel).
- Badge rings simplified to CSS radial + inner shadow (no SVG turbulence filters).
- Hub glyph is a geometric mark, not the original 5-petal path.
- No visual pixel-diff against the original (no browser in this environment).

## How to test
1. Open `index.html` in a browser (double-click; no server needed).
2. Watch pills rotate, beam sweep, hub charge; status line updates.
3. Click **Dark/Light** (top-right) — page switches `data-theme` on `<html>`,
   persisted to `localStorage` (`integration-flow-theme`); reload keeps it.
4. Narrow the window below ~640 px — illustration stacks to a list.
5. Node-only verification (no browser):
   `node --check` on the extracted inline script + `node harness.js`.

## Verification (node only, in-dir)
- `node --check inline-check.js` (extracted last `<script>`): **CHECK_OK**.
- `node harness.js` (DOM stub, no deps): **all 33 assertions pass**, covering:
  - VISIBLE painted text (hub titles + all 5 names + “API Integration”),
  - full-loop node identity (same 6 pill objects before/after loop, `b 0→6`),
  - zero `innerHTML` writes after init (source has none, runtime counter 0),
  - light AND dark themes (text survives both `data-theme` values),
  - no-flash guard order, `meta color-scheme`, tokens, v5 hover/tap/tabs rules.
- `index.html` = 22,771 bytes (< 200 KB budget).
- Checked light + dark: dark uses `--surface #1c1c1f / --page #101012`,
  adjusted charge washes + badge treatments; contrast reviewed (no grey-on-grey).

---

## TARGETED FIX (2026-11-27) — pill contrast / clipping / distribution

### Defect (real-browser QA)
- LIGHT theme: several pills white-text-on-white (invisible) — top Snowflake pill
  CUT IN HALF by scene top edge in both themes, bottom Okta text blank,
  API Integration / Slack texts invisible; pills PILE UP on right overlapping
  dashed arc while left empty.
- DARK: texts mostly readable but Snowflake still cut, Zendesk very faint,
  pills still right-piled.
- Expected per original: pills distributed along flow path, readable contrast
  in both themes, none clipped.

### Original-source check
- `./REPLICATE_SPEC.md` and `./demo-original.js` were looked for with RELATIVE
  paths in THIS directory (`./batch30/integration-flow/`):
  `ls ./` shows only `REPORT.md index.html` (plus this fix artifacts).
  `find ./ -maxdepth 4 -name demo-original* -o -name REPLICATE*` finds specs
  only in `pilot/` and `batch1/` — **no `demo-original.js` for this component**.
  So the original behaviour could NOT be diffed directly; it was inferred from
  the QA description + the existing 6-slot phase system. No `demo-original.js`
  behaviour was contradicted — the fix preserves the phase system, timing,
  `data-fill`, verbatim copy, and JS rotation logic.
- If the original demo behaves the same way (e.g. fully-offscreen exits at
  0/6), that part was NOT "fixed" — exits remain `opacity:0`.

### Root cause (in `./index.html` BEFORE fix)
1. Light vars: `--pill-title-dim:rgba(255,255,255,.82); --pill-sub-dim:rgba(255,255,255,.45)`
   = white text on white pill gradient (`linear-gradient(180deg,rgba(255,255,255,.8),...)`)
   → contrast ~1.00:1 (invisible). Only `data-phase=3` (hot, dark text) readable.
2. Geometry: base `.pill{left:1020px;top:520px}` + phases
   `1:(240,-562)` → yArt=-42 → globalTop=-111px (cut);
   `5:(240,558)` → yArt=1078 → globalBot=1593px >1490 (cut).
   Artboard `top:-55 scale:1.33333 stageH:1490`, pillH≈158.
3. Right-pile: visible minX=1020 (all pills x∈[1020,1260]), overlapping arc
   left edge (~1102), leaving centre-left empty.

### Fix (targeted, 9 CSS lines, no JS logic change)
- Light: `--pill-title-dim:rgba(23,23,23,.68); --pill-sub-dim:rgba(23,23,23,.5)`
  → contrast 6.17:1 / 3.41:1 on white.
- Dark faint: `--pill-title-dim:.78→.84; --pill-sub-dim:.45→.6; --pill-sub-hot:.5→.68`
  → contrast 11.02:1 / 6.36:1 on `#26262b`, hierarchy dim<hot kept.
- Distribute + unclip: `.pill{left:880px}` (140px left, off arc);
  phases `0:(420,-640) 1:(280,-430) 2:(90,-215) 3:(0,0) 4:(90,215) 5:(280,430) 6:(420,640)`.
  Visible gTop 65→1211, gBot 275→1422 (inside 8..1482), spreadY=860 spreadX=280,
  minX=880 maxX=1160.
- Kept: `/*noflash*/` guard, 6-slot phases, 0/6 exits opacity 0, in-place
  `setAttribute/textContent/className` updates only, zero `innerHTML`, demo data
  verbatim, timing constants, `data-fill`, aria.

### HARD PROOF — md5 BEFORE/AFTER (must differ)
```
BEFORE (./original-backup.html == ./index.html at backup time):
ee7708f9b1f4dd4ba1d91f1d8d51602a  ./index.html
AFTER (fixed ./index.html):
f5a827b9ca57249a3d1d85373d305363  ./index.html
```
Commands (run in THIS dir `./batch30/integration-flow/` with RELATIVE paths):
`md5sum ./index.html` before editing → `ee7708…`; `cp ./index.html ./original-backup.html`;
after editing `md5sum ./index.html ./original-backup.html` → hashes above (differ).

### Harness FAIL (original) vs PASS (fixed)
Harness: `./harness.js` (in-dir, `node` only, DOM stub). Asserts VISIBLE state as
computed opacity/visibility/colours (blended contrast ≥3.0, global clipping with
8px margin, distribution minX≤950 maxX≤1450 spreadY≥600 spreadX≥150), in LIGHT
and DARK, plus full-loop node identity (`b 0→6`, same 6 objects), zero
`innerHTML` source+runtime, verbatim data, `/*noflash*/`, `data-fill`.

Command: `node ./harness.js ./original-backup.html` → FAIL (exit 1):
```
HARNESS original-backup.html:
  PASS noflash-guard — /*noflash*/ present
  PASS noflash-order — guard before styles
  PASS meta-color-scheme — meta light dark
  PASS zero-innerHTML-source — innerHTML occurrences=0
  PASS verbatim:Okta — Okta
  PASS verbatim:Snowflake — Snowflake
  PASS verbatim:Slack — Slack
  PASS verbatim:ClickUp — ClickUp
  PASS verbatim:Zendesk — Zendesk
  PASS verbatim:Data Analysis — Data Analysis
  PASS verbatim:Centralized Data Processing — Centralized Data Processing
  PASS verbatim:API Integration — API Integration
  PASS data-fill-preserved — data-fill present
  PASS aria-label-verbatim — aria-label
  INFO light title-dim=rgba(255,255,255,.82) sub-dim=rgba(255,255,255,.45)
  INFO dark  title-dim=rgba(255,255,255,.78) sub-dim=rgba(255,255,255,.45)
  INFO contrast light title=1.00 sub=1.00 (bg white)
  INFO contrast dark  title=9.70 sub=4.24 (bg #26262b)
  FAIL light-title-contrast>=3 — 1.00:1
  FAIL light-sub-contrast>=3 — 1.00:1
  PASS dark-title-contrast>=3 — 9.70:1
  PASS dark-sub-contrast>=3 — 4.24:1
  INFO base left=1020 top=520 artTop=-55 scale=1.3333333 stageH=1490
  INFO phases={"0":{"dx":480,"dy":-845,"op":0},"1":{"dx":240,"dy":-562,"op":1},"2":{"dx":80,"dy":-279,"op":1},"3":{"dx":0,"dy":0,"op":1},"4":{"dx":80,"dy":279,"op":1},"5":{"dx":240,"dy":558,"op":1},"6":{"dx":480,"dy":838,"op":0}}
  PASS six-phases-present — 0,1,2,3,4,5,6
  INFO phase1: yArt=-42 gTop=-111.0 gBot=99.7 op=1
  INFO phase2: yArt=241 gTop=266.3 gBot=477.0 op=1
  INFO phase3: yArt=520 gTop=638.3 gBot=849.0 op=1
  INFO phase4: yArt=799 gTop=1010.3 gBot=1221.0 op=1
  INFO phase5: yArt=1078 gTop=1382.3 gBot=1593.0 op=1
  FAIL no-visible-clipping — phase1 top clipped (-111.0<8); phase5 bottom clipped (1593.0>1482)
  INFO visX=[1260,1100,1020,1100,1260] minX=1020 maxX=1260 spreadX=240 spreadY=1120
  FAIL not-right-piled(minX<=950) — minX=1020
  PASS not-offscreen-right(maxX<=1450) — maxX=1260
  PASS distributed-spreadY>=600 — spreadY=1120
  PASS distributed-spreadX>=150 — spreadX=240
  PASS exit-phases-hidden — 0/6 opacity 0
  PASS six-pill-nodes-in-html — 0,1,2,3,4,5
  PASS inline-script-found — 5491 chars
  PASS js-runs-in-stub — main script executed
  PASS exposes-__if — window.__if present
  PASS six-nodes-exposed — 6
  INFO loop: b 0 -> 6 after 35 timers; sweeps=6
  PASS full-loop-node-identity — same 6 pill objects across loop
  PASS loop-advances-b — b 0->6
  INFO [light] pills: API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  PASS visible-text-light — API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  INFO [dark] pills: API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  PASS visible-text-dark — API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  PASS zero-innerHTML-runtime — writes=0
RESULT original-backup.html: 31 pass, 4 fail
```

Command: `node ./harness.js ./index.html` → PASS (exit 0):
```
HARNESS index.html:
  PASS noflash-guard — /*noflash*/ present
  PASS noflash-order — guard before styles
  PASS meta-color-scheme — meta light dark
  PASS zero-innerHTML-source — innerHTML occurrences=0
  PASS verbatim:Okta — Okta
  PASS verbatim:Snowflake — Snowflake
  PASS verbatim:Slack — Slack
  PASS verbatim:ClickUp — ClickUp
  PASS verbatim:Zendesk — Zendesk
  PASS verbatim:Data Analysis — Data Analysis
  PASS verbatim:Centralized Data Processing — Centralized Data Processing
  PASS verbatim:API Integration — API Integration
  PASS data-fill-preserved — data-fill present
  PASS aria-label-verbatim — aria-label
  INFO light title-dim=rgba(23,23,23,.68) sub-dim=rgba(23,23,23,.5)
  INFO dark  title-dim=rgba(255,255,255,.84) sub-dim=rgba(255,255,255,.6)
  INFO contrast light title=6.17 sub=3.41 (bg white)
  INFO contrast dark  title=11.02 sub=6.36 (bg #26262b)
  PASS light-title-contrast>=3 — 6.17:1
  PASS light-sub-contrast>=3 — 3.41:1
  PASS dark-title-contrast>=3 — 11.02:1
  PASS dark-sub-contrast>=3 — 6.36:1
  INFO base left=880 top=520 artTop=-55 scale=1.3333333 stageH=1490
  INFO phases={"0":{"dx":420,"dy":-640,"op":0},"1":{"dx":280,"dy":-430,"op":1},"2":{"dx":90,"dy":-215,"op":1},"3":{"dx":0,"dy":0,"op":1},"4":{"dx":90,"dy":215,"op":1},"5":{"dx":280,"dy":430,"op":1},"6":{"dx":420,"dy":640,"op":0}}
  PASS six-phases-present — 0,1,2,3,4,5,6
  INFO phase1: yArt=90 gTop=65.0 gBot=275.7 op=1
  INFO phase2: yArt=305 gTop=351.7 gBot=562.3 op=1
  INFO phase3: yArt=520 gTop=638.3 gBot=849.0 op=1
  INFO phase4: yArt=735 gTop=925.0 gBot=1135.7 op=1
  INFO phase5: yArt=950 gTop=1211.7 gBot=1422.3 op=1
  PASS no-visible-clipping — all visible pills inside stage
  INFO visX=[1160,970,880,970,1160] minX=880 maxX=1160 spreadX=280 spreadY=860
  PASS not-right-piled(minX<=950) — minX=880
  PASS not-offscreen-right(maxX<=1450) — maxX=1160
  PASS distributed-spreadY>=600 — spreadY=860
  PASS distributed-spreadX>=150 — spreadX=280
  PASS exit-phases-hidden — 0/6 opacity 0
  PASS six-pill-nodes-in-html — 0,1,2,3,4,5
  PASS inline-script-found — 5491 chars
  PASS js-runs-in-stub — main script executed
  PASS exposes-__if — window.__if present
  PASS six-nodes-exposed — 6
  INFO loop: b 0 -> 6 after 35 timers; sweeps=6
  PASS full-loop-node-identity — same 6 pill objects across loop
  PASS loop-advances-b — b 0->6
  INFO [light] pills: API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  PASS visible-text-light — API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  INFO [dark] pills: API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  PASS visible-text-dark — API Integration/Zendesk | API Integration/Zendesk | API Integration/Okta | API Integration/Snowflake | API Integration/Slack | API Integration/ClickUp
  PASS zero-innerHTML-runtime — writes=0
RESULT index.html: 35 pass, 0 fail
```

### node --check
```
node --check ./inline-check.js && echo CHECK_OK
CHECK_OK
node --check ./harness.js && echo HARNESS_SYNTAX_OK
HARNESS_SYNTAX_OK
```
`./inline-check.js` is the extracted last `<script>` (5491 chars), kept in-dir for audit.

### Files in THIS dir
- `./index.html` (fixed, 22763 bytes)
- `./original-backup.html` (pre-fix, 22771 bytes, for FAIL-vs-PASS proof)
- `./harness.js` (node-only stub, no deps)
- `./inline-check.js` (extracted script for `node --check`)
- `./REPORT.md` (this file)
No installs, no downloads, no `/tmp` writes, no `rm`, all paths RELATIVE.
