# Team Invite — replica report

## What was built
ONE self-contained `index.html` (no network, no external assets, system fonts only) replicating the **Team Invite** affectUI component: connected teammates; a cursor drags a new member into an empty slot, the dashed link solidifies, the member comes online. Clean-room implementation — own class names, markup, CSS and JS written from the observed behaviour in `demo-original.js`; no verbatim copy of the compiled source (only geometry/data values such as path `d` strings, timings and names were reused as data).

Page structure:
- Top bar follows the v3 header pattern: project name (`product-team · Team Invite`) plus live counts (`2 connected · 1 inviting · 3 teammates`) and a visible sun/moon theme toggle.
- Stage card: 600×400 SVG line layer (solid + dashed + joining paths, gradient ids), empty slot circle (290,245 r40) with plus mark, two fixed nodes (Mara at 120,159 · Jonas at 300,105, both online) and a dragged group starting at (456,281) carried by translate(−166,−36) to the slot, with lift/scale, green online-dot pop and cursor press/drift choreography on a **4.4s** loop with the original phase map (rest 0–12%, pick-up 12–16%, carry 16–42%, drop 42–48%, link draws 48–54%, release by 62%, hold to 88%, fade/reset 88–100%).
- Visible status line (`role="status"`, aria-live polite) narrating the loop in place, a thin 3px loop progress bar with right-aligned `0.0s / 4.4s loop` label (tabular numerals), a 3-person roster with deterministic 3×3 pixel-marks, Replay / Pause controls, and reduced-motion support (still frame, dot visible).

## Matched data / behaviour (verbatim from demo-original.js)
- Avatars/names: **Mara, Jonas, Sofia** (photo `src`s replaced by initial faces — no external assets allowed — with per-agent hues).
- aria-label kept verbatim: “Mara and Jonas are connected; Sofia is dragged into the empty slot and joins the team”.
- Geometry verbatim: solid `M162 159C214 159 222 105 258 105`; dashed/joined `M162 159C214 165 214 245 248 245` (joined with `pathLength="1"`); slot `cx290 cy245 r40`, plus `M290 234v22M279 245h22`; cursor path + `rotate(21.37)` transform; node/drag coordinates above; `--loop 4.4s`, ease `cubic-bezier(0.7,0,0.25,1)`; line `#e4e7ec`, plus `#c4c4c4`, online `#34c46a`, ring `#e2f6e9`, cursor `#141b34`, bubble/face/shadow values; dark variants from the original (`#232326` bubble, `rgba(255,255,255,.14)` lines, `#3fd17a` online, etc.).
- Default theme = the original demo appearance: **light**.

## Spec compliance notes
- Design tokens as CSS custom properties for every colour; light tokens (`surface #ffffff, page #fafaf9, ink #171717, muted #78716c, subtle #f5f5f4, border #e7e5e4, radius 16/10/6, shadow …`) and dark tokens (`surface #1c1c1f, page #101012, ink #ededed, muted #a1a1aa, subtle #26262a, border #2e2e33`), amber/green statuses adjusted per theme.
- `/*noflash*/` guard first in `<head>`: reads storage key `team-invite-theme`, falls back to `prefers-color-scheme`, sets `data-theme` before paint; inline `html{background}` for both themes + `<meta name="color-scheme" content="light dark">`.
- Agent identity: one deterministic coloured **3×3 pixel-mark per agent (exactly 9 `<i>` cells each, 3 marks / 27 cells total)** in the roster; stage nodes keep initial faces + green online dots. No grey-on-grey; borders kept on dividers/cells/inputs, shadows for elevation; faces get a 1px inset outline (black 10% light / white 10% dark); button icons optically aligned (icon side ~2px less padding); concentric radii (`stage-wrap` radius = inner radius + padding).
- v5 polish: every `:hover` lives inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}` for the changing loop timer.
- In-place updates only: the DOM is built once (static markup + one init); the 100ms tick updates only `textContent` (status, pill, role, time label), `class` via `setAttribute`, `style.width` and `data-phase` on existing nodes. The page script contains **zero** `innerHTML` uses and never assigns `.className` (SVG-safe). Hover/focus trigger no re-render; no dialogs/popovers (pointerdown-capture rule N/A — noted); explicit `[hidden]{display:none!important}` included.

## Verification (node only, no browser launched)
- `node --check` on the extracted app script: **passed** (also noflash script extracted cleanly).
- In-directory DOM-stub harness (temporary file, removed after run): loaded the page script in `vm`, stepped `tick()` through a full 4.4s+ loop in 100ms increments and asserted:
  - visible status text across the loop contains Mara, Jonas, Sofia, “connected”, “Dragging”, “empty slot”, “solidifies”, “joins”, “online” (computed `textContent`, not markup/aria);
  - Sofia pill transitions `joining… → online`; role line updates;
  - same node objects (`status`, `pill`, `fill`) at loop start/end — **object identity preserved**;
  - **zero `innerHTML` writes** after init (instrumented setter);
  - 3 pixel-marks × exactly 9 cells;
  - theme toggle flips `light → dark → light` and persists to `team-invite-theme`; dark token block present.
  - Result: **46/46 checks passed — VERIFY PASSED (light + dark)**.
- File size: `index.html` ≈ 15KB (limit 200KB). No packages installed or downloaded.

## How to test
Open `index.html` in a browser. Watch the 4.4s invite loop, the status narration, Sofia’s pill flipping to “online”, and the progress label. Toggle Dark/Light (top-right), try Replay/Pause, narrow the window (roster stacks), and test `prefers-reduced-motion` for the still frame.
