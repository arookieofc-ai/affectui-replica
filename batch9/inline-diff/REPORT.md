# inline-diff replica — REPORT

## What was built
`index.html` (44KB, single self-contained file, no network, system fonts) — a clean-room
replica of the affectUI Pro **inline-diff** component. All HTML/CSS/JS written from scratch;
the original compiled demo (`demo-original.js`) was read only to extract data, timings and
behaviour. No source was copied.

The page: project header (pixel-mark + `inline-diff` + live `N pending · 1 agent` pills +
sun/moon theme toggle), the diff card (sparkle label, header bar with count / prev-next /
Reject all / Accept all, blurred crossfade to an "All changes reviewed + Undo" layer, body
paragraph with 4 change chips, floating Accept(Y)/Reject(N) popover, screen-reader live
region), plus demo chrome (Replay guided tour / Reset buttons, hint line, Live outcome panel).

## Original data used (verbatim, no invented data)
- Label: `Suggested by AI · Make it shorter`
- Original: `Hi everyone, we are very excited to announce that the new dashboard is now
  available for all users. It loads a lot faster than before, and you can now export any
  report to CSV with just a single click. Let us know what you think!`
- Suggested: `Hi everyone, the new dashboard is now live for all users. It loads twice as
  fast, and you can now export any report to CSV in one click. Let us know what you think!`
- Guided-tour plan + timings: highlight 1200ms → decide 450ms gap, per-step verdicts
  `accept, reject, accept, accept`; start delay 900ms, reset pause 2800ms, reloop 900ms;
  hover-hide delay 140ms. Tour loops until any user takeover (pointerdown/keydown/focus/
  pointerover of interactive parts) — exactly like the original.
- Announcement wordings reproduced: `Accepted: Remove "…". 3 suggestions left.`,
  `Rejected: …`, `All changes reviewed.`, `Undone. N suggestion(s) left.`,
  `replace "a" with "b" / add "b" / remove "a"` descriptions, `N suggestion(s)` counts.
- SVG icon paths (sparkle, chevrons, check, undo, cross) redrawn to the same 16px shapes.

Own word-tokenizer + LCS diff produces exactly the original's 4 segments:
1. remove `we are very excited to announce that ` (accepted in tour)
2. replace `available` → `live` (rejected in tour)
3. replace `a lot faster than before` → `twice as fast` (accepted)
4. replace `with just a single` → `in one` (accepted)

Tour-final text: `Hi everyone, the new dashboard is now available for all users. It loads
twice as fast, and you can now export any report to CSV in one click. Let us know what
you think!` (verified by harness).

## Interactions
Hover/focus a chip → popover appears above it (below if no room), slides between chips,
140ms hide delay; `Y`/`Enter` accept, `N`/`Backspace`/`Delete` reject, `Esc` blurs/closes;
prev/next step through pending; Accept-all/Reject-all; Undo stack; Reset; Replay tour;
theme toggle (persisted to localStorage, defaults to `prefers-color-scheme`; original demo
appearance is light). Keyboard focus after a keyboard decision jumps to the next pending
suggestion (or Undo when done) — as in the original.

Robustness rules from the prompt, both honoured:
- Chips are built **once**; every later update only toggles classes/text/attributes —
  nothing is rebuilt inside any timer loop (the tour is a `setTimeout` chain).
- The popover opens on **capture-phase `pointerdown`/`mousedown`** on the card, so a real
  mouse click can never be lost across an update.

## v3 spec notes
- 3×3 agent pixel-mark: present next to the header, exactly **9 `<i>` cells** (asserted),
  deterministic pattern + hue hashed from agent id `ai` (the "AI" in `Suggested by AI`);
  twinkles while suggestions are pending, steady when reviewed. No agent data was invented —
  the suggester identity comes straight from the original label.
- Token-count header / tool icons / sub-agent cards: not applicable to this component
  (prose diff, no agents/tools/context bar); the header instead follows the v3 pattern with
  live pending count + agent count.
- Not verified against screenshots (no browser in this environment); verified behaviourally
  (see below). Light theme matches the original demo appearance; dark theme re-mapped from
  the original's own dark token block.

## Token audit
All colours flow through page custom properties; the component maps its own `--df-*` vars
onto them (mirroring how the original mapped `--ui-df-*` onto `--aui-*`). No ad-hoc hex.
Light: surface `#ffffff`, page `#fafaf9`, ink `#1c1917`, muted `#78716c`, subtle `#f5f5f4`,
border `#e7e5e4`, radii 16/10/6, shadow soft double-layer; waiting amber `#92400e` on
`#fef3c7`; radii/pills fully rounded where specified; transitions 140–460ms.
Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`,
border `#2e2e33`, waiting `#fde68a` on `#451a03` dot `#fbbf24`.
One deliberate deviation: add-ink light is `#177245` instead of the original `#1e8a4f`
(original fails 4.5:1 on white at ~4.2); dark keeps the original `#7dcf9f`.

## Contrast results (computed, WCAG — text needs ≥ 4.5)
Light — ink/surface 17.49, muted/surface 4.80, body/tray 7.16, add-ink 5.95, del-ink 5.52,
wait/bg 6.37, popover 17.93, primary-btn 16.74. Dark — ink 14.52, muted 6.63, body/card
8.49, add-ink 9.44, del-ink 7.66, wait/bg 12.03, popover 16.31, primary-btn 15.00.
All 16 pairs pass (minimum 4.80).

## How to test
`node harness.mjs` in this directory — runs `node --check` on the extracted page script,
then loads the real markup + script into a stub DOM, plays the tour on fast timers and
asserts 60 checks (segments, tour plan, outcome text, undo/reset, keyboard, hover/popover,
capture-pointerdown, nav, theme, replay, 9-cell mark, layer crossfade, contrast).
Result here: **60 passed, 0 failed**. Or open `index.html` in a browser and check both themes.
