# Agent / Inbox Board — Replica Report

## What was built
ONE self-contained `index.html` (33.9KB, <200KB, no network, no external assets, system fonts only).
Background agent tasks board across **Needs you / Running / Done** with detail approvals, header `Storefront Refresh` + `3 running` + `6 agents`, context `44k / 200k` + thin 3px bar, 3×3 deterministic pixel-marks (EXACTLY 9 cells), circular tool icons, sub-agent mini-cards, inline detail panel with Approve / Request changes.

Clean-room: wrote structure/CSS from observed behaviour; JS builds DOM once via `createElement`/`appendChild`, updates nodes in place, never uses `innerHTML` (statically verified). No copy of `demo-original.js` compiled source.

## Data matched (verbatim from board demo)
- `t-need-1` Migrate checkout to edge functions · scout-01 · claude-4-sonnet · 44000/200000 · 742s elapsed · tools GH/TE/WB · steps Mapped 14 checkout call sites / Drafted /api/checkout edge route / Needs approval: delete legacy handler · artifact `-  DELETE routes/checkout-legacy.ts (+0 −212)` / `+  ADD  routes/checkout/route.ts (edge, 96 lines)` · note Waiting on you · diff ready
- `t-need-2` Fix flaky payment webhook retry · pulse-02 · gpt-5-codex · 128000/200000 · 1880s · GH/DB · Repro…/Added idempotency…/Needs approval: replay 41 events · `ledger.write({ idempotencyKey, retry: 'exponential-5x' })`
- `t-need-3` Backfill product embeddings for 2.4k SKUs · scout-01 · 96000/200000 · 1240s · DB/EM · Embedded 2,148/2,412 · Flagged 12 near-duplicates · Needs approval: publish index v18 · `index v17 → v18 · +2,148 vectors · −3.1% duplicates`
- `t-run-1` Generate OG images for 120 posts · forge-03 · claude-4-haiku · 31000/200000 · 420s · progress 62 · IM/WB · Rendered 74/120 · Optimizing to AVIF <90kB · `og/074.png · 1200×630 · 82kB AVIF` · Rendering
- `t-run-2` Replay failed webhooks from Tue incident · pulse-02 · 58000/200000 · 900s · progress 31 · GH/DB/Q · Queued 212 events · Replaying at 8/s · `replay cursor 66/212 · 0 errors in last 50`
- `t-run-3` Audit accessibility on pricing page · lens-04 · 22000/200000 · 300s · progress 84 · WB/AX · Checked contrast on 38 nodes · Scanning keyboard traps · `38 nodes · 2 contrast fails · 0 traps so far` · subs contrast-check 38 nodes/working + keyboard-trap-scan 12 stops/queued
- `t-done-1` Bump billing plans copy · scribe-05 · gpt-5-mini · 12000/200000 · 480s · GH · Updated 3 plan tiers / Approved by you · `approved 09:41 · 3 files · +48 −19` · Approved · 8m
- `t-done-2` Prune dead feature flags (14 removed) · forge-03 · 18000/200000 · 660s · GH/TE · Removed 14 flags / All checks green · `approved 08:20 · −1,204 lines` · Approved · 11m
- Header: `Storefront Refresh`, `Needs you`/`Running`/`Done`, `3 running`, `6 agents`, `132k / 200k context` total, `44k / 200k` detail, `needs you`/`working`/`done`, `Approve`.

