# Fix report — chart ask-pop title-row overlap

## Targeted fix (no rebuild)
File: `./index.html` (existing file, edited in place).
Defect: after drag-selecting a chart range, the floating `Ask about W29 – W37…` input overlapped the chart card's title row (card header). The tail of `Weekly revenue · Q3 2026 against Q3 2…` was hidden. Must not overlap ANY part of the chart card, header included, in either theme.

## Original behaviour (checked `./demo-original.js` first)
`./demo-original.js` `W` component places the dialog with:
`style={left: clampedCenter, top: s.rect.top}` plus CSS `.ui-rva-ask{transform:translate(-50%,calc(-100% - 10px))}`.
That renders the bubble ABOVE the selection rect, which sits inside `.ui-rva-askable` below the `figcaption` header — so the bubble extends up over the header/title row. The current `./index.html` before this fix used the same pattern (`pop.style.top=g.top` + `translate(-50%,calc(-100% - 10px))`), so it reproduced the original overlap. Per QA this overlap is the defect to fix, so a targeted reposition is warranted (not a "same as original, do not fix" case).

## Fix applied
Repositioned fully clear of the card (below the card, in the free area under the caption), drag-select flow kept:
- CSS `./index.html` `.ask`: `transform:translate(-50%,calc(-100% - 10px))` → `transform:translate(-50%,0)`; `@keyframes askin` updated to the below variant (`translate(-50%,-4px)`).
- `openPop` (trend/forecast): `pop.style.top=g.top` → compute card bottom relative to askable via `cardEl=ask.closest('.figure')`, `belowTop=cardR.bottom-askR.top+8`, fallback `ask.clientHeight+40`.
- `openRegion` (split): same idea with `ask.closest('.usage-wrap')`, `belowW=cwr.bottom-awr.top+8`.
- Left clamp `Math.max(150,Math.min(w-150,cx))` kept, so no right-edge overflow. Focus, keyboard (Enter / arrows / Escape), submit, and pick highlight unchanged, all in-place style/hidden/textContent updates.
- Preserved: `/*noflash*/` guard, `meta color-scheme`, first-paint style, design tokens, tabular-nums, hover media guard, demo data verbatim, zero `innerHTML` writes after init.

## Hard proof
- BEFORE `md5sum ./index.html`: `0214763ee5168aa0ac902126072c0ac5`
- AFTER `md5sum ./index.html`: `4383410d92ae831c88bd22318ad2016f`
- Hashes differ: YES (targeted edit, no rebuild).
- Original kept as `./original-backup.html` (`0214763ee5168aa0ac902126072c0ac5`).
- Harness: `./harness.cjs` (node only, in-dir DOM stub, relative paths `./index.html` / `./original-backup.html`).
- `node --check ./harness.cjs`: OK.
- Extracted page script `node --check`: OK.

### Harness FAIL on original (`node ./harness.cjs ./original-backup.html`, exit 1)
```
PASS noflash-guard — inline theme guard present
PASS noflash-bg — first-paint bg
PASS meta-colorscheme — meta color-scheme
PASS zero-innerHTML — innerHTML occurrences=0
PASS zero-outerHTML — outerHTML occurrences=0
PASS zero-insertAdjacent — insertAdjacentHTML occurrences=0
PASS node-identity-t1 — same object across loop
PASS node-identity-txt — same object across loop
PASS node-identity-mark — same object across loop
PASS zero-innerHTML-writes-after-init — writes=0
PASS demo-verbatim-0 — Weekly revenue · Q3 2026 against Q3 2025
PASS demo-verbatim-1 — 'W27','W28','W29'
PASS demo-verbatim-2 — 82,86,84,89,91,94,93,97,134,104,102,106,
PASS demo-verbatim-3 — 74,75,73,77,78,79,81,80,84,86,85,88,90
PASS demo-verbatim-4 — Back to school
PASS demo-verbatim-5 — Monthly revenue · forecast from 18 month
PASS demo-verbatim-6 — Revenue by region, by plan
PASS css-tabular-nums — tabular-nums
PASS css-hover-media — hover guard
PASS css-tap-highlight — tap highlight
PASS theme-toggle — theme toggle
PASS theme-light-card — light --card=#ffffff
PASS theme-dark-card — dark --card=#1c1c1f
PASS theme-cards-differ — #ffffff vs #1c1c1f
PASS ask-uses-card-bg — .ask background:var(--card)
INFO positioning: isFixedCSS=false usesBelowCalc=false usesOldTop=true
PASS visible-display-light — display=grid
PASS visible-opacity-light — opacity=1
PASS visible-visibility-light — visibility=visible
PASS visible-bg-light — bg=#ffffff
PASS visible-ink-light — ink=#171717
INFO light card(top=200,bottom=470) head(top=214,bottom=236) pop(top=196,bottom=240,left=214,right=494)
FAIL no-overlap-card-light — pop [196,240] intersects card [200,470]
FAIL no-overlap-header-light — pop overlaps title row
FAIL below-card-light — pop.top=196 card.bottom=470
PASS pop-size-light — 280x44
PASS visible-display-dark — display=grid
PASS visible-opacity-dark — opacity=1
PASS visible-visibility-dark — visibility=visible
PASS visible-bg-dark — bg=#1c1c1f
PASS visible-ink-dark — ink=#ededed
INFO dark card(top=200,bottom=470) head(top=214,bottom=236) pop(top=196,bottom=240,left=214,right=494)
FAIL no-overlap-card-dark — pop [196,240] intersects card [200,470]
FAIL no-overlap-header-dark — pop overlaps title row
FAIL below-card-dark — pop.top=196 card.bottom=470
PASS pop-size-dark — 280x44
PASS flow-pointerdown — pointerdown handler
PASS flow-pointerup — pointerup handler
PASS flow-openPop — openPop present
PASS flow-keyboard — keyboard Enter flow
PASS flow-focus — focus moves to ask input
---
passes=42 failures=6 target=./original-backup.html
RESULT FAIL ./original-backup.html
```

