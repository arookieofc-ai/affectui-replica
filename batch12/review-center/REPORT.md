# Review Center — clean-room replica report

## What was built
`index.html` (53.8 KB, single self-contained file, no network, system fonts only):
a focused workspace for reviewing agent actions by risk, one item at a time —
queue list (left) with risk filter tabs, detail view (right) with proposal content,
and an action bar (Approve / Edit / Reject / Skip). All CSS/JS is hand-written
from the observed behaviour; no compiled source was copied.

- **Header pattern**: mark + "Review center" + thin progress bar + "24 of 32
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
  text nodes directly); reject-reason buttons use `pointerdown`/`mousedown`
  capture; hover/focus on flags only moves the tooltip (no re-render);
  `[hidden]{display:none !important}` present; SVG nodes get classes via
  `setAttribute` only; no browser launched — verified with node only.

## Original data/behaviour matched (verbatim)
- All 8 initial items + the late-arriving invoice (retry/clause/migration/
  rotate/refund/triage/bump/notes/invoice) with exact titles, agents, models,
  types, risks, confidences, reasonings, fields, file diffs, steps, sources,
  flagged spans and their notes/sources; `REVIEWED_BASE=24`, reject reasons
  `Incorrect/Too risky/Not allowed/Other`, unsure threshold 0.7, SLA 30 min.
- Exact demo loop timings (0.9 peek → 3.2 peek → 4.4 clear → 4.6 reject →
  5.3 reject("Too risky") → 6.3 peek → 7.6 edit → 7.9 invoice arrives →
  8.3–8.81 four draft keystrokes ("1 months"→" months"→"2 months"→"24 months")
  → 9.6 save → 10.8 peek → 12 reject → 12.7 reject("Not allowed") →
  13.9 peek → 15.3 skip → 16.4 peek → 17.8–22.3 six approves → 26s loop reset),
  plus pause-on-interaction with 9s idle resume.
- Keyboard: A approve, E edit, R reject panel, S skip, J/K/arrows navigate,
  F cycles flags, Z/U undo, 1–4 pick reject reason, Cmd/Ctrl+Enter saves,
  Esc closes. Handler ignores events from textarea/input/select/
  contenteditable, altKey, and meta/Ctrl combos (except Enter-to-save in edit
  and Z-undo) — so keys work with focus on buttons, matching the original's
  `closest(...)` guard. Toast (6s) + polite live region announcements match
  ("Rejected · Too risky", "Approved with edits", "Skipped: …", "25/32 …").

## Verification (node only, no browser)
`node verify.cjs` (in-dir DOM-stub harness): `node --check` on the extracted
script + virtual-timer walk of the full 26s loop + keyboard dispatch +
visibility walker (hidden/`display:none`/`visibility:hidden`/
transparent/zero-size subtrees don't count as visible). **34/34 PASS**,
including: 9-cell pixel-marks, light-default + dark-toggle + dark re-render,
no text-hiding CSS rules, peek/reject/edit/save/skip/approve at the exact
timestamps, live-region announcements, loop reset with counts back to
"24 of 32 reviewed".

## What could not be verified
Pixel-perfect visuals, smooth-scroll/focus-ring feel, and real-browser timing
(headless Chrome cannot run here) — check by opening `index.html` in a
browser; use the toggle to confirm both light and dark look finished.
Narrow (<680px) stacking is implemented via media query but likewise only
eyeballed via CSS review, not a rendered viewport.
