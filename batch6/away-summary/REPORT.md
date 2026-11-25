# away-summary — clean-room replica report

## What was built
`index.html` (single self-contained file, ~37KB, no network, system fonts) replicating the
affectUI Pro **away-summary** ("While you were away") component: a thread-context card that lists
items needing you, failed items, and completed items, with an auto-playing live demo loop.

Page chrome: thread excerpt (user message + agent reply with pixel-mark avatar + composer mock),
the away-summary card, and a top-right toolbar with theme toggle + Replay button (chrome only,
not part of the component).

## Original data used (re-typed from `demo-original.js`, nothing invented)
- Labels: `While you were away`, `since …`, `N done`, `N need(s) you`, `N failed`,
  actions `Decide` / `Open` / `Retry`, `Show N more` / `Show less`, `Got it`,
  collapsed `You were away {since} · {n} updates`, empty-state string.
- 8 items: Ingest pipeline (needs-you, "Waiting on: Which queue – Kafka or SQS?"),
  Weekly report (needs-you, "…Send it to Dana or the whole team?"),
  Billing sync (failed, "Failed: rate limit on Stripe after 1,284 invoices"),
  Auth refactor / Usage page / Evalkit docs / Load test / Flaky tests (done + original details).
- Resolutions: ingest → "Answered: Kafka · deploying to staging",
  weekly → "Answered: the whole team · sent", billing → "Retried · synced all 3,900 invoices".
- Timings: auto-resolve ingest@3s, billing@6s, weekly@9s; auto-collapse 11.5s–13.8s;
  17s loop; visible limit 5 ("Show 3 more"); failed Retry resolves after 1200ms with spinner;
  needs-you Decide resolves immediately; Open is a no-op that freezes the loop;
  any user action (action/collapse toggle) pins currently-resolved items and freezes the loop;
  125ms loop tick; 30s clock refresh of the "since 2h 14m" label (`Date.now()-804e4`).
- Quirk faithfully reproduced: after auto-expand at 13.8s the card shows the *original*
  unresolved items again (the original only applies timed resolutions while `elapsed < 13.8`),
  until the loop resets at 17s.
- Thread texts: "Get ingest onto staging today – ping me if you need anything.",
  "On it. I'll split it into tasks and keep going while you're out.", composer "Reply to the agent…".
- Avatar pattern `[1,0,1,0,1,0,1,0,1]` reproduced as the static 3×3 pixel-mark (exactly 9 `<i>` cells).

## Interactions
Decide / Retry / Open buttons (busy spinner on Retry), Show more/less with focus moved into the
expanded rows, Got-it button + divider pill toggle, Escape collapses, polite live-region
announcements ("Ingest pipeline: done… Nothing needs you"), focus restoration across re-renders,
30s relative-time refresh, Replay button restarts the loop, sun/moon toggle switches
`data-theme="light"|"dark"` on `<html>` (default follows `prefers-color-scheme`).

## Token audit
All colours are CSS custom properties. Light: surface `#ffffff`, page `#fafaf9`,
ink `#171717`/`#1c1917`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`,
radius-lg `16px` / radius `10px` / radius-sm `6px`,
shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`,
waiting `#f59e0b` on `#fef3c7` (text `#92400e`), working `#0190fe`, failed `#f04438`.
Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`,
border `#2e2e33`, waiting `#fbbf24` on `#451a03` (text `#fde68a`), working `#4fb0fe`,
failed `#ff6b5f`. Pills fully rounded, 150–200ms transitions, 1px border + soft shadow,
hover lift states, focus-visible outlines. No ad-hoc hex colours in component CSS.

## Contrast results (WCAG, computed)
- Light: ink/surface 17.49, muted/surface 4.80 ✓, waiting-text/bg 6.37 ✓, ink/subtle 16.03 ✓
- Dark: ink/surface 14.52, muted/surface 6.63 ✓, waiting-text/bg 12.03 ✓, ink/subtle 12.88 ✓
- Status dots/icons are non-text graphics with adjacent text labels: working 3.27 / failed 3.76
  (light) and 7.26 / 6.09 (dark) — all ≥ 3:1. No grey-on-grey, borders visible in both themes.
- Verified both themes by toggling in the harness (`data-theme` light→dark→light) and by
  design-token inspection; dark uses the same tokens, not inverted text.

## Verification
- `node --check` on the extracted page script: clean.
- Real headless run: `node verify-harness.js` (kept in this directory) loads the page script
  with a small DOM stub + fake timers, fires the real 125ms interval callback, and advances time:
  **34/34 checks pass** — counts at each timed threshold, auto-collapse pill wording
  ("You were away 2h 14m · 8 updates"), loop reset, Decide/Retry/Open semantics incl. 1200ms
  spinner, Show more/less + focus, Got-it/divider/Escape collapse, live-region text, theme toggle,
  Replay, 9-cell pixel-mark, size and no-network checks. A syntax check alone was not relied on.

## Not verified / notes
- Pixel rendering vs the original SaaS page (no screenshots taken); layout/timings replicate the
  compiled demo's CSS values and keyframes. Crew-style header/token-count bar does not apply to
  this component (no such data in its demo), so the page keeps minimal thread-context chrome.