### Harness PASS on fixed (`node ./harness.cjs ./index.html`, exit 0)
```
PASS noflash-guard — inline theme guard present
PASS noflash-bg — first-paint bg
PASS meta-colorscheme — meta color-scheme
PASS zero-innerHTML — innerHTML occurrences=0
PASS zero-outerHTML — outerHTML occurrences=0
PASS zero-insertAdjacent — insertAdjacentHTML occurrences=0
PASS node-identity-t1 — same object across loop
PASS node-identity-txt — same object across loop
PASS node-identity-mark — same object across loop
PASS zero-innerHTML-writes-after-init — writes=0
PASS demo-verbatim-0 — Weekly revenue · Q3 2026 against Q3 2025
PASS demo-verbatim-1 — 'W27','W28','W29'
PASS demo-verbatim-2 — 82,86,84,89,91,94,93,97,134,104,102,106,
PASS demo-verbatim-3 — 74,75,73,77,78,79,81,80,84,86,85,88,90
PASS demo-verbatim-4 — Back to school
PASS demo-verbatim-5 — Monthly revenue · forecast from 18 month
PASS demo-verbatim-6 — Revenue by region, by plan
PASS demo-verbatim-identical-to-backup — demo needles match backup
PASS css-tabular-nums — tabular-nums
PASS css-hover-media — hover guard
PASS css-tap-highlight — tap highlight
PASS theme-toggle — theme toggle
PASS theme-light-card — light --card=#ffffff
PASS theme-dark-card — dark --card=#1c1c1f
PASS theme-cards-differ — #ffffff vs #1c1c1f
PASS ask-uses-card-bg — .ask background:var(--card)
INFO positioning: isFixedCSS=true usesBelowCalc=true usesOldTop=false
PASS visible-display-light — display=grid
PASS visible-opacity-light — opacity=1
PASS visible-visibility-light — visibility=visible
PASS visible-bg-light — bg=#ffffff
PASS visible-ink-light — ink=#171717
INFO light card(top=200,bottom=470) head(top=214,bottom=236) pop(top=478,bottom=522,left=214,right=494)
PASS no-overlap-card-light — pop top 478 clear of card bottom 470
PASS no-overlap-header-light — title row clear
PASS below-card-light — pop.top=478 card.bottom=470
PASS pop-size-light — 280x44
PASS visible-display-dark — display=grid
PASS visible-opacity-dark — opacity=1
PASS visible-visibility-dark — visibility=visible
PASS visible-bg-dark — bg=#1c1c1f
PASS visible-ink-dark — ink=#ededed
INFO dark card(top=200,bottom=470) head(top=214,bottom=236) pop(top=478,bottom=522,left=214,right=494)
PASS no-overlap-card-dark — pop top 478 clear of card bottom 470
PASS no-overlap-header-dark — title row clear
PASS below-card-dark — pop.top=478 card.bottom=470
PASS pop-size-dark — 280x44
PASS flow-pointerdown — pointerdown handler
PASS flow-pointerup — pointerup handler
PASS flow-openPop — openPop present
PASS flow-keyboard — keyboard Enter flow
PASS flow-focus — focus moves to ask input
---
passes=49 failures=0 target=./index.html
RESULT PASS ./index.html
```

## What the harness asserts (visible state, not just presence)
- Computed `display/opacity/visibility/colours` for the pop in light AND dark (`--card` `#ffffff` vs `#1c1c1f`, `--ink` `#171717` vs `#ededed`, pop uses `var(--card)`).
- Geometry after simulated drag `W29–W37` (from=2,to=10): pop bbox vs card bbox AND header bbox, `pop.top >= card.bottom+4`, no intersection in both themes.
- Full-loop node identity (`===` across two passes) and `innerHTML/outerHTML/insertAdjacentHTML` count zero plus stubbed write counter zero.
- `/*noflash*/`, first-paint bg, `meta color-scheme`, tabular-nums, hover guard, theme toggle, drag/keyboard/focus flow, demo data verbatim identical to backup.

## What matches / could not verify
- Matches: Q3 revenue copy, KPIs, trend/forecast/split charts, captions, sources, next-question buttons, composer, theme toggle, timings.
- Could not verify in real browser (node stub only): exact pixel overlap in a live layout engine, focus ring visibility, smooth animation. Geometry uses deterministic stub rects mirroring the file's layout (card 200–470, header 214–236, askable 244–434, pop 280x44); real-browser QA should re-drag W29–W37 in light/dark and confirm the title row is fully readable and the pop sits below the card.

## How to test
Open `./index.html` in a browser, click `How did revenue develop last quarter?`, drag across the trend chart (e.g. W29–W37), confirm the `Ask about…` input appears below the card, title row fully visible, in both themes. Run `node ./harness.cjs ./index.html` (pass) and `node ./harness.cjs ./original-backup.html` (fail).
