# Decision Inbox — targeted fix REPORT

## What this page is
Standalone replica of the affectUI decision-inbox item (`index.html`, inline CSS + JS, no deps).
Two decision rows (rollout / renewal) with open/folded states, answer buttons that fold the row
away after ~1100ms, auto-open of the next folded row, header count `2 need your input` -> `1 needs…`
-> `All caught up`, empty-state text, full-loop reset after ~3200ms, light/dark theme toggle.

## Defect (from real-browser QA)
In the EXPANDED state each row's title painted TWICE: the bold title had an identical light-grey
copy of the same title text directly beneath it, in both themes and both rows (verified zoomed).
Interactions otherwise worked (Roll out collapses the row after ~5s total cycle, count 2->1).

## Root cause
Checked `./demo-original.js` first: the original does NOT behave this way. It conditionally renders
exactly one title node per state — `<p class="ui-di__title">` when open, `<button class="…--folded">`
when folded — plus the real detail (`ui-di__detail`) and actions inside the collapsible body.
The expanded row shows the title ONCE. So the duplication is a replica-only bug, worth fixing.

Replica keeps both title nodes alive for in-place updates (good for node identity) and toggles them
with the `hidden` property (`paintRow`: open -> `titleOpen.hidden=false, titleFolded.hidden=true`).
But the stylesheet had NO `[hidden]` rule, while two rules set explicit `display` that beats the
UA `[hidden]{display:none}` default:

- `.di__title{display:block;…}` — keeps the folded `<button>` (faint grey `#b5b5b5`/`#6b6b70`) painted
  even when `hidden=true`, directly under the bold open `<p>`. Exactly the reported "light-grey copy".
- `.di__done{display:inline-flex;…}` — same latent bug for the answered badge (would leak an empty
  badge next to the buttons).

No `::before`/`::after` content echo and no double-render in JS — the second copy is purely the
`hidden`-vs-`display` CSS specificity conflict.

## Fix (targeted, everything else identical)
One line added right after the `/* ---- component ---- */` marker in `index.html`:

```css
.di [hidden]{display:none !important}
```

Scoped to `.di` so page chrome is untouched. `hidden=true` nodes now never paint in either theme,
so the expanded row shows exactly the open `<p>` title plus its genuine detail + actions; the folded
state shows exactly the folded button. No JS changes, no node/structure changes, demo data verbatim,
`/*noflash*/` guard kept, still zero `innerHTML` writes after init, still in-place updates only.

## Verification (node only, in-dir)
- `node --check` on the extracted main script: OK (also `node --check verify-fix.js`: OK).
- `node verify-fix.js` (in-dir DOM-stub harness, no installs/downloads): ALL CHECKS PASSED —
  - `/*noflash*/` present; zero `innerHTML` in source and zero `innerHTML` writes after init
    and across a full loop (setter counter on the stub).
  - Fix rule present; no title/detail `::before`/`::after` content echo.
  - Demo data verbatim vs `./demo-original.js` (both titles, details, all four button labels).
  - VISIBLE state (= `!hidden`, which is exactly what paints given the fix rule): each EXPANDED
    row shows exactly one title (the open `<p>` with verbatim text, body `data-open` set) in
    LIGHT and in DARK; folded state shows exactly the folded button; both detail nodes kept
    with verbatim text.
  - Interactions: count 2 -> 1 after answering the first row, row goes `gone` after the
    ~1100ms timer; full loop (answer second row, run collapse + ~3200ms reset timers) restores
    count 2 with both rows expanded single-title.
  - Full-loop node identity: `row/item/titleOpen/titleFolded/body/btnP/btnS/done` are the same
    objects before and after the loop (in-place updates only, no rebuild).

## What matches / could not verify
- Matches: tray + white card layout, header count wording, title/detail/actions, fold/collapse
  timing shape, empty state, theme tokens in both modes, hover only under
  `@media (hover:hover) and (pointer:fine)`, tabular-nums, tap-highlight guard.
- Could not verify: pixel-exact colours/spacing vs the live site (no browser here); reduced-motion
  and narrow-viewport behaviour are code-correct but only stub-tested. Open `index.html` in a real
  browser and zoom the expanded rows in light + dark to confirm the single-title paint; click
  `Roll out` and watch count 2->1 and the row fold away.
