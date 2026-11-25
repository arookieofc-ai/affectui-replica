# Report — Run Controls replica

## What was built
ONE self-contained `index.html` (45 KB, inline CSS + JS, system fonts, zero
network) replicating the **Run Controls** component: all controls for a running
agent — stop, resume, retry, steer, queue, and permissions.

- **Page chrome**: header with project name + live working count + agent count
  (`Trip planner` · `N working` · `1 agent`) and a visible sun/moon theme
  toggle (top-right) switching `data-theme="light" | "dark"` on `<html>`.
  Default is **light**, matching the original demo's appearance; a stored
  choice persists via `localStorage`, otherwise `prefers-color-scheme` is
  respected.
- **Component**: conversation log (user bubble, agent row with pixel-mark +
  name + status, streaming answer with inline steer pills, thinking dots,
  caret, stopped/error cut mark, after-row with `Esc to stop` / word-count /
  `Done in m:ss` + Resume/Retry/Dismiss), queued-messages list (`Next`,
  `#2`… with remove buttons), composer with textarea, Chat/Act radiogroup,
  permission popover (Ask first / Auto-edit / Full access), context ring with
  `%` label, and context-aware action buttons (Queue + Steer while running
  with text, round Stop while running without text, round Send otherwise).
- **Design tokens**: every colour is a CSS custom property (`--surface`,
  `--page`, `--ink`, `--muted`, `--subtle`, `--border`, radii `16/10/6px`,
  shadow, `--accent`, amber/fail variants). Dark theme redefines the same
  tokens (`#1c1c1f`/`#101012`/`#ededed`/`#a1a1aa`/`#26262a`/`#2e2e33`,
  amber `#fbbf24` on `#451a03`), checked by the harness in both themes.
- **Pixel-marks**: deterministic hash of the agent id, `repeat(3, 3px)` grid,
  EXACTLY 9 cells per mark, `>=5` on, twinkle (`pixel` keyframes) while busy.

## Original data / behaviour matched (verbatim from demo-original.js)
- Agent `{id:"travel", name:"Trip planner"}`; prompt
  `Plan four days in Lisbon in March – good food, one day trip, nothing too touristy.`
- Full 4-day Lisbon answer, steer `Keep it to three days` →
  `Three days it is – …`, queued `Add a packing list for March weather` →
  March packing answer; generic fallback `Here's a first pass at "…"…`.
- Empty state `Ask Trip planner anything – steer it or stop it while it works.`
- Timings: first tick 900 ms (60 ms on resume), 30 ms + random·40 ms per
  `\\S+\\s*|\\s+` token, queue advance 1100 ms after Done.
- Scripted auto-steer injected at the first `\\n\\n` past 100 chars unless a
  trusted pointer/key gesture disarmed it; `context = min(.96, .34 + words·.0021)`.
- Statuses `Thinking` / `Writing` / `Writing · steered` / `Stopped` /
  `Connection lost` / `Done`; notes `Esc to stop`, `Stopped before it
  answered`, `Stopped at N word(s)`, `Done in m:ss`; `Enter` steers,
  `⌥ Enter` queues, `Shift+Enter` newline, `Esc` stops; permission hints
  (`Asks before every change`, `Edits files, asks for the rest`,
  `Runs commands without asking`) and Chat-mode disable with its title.
- One deliberate deviation, by the brief's own priority rule ("use its data
  verbatim, never invent generic data"): context stays the original **% ring**,
  not a `44k / 200k` token bar — inventing a 200k window would be fabricated
  data. Likewise no fake project header data: counts are live (1 working /
  0 working, 1 agent).

## Hard-won rules applied
- No DOM rebuild in the tick loop: per-token fast path appends to the tail
  text node (`appendTokenFast`); full renders happen only on state transitions.
- Popover opens on `pointerdown` capture with `stopPropagation`; outside
  `pointerdown` closes it; hover/focus are CSS-only, never re-render.
- `[hidden]{display:none}` explicit rule; SVG classes set via markup /
  `setAttribute`, never `.className`.
- No browser installed/launched; verification is node-only.

## Verification
- `node --check` on the extracted inline script: **passes**.
- In-dir DOM-stub harness `verify-harness.js` (`node verify-harness.js`):
  **ALL CHECKS PASSED** (66 assertions) — full loop (Thinking → Writing →
  auto-steer pill → Done → queued run auto-starts → second Done), stop/resume/
  dismiss, trusted-gesture disarms auto-steer (full 4-day answer, no pill),
  3-item permission menu open/close, chat-mode disable, **exactly 9 cells per
  pixel-mark**, theme toggle light→dark→light with all key text still visible
  in dark, retry + manual steer/queue pills, static checks (size, no network,
  default theme, no hiding rule on text elements).
- Light AND dark both checked by the harness (dark: toggle + re-assert all
  visible texts and pixel-marks).

## What could not be verified
- Pixel-perfect visual match against a rendered screenshot (headless Chrome
  cannot run here); fidelity was ensured by porting the original's layout
  values (252 px log, 16 px radii, pill/ring geometry, keyframe timings).
- Real keyboard IME composition and screen-reader narration were not tested.

## How to test
Open `index.html` in any browser. Watch the run stream, steer it, queue a
message, stop/resume/retry/dismiss, switch Chat/Act and permissions, toggle
the sun/moon button. Re-run `node verify-harness.js` for the automated pass.
