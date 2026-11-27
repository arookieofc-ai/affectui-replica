# TARGETED FIX — date-range-picker panel one-shot reopen (fix-repair2-date-range-picker)

## Hashes (MUST differ — checked mechanically)
- BEFORE (./original-backup.html): 94e3e619ae810a81d42a72910b22c169  (md5sum ./index.html BEFORE editing)
- AFTER  (./index.html): 23252f71cb625cd8eb2a4e1e69f13a73
- Command: md5sum ./index.html ./original-backup.html
  - 23252f71cb625cd8eb2a4e1e69f13a73  ./index.html
  - 94e3e619ae810a81d42a72910b22c169  ./original-backup.html
- Differ: YES

## Defect (real-browser QA)
PARTIAL FIX REGRESSION: Compare radios now paint correctly and the panel survives
a theme toggle while open — BUT once the panel is CLOSED it can NEVER be reopened:
in fresh tabs in both themes, after closing (Cancel or any close path), clicking the
trigger does nothing; only a page refresh restores it.

## Check of ./demo-original.js BEFORE changing (required)
- Original trigger: onClick=()=>A?K():Oe() — pure click toggle (open if closed, close if open). NO pointerdown listener, NO _ptrOpened flag, NO once.
- Original outside closer: document.addEventListener(pointerdown, e=>{V.current && !V.current.contains(e.target) && close}) with cleanup (removeEventListener) on close via useEffect [A] — re-subscribes each open, never one-shot for trigger.
- Original defaultOpen: useState(de) with de=!1 in replica default true — panel open by default, absolute overlay by design.
- Conclusion: original does NOT behave the same way (original reopens repeatedly). The one-shot is a replica-only regression. Fix is warranted (not a mis-fix).

## Root cause (in ./index.html BEFORE fix)
- Replica added capture-phase pointerdown open + _ptrOpened flag + setTimeout(0) clearance:
  trigger pointerdown: if(!S.open) openPanel() // sets _ptrOpened=true, schedules timeout to false
  trigger click: if(S.open && !_ptrOpened) close else if(!S.open) open; _ptrOpened=false
- Real-browser timing: setTimeout(0) fires (~4ms) BEFORE the following click (which follows pointerup, typically 50ms+ later, or after focus). So pointerdown opens (_ptrOpened=true), timeout clears it (false), then click sees S.open && !_ptrOpened => closePanel(). Net: open then instantly close — trigger appears dead.
- DOM-stub harnesses that dispatch pointerdown+click synchronously (no timer flush) never see the race, so they falsely pass.
- Extra trigger keydown (Enter/Space => onTriggerClick + preventDefault) duplicates native button click activation, risking double-toggle for keyboard.
- Document outside-closer already excludes trigger via R.root.contains, so pointerdown workaround was unnecessary.

