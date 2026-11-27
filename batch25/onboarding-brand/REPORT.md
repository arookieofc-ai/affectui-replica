# Targeted fix — onboarding-brand: chip preview sync + Continue button paint

## Proof hashes (must differ)
- BEFORE: `62beac14ecdce384ee2a478a450efff1  ./index.html` (kept as `./original-backup.html`)
- AFTER:  `3664f06b613c24027973f5304b49f39f  ./index.html`
- Verified with `md5sum ./index.html` before editing and after editing. They differ (targeted edit, not rewrite).

## Original behaviour check (`./demo-original.js`, relative read)
Read `./demo-original.js` before changing:
- `brand P = E[0] ?? N`, `aliases = E.slice(1)`, `preview:(u,{brand:P,aliases:E.slice(1),...})` — preview reflects remaining names on every add/remove.
- `autoType:"Northwind Co."` typed then committed via `D(...)` (chips state), `onRemove:D(t=>t.filter(...))` — chip remove updates state.
- Continue button in code is `aria-label:"Continue"` + icon, but QA real-browser defect says full button (text + arrow) must paint per original screenshot. Replica had circle-only icon, text never painted.
- Conclusion: defect (1) IS applicable (replica desyncs vs original which syncs); defect (2) IS applicable (replica clips/hides Continue text). Did NOT skip as non-applicable.

## What was fixed in `./index.html` (in place, no rebuild)
1. **Preview sync + empty heading (defect 1):**
   - Added `id="aliasRow"` to `<div class="alias-row">Also answers to`.
   - JS: added `aliasRow=$("aliasRow")` and in `syncPreview()` (called by `syncAll()` on every add/remove/commit/Backspace/submit/draft):
     `if(aliasRow){var wantDisp=aliases.length?"":"none";if(aliasRow.style.display!==wantDisp)aliasRow.style.display=wantDisp}`
     placed outside the `data-k` gate so heading never left EMPTY visible. Brand (`pvBrand`/`pvBrandInline`/`pvAvatar`), meta/domain, alias pills (`pvAliases` in-place diff, no innerHTML), status counter all update in place.
2. **Continue button paints text+arrow (defect 2):**
   - HTML: `<button id="goBtn">` now `<span id="goBtnLabel">Continue</span><svg arrow>` (was SVG-only circle).
   - CSS: `.ui-obw-btn--go{width:auto;height:38px;padding:0 14px 0 16px;gap:8px;font-size:14px;font-weight:600;background:var(--ink);border-color:var(--ink);color:var(--page)}` + `.ui-obw-btn--go svg{margin-left:0}`. Was `width:38px;height:38px;padding:0` circle clipping any text. Now pill, optical padding (icon side 2px less), inverted tokens so fg!=bg in both themes (light `--ink:#1c1917` on `--page:#fafaf9`, dark `--ink:#ededed` on `--page:#101012`).
- Preserved: `/*noflash*/` guard first in `<head>`, in-place updates only, zero `innerHTML` writes, demo data verbatim (`northwind.com`, `Northwind Co.`, `alex@northwind.com`, `Lumen`).

## How to test (node only, no installs)
- `node --check ./harness.js` — syntax
- `node ./harness.js ./original-backup.html` — must FAIL
- `node ./harness.js ./index.html` — must PASS
- Open `./index.html` in browser, toggle sun/moon, add/remove chips.

## Light AND dark
Checked both via harness theme loop (`data-theme="light"|"dark"`): preview brand/aliases/heading/counter + Continue label assert as VISIBLE state in both; tokens differ; no grey-on-grey.

## Harness results pasted

