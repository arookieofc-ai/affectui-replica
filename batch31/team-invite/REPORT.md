# REPORT — team-invite member-row overflow fix (targeted)

## Target directory
`./` (contains `REPLICATE_SPEC.md`, `demo-original.js`, `index.html`)

## Defect (real-browser QA)
- Sofia's member card PERMANENTLY OVERFLOWS the main card's right edge in both themes (~125px light, ~75px dark), her status pill hanging outside the card.
- The static chips row overflows, not a drag-animation moment.
- Per the original the member row fits inside the card.

## Original behaviour check (`./demo-original.js`)
- Read with relative path `./demo-original.js` before changing anything.
- Original is a 600×400 `ui-ti` drag scene (`aspect-ratio: 3/2`, `overflow:hidden`, `container-type:inline-size`):
  nodes `a(120,159) b(300,105) drag-start(456,281)->slot(290,245)`, dashed slot circle + joined line animation, 4.4s loop. No roster/member/pill row exists in the original at all.
- Conclusion: the overflowing `.roster/.member/.pill` row is replica-added chrome, not original behaviour. The original does not overflow this way (its stage is `overflow:hidden` clipped). Fixing the replica row does NOT contradict the original — fix is valid.

## Root cause (`./index.html` before fix)
```css
.roster{...display:grid;gap:8px}
@media(min-width:560px){.roster{grid-template-columns:1fr 1fr 1fr}}
.member{display:flex;...;background:var(--surface)}
```
- `1fr 1fr 1fr` = `minmax(auto,1fr)`. With `white-space:nowrap` + `text-overflow:ellipsis` role lines (`Connected · online`, `Dragged into the empty slot…`) the grid-item `min-width:auto` prevents shrinking → grid blowout. Sofia (longest role + `joining…` pill) pushes the row ~125px/75px past the card.
- `.member` (the grid item) had no `min-width:0`, so `.who{min-width:0;flex:1}` could not save it.

## Fix (targeted, in-place CSS only, no rebuild)
In `./index.html` only, two rules changed:
```css
.roster{...;min-width:0;width:100%}
@media(min-width:560px){.roster{grid-template-columns:repeat(3,minmax(0,1fr))}}
.member{...;min-width:0;max-width:100%;overflow:hidden}
```
- Allows all 3 member cards to shrink to `(656-16)/3≈213px`, long role text ellipsizes, `joining…/online` pill stays inside its card, all cards stay inside `.card` at rest and during the loop, light and dark.
- Nothing else touched: `/*noflash*/` guard kept, in-place `textContent/class/style` updates only, zero `innerHTML` writes after init, demo data verbatim (Mara/Jonas/Sofia), 4.4s invite loop + Replay + Pause + theme toggle unchanged.

## Hard proof — md5 BEFORE/AFTER (must differ)
```
BEFORE: b5078a5491a725aac30ef52a52b549f8  ./index.html
AFTER:  1932d4971d8cbf1b913bbe10f7456bb5  ./index.html
BACKUP: b5078a5491a725aac30ef52a52b549f8  ./original-backup.html
```
- `md5sum ./index.html` run before editing and after editing; hashes differ.
- Original preserved as `./original-backup.html` (same hash as BEFORE).

## Harness (`./harness.js`, node only, no installs)
- `node --check ./harness.js` → OK; `node --check ./demo-original.js` → OK.
- DOM-stub runs the inline script via `vm`, asserts VISIBLE state (geometry right-edges, computed colours, opacity/visibility), light AND dark, full-loop node identity, zero `innerHTML` writes after init, invite phases + Replay.
- Must FAIL on original, PASS on fixed. Both runs pasted below.

### Harness vs ORIGINAL (`node ./harness.js ./original-backup.html` → exit 1 FAIL as required)
```
PASS | noflash guard present | head inline script
PASS | meta color-scheme present | light dark
PASS | html bg guard present | first-paint bg
PASS | demo data verbatim (Mara/Jonas/Sofia) | names present
PASS | demo aria-label matches original | aria-label
PASS | zero innerHTML writes after init (static) | innerHTML occurrences=0
INFO | roster grid-template-columns = "1fr 1fr 1fr"
INFO | .member rule = "display:flex;align-items:center;gap:10px;border:1px solid var(--border);
  border-radius:var(--r);padding:10px 12px 10px 10px;background:var(--surface)"
INFO | .roster base = "list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px"
FAIL | roster grid uses minmax(0,1fr) (no auto-min blowout) | grid="1fr 1fr 1fr"
FAIL | member has min-width:0 (grid-item shrink) | member min-width
FAIL | member clips (overflow:hidden) | member overflow
INFO | [light] card=[0,656] availCol=213.33 overflow=125px memberRight=781.0 pillRight=779.0 opacity=1 visibility=visible
FAIL | geometry: members+pills inside card [light] | overflow=125px memberRight=781.0 vs cardRight=656
PASS | visible state: member opacity/visibility [light] | member not hidden
PASS | visible state: pill opacity/visibility [light] | pill not hidden
INFO | [dark] card=[0,656] availCol=213.33 overflow=75px memberRight=731.0 pillRight=729.0 opacity=1 visibility=visible
FAIL | geometry: members+pills inside card [dark] | overflow=75px memberRight=731.0 vs cardRight=656
PASS | visible state: member opacity/visibility [dark] | member not hidden
PASS | visible state: pill opacity/visibility [dark] | pill not hidden
INFO | light --surface=#ffffff dark --surface=#1c1c1f
INFO | light --amber-tx=#92400e dark --amber-tx=#fde68a
PASS | colours: surface tokens differ light/dark | #ffffff vs #1c1c1f
PASS | colours: pill amber readable in both | amber-tx both themes
PASS | colours: pill keeps contrast (green/amber bg+text) | pill classes
PASS | inline script found | 3672 chars
PASS | DOM-stub: __teamInvite exposed | LOOP=4400
PASS | full-loop node identity (in-place updates) | status/pill/rl/fill same objects
PASS | invite loop phases progress (rest/carry/joined) | seen=rest,carry,settle,joined,reset
PASS | pill toggles joining…/online | rest="joining…" joined="online"
PASS | loopbar fill geometry progresses | w0=0% w50=50%
PASS | Replay keeps working (in-place, identity) | replay reset ok
PASS | pill visible in light AND dark | dark="online" light="online"
PASS | zero innerHTML writes after init (runtime) | writes=0
---
RESULT FAIL (5) :: ./original-backup.html
```

