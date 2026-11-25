# agent-sequence — clean-room replica report

## What was built
`index.html` (39.7 KB, single file, inline CSS+JS, system fonts, no network) replicating the
affectUI Pro **agent-sequence** component: an agent run rendered as a sequence diagram with
participant lifelines, call/reply arrows, a self-note loop, and `par` / `retry` parallel frames.

- **Header:** project title "Fix the checkout crash" + live summary (`N working · shown/total
  messages · N agents · elapsed m:ss`), matching the original's header pattern.
- **Participants (left→right):** You (person, solid 3×3 block), Lead (Claude Opus), Researcher
  (Claude Sonnet), Coder (Claude Sonnet), GitHub (tool disc "GH"), Vercel (tool disc "V").
- **Diagram:** dashed lifelines, per-target activation bars (open ones shimmer while running),
  solid call arrows / dashed reply arrows / `×` head for the failed build, loop glyph for the
  Lead self-note, `par` and `retry` frame boxes with uppercase label chips, left-gutter `m:ss`
  timestamps.
- **Behaviour:** messages reveal on the original cumulative schedule
  (600,900,800,350,800,800,900,900,900,900,1000,900,1000,900,900 ms, then 4200 ms hold, fade,
  loop). Hover/focus pauses the loop-restart; Pause/Play and Replay controls included.
- **Interactions:** click a message or agent chip to pin a detail card (route, label, Call/Reply/
  Note + Failed/Needs-you/frame chips, `detail` pre block, Sent/Took/Answered-in/Waiting meta;
  agent cards show kind, Working/Idle, model, description, Sent/Received/Tasks-or-Calls/Busy
  stats). Selection dims unrelated messages to 0.75 opacity. Keyboard: arrows/Home/End move
  between messages, Enter/Space opens, Esc closes, focus-visible outlines throughout.
  `aria-live` announces each new message; `prefers-reduced-motion` renders statically.
- **Identity marks:** deterministic hash → exactly 9 `<i>` cells per 3×3 pixel-mark (≥5 lit),
  solid block for the person, twinkle animation (per-cell delays 0,120,…,480 ms) while busy.

## Original demo data used (from `demo-original.js`, re-expressed — no code copied)
- 6 participants with the exact names, kinds, models, and descriptions above.
- All 15 messages m1–m15 with exact labels, `at` times (0 → 72000 ms), frames, `replyTo` links,
  `detail` bodies, and m11 `status:"failed"`.
- Reveal schedule `A` + hold `j=4200`; durations 36 px rows / 44 px self rows / 22 px frame pad /
  8 px frame gap; twinkle delays; colour palette order (blue first agent, then purple/sky/…).

## Deliberate deviations (clean-room / spec v3)
- Brand SVGs replaced by circular monogram discs ("GH", "V") — no network, no copied paths.
- Card is an absolutely-positioned panel (not `popover` API); dim opacity 0.75 per v3 (original 0.28).
- Reveal pauses while focus is inside the diagram (a11y improvement); Busy stat uses real
  message timestamps. No token-context bar: the original demo has none (that pattern belongs to
  other components); header shows message/agent counts + elapsed time from real data.

## Interactions
Open `index.html` in a browser. It auto-plays and loops; hover pauses the restart; use Pause /
Replay; click messages/chips; theme toggle (☾/☀) top-right switches `data-theme`. Default follows
`prefers-color-scheme` (light demo appearance).

## Token audit
All colours are CSS custom properties (`--surface/--page/--ink/--muted/--subtle/--border/
--life/--faint`, status `--work/--wait/--fail` fg+bg, `--chip-fg`, radii, shadows); no ad-hoc hex
in component CSS. Dark theme redefines the same tokens; amber waiting adjusted per spec.

## Contrast results (computed, text pairs)
Light: ink 17.9, muted 4.8, chip 7.0, working 5.6, waiting 6.4, failed 5.5, tool-disc 7.0,
timestamps 4.0 (faint darkened from the original's 2.5). Dark: ink 14.5, muted 6.6, chip 9.1,
working 6.5, waiting 12.0, failed 7.2, timestamps 4.6. Lifelines (decorative dashed) strengthened
to 2.1/2.3 light/dark. Verified finished appearance in both themes via token review (no
grey-on-grey text; borders visible in dark).

## Verification
- `node --check` on the extracted page script: passes.
- Headless run: `verify-harness.js` (temporary, removed after the run) stubbed the DOM + timers,
  loaded the real page script, and advanced its timers — **47/47 checks passed**: 0→1→15 reveal,
  15 rows, every pixel-mark exactly 9 cells (heads + card), deterministic ≥5-lit marks, 2 frames
  (par/retry), self row, open activations mid-run, click→card, Esc→close, loop restart resets to 0,
  theme toggle flips to dark, ids/labels/timings/participants byte-faithful to the original.
