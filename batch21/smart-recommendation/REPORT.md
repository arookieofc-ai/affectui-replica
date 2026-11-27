# Smart recommendation — targeted fix REPORT

## Defect (real-browser QA)
- LIGHT theme only: primary button `Accept incremental sync` painted as dark-grey text on a near-black background — unreadable at normal zoom.
- DARK theme was fine: white background with black text, perfectly clear.

## Root cause
- Checked `./demo-original.js` first: the original is **not** broken. Light primary is a dark gradient (`linear-gradient(#323137, #201e25)`) with `color: #fff !important`; dark primary is a light gradient (`linear-gradient(#f4f4f5, #e4e4e7)`) with `color: #121213 !important`.
- The replica dropped the `!important` on the light rule (`.sr-btn-primary { … color:#fff; }`), while keeping the generic reset `.ui-sr button { margin:0; font:inherit; color:inherit; … }`.
- Specificity: `.ui-sr button` = (0,1,1) beats `.sr-btn-primary` = (0,1,0), so in light theme the button inherited the near-black ink (`#171717`) onto the near-black gradient (`#201e25`) → contrast ≈ 1.09, unreadable.
- Dark theme survived only by accident: `html[data-theme="dark"] .sr-btn-primary` = (0,2,1) beats the reset, so dark kept `color:#121213` on the light gradient (contrast ≈ 14.8). That is why QA saw LIGHT-only breakage.

## Fix (targeted, everything else identical)
- `./index.html`, light rule: `color:#fff;` → `color:#fff !important;` (matches original exactly).
- `./index.html`, dark rule: `color:#121213;` → `color:#121213 !important;` (matches original exactly; computed dark appearance unchanged).
- No other CSS/JS/HTML touched. `/*noflash*/` guard, in-place updates, zero `innerHTML` writes, and verbatim demo data (`Incremental sync` / `Full refresh` / `Skip tonight` + reason copy) all preserved.

## What matches the original now
- Light: dark button (`#323137→#201e25`) + white text → contrast 16.49.
- Dark: light button (`#f4f4f5→#e4e4e7`) + near-black text → contrast 14.76.
- Hover states unchanged (light hover `#3b3a41→#26242b`, dark hover `#ffffff→#ececef`).

## Verification (node only, in-dir)
- `node --check verify-fix.cjs` → OK; `node --check` on extracted inline script → OK.
- `node verify-fix.cjs` (DOM-stub harness, `./index.html` only) → ALL CHECKS PASSED:
  - `/*noflash*/` guard + bg style + `color-scheme` meta present.
  - Zero `innerHTML` in file; runtime `innerHTML` setter writes = 0.
  - Light AND dark VISIBLE primary text = `"Accept incremental sync"`.
  - Contrast light 16.49 (≥7), dark 14.76 (≥7); broken-mode 1.09 documented.
  - Full loop node identity: Accept→Undo reuses the SAME button object; option switches and collapse/expand keep reason/body/signal/actions objects; theme toggle does not rebuild nodes.
  - Demo data verbatim fragments asserted.

## What could not be verified
- Real-browser pixel rendering (no browser here); contrast is computed from the exact hex stops shared with the original, and the cascade fix was proven by specificity + `!important` parity, not screenshots.

## How to test
- Open `./index.html` in a browser, toggle the sun/moon button: light shows a dark `Accept incremental sync` button with white text; dark shows a white button with black text. Click `Alternatives`, `Accept`, `Undo`.
