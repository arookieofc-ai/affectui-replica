# agent-trail — replica report

## What was built
`index.html` (33 KB, self-contained, no network, system fonts) — a clean-room replica of
the affectUI Pro **agent-trail** component: a quiet step trail with progress count, live
running timers, expandable sub-steps, and an approval-wait ("Needs you") step with
Approve / Decline. All HTML/CSS/JS is original; the compiled demo bundle was read only
to extract behaviour, strings, and timings — no source was copied (tool icons are plain
initials in circles, drawn from scratch, not the vendor SVG paths).

## Original data used (verbatim from `demo-original.js`)
- Task title `Fix the checkout crash`, agent `Claude Code`, header count `done/total`.
- Labels: `Working`, `Approval`, `Needs you`, `Failed`, `Declined`, `Done`, `Up next`,
  `No steps yet`, `Untitled step`, `earlier`, `more`, `Show fewer`, `Approve`, `Decline`.
- Steps: `Read the bug report` (done, 8s, Linear) · `Reproduce the crash` (done, 34s, Vercel) ·
  `Patch the checkout form` (running→done, status `Editing`→`Testing`, 52s, GitHub) ·
  `Write the release note` (pending→running `Writing`→done 11s, Notion) ·
  `Open a pull request` (gate pending→waiting→running `Opening`→done 6s / declined, GitHub).
- Sub-steps: `Found the empty-cart case / cart.ts:142`, `Added a guard and 2 tests / +18 −3`,
  `Running the test suite / 182/214`, `All tests pass / 214/214`;
  `Added a 2.4.1 entry / CHANGELOG.md`, `Linked issue #318`.
- Approval ask text: `Open PR #482 “Fix crash on empty cart” against main – 3 files, 214 tests passing`.
- Timeline: the exact 6-frame script with delays 5200 / 7400 / 2600 / 5000 / 5000 / 14000 ms,
  looping; running `patch` clock starts 21 s in the past; approve→`Opening`→done (2.6 s),
  decline→declined→loop restart (4.2 s); 1 s timer tick; duration format `<1s/Ns/Nm/Nh/Nd`;
  running steps start expanded; polite `aria-live` announcements on state change.
- One deliberate deviation: agent identity is a deterministic **3×3 pixel-mark** for agent
  id `claude-code` (hue + pattern hashed from the id; working state twinkles) per spec v3,
  instead of the vendor logo. Markup contains **exactly 9 cells** (verified by harness).
  Tools stay small circular icons (initials) per v3. No token-count bar was added: the
  original uses the step count (`2/5`-style, thin 3px bar, right-aligned label), so adding
  `44k / 200k` tokens would have been invented data.

## Interactions
Auto-playing demo loop · click any step with sub-steps to expand/collapse · `Needs you`
badge toggles the approval panel (Esc closes) · Approve / Decline drive the
approved/opened and declined/reset flows · ↺ replay restarts · sun/moon toggle switches
`data-theme="light"|"dark"` (defaults to `prefers-color-scheme`, toggle overrides and
persists) · keyboard-focusable rows, `:focus-visible` outlines, `prefers-reduced-motion`
disables animation · narrow screens stack (tool detail hides under 420 px).

## Verification (all passed)
- Size 33 257 bytes (< 200 KB); no `http(s)`/`@import` references.
- Pixel-mark cell count = 9 (exactly).
- `node --check` on the extracted page script: OK.
- Headless run (temporary DOM-stub + controllable-timer harness, since removed): boot
  renders 5 steps with exact original titles/durations/ask text; advancing 40 s walks the
  full 6-frame loop (48 renders); 1 s ticks re-render the running clock; `approve()` →
  running → done at 2.6 s → loop restart; `decline()` → declined → loop restart at 4.2 s;
  `fmtDur` spot-checks (`8s/34s/52s/1s/<1s/2m 5s`) and pixel-spec determinism pass.

## Token audit
Every colour goes through `:root` / `html[data-theme="dark"]` custom properties —
surface, page, ink, muted, subtle, border, accent (+wash/ink), waiting (+bg/ink),
failed (+bg), ok (+bg), focus, shadow; radii 16/10/6 px; pills 999 px; card 1 px border +
soft shadow, hover lift, 150–200 ms transitions. No hard-coded hex in component rules
(outside the token definitions). Dark theme redefines the same tokens (surface `#1c1c1f`,
page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`;
amber `#fbbf24` on `#451a03`, text `#fde68a`).

## Contrast results (computed, AA ≥ 4.5 for body text)
Light — ink/surface 17.93, muted/surface 4.80, waiting-ink/bg 6.37,
accent-ink/surface 5.93, failed/surface 4.83. Dark — ink/surface 14.52,
muted/surface 6.63, waiting-ink/bg 12.03, accent-ink/surface 10.20, failed/surface 6.15.
All pairs pass; both themes checked.

## How to test
Open `index.html` in a browser (no server needed). Watch one full ~39 s loop, click the
`patch`/`notes` rows, open `Needs you`, try Approve and Decline, toggle the theme.