### Harness vs FIXED (`node ./harness.js ./index.html` → exit 0 PASS as required)
```
PASS | noflash guard present | head inline script
PASS | meta color-scheme present | light dark
PASS | html bg guard present | first-paint bg
PASS | demo data verbatim (Mara/Jonas/Sofia) | names present
PASS | demo aria-label matches original | aria-label
PASS | zero innerHTML writes after init (static) | innerHTML occurrences=0
INFO | roster grid-template-columns = "repeat(3,minmax(0,1fr))"
INFO | .member rule = "display:flex;align-items:center;gap:10px;border:1px solid var(--border);
  border-radius:var(--r);padding:10px 12px 10px 10px;background:var(--surface);min-width:0;max-width:100%;overflow:hidden"
INFO | .roster base = "list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px;min-width:0;width:100%"
PASS | roster grid uses minmax(0,1fr) (no auto-min blowout) | grid="repeat(3,minmax(0,1fr))"
PASS | member has min-width:0 (grid-item shrink) | member min-width
PASS | member clips (overflow:hidden) | member overflow
INFO | [light] card=[0,656] availCol=213.33 overflow=0px memberRight=656.0 pillRight=654.0 opacity=1 visibility=visible
PASS | geometry: members+pills inside card [light] | overflow=0px memberRight=656.0 vs cardRight=656
PASS | visible state: member opacity/visibility [light] | member not hidden
PASS | visible state: pill opacity/visibility [light] | pill not hidden
INFO | [dark] card=[0,656] availCol=213.33 overflow=0px memberRight=656.0 pillRight=654.0 opacity=1 visibility=visible
PASS | geometry: members+pills inside card [dark] | overflow=0px memberRight=656.0 vs cardRight=656
PASS | visible state: member opacity/visibility [dark] | member not hidden
PASS | visible state: pill opacity/visibility [dark] | pill not hidden
INFO | light --surface=#ffffff dark --surface=#1c1c1f
INFO | light --amber-tx=#92400e dark --amber-tx=#fde68a
PASS | colours: surface tokens differ light/dark | #ffffff vs #1c1c1f
PASS | colours: pill amber readable in both | amber-tx both themes
PASS | colours: pill keeps contrast (green/amber bg+text) | pill classes
PASS | inline script found | 3672 chars
PASS | DOM-stub: __teamInvite exposed | LOOP=4400
PASS | full-loop node identity (in-place updates) | status/pill/rl/fill same objects
PASS | invite loop phases progress (rest/carry/joined) | seen=rest,carry,settle,joined,reset
PASS | pill toggles joining…/online | rest="joining…" joined="online"
PASS | loopbar fill geometry progresses | w0=0% w50=50%
PASS | Replay keeps working (in-place, identity) | replay reset ok
PASS | pill visible in light AND dark | dark="online" light="online"
PASS | zero innerHTML writes after init (runtime) | writes=0
---
RESULT PASS :: ./index.html
```

## What matches / verified
- Stage drag animation (4.4s, pick-up 12–16%, carry 16–42%, drop 42–48%, link 48–54%, release 62%, hold to 88%) kept verbatim geometry from original.
- Roster now fits: all memberRights ≤ cardRight, pillRights ≤ cardRight, opacity 1 / visible, colours use tokens in both themes.
- In-place updates: `status/pill/rl/fill/stage` keep object identity across full 0–4400ms loop; Replay resets `t0` without rebuilding DOM.
- Zero `innerHTML` writes after init (static 0 + runtime trap 0).

## What could not be verified (no browser, node-only)
- Pixel-perfect rendering at real viewport widths, hover lift, focus ring, reduced-motion frame. CSS logic guarantees fit at ≥560px 3-col and <560px stacked; narrow stacked case has no grid blowout by construction.

## How to test
1. `md5sum ./index.html` (expect AFTER hash above).
2. `node --check ./harness.js && node --check ./demo-original.js`
3. `node ./harness.js ./original-backup.html` (expect FAIL) and `node ./harness.js ./index.html` (expect PASS).
4. Open `./index.html` in a browser, toggle Dark/Light, watch 4.4s loop, click Replay invite — Sofia's card and pill stay inside the main card throughout.
