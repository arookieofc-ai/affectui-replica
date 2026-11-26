# Mission Timeline — replica report

## What built
ONE self-contained `index.html` (35.6KB, no network, system fonts) replicating the `Mission timeline` component from `demo-original.js`. Clean-room code: own HTML/CSS/JS from observed behaviour, no copied bundle source.

Layout:
- Header: `Mission timeline · 3 working · 7 agents` + shared filter radiogroup `All / Running / Needs you / Failed` with live counts, Arrow/Home/End keyboard, `role=radiogroup`.
- `Since you looked` recent-activity strip (shared clock, last 45 min).
- Grid: `Agents` lanes (all agents on one clock, task bars positioned by `start/end` on 45-min span) + `Inbox` needs-you list.
- Theme toggle `◐ Theme / ☀ Light` top-right, `data-theme` on `<html>`, stored as `mt-theme`.

## Matched data / behaviour (verbatim from demo-original.js)
- Times: `C=60000`, `SPAN=45*C`, `STEP=2*C`, `SPEED=10`, tick `125ms` (1000 if reduced-motion). `now = base + elapsed*10`, live step every 2 min simulated (~12s real), full loop = 3 templates ≈36s real.
- Agents (7): Launch lead (Opus 5.5, `Launch the new pricing page by Friday`, $1.42), Researcher (done, `Compare the pricing of five competitors`, $0.18), Writer (`Write the copy for the three plans`, $0.21), Release (waiting, `Merge the checkout fix`, ask `All 212 tests are green – merge to main?`, $0.34), Support lead (`Answer the open tickets in the queue`, $0.96), Billing (failed, `Refund $240 to Acme Corp`, error `Stripe declined the refund – the card on file expired`, $0.06), Ops (waiting, `Rotate the API keys`, ask `Rotate the Stripe keys in production now?`, $0.05) + subtasks `Plan the launch`, `Coordinate the team`, `Competitor pricing`, `Draft plan copy`, `Merge the checkout fix`, `Answer 38 tickets`, `Refund Acme Corp`, `Sync CRM`, `Rotate API keys`.
- Events (7): `Answered support tickets / first reply in 2 min / 38`, `Compared competitor pricing / 5 companies`, `Synced the CRM / 1312`, `Refund to Acme Corp / card on file expired`, `Merge the checkout fix / all 212 tests green`, `Drafted the plan names / 3`, `Rotate the API keys / production`.
- Live templates (loop): support `Answered support tickets / 6 / Answer the next tickets`, writer `Drafted the plan copy / three plans / Tighten the FAQ`, launch `Shared the launch plan / in #launch / Coordinate the team`. Each step completes one running task, adds `next` running task, `cost+=0.04`, prunes events older than `now-SPAN-C`, adds `live-N done` event.
- Filter: `waiting` includes `failed` (`c` logic). Counts update. Highlight on hover (event↔lane↔inbox) via class only.
- Actions: Approve waiting→running, Reject waiting→failed (`You rejected the request`), Retry failed→running; needs/failed events become done when resolved. All in-place.
- Header pattern, token counts context (45 min clock, no %), 3×3 pixel-marks (exactly 9 `<i>` per agent, deterministic hash colour, working twinkles), small circular tool badges, sub-agents smaller without model line, single-line ellipsis, `opacity>=0.75` dim, `[hidden]{display:none}`, SVG-free (all `setAttribute`, no `.className` on SVG), popover opens on `pointerdown/mousedown` capture + click, hover/focus never re-renders.

## Design tokens / themes
Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`. Dark: `#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`. Waiting amber `#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`. Radius 16/10/6, shadow, 150–200ms transitions. Default = original demo appearance (light); guard respects stored `mt-theme` else `prefers-color-scheme`.
`/*noflash*/` guard is first child of `<head>` + `<meta name=color-scheme>` + `html{background}` — no white flash in dark.

## In-place updates
DOM built once at init. Timers update only `textContent/style/class/attrs` on existing nodes; new live nodes appended, never `innerHTML` (zero assignments in script). Harness asserts zero `innerHTML` writes after init and object identity of unchanged cards/events across full loop.

## Verification
- `node --check` on extracted script: PASS.
- `node harness.cjs` (in-dir DOM stub, no packages): ALL CHECKS PASSED — visible text for all names/titles/asks, counts `3 working · 7 agents`, 7 cards × 9 pix cells, full-loop (advance 36000ms real → 3 live steps) keeps node identity, zero innerHTML, filter/actions in-place, live `Answer the next tickets / Tighten the FAQ` appear after loop.
- Light AND dark checked: static dark tokens present + toggle `light→dark→light` switches `data-theme` and persists; no grey-on-grey (muted `#a1a1aa` on `#1c1c1f`, borders `#2e2e33`).

## Could not verify
- Pixel-perfect vs original screenshots (no screenshots in workdir). Spacing/typography matched from CSS constants in `demo-original.js`.
- Real browser paint / ResizeObserver / container queries — stubbed in harness; code guards missing APIs.

## How to test
Open `index.html` in a browser (no server). Click filter chips, hover events/lanes, Approve/Reject/Retry in Inbox, toggle theme, wait ~36s for full live loop. Or `node harness.cjs`.
