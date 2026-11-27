# Agent Org Chart — Replica Report

## What was built
`index.html` (37.9KB, single self-contained file, inline CSS+JS, system fonts, no network) in this directory. Clean-room vanilla JS replica of the Pro `agent-org-chart` demo. No copied bundle code.

Layout: top bar (`Operations` + waiting badge + `3 people · 4/5 working` + sun/moon toggle), tree chart (Lena → Noah/Mara → Triage/Refunds, Code review → Test runner/Docs writer), SVG edge overlay, absolutely-positioned details popover (max 284px), polite live region.

## Design tokens / themes
- CSS vars for every colour. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radii 16/10/6, shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`, waiting `#f59e0b`/`#fef3c7`/`#92400e`.
- Dark (`html[data-theme="dark"]`): surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, amber `#fbbf24` on `#451a03`/`#fde68a`.
- Toggle top-right switches `data-theme` on `<html>`, persists to `localStorage aoc-theme`. Default = original demo appearance (light); `/*noflash*/` guard in `<head>` reads stored key else `prefers-color-scheme` before paint + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`.
- Font system sans, base 14px, titles 15px semibold, meta 12/11.5px muted, pills `999px`, cards 1px border + soft shadow, hover lift, focus-visible outline, 160ms transitions.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)` (5 rules), `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (card 10px outer / top/foot 9px inner +1px border), shadows for elevation / borders for structure, avatar `inset 0 0 0 1px` black/white 10%, arrow `→` optically nudged (right padding 2px).
- `[hidden]{display:none!important}`, SVG classes only via `setAttribute`, no broad `svg{display:block}` override.

## Exact demo data (verbatim from demo-original.js + findings.md)
- `lena` person Lena Hoffmann / Operations lead
- `noah` person Noah Bennett / Support lead / parent lena
- `mara` person Mara Lindqvist / Engineering lead / parent lena
- `triage` agent Haiku 4.5 / parent noah / `Sorting 38 new tickets by urgency` / Linear, Slack, Notion
- `refunds` agent Sonnet 4.5 / parent noah / `Order #48213 – charged twice` / Stripe, Slack
- `review` agent GPT-5 / parent mara / `Reviewing PR #482 – checkout rounding` / GitHub, Linear, Vercel, Slack
- `tests` agent Gemini 2.5 / parent review / `Running 214 tests on PR #482` / GitHub Actions, Vercel preview
- `docs` agent Sonnet 4.5 / parent review / `Changelog for v2.4` / Notion, Figma, GitHub
- Initial: triage/refunds/review/tests `working`, docs `idle`.
- Loop 18.6s: 1600ms add e1 `Refund €640 for order #48213?` from refunds → 3400ms docs→working → 2800ms add e2 `One flaky test – rerun or skip?` from tests → 4200ms drop e1 → 3200ms drop e2 + docs/triage→idle → 3400ms reset. Title `Operations`. Reduced-motion: no auto-loop, e1 present initially.
- Avatars: original `/avatars/*.jpg` would need network; replaced with initials circles offline (fallback logic retained in code comment). No external fetch.

## Matched behaviour
- Tree dedup/cycle-break, DFS order, depth levels, agent-with-escalation forced `waiting`.
- Target = nearest person ancestor (e1→Noah, e2→Mara via review), approve/reply removes escalation + sets agent `working`.
- Header rolling counts, waiting badge, 3×3 deterministic pixel-marks (hash of id, ≥5/9 lit, 120ms staggered delays, twinkle when working, exactly 9 `<i>` cells), overlapping circular tool tiles +N, Working shimmer / Waiting amber pill / Idle faint, person foot `Owns N agents`/`Leads N people` or `X asks →`, amber ring pulse on waiting.
- Hover/focus chain: ancestors `data-on`, others `data-dim` (0.78 for legibility), edges highlight, no re-render.
- Dialog on `pointerdown` capture (+ click fallback, Enter/Space), outside `pointerdown` capture closes, Escape closes, focus to Approve when request present, clamped above/below, facts/uses/owned/requests + Reply/Approve in place.
- Keyboard tree: arrows (Up=parent, Down=first child, Left/Right=siblings, list mode swapped), Home/End, roving tabindex, aria level/setsize/posinset/expanded/selected/label.
- Responsive: `<560px` list mode, SVG hidden, stacked cards.
- IN-PLACE ONLY: DOM built once at init (`buildTree`), timers/hover/dialog update `textContent`/attributes/styles on existing nodes, zero `innerHTML` (verified), node identity preserved.

## Verification (node only, no browser)
- `node --check` on extracted main script: OK.
- In-dir stub `harness.cjs` (`node harness.cjs`): loads page script with fake DOM, mocks timers, advances full 6-step loop, asserts visible text (not aria-only), state, 9-cell marks, identity, zero innerHTML. All pass light AND dark:
  - noflash/meta/bg/[hidden]/tap-highlight/tabular-nums/hover-scoped/no-innerHTML/size<200KB/offline/system-fonts
  - visible `Operations`, all 8 names, `Haiku 4.5`/`Sonnet 4.5`/`GPT-5`/`Gemini 2.5`, roles, `3 people`, `working`
  - 8 cards, agent marks exactly 9 cells, zero innerHTML at init
  - loop e1→waiting, docs→working, e2→waiting, drop/restore, reset; badge `waiting` visible
  - identity `===` across loop, hover in-place, dialog `Refunds`+`Approve`+`Reply`, resolve→`working`, dark theme visible
- Checked dark by setting `data-theme="dark"` + `sync()` and re-asserting visible text.

## How to test
Open `index.html` in a browser. Wait ~18s to see e1/e2 appear/resolve, header counts change, Docs/Triage idle. Hover cards to see chain highlight, click/Enter to open details, Reply/Approve to resolve. Toggle ☾/☀ top-right, reload to confirm no white flash. `node harness.cjs` re-runs headless checks.
