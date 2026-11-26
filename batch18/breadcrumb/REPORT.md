# Breadcrumb — replica report

## What was built
- `index.html` (35 KB, self-contained, no network, system fonts only) replicating the
  affectUI **Breadcrumb** component: page location trail with links, chevron/slash
  separators, and collapsed middle sections via an ellipsis (`…`) menu.
- Clean-room code: own HTML/CSS/JS from observed behaviour. No copied bundle source.
- Layout: page header (`Acme` + pills `3 agents` / trail depth / current meta + sun/moon
  toggle) → card with breadcrumb bar → rows-or-leaf body → footer with `44k / 200k`
  context bar + `acme/…` path key. Narrow screens stack (meta hidden).

## Matched original (from `demo-original.js`, verbatim)
- Full 17-node tree verbatim: labels/metas/kinds/children, e.g.
  `Acme/Workspace`, `Agents/3 agents`, `Research bot/Weekdays at 9:00`,
  `Run #4821 · Summarise Q3 support tickets and draft a fix plan for the export timeout`
  / `Finished 4 min ago · 23 tool calls`, `Run #4820…/Finished yesterday · 41 tool calls`,
  `Run #4819…/Failed on Monday · 7 tool calls`, `Run #912…/Finished 1 h ago · 48 tool calls`,
  `Run #77…/Notes for v2.14/Finished on Friday · 12 tool calls`,
  `support-handbook.md/Edited 2 days ago`, `pricing-2026.pdf/Added last week`, etc.
- Default trail `acme/agents/research/runs/r4821` (5 deep), `maxItems=4`, collapsed count
  `max(2,n)` logic → 1 collapsed (`Agents`) behind `…`, `aria-label="Breadcrumb"`,
  `aria-current="page"`, more button `Show N more crumbs` + `title` joined with ` / `,
  menu `role=menu` / `More crumbs` / `menuitem` with `--depth:min(t,3)` and branch fallback icon.
- Separators: chevron SVG `M9 6s6 4.42 6 6-6 6-6 6`, slash `/`; dots SVG and branch SVGs
  redrawn clean-room with same shapes; label cap 200 px, ellipsis + hover-only `title`
  when truncated; keyboard ArrowUp/Down/Home/End/Escape/Tab; outside `pointerdown`
  closes; resize/scroll repositions; `popover`-style fixed menu.
- Agent identity: deterministic 3×3 pixel-marks (clean-room hash, ≥5 on) with
  EXACTLY 9 `<i>` cells per agent, colours `#0190FE` (research), `#A651F0` (triage),
  `#13B3A0` (notes).

## Design tokens / themes / hard-won rules
- CSS vars for every colour. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`,
  muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg `16px`/radius `10px`/
  radius-sm `6px`, shadow soft. Dark via same tokens: `#1c1c1f/#101012/#ededed/
  #a1a1aa/#26262a/#2e2e33`. Amber waiting tokens included.
- Visible sun/moon toggle (top-right) flips `data-theme="light"|"dark"` on `<html>`,
  persisted as `bcr-theme`. Default markup `light` = original demo appearance.
- `<head>` starts with `/*noflash*/` guard (stored key → `prefers-color-scheme` →
  light) + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` +
  `<meta name="color-scheme" content="light dark">`.
- In-place updates only: DOM built once at init from pools; ticks/navigation update
  `textContent`/attrs/styles and move existing nodes. No `innerHTML` anywhere after
  (and before) init. Hover only sets `title`. Menu opens on `pointerdown`/`mousedown`
  capture. Explicit `[hidden]{display:none!important}`. SVG classes only via
  `setAttribute`. No broad `svg{display:block}` overriding hides.

## Verification (node only, in-dir)
- `node --check .main-extract.js` (script extracted from `index.html`): OK.
- `node harness.cjs` (in-dir DOM-stub, no browser): loads page script, drives 13-stop
  full navigation loop (deep trail → triage/notes/knowledge/leaf variants → back),
  asserts **visible** text (not just markup/aria), collapsed middle, menu open/close,
  chevron/slash switch, 9-cell marks, theme toggle, node identity + zero `innerHTML`:
  **ALL CHECKS PASSED** — 30 PASS lines, including:
  `theme toggle switches data-theme light -> dark (dark+light checked)`.
- Light AND dark checked: light default + stub navigation; dark via token values
  (`#1c1c1f` etc.) + functional toggle flip with visible text preserved.
- `index.html` 35062 bytes (<200 KB).

## How to test
Open `index.html` in a browser: click crumbs/rows to travel, click `…` for hidden
crumbs (keyboard navigable), switch Chevron/Slash, toggle sun/moon for dark mode,
narrow the window to see further collapsing.