### BEFORE (`node ./harness.js ./original-backup.html` → FAIL, exit 1)
```
PASS: noflash guard kept
PASS: zero innerHTML writes (static)
FAIL: aliasRow id exists (heading can hide, no empty heading)
FAIL: goBtn has visible Continue label span
PASS: go CSS rule exists
FAIL: go button width:auto (not clipped circle) so Continue text paints
PASS: go button uses inverted tokens (fg!=bg)
FAIL: Continue text paints in DOM as visible text
PASS: demo data verbatim: northwind.com
PASS: demo data verbatim: Northwind Co.
PASS: demo data verbatim: alex@northwind.com
PASS: ink token differs light/dark (#1c1917 vs #ededed)
PASS: page tokens present both themes
PASS: two scripts present
PASS: main script extracted
PASS: window.__obw exposed
PASS: [light] initial chips ["Northwind"] (got ["Northwind"])
PASS: [light] initial preview brand Northwind
PASS: [light] initial bubble inline Northwind
FAIL: [light] initial aliasRow hidden (no empty heading) (got MISSING-ID)
PASS: [light] initial aliases empty
PASS: [light] initial counter 1 company name (got "1 company name · add a short form")
FAIL: [light] Continue label paints
PASS: [light] Continue enabled with names
PASS: [dark] initial chips ["Northwind"] (got ["Northwind"])
PASS: [dark] initial preview brand Northwind
PASS: [dark] initial bubble inline Northwind
FAIL: [dark] initial aliasRow hidden (no empty heading) (got MISSING-ID)
PASS: [dark] initial aliases empty
PASS: [dark] initial counter 1 company name (got "1 company name · add a short form")
FAIL: [dark] Continue label paints
PASS: [dark] Continue enabled with names
PASS: after add chips [Northwind, Northwind Co.]
PASS: after add preview brand stays Northwind (primary)
PASS: after add alias pill Northwind Co. paints
FAIL: after add aliasRow visible (heading + pill)
PASS: after add counter Knows 2 names
PASS: after delete chips ["Northwind"]
PASS: after delete preview brand Northwind
PASS: after delete bubble inline Northwind
PASS: after delete meta still northwind.com
PASS: after delete alias pills cleared (got 0)
FAIL: after delete aliasRow hidden (no EMPTY heading left) (got MISSING-ID)
PASS: after delete counter 1 company name (got "1 company name · add a short form")
PASS: [light] post-delete brand still Northwind
FAIL: [light] post-delete aliasRow hidden
FAIL: [light] post-delete Continue still paints
PASS: [dark] post-delete brand still Northwind
FAIL: [dark] post-delete aliasRow hidden
FAIL: [dark] post-delete Continue still paints
PASS: node identity pvBrand stable across full loop
PASS: node identity pvAliases stable
PASS: node identity chips stable
PASS: node identity hint stable
PASS: node identity input stable
PASS: zero innerHTML writes after init (got 0)
TARGET: ./original-backup.html THEME CHECKED: light+dark FAILURES: 14
HARNESS RESULT: FAIL
```

### AFTER (`node ./harness.js ./index.html` → PASS, exit 0)
```
PASS: noflash guard kept
PASS: zero innerHTML writes (static)
PASS: aliasRow id exists (heading can hide, no empty heading)
PASS: goBtn has visible Continue label span
PASS: go CSS rule exists
PASS: go button width:auto (not clipped circle) so Continue text paints
PASS: go button uses inverted tokens (fg!=bg)
PASS: Continue text paints in DOM as visible text
PASS: demo data verbatim: northwind.com
PASS: demo data verbatim: Northwind Co.
PASS: demo data verbatim: alex@northwind.com
PASS: ink token differs light/dark (#1c1917 vs #ededed)
PASS: page tokens present both themes
PASS: two scripts present
PASS: main script extracted
PASS: window.__obw exposed
PASS: [light] initial chips ["Northwind"] (got ["Northwind"])
PASS: [light] initial preview brand Northwind
PASS: [light] initial bubble inline Northwind
PASS: [light] initial aliasRow hidden (no empty heading) (got hidden)
PASS: [light] initial aliases empty
PASS: [light] initial counter 1 company name (got "1 company name · add a short form")
PASS: [light] Continue label paints
PASS: [light] Continue enabled with names
PASS: [dark] initial chips ["Northwind"] (got ["Northwind"])
PASS: [dark] initial preview brand Northwind
PASS: [dark] initial bubble inline Northwind
PASS: [dark] initial aliasRow hidden (no empty heading) (got hidden)
PASS: [dark] initial aliases empty
PASS: [dark] initial counter 1 company name (got "1 company name · add a short form")
PASS: [dark] Continue label paints
PASS: [dark] Continue enabled with names
PASS: after add chips [Northwind, Northwind Co.]
PASS: after add preview brand stays Northwind (primary)
PASS: after add alias pill Northwind Co. paints
PASS: after add aliasRow visible (heading + pill)
PASS: after add counter Knows 2 names
PASS: after delete chips ["Northwind"]
PASS: after delete preview brand Northwind
PASS: after delete bubble inline Northwind
PASS: after delete meta still northwind.com
PASS: after delete alias pills cleared (got 0)
PASS: after delete aliasRow hidden (no EMPTY heading left) (got hidden)
PASS: after delete counter 1 company name (got "1 company name · add a short form")
PASS: [light] post-delete brand still Northwind
PASS: [light] post-delete aliasRow hidden
PASS: [light] post-delete Continue still paints
PASS: [dark] post-delete brand still Northwind
PASS: [dark] post-delete aliasRow hidden
PASS: [dark] post-delete Continue still paints
PASS: node identity pvBrand stable across full loop
PASS: node identity pvAliases stable
PASS: node identity chips stable
PASS: node identity hint stable
PASS: node identity input stable
PASS: zero innerHTML writes after init (got 0)
TARGET: ./index.html THEME CHECKED: light+dark FAILURES: 0
HARNESS RESULT: PASS
```

## Full-loop node identity + zero innerHTML
- Captured `pvBrand/pvAliases/chips/hint/input` before loop, asserted `===` after add+remove+theme flips in light+dark — stable (in-place updates only).
- `innerHTML` setter counted after init — 0 writes. Static grep also 0.
- `node --check` on both inline scripts passes (via extracted `.tmp` check during dev; harness itself `node --check ./harness.js` passes).
