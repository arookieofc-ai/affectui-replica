# Agent Plan — REPORT

## What was built
`index.html` (36 KB, self-contained, no external deps) replicates the affectUI **Agent Plan** demo as a clean-room interactive page.

Layout mirrors the original `.ui-pl` card: tray + inner card (max-width 460px), header meta row (`Plan · 5 steps` + `~2 min` estimate with clock icon), 15px semibold title, numbered step list with vertical rail, add-step row, footer with hint/actions, `aria-live` announcements.

## Original demo data used (from `demo-original.js`, not invented)
- Title: `Prepare the Q3 board update` · Estimate: `~2 min`
- Steps (exact titles/details/tools):
  1. `Pull Q3 revenue and ARR` / `Monthly revenue, ARR and net retention` / `stripe.query`
  2. `Summarize product launches` / `Shipped projects and adoption` / `linear.search`
  3. `Build the KPI slides` / `Six charts in the board template` / `slides.create`
  4. `Draft the board memo` / `One page, wins, risks and asks` / `docs.write`
  5. `Send the draft to Maya for review` / (no detail) / `gmail.draft`
- Statuses: `Pending / In progress / Done / Failed / Skipped`
- Failure: step 3 (`slides`) fails first pass with `Slides API timed out after 30s` + `Retry from here` button
- Timings: revenue 1300ms, launches 1100ms, slides 1400ms, memo 1250ms, email 900ms — live per-step timer (`0.0s` under 10s) and footer elapsed; done shows `took Xs` title; done footer `Plan done in Xs`
- Strings: `Drag to reorder · double-click to rename`, `Add step` / `Add a step at the end`, `Run plan` / `Cancel` / `Run again`, `Press Enter to rename, Alt plus arrow keys to move, Delete to remove.`, `Running plan`

## Behaviour (own implementation)
- Draft: double-click/Enter renames inline, Alt+Up/Down or grip-drag reorders, Delete removes, input adds. Run plan disabled when empty.
- Run: sequential simulated run with spinner markers, rail fill, live timers (100ms tick). First pass fails on slides; retry button (focused after fail) resumes from that step; second pass / Run again succeeds.
- Cancel resets to original 5 steps draft. Keyboard focus, `aria-label`s, focus-visible rings, `prefers-reduced-motion` respected.

## Tokens
Light: `--page #fafaf9 --surface #ffffff --ink #171717/#1c1917 --muted #78716c --subtle #f5f5f4 --border #e7e5e4 --radius-lg 16px --radius 10px --radius-sm 6px --shadow 0 1px 2px…/0 4px 16px…`; waiting amber `#f59e0b/#fef3c7/#92400e`; failed `#c4320a/#fdf2f1`.
Dark: `--surface #1c1c1f --page #101012 --ink #ededed --muted #a1a1aa --subtle #26262a --border #2e2e33`; amber `#fbbf24/#451a03/#fde68a`.
Toggle: sun/moon button top-right, `data-theme` on `<html>`, default follows `prefers-color-scheme`, override saved to `localStorage`.

## Verification
- Token audit: `grep #[0-9a-f]` → 51 hex hits, all inside the two token blocks; zero outside → PASS.
- Contrast (WCAG AA): light ink 17.93, muted 4.80, amber 6.37, failed 5.52, chip 6.72; dark ink 14.52, muted 6.63, amber 12.03, failed 6.09, chip 7.56 → all ≥4.5 PASS.
- `node --check` on extracted script → OK. Size 36KB < 200KB.
- Checked light + dark visually via token review (card, rail, chips, error, pills legible; borders visible in dark).
- Clean-room: behaviour/markup understood from compiled bundle; all HTML/CSS/JS written fresh; no verbatim copy; no Pro .tsx fetched.

## How to test
1. Open `index.html` in a browser.
2. Draft: double-click a step to rename, Alt+Arrow to move, `Add step` to append, × to remove.
3. Click `Run plan` → watch live timers → fails on step 3 with `Slides API timed out after 30s` → click `Retry from here` → completes → `Plan done in Xs` → `Run again`.
4. Click sun/moon toggle top-right; reload with OS dark mode to check default theme.
