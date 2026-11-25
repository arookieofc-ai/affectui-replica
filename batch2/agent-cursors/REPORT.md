# Agent Cursors — replica report

## What was built
`index.html` (52.7 KB, single file, no external dependencies) replicates the
affectUI **Agent Cursors** demo: multiple agents editing a document live with
pointers, suggestions and comments.

- **Header pattern (per v3):** project title (`Product / Launches`, `Pulse 2.0 –
  launch tasks` in Table view) + live presence count (`3 here` / `2 typing` /
  `N suggestions`) + agent avatars + `Accept all` — no generic component
  toolbar.
- **Agent identity:** deterministic 3×3 pixel-mark per agent id (hashed from the
  id, painted with that agent's token colour); typing/working agents pulse via
  the `twk` animation.
- **Doc view:** exact original blocks — title `Pulse 2.0 – launch brief`,
  `why` paragraph, loading hero image (float left, shimmer, resize handles,
  `600 × 338` tag, shrinks 50% → 36% when Designer resizes), `beside`
  paragraph, `Rollout` heading, `code` block
  (`const rollout = { waitlist: "Nov 3", everyone: "second week of November" }`),
  ship line, `What ships` heading, two bullet items.
- **Table view:** header `Task / Owner / Due / Status` + exact rows
  (`Write the launch post / Writer / Nov 3 / Doing`, `Record the demo video /
  Designer / Nov 5 / To do`, `Email the waitlist / Ops / Nov 12 / To do`,
  `Live Q&A / — / Nov 14 / Idea`) + scripted added rows (`Press kit /
  Designer / Nov 8 / To do`, `Partner email / Ops / Nov 11 / To do`).
- **Original suggestions:** `r1` Researcher `about 40%` → `38%`
  (`Q3 survey of 1,240 teams`), `c1` Coder `second week of November` → `Nov 10`
  (`Matches the launch calendar`), `w1` Writer `brief` → `plan` (`It's a plan
  with dates now, not a brief`); table: `p1` Planner `Nov 12` → `Nov 10`,
  `a1` Analyst `—` → `Maya`, `o1` Ops `To do` → `Doing`. Typing effect,
  del/ins styling, hover/focus/click popup with Accept/Reject, `Accept all`.
- **Original comments:** `n0` Coder on code
  (`Should waitlist and everyone share one date format? I'd use "Nov 3"
  everywhere.`), scripted `n1` Researcher on why
  (`Q3 survey of 1,240 teams: 38%, not 40%.`); table `q1` Reviewer
  (`Draft is in – ready for review today.`). Pins hover/focus/click to open,
  inline reply, Resolve.
- **Cursors:** glide (560ms ease), caret blink, name + doing-status flag +
  live cost ticker, selection highlight marks, image corner-handle state,
  `tasks:add` press state. Autoplay timeline mirrors the original's event order
  and timings (~12.8s loop, auto-accept `r1`, restart); any user Accept/Reject/
  Resolve pauses autoplay, `Replay demo` restarts.
- **Responsive:** hero unfloats, header wraps, pop/pin widths clamp ≤640px.
- **Keyboard:** tabs, faces (follow/dim, dimmed ≥0.75 opacity), suggestion
  ins/del (Enter opens popup), popup buttons, reply input (Enter sends,
  Esc closes), Esc dismisses popups; focus-visible outlines everywhere.

## Tokens
All colours are CSS custom properties in the two token blocks (`:root` light,
`html[data-theme="dark"]` dark). Light: surface `#ffffff`, page `#fafaf9`,
ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`,
radius-lg `16px`, radius `10px`, radius-sm `6px`. Dark: surface `#1c1c1f`,
page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`,
border `#2e2e33`. Amber waiting `#f59e0b`/`#fef3c7`/`#92400e` light,
`#fbbf24`/`#451a03`/`#fde68a` dark. Agent hues are tokens too
(`--a-research` … `--a-reviewer`).

## Light + dark checked
- Sun/moon toggle top-right switches `data-theme`; default follows
  `prefers-color-scheme`, override persisted to localStorage.
- Verified both themes render finished (dark sheet/borders/pills/flags all use
  dark tokens; no grey-on-grey).

## Demo data used
All text, agent names, suggestion inserts/notes, comment text, cursor
`doing` labels, script order/timings and table rows extracted from
`demo-original.js` (downloaded via the prompt's curl command) and reused
verbatim. **One exception:** the demo chunk carries no per-agent hex colours
(agents have only id/name/avatar; cursor colour falls back to a default), so
the 8 agent hues are a token-based equivalent palette, documented here rather
than invented silently. Avatar artwork is original 3×3 pixel-marks, not copies
of the demo's SVG paths (clean-room).

## What could not be verified
Pixel-perfect match against the hosted original (no screenshot pipeline in
this environment); cursor x/y are computed live from the replica's own text
layout, so exact pixel positions may differ slightly from the original's
measured rects. Cost ticker rates reuse the original per-agent rates.

## Visual QA fix (2026-11-25) — Table tab first-letter truncation
- **Defect (browser QA, dark theme, after full playback and after `Accept all`):**
  in the Table tab, the 4 original task rows showed only the first letter per
  cell (`W / R / E / L` in Task, `W / D / O` in Owner, `N` in Due); only the
  two scripted added rows (`Press kit / Designer / Nov 8`,
  `Partner email / Ops / Nov 11`) were complete. Doc view was unaffected.
- **Root cause:** `renderTable()` in `index.html` distinguished
  `[text, tone]` status pills from plain-text cells with `(c && c[1]) ? …`.
  Strings are indexable, so for e.g. `'Write the launch post'` the test saw
  `c[1] === 'r'` (truthy) and stored `text: c[0]` (`'W'`) plus a bogus
  `tone: c[1]` (which also wrapped the single letter in a `.pill`). Only the
  array-form Status column and the separately-built extra rows survived.
  The suggestion-typing (`p1`/`a1`/`o1`) and accept paths never mutate
  `cell.text` except for the targeted accept splice, so the truncation was
  present before, during, and after typing — not caused by typing.
- **Fix (one line, same file):** test with `Array.isArray(c)` instead:
  `var isArr=Array.isArray(c); var tone=isArr?c[1]:null; var txt=isArr?c[0]:c;`
  Text columns now keep full text with `tone:null` (no pill wrap); Status
  keeps `blue/gray/amber` pills; added rows and Doc view untouched.
- **Verification:** node harness replicated the file's cell-creation logic —
  old expression reproduces `W/R/E/L…`, fixed expression yields all four
  original rows verbatim before typing, base text stays full at every
  partial-typing step (`N→Nov 10`, `M→Maya`, `D→Doing`), post-accept cells
  read `Nov 10 / Maya / Doing` with untouched originals intact, and added
  rows intact; `renderCellRich` confirmed not to assign `cell.text`.
  Re-ran: `node --check` passes on the extracted script, token audit `0`
  hex after `/* base */` (57 in token block), contrast re-checked
  (light 17.93/4.80/6.37/4.97/6.37, dark 14.52/6.63/12.03 — all AA),
  54,189 bytes (<200KB), light+dark tokens unchanged.

## How to test
1. `open index.html` in a browser (or serve this directory).
2. Watch the autoplay: cursors glide, suggestions type in, `r1` auto-accepts,
   comment `n1` types in, round restarts.
3. Hover/focus an edit → Accept/Reject; hover a pin → reply/Resolve; click an
   avatar to follow (others dim); `Accept all`; switch Doc/Table tabs.
4. Toggle sun/moon; reload (theme persists); narrow the window to ~360px.
5. Token audit: no `#hex` may appear after the `/* base */` marker —
   `grep -o '#[0-9a-fA-F]\{3,8\}' index.html` hits must all precede it
   (0 after). Contrast spot-checks: light ink/surface 17.9, muted/surface 4.8,
   amber 6.4, blue pill 5.0, green pill 4.5 (light `--blue`/`--green` were
   deepened slightly from the demo's `#1c69ff`/`#1e8a4f` so pills pass AA);
   dark ink/surface 14.5, muted/surface 6.6, amber 12.0.
