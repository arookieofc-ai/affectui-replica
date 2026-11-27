# Dropzone — replica report

## What built
ONE self-contained `index.html` (32KB, no network, system fonts) replicating the affectUI Dropzone demo from `demo-original.js`. Clean-room HTML/CSS/JS, no copied bundle code.

- Page shell follows design tokens: light `page #fafaf9 / surface #ffffff / ink #171717 / muted #78716c / border #e7e5e4`, dark `page #101012 / surface #1c1c1f / ink #ededed / muted #a1a1aa / border #2e2e33`, radius-lg 16px / radius 10px / radius-sm 6px, shadow soft, pills 999px, 150–200ms transitions, 1px border + soft shadow, hover lift.
- Header pattern: `Dropzone` + subtitle + live pill (`No files yet` / `Uploading X of Y · …` / `N of M uploaded`) + dot, plus file-type hint. Visible sun/moon theme toggle top-right flipping `html[data-theme]`, persisted to `affectui-dropzone-theme`.
- `/*noflash*/` guard first in `<head>`: reads stored theme else `prefers-color-scheme`, sets `data-theme` before paint, plus `<meta name=color-scheme>` and `html{background:#fafaf9} html[data-theme=dark]{background:#101012}`. Default is light = original demo appearance.
- No agent identities in this component, so no pixel-marks (spec: only if component has agent identities).
- `[hidden]{display:none!important}` present. No broad `.ui-dz svg{display:block}` rule (uses `.ui-dz__badge,.ui-dz__glyph` scoped rules). All SVG classes via `setAttribute("class",…)`, never `el.className`. Hover/focus are CSS-only, never re-render. Pointerdown capture listener present on toggle.
- IN-PLACE ONLY: DOM built once at init (`ensureRow` per file). 90ms progress tick + 500ms clock tick patch only `textContent`, `data-status`, `data-hidden`/`hidden`, `aria-valuenow`, `style.transform`. Zero `innerHTML` anywhere (verified).

## Matched data / behaviour (verbatim from demo-original.js)
- Seeds: `Q3-Board-Report.pdf 4.2MB`, `Hero-Shot.png 2.6MB`, `Budget-2027.xlsx 1.3MB failAt .62`, `Product-Demo.mp4 48MB`.
- Accept: `.pdf,.png,.jpg,.xlsx,.docx,.mp4`. Hint: `PDF, PNG, JPG and more · up to 25 MB each` (NBSP). Max 25MB.
- Timings: 700ms drag preview (`Release to upload 4 files`), 1900ms start + 140ms stagger, `duration = min(9000,max(2600,size/(1.2MB)*1000))`, 90ms tick with `n*(0.92+random*0.08)`, 500ms time-left refresh, 480ms remove animation then filter.
- Formatting: `fmtSize` (B/KB/MB/GB NBSP, en-grouping), `fmtProg` (`X of Y`), `fmtLeft` (`starting/almost done/Ns left/N min left/…`), `splitName` (>24 chars → head+last14), ext colours (pdf #f04438, xls #1e8a4f, doc #4fb0fe, img #a651f0, vid #e2720e, ppt #e6730e else #8f8f8f).
- States: uploading meta `X of Y · starting|Ns left`, done `size` + check, error `Connection lost` (retryable) / `Too large – max 25 MB` / `.EXT files aren't supported`. Summary: `No files yet` / `Uploading X of Y · A of B` / `M of N uploaded` / `N file(s) uploaded`. Live region announces `name uploaded` / `name: error`. Retry clears `failAt` and restarts; Remove/Clear animate then filter; dragenter/over/leave/drop + file-input browse work.
- Final loop result (correct per original validation): 2 done + `Connection lost` (Budget) + `Too large` (Product 48MB>25MB) → `2 of 4 uploaded`; after Budget retry → `3 of 4 uploaded`.

## Verification (node only, no browser)
- `node --check .extracted.js` (script extracted from index.html): PASS.
- `node verify-harness.cjs` (in-dir DOM stub, fake timers, tracks `innerHTML` writes, checks VISIBLE `textContent` only):
  - hint visible, foot idle `No files yet`, drag preview `Release to upload 4 files`, all 4 names visible, 4 rows, `Connection lost` + `Too large` visible, footer `2 of 4 uploaded`, node identity 4/4 retained across full 16s loop, zero `innerHTML` writes after init, retry → `3 of 4 uploaded`, theme toggle light→dark→light, dark CSS present → ALL CHECKS PASSED.
- Checked light AND dark: toggle flips `data-theme`, CSS uses same tokens with dark amber/red adjustments, contrast verified (no grey-on-grey, borders visible).

## Targeted fix (2026-11-27 real-browser QA: frozen status pill)
- Defect: top-right pill froze at `Uploading 1 of 1 · 0.0 of 4.2MB` while list/footer kept updating (`2 of 4 uploaded`, Q3 100%, Budget restarting at `0.3 of 1.3MB` after Retry), in light AND dark.
- Root cause (replica-only): in `syncChrome()`, `var hdr=footText; if(lastHdr!==hdr){hdrCounts.textContent=...;hdrDot class...}` was nested inside `if(lastTitle!==titleText){...}`. Title only changes on dragCount, so after the first seed the pill branch never ran again. Footer (`lastFoot`) was outside that conditional, so it kept updating. Confirmed via in-dir stub: pill stayed `Uploading 1 of 1…` while foot went `3 of 4` → `2 of 4` → `2 of 4 uploaded`.
- Original: `demo-original.js` has no header pill (only `ui-dz__foot` summary `$`); checked full 21KB source — no `hdrCounts`/pill logic. So not original behaviour; fix is replica-side only.
- Fix (in-place, 2-brace move in `index.html`, no rebuild): close the title conditional before the pill sync, so pill syncs every `syncChrome()` from the same `footText`/aggregate (`Uploading X of Y · A of B` / `M of N uploaded`) via `hdrCounts.textContent` + `hdrDot` class (`dotlive` vs `dotlive idle`). No `innerHTML`, no node replacement, demo data/timings untouched, `/*noflash*/` guard untouched.
- Verification (node only, in-dir): `node --check .extracted.js` PASS; `node verify-harness.cjs` PASS; `node verify-pill-fix.cjs` (VISIBLE `textContent`, hidden-attr/style check, dot class) PASS — pill==foot at init/drag/seeds/mid/end (`2 of 4 uploaded`), dark Retry restarts `Uploading 1 of 4…` → `3 of 4 uploaded`, light+dark, hdr/row node identity preserved, zero `innerHTML` after init.

## How to test
Open `index.html` in a browser. Wait ~2s for autoplay seeds, watch progress/time-left, Budget fails with Retry, Product shows Too large, Clear appears. Toggle sun/moon top-right to check dark. Drag files or click browse to add more.
