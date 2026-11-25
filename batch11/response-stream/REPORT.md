# Response Stream — replica report

## What was built
`index.html` (30 KB, self-contained, no network, system fonts): one agent
("Atlas") answering **"How should we roll out the new billing page?"**,
streaming word-by-word through the full demo loop —
`streaming → stopped → streaming → failed → streaming → done → reset`.
Clean-room code written from observed behaviour; no compiled source copied.

Page chrome follows the replica spec: project header ("Billing rollout" +
"1 working" pill + "1 agent" pill, theme toggle top-right), token-count
context row ("44k / 200k tokens" + thin 3px bar, right-aligned label), and the
answer card with a "Response" column heading with reserved space.

## Original data / behaviour matched (verbatim from demo-original.js)
- Ask + full answer text (billing rollout, three steps, 10 % of new sign-ups,
  "In short: flag it for the team…"), streamed one word per 70–110 ms tick.
- Scripted beats by word position: stop at 40 % of words, steer chip
  "Keep it shorter" at 78 % of paragraph 1, bend divider
  "Steered · Keep it shorter" at end of paragraph 1 (chip removed 900 ms
  later), queued chip "Then draft the email to the finance team" (+6 words,
  "Next" badge), failure at 86 % ("Rate limit – the model is busy. Retrying
  picks up from here.", auto-retry after 2600 ms), done footer
  "6.4s · 182 tokens" (from meta 6400 ms / 182 tokens), auto-reset 5200 ms.
- Stop auto-continues after 1900 ms; Dismiss fades (260 ms) → "Answer
  dismissed" → resets after 1400 ms; Esc stops; Copy/Regenerate buttons.
- Statuses: "Writing", "Thinking"/"No answer yet" empty states, "Stopped"
  divider, "Answer stopped / failed / finished / Writing an answer" live
  regions, sentence-boundary polite announcements (400-char cap).
- Deterministic 3×3 pixel-mark per agent id (exactly 9 cells, twinkle while
  busy), circular tool icons, Steer/Next/Queued badges, "+ N more" expander,
  remove-chip buttons, reduced-motion support, responsive narrow stacking.

## Hard-won rules applied
Fast tick only appends one word `<span>` (chrome re-renders on state change
via a `chromeKey` guard); hover/focus do no rendering; `[hidden]{display:none}`
explicit; SVG classes set via `setAttribute` (icons + theme icon use
`createElementNS`). Fixed during verification: `reset()` now clears the
pending tick guard so Regenerate/Dismiss can never stall the loop.

## Verification (light AND dark)
`node verify-harness.cjs` (in-dir, no deps, no /tmp) — **53/53 PASS**:
`node --check` on the extracted script; script evaluates under a DOM stub;
fake timers drive the full loop asserting **visible** text only (live-region
`.ui-rstr__sr` nodes excluded from visibility; every text selector scanned
for `display:none`/`visibility:hidden`/`color:transparent`/`font-size:0`);
pixel-mark cell count = 9; all five loop transitions; stopped/failed/done
chrome; dismiss flow; `data-theme="dark"` override + toggle flip.
Dark theme uses the spec tokens (surface `#1c1c1f`, ink `#ededed`,
amber-on-`#451a03`, etc.). Default theme is light, matching the original
demo's appearance.

## How to test
Open `index.html` in a browser: watch one full loop (~15 s), press Esc to
stop, Continue/Retry/Dismiss/Copy/Regenerate to drive states, and toggle
the sun/moon button (top-right) to check dark mode.

## Not verified
Pixel-perfect rendering vs the original site (no screenshots taken);
`prefers-reduced-motion` and clipboard copy rely on browser behaviour not
covered by the stub harness.
