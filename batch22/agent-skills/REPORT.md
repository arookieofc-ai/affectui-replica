# Agent / Skills — replica report

## What was built
- ONE self-contained `index.html` (59KB, no network, system fonts only) replicating the affectUI **Agent Skills** screen from `demo-original.js`.
- Layout: workspace header (Fieldwork · Pro · Personal + installed count + theme toggle), component head (Skills + search + New skill), category chips, Installed / Discover tile grids, sticky detail panel, New-skill modal, polite live region.
- Clean-room code: no copied bundle CSS/JS, all DOM via `createElement`/`textContent`, zero `innerHTML` writes.

## Matched data (verbatim from demo-original.js)
- 15 skills with exact names/descriptions/categories/tones/sources: Brand voice, Weekly report, Meeting notes, Deep research, Competitor watch (@lena v2.1 2840), Code review, Release notes (yours v0.9), Spreadsheet analysis, Chart maker (@mika v1.2 5120), PDF forms (@sam 8410), Translate & localize (12900), Slide deck (10300), Invoice extraction (@jo 3360), Interview synthesis (@nora 1980), Notes to tasks (7600).
- All triggers/steps/needs/usedIn verbatim, e.g. Brand voice triggers `Write this in our voice`, steps `Reads the brand guide in Drive`, needs `Read files in Google Drive`, usedIn `Weekly update @40min`, `Onboarding emails @180min`; weekly `2*V` (2 days), research/scan `1560min`, review `95min`+`2d`, release `4d`, sheets `300min`, charts `310min`.
- Labels verbatim: Skills/Installed/Discover/Search skills/New skill/Install/Installing/Installed/Remove/On/Off/Turn on/Turn off/Built-in/Yours/Community/this week/Steps in when you say/What it does/What it needs/Ran lately/Not used yet/Permissions/Nothing open/Pick a skill…/No skill matches/Try other words…/No skills yet/Describe…/You have them all/Every skill…/Clear search/All/Runs/2 weeks ago/Today/Categories/`Skills others use – add one…`.
- Ideas verbatim: `Summarise every sales call into the CRM`, `Turn bug reports into issues with steps to reproduce`, `Write LinkedIn posts in our voice`.
- Timings: install `pe=1400ms` + `800ms` done→move + `1200ms` fresh clear + `30ms` scroll/live; writing `1600ms`; live announcements `30ms`.
- Relative time: just now / minutes / hours / days; compact installs (`2.8K use it`); deterministic 14-bar chart from id hash; nice y-axis.

## Matched behaviour
- Default selected `voice` (Brand voice); search filters name+desc+category+author; category tabs All/Writing/Research/Engineering/Data/Documents.
- Toggle On/Off in place with live `Name: On/Off`; Remove → discover; Install → Installing (ring) → Installed → moves to Installed + fresh glow + scrollIntoView.
- Detail panel updates in place (icon/title/sub/desc/acts/runs-chart/triggers/steps/needs/usedIn), `Not used yet` when empty, permissions link.
- Modal: 4 ways (Describe/Write yourself/Upload/Browse), focus first button, Esc closes, Back returns to choose, Browse focuses first discover card, Create slugifies unique id, appends card in place.
- Keyboard: `/` focuses search, `j/k` + arrows move between cards, `Esc` clears/closes.
- IN-PLACE ONLY: DOM built once at init; timers/search/toggle/select update `textContent`/attrs/classes/styles on existing nodes; `querySelectorAll("[data-skill]")` nodes keep identity; no `innerHTML` after init.
- Hard rules: dialogs open on `pointerdown` capture; hover/focus CSS-only; `[hidden]{display:none}` explicit; SVG ring class via `setAttribute`; no broad `svg{display:block}` rule.

## Design tokens / v5 polish
- CSS vars for all colours; light `surface #ffffff/page #fafaf9/ink #1c1917/muted #78716c/subtle #f5f5f4/border #e7e5e4` + dark `surface #1c1c1f/page #101012/ink #ededed/muted #a1a1aa/subtle #26262a/border #2e2e33`; amber waiting kept (`#fef3c7/#92400e` light, `#451a03/#fde68a` dark).
- `/*noflash*/` guard + `html{background}` + `meta color-scheme` in `<head>`; default `data-theme="light"` (original appearance), stored key `agent-skills-theme`, falls back to `prefers-color-scheme`.
- Visible sun/moon toggle top-right switches `data-theme`.
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (outer 16 = inner 10 + padding); shadows for elevation, borders/dividers for structure; image outline 10% black/white; pixel-mark 3×3 with EXACTLY 9 `<i>` cells, delays `[0,120,240,120,240,360,240,360,480]`, pattern `[1,0,1,1,1,1,1,0,1]`.
- Responsive: 2-col → 1-col, tiles auto-fill → single column under 560px.

## Verification (node only, no browser)
- `node --check` on extracted main script: PASS; noflash script: PASS.
- `node harness.js` (in-dir DOM stub, no packages): loads page script, advances timers through full loop (search→category→toggle→install 1400+800+1200→select→modal data), asserts VISIBLE text (all 15 names, descriptions, triggers/steps/needs/usedIn, labels) and state, asserts unchanged card/panel nodes keep object identity and `innerHTML` writes = 0 after init and after full loop: **ALL PASSED**.
- Light AND dark checked: harness sets `data-theme="dark"`/`"light"` and verifies toggle; CSS contains both token sets; manual token contrast reviewed (no grey-on-grey, waiting amber adjusted for dark).

## How to test
- Open `index.html` in a browser (double-click). Try: search `pdf`, chip `Data`, toggle Meeting notes, Install PDF forms (watch 1.4s ring → Installed → moves), select Code review, New skill → Describe it → idea → Write the skill → Create skill, toggle theme (top-right).
