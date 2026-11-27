# TARGETED FIX — Emails initial-state contradiction (settings-privacy)

## Defect (real-browser QA)
Emails section loaded showing BOTH a green `Subscribed` badge AND a `Subscribe` button — same state painted two opposite ways, in both light and dark. Clicking Subscribe flipped to `Unsubscribe` + toast `Subscribed to product updates`, proving initial paint inconsistent.

## Root cause
`./demo-original.js` initial state is `updates:!1` (= `false` = not subscribed). Original renders:
- `updates=true` => badge `Subscribed` + button `Unsubscribe`
- `updates=false` => NO badge + button `Subscribe`

Replica JS matched this (`privacy.updates=false`, `paintEmail()` toggles `hidden` + `textContent` correctly). But CSS broke it:
```css
.badge{ display:inline-flex; ... }
```
with NO `[hidden]` rule. Real browsers: author `display:inline-flex` overrides UA `[hidden]{display:none}`, so `<span class="badge" id="emailBadge" hidden>Subscribed</span>` stayed VISIBLE alongside `Subscribe`. Hence contradiction in both themes.

Checked `./demo-original.js` first: it does NOT behave this way (it conditionally renders badge only when subscribed), so fix is warranted — not noting as-is.

## Fix (1 line, in-place, targeted)
In `./index.html`, before `.badge{`, added:
```css
[hidden]{display:none!important}
```
- Keeps `/*noflash*/` guard untouched (line 4 still first in `<head>`).
- In-place updates only: `paintEmail()` still only toggles `hidden` attr + `textContent`, no `innerHTML` (verified zero `innerHTML`/`outerHTML`/`insertAdjacentHTML` in file).
- Demo data verbatim: `diff` shows only the 1 CSS line added, no JS/data changes.
- Also fixes other `hidden` users (`cookiesPanel`, `sharedEmpty`, etc.) same root cause, no side effects.

Diff:
```
--- ./original-backup.html
+++ ./index.html
@@ -168,6 +168,7 @@
+[hidden]{display:none!important}
 .badge{
```

## Proof — md5 BEFORE/AFTER (must differ)
```
7585930fb389a0b460f3fc381f9bef5b  ./original-backup.html  (BEFORE = original)
cb54d64cab15e22b09f25eeb3af8b634  ./index.html  (AFTER = fixed)
```
Verified via `md5sum ./index.html ./original-backup.html` in-dir. Hashes differ.

## Proof — harness FAIL on original, PASS on fixed
Harness: `./harness.cjs` (node only, in-dir DOM-stub). Computes VISIBLE state as real browser does: `visible = !(has hidden attr && css has [hidden]{display:none})`. Asserts visible initial (light+dark), toggle both ways, full-loop node identity, zero innerHTML, noflash.

### ORIGINAL (`node ./harness.cjs ./original-backup.html` → exit 1 FAIL)
```
Harness target: ./original-backup.html
  OK: noflash guard present
  OK: color-scheme meta present
  css [hidden]{display:none} rule: false
  OK: badge uses display:inline-flex (bug precondition documented)
  OK: zero innerHTML writes in inline scripts
  OK: zero outerHTML writes
  OK: zero insertAdjacentHTML
  OK: demo-original initial updates=false (not subscribed)
  OK: demo has Subscribed badge + Subscribe/Unsubscribe buttons
  initial badge tag: <span class="badge" id="emailBadge" hidden>
  initial btn text: 'Subscribe'
  OK: initial badge carries hidden attribute
  OK: initial button text is Subscribe (got 'Subscribe')
  OK: replica privacy.updates initial false
  OK: paintEmail extracted from file (in-place updates only)
  OK: paintEmail toggles hidden attr in place
  OK: paintEmail updates button text in place
  OK: paintEmail uses zero innerHTML
  after initial paint: hidden=true btn='Subscribe' visible=true
  FAIL: [light] badge NOT visible when not subscribed (initial consistent)
  OK: [light] button Subscribe when not subscribed
  OK: dark theme rule present
  FAIL: [dark] badge NOT visible when not subscribed (initial consistent)
  OK: [dark] button Subscribe when not subscribed
  after subscribe: hidden=false btn='Unsubscribe' visible=true
  OK: badge VISIBLE when subscribed
  OK: button Unsubscribe when subscribed
  OK: toast 'Subscribed to product updates' present
  OK: [light+dark] subscribed visible consistent
  after unsubscribe: hidden=true btn='Subscribe' visible=true
  FAIL: badge hidden again after Unsubscribe
  OK: button back to Subscribe after full loop
  OK: toast 'Unsubscribed' present
  OK: node identity: emailBtn same object across full loop
  OK: node identity: emailBadge same object across full loop
  OK: node identity: emailNote same object across full loop
  OK: zero innerHTML writes after init (stub counter=0)
RESULT FAIL (3 failures)
```

