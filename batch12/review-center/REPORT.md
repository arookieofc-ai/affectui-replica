# Review Center — clean-room replica report

## What was built
`index.html` (55 KB, single self-contained file, no network, system fonts only):
a focused workspace for reviewing agent actions by risk, one item at a time —
queue list (left) with risk filter tabs, detail view (right) with proposal content,
and an action bar (Approve / Edit / Reject / Skip). All CSS/JS is hand-written
from the observed behaviour; no compiled source was copied.

- **Header pattern**: mark + "Review center" + thin progress bar + "24 of 33
  reviewed" count + "oldest 28m" label (SLA-colored near/over 30 min).
- **Agent identity**: deterministic 3×3 pixel-mark per agent id (hash → hue +
  9-cell pattern, center cell always on) — exactly 9 cells per avatar.
- **Design tokens**: all colours via CSS custom properties; light default
  (`--surface #ffffff`, `--page #faf9f8`, `--ink #171717`, `--muted #78716c`,
  `--border #e7e5e4`, radius 16/10/6, soft shadow,
  999px pills). Dark theme via `data-theme="dark"` on `<html>`
  (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`, amber `#fbbf24` on
  `#451a03`), sun/moon toggle fixed top-right, choice persisted.
  Default theme = the original demo's appearance (light).
- **Hard rules honored**: render only on state change (10s metadata tick updates
  text nodes directly, no DOM rebuild); reject-reason buttons use `pointerdown`/
  `mousedown` capture; flag popovers also open on `pointerdown` capture (plus
  hover/focus, tooltip-only moves, no re-render);
  `[hidden]{display:none !important}` present; SVG nodes get classes via
  `setAttribute` only (no `.className` on SVG); no browser launched — verified
  with node only.

## Original data/behaviour matched (verbatim)
- All 9 items at load (retry/clause/migration/rotate/refund/triage/bump/notes/
  invoice — incl. 'Pay INV-2207 from Acme Logistics') with exact titles, agents,
  models, types, risks, confidences, reasonings, fields, file diffs (with
  embedded `\n` chunking as in the original), steps, sources, flagged spans and
  their notes/sources; `REVIEWED_BASE=24`, total `H = V + R.length`
  (`V = 24 + decided.length`, matching `ge` in demo-original.js:
  `V=ae+Object.keys(A).length, H=Math.max(oe??V+R.length,V)` with no explicit
  total prop), reject reasons `Incorrect/Too risky/Not allowed/Other`, unsure
  threshold 0.7, SLA 30 min.
- Demo loop timings preserved (0.9 peek → 3.2 peek → 4.4 clear → 4.6 reject →
  5.3 reject("Too risky") → 6.3 peek → 7.6 edit → 7.9 invoice (now a no-op
  dedupe, since invoice is already present) → 8.3–8.81 four draft keystrokes
  → 9.6 save → 10.8 peek → 12 reject → 12.7 reject("Not allowed") →
  13.9 peek → 15.3 skip → 16.4 peek → 17.8–22.3 six approves → 26s loop reset),
  plus pause-on-interaction (`pointerdown`/`keydown` capture) with 9s idle resume.
- Keyboard: A approve, E edit, R reject panel, S skip, J/K/arrows navigate,
  F cycles flags, Z/U undo, 1–4 pick reject reason, Cmd/Ctrl+Enter saves,
  Esc closes. Handler ignores events from textarea/input/select/
  contenteditable, altKey, and meta/Ctrl combos (except Enter-to-save in edit
  and Z-undo). Toast (6s) + polite live region announcements match
  ("Rejected · Too risky", "Approved with edits", "Skipped: …", "25 of 33 …").

## Visual QA fixes (2026-11-25) — root causes
1. **Queue count 8 vs 9**: `initialItems()` returned only 8; invoice lived in a
   separate `invoiceItem()` added at t=7.9s. The original's full set is 9, so
   the queue showed 8 at load and the total jumped 32→33 when invoice arrived.
   Fix: include the invoice object in `initialItems()` (createdAt `now`), so
   the 7.9s add is a dedupe no-op and the queue is 9 from the start.
2. **Header counts `24 of 32` → `33 of 33`**: same root cause. Total semantics
   kept exactly as the original (`reviewed = 24 + decided`, `total =
   reviewed + remaining`), which is stable at 33 once all 9 are present.
   After one approve the visible count is `25 of 33 reviewed` (same total).
3. **Queue titles truncated**: `.rvc-row-title` used `white-space:nowrap;
   overflow:hidden; text-overflow:ellipsis` in a 300px column, so 6 of 8 titles
   ended in `…`. Fix: widened the queue column to `360px`, changed titles to
   `white-space:normal; overflow:visible; text-overflow:clip;
   overflow-wrap:anywhere`, and top-aligned the wait badge. Detail titles were
   already unwrapped and untouched.
4. **Glued step/tool text** (`keywith Stripe`): the step title span and the
   `with <tool>` chip were adjacent siblings with no space or margin. Fix:
   insert an explicit `" "` text node between them and add
   `.rvc-step-tool{margin-left:6px}` (+ `.rvc-step-main` block wrapper).
5. **Diff line split**: `renderDiff` treated each diff-array entry as its own
   line and rendered flag objects via `renderRich(parent)` as block-level
   siblings (with `<br>` separators), so `+  for (let i = 0; ` + `i < 10` +
   `; i++) {` became 3 lines. Fix: restored the original `\n`-embedded diff
   chunking and rewrote `renderDiff` to first group segments into logical lines
   (split strings on `\n`, keep flags in the current line — mirroring the
   original `re()` helper), then render each line as ONE `span.rvc-line`
   containing text nodes + inline `mark.rvc-flag` children. No `<br>` splits;
   flag marks stay `display:inline`.

## Verification (node only, no browser)
`node verify.cjs` (in-dir DOM-stub harness): `node --check` on the extracted
script + virtual-timer walk of the full 26s loop + keyboard dispatch +
visibility walker (hidden/`display:none`/`visibility:hidden`/
transparent/zero-size subtrees don't count as visible — hidden popover text
never counts). **77/77 PASS**, including, in BOTH light and dark:
9 queue rows + all 9 titles fully present in VISIBLE text, no
`text-overflow:ellipsis` on title elements (wrap asserted via CSS),
`24 of 33 reviewed` at load → `25 of 33` after one approve (same total),
step+tool separated (`…key with Stripe`, etc.) in visible text plus DOM space/
margin, for-loop diff is a single `.rvc-line` containing the full
`for (let i = 0; i < 10; i++)` text with one inline `mark` for `i < 10`,
9-cell pixel-marks, theme toggle, keyboard, loop reset to `24 of 33 reviewed`
with invoice present.

## What could not be verified
Pixel-perfect visuals, smooth-scroll/focus-ring feel, and real-browser timing
(headless Chrome cannot run here) — check by opening `index.html` in a
browser; use the toggle to confirm both light and dark look finished.
Narrow (<680px) stacking is implemented via media query but likewise only
eyeballed via CSS review, not a rendered viewport.
