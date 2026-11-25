# agent-steering replica — REPORT

## What was built
`index.html` (28.5 KB, single file, no network, system fonts) — a clean-room
replica of the affectUI Pro **agent-steering** component: a console for steering
one working agent ("Migrate users table", model Opus 5.5) by queuing notes for
the next step or interrupting the working step immediately. All HTML/CSS/JS is
original; the compiled demo was read only to extract data and timings.

Layout follows the v3 header pattern: project name + working count
("● 1 working" / status pill Running–Paused–Done) + agent count ("1 agent"),
agent row with a deterministic 3x3 pixel-mark, context usage as token counts
("44k / 200k", thin 3px bar, right-aligned label), live elapsed clock, a "Run
plan" step timeline, and a "Steer this run" panel (draft input, Queue note,
Interrupt now, Pause/Resume, Restart, queued-note chips with ⚡-promote and
remove). Narrow screens stack the input/buttons.

## Original data used (from demo-original.js, re-typed — nothing invented)
- Steps: `read` Read schema and 14 migrations · `draft` Plan the split into
  accounts and profiles · `write` Write migration 0042_split_users · `dry` Dry
  run on staging · `pr` Open a pull request for review.
- Durations: read 1400 / draft 4600 / write 5200 / dry 2600 / pr 1800 ms.
- Title rewrite on drain: write → "Write migration 0042 for Postgres 16".
- Scripted notes: "Use Postgres 16 syntax – prod isn't on 17 yet" (typed from
  900 ms) and "Keep the old users view for a week" (typed from 5700 ms),
  38 ms/char + 420 ms pause, then sent; interrupt-chip click at 8392 ms.
- Behaviour: step 0 starts pre-done, run starts at step index 1 after 200 ms;
  queued notes drain into the next step (`picked: "next"`); interrupt attaches
  the note to the active step (`picked: "now"`), clears step timers and re-runs
  the step after 120 ms; pause/resume (resume re-runs after 200 ms); clock
  starts at −126 s (2:06); done loops after 3800 ms (autoplay) / 4200 ms
  (manual); any trusted pointer/key input stops autoplay. All replicated.
- Only non-original chrome: the context bar baseline (44k/200k, +2k per done
  step) and the agent handle "migration-agent" next to the verbatim "Opus 5.5"
  model label — the compiled demo exposes only the model string.

## Interactions
Queue note (Enter), Interrupt now (Ctrl/Cmd+Enter), ⚡ per queued chip to
interrupt with that note, × to drop it, Pause/Resume, Restart, theme toggle
(sun/moon, top-right, persists to localStorage, defaults to
prefers-color-scheme, light fallback), full keyboard focus-visible support,
`prefers-reduced-motion` disables animation.

## Token audit
Every colour resolves through CSS custom properties on `html[data-theme]`;
no hard-coded hex per element (the only inline hues are the generative
pixel-mark cells derived from the agent-id hash). Radius 16/10/6 px, pills
999 px, soft shadow, 150–200 ms transitions, 1 px borders, hover lift —
dark theme redefines the same tokens (surface #1c1c1f, page #101012,
ink #ededed, muted #a1a1aa, subtle #26262a, border #2e2e33, amber stays amber
as #fbbf24/#451a03/#fde68a). Pending steps render at 0.85 opacity (≥ 0.75),
titles are single-line ellipsis, expanded cards keep bottom padding, the
"Run plan" heading reserves space above the first card.

## Contrast results (WCAG AA, normal text ≥ 4.5:1) — all pass
Light: ink/surface 17.93 · muted/surface 4.80 · work pill 5.49 · wait pill 6.37
· danger/surface 6.47 · primary button 5.17.
Dark: ink/page 16.23 · muted/page 7.42 · work pill 7.29 · wait pill 12.03 ·
danger/surface 6.15 · primary button 7.48.

## Verification
- `node --check` on the extracted page script: pass.
- Headless run (temporary DOM-stub + virtual-timer harness, since removed):
  29/29 checks passed — 5 cards rendered, pixel-mark contains exactly 9 cells,
  step machine (draft active at 300 ms → done → write active with rewritten
  title), note A queued then carried as `next`, note B queued then attached as
  `now` via chip interrupt with queue drained, run reaches `done` with banner,
  auto-restart loops, pause freezes 8 s of virtual time, resume continues,
  manual interrupt/queue APIs, dark/light toggle, elapsed clock ticks.
- Checked in both themes via the theme API + token review; light verified as
  default, dark verified finished (no grey-on-grey, borders visible).

## How to test
Open `index.html` in a browser: watch the scripted autoplay (notes type
themselves, ⚡ interrupt fires, run completes and loops); type in the input or
press any key to take over manually. Toggle ☾/☀ for dark mode.

## Could not verify
Pixel-parity with the original Pro render (no screenshot available); exact
accent hues of the original theme (tokens follow the spec values).
