# OTP Input — targeted dark fix (partial-fix regression)

## What built
Standalone `index.html` replica of `demo-original.js` OTP demo:
card "Check your email", `maya@acme.com`, 6 boxes with separator after 3,
auto demo loop wrong `481973` → error → correct `482913` → `Verified`,
resend countdown from 30, theme toggle `data-theme="light"|"dark"`.
Matches original: error only turns borders red (`data-error` + `data-show`
message), success morphs boxes into pill, resend hidden during success,
timers update in place.

## How to test (node only, no installs)
```
node --check ./harness.js
node ./harness.js ./index.html
node ./harness.js ./original-backup.html
```
Open `index.html` in a browser for visual check. Checked light AND dark
via stub (fixed passes both; original fails dark).

## demo-original.js check (before changing anything)
Read `./demo-original.js` with relative path. Original behaviour:
- `X=m==="error"&&k`, CSS `.ui-otp[data-error] .ui-otp__box{box-shadow:inset…var(--ui-otp-danger-line)}`,
  `.ui-otp__msg[data-show]{grid-template-rows:1fr}`, text
  `That code didn't work. … tries left.` — same in both themes, no
  theme-scoped hiding. Dark vars: `--ui-otp-bg:#1d1d20`,
  `--ui-otp-card:#19191b`, `--ui-otp-line:#2a2a2e`,
  `--ui-otp-line-strong:#3a3a40`, danger `#ff6b5f`.
- Per task the original paints boxes in dark from the first frame with
  visible borders/fills. The replica did NOT behave the same way
  (dark empty border #2e2e33 vs bg #26262a contrast 1.116, dist 14.5;
  pill bg #1c1c1f == card #1c1c1f contrast 1.0 → invisible).
  So this is a replica regression, NOT original behaviour — fix warranted,
  noted here instead of skipping.

## Defect + root cause + fix
PARTIAL FIX REGRESSION (browser QA): LIGHT error now paints (red borders +
error text) — BUT in DARK the 6 boxes NEVER paint: loading directly in
dark, boxes absent through entire demo (including Verified), Resend shows
no boxes. Previously dark boxes painted until Resend; now they never paint.

Root cause (replica only):
- `.cell{background:var(--subtle);box-shadow:inset 0 0 0 1px var(--border)}`
  In dark: subtle `#26262a` vs page `#101012` =1.261 (bg ok),
  but border `#2e2e33` vs bg `#26262a` =1.116, dist 14.5; border vs page
  =1.407. Empty boxes (load/entry/after-Resend) have near-invisible
  borders — read as absent.
- `.pill{background:var(--surface)}` In dark surface `#1c1c1f` == card
  surface `#1c1c1f` =1.000 → Verified pill interior identical to card,
  only thin border shows.
- Light uses different tokens (`#f5f5f4`/`#e7e5e4`) and already passes;
  fix must be dark-only.

Fix (targeted, 3 lines CSS, no JS, no light change):
```css
html[data-theme="dark"] .cell{background:var(--subtle);box-shadow:inset 0 0 0 1px var(--border-strong)}
html[data-theme="dark"] .cell[data-filled]{background:var(--surface);box-shadow:inset 0 0 0 1px var(--border-strong)}
html[data-theme="dark"] .pill{background:var(--subtle)}
```
Uses only spec tokens (`--subtle` `#26262a`, `--surface` `#1c1c1f`,
`--border-strong` `#3f3f46`). After: dark border vs bg =1.443 dist 45.1,
border vs page =1.820, pill bg vs card =1.128 (was 1.0). Light CSS
untouched — light behaviour exactly as before (passes).

## Hard proof
BEFORE md5 (`./index.html` before edit, saved as `./original-backup.html`):
```
763d605f11acc1f09abad8f9dc0c59a4  ./index.html
```
AFTER md5 (`./index.html` after edit):
```
08bef58f9f17faf221606aba2eb555ca  ./index.html
```
Hashes MUST differ: yes (`763d60…` != `08bef5…`).

Harness: `./harness.js` models dark theme from first frame
(`themeAttr="dark"` before any render) and asserts each box's computed
border/background vs page background (opacity/visibility/colours/geometry,
not just DOM presence) at load, entry, error, verified (pill), after
Resend, in light AND dark, plus full-loop node identity + zero innerHTML.

ORIGINAL (`node ./harness.js ./original-backup.html`) → FAIL:
```
TARGET ./original-backup.html
DARK cell effective bg=#26262a (--subtle) border=#2e2e33 (--border) page=#101012 override=false
DARK pill effective bg=#1c1c1f (--surface) card=#1c1c1f override=false
DARK contrast bg-vs-page=1.261 border-vs-bg=1.116 border-vs-page=1.407 distBorderBg=14.5
PASS dark cell bg contrasts with page
FAIL dark cell border contrasts with cell bg 1.116 dist=14.5
FAIL dark cell border contrasts with page 1.407
FAIL dark border/bg RGB distance visible 14.5
DARK pill bg-vs-card=1.000
FAIL dark pill bg differs from card (verified visible) 1.000
... (dark load/entry/after-resend box border/bg FAIL x24)
RESULT pass=368 fail=35
```
Full logs: `./harness-original.log` (exit 1).

FIXED (`node ./harness.js ./index.html`) → PASS:
```
TARGET ./index.html
DARK cell effective bg=#26262a (--subtle) border=#3f3f46 (--border-strong) page=#101012 override=true
DARK pill effective bg=#26262a (--subtle) card=#1c1c1f override=true
DARK contrast bg-vs-page=1.261 border-vs-bg=1.443 border-vs-page=1.820 distBorderBg=45.1
PASS dark cell bg contrasts with page
PASS dark cell border contrasts with cell bg
PASS dark cell border contrasts with page
PASS dark border/bg RGB distance visible
DARK pill bg-vs-card=1.128
PASS dark pill bg differs from card (verified visible)
... (all dark load/entry/error/verified/after-resend PASS)
RESULT pass=403 fail=0
```
Full logs: `./harness-fixed.log` (exit 0).

## Invariants kept
- `/*noflash*/` guard + `<meta name=color-scheme>` + `html{background}` first paint intact.
- In-place only: boxes built once, `updateBoxes/Ring/Status/Resend` mutate text/class/attrs/styles; zero `innerHTML` (grep 0, harness traps setter → 0 writes).
- Demo data verbatim: `482913`, `481973`, `482 913`, `maya@acme.com`.
- Full-loop node identity: boxes/slots same objects across wrong→error→idle→correct→success→idle + resend + theme toggles (harness 403/403 pass).
- Could not verify: real-browser paint (node only per task), `100cqi`/container animation timing, reduced-motion.
