# commit-trail — replica report

## What was built
`index.html` (45,666 bytes, single self-contained file, no network, system fonts only)
is a clean-room replica of the affectUI Pro `commit-trail` component: a commit
timeline card showing messages, change types, authors, merges, and live commits.
All markup, CSS and JS were written from scratch; the compiled demo
(`demo-original.js`) was read only to extract behaviour, data and timings.

## Original data used (exact, not invented)
- **Branches:** `main`, `invoice-pdf`, `tax-rates` (branch switcher menu).
- **Main commits + ages:** `a41c7e2b` "Bump version in `package.json`" (Mara Lind,
  26m, release, 2 files +14/−3); `9be20f11` "Merge `invoice-pdf` into `main`"
  (Tomás Reyes, 38m, 3 sub-commits); `e02c6d97` "Fix rounding in `proration.ts`"
  (Kai Brandt, 44m, fix, 2 files +18/−9); `7c4be5f3` "Merge `tax-rates` into
  `main`" (Yuki Sato, 48m, 2 sub-commits). Sub-commit ids/messages/stats/bodies
  copied verbatim (e.g. `d7a90c4e`, `53f1b8a0` with co-author Claude, `1f9d3a6c`,
  `c3a5e912`), including body text ("Prorations now round half to even…").
- **Live commits:** `0e8f2ad5` "Retry failed webhooks in `queue.ts`" (Claude, fix)
  and `4ab73c19` "Add idempotency keys to refunds" (Ines Okoro + Claude, feat).
- **Loop timings (original `q` table):** `[0,false,1600] → [1,true,2800] →
  [1,false,4200] → [2,true,2800] → [2,false,7000]`, looping; paused when a
  details row is open, focus is inside, branch ≠ main, or reduced-motion
  (jumps to final state) — all matching the original.
- **Ref hover map (original `K`):** `queue.ts → src/webhooks/queue.ts`,
  `package.json → 3.0.4 → 3.1.0`, `invoice-pdf → 3 commits, merged by Tomás
  Reyes`, `tax-rates → 2 commits, merged by Yuki Sato`, `main → the default
  branch`, `proration.ts`, `routes.ts` (400 ms hover delay, tooltip above/below).
- **Behaviours:** relative time (`now` <45s, then `Nm/Nh/Nd/Nw/Nmo/Ny`, 30 s
  refresh tick), default-expanded merge `9be20f11`, `hasMore` fade, copy-hash
  button with "Copied" state, `aria-live` announcements ("Claude committed: …"),
  ArrowUp/Down/Home/End + Escape keyboard nav, `Committing` shimmer on pending.
- **Pixel-mark identity:** deterministic hash of the agent id → pattern with
  ≥5 of 9 cells on; Claude (the only `agent: true` author) gets the 3×3 mark.
  Every `.ct-mark` in the markup contains **exactly 9 cells**.

## Interactions (how to test)
Open `index.html` in a browser. Watch live commits land every few seconds;
hover `` `code` `` chips for tooltips; click rows to expand details/merges;
use the branch menu; toggle the sun/moon button top-right for dark mode.
Headless: `node harness.js` (DOM-stub loads the page script and advances its
timers — 29 checks, all passing) plus `node --check` on the extracted script.

## Token audit
Every colour goes through CSS custom properties (`--surface --page --ink
--ink-strong --muted --subtle --border --radius-lg/--radius/--radius-sm
--shadow --accent --accent-wash --green --red --amber(+bg/text) --focus
--tip --kind-* --ease --row/--subrow --mark`); no ad-hoc hex per element.
`data-theme="light"|"dark"` on `<html>`, default from
`prefers-color-scheme`, toggle overrides. Dark theme redefines the same
tokens (`--surface #1c1c1f`, `--page #101012`, `--ink #ededed`,
`--muted #a1a1aa`, `--subtle #26262a`, `--border #2e2e33`); amber waiting
stays amber (`#fbbf24` on `#451a03`, text `#fde68a`).

## Contrast results (measured)
Body text passes in both themes: ink/surface 17.93 (light) / 14.52 (dark);
muted/surface 4.80 / 6.63; muted/subtle 4.40 / 5.88 (≥4.5 except muted-on-subtle
light at 4.40, used only for large/bold chrome). Accent/kind/diff colours
(accent 3.27, green 3.37, red 3.76, fix 3.05, test 3.25 on light) are used for
markers, pills, +/- counts and the shimmer — the same roles and values as the
original; dark-theme equivalents are 6.0–8.7. No grey-on-grey or invisible
borders in either theme (verified by token inspection + dark toggle check).

## What could not be verified
Pixel-perfect match to the Pro screenshot (no screenshot available here);
exact easing curves beyond the extracted cubic-beziers; clipboard write in
headless stub (guarded, falls back silently). `demo-original.js` was used for
data/behaviour only — no code copied.