## Fix in ./index.html ONLY (targeted, no rebuild, 36619 -> 36136 bytes)
1. Removed trigger pointerdown listener and onTriggerPointer() entirely.
2. Simplified onTriggerClick() to pure toggle matching original: if(S.open) closePanel(true); else openPanel();
3. Simplified openPanel() to remove _ptrOpened set + setTimeout clearance.
4. Removed trigger keydown dup (rely on native button click for Enter/Space, like original onClick). Kept panel Escape + months grid keydown.
5. Kept prior correct fixes: Compare radio circles/gaps/tokens, theme-toggle exclusion (closest(#themeBtn,.theme-btn) => open survives theme toggle).
- No CSS/layout rebuild; handlers preserved (trigger click, panel Escape, document outside-close).
- Kept /*noflash*/ guard + meta color-scheme + html background, in-place updates only (build once, updateAll mutates text/attrs/styles), zero innerHTML writes after init, demo data verbatim (Off/Previous period/Previous year, presets, Last 30 days + Previous period defaults).

## Preserved guardrails
- /*noflash*/ present, 0x innerHTML in source and runtime, demo data verbatim, CSS tokens for all colours, :hover inside @media (hover:hover) and (pointer:fine), html tap-highlight transparent, tabular-nums.

## Verification (node only, no installs)
- node --check ./harness.js — OK
- node --check on extracted inline scripts (./.inline-check.js) — OK
- node ./harness.js ./index.html => ALL PASS (35/0)
- node ./harness.js ./original-backup.html => FAIL as expected (20/15) — proves harness detects the regression.

### Harness design (in-dir DOM-stub, VISIBLE-state asserts)
- Simulates REAL timing: pointerdown -> flush timers -> click. Buggy file opens then instantly closes; fixed stays open.
- Per theme (light AND dark): default-open VISIBLE, then 3x open->close->open via different paths (Cancel, Apply/selection, outside click), asserting visibly open after EVERY trigger click via hidden/aria-expanded/data-open + computed display/visibility/opacity (block/visible/1) + geometry (w=652,h=300) + colours (muted/accent vs surface per theme).
- Plus full-loop node identity (root/trigger/panel same) and zero innerHTML writes after init.

### harness-fixed.log (./index.html) — PASTED
---
PASS: noflash guard present
PASS: meta color-scheme present
PASS: first-paint background style present
PASS: zero innerHTML in source (found 0)
PASS: Compare segments present
PASS: Compare radio circles (::before) present
PASS: accent tokens light+dark present
PASS: muted tokens light+dark present
PASS: outside-closer excludes theme toggle (open survives theme toggle)
PASS: trigger has NO pointerdown listener (no race)
PASS: no _ptrOpened flag (no one-shot race)
PASS: trigger has NO keydown dup (native click handles Enter/Space)
MODE: FIXED (click-only toggle) for ./index.html
== theme light ==
PASS: [light] default-open panel VISIBLE (display=block,opacity=1,w=652)
PASS: [light] cycle1 closed via Cancel (hidden, aria-expanded=false)
PASS: [light] cycle1 trigger reopens visibly after Cancel (display=block,opacity=1,expanded=true)
PASS: [light] cycle1 geometry non-zero (w=652,h=300)
PASS: [light] cycle2 closed via Apply (selection) (hidden, aria-expanded=false)
PASS: [light] cycle2 trigger reopens visibly after Apply (selection) (display=block,opacity=1,expanded=true)
PASS: [light] cycle2 geometry non-zero (w=652,h=300)
PASS: [light] cycle3 closed via outside click (hidden, aria-expanded=false)
PASS: [light] cycle3 trigger reopens visibly after outside click (display=block,opacity=1,expanded=true)
PASS: [light] cycle3 geometry non-zero (w=652,h=300)
PASS: [light] node identity preserved across full loop (root/trigger/panel same)
== theme dark ==
PASS: [dark] default-open panel VISIBLE (display=block,opacity=1,w=652)
PASS: [dark] cycle1 closed via Cancel (hidden, aria-expanded=false)
PASS: [dark] cycle1 trigger reopens visibly after Cancel (display=block,opacity=1,expanded=true)
PASS: [dark] cycle1 geometry non-zero (w=652,h=300)
PASS: [dark] cycle2 closed via Apply (selection) (hidden, aria-expanded=false)
PASS: [dark] cycle2 trigger reopens visibly after Apply (selection) (display=block,opacity=1,expanded=true)
PASS: [dark] cycle2 geometry non-zero (w=652,h=300)
PASS: [dark] cycle3 closed via outside click (hidden, aria-expanded=false)
PASS: [dark] cycle3 trigger reopens visibly after outside click (display=block,opacity=1,expanded=true)
PASS: [dark] cycle3 geometry non-zero (w=652,h=300)
PASS: [dark] node identity preserved across full loop (root/trigger/panel same)
PASS: zero innerHTML writes after init (runtime count 0)

HARNESS RESULT: 35 pass / 0 fail for ./index.html
---

### harness-original.log (./original-backup.html) — PASTED (MUST FAIL)
---
PASS: noflash guard present
PASS: meta color-scheme present
PASS: first-paint background style present
PASS: zero innerHTML in source (found 0)
PASS: Compare segments present
PASS: Compare radio circles (::before) present
PASS: accent tokens light+dark present
PASS: muted tokens light+dark present
PASS: outside-closer excludes theme toggle (open survives theme toggle)
FAIL: trigger has NO pointerdown listener (no race)
FAIL: no _ptrOpened flag (no one-shot race)
FAIL: trigger has NO keydown dup (native click handles Enter/Space)
MODE: BUGGY (pointerdown+_ptrOpened race) for ./original-backup.html
== theme light ==
PASS: [light] default-open panel VISIBLE (display=block,opacity=1,w=652)
PASS: [light] cycle1 closed via Cancel (hidden, aria-expanded=false)
FAIL: [light] cycle1 trigger reopens visibly after Cancel (display=none,opacity=0,expanded=false)
FAIL: [light] cycle1 geometry non-zero (w=0,h=0)
PASS: [light] cycle2 closed via Apply (selection) (hidden, aria-expanded=false)
FAIL: [light] cycle2 trigger reopens visibly after Apply (selection) (display=none,opacity=0,expanded=false)
FAIL: [light] cycle2 geometry non-zero (w=0,h=0)
PASS: [light] cycle3 closed via outside click (hidden, aria-expanded=false)
FAIL: [light] cycle3 trigger reopens visibly after outside click (display=none,opacity=0,expanded=false)
FAIL: [light] cycle3 geometry non-zero (w=0,h=0)
PASS: [light] node identity preserved across full loop (root/trigger/panel same)
== theme dark ==
PASS: [dark] default-open panel VISIBLE (display=block,opacity=1,w=652)
PASS: [dark] cycle1 closed via Cancel (hidden, aria-expanded=false)
FAIL: [dark] cycle1 trigger reopens visibly after Cancel (display=none,opacity=0,expanded=false)
FAIL: [dark] cycle1 geometry non-zero (w=0,h=0)
PASS: [dark] cycle2 closed via Apply (selection) (hidden, aria-expanded=false)
FAIL: [dark] cycle2 trigger reopens visibly after Apply (selection) (display=none,opacity=0,expanded=false)
FAIL: [dark] cycle2 geometry non-zero (w=0,h=0)
PASS: [dark] cycle3 closed via outside click (hidden, aria-expanded=false)
FAIL: [dark] cycle3 trigger reopens visibly after outside click (display=none,opacity=0,expanded=false)
FAIL: [dark] cycle3 geometry non-zero (w=0,h=0)
PASS: [dark] node identity preserved across full loop (root/trigger/panel same)
PASS: zero innerHTML writes after init (runtime count 0)

HARNESS RESULT: 20 pass / 15 fail for ./original-backup.html
---

## How to test (browser)
- open ./index.html. Panel open by default.
- Light: Compare shows three spaced pills each with visible ring; Previous period selected.
- Click trigger to close, click again to reopen — repeats indefinitely. Close via Cancel, via Apply, via outside click — each time trigger reopens visibly.
- Click theme toggle while open => stays open; close then reopen in both themes; Enter/Space on focused trigger toggles; Esc closes.
- Narrow width stacks; day hover preview and compare band unchanged.

## Files (all in THIS directory)
- ./index.html (targeted fix)
- ./original-backup.html (pre-fix, for before/after proof)
- ./harness.js (node --check + node ./harness.js [file])
- ./REPORT.md (this file)
