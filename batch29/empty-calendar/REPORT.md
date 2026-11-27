# REPORT — fix-empty-calendar (targeted painting fix)

## What was broken (real-browser QA)
- Core scene essentially invisible in both themes: only faint blurry glow (light) or thin arc + weak glow (dark). No card outlines, no EMPTY marker, no Join meeting button in scene (mentioned only in footer note).
- Fan out slider 38 -> 100 changed number but produced no visible change; hover did nothing.

## demo-original.js check (before changing anything)
Read `./demo-original.js` + `./REPLICATE_SPEC.md` with relative paths before editing.

Original behaviour (does NOT behave the same way — fix is justified):
- `function a({shadow})` paints one full calendar card: `rect` 240x140 rx10 `fill #FFFFFF` `stroke #E4E7EC` sw 0.5 + `text Calendar` fill `#8A8A8A` + badge `rect` 46x18 fill `#FEF8EF` + `text EMPTY` fill `#FAB082` + 3 bars fill `#EFF1F4` + Join group `rect` 208x40 fill `#F4F4F6` stroke `#E4E7EC` + ink `stroke #9A9AA3` + `text Join meeting` fill `#9A9AA3`.
- Scene: `g translate(30 47) scale(0.814)` with back-left / back-right / front (front = blob `ellipse` + card + arc `path stroke url(#stroke)`).
- CSS: `.ui-ec-back-left{translate(-22px,0) rotate(-3deg)}`, right `+22px/+3deg`, hover `-48px/+4px/-7deg` / `+48px/+4px/+7deg`, front hover `translate(0,-8px) rotate(2deg)`, shimmer + breathe animations, dark overrides via `:where(.dark,[data-theme="dark"])` (card `#232326`, bar `#2a2a2d`, btn `#2a2a2d`, ink `#6b6b70`, edge `#3a3a3f`, drop `0.4`).
- So original DOES show 3 stacked cards with outlines, EMPTY, disabled Join. Replica did not — painting bug, not spec.

## Fix (targeted, no rebuild)
Kept page texts/data verbatim, kept `/*noflash*/` guard, in-place updates only, zero `innerHTML` after init.

1. **Visible fills (light + dark):** `makeCard` used `fill:''` / `stroke:''` empty + `fill:var(--card-fill)` with no fallback. Only `ellipse` (blob `url()`) + arc `path` (`url()`) painted — exactly QA symptom. Fixed to explicit original light values as presentation attributes (fallback if CSS vars unsupported) + CSS `var(...,fallback)`:
   - `ec-card: fill #FFFFFF / stroke #E4E7EC`, `ec-title #8A8A8A`, `ec-badge #FEF8EF`, `ec-badge-label #FAB082`, `ec-bar #EFF1F4`, `ec-btn #F4F4F6 / #E4E7EC`, `ec-btn-ink/Label #9A9AA3`.
   - Added `paintSceneTheme()` updating all 3 cards in-place on `setTheme`/`init` to original dark values (`#232326`, `rgba(255,255,255,0.08)`, `#8f8f8f`, `rgba(250,176,130,0.16)`, `#2a2a2d`, `#6b6b70`, edge `#3a3a3f`, drop `0.4`). Stored `refs.cards/titles/badges/bars/btnRects/inks/btnLabels/edgeStops/drops`, no node recreation.
   - CSS: `fill:var(--card-fill,#FFFFFF)` etc + `.ec-edge{stop-color:var(--edge,#E4E7EC)}`, edge stops get `class ec-edge`.

2. **Fan slider visible:** `applyFan` only did `setAttribute('transform',...)` on `backL/backR`, but stylesheet `.ec-back-left{transform:...}` overrides attribute (CSS wins) → no visible change. Fixed to set BOTH attribute (compat) AND `style.transform='translate(...px,0px) rotate(...deg)'` (visible). `38 -> translate(-31.9px)/rotate(-4.52deg)`, `100 -> translate(-48.0px)/rotate(-7.00deg)` matching original hover-far position.

