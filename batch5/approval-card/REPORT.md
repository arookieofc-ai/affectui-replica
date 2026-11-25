# approval-card replica — report

## What was built
`index.html` (37,416 bytes, self-contained, no network, system fonts) — a clean-room
replica of the affectUI Pro approval-card component, presented as the original demo
does: a chat thread where an agent asks "I drafted the October newsletter. Ready to
send?", followed by the approval card.

- **Card 1 (exact original demo):** title `Send campaign email`, description
  `October product update · Newsletter`, risk `medium`, envelope icon, details
  `Subject = What's new in October` / `Send = Today, 9:00 AM`, recipient preview
  (`Mia, Jonas, Sara, Alex` + `+38 more` with `M/J/S/A` avatars), always-allow
  checkbox (`Always allow this action`), `Deny` + `Esc`, `Approve` + `⌘↵`/`Ctrl ↵`.
  No countdown — the original demo passes no `expiresIn`.
- **Card 2 (same component, extra states):** `Publish pricing page`, risk `high`,
  `expiresIn: 90`, an `Edit` button, and an illustrative warning preview. Clearly
  labelled on-page as "More states". The countdown format, pause-on-hover/focus,
  low-time (≤10s) warning, and `Expired` resolution all come from the original
  component logic, not invented data.
- **Header:** `October newsletter` + live `N pending · 1 agent` (derived from demo
  data; pending count updates as cards resolve) + sun/moon theme toggle.
- **Pixel-mark:** the requesting agent (`newsletter-agent`) gets a deterministic
  3×3 pixel-mark (id-hashed colour, exactly 9 `.px` cells, verified) that twinkles
  while its card is pending.

## Original data / behaviour used (from demo-original.js, re-implemented, not copied)
Labels (`Low/Medium/High risk`, `Always allow this action`, `Approve/Deny/Edit`,
`Esc`, `⌘↵`/`Ctrl ↵` platform detection), pending → busy(spinner) → resolved flow
(approve waits ~700 ms promise; deny immediate), auto-demo (press highlight at
2.8 s, auto-click at 3.0 s, reset 3.2 s after resolve, cancelled on first user
pointer/key interaction, `Replay` button after interaction), keyboard
(`Ctrl/Cmd+Enter` approve, `Escape` deny), countdown (`m:ss`/`h:mm:ss`, screen-reader
"Expires in N seconds/minutes/hours", pauses on hover/focus/busy, low at ≤10 s,
expiry → `Denied` with reason `timeout` rendered as `Expired`), relative time
(`just now / N min ago / N h ago / N d ago`, 30 s refresh), resolved row
(`Approved/Denied/Expired: title` + `· Always` + `· time`), responsive container
queries (400 px: full-width actions, kbd hidden; 340 px: tighter padding, risk-word
and row-time hidden), `prefers-reduced-motion` handling, focus management and
`aria-live` status announcements.

## Interactions
Hover/focus pauses the countdown · always-allow checkbox appends `· Always` to the
approved row · `Edit` (card 2) rewrites the Scope/Window details inline · theme
toggle flips `data-theme` on `<html>` (saved to localStorage, defaults to
`prefers-color-scheme`, original light appearance otherwise) · `Replay` re-runs the
auto-demo.

## Token audit
Every colour resolves through `:root` / `html[data-theme="dark"]` custom properties
(page, surface, ink, muted, body, subtle, tray, border, radii, shadow, amber waiting
pair, risk low/med/high pairs, ok/no pairs, timer-low, button pairs, focus ring);
no ad-hoc hex on elements. Dark theme redefines the full set (amber stays amber:
`#fbbf24` on `#451a03`).

## Contrast results (computed, AA ≥ 4.5)
Light: ink/surface 17.93, body/page 7.30, muted/surface 4.80, amber 6.37,
med-risk 4.74, high-risk 4.86, ok 4.52, timer-low 4.67, low-risk 4.76, on-button 17.93.
Dark: ink 14.52, muted 6.63, amber 12.03, med-risk 9.03, high-risk 7.42, ok 8.19,
on-button 15.00. Minimum 4.52 — all pass.
Note: two inks were darkened one step from the original bundle values to reach AA
(med-risk `#8f6c00`→`#8a6800`, 4.47→4.74; ok-ink `#1e8a4f`→`#1c7f47`, 3.93→4.52);
everything else matches the original values.

## Fixes after browser visual QA (2026-11-25)
Two defects were found against the original demo flow in `demo-original.js`
and are fixed in `index.html`:

1. **Card 1 never resolved / button stuck:** the approve button kept its busy
   spinner and lost its `⌘↵`/`Ctrl ↵` hint on resolve, and `reset()` never
   restored it — so the *second* `approve()` threw `NotFoundError` in
   `removeChild` after `busy` was already set, freezing the card busy forever
   (header stuck at `2 pending`, approve/deny dead). Fixed by restoring the
   approve button (remove spinner, re-add kbd, clear `aria-disabled`) on
   resolve and on reset, with a safe remove guard. Card 1 wiring is now
   exactly the original's: `onApprove` returns a pure promise resolving after
   700 ms, the card resolves to approved, shows the one-line resolved row, and
   resets to pending after 3200 ms; auto-demo presses at 2800 ms and clicks at
   3000 ms (press highlight removed before the click, as in the original).
   Manual Approve → `Approved`, manual Deny → `Denied`, both verified across
   repeated cycles.
