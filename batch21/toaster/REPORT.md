# Toaster rebuild — REPORT

## What was built
ONE self-contained `index.html` (23.6KB, system fonts, no network) replicating the
affectUI Toaster demo from `demo-original.js`. Clean-room code: own DOM/CSS/JS, no
copied bundle source. Only the five icon path strings and the exact toast copy were
carried over as demo data.

- Demo panel with the original classes: `toaster-demo / toaster-demo__col /
  toaster-demo__panel / toaster-demo__card / toaster-demo__head /
  toaster-demo__doc / toaster-demo__meta / toaster-demo__name /
  toaster-demo__sub / toaster-demo__grid / toaster-demo__btn /
  toaster-demo__foot / toaster-demo__slot`.
- Header card: doc icon, `Q3 Board Report`, `Finance · edited 2 min ago`.
- Four triggers: `Save draft`, `Delete file`, `Upload report`, `Sync`.
- Inline toast slot (`data-position="top-center"`, `data-inline="true"`); the
  toaster factory defaults to `position="bottom-right"` for non-demo use.
- Behaviours: stacking with `data-expanded` (collapses when >2, expands on
  `pointerenter`/`focusin`), swipe-to-dismiss via `pointerdown`/`pointermove`/
  `pointerup` (+`mousedown` capture), auto-dismiss timers with progress bar,
  `F8` focuses the notification region, auto demo fires save@500ms /
  trash@1300ms / upload@2100ms with `duration:9000`.
- Light + dark themes via `data-theme` on `<html>`, tokens per spec, visible
  sun/moon toggle top-right persisted as `affectui-toaster-theme`. Default is the
  original demo appearance (light) unless a stored theme or
  `prefers-color-scheme: dark` applies.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`,
  `html{-webkit-tap-highlight-color:transparent}`,
  `body{font-variant-numeric:tabular-nums}`, concentric radii
  (`--radius-lg:16px` outer / `--radius:10px` inner), shadows for elevation +
  borders for structure, optical icon-side padding (`10px 14px 10px 12px`).
- v4: `/*noflash*/` guard first in `<head>` + `meta color-scheme` + inline
  `html{background}`; DOM built once at init, timers update nodes in place,
  zero `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere; SVG classes only
  via `setAttribute`; `[hidden]{display:none!important}` present.

## Verbatim demo data used (exact, including punctuation/NBSP)
- Save: title `Draft saved`, description `Q3 Board Report · all changes kept`.
- Trash: title `File moved to trash`, description `Budget-2027.xlsx`, action
  `Undo` → success title `File restored`, description
  `Budget-2027.xlsx is back in Reports`.
- Upload promise: loading title `Uploading report…`, description
  `Q3-Board-Report.pdf · 4.2 MB` (U+00A0 before MB), 2400ms resolve →
  success title `Report uploaded`, description `Shared with 4 people in Finance`;
  reject path title `Upload failed`.
- Sync promise: loading `Syncing with Google Drive…`, success `Synced`,
  2200ms reject → error title `Couldn't sync`, description
  `Google Drive didn't respond. Try again in a minute.`.
- Icons: the five `d` paths (save/trash/upload/sync/doc) from demo-original.js.
- Footer: `Press [F8] to jump to notifications`.

## Verification (node only, no browser)
- `node --check` on the extracted page script: **OK**.
- In-dir DOM-stub harness `harness.js` (`node harness.js`): **106 passed,
  0 failed**, run in both `light` and `dark`:
  - fires Save/Trash(+Undo click)/Upload/UploadFail/Sync, advances fake timers
    (2400/2200ms), asserts each exact title+description is VISIBLE as painted
    `textContent` (not just markup), hidden/leaving nodes excluded;
  - asserts promise updates keep node identity (`loadingEl === resolvedEl` for
    upload and sync), stack identity stable across the run;
  - asserts `data-expanded` collapses when crowded and expands on hover,
    `F8` focuses the region, swipe handlers run, theme toggle flips
    light↔dark, and **zero innerHTML writes after init**;
  - static asserts: noflash-first, color-scheme meta, html background,
    tap-highlight, tabular-nums, `[hidden]` rule, hover-media containment,
    tokens, all verbatim strings, no network assets.

## How to test
Open `index.html` in a browser. Click Save draft / Delete file (+Undo) /
Upload report (resolves in ~2.4s) / Sync (fails in ~2.2s with
`Couldn't sync`). Toggle the sun/moon button top-right for dark mode. Press
`F8` to jump to notifications. Re-run `node harness.js` for the stub suite.
