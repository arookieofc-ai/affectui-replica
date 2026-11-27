# REPORT — Model Wheel replica

## What was built
`index.html` (20.6 KB, single self-contained file, no network, system fonts only):
a **Model Wheel** — AI model names on a turning drum. Eight model rows rotate
vertically through a viewport; rows bend at the edges (scaleX shrink + fade with
distance from center, plus top/bottom gradient fades for the cylinder illusion)
and the drum decelerates to land each pick resting on a static **gray fill**
selection band at center (`--select`: `#e9e7e4` light / `#2e2e33` dark).

Loop (deterministic state machine on a 120 ms tick, `spin → settle → landed → …`):
fast spin (~22 ticks) → ease-out settle onto the next row → pause on the gray
fill (~16 ticks) showing `Landed on <model> · spin N · T.s`, then the next model.
Full loop = all 8 models, then wraps. Controls: Prev / Spin–Pause / Next /
Details; rows are clickable; ArrowUp/Down + Escape keyboard support; a Details
dialog opens on `pointerdown`/`mousedown` **capture**; header follows the
required pattern (`model-wheel` + `1 spinning` working count + `8 models`);
token-context line (`44k / 200k`, thin 3 px bar, right-aligned label).

## Demo data / behaviour match
`demo-original.js` in this directory is only a stub — it renders an empty
`div.model-wheel-demo` with **no names, numbers, strings, timings, or loop**,
so there was no verbatim demo data to reuse. Used plausible data in the same
shape (documented here instead of invented silently): gpt-5.2, claude-opus-4-6,
gemini-2-5-pro, llama-4-maverick, mistral-large-3, grok-4, deepseek-v4,
qwen-3-max (vendor + context per row). Behaviour/timings/loop were built from
the prompt description (turning drum, bending edge rows, landing on gray fill).
No agent identities exist in this component, so no 3×3 pixel-marks were added
(the 9-cell rule is conditional on agent identities). No content images, so the
image-outline rule is N/A. Default theme is light (the stub reveals no original
appearance; standard light demo appearance assumed).

Clean-room code: written from the observed behaviour only, no compiled source
copied. DOM is built once at init; ticks update only `transform`/`opacity`/
classes/`textContent` in place — the script contains zero `innerHTML` usage and
no hover/focus re-render paths.

## v5 polish + hard-won rules (all applied)
- All `:hover` (5 selectors) inside `@media (hover:hover) and (pointer:fine)`.
- `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`.
- Concentric radii: `.wheel-frame{border-radius:16px;padding:6px}` > `.drum{border-radius:10px}` (16 = 10 + 6).
- Shadows for elevation (cards/buttons), real borders kept for dividers/inputs/hover-selected states.
- Optical alignment: arrow icons get ~2 px less padding on the icon side.
- `[hidden]{display:none!important}` guard (beats `.backdrop{display:flex}`).
- SVG classes via `setAttribute` only (no `.className=` anywhere in the script).
- `/*noflash*/` guard first in `<head>` + `color-scheme` meta + first-paint background style; theme key `model-wheel-theme`, falls back to `prefers-color-scheme`.

## Verification (node only, no browser)
- `node --check` on the script extracted from `index.html`: **passed**.
- In-dir DOM-stub harness (stub `document`/`localStorage`/`matchMedia`, fake
  timers, `innerHTML`-write counter; files lived in this directory only, removed
  after the run): **ALL CHECKS PASSED (39/39)**, including —
  - full loop completes (8 landings in 352 ticks) with visible `Landed on <model>` text;
  - row nodes keep object identity across the full loop; status node identity stable;
  - zero `innerHTML` writes; exactly one `.is-selected` row on landing;
  - dialog opens on mousedown-capture path and closes on Escape;
  - theme toggle light → dark → light; visible status + model names in **both**
    light AND dark themes; paused tick causes no node churn.

## How to test
Open `index.html` in a browser (double-click). Watch 1–2 full loops, try
Prev/Next/Pause/Details, toggle the sun/moon button, narrow the window.
Re-verify headless: re-create the stub harness described above and run it with
`node`, plus `node --check` on the extracted page script.
