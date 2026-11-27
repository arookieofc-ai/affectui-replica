# Agent Gallery — Replica Report

## What I built
Single self-contained `./index.html` (29KB, inline CSS/JS, system fonts only) replicating affectUI `agent-gallery` (“Agents that run your playbook”).

Layout: slim gradient side panels (`--side:104px`, `--gap:14px`, `--h:560px`) with one expanding product screen in the middle (`--open:min(70cqw,880px)`). Track centers via `translateX(calc(50cqw - var(--pos)*(side+gap) - open/2))` with `container-type:inline-size`, 620ms `cubic-bezier(.65,0,.25,1)` slide, `flex-basis` expansion. Far panels desaturate (`saturate(.12)`), open panel full color. Collapsed panels show vertical `writing-mode:vertical-rl` label button; open panel shows full workspace screen. Foot shows live caption (`<b>Name.</b> Description`, `aria-live=polite`, 3-line clamp) + prev/next arrow buttons.

Screen (per agent, verbatim data): top bar (brand square, agent switch pill with gradient mark + chevron, “+ New agent”, Lena Hart avatar), hero (gradient logo, “3m ago” + sync icon), `h3` name, sub `Triggered by “{trigger}” · Owner Lena Hart`, 4 KPIs with sparklines, tabs (Runs/Tools/**Context**/Settings), “Agent context” + hint, toolbar search/filter, feed:
- compose (`Add context, e.g. “{guardrail}”` + Add context button),
- `steps[0]` card by Jonas Weber (“added context · today”),
- Mara Lindqvist “generated a Weekly summary · 1d ago”,
- Mara “added playbook.pdf + accounts.csv · 2d ago” with red/green ext chips,
- `steps[1:]` joined card by Jonas (“· 2d ago”),
- Connected Slack and HubSpot · 3d ago (gradient app dot).

Demo data used verbatim from `./demo-original.js`: all 7 items (triage/enrich/recap/churn/onboard/review/release with names, descriptions, `colors`, triggers, 3 steps each, guardrails), title `Agents that run your playbook`, subtitle `Give each agent its steps…`, static feed names (Lena Hart, Jonas Weber, Mara Lindqvist, Weekly summary, playbook.pdf, accounts.csv, Slack, HubSpot, 3m ago). KPI math replicates original hash `([...id].reduce((a,c)=>(a*31+code)%997,7))` → Runs `40+h%160`, Success `94+h%6%`, Time saved `(2+h%70/10).toFixed(1)h`, Escalated `1+h%7`; sparkline 10 pts `[n*8, 15-(n*(n+5)*7+n*3)%13]`; initials first-letters; 8 SVG icon paths (note/chart/file/plug/search/clip/sync/filter + chevron).

Interactions: click collapsed panel → `go(i)`, arrows, keyboard on viewport (ArrowRight/Left/Home/End, roving `aria-label “Agents, N of 7…”`), loop-restart snap after 660ms when `pos` leaves middle copy (sets `data-snap`, remaps `pos±count`, double-rAF clears). Reduced-motion disables transitions. Narrow `@container (max-width:760px)` shrinks to side 56px / height 400px.

Clean-room: own HTML/CSS/JS, no copy of compiled `p` CSS string; same behavior, fresh class names and tokens.

## Design tokens / themes
All colors via custom props. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg 16 / radius 10 / sm 6, shadow `0 1px 2px…,0 4px 16px…`. Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`. Toggle top-right (`#themeToggle`, sun/moon svg + Dark/Light label) switches `data-theme` on `<html>`, persists `agent-gallery-theme` in localStorage, defaults to `prefers-color-scheme`. Checked both: light finished (white cards, warm page), dark finished (dark surfaces, same amber accents, legible borders).

v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)` (5 rules), `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}` + KPI `b` tabular, concentric radius (panel 20px = screen 16px + inset + border), shadows for elevation / borders only for structure/dividers/inputs, `img` inset outline rule, arrow icons optically nudged (right-pad 0 on icon side).

v4: `/*noflash*/` script first in `<head>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name=color-scheme content="light dark">`; in-place updates only (DOM built once, ticks mutate `textContent/class/attributes/style`, never `innerHTML` after init; loop restart updates in place).

## What matches / could not verify
Matches: header, carousel centering, gradient art, vertical labels, screen sections/KPIs/feed copy, caption + arrows, keyboard, snap timing, responsive collapse, theme toggle, focus-visible.
Could not verify: pixel-exact colors/spacing vs live Pro screenshot (no browser per task), original `zoom` vs `scale` fit wrapper (`gallery-demo__frame`, stage/card contexts) — omitted as host-specific; exact `color-mix` desaturation curve approximated with `saturate()` + opacity.

## How to test
Open `./index.html` in a browser (no server needed). Click side panels / arrows, use arrow keys when viewport focused, toggle Dark/Light top-right, resize narrow to see stacked list.

Verification (node only, no browser):
- `node -e "…read ./index.html…write ./.ag-check.js" && node --check ./.ag-check.js` → CHECK_OK
- in-dir DOM-stub `./harness.js` (`node ./harness.js`) → ALL_HARNESS_CHECKS_PASSED: asserts noflash/meta/tokens/verbatim data, `window.__ag` tripled 21 panels, VISIBLE painted text (open Churn watch trigger/guardrail/steps/feed + caption), full-loop node identity (21 roots/screens/picks + caption unchanged after 7×`go`), zero `innerHTML` writes after init, light AND dark `applyTheme` with visible text, keyboard + all pick handlers.
