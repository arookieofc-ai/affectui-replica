# agent-run targeted fix — REPORT

## Scope
Targeted fix of `./index.html` only. No rebuild; everything else kept identical.
Constraints kept: `/*noflash*/` guard, in-place updates only, zero `innerHTML`
writes after init, demo data verbatim (`STEPS`, `DRAFT`, `FILES` untouched).

## Defect 1 — duplicate "Waiting for your approval" in Activity (FIXED)
- Root cause: in the pre-approval state two rows in the same Activity block
  contained the string: (a) the per-step note
  (`refs.feedNotes[3]`, text `"○ Waiting for your approval"`), and (b) the
  block footer loader (`#loaderText`, text `"Waiting for your approval"` with
  the CSS spinner, which reads as the "↻" row).
- Original check (`./demo-original.js`): the canonical approval-state row is
  the per-step `ui-ar__note` (`H[t]==='approved' ? 'You approved this step' :
  ... : 'Waiting for your approval'`), which is the element that flips to
  `"✓ You approved this step"` on approve. Kept that form (the "○" note).
- Fix (2 lines in `refreshChrome`): the footer loader no longer renders the
  duplicate Waiting string and is hidden while waiting:
  - `loaderText` is now `done ? "Done in …" : stopped ? "Run stopped" : "Using tools…"`
    (no Waiting case at all),
  - `loader.style.display = (done || waiting) ? "none" : "flex"`.
  - After approve the single note still flips via the existing `decide()`
    path (`note.textContent = "✓ You approved this step"`), verified by harness.

## Defect 2 — "Steps 3/5" vs "Activity 4 of 5" (NOT changed — matches original)
- Checked `./demo-original.js` before changing anything. The original computes:
  - Steps figure: `` `${K.size} / ${k.length}` `` where
    `K = events(kind==='finish')` (finished steps),
  - Activity header: `[G.size, ' of ', k.length]` where
    `G = events(kind==='step')` (started steps).
- At the waiting moment (step 4 started, 3 finished) the original therefore
  shows exactly `3 / 5` vs `4 of 5` — the reported numbers. The replica does
  the same (`doneSet.size` vs `activeSet.size`). The two counters measure
  different things by design (done vs shown/started), so per the task rule
  ("if the original behaves the same way, do NOT 'fix' it") no change was made.

## Defect 3 — 5 blank boxes under Files (FIXED)
- Root cause: replica-only placeholder chart — JS created five empty `<i>`
  bars (`[22,34,48,58,72].forEach…appendChild`) inside `#chartRow`, styled by
  `.chart i` as hollow rectangles.
- Original check (`./demo-original.js`): the Files section is
  `Object.keys(j).length>0 && (label 'Files' + file list names:Object.keys(j))`
  with `j = {"board-memo-q3.md", "q3-revenue.csv", "churn-chart.png"}` — real
  file chips/cards, no bar chart. The replica's 3 `chipfile` chips already
  match this, so they were kept verbatim.
- Fix: removed the `#chartRow` div from the HTML and removed the JS lines that
  populated it. `chartRow` now has zero references in the file. Files shows
  exactly the 3 real chips: `board-memo-q3.md`, `q3-revenue.csv`,
  `churn-chart.png`.

## Verification (node only, no installs)
- `node --check harness.js` — passes.
- Inline main script compiles (`vm.Script`, equivalent of `node --check`) — passes.
- `node harness.js` — DOM-stub harness, passes in **light AND dark**:
  - waiting state: exactly **1 visible** "Waiting for your approval"
    (note visible, loader `display:none`), `figSteps="3 / 5"`,
    `actCount="4 of 5"` (original semantics, unchanged);
  - approve: note flips to `"✓ You approved this step"` and stays visible;
    loader contains no Waiting string;
  - files: 3 chips with real names, no `chartRow`, no empty boxes;
  - full loop to `done`, `resetInPlace()` restart, second loop to `done`:
    plan/feed/note/call/ask node identities preserved (`===`);
  - `innerHTML` writes after init: **0**.
- Static: `/*noflash*/` present, `innerHTML =` occurrences in file: 0,
  `chartRow` references: 0.

## How to test
Open `index.html` in a browser, let the run reach "Needs input", confirm one
"○ Waiting for your approval" row in Activity (no second spinner Waiting row),
click Approve (row flips to "✓ You approved this step"), and confirm Files
shows the 3 named chips with no blank boxes. Toggle the theme button for dark.
