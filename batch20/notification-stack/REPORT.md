# Notification Stack — replica report

## What was built
Standalone `index.html` (21.7 KB, inline CSS + JS, no external deps) replicating the
affectUI **Notification Stack** component (slug `notification-stack`, Feedback, Free).

- Stacked notice cards (max-width 380px) with the exact demo data verbatim from
  `demo-original.js`: `dark-mode` / `maintenance` / `invite`, badges New/Notice/Invite,
  titles, body copy, actions (Try it / View status#/external / Accept invite) and
  patterns (orbit / grid / rays, redrawn as clean-room SVG).
- Front card fully visible; cards behind peek by 12px each (up to 2) with
  `translateY + scale(0.95)` per depth, content faded, `aria-hidden` + `inert`.
- Dismissing the front card (× button or `Esc`) plays the 320ms slide-right/fade
  leaving animation, then reveals the next card; section height tracks
  `frontHeight + peek` with the 460ms ease. Counter pill (`3 of 3` → …) updates.
- Empty state ("You're all caught up" + Replay button) appears when the stack is
  empty; the stack auto-replays after 1200ms, matching the original demo's
  generation-key remount loop — but done **in place** (same nodes, no rebuild).
- Action behaviours: "Try it" toggles the theme, "Accept invite" becomes
  "Accepted ✓" in place, "View status" is an external link (`#`, `target=_blank`).
- Theme toggle (sun/moon, top-right) switching `data-theme="light"|"dark"`,
  persisted to localStorage, defaulting to `prefers-color-scheme`.
- v5 polish: all `:hover` rules inside `@media (hover:hover) and (pointer:fine)`,
  `-webkit-tap-highlight-color:transparent`, `tabular-nums` on body, concentric
  20px card radius over 10px buttons, shadows for elevation, close-button optical
  padding nudge, `prefers-reduced-motion` guard, `focus-visible` outlines.

## Match vs original
- Matches: card geometry, badge/close/title/text/button styling, pattern position
  (top-right, masked), peek/scale/depth math, 320ms leave / 460ms settle /
  1200ms replay timings, dark-mode palette shift, demo copy verbatim.
- Adapted (page chrome, not component): centered demo page with header
  (name + count pill + theme toggle), live region, empty-state panel, Esc hint.
  Clean-room CSS/JS written from behaviour — no compiled source copied.

## Verification (node only, no browser)
- `node --check harness.js` — pass
- `node harness.js` — ALL HARNESS CHECKS PASSED:
  - VISIBLE painted text asserted (front title "Dark mode is here", body copy,
    all 3 titles + action labels present in painted text, front card not hidden)
  - full-loop node identity (dismiss ×3 incl. Esc, auto-replay; same 3 article
    objects, same order, counter restored)
  - zero `innerHTML` writes after init (0 total; app script contains none)
  - light AND dark themes (data-theme switches both ways, toggle glyph updates)
- `node --check inline.check.js` (extracted app script) — pass

## How to test
Open `index.html` in a browser. Click × (or press Esc) to dismiss the front card;
after all three, the stack replays. Toggle sun/moon (top-right) to check light
and dark modes. I checked both themes via the harness (data-theme switching)
and token review (dark surface `#1c1c1f`/page `#101012`, amber preserved via
badge tokens); visual browser confirmation was out of scope for this environment.
