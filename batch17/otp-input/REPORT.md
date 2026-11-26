# REPORT — OTP Input replica

## What was built
`index.html` (26.5 KB, self-contained, no network, system fonts) replicating the `OTP Input` demo as a clean-room vanilla-JS page.

Layout:
- Top header: `acme · verification`, `0/1 working · 1 agent`, deterministic 3×3 pixel-mark (exactly 9 `<i>` cells) for `acme-verifier`, token context `44k / 200k` with thin 3 px bar, visible sun/moon theme toggle (top-right).
- Center card: mail badge (envelope SVG `rect x=3.5 y=5.5 w=17 h=13 rx=2.5` + `M4.5 7.5l7.5 5.5 7.5-5.5`), `Check your email`, `We sent a code to maya@acme.com`, 6-box OTP with separator after 3, gliding ring + blinking caret, invisible `one-time-code` input (paste/autofill, arrows/Home/End, focus), error message with alert icon, resend countdown/button, polite live region, hint `Demo code: 482 913` (NBSP).
- Success morphs boxes into a `Verified` pill with check `M5.5 12.5l4 4L18.5 8`.

Tokens via CSS custom properties for light + dark; `data-theme` on `<html>`; `/*noflash*/` guard is the first child of `<head>` plus `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` and `<meta name="color-scheme" content="light dark">`. Default is light (original demo appearance); stored `otp-theme` overrides, else `prefers-color-scheme`.

In-place updates only: DOM built once at init (6 `.cell` + sep + ring + pill + input + msg + resend). Timers update `textContent`/attributes/`style` on cached nodes; zero `innerHTML` in page script. User `pointerdown`/`keydown`/`focus` capture cancels the auto demo so real clicks survive. `[hidden]{display:none!important}` present; SVG classes set via `setAttribute`. No broad `svg{display}` rule.

## Matched data / behaviour (verbatim from `demo-original.js`)
- `CORRECT=482913`, `WRONG=481973`, `maya@acme.com`, `Check your email`, `Demo code: 482 913`, `Verification code, 6 digits`, `That code didn't work. Try again.` / `That code didn't work. 2 tries left.` / `... 1 try left.` / `... Request a new code.`, `Verified`, `Verifying code`, `Didn't get a code?`, `Resend in`, `Resend code`, `A new code is on its way`, `You can resend the code now`, tries start `3`, `resendIn 30` formatted `0:30`→`0:00`.
- Timings: type 150 ms/char from 700 ms; verify delay 1000 ms; wrong → error (tries 3→2), shake 420 ms, clearing at +700 ms, clear value at +980 ms, back to idle at 4450 ms; type correct 4450–5200 ms; verify at 5500 ms → success; hold 3200 ms → clear + tries reset. Resend ticks 1000 ms. NFKC + Arabic-Indic digit normalization, numeric-only, length 6, separator at 3, center align.
- Not verified: exact `otp-demo__*` card CSS (original chunk had no card CSS — recreated in same tokens), real SMS autofill on device, pixel-perfect shimmer offsets.

## How to test
Open `index.html` in a browser. Auto demo runs once (wrong → error → correct → verified → reset, then repeats). Type/paste in boxes, press Resend, toggle sun/moon. No server needed.

## Verification (node only, in-dir files)
- `node --check` on extracted main script: PASS.
- `node harness-verify.js` (DOM stub, mocked timers, advances full loop):
  - 6 boxes, pixel-mark exactly 9 cells, initial idle empty
  - wrong typed `481973`, error shows exact `That code didn't work. 2 tries left.` as VISIBLE text
  - auto-clear to empty, verifying live `Verifying code`, success pill `Verified` VISIBLE (not just aria), reset idle + tries 3 after ~3200 ms
  - resend shows `Resend in 0:29…0:20`
  - node identity preserved across full loop, zero `innerHTML` writes after init
  - light AND dark themes verified (`#ffffff/#fafaf9` + `#1c1c1f/#101012`, amber dark variant)
  - ALL HARNESS CHECKS PASSED
