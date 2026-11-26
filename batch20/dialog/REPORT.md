# Dialog — replica report

## What was built
Standalone `index.html` (28KB, inline CSS+JS, system fonts only) replicating the
affectUI **Dialog** demo (slug `dialog`, Feedback, Free):
"Modal on dimmed backdrop with scrolling content, focus trapping, and mobile sheet."

- **Agents frame**: header `Agents` + live count badge + hint; two rows built once
  at init from the verbatim demo data:
  - `release-notes` / Release notes writer / Every Monday · posts to #eng-updates / 14 runs / blue mark
  - `inbox-triage` / Inbox triage / On every new email · labels and drafts replies / 212 runs / purple mark
  - Deterministic 3×3 pixel-mark per agent id (clean-room hash, not copied).
- **Edit dialog** (contained, `role=dialog`, size md 480px): title `Edit agent`,
  description `Changes apply from its next run.`, Name input + Instructions
  textarea, footer Cancel/Save. Contained overlay sits absolute inside the card.
- **Delete dialog** (modal, `role=alertdialog`, size sm 400px): title
  `Delete {name}?`, description `It stops running, and its {runs} past runs are
  deleted with it. This can't be undone.`, footer Keep it / Delete agent (danger).
  Confirm runs a 700ms busy state with spinner (label keeps width), then marks
  the row deleted and moves focus to that row's Undo button.
- **Dialog behaviour**: dimmed scrim, open/leave animations (200ms out),
  backdrop click to dismiss (shake when busy), Escape to dismiss, Tab focus trap,
  initial focus (`[data-autofocus]` → first control), focus restore to opener,
  scroll-lock while open, `aria-modal/labelledby/describedby/busy`,
  scrollable body with CSS-only top/bottom hairlines, mobile bottom-sheet under
  520px with safe-area padding, coarse-pointer 40px targets, reduced-motion
  1ms fallback.

## What matches the original
Layout (grey 4px tray + white 16px card, 20px panel radius = 16 + 4 concentric),
typography (15px/500 title, 13.5px body, 12–13px muted meta), sizes
(sm 400 / md 480), contained vs modal placement, danger/primary/dark-gradient
buttons, busy spinner, pixel-mark identity, and all demo strings verbatim.

## In-place updates (v4)
Rows, dialogs, and buttons are created once via `createElement`. Ticks and all
interactions update only `textContent`/`hidden`/`disabled`/attributes on existing
nodes; both row states (normal + deleted) are pre-built and toggled. No
`innerHTML` anywhere in `index.html`. Harness asserts full-loop node identity
(edit → delete-confirm → undo keeps `li`/`nameEl`/`undoBtn` `===`) and zero
`innerHTML` writes.

## v5 polish
All `:hover` inside `@media (hover:hover) and (pointer:fine)`;
`html{-webkit-tap-highlight-color:transparent}`;
`body{font-variant-numeric:tabular-nums}`; concentric radii; shadows for
elevation / borders for structure; `img` 1px inset outline per theme; icon
buttons use optical padding (10px icon side vs 12px).

## What could not be verified
No browser available (node-only verification per instructions). Native
`<dialog>`/`showModal`/container-query units were re-implemented with divs +
media queries; pixel-perfect animation curves vs the original were eyeballed
from the compiled CSS, not screenshot-compared. Real focus-ring painting and
touch-sheet gestures need a manual browser pass.

## How to test
Open `index.html` in a browser. Click Edit, Save with a new name; click the
trash icon, confirm Delete agent (busy → deleted → Undo); resize under 520px
for the bottom sheet; toggle the sun/moon button top-right.

## Verification
- `node harness.js` — 60 checks passed: noflash guard, tokens, gated hover,
  tap-highlight, tabular-nums, verbatim data, `node --check` of extracted script,
  stub-DOM visible painted text, full-loop identity, zero `innerHTML` writes.
- Light AND dark themes checked: CSS contains both token sets; harness flips the
  toggle light→dark→light and re-asserts visible text in each.
