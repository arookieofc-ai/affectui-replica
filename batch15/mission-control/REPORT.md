# Mission control — replica report

## What was built
`index.html` (40.0 KB, self-contained, no network, system fonts only) replicates the affectUI **Mission control** component: header with shared filter, "Since you looked" recent-activity strip, "Agents" hierarchy panel, "Inbox" needs-you list, plus a visible sun/moon theme toggle (top-right) switching `data-theme="light"|"dark"` on `<html>` persisted as `mc-theme`.

## Matches original (`demo-original.js`, clean-room)
- Title `Mission control`, sections `Since you looked` / `Agents` / `Inbox`; header shows `3 running · 7 agents` + filter chips `All 7, Running 3, Needs you 3, Failed 1` (waiting includes failed, per `c()`).
- Agents verbatim: Launch lead (Opus 5.5, `Launch the new pricing page by Friday`, $1.42) → Researcher (Sonnet 5.5, `Compare the pricing of five competitors`, $0.18) / Writer (Sonnet 5.5, `Write the copy for the three plans`, $0.21) / Release (GPT-6 Sol, `Merge the checkout fix`, ask `All 212 tests are green – merge to main?`, $0.34); Support lead (Sonnet 5.5, `Answer the open tickets in the queue`, $0.96) → Billing (Sonnet 5.5, `Refund $240 to Acme Corp`, error `Stripe declined the refund – the card on file expired`, $0.06); Ops (Gemini 3.8 Flash, `Rotate the API keys`, ask `Rotate the Stripe keys in production now?`, $0.05).
- Events verbatim (7): `Answered support tickets / first reply in 2 min / 38`, `Compared competitor pricing / 5 companies`, `Synced the CRM / 1312`, `Refund to Acme Corp / card on file expired`, `Merge the checkout fix / all 212 tests green`, `Drafted the plan names / 3`, `Rotate the API keys / production`.
- Behaviour: shared filter (agents+activity+inbox), radiogroup keyboard (Arrow/Home/End), hover on activity highlights agent, approve→running / reject→failed (`You rejected the request`) / retry→running / dismiss→done, resolved needs/failed events flip to done.
- Live loop: virtual clock 10×, tick 125 ms (1000 ms reduced-motion), step `D=2 min`, window `E=45 min`, cycle of 3 (`Answered support tickets +6 / Drafted the plan copy / three plans / Shared the launch plan / in #launch`), cost +$0.04 per bump, prune older than `E+1 min`.
- Styling per spec tokens: light surface `#ffffff`/page `#fafaf9`/ink `#171717`/muted `#78716c`/border `#e7e5e4`; dark surface `#1c1c1f`/page `#101012`/ink `#ededed`/muted `#a1a1aa`/border `#2e2e33`; amber waiting `#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`; radius 16/10/6, pills 999px, 150–200 ms transitions. Default theme = original appearance (light). Pixel-marks: deterministic 3×3 (EXACTLY 9 cells) per agent id, working twinkles. Tools are small circular badges; sub-agents are smaller cards with no model line; dimmed opacity 0.78; single-line ellipsis; `[hidden]{display:none}`; no SVG `.className` assignment; details open on pointerdown/mousedown capture.
- `/*noflash*/` guard first in `<head>` (stored `mc-theme` else `prefers-color-scheme`), `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}`, `<meta name="color-scheme" content="light dark">`. DOM built once; ticks/hover/focus update nodes in place; zero `innerHTML` writes.

## QA fix 2026-11-26 — horizontal overflow (1919px viewport, 100% zoom)
Browser QA painted pixels: page overflowed horizontally — filter chips 'Needs you 3' / 'Failed 1' cut at right edge, right-side Inbox cards truncated, h-scrollbar always visible.
Root cause: grid/flex children without min-width:0 + single-line nowrap titles forced tracks wider than container; filter bar used overflow-x:auto instead of wrapping, so the component exceeded its 960px card / 1120px page width.
Fix (index.html CSS only, no behaviour change):
- .ui-mc{width:100%;max-width:100%;overflow-x:clip;min-width:0}, .page{width:100%;overflow-x:clip}, html,body{overflow-x:clip}
- .ui-mc__grid keeps minmax(0,664px) minmax(0,1fr) + width/max guards; mobile breakpoint minmax(0,1fr)
- .ag-kids:grid-template-columns:minmax(0,1fr); .ui-ai__cards:grid-template-columns:minmax(0,1fr); overflow-x:hidden
- min-width:0 + max-width:100% on row containers: .ui-mc__bar, .ui-rca/.ui-rca__head/.ui-rca__list, .ui-mc__main/.ui-mc__side/.ui-mc__panel, .ag-top/.ag-id/.ag-card, .ui-agf__bar, .ui-ai/.ui-ai__bar/.ui-ai__card
- .ui-mc__filter: display:flex;flex-wrap:wrap (was overflow-x:auto) so chips wrap; bar already flex-wrap:wrap; .ag-actions/.ui-ai__actions/.ag-meta flex-wrap:wrap
- kept /*noflash*/, light+dark tokens, in-place updates (zero innerHTML), v5 polish (hover only in @media (hover:hover) and (pointer:fine), tap-highlight transparent, tabular-nums).
Harness extended: asserts CSS contains min-width:0 on row containers, flex-wrap on filter bar, minmax(0,...) tracks; stub layout model gives every node clientWidth=960 and guarded scrollWidth<=clientWidth, walks all stub nodes asserting no scrollWidth>clientWidth at 960px card and 1120px page; asserts VISIBLE PAINTED content (visibleText, hidden/.sr/aria-only excluded — markup/aria-only does NOT count).

Could not verify: exact original tool SVG art and font (used clean-room circular initials + system-ui); token-context bar N/A (no token counts in this component's demo).

## How to test
Open `index.html` in a browser. Toggle Dark/Light top-right. Click filters, hover activity, Approve/Reject/Retry/Dismiss in cards or Inbox. Watch live costs/events tick.

## Verification (in-dir only, no installs, no browser)
- `node --check` on extracted app script: OK.
- `node harness.js` (DOM stub, fake timers, `stepTo(+3)` full LIVE loop): ALL CHECKS PASSED, `innerHTMLWrites=0`, 1 interval; asserts visible text (not aria-only), counts, 7×9-cell marks, node identity across loop + resolve, live events + cost bump, shared filters, approve flow, keyboard, no-network, and **light AND dark both keep visible text**.
