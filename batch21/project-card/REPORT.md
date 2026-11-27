# Project Card — replica report

## What was built
- ONE self-contained `./index.html` (36 KB, <200 KB): inline CSS + JS, system fonts only, no network, no external assets.
- Clean-room implementation from observed behaviour in `./demo-original.js`; no verbatim copy of the compiled source.
- Card: tray (4px pad, radius 20px = 16px + 4px concentric) + inner card (radius 16px, `box-shadow: 0 0 0 1px line` for elevation, real borders only on dividers/selected states).
- Header pattern matches original: project name + status pill + due + people, with 32px segmented progress ring + count.
- Body: status `radiogroup` options + 5 task rows with animated check + foot caption (`aria-live=polite`) + `Open` action with arrow.

## Exact demo data (verbatim, no invented data)
- Title: `Onboarding flow`, due `Oct 24`, action `Open`, status `In progress` (`progress` / amber).
- Statuses: `To do` violet, `In progress` amber, `In review` blue, `Done` green.
- Tasks: `Welcome screen` done Mara, `Workspace setup` done Jonas, `Invite teammates` done Mara, `First-run checklist` open Priya, `Lifecycle emails` open Jonas.
- Members: `Mara`, `Jonas`, `Priya` (initials avatars with deterministic hue hash, `MAX_AVATARS=4`).
- Captions: `2 left` / `All done`, hover `Assigned to X` / `Done by X`, filter `X · N of M done`.

## Behaviour / timings (match original)
- Auto demo loop: `700ms` initial then `3400ms` interval toggling `open`; any `pointerenter` / `pointerdown` capture / `keydown` capture / `focus` capture on `#demoMount` sets `interacted` and freezes toggling (loop keeps firing but no-ops).
- Hover-to-open: `pointerenter` mouse-only `90ms` open, `pointerleave` `220ms` close; click toggle button toggles; `pointerdown` on document closes when outside; `Escape` closes status dropdown first then card and refocuses toggle.
- Ring: 5 arcs with gap `min(.055, 1/n*.35)`, radius `12.5`; `data-done` ink, `data-hot` thicker muted, `data-dim` opacity `.3` when filtered. Segment click toggles task.
- People: hover previews (`hotPerson`), click selects (`selPerson`), `aria-pressed`, `data-on` scale, `data-off` dim; task rows dim when filtered.
- Tasks: `role=checkbox` `aria-checked`, hover `data-hot` shows assignee avatar; status button `aria-expanded`, options `role=radio` `aria-checked`.
- In-place only: DOM built once via `createElement`/`createElementNS`; timers/hover/focus update `textContent`/`setAttribute`/`style` in place; **zero `innerHTML` uses** in page script; node identity preserved across full loop (asserted).
- Hard-won rules: status opens on `pointerdown` capture (real click survives); hover/focus never re-render; `[hidden]{display:none!important}` present; SVG classes via `setAttribute('class',…)` only (no `.className=`); no broad `svg{display}` beating hide (scoped `.ui-pc svg` + explicit `[hidden]` override).

## v5 polish
- All `:hover` inside `@media (hover: hover) and (pointer: fine)` (6 rules).
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}` + `.ui-pc__num` tabular for changing counts.
- Concentric radii: outer `calc(16px + 4px)`; shadows for elevation, borders for structure/selected.
- Avatar `img` 1px inset outline `rgba(0,0,0,.1)` / dark `rgba(255,255,255,.1)`.
- Optical alignment: status `0 7px 0 5px`, action `0 6px 0 8px` (icon side −2px).

## Design tokens / themes
- Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg `16px`, radius `10px`, radius-sm `6px`, shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`.
- Dark (`html[data-theme="dark"]`): surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, amber `#fbbf24` on `#451a03`-ish bg.
- Toggle top-right sun/moon (`#themeToggle`) switches `data-theme`; `/*noflash*/` guard first in `<head>` reads `project-card-theme` or `prefers-color-scheme` before paint + `html{background}` + `meta color-scheme`. Default follows original appearance (light) / `prefers-color-scheme`.
- Checked light AND dark: token contrast reviewed, dark overrides for card/tray/line/text/muted/ring/avatar/tones present (11 `html[data-theme="dark"]` blocks); no grey-on-grey.

## Targeted fix (2026-11-27, real-browser QA: 10px strip collapse)
- Defect: card painted as ~10px-wide vertical strip in BOTH themes (tray padding 4px×2 + 1px shadow×2); only fixed-width `32px` progress ring `3` and `20px` avatars `M/J/P` overflow-painted, while `Onboarding flow`, `In progress`, `Oct 24`, 5 task names, `2 left`, `Open` never painted (only thin left edges of checkboxes). DOM toggled (`data-open` on hover/ring-click) but painted width never changed, collapsed AND expanded.
- Checked `./demo-original.js`: original has same `.ui-pc{width:100%; max-width:320px; container-type:inline-size}`, so keeping those verbatim matches original; original does NOT collapse in situ because its host provides width — NOT fixed by changing original behaviour.
- Root cause: page chrome `.stage{display:flex; flex-direction:column; align-items:center}` (cross-axis `align-items:center`) makes auto-width `#demoMount` shrink-to-fit (`fit-content`); with `.ui-pc{container-type:inline-size}` size-containment the card contributes `0` intrinsic width, so `.ui-pc{width:100%}` of `0` resolves to `0` content + `8px` padding + shadow = ~10px strip. Header has no `overflow:hidden` so fixed items overflow-paint, while `flex:1; min-width:0; overflow:hidden` titles + `overflow:hidden` fold children clip to `0`. Same collapse family as `.fbk svg{display:block}` beating a hide rule: a broad chrome layout rule silently beating the card's layout rule.
- Fix (targeted, 1 rule, everything else identical): add `#demoMount{width:100%; max-width:320px}` after `.stage` in `./index.html`. Gives the card a definite containing block (`320px`, centered by `align-items:center`), so full card paints at normal width in both themes, collapsed AND expanded; preserves `container-type:inline-size` for `@container (max-width:290px)` narrowing, `/*noflash*/` guard, in-place-only updates, zero `innerHTML`, verbatim demo data.

## Verification
- `node --check ./extracted.js` → OK (main script extracted from `index.html`, 23 738 bytes, zero `innerHTML`).
- In-dir stub harness `./harness.js` (no installs): builds stub DOM, runs page script, advances fake timers `700ms → open`, `+3400ms → closed`, `+3400ms → open` (full loop), asserts visible text (`Onboarding flow`, all 5 tasks, `In progress`, `Oct 24`, `Open`, count `3`, caption `2 left`) in light AND dark, collapsed AND expanded, asserts mount `#demoMount{width:100%; max-width:320px}` + card `width:100%` + `container-type:inline-size` kept, asserts root/name/caption/task/segment identity kept + `innerHTML` writes `0` after init + toggle in place. Result: `ALL HARNESS CHECKS PASSED`.
- No browser used (per instructions); no package installs/downloads.

## How to test
- Open `./index.html` in a browser (file:// works, no server needed). Hover card to expand, click ring/tasks/people/status/`Open`, press `Escape`, toggle theme top-right, resize narrow (<290px container) and `prefers-reduced-motion`.
- Re-run: `node --check ./extracted.js && node ./harness.js` inside this directory.

## Not verified
- Pixel-perfect screenshot vs original (no browser screenshots per instructions); animation easing eyeballed from CSS values (`520ms` fold, `280ms` caption).
- Real assistive-tech announcement order beyond `aria-*` attributes.
