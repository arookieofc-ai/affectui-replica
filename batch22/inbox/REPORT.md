# REPORT — affectUI Agent / Inbox replica (slug: inbox)

## What was built
- `index.html` (self-contained, ~29KB, no external deps, system fonts only): a standalone
  interactive replica of the affectUI **Agent / Inbox** screen — a one-at-a-time orchestrator
  question queue with options, approval, keyboard submission, and next-question flow.
- Layout: top header bar (project name + waiting count + agent count, context token label with
  thin 3px bar, sun/moon theme toggle) + two columns: left "Up next — queue" list (5 rows with
  deterministic 3×3 pixel-marks, single-line ellipsis titles, working/queued/done status pills),
  right "Now answering" card (agent identity + model + kind, question title, detail, circular
  tool icons, up to 4 selectable options, optional note textarea, Approve / Submit / Skip /
  Reject actions, progress dots + `n of 5` + elapsed-seconds ticker + resolution line).
- Interactions: click options or keys `1–4`, `↑/↓` to move, `Enter` or `⌘/Ctrl+⏎` to submit,
  `A` approve, `X` reject, `S`/`N` skip, click any unanswered queue row to jump to it,
  auto-advance after each verdict, "Inbox zero" summary with Restart that loops the same queue.
- Clean-room: all HTML/CSS/JS written from the public description. No compiled source copied;
  no `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere in the page script.

## What matches the original / spec
- Design tokens via CSS custom properties (light + dark sets from the spec), 14px system sans,
  15–16px semibold titles, 12–13px muted meta, 12–16px card padding, 8–12px gaps, 999px pills,
  16/10/6px radii, 1px borders + soft shadows, hover lift, focus-visible outlines, 150–200ms
  transitions.
- v3: header shows project + waiting count + agent count; context as token counts (`44k / 200k`
  style) with thin 3px right-aligned bar; deterministic 3×3 pixel-mark per agent id with
  pulse on the working agent; tools as small circular icons; dimmed rows stay legible
  (opacity ≥ 0.75); titles/model rows single-line ellipsis; reserved column-heading space.
- v4: `/*noflash*/` guard first in `<head>` (stored theme key → `data-theme` before paint,
  `html{background:#fafaf9}` / dark `#101012`, `color-scheme: light dark`); DOM built once at
  init, all ticks/answers/loop-restarts update nodes in place (text/class/style only).
- v5: all `:hover` rules inside `@media (hover: hover) and (pointer: fine)`;
  `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`;
  concentric outer/inner radii; shadow-for-elevation + border-for-structure split; 1px inset
  outline on pixel-marks/tool dots via `--img-outline`; icon buttons get ~2px less padding
  on the icon side.
- Responsive: columns stack under 860px; context block and long sub-labels hide on narrow.

## Demo data note (important)
- `./demo-original.js` is a placeholder noting the dispatched demo chunk 404'd — no verbatim
  demo data existed. Per the spec I authored **plausible same-shape data**: 5 orchestrator
  questions (`planner-01`, `researcher-02`, `coder-03`, `writer-04`, `ops-05`) each with agent,
  model, kind (approval/question), title, detail, 3–4 options, tool codes, token counts and age.

## What could not be verified
- No live original to pixel-compare (chunk 404 + no browser allowed in this environment), so
  exact spacing/wording match is best-effort from the public description.
- Real-browser paint, keyboard focus rings, and `prefers-color-scheme` auto-default were not
  exercised — only the node DOM-stub harness below plus static checks.

## How to test
1. Open `index.html` in any browser (double-click or `python3 -m http.server` + visit it).
2. Click options / type a note / press `1–4`, `Enter`, `A`, `S`; answer all 5 to reach
   "Inbox zero", then Restart. Toggle ☀/☾ top-right to compare light and dark.
3. Node-only verification (no browser, nothing outside this directory):
   `node --check harness.js && node harness.js` — asserts visible painted text (Q1 + Q2 after
   advancing), full-loop node identity (same option/row/card objects across all 5 answers and
   reset), zero `innerHTML`-family writes after init (source scan + runtime setter trap), and
   light AND dark themes (runtime toggle + dark token presence). Inline-JS syntax is checked
   via `vm.Script` parse inside the harness (equivalent of `node --check` for inline script;
   `node --check index.html` is not applicable — it is HTML, not JS).

## Verification result
- `node --check harness.js`: clean. Inline script parses (vm.Script). All harness checks pass,
  including **light AND dark mode** (toggle switches `data-theme` both ways; dark tokens
  `#1c1c1f #101012 #451a03 #fde68a` present; page confirmed finished-looking in both via token
  review — no grey-on-grey, borders visible on `--border #2e2e33`).
