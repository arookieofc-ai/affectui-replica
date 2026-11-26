# Model usage — replica report

## What was built
- ONE self-contained `index.html` (31KB, no network, system fonts) in this directory.
- Stacked bars per AI company (Anthropic, OpenAI, Google, xAI) with per-model segments, totals, trend pill, metric tabs (Tokens/Cost/Requests), grid lines, axis, hover tooltip with model breakdown, and tasks breakdown (Search/Analyze/Code/Test).
- Light + dark via CSS custom properties, visible sun/moon toggle top-right (`#theme-toggle`) switching `data-theme="light"|"dark"` on `<html>`. Stored key `mu-theme`, fallback `prefers-color-scheme`, default light (matches original demo appearance).
- `/*noflash*/` guard as first `<head>` script + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`.
- In-place updates only: DOM built once in `initModelUsage()`. Timers, tabs, hover/focus, loop restart update text/classes/styles/attributes on existing nodes. No `innerHTML` anywhere. Dialog/tooltip opens on `pointerdown`/`mousedown` capture + `pointerenter`/`focus`. Hover/focus never re-renders. `[hidden]{display:none}` rule present. SVG classes via `setAttribute` only.
- Clean-room code: own HTML/CSS/JS from observed behaviour. Icon `d` strings reused as functional shapes; company logos redrawn as simple originals (orange mark, knot, gradient star, X) to avoid verbatim copy. No compiled source pasted.

## Demo data / behaviour matched verbatim
- Companies/models/tokens from `demo-original.js`:
  - Anthropic: Claude Opus 5.5 1.24M, Claude Sonnet 5.5 2.18M, Claude Haiku 5.5 640k
  - OpenAI: GPT-5.5 1.52M, GPT-5.5 mini 930k, GPT-5.5 Pro 310k
  - Google: Gemini 3 Pro 820k, Gemini 3 Flash 1.16M
  - xAI: Grok 5 540k, Grok 5 Fast 420k
- Pricing $/1M: opus 15, sonnet 3, haiku .8, gpt 10, mini .6, pro 30, gpro 7, flash .4, grok 6, fast .5. Tasks fractions as in source (e.g. opus analyze .3/code .4/test .15/search .15, etc.).
- Previous `{tokens:705e4,cost:61.2,requests:2810}`, title `This week`, since `last week`, metrics `Tokens/Cost/Requests`.
- Formatting: compact `9.76M/4.06M/2.76M/1.98M/960k`, cost `$60.36` (compact `$60`), requests `3,754`, changes `+38%/-1%/+34%`, grid nice-ceiling `5M/2.5M`, `$30/$15`, `1600/800`, task pcts `40%/24%/23%/13%`, opacity steps `[1,.5,.26,.14,.08]`, company palette `[red,amber,green,blue]`.
- Loop: 14s display → 400ms fade (`data-fading`, opacity .55) → replay rise (760ms) + continue; pause on hover (`pointerenter/leave`) or focus (`contains(activeElement)` → retry 500ms); roll animation 520ms; tab stagger 60ms; keyboard Arrow/Home/End/Escape with roving tabindex; tight-values hide via ResizeObserver guard.
- No agent identities in this component, so 3×3 pixel-marks (EXACTLY 9 cells) do not apply — noted, not invented.

## QA fix — stacked bars / task fills painted nothing (2026-11-26)
- Symptom (browser QA, painted pixels): the stacked bars for all four companies
  NEVER PAINTED in either theme — the chart area showed only the 5M/2.5M/0
  gridlines and the numeric totals; the Tasks row showed only the light track
  with no fill. Hover hotspots worked (tooltip identified models), so bar
  hit-areas existed but the segments rendered nothing.
- Root cause: JS/CSS custom-property NAME MISMATCH. The stylesheet reads short
  names — `.ui-mu__stack{height:var(--h)}`,
  `.ui-mu__value{bottom:calc(var(--h) + 6px)}`,
  `.ui-mu__stack>i{background:color-mix(in srgb,var(--c) calc(var(--s)*100%),var(--card))}`,
  `.ui-mu__tip li>i` (same), `.ui-mu__task-bar>i{background:var(--k)}`,
  `.ui-mu__icon{color:var(--k);background:color-mix(...var(--k)...)}`,
  `.ui-mu__tip{left:var(--x,50%)}` — but the script wrote prefixed names
  `--ui-mu-h/--ui-mu-c/--ui-mu-s/--ui-mu-x/--ui-mu-k` (12 sites). Every one of
  those `var()` lookups resolved to unset → `height` invalid (zero-height
  stacks), `color-mix`/`background` invalid (no fill), tooltip `--x` fell back
  to the 50% default. Track (`--tag`) and grid/text still painted, exactly
  matching the report.
- Fix (index.html JS only, 12 `setProperty` names, no CSS/markup change):
  `--ui-mu-c→--c`, `--ui-mu-s→--s`, `--ui-mu-h→--h`, `--ui-mu-x→--x`,
  `--ui-mu-k→--k`. Now every stack segment PAINTS with its company colour at
  its opacity step and correct proportional flex-basis share (Anthropic
  81.2%/53.7-30.5-15.8, OpenAI 55.2%, Google 39.6%, xAI 19.2% over the 5M
  ceiling; segments sum 100%), task fills paint at 39.9/24.1/22.7/13.3%
  (sum 100%), in BOTH themes (vars are inline, theme-independent).
- Preserved: light AND dark tokens/toggle, `/*noflash*/` guard first in head,
  in-place updates only (zero innerHTML writes, node identity across loop +
  metric switch), v5 polish (both `:hover` rules remain inside
  `@media (hover:hover) and (pointer:fine)`, tap-highlight transparent,
  tabular-nums) — all re-asserted by the harness.

## Verification (node only, no browser)
- `node --check` on extracted main script: OK. `node --check` on noflash: OK. `node --check harness.js`: OK.
- In-dir stub `harness.js` loads page script with fake DOM, advances timers through full loop (14s+400ms), asserts:
  - VISIBLE text (textContent of non-hidden, non-`.sr` nodes; aria-only ignored): This week, 9.76M, 38%, since last week, Tokens/Cost/Requests, 5M/2.5M, 4.06M/2.76M/1.98M/960k, 40/24/23/13%, tooltip models on hover, $60.36/-1%/$30 after Cost, 3,754/34% after Requests.
  - Node identity: 4 column + value nodes `===` before/after full loop and after tab switch.
  - `innerHTMLWrites===0` after init.
  - Light + dark: toggle flips `data-theme`, totals/companies/tasks stay visible in both.
- Result: all harness checks passed (incl. per-segment non-zero flexBasis +
  resolved --c/--s, per-column non-zero --h + resolved --c, per-task non-zero
  fill width + resolved --k, tooltip dots --c/--s + --x in-chart, same paint
  assertions re-run under data-theme="dark").

## How to test
- `node --check` extracted script, `node ./harness.js` in this directory.
- Open `index.html` in a browser: hover/focus bars for tooltip, switch Tokens/Cost/Requests, toggle Dark/Light, resize narrow to see stacked layout, wait 14s to see fade+replay loop.

## Not verified in browser
- Pixel-perfect colours/shadows, `color-mix` rendering, real ResizeObserver tight mode, actual paint flash — checked via tokens/harness only, no browser launch per task rules.
