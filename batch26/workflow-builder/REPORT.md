# Workflow Builder — replica report

## What was built
Single self-contained `index.html` (54KB, inline CSS/JS, no external deps) replicating affectUI `workflow-builder`:
- Header path `Northwind / Customer onboarding / Main (Production)` + `Publish` + sun/moon theme toggle.
- Left palette with 4 groups (Triggers 4, Tools 5, Logic 4, Actions 5) using verbatim labels/subs/descriptions from `demo-original.js`.
- Node canvas with 7 pre-rendered nodes at verbatim positions/types/titles/descriptions/configs, dotted background, SVG cubic curves (`M x1 y1 C…`, offset `max(28,|dy|/2)`), Yes/No edge tags, per-node `+` add buttons, bottom toolbar (fit/zoom/run).
- Per-node setup panel (right): trigger source (Sign-up form / Upload form / Shared folder / Email inbox), fileMode/exts, model (Auto/Fast/Reasoning), instructions, tools (CRM lookup, Web search, Send email, Calculator), method (GET/POST/PUT/DELETE)/URL, branch condition, table/operation, channel/message, display name, connections list, example JSON output. Edits mutate node in place.
- Live run: `Run` computes steps from first active trigger following `yes` for Branch → `n1,n3,n4,n5,n6` (Pro plan), highlights nodes `running → done` with verbatim timings (`signup 11ms/.1, agent 1420ms/2.4, http 318ms/.5, branch 2ms/0, notify 204ms/.2, database 38ms/.3`), lights edges, updates Runs/Timeline/Payload/Triggers/Errors panes in place, announces via `aria-live`.
- Payload verbatim: `Ada Brooks <ada@brightline.io> brightline.io, plan Pro seats 12, 2026-11-05T09:41:12.084Z`.

## Matches original
Layout/cards (272×110, 12px padding, 16/10/6 radii, 1px border + soft shadow), kind colors (trigger blue, agent violet, tool gray, logic amber, action green), chip/mono/well structure, edge curves/tags, palette groups, settings fields, run tabs, toolbar, keyboard (Enter opens, Esc closes, Tab focus-visible), narrow stacking.

## Clean-room / in-place
No copied source. DOM built once at init (nodes/edges/palette/run rows pre-rendered, JS adopts via `nodeEls` Map). Ticks update only `textContent`, `data-run`, `data-selected`, `data-tone`, `d`, `style` on changed nodes. Zero `innerHTML`/`outerHTML`/`insertAdjacentHTML` in JS (verified). Node identity preserved across full loop.

## v5 polish
All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (outer 16 / well 13); shadows for elevation, borders for structure; code outline 10% black/white; optical nudge on `+` buttons.

## No-flash / themes
`<head>` starts with `/*noflash*/` script (reads `wf-theme` or `prefers-color-scheme` → `data-theme` before paint) + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `meta color-scheme`. Tokens via CSS vars for light (`#ffffff/#fafaf9/#171717/#78716c/#f5f5f4/#e7e5e4`) and dark (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`, amber `#fbbf24` on `#451a03`). Toggle overrides storage. Checked both: text legible, borders visible, no grey-on-grey.

## What could not be verified
No browser (per instructions). Pan/zoom/drag, exact icon SVGs (used unicode glyphs), picker search, comments/pins, undo, toasts beyond stub, pixel-perfect spacing vs original screenshots. Demo branch fixed to `Main/Production`; `Staging/enrich-v2` switching not implemented.

## How to test
Open `index.html` in a browser (double-click, no server). Click nodes → settings edits live. Press `▶ Run` → watch `New signup → Classify customer → Enrich company → Branch → Notify team` light up; check Runs/Timeline tabs. Toggle `◐/☾` top-right for light/dark. Narrow window <760px for stacked layout.

## Verification (node only, in-dir)
- `node --check` on extracted app JS → OK
- `node ./harness.js` (DOM stub) → ALL PASSED: visible painted text (21 strings + runtime), full-loop chain `n1,n3,n4,n5,n6` with same element identity, zero innerHTML writes, light AND dark themes with visible text.
