# Fix report — Settings Profile / Local time timezone

## Defect
`Local time` preview ignored the timezone dropdown: `tickClock()` used `Date.getHours()/getMinutes()/getSeconds()/getDay()` (device-local zone) and never read `tzSel`. Switching `America/New_York` -> `Europe/London` only repainted the dirty bar; the clock kept showing device-local time.

## Fix (targeted, in-place, `index.html` only)
- Added `tzName()` parsing IANA zone from `tzSel.value` (`split(" ")[0]`, fallback `UTC`).
- Rewrote `tickClock(d)` to format **in the selected zone** via `Intl.DateTimeFormat` with `timeZone`:
  - 12h: `hour:numeric, minute:2-digit, second:2-digit, hour12:true` -> `h:mm:ss AM/PM`
  - 24h: `hour:2-digit, minute:2-digit, second:2-digit, hour12:false` -> `HH:mm:ss` (`24`->`00` midnight fix)
  - date: `weekday:short, month:short, day:2-digit` -> `Thu Jan 15`
  - `try/catch` falls back to original local-time code if `Intl` throws.
- Immediate update: added `tzS.addEventListener("change", function(){tickClock()});` (existing `paintDirty` listener kept).
- Kept: `/*noflash*/` guard untouched, 1s `setInterval(tickClock,1000)` untouched, in-place `textContent` updates only, zero `innerHTML` writes, demo timezone option list verbatim.

## Original behaviour check (`./demo-original.js`)
`./demo-original.js` is a 289-byte stub importing `jsx-runtime`, `DemoStage`, `index-*`, `component-*` with no clock/timezone logic. No original clock behaviour is observable from it, so there was nothing to preserve — noted here instead of “fixing” the stub.

## Proof — hashes differ
```
BEFORE: 8394fbd874a44479ccc224e645b4e64b  ./index.html
AFTER:  7df631ce08c76aa98dcebeae0e3efeaf  ./index.html
```
- BEFORE captured via `md5sum ./index.html` before edit, backup kept as `./original-backup.html` (`8394fbd874a44479ccc224e645b4e64b`).
- AFTER via `md5sum ./index.html` after edit (`7df631ce08c76aa98dcebeae0e3efeaf`). Hashes MUST differ — they do.

## Proof — harness FAILs on original, PASSes on fixed
Harness: `./harness-clock.cjs` (node only, in-dir DOM stub). Asserts VISIBLE `clockTime`/`clockDate` text for NY vs London on a fixed instant, 12h + 24h, DST summer date, immediate visible change on `change` event, same visible state in light AND dark, full-loop node identity, zero `innerHTML` writes after init, 1s ticker, `/*noflash*/` present. Verified with `node --check` plus stub runs.

### BEFORE (`node ./harness-clock.cjs ./original-backup.html`, exit 1 — FAIL as required)
```
Harness target: ./original-backup.html
  PASS: noflash guard present
  PASS: script init ok, __profile exposed
  INFO 12h NY="8:00:00 PM Thu Jan 15" London="8:00:00 PM Thu Jan 15"
  INFO expected NY="7:00:00 AM Thu Jan 15" London="12:00:00 PM Thu Jan 15"
  FAIL: NY vs London differ in 12h (both show 8:00:00 PM)
  FAIL: NY matches Intl reference: got 8:00:00 PM want 7:00:00 AM
  FAIL: London matches Intl reference: got 8:00:00 PM want 12:00:00 PM
  PASS: NY date matches Intl
  INFO summer NY="8:00:00 PM" London="8:00:00 PM"
  FAIL: summer DST differ (both 8:00:00 PM)
  INFO 24h NY="20:00:00" (want 07:00:00) London="20:00:00" (want 12:00:00")
  FAIL: 24h differ (both 20:00:00)
  FAIL: 24h match Intl: got NY=20:00:00 want 07:00:00; Lon=20:00:00 want 12:00:00
  INFO change-event before="8:00:00 PM" after="8:00:00 PM" (direct tickClock call, not via __profile.tick wrapper)
  PASS: immediate update on tz change (handler ticked via closure)
  FAIL: visible change on switch (still 8:00:00 PM)
  INFO light="8:00:00 PM|Thu Jan 15" dark="8:00:00 PM|Thu Jan 15" theme=dark
  PASS: dark theme applied
  PASS: light/dark same visible clock
  PASS: node identity across themes
  PASS: node identity full loop
  INFO innerHTMLWritesAfterInit=0
  PASS: zero innerHTML
  PASS: 1s ticker
RESULT: FAIL (./original-backup.html) — 7 failure(s):
  - NY vs London times differ (12h): got NY=8:00:00 PM Lon=8:00:00 PM
  - NY time matches Intl reference: got 8:00:00 PM want 7:00:00 AM
  - London time matches Intl reference: got 8:00:00 PM want 12:00:00 PM
  - NY vs London differ in summer (DST)
  - 24h NY vs London differ
  - 24h match Intl
  - visible time changes immediately on tz switch
```

### AFTER (`node ./harness-clock.cjs ./index.html`, exit 0 — PASS)
```
Harness target: ./index.html
  PASS: noflash guard present
  PASS: script init ok, __profile exposed
  INFO 12h NY="7:00:00 AM Thu Jan 15" London="12:00:00 PM Thu Jan 15"
  INFO expected NY="7:00:00 AM Thu Jan 15" London="12:00:00 PM Thu Jan 15"
  PASS: NY vs London differ in 12h
  PASS: NY matches Intl reference
  PASS: London matches Intl reference
  PASS: NY date matches Intl
  INFO summer NY="8:00:00 AM" London="1:00:00 PM"
  PASS: summer DST differ
  INFO 24h NY="07:00:00" (want 07:00:00) London="12:00:00" (want 12:00:00")
  PASS: 24h differ
  PASS: 24h match Intl
  INFO change-event before="7:00:00 AM" after="12:00:00 PM" (direct tickClock call, not via __profile.tick wrapper)
  PASS: immediate update on tz change (handler ticked via closure)
  PASS: visible change on switch
  INFO light="7:00:00 AM|Thu Jan 15" dark="7:00:00 AM|Thu Jan 15" theme=dark
  PASS: dark theme applied
  PASS: light/dark same visible clock
  PASS: node identity across themes
  PASS: node identity full loop
  INFO innerHTMLWritesAfterInit=0
  PASS: zero innerHTML
  PASS: 1s ticker
RESULT: PASS (./index.html)
```

## Verification checklist
- `node --check ./demo-original.js` OK, `node --check ./harness-clock.cjs` OK (node only, no installs).
- `grep -c innerHTML ./index.html` = 0; runtime `innerHTMLWritesAfterInit=0` in both runs.
- `/*noflash*/` present in both (grep 1 each).
- Timezone `<select id="tzSel">` options byte-identical before/after (SAME).
- Light AND dark: harness sets `setTheme("light")` / `setTheme("dark")` and asserts identical VISIBLE clock (`7:00:00 AM|Thu Jan 15`) plus node identity across switch.
- Node identity: same `clockTime`/`clockDate` objects across 10+ ticks, format switches, theme switches.
- Ticker: `setInterval(tickClock,1000)` still registered.
- No files touched outside this directory; no `rm /tmp`; harness + REPORT written here.

## How to test manually
1. Open `./index.html` in a browser.
2. In Time section, note `Local time` with `America/New_York` selected, toggle `12-hour`/`24-hour`.
3. Switch dropdown to `Europe/London` — clock updates immediately (~5h ahead in winter, 5h in summer) without waiting a second.
4. Click sun/moon toggle — clock value stays correct in both themes.
