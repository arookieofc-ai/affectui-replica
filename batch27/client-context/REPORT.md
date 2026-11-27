# Client Context — replica report

## What was built
Standalone `index.html` in this directory (60.5KB, no external deps, system fonts only).
Clean-room code: own class names (`cx-*`), own CSS/JS written from behaviour + demo data, no copied bundle text.

Covers the original `demo-original.js` verbatim data:
- People: Lena Hart, Jonas Weber, Mara Novak, Theo Brandt, + Sofia Lind (me).
- Clients: Northwind Logistics (MRR €48.2k / Cash €612k / Gross margin 64.1% / Net burn €36.0k), Lumen Labs (ARR £1.84m / Cash £980k / 78.0% / 17 mo), Halcyon Health (Revenue $212k / Cash $1.21m / 58.3% / $18.4k) with points arrays + colours, sparklines animated.
- Reports per client (Monthly P&L, Cash runway, Board pack Q3, Runway forecast, Clinic margins) with expand/collapse, Mention-in-context, Regenerate (1100ms → “just now” + new timeline entry).
- Timeline kinds: note / report / files / integration (Stripe), with author, when, @report mentions as buttons, file chips, mine-only remove, search highlight via `<mark>`.
- Header: mark letter/bg, name + meta, Sync chip (3m ago → Syncing… → just now, 900ms), Switch-client menu + New-client create (uses NEW_COLORS cycle, placeholder KPIs).
- Card toolbar: segmented Context/Reports/Financials/Settings with sliding thumb (`--i`), search + filter (All/Notes/Files/Reports/Integrations with live counts).
- Composer: textarea, @-mention autocomplete (filters report names, ArrowUp/Down + Enter/Tab), attach cycling board-deck-Q3.pdf / pipeline-export.csv / headcount.xlsx, Add context (Cmd/Ctrl+Enter), fresh-entry flash.
- Financials list: dot, label, Previous month, wide sparkline, value + delta (+/− with tabular-nums, up=good green, down=bad rose).
- Settings: Stripe Connect/Disconnect (adds integration entry, toggles label), 3 switches (AI context / Daily digest / Share reports) per-client persisted in memory.
- Responsive: ≤680px KPIs 2-col, toolbar stacked, tools full-width, hint hidden, narrow timeline wrapping.
- Keyboard: tabs Arrow/Home/End, menus Escape to close, mention list keyboard, all buttons focus-visible outline.

## In-place updates (v4)
- DOM built once at init (`h()` + `createElement`/`createElementNS` only). No `innerHTML` anywhere in `index.html` (string-checked).
- Ticks/timeouts (sync, regen, fresh clear) update only text/attrs/styles on existing nodes.
- Keyed caches: `tlCache`, `repCache`, `finCache`, `menuCache` — reused across client switches; list reconciles order via `appendChild`/`insertBefore`, removes only missing ids.
- Harness asserts full-loop identity (header name, KPI card, tab btn, timeline OL, composer + entry `n1` reused) and 0 innerHTML writes after init.

## Tokens + v5 polish
- CSS vars for every colour; light: surface #ffffff, page #fafaf9, ink #171717, muted #78716c, subtle #f5f5f4, border #e7e5e4; dark: surface #1c1c1f, page #101012, ink #ededed, muted #a1a1aa, subtle #26262a, border #2e2e33; amber adjusted dark (#fbbf24 on #451a03, text #fde68a).
- Radius 16/10/6, pill 999px theme btn, shadow vars, concentric card radii, borders for structure / shadows for elevation only, content images (avatars/marks) 1px inset outline, optical nudge (icon-btn right padding 2px less).
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`.
- No-flash: head starts with `/*noflash*/` script (reads `client-context-theme` or prefers-color-scheme → `data-theme` before paint) + inline `html{background…}` + `meta color-scheme`. Toggle top-right overrides + persists.

## Matches / gaps
- Matches: layout, card styles, typography (14px base, 15–16px titles, 12–13px meta), spacing, pill/chip buttons, sparkline draw animation, segmented control, timeline rail + nodes, mention pills, file chips, empty states, scoped container query width.
- Gaps / not verified in stub: pixel-exact colours vs original screenshot (no browser screenshot allowed), avatar JPGs (use initial fallback — original `/avatars/*.jpg` not shipped), font-size auto-shrink for long KPI values (omitted; values fit), `field-sizing:content` textarea growth (kept resize:vertical for stub compat), reduced-motion respected via media query but not animated-frame tested.

## How to test
- Open `index.html` in a browser (no server needed).
- Switch clients, tabs, search “runway”, filter Notes, type `@` in composer, attach file, Add context, expand report → Regenerate, Settings → Stripe Disconnect, toggle Theme (top-right).
- Node only (no browser launch):
  - `node --check verify.js`
  - `node verify.js` → asserts visible painted text, full-loop identity, zero innerHTML writes, light+dark themes. Current: ALL PASS (45 checks).

## Theme check
- Light AND dark confirmed via harness (`data-theme` light→dark→light, painted text visible in both, CSS contains #fafaf9 + #101012). Manual: click Theme button, verify no grey-on-grey, borders visible, amber chip legible in both.
