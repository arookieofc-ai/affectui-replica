# OTP Input — fix report

## What built
Standalone `index.html` replica of the OTP demo (`demo-original.js`):
card “Check your email”, `maya@acme.com`, 6 boxes with separator after 3,
auto demo loop wrong `481973` → error → correct `482913` → `Verified`,
resend countdown from 30, theme toggle `data-theme="light"|"dark"`.
Matches original: error only turns borders red (`data-error`), message
grows below (`data-show`), success morphs boxes into pill, resend hidden
during success, timers update in place.

## How to test
Open `index.html` in a browser. Auto loop runs. Or `node` only:
`node --check ./harness.js && node --check ./extracted-main.js && node ./harness.js`
Checked light AND dark via stub (both pass).

## Defects — root cause + fix (checked against ./demo-original.js)

### (1) LIGHT: wrong code 481973 marks invalid but nothing paints
Original (`demo-original.js`): `X=m==="error"&&k`, CSS
`.ui-otp[data-error] .ui-otp__box{box-shadow:inset…var(--ui-otp-danger-line)}`,
`.ui-otp__msg[data-show]{grid-template-rows:1fr}`, text
`That code didn't work. ${e} ${try/tries} left.` — same in both themes,
no theme-scoped hiding. Alert icon uses `stroke:var(--ui-otp-danger)`.
Replica DOM was correct (`data-error`, `data-show`, text, `aria-invalid`)
in both themes (harness proves), but two icon deviations hid the red:
- `.alertico` had no color, JS set path `stroke="currentColor"` → inherited
  `--text` (grey) instead of red.
- `.check` path hardcoded `stroke="#1e8a4f"` (light green, low contrast in dark);
  original uses `var(--ui-otp-success)` per-theme.
Fix (targeted, everything else identical):
- `.alertico{…;color:var(--danger)}` — `currentColor` now resolves to red
  in light (`#dc2626`) and dark (`#ff6b5f`).
- `.check{…;color:var(--success)}` + path `stroke="currentColor"`
  (was `#1e8a4f`) — light `#1e8a4f`, dark `#5fc88a`, matches original.

### (2) DARK: Resend makes 6 inputs vanish, never return
Original: `ve=()=>{v?.(),le(S),P("A new code is on its way")}` — only resets
tries (`()=>s(3)`) and countdown (`le(S)`, S=30), never touches value/status.
Resend hidden during success: `"data-hidden":m==="success"`,
CSS `.ui-otp__resend[data-hidden]{opacity:0;visibility:hidden}` so it cannot
be clicked while boxes are intentionally hidden (`[data-status="success"]
.ui-otp__box{opacity:0}`).
Replica `onResend` already preserved status/value and restarted `tickResend`
(harness: resend→30, tries→3, boxes stay in DOM, countdown ticks in dark),
but was missing the `[data-hidden]` CSS, so resend stayed visible during
`Verified` and a click during success would leave `status==="success"`
(cells `opacity:0`) with no return until auto-reset — the reported vanish.
Fix: added missing rule matching original:
`.resend[data-hidden]{opacity:0;visibility:hidden;transition:opacity 220ms ease,visibility 0s 220ms}`.
`updateResend` already sets/removes `data-hidden`; no JS change needed.
Note: success intentionally hides boxes (opacity 0 + pill) in both themes
per original — not a bug.

### (3) Theme toggle resets demo state (Verified → wrong-code)
Original has no theme toggle; replica addition must not touch state.
`setTheme` only sets `documentElement[data-theme]`, `localStorage otp-theme`,
icon — verified no `render`/`clearAuto`/`runCycle`/state writes, and
`themeBtn` is outside `demoRoot` so `cancelAuto` capture never fires.
Harness: snapshot Verified (`482913`/`success`/3), click toggle twice,
state + box identity unchanged in both directions.
No fix needed; kept as-is to avoid rebuild.

## Invariants kept
- `/*noflash*/` guard + `<meta name=color-scheme>` + `html{background}` first paint intact.
- In-place only: boxes built once, `updateBoxes/Ring/Status/Resend` mutate text/class/attrs/styles; zero `innerHTML` (grep 0, harness traps setter → 0 writes).
- Demo data verbatim: `482913`, `481973`, `482 913`, `maya@acme.com`.
- Full-loop node identity: boxes/slots same objects across wrong→error→idle→correct→success→idle + resend + theme toggles (harness 46/46 pass).
- Could not verify: real-browser paint (node only per task), `100cqi`/container animation timing, reduced-motion.
