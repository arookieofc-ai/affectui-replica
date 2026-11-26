# Agent / Memory — replica REPORT

## What was built
ONE self-contained `index.html` (44 KB, no network, system fonts) replicating the **Agent / Memory** screen: grouped agent memories with sources and usage; recalled items highlight, new ones await approval.

Layout: page top (`Fieldwork · Pro · Personal · Agent Memory` + visible sun/moon toggle, top-right) → component card `Memory [11]` → `Saved | To review [2]` tabs → search → `Remember` button → composer (textarea + Applies-to select + Remember) → master/detail (`@about / Northwind / Platform / Evalkit` groups left, detail right with Applies to / Learned / Used / Where it came from / Where it was used / Forget–Keep–Don't keep) → Undo toast (5 s) → polite live region. Narrow screens stack; source column hides ≤860 px, uses hide ≤520 px.

## Matched data / behaviour (verbatim from demo-original.js)
- 13 memories with exact texts, incl. `Lead with the decision, then the reasons – three lines or fewer`, `Works from Vienna – times in CET, nothing booked before 9:00`, `Nothing goes out to clients on a Friday afternoon`, `Prices in euros with the sign after the number: 1 240 €`, `Writes in British English – colour, organise, analyse`, `Priya Shah signs off on anything that reaches Northwind's customers`, `Order events are JSON with a version field`, `Their team opens the dashboard at 8:30 – the numbers are ready by 8:00`, `Staging gets a deploy only once every test passes – no skipping, not even for a hotfix`, `Two clients still call API v1 – write to them before anything changes`, `Scores show one decimal – 87.4, never 87.38`, `Wants a line in the Thread whenever staging is up` (review), `Priya is away until Nov 17 – her questions go to Tom Becker meanwhile` (review).
- All quotes/questions/files (`Just tell me what you'd pick first…`, `Not on a Friday afternoon – Monday at 9:00.`, `writing-style.md`, `v1-traffic.csv`, …), uses counts (34/12/6/9/21/8/5/3/14/2/4), offsets via `Date.now()-min*60000` with `S=1440`, short (`now/5m/3h`) + long (`just now/5 minutes ago/…`) relative times, `once/twice/N times` strings, all label strings (`To review`, `Where it came from`, `Where it was used`, `It picked this up on its own and won't use it until you keep it`, …).
- Behaviour/timings: default tab `saved`, default selected `friday`, recall loop every **3200 ms** cycling the 6 verbatim events (`tests→short→priya→british→friday→events` with their task/how), recall sheen **1600 ms**, fresh glide **380 ms**, Undo toast **5000 ms**, relative-time refresh **30 s**, search filter, collapsible groups, select/keep (`Kept – it uses this from now on`)/forget (`Forgotten`)/drop (`Not kept`)/undo, Remember composer (validates `Write what it should remember first`), keyboard (`n` new, `/` search, `j/k` move, `Enter` open, `Delete` forget, `Esc` close).
- Clean-room code: own HTML/CSS/JS, source icons as inline SVG (thread/decision/you/file/sparkle/search/plus/sun/moon), no copied bundle.

## Deliberate non-matches
- No 3×3 pixel-marks: Memory has **no agent identities** (sources only), so the "EXACTLY 9 cells if agent identities" rule is vacuously satisfied — adding marks would invent data.
- No token bar (`44k/200k`): Memory original has none; omitted to avoid invented UI. Header matched to Memory's real header (`Memory + saved count + tabs`), not the Crew project/working/agent pattern (v3 crew-specific).
- Scope picker is a native `<select>` (same options: Everywhere + projects) — avoids custom popover focus bugs while preserving behaviour.

## v5 polish + hard rules
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (card 16 → inner 10/8 with 6–8 px padding); shadows for elevation (`--shadow`/`--card-shadow`) vs borders for structure (dividers, rows selected, inputs); `img{outline:1px solid rgba(0,0,0,.1)}` + dark variant; icon buttons optically aligned (icon side ~2 px less padding).
- `[hidden]{display:none!important}`; SVG classes only via `setAttribute('class',…)`; no broad `.x svg{display:block}`; scope select arms `pointerdown` capture; hover/focus never re-render; DOM built once, ticks patch `textContent`/attrs in place, never `innerHTML` (zero occurrences in page script).

## Verification (node only, no browser)
- `node --check page.script.js` (extracted from `index.html`): **CHECK_OK**.
- In-dir stub `harness.cjs` (`node ./harness.cjs`): builds fake DOM, loads page script, advances **full 6-step loop**, asserts **visible** text (skips `hidden` + `.sr`), node identity, zero `innerHTML` writes:
  - `PASS … ALL CHECKS PASSED (light AND dark checked)` — saved=11, review=2, selected=friday; visible verbatim texts; detail sections visible; identity preserved across loop; uses increment (`tests 14→15`); review tab shows the 2 awaiting-approval items; `data-theme` toggles light↔dark; design tokens + noflash + color-scheme + hover-gate + tap-highlight + tabular-nums present; size 44 KB.
- Light AND dark checked: token sets verified in CSS (`#ffffff/#fafaf9` vs `#1c1c1f/#101012`, amber `#92400e/#fef3c7` vs `#fde68a/#451a03`) + harness sets `data-theme=dark/light`; toggle button flips theme and persists to `localStorage` (`affectui-agent-memory-theme`).

## How to test
Open `index.html` in a browser. Click tabs/search/Remember, Keep/Don't keep/Forget/Undo, toggle sun/moon, resize narrow. Watch a row flash every 3.2 s with its `×` count + time updating in place.
