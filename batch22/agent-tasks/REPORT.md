# Agent / Tasks — replica report

## What was built
- ONE self-contained `index.html` (54KB, no network, no external assets, system fonts only).
- Work grouped by project (Northwind / Platform / Evalkit) as task rows with SVG progress rings, status text, Needs-you badge, steps `m/n`, file count, relative time (`4m`, `2h`), plus detail view (goal, Needs-you box, Status/Project/Started props, Steps, What happened so far, Artifacts with preview, Decided, Show agents).
- Clean-room code: own HTML/CSS/JS written from observed behaviour in `demo-original.js`. Data values copied verbatim, code structure original. No verbatim copy of compiled source. Zero `innerHTML` in file (all `textContent` / `createElement` / `setAttribute`).

## Matched data / behaviour (verbatim from demo-original.js)
- 13 tasks with exact ids/titles/projects/statusText/goals/started/steps/artifacts/history/decided:
  Ingest pipeline, Client dashboard, Weekly update, Onboarding emails, Billing webhooks, API migration, Support triage, Launch post, Benchmark suite, Auth refactor, Usage page, Docs site, Rate limits.
- Projects order Northwind → Platform → Evalkit (inferred from task order, as original derives).
- Labels verbatim from `fe`: Tasks, Active, Done, New task, Create, `Describe what you want done…`, Needs you, Show agents, Steps, What happened so far, Artifacts, Decided, Planning, Running, Paused, Waiting on you, No tasks, No active tasks + text, Nothing done yet + text, No task open + text, Task created, Say what you want done first, Decide, 1 decision waiting, `{n} decisions waiting`.
- Helpers: `pe` → `4m/2h/3d/now`, `O` → `just now / 4 minutes ago` via Intl.RelativeTimeFormat, `me` → Today/Yesterday/weekday/month-day, `k` → Done · date / statusText / Waiting / Planning / Paused / Running, `ge` → done/total fraction for rings.
- Timings: `N=420` not needed as animation var (kept 180ms ease, glide removed for stability); `setInterval 30s` for `now` refresh (`state.now=Date.now()`), plus `tick()` advances `now+=30s` for harness loop testing. Loop restarts update in place (new-task wrap, time drift).
- Interactions: Active/Done tabs, collapsible project heads, click/Enter/Space to open detail, `c/n` new task, `j/k` + arrows focus, Esc closes, project picker opens on pointerdown capture, backdrop click closes, artifact buttons open inline preview (doc/table/code/image bars/files).

## What was intentionally NOT copied / omitted
- No agent identities in original Tasks (`demo-original.js` has no `agent`/`model`/`tools`/`tokens` fields) → per spec conditional, 3×3 pixel-marks omitted (would be invented data). Documented here.
- No token-context bars (`44k / 200k`) in original Tasks → used steps/files/time instead, verbatim.
- Previous `index.html` in dir used invented data (Website Redesign, Atlas/Nova, token counts) — replaced with verbatim Northwind data.
- Artifact store `ue` partially embedded (names + updated + doc/table/code/image/files verbatim for main artifacts; `staging`/`prompts` as file lists; full binary blobs omitted for size, noted).

## v5 polish compliance
- All `:hover` inside `@media (hover: hover) and (pointer: fine)` (10 rules, verified after media index).
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}` for changing numbers (times, counts, %).
- Concentric radii: outer 16px (`--radius-lg`) / inner 10px (`--radius`) / small 6px (`--radius-sm`); nested project→row→badge follow inset rule.
- Shadows for elevation (`--shadow`, `--shadow-lift` on cards/detail/menu), borders for structure (dividers, table cells, inputs, selected row border).
- Content-image bars get `outline:1px solid var(--img-outline)` (black 10% light / white 10% dark).
- Optical alignment: icon-side buttons use asymmetric padding (e.g., `padding:0 12px 0 10px`, theme btn `padding-left:8px;padding-right:6px`).
- `[hidden]{display:none !important}` explicit; SVG classes via `setAttribute('class')` only; no broad `.x svg{display:block}` (scoped `.ring svg` only); dialogs open on `pointerdown` capture; hover/focus never trigger full re-render (only class/text updates).

## Themes
- Tokens: light `--surface #ffffff, --page #fafaf9, --ink #171717, --muted #78716c, --subtle #f5f5f4, --border #e7e5e4`, waiting amber `#f59e0b / #fef3c7 / #92400e`; dark `--surface #1c1c1f, --page #101012, --ink #ededed, --muted #a1a1aa, --subtle #26262a, --border #2e2e33`, waiting `#fbbf24 / #451a03 / #fde68a`.
- Visible sun/moon toggle top-right (`#themeBtn`), `data-theme="light"|"dark"` on `<html>`. Default `light` = original demo appearance; `/*noflash*/` guard reads stored key else `prefers-color-scheme` before paint + inline `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `meta color-scheme`.
- Checked light AND dark: harness toggles light→dark→light, asserts theme switches and content stays visible in dark.

## Verification (node only, no browser)
- `node --check` on extracted app script: PASS.
- `node verify.js` (in-dir DOM-stub): ALL CHECKS PASSED (see run output). Asserts visible painted text (Northwind/Platform/Evalkit, all 13 titles, statusTexts, Needs you, steps `2/4`, `%`, times, goals, history), 13 nodes built, 160× `tick()` preserves object identity, nodes stay attached, zero `innerHTML` writes, light+dark tokens + toggle round-trip, detail open preserves identity.
- File checks: 54KB <200KB, zero `innerHTML`, zero external URLs (only SVG namespace string), hover media exact, `[hidden]` rule, tabular-nums, rings.

## How to test
- Open `index.html` in a browser (double-click, no server needed).
- Click Active/Done, collapse groups, open tasks, create New task, switch theme, resize narrow to see stacked layout + drawer detail.
- Run `node --check` + `node verify.js` in this directory for headless verification.
