# collaboration-stream — replica report

## What was built
Self-contained `index.html` (34,319 bytes, no network, system fonts) replicating the
affectUI Pro **collaboration-stream** component: an agent-to-agent chat showing senders,
recipients (incl. `orch → all` broadcast), handoffs, files, and @mentions.

- Header = task name **"Launch the new pricing page"** + live badge + working count +
  agent count + message counter (not a generic title + toolbar).
- Stream of 13 message cards, each with sender pixel-mark, `from → to` route line,
  kind pill (`ask / spawn / share / reply / handoff / question`), timestamp, `in reply to`
  link, file attachments with click-to-preview, and collapsible details (facts + tool rows).
- Handoff `m9` shows From/To/Context facts; token facts render as a thin 3px bar with a
  right-aligned label showing the exact original count.
- Agents panel: Orchestrator / Researcher / Writer / Coder with model line, live
  status (`working / waiting / idle`), per-agent context bar where the original states one.
- Interactions: autoplay stream, typing indicator, loop, Pause/Play, Replay, per-agent
  filter, hover/focus thread highlight (reply-chain, others dim to 0.75), click-to-open
  details, file preview toggle, reply-link jump, composer with recipient chips
  (Enter sends, Shift+Enter newline, Esc blurs, focus pauses autoplay like the original),
  auto-reply from the first recipient, theme toggle.
- Responsive: two columns collapse to a stacked list under 860px. Keyboard: cards are
  focusable (Enter/Space toggles details), all buttons focus-visible.

## Original data used (transcribed, not copied)
From `demo-original.js`: agents `orch/Orchestrator/Gemini 3.8`,
`research/Researcher/Gemini 3.8 Flash`, `writer/Writer/Sonnet 5.5`,
`coder/Coder/Opus 5.5`; task `Launch the new pricing page`; all 13 messages with exact
texts, kinds, `at` times and `replyTo` links; attachments
(`web_search ×6` + 6-query preview, `plans-copy.md`, `src/billing/`, `pricing-table.csv`,
`Pricing / Desktop` Figma frame, Stripe `price_team_12/15`, `PR #482`);
details facts (Model `Gemini 3.8 Flash`, Tokens `41.2k`, Cost `$0.02`, Took `1m 48s`;
From/To/Context `18.4k tokens`; Model `Opus 5.5`, Waiting `2m`, Holds `Deploy`) and all
tool rows; auto-replies (`Got it – …`, `On it – …`, `Sure – …`, `Done – …`);
timings `v=4` (first 5 visible) / `+1` per `1.5s` / typing `0.7s` / `≈18s` cycle + loop /
reply resolve `1400ms` / composer-focus pauses autoplay. All code is original.
Nothing invented: token-bar labels show the original strings verbatim (bar scale = max
stated value, noted in UI as context only). Original texts contain no `@mentions`, so no
mention highlight appears in default data; the renderer supports `@name` and the
composer path is covered by the harness.

## Interactions
Autoplay stream · typing dots · loop replay · Pause/Play · Replay · agent filter ·
thread highlight on hover/focus · click card = details · click file = preview ·
reply-link jump · composer + recipient chips + 1400ms auto-reply · light/dark toggle
(persists, defaults to `prefers-color-scheme`).

## Token audit
Every colour resolves through `var(--…)` tokens defined for `data-theme="light"/"dark"`
(page, surface, ink, ink-2, muted, subtle, border, blue/green/amber/red/grey/violet +
bg/tx pairs, hl, focus, px-dim, bar-track). No ad-hoc hex in element styles; the only
non-token hues are the deterministic per-agent pixel-mark colours (`hsl(var(--h)…)`),
which are identity data, not theme. Grep confirms: all `color|background|border-color`
declarations reference `var()` except the pixel rule.

## Contrast results (computed, WCAG AA ≥ 4.5)
Light — ink/surface 17.93 · muted/surface 4.80 · amber 6.37 · blue 7.15 · green 6.49 ·
grey 6.99 · violet 7.57 · red 6.80.
Dark — ink/surface 14.52 · muted/surface 6.63 · amber 12.03 · blue 10.34 · green 12.30 ·
grey 10.20 · violet 10.97 · red 11.16. All pass; dimmed nodes floor at opacity 0.75.

## Verification
- `python3` extract of the inline `<script>` → `node --check` passes.
- Real headless run: `node harness.js` (DOM-stub kept in this directory) loads the actual
  page script, renders, and advances its timers — **ALL PASS** (43 asserts): 9-cell
  pixel-marks for all 5 senders, initial m1–m5, +1 msg per 1.5s tick, typing window,
  full run to m13, loop reset, composer send + `@mention` + timed auto-reply with the
  original writer text, theme flip, pause/resume.
- Pixel-mark invariant: markup emits exactly 9 `<i>` cells per mark (asserted per agent).

## How to test
Open `index.html` in a browser (no server needed). Toggle ◐ top-right for dark mode;
watch the stream play, hover a card for its thread, click files/details, send a message.

## Could not verify
The vendor `.tsx` source and exact original CSS were not available (compiled demo only);
visual styling (radii, shadows, kind colours) follows the spec tokens, so pixel-parity
with the Pro component is approximate. Tool/logo glyphs are rendered as initial-letter
circles rather than brand SVGs.