### FIXED (`node ./harness.cjs ./index.html` → exit 0 PASS)
```
Harness target: ./index.html
  OK: noflash guard present
  OK: color-scheme meta present
  css [hidden]{display:none} rule: true
  OK: badge uses display:inline-flex (bug precondition documented)
  OK: zero innerHTML writes in inline scripts
  OK: zero outerHTML writes
  OK: zero insertAdjacentHTML
  OK: demo-original initial updates=false (not subscribed)
  OK: demo has Subscribed badge + Subscribe/Unsubscribe buttons
  initial badge tag: <span class="badge" id="emailBadge" hidden>
  initial btn text: 'Subscribe'
  OK: initial badge carries hidden attribute
  OK: initial button text is Subscribe (got 'Subscribe')
  OK: replica privacy.updates initial false
  OK: paintEmail extracted from file (in-place updates only)
  OK: paintEmail toggles hidden attr in place
  OK: paintEmail updates button text in place
  OK: paintEmail uses zero innerHTML
  after initial paint: hidden=true btn='Subscribe' visible=false
  OK: [light] badge NOT visible when not subscribed (initial consistent)
  OK: [light] button Subscribe when not subscribed
  OK: dark theme rule present
  OK: [dark] badge NOT visible when not subscribed (initial consistent)
  OK: [dark] button Subscribe when not subscribed
  after subscribe: hidden=false btn='Unsubscribe' visible=true
  OK: badge VISIBLE when subscribed
  OK: button Unsubscribe when subscribed
  OK: toast 'Subscribed to product updates' present
  OK: [light+dark] subscribed visible consistent
  after unsubscribe: hidden=true btn='Subscribe' visible=false
  OK: badge hidden again after Unsubscribe
  OK: button back to Subscribe after full loop
  OK: toast 'Unsubscribed' present
  OK: node identity: emailBtn same object across full loop
  OK: node identity: emailBadge same object across full loop
  OK: node identity: emailNote same object across full loop
  OK: zero innerHTML writes after init (stub counter=0)
RESULT PASS
```

## Verification (node only, no installs)
- `node --check ./harness.cjs` → syntax OK
- inline scripts syntax via `vm.Script` → `script[0] syntax OK`, `script[1] syntax OK`
- Light AND dark: harness asserts badge hidden + Subscribe in both themes; dark rule `html[data-theme="dark"]` present; toggle verified both ways.
- Node identity across full subscribe→unsubscribe loop: same objects.
- Zero innerHTML writes after init: static grep + stub counter 0.

## What matches / could not verify
- Matches original: initial not-subscribed (no badge + Subscribe), subscribed (badge + Unsubscribe), toasts, demo data verbatim.
- Could not verify in real browser (node stub only emulates CSS `display` override), but rule `[hidden]{display:none!important}` is standard fix for this exact override. Open `./index.html` in browser to confirm: Emails shows only Subscribe initially, no badge, in light/dark; click toggles both ways.
