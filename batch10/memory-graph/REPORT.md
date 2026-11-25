# memory-graph — replica report

## What was built
`index.html` (47.7 KB, single self-contained file, no network, system fonts) replicates the
affectUI Pro `memory-graph` component: a graph view of an agent's memory — one agent card
wired to memory nodes (left/center) and tool nodes (right) with SVG bezier links, plus
click-to-open detail cards.

- Header bar: exact original title **"What Assistant knows and can reach"** + live summary
  ("4 memories · 5 tools", "Nothing remembered yet" when empty).
- Agent card: deterministic **3x3 pixel-mark** for id `assistant` (exactly 9 `<i>` cells,
  ≥5 on, per-cell twinkle delays when busy), name, live status line
  ("Using X" / "Recalling N memories" / "Learning…" / "Personal assistant"), circular
  tool-initial dots (highlight ring = in use).
- Memory nodes: text (single-line ellipsis), source/tag sub-line, file badge + artifact
  name; outdated nodes dimmed (opacity 0.78, still ≥0.75), recalled nodes hot-ringed.
- Tool nodes: logo dot + name + right-aligned "when" ("In use" live / "42m ago" / "Off"
  / "2d ago"), access · scope line, note/calls sub-line.
- Wires: agent→memory, memory→memory (related `p5↔p1`, replaces `p4→p1`), memory→tool
  (via). Active wires animate (dash flow); outdated dashed grey. Recomputed only on
  render/resize, never in a tick loop.
- Detail cards open on **click** (matching the original's `onClick` on each node;
  the card itself is `role="dialog"` with an `aria-label` of the node name, like the
  original's `popover="manual"` + `role="dialog"` card). A prior version opened on
  `pointerdown`+`mousedown` capture with toggle logic, which meant a real mouse click
  fired open-then-instant-close and keyboard Enter (which only emits `click`) did
  nothing — exactly the reported QA failure. `Enter`/`Space` on a focused node now
  open the same card (with `preventDefault` so the button's synthetic click does not
  double-toggle). Clicks inside the card are ignored by the stage handler so
  switches, Forget, file drop/browse and connect-a-tool all work; outside
  `pointerdown` and `Esc` close (Esc refocuses the anchor).
- Hover highlights linked nodes; ←/→ arrows move focus between columns; Esc closes.
  `aria-live` announces status; `prefers-reduced-motion` disables animation.
- Loops on the exact original schedule and resets with a fade (deferred while hovered,
  focused, or a card is open).

## Original data used (from `demo-original.js`, no invention)
- Tools: GitHub (Read & write, lumen/web, 42m, 318 calls, "Opened PR #482"), Linear
  (Read, Redesign, 3h, 96, "Listed the redesign issues"), Notion (Read, Design wiki,
  26h, 71, "Read the standup notes"), Figma (Read, Lumen files, 5h, 44,
  "Looked at the latest drafts"), Vercel (Deploy, Previews, ~2d, 23, "Deployed a preview").
- Catalog: Slack, Gmail, Google Drive ("Just connected").
- Memories: "Prefers short answers" (Preference, Chat · Feedback, Sep 5, 63×),
  "Product designer at Lumen" (maya-cv.pdf, Sep 2, 41×),
  "Redesign ships Dec 4" (kickoff-notes.docx via notion, Oct 6, 17×),
  "Q4 design budget €48k" (budget-q4.xlsx, related p1, Oct 28, 5×).
- Timeline (ms): 900 use linear/recall f1 · 3000 idle · 3600 use figma ·
  4700 learn "Likes dark mockups" (redesign-drafts.fig, Nov 15) · 5600 idle ·
  7200 use notion · 8300 learn "Redesign ships Dec 11" (standup-nov-14.md, replaces p1,
  related p5, Lea moved it) · 9200 idle · 11400 use github/recall p4+p5 · 14200 idle ·
  17500 fade + reset.
- The 10 timeline steps above ARE the auto-replay loop sequence itself (the
  original's `R` array + 17500 ms reset): the original demo has no separate timeline
  scrubber/control UI, so none was added.

## Interactions
Hover-link highlight, click/Enter/Space detail cards, memory on/off + tool
allow-access switches, Forget, file drop/browse, connect-a-tool, theme toggle
(persisted, defaults to `prefers-color-scheme`), keyboard (←/→/Esc), responsive
stack under 820 px (wires hidden, list mode).

## Token audit
All colours via CSS custom properties. Light: surface `#ffffff`, page `#fafaf9`,
ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`,
radius-lg `16px`, radius `10px`, radius-sm `6px`, soft shadow; amber `#f59e0b` on
`#fef3c7` / `#92400e`. Dark (`data-theme="dark"`): surface `#1c1c1f`, page `#101012`,
ink `#ededed`, muted `#a1a1a6`, subtle `#26262a`, border `#2e2e33`, amber `#fbbf24`
on `#451a03` / `#fde68a`. Pixel-mark blues constant both themes.

## Contrast results (all ≥ 4.5:1)
Light — ink/surface 17.93, muted/surface 4.80, accent/surface 6.22, amber 6.37,
chip-text/subtle 5.76 (via 80/20 muted/ink mix). Dark — ink/surface 14.52,
muted/surface 7.42, muted/subtle 5.88, accent/surface 8.14, amber 12.03, chip 6.99.
Checked in both themes; borders never carry meaning alone.

## Verification
- `node --check` on the extracted page script: passes.
- Real headless run: `node verify-harness.js` (DOM-stub harness kept in this
  directory, now with bubbling click events) boots the actual page script, advances
  virtual timers through the full 17.5 s loop and asserts **61 checks pass**: node
  counts, exact texts, all 10 timeline steps, outdated marking, wire drawing + hot
  state, **click opens a `role="dialog"` memory card** with detail/`Used 63×`/
  `Learned Sep 5` and `aria-expanded=true`, **Enter opens the same card**, Space/click
  open the tool card (scope `lumen/web`, `Allow access`), click opens the agent card
  (file drop + `Connect a tool`, connecting adds a tool), **card switches toggle
  off/on** (a previously inverted toggle that never flipped state is fixed),
  **Forget removes the memory and closes the card**, Escape close, theme toggle both
  ways, loop reset restoring 4 memories + 5 tools, pixel-mark exactly 9 cells and
  deterministic. (One harness ordering fix was needed: hot-wire assertion must run
  at t=11400 while active, not at idle t=14200.)

## What could not be verified
Pixel-exact match to the original (no screenshot of the original available); file-type
glyphs are simplified letter badges instead of the original brand SVGs (clean-room);
brand dot colours for Notion/Vercel use neutral black per original logo colour.

## How to test
Open `index.html` in a browser. Watch the 17.5 s replay, hover memories, click nodes,
toggle ☾/☀ (top-right), narrow the window below 820 px.