Note on `demo-original.js`: that file describes a different React DemoStage variant (workspace `Fieldwork`, agents Builder/Reviewer/Ops/Writer, tasks Migrate users table / Clean up CRM / Review PR #482 / Release notes / Dependency audit / Weekly digest / Onboarding + invoice/post loop every 9s). The in-dir `harness.js` + board contract expects the Storefront/scout-01 dataset above. I matched the harness/board dataset verbatim (authoritative for this standalone page) and preserved `demo-original.js` behaviour patterns: 3 lanes (needs/running/done), waiting→running→done lifecycle, 1s tick, elapsed/tokens/progress in-place, loop restart, approve→done.

## Behaviour / timings / loop matched
- Build DOM once at init, `placeCard` moves nodes, `updateCard`/`refreshCounts`/`renderDetailLight` touch only changed `textContent`/`style`/`className`; `highlightChain` toggles `.chain` only; hover/focus never re-render.
- `setInterval(tick,1000)`: running `elapsedSec+1`, `tokensUsed=min(max,+37)`, `progress=min(100,+0.6)`, `progress>=100` → done + `Run finished — moved to Done`; needs `elapsedSec+1`; when no running left, `t-run-1/2/3` restart `progress=5` + `Restarted loop`; counts/context bar update in place.
- Approve (`t-need-2` etc): needs→done, `Approved by you`, `Approved · just now`, moves column preserving node identity. Request changes: →running, `progress=max(5,prev-18)`, `Rework requested — resuming run`.
- Search filter, arrow/Enter/A/Esc keyboard, card select dim (`opacity:.78` legible), chain highlight, detail steps/artifact/tokens.
- Pixel-marks: `hashStr(FNV-1a)` → hue, 9 `<i>` per agent, `background:hsl(hue+k*14 …)` or transparent; `.card.working .pix` twinkle 1.6s.
- Tools: 24px circular `.tool` with initials; subs: `.subcard` smaller, no model line.
- Context: `fmtTokens` k-format, `44k / 200k`, never %; 3px bar, right-aligned label.

## Design tokens / themes / v5 polish
- Tokens: `--surface #ffffff`, `--page #fafaf9`, `--ink #1c1917/#171717`, `--muted #78716c`, `--subtle #f5f5f4`, `--border #e7e5e4`, `radius-lg 16px/radius 10px/radius-sm 6px`, `shadow …05`; dark `--surface #1c1c1f`, `--page #101012`, `--ink #ededed`, `--muted #a1a1aa`, `--subtle #26262a`, `--border #2e2e33`, darker shadows; amber light `#f59e0b/#fef3c7/#92400e`, dark `#fbbf24/#451a03/#fde68a`.
- Toggle `#theme-btn` → `data-theme light|dark` on `<html>`, key `affectui-agent-inbox-theme`, default `prefers-color-scheme`, default markup `light` matching original light appearance.
- `/*noflash*/` guard in `<head>` + `<meta name=color-scheme light dark>` + `html{background:#fafaf9}html[data-theme=dark]{background:#101012}`.
- v5: ALL `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric `col:calc(var(--radius-lg)+12px)`, `detail:calc(var(--radius)+16px)`; shadows for elevation / borders for structure (borders on dividers/selected/inputs); artifact inset `box-shadow inset 0 0 0 1px var(--img-outline)` (10% black/white); optical `btn padding 7px 12px 7px 10px`; `[hidden]{display:none!important}`; SVG via `setAttribute` only (no SVG used); no broad `.x svg` rule.

## What could not verify
- No browser: visual pixel-perfect vs original screenshots not eyeballed; responsive narrow/stack and reduced-motion rely on CSS only.
- Full app chrome (DemoStage nav, Thread/Inbox nav, modal New Task) not replicated — standalone board + inline detail only, per harness contract.

## How to test
- `open index.html` in a browser; toggle theme (top-right), filter via search, click cards, Approve `Fix flaky payment webhook retry`, watch Running progress tick each second, loop restart.
- `node ./harness.js` (in-dir DOM-stub, 300 ticks, identity + zero innerHTML checks).
- Extract + `node --check` main script.

## Verification (light AND dark checked)
- `node --check` on extracted script: PASS.
- `node ./harness.js`: ALL PASSED — size 33921 <200KB, noflash/meta/tokens/amber/tap/tabular/hover-media/3 cols/Storefront/no-tailwind/no-external/innerHTML-free/createElement/setTheme present, stub boot, VISIBLE text (`Migrate checkout…`, `Generate OG…`, `Needs you`, `Running`, `Done`, `needs you`, `working`, `Approve`, `44k / 200k`), 300-tick node identity + zero `innerHTML`, approve preserves identity, `setTheme dark→data-theme=dark`, `light→light`, theme button wired. Dark + light both exercised via `board.setTheme`.
