# memory-panel — replica report

## What was built
`index.html` (45,320 bytes, single self-contained file, no network, system fonts only):
a clean-room replica of the affectUI Pro **memory-panel** demo. Panel max-width 380px,
tray + card, header (`Memory` + count badge + `Use memory` switch), category chips +
expanding search, grouped memory list (max-height 330px, scroll), `New memory` composer,
and a live footer caption with Undo. Page chrome adds a top bar with a sun/moon theme
toggle (`data-theme="light"|"dark"` on `<html>`, defaults to `prefers-color-scheme`,
override persisted in `localStorage`).

All markup/CSS/JS written from scratch from observed behaviour; no code copied from
`demo-original.js` (read only to extract data, copy, timings).

## Original demo data used (verbatim, no invented data)
Title `Memory`; categories derived in first-seen order: Preferences, Work, Projects.

| id | text | category | source | date |
|----|------|----------|--------|------|
| ts | Prefers TypeScript examples over plain JavaScript | Preferences | From chat | Oct 12 |
| short | Likes short answers first, details only when asked | Preferences | You added | Oct 2 |
| inter | Designs with Inter and a 4px spacing grid | Preferences | From Figma | Oct 7 |
| role | Product designer and front-end developer at a small studio | Work | From chat | Sep 28 |
| stack | Ships with React, Vite and Tailwind; deploys on Vercel | Work | From chat | Oct 3 |
| notes | Sends release notes to clients every Friday | Work | From chat | Oct 9 |
| fintech | Redesigning the onboarding flow for a fintech client, due Oct 24 | Projects | From chat | Oct 11 |
| tokens | Keeps design tokens in one tokens.json shared with the code | Projects | From chat | Oct 5 |

Original copy reused: `Use memory`, `The assistant won't use or save memories in new
chats. Nothing here is deleted.`, `Search memories`, `New memory`,
`Something the assistant should remember…`, `Enter to save · Esc to cancel`,
`Pick a category · Enter to save`, `used in answers` / `paused, not used in answers` /
`memory is off` / `Memory is off`, `Forgot “…”`, `Nothing remembered yet`,
`No memory mentions “…”`, `No memories here`, `Paused`, `Undo`, `Save`/`Cancel`,
`Edit/Pause/Resume/Forget` labels.

## Interactions (all working)
- Switch toggles enabled; when off, note unfolds, list/chips dim, caption `Memory is off`.
- Chips `All(8) Preferences(3) Work(3) Projects(2)` — radiogroup with Arrow/Home/End keys.
- Search button expands input (Esc closes + clears); filters text or category, case-insensitive.
- Hover/focus highlights row, reveals edit/pause/forget icon buttons; footer names hot item.
- Inline edit (Enter saves, Esc cancels, whitespace collapsed); pause toggles `Paused` tag;
  forget blurs out (320ms) then footer shows `Forgot “…”` + Undo (expires 5s, restores index).
- Composer with per-category radios (arrow keys), Save disabled while empty; new items get
  `source: "You added"`, today's date (`Nov 25` style), scroll into view.
- Count badge + caption numbers tween over 520ms (easeOutQuart); reduced-motion jumps.
- Scripted demo tour loops the original's steps/timings:
  700 pause short → 2700 forget ts → 2600 undo → 2200 filter Projects → 2400 filter All →
  1800 pause short. Any pointerenter/pointerdown/keydown/focus stops it permanently.
- No pixel-mark: this component has no agent identity in the original, so none was added
  (nothing invented).

## Robustness rules followed
- No rebuild inside tick loops: renders happen only on state change (regions re-render
  independently; typing in search/composer never rebuilds the focused input). The 520ms
  counter tween updates only text nodes (`renders` counter proves it: 0 extra renders
  across the whole tween).
- Tour stops on capture-phase `pointerdown`/`mousedown` before any rebuild, and all clicks
  are handled by delegation on the persistent root — a real click can't be lost across a
  tour-driven re-render.

## Token audit
Every colour resolves to a `:root` / `html[data-theme="dark"]` custom property
(`--surface #ffffff / #1c1c1f`, `--page #fafaf9 / #101012`, `--ink #171717 / #ededed`,
`--muted #78716c / #a1a1aa`, `--subtle #f5f4f4 / #26262a`, `--border #e7e5e4 / #2e2e33`,
radii 16/10/6px, shadow per spec). Component vars (`--tray/--card/--well/--hover/--track/
--tag/--red…`) map onto those tokens per theme. No hard-coded ad-hoc hex on elements
(one deliberate exception below, documented).

## Contrast results (computed, normal text AA ≥ 4.5)
- Light ink/surface 17.93 · muted/surface 4.80 · danger/danger-bg 4.70 · caption on page 4.59
- Dark ink/surface 14.52 · muted/surface 6.63 · muted/well 6.19 · danger/surface 7.42
- One near-miss fixed: spec muted `#78716c` on subtle `#f5f4f4` = 4.37 (category radios sit
  on the well fill). Light theme only, those radios use `#6e6863` (same hue family) = 5.0.
  Borders/track/knob are non-text and remain token-driven.

## Verification
- `node --check` on the extracted page script: passes.
- `node harness.cjs` (DOM-stub + virtual-clock harness kept in this directory): 19 checks
  pass — script loads, 8 verbatim seeds, tour auto-fires at ~700ms, pause/forget/undo/
  expiry/filter/search/add/edit/switch all mutate state correctly, tween advances with no
  extra renders, theme toggles `data-theme`, no 8-cell grid, 45KB < 200KB, no network refs.
- Checked in headless stub (no full browser available here); open `index.html` in a browser
  and toggle the sun/moon button to confirm both themes visually.

## Could not verify
- Pixel-exact match to the original rendered demo (no screenshot pipeline here); spacing,
  radii, folds and timings follow the extracted CSS/behaviour values.
- Real-browser focus/keyboard/container-query behaviour beyond the stubbed logic paths.