2. **Card 2 expiry left a ~330 px empty grey box:** the resolved
   `.ap-pending[data-leaving]` stayed in normal flow (fully transparent after
   its fade, but still occupying layout height). Fixed as in the original
   component CSS: `.ap` is now `position:relative; overflow:hidden` and the
   leaving pending card is `position:absolute; top/left/right:4px` (out of
   flow, so the tray shrinks to the collapsed row immediately), then set to
   `display:none` 350 ms after resolve (after the 280 ms leave animation);
   `reset()` restores it. Leaving cards also get `inert`, as in the original.

## Round 3 — real root cause (browser still failed after round-2 fix)
Card 1 Approve never resolved in real browsers (auto ~3.0 s click or manual
click): button went disabled, no `Approved` row, header stuck at `2 pending`,
no 3200 ms reset, second approve impossible, later Deny dead too.

Root cause: `h()` did `el.className = v` for every element. The page script
runs under `"use strict"`, and in real browsers `SVGElement.className` is a
**read-only** `SVGAnimatedString` — assigning it on `<svg>/<path>/<circle>`
throws a `TypeError`. The approve path was the ONLY path that created an SVG
element **with** a class (`h("svg", {"class":"ap-spinner", ...})`), so:

1. `approve()` set `state.busy = true`, set `aria-disabled`, removed the kbd
   hint — then called `h("svg", {class:"ap-spinner", ...})`, which threw;
2. the `r.then(onOk, onErr)` was attached *after* the spinner creation, so it
   was never attached;
3. the 700 ms `onApprove` promise resolved with no handler → `setStatus`
   never ran → `busy` stayed `true` forever → header never left `2 pending`,
   `deny("user")` early-returned on the `state.busy` guard, reset never
   scheduled.

Manual Deny on a fresh load worked because `setStatus("denied")` builds its
checkmark SVG with **no** `class` on the `<svg>` itself (class lives on the
parent HTML `<span>`), so it never hit the throwing assignment. Card 2
countdown/hover/amber/`Expired` collapse likewise never create a classed SVG.

Why round 2's 40/40 stub passed while the browser failed: the stub `El` used
a plain writable `className` string for every tag, so `el.className = v` on
SVG never threw there. The stub also asserted `row.textContent`, while a
page-wide `textContent` search can match the hidden `aria-live` `.ap-sr`
node (`Approved: ...`) even when NO visible row exists — the false-positive
`Approved` text-wait seen in QA.

Fixes in `index.html`:
- `h()` now uses `el.setAttribute("class", v)` for SVG-namespace elements
  (HTML path unchanged), so the spinner gets its class without throwing.
- `approve()` is hardened: `r.then(onOk, onErr)` is attached **before** any
  busy-flag/spinner DOM mutation, and every DOM mutation after that
  (`setAttribute`/`removeChild`/`appendChild`/spinner creation) is guarded,
  so a cosmetic DOM failure can never again strand `busy=true` with no
  resolve path. `restoreApproveBtn()` guards `removeChild` with a
  `parentNode === okB` check + try/catch.
- No behaviour change otherwise: card 1 wiring is still exactly the original
  demo (`onApprove` pure 700 ms promise, press 2800 ms, click 3000 ms, reset
  3200 ms after resolve).

`harness.js` hardened so this class of bug cannot pass silently again:
- stub `El` mimics browsers: assigning `.className` on SVG-namespace
  elements throws `TypeError`; the correct `setAttribute("class", ...)` path
  still works (old code now fails the `approve shows spinner while busy`
  check instead of passing silently).
- new `visibleTxt()` helper skips hidden `.ap-sr` subtrees; approve
  assertions now require VISIBLE card text to contain `Approved` (not just
  any `textContent`), plus `busy === false`, spinner removed, and
  `aria-disabled` cleared after resolve — on both the first and second
  approve cycles.

## Verification
- `node --check` on the extracted page script: passes.
- `harness.js` (kept in this directory): a plain-Node DOM-stub + fake-timer
  harness (no packages) that loads the real page script and asserts **46/46**:
  auto-demo press (2800 ms) / click (3000 ms) / busy spinner / `Approved` row
  / VISIBLE (non-sr) `Approved` text / busy cleared / button re-enabled /
  collapse / reset to pending / 3200 ms timing, a second full approve cycle,
  manual deny → `Denied` + `Replay` button + replay reset, card 2 countdown
  ticking/`m:ss` format/hover-pause/resume/amber low state at ≤10 s/`Expired`
  row + collapse with no leftover space, and the theme toggle both ways.
- `index.html` is now 39,296 bytes, self-contained, no network.
- No packages installed; nothing written outside this directory.

## How to test
Open `index.html` in a browser. Card 1 auto-approves after ~3 s; click anywhere
first to take manual control (`Replay` appears once it resolves). Card 2 counts
down from 1:30 — hover it to pause. Toggle the sun/moon button for dark mode.
