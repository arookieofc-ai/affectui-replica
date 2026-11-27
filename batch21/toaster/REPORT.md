# Toaster — rebuild report (2026-11-27)

## What was rebuilt
- `index.html` (24.3KB, ONE self-contained file, system fonts, no network): calm stacked notification center. Clean-room rewrite from the observed behaviour `Calm stacked notifications with hover fan-out, promise morphing, swipe dismissal` — no compiled source copied.
- Header pattern: `Launchpad` project name + `N showing` live pill + `M total` pill + sun/moon toggle top-right (`data-theme="light"|"dark"` on `<html>`).
- Stack viewport bottom-right (full-width bottom on narrow ≤560px): 4 pre-built toast cards reused as a fixed pool. Collapsed stack shows top 3 scaled/offset; hover/focus adds `.fanout` class for gaps. Hover/focus is class-toggle only, never a re-render.
- Toast types: success / promise / info / error with tinted icon wells, single-line ellipsis title/description (click expands), tabular meta line, action pill, 3px progress bar, close button.
- Promise morphing: `Uploading 12 files… (3 of 12)` → `9 of 12` → `Upload complete (12 files uploaded in 4.2s)` in the same node (text/class/attributes/style only, node identity kept).
- Swipe dismissal: `pointerdown` (capture) → move sets `translateX` + fades → release past 80px hides, else snaps back. Close buttons, `Esc` (newest first), `Dismiss all` also hide. Expand/action arming uses `pointerdown` capture so real clicks survive.
- Auto-demo loop (~9.5s/cycle, `setTimeout` chain): success → promise pending → promise progress → promise done → info + error → dismiss oldest → clear → next cycle. Manual buttons (Promise/Success/Info/Error/Replay/Auto on-off) work. `aria-live="polite"` stack + sr status announces title changes.

## Demo data / behaviour vs original
- `demo-original.js` in this directory is a 404 HTML shell (`Page not found · affectUI`), not demo JS — no verbatim names, numbers, timings, or loop could be recovered. This rebuild therefore keeps the same plausible calm-product data shape as the prior iteration (documented as invented, not from any bundle):
  - `Deploy complete / launchpad v2.4.1 is live on production / just now / View logs`
  - `Uploading 12 files… / 3 of 12 complete / 4s left` → `9 of 12 / 1s left` → `Upload complete / 12 files uploaded in 4.2s / View files`
  - `Maya mentioned you / in launch-checklist: “final copy looks calm” / 1m ago / Open`
  - `Build failed / Type error in api/routes.ts:42 / now · debate-42 / Retry`
- Timings kept: 150ms / 1300ms / 2600ms / 3600ms / 4700ms / 6800ms / 8300ms / 9500ms restart.
- No agent identities in a toaster, so no 3×3 pixel-marks were invented (spec: only if the component has agent identities; harness asserts zero `pixel-mark`).

## Spec compliance
- Tokens via CSS vars; light (`--surface:#ffffff --page:#fafaf9 --ink:#171717 --muted:#78716c --subtle:#f5f5f4 --border:#e7e5e4`) and dark (`--surface:#1c1c1f --page:#101012 --ink:#ededed --muted:#a1a1aa --subtle:#26262a --border:#2e2e33`); amber/working/success/error adjusted per theme. Radius `16/10/6px`, pills `999px`, shadows for elevation + 1px borders for structure.
- `/*noflash*/` guard is the first node in `<head>` (stored `theme` key else `prefers-color-scheme`), plus `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` and `<meta name="color-scheme" content="light dark">`. Default with no storage follows `prefers-color-scheme` (light on most machines — matches calm light toaster); toggle persists to `localStorage["theme"]`.
- In-place only: DOM built once in markup; timers update `textContent`/classes/attributes/`style` on existing nodes; 4-slot pool reused across cycles; script contains zero `innerHTML`/`outerHTML`/`insertAdjacentHTML`.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (toast 16px = icon 10px + 6px padding); elevation via layered `box-shadow`, real borders only on structure/dividers/inputs; generic `img` inset-outline rules; icon-side padding nudged by eye.
- Hard-won rules: `[hidden]{display:none!important}`; SVG classes only via `setAttribute("class",…)`; no broad `.toast svg{display:block}` trap (only `.ticon svg` / `.iconbtn svg`); hover/focus never re-renders; expands on `pointerdown` capture.

## Verification (node only, no browser)
- `node --check ./__extracted.cjs` → `CHECK_OK`; `node --check ./harness.cjs` → `HARNESS_OK`.
- `node ./harness.cjs` → **51 passed, 0 failed**, covering light AND dark:
  - static: noflash order/content, first-paint style, color-scheme meta, `[hidden]`, tap-highlight, tabular-nums, tokens, dark vars, hover-media containment, toggle + stack presence, no fake pixel-marks, 2 scripts, zero `innerHTML` statically;
  - per theme: API exposed, correct initial `data-theme`, full 10s loop shows visible text (`Deploy complete`, `Upload complete`/`Uploading 12 files`, counts `N showing / M total`, `cycle N`), zero `innerHTML` writes, static + toast nodes keep `===` identity across two full cycles, hover fan-out on/off with zero writes, toggle flips, promise morph keeps identity and shows `Upload complete`.
- Visible-text rule: assertions read `textContent` of non-`hidden` nodes only (markup/aria alone does not count).
- `index.html` 24260 bytes (<200KB).

## How to test
Open `index.html` in a browser. Click Promise/Success/Info/Error, hover the stack to fan out, drag a toast sideways to swipe, toggle sun/moon (check both light and dark), press Esc, toggle Auto-demo, resize narrow to see full-width bottom stack.
