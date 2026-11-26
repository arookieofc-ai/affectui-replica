# Resizable — replica report

## What was built
`index.html` (26.7 KB, self-contained, no network, system fonts) replicates the
affectUI **Resizable** demo: draggable panes side-by-side or stacked, with size
limits, folding, and keyboard control.

Layout mirrors `demo-original.js` exactly:
- Outer horizontal container: **Runs** panel (`defaultSize 34, minSize 22,
  maxSize 55, collapsible`) + handle **“Resize the runs list”** (with grip) +
  main panel (`defaultSize 66, minSize 40`).
- Inner vertical container inside main: **Output** panel
  (`defaultSize 62, minSize 30`) + handle **“Resize the log”** (no grip, as in
  original) + **Log** panel (`defaultSize 38, minSize 20, collapsible`).
- Page header: `Agent workspace` + pill `1 working · 5 runs` + visible theme
  toggle (top-right). Default theme is **light**, matching the original demo’s
  light appearance (`--ui-rsz-line: #ececec`, white surface).

## Matched data / behaviour (verbatim, no generic data)
- Runs (5): `Summarize churn interviews / Running · 1m 12s / running`,
  `Draft Q3 pricing memo / Done · 3m 40s / done`,
  `Tag 214 support tickets / Done · 58s / done`,
  `Sync invoices to billing-api / Failed · 12s / failed`,
  `Weekly usage report / Done · 4m 05s / done`.
- Log (4): `14:02:07 Read 18 interview notes from /research/churn`,
  `14:02:19 Grouped quotes into 5 themes`,
  `14:02:44 Asked billing-api for plan changes in Q3`,
  `14:03:01 Writing the summary …`.
- Output: title `Summarize churn interviews` + paragraph
  `Most customers who left in Q3 did so within two weeks of a price change. …`.
- Behaviour: pointer drag with capture, `data-resizing` / `data-dragging`,
  240 ms `data-snap` transition (keyboard/double-click/Enter only),
  double-click resets to `initial`, `Home/End` to min/max,
  arrows `←/→` (horizontal, RTL-aware) and `↑/↓` (vertical) with
  `keyboardStep 5` (`Shift` ×2), `Enter` folds/unfolds collapsible neighbour,
  collapse sets `data-collapsed` + `inert` at 0, ARIA
  `role=separator tabindex=0 aria-orientation/controls/valuenow/min/max`.
- Size limits enforced (e.g. Runs capped at 55); folding requires halfway
  commitment when not animated, matching the original snap logic.
- Responsive: `matchMedia('(max-width: 700px)')` flips outer to vertical
  (stacked) in place, no rebuild.
- No agent identities in this demo, so the 3×3 pixel-mark rule is N/A
  (no dots invented). No token-count bar — not part of this demo.

## Clean-room + hard-won rules
- Own HTML/CSS/JS; did not paste the compiled bundle.
- DOM built once (static markup); timers update only
  `style.flexGrow`, attributes, and hint text in place. Zero `innerHTML`
  after init (asserted by harness + source scan).
- Handles listen on `pointerdown` capture; hover/focus never re-renders.
- `[hidden]{display:none!important}` included. No SVG `className`
  assignment (toggle is text-only).
- Design tokens as CSS vars for every colour; light + dark per spec
  (dark: surface `#1c1c1f`, page `#101012`, amber `#fbbf24` on `#451a03`).
  `/*noflash*/` guard first in `<head>` + `html{background…}` +
  `<meta name="color-scheme" content="light dark">`.

## Verification (node only, no browser)
- `node --check` on extracted page script: **OK**.
- `node verify.js` (in-dir DOM-stub harness): **ALL PASS (60 checks)**.
  Harness loads the page script in `vm` with a stub document, flushes
  snap timers through a full loop (resize → fold → max-cap → restore),
  asserts all verbatim strings are in visible nodes (not aria-only),
  asserts node identity preserved for all 6 panels/handles, zero
  `innerHTML` writes, ARIA + hint restored (`Runs 34% · Output 62%`),
  folding reaches 0, max enforced at 55.
- Light AND dark checked: toggle flips `light→dark→light`, dark CSS
  (`html[data-theme="dark"]`) present, tokens verified in both themes.

## How to test
Open `index.html` in a browser. Drag both handles, double-click to reset,
focus a handle and use arrows/`Shift`/`Home`/`End`/`Enter`. Toggle Theme
top-right; reload to confirm persistence. Narrow below 700 px to see
stacked layout.

## Not verified
- Pixel-perfect line widths vs. the original bundle (no screenshot harness).
- Real pointer-capture drag physics (stub uses synthetic deltas; manual
  browser drag recommended).