3. **Hover visible:** kept CSS hover inside `@media (hover:hover) and (pointer:fine)` (spec v5), added JS `paintHover(on)` (in-place `style.transform`): front `translate(0px,-8px) rotate(2deg)`, backs `-48px/+4px/-7deg` / `+48px/+4px/+7deg`, bound to `frame` + `frontG` `mouseenter/leave`, exposed as `refs.paintHover`. Restores via `applyFan(refs.fan)`.

4. **API:** added `paintSceneTheme` to `window.__ec`, kept `init/tick/setTheme/getTheme/applyFan/refs`.

Size: `19559` bytes (<200KB).

## Proof — md5 BEFORE vs AFTER (must differ)
- BEFORE (pre-edit, identical to `./original-backup.html`):
  `3ec4e1c9c95ece64893d98181d53efc4  ./index.html`
- AFTER (fixed `./index.html`):
  `e84b91e44219ccab9d734ee1689bf9cb  ./index.html`
- They differ. Backup kept as `./original-backup.html` (`3ec4e1c9c95ece64893d98181d53efc4`).

## Proof — harness MUST fail on original, PASS on fixed
Harness: `./harness.js` (in-dir DOM-stub, `node` only, no installs). Asserts visible state light AND dark (card fills/strokes, EMPTY, Join disabled+visible), fan `38 vs 100` via `style.transform` growth, hover lift via `refs.paintHover`, full-loop node identity, zero `innerHTML` after init, `/*noflash*/`, verbatim data.
- `node --check ./harness.js` → OK (exit 0).

### ORIGINAL (`node ./harness.js ./original-backup.html` → exit 1, FAIL as required)
```
TARGET: ./original-backup.html
  PASS noflash-guard-present — head starts with /*noflash*/ guard
  PASS noflash-bg-style — first-paint bg
  PASS color-scheme-meta — color-scheme meta
  PASS zero-innerHTML-in-source — no innerHTML writes in source
  PASS hover-inside-media — :hover inside hover media
  PASS tabular-nums — tabular-nums
  PASS demo-text-Calendar — Calendar text verbatim
  PASS demo-text-EMPTY — EMPTY marker verbatim
  PASS demo-text-Join-meeting — Join meeting verbatim
  PASS inline-scripts-found — 2 inline scripts (noflash + app)
  PASS script-runs-without-exception — app script executed
  PASS api-exposed — window.__ec available
-- light theme visible structure --
  PASS three-cards-present — found 3 .ec-card
  FAIL cards-have-visible-fill-light — fills=["","",""]
  FAIL cards-have-visible-stroke-light — strokes=["","",""]
  PASS empty-marker-present — EMPTY badge text found
  FAIL empty-marker-visible-fill — badge-label fills=[null,null,null]
  PASS join-button-present-in-scene — Join meeting text in SVG scene
  PASS join-button-disabled — 3 join nodes aria-disabled=true
  FAIL join-button-visible-fill — btn fills=[null,null,null]
  PASS bars-present — 9 bars (3 per card x3 cards = 9 expected, got 9)
-- fan slider visible change --
  PASS back-cards-found — backL/backR present
  FAIL fan-changes-visible-style-left — 38="" vs 100=""
  FAIL fan-changes-visible-style-right — 38="" vs 100=""
  FAIL fan-spread-grows — NaN -> NaN
-- hover visible change --
  FAIL hover-visibly-lifts-front — refs.paintHover missing (original has no JS hover)
-- dark theme visible structure --
  PASS dark-attr-set — data-theme=dark
  FAIL cards-visible-in-dark — dark fills=["","",""]
  FAIL cards-dark-fill-correct — expected #232326, got ["","",""]
  FAIL bars-visible-in-dark — dark bar fills=[null,null,null]
  FAIL bars-dark-fill-correct — expected #2a2a2d
  FAIL light-restores — light fills=["","",""]
-- full-loop node identity --
  PASS full-loop-node-identity — 9 bars stable across full loop
  PASS nodes-stable-across-theme-fan — cards stable across theme+fan
  PASS zero-innerHTML-after-init — 0 writes
RESULT: FAIL (13 failures, 22 passes)
```

