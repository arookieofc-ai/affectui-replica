# Agent workbench — replica report

## What was built
Single self-contained `index.html` (47,095 B, no external deps): a live
agent-workbench board that loops a 6-step demo request on timers.

- **Header**: project title ("Assistant · Q4 budget for Marc") + live status line
  (`Idle / Working · step N of 6 / Done · 1 agent · 3 tools · 3 files`), theme
  toggle (sun/moon, top-right, `data-theme` on `<html>`).
- **Columns** (with reserved label row, never overlapped): Requester | Agent | Files,
  plus a tools row below. Narrow screens (<720 px) collapse to a stacked list and
  the SVG wires are hidden.
- **Requester card**: pixel-mark avatar + photo fallback (`/avatars/jonas.jpg`,
  removed on error), name, message bubble.
- **Agent card**: deterministic 3×3 pixel-mark identity, Working/Done/Idle pill,
  3-slot work list (newest first, spinner + shimmer on the live step, past-tense
  text + check on completed steps).
- **Files card**: 3 uploaded files with type glyphs, meta, "Reading" tag +
  highlight on the file being read.
- **Tools**: Gmail / Google Calendar / Google Drive as small cards with circular
  icon, scope line, `Ready → Calling → Used` tag and last-action line
  ("Just now" once used in the loop).
- **Wires**: SVG overlay with ports + travelling pulse on the active endpoint;
  skipped when layout is unavailable.
- **Popovers**: click agent / tool / file to open a details dialog (facts +
  "This request" steps); closes on `Escape` and on outside `pointerdown`;
  popover content refreshes live as the loop advances.
- **Loop engine** (`createEngine`, injectable scheduler): `START_DELAY 600 ms`,
  steps s1–s6 at 1600/2000/2200/1600/1800/2000 ms, done state, 3600 ms hold,
  400 ms fade, restart. Hover/focus pauses the restart (500 ms re-checks).

## Original data used
From `demo-original.js` (re-typed, not copied): user Ryan Brooks + message,
agent (Assistant, Google account, Claude Sonnet 4.5 / Asks-first / 9:41 AM),
tools (Gmail Read & send · ryan@lumen.co; Calendar Read & book · Work; Drive
Read & share · Finance + last/when/connected facts), files (budget-q4.xlsx
48 KB, kickoff-brief.docx 6 pages, vendor-contract.pdf 12 pages + type facts),
exact step texts/targets/timings, pixel-cell delays `[0,120,240,120,240,360,240,360,480]`,
and the string→bits hash idea (own implementation, ≥5 lit cells guaranteed).
Brand glyphs/folder art are original simple SVG, not copied.

## Interactions
- Loop runs automatically; hover pauses the restart.
- Click agent/tool/file cards for details; `Escape`/outside click closes.
- Theme button toggles `light`/`dark` (persisted to localStorage, defaults to
  `prefers-color-scheme`).
- `prefers-reduced-motion` disables animation.

## Harness results (`harness-tmp.js`, in-directory DOM stub, deleted after run)
- `node --check` on the page script: **OK**.
- 22/22 assertions **passed**:
  - 6 steps s1–s6 with exact timings 1600/2000/2200/1600/1800/2000, in order.
  - Tool tags cycle `Ready → Calling → Used` (e.g. calendar Calling during
    s3/s4, drive Calling during s5, gmail Calling during s6, all Used at done).
  - "Reading" tag + highlight on `budget` during s2.
  - Done state: pill `Done` + header `Done · 1 agent · 3 tools · 3 files`.
  - Fade flag `data-fading=1` after the 3600 ms hold; loop restarts to s1/Working.
  - Popovers open for agent/tool/file; close on `Escape` / outside `pointerdown`.
  - Pixel-marks render exactly 9 cells; `markPattern` deterministic, ≥5 lit.
  - Theme toggle flips `light ↔ dark` and back.

## Token audit
- All CSS colour comes from the two `html[data-theme]` token blocks
  (`var(--…)` used 85×); **no hex colour outside the token block** in CSS.
- Hex values in JS are brand/file-type artwork fills only
  (Gmail/Drive/folder glyphs), not theme colours.

## Contrast audit (all text pairs ≥ 4.5, computed)
Initial run found 5 failures: light `faint on subtle` 4.40, `ok on okbg` 4.38,
`faint on tag` 4.17; dark `faint on subtle` 4.46, `faint on tag` 4.17.
Fixed in place with minimal token tweaks:
- light `--faint` `#78716c → #716a66`, `--ok` `#15803d → #147a3a`;
- dark `--faint` `#8b8b93 → #97979e`.
Re-audit: **19/19 pairs pass in both themes** (weakest: light `faint on tag`
4.62, light `ok on okbg` 4.73, dark `faint on tag` 4.85; body/title pairs 5–17).

## How to test
Open `index.html` in a browser. Watch one full loop (~12 s + 3.6 s hold):
steps advance, `budget-q4.xlsx` highlights, tools flip to Calling/Used, pill
goes Done, board fades and restarts. Click cards for popovers; toggle the
theme button and confirm dark mode stays legible. Both themes verified via
token/contrast audit (no grey-on-grey, borders visible).