### FIXED (`node ./harness.js ./index.html` → exit 0, PASS)
```
TARGET: ./index.html
  PASS noflash-guard-present — head starts with /*noflash*/ guard
  PASS noflash-bg-style — first-paint bg
  PASS color-scheme-meta — color-scheme meta
  PASS zero-innerHTML-in-source — no innerHTML writes in source
  PASS hover-inside-media — :hover inside hover media
  PASS tabular-nums — tabular-nums
  PASS demo-text-Calendar — Calendar text verbatim
  PASS demo-text-EMPTY — EMPTY marker verbatim
  PASS demo-text-Join-meeting — Join meeting verbatim
  PASS inline-scripts-found — 2 inline scripts (noflash + app)
  PASS script-runs-without-exception — app script executed
  PASS api-exposed — window.__ec available
-- light theme visible structure --
  PASS three-cards-present — found 3 .ec-card
  PASS cards-have-visible-fill-light — fills=["#FFFFFF","#FFFFFF","#FFFFFF"]
  PASS cards-have-visible-stroke-light — strokes=["#E4E7EC","#E4E7EC","#E4E7EC"]
  PASS empty-marker-present — EMPTY badge text found
  PASS empty-marker-visible-fill — badge-label fills=["#FAB082","#FAB082","#FAB082"]
  PASS join-button-present-in-scene — Join meeting text in SVG scene
  PASS join-button-disabled — 3 join nodes aria-disabled=true
  PASS join-button-visible-fill — btn fills=["#F4F4F6","#F4F4F6","#F4F4F6"]
  PASS bars-present — 9 bars (3 per card x3 cards = 9 expected, got 9)
-- fan slider visible change --
  PASS back-cards-found — backL/backR present
  PASS fan-changes-visible-style-left — 38="translate(-31.9px, 0px) rotate(-4.52deg)" vs 100="translate(-48.0px, 0px) rotate(-7.00deg)"
  PASS fan-changes-visible-style-right — 38="translate(31.9px, 0px) rotate(4.52deg)" vs 100="translate(48.0px, 0px) rotate(7.00deg)"
  PASS fan-spread-grows — 31.9 -> 48
-- hover visible change --
  PASS hover-visibly-lifts-front — before="" during="translate(0px, -8px) rotate(2deg)" after="" backDuring="translate(-48px, 4px) rotate(-7deg)"
-- dark theme visible structure --
  PASS dark-attr-set — data-theme=dark
  PASS cards-visible-in-dark — dark fills=["#232326","#232326","#232326"]
  PASS cards-dark-fill-correct — expected #232326, got ["#232326","#232326","#232326"]
  PASS bars-visible-in-dark — dark bar fills=["#2a2a2d","#2a2a2d","#2a2a2d"]
  PASS bars-dark-fill-correct — expected #2a2a2d
  PASS light-restores — light fills=["#FFFFFF","#FFFFFF","#FFFFFF"]
-- full-loop node identity --
  PASS full-loop-node-identity — 9 bars stable across full loop
  PASS nodes-stable-across-theme-fan — cards stable across theme+fan
  PASS zero-innerHTML-after-init — 0 writes
RESULT: PASS (0 failures, 35 passes)
```

## What matches original
- 3 cards 240x140 rx10, Calendar + EMPTY badge + 3 bars + disabled Join meeting button per card, blob glow + bottom arc, fanned backs, front lift on hover, shimmer/breathe, dark fills above, disabled Join (`aria-disabled=true`, click/Enter → status “disabled — no event to join”).

## What could not verify
- Real-browser pixel rendering / contrast / reduced-motion / responsive narrow layout — only node DOM-stub (`node --check` + harness). Recommend manual open `index.html` in browser, toggle sun/moon, drag Fan 38→100, hover stack, Tab+Enter on Join.

## How to test
- `node --check ./harness.js && node ./harness.js ./index.html` (expect PASS) and `node ./harness.js ./original-backup.html` (expect FAIL).
- Open `index.html` in browser: light + dark both show 3 outlined cards + EMPTY + Join; slider visibly fans; hover lifts.
- Checked light AND dark via harness (`setTheme('dark'/'light')` + fill asserts) + tokens.

## Constraints kept
- Worked ONLY in this dir, relative `./` paths, no `rm /tmp`, no installs.
- `/*noflash*/` guard + bg + `color-scheme` intact, in-place updates only (identity harness passes), zero `innerHTML` after init, demo texts verbatim, `<200KB`.
