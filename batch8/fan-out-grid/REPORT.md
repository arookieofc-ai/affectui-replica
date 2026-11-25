# fan-out-grid — clean-room replica report

## What was built
`index.html` (34,920 bytes, single self-contained file, no network, system fonts) replicating the
affectUI Pro `fan-out-grid` component (CSS class family `ui-fog`, "Fan-out · Enrich 240 leads"):
a tray card with header (fan mark, title, job name, live `done / total`, live cost, elapsed/ETA),
a grid of 240 status squares, a hover/pinned tooltip popover, a footer legend filter with counts
plus a "Retry failed" button, and a polite live region. Page chrome adds only a theme toggle
(sun/moon, top-right) and a "Replay run" link. All code is written from scratch; the compiled
demo was read only to extract data values, timing constants and behaviour — no source was copied.

## Original demo data used (exact, no invented data)
- 240 tasks × 16 workers on an earliest-free-worker schedule starting at +60 ms gaps.
- Deterministic PRNG `frac(sin(n·9301+49297)·233280)` for durations (`650+rnd·1300` ms),
  retry lottery (`rnd(n+500)<0.07`), costs (`0.006+rnd(n+900)·0.014`), first-attempt split
  (55% + 450 ms gap) — verified spot values (`base[0]` = `northwind.io` / Researcher 1).
- Labels from the exact 16 prefixes / 15 suffixes / 4 TLDs; findings = the 6 exact
  "… people · … found" strings; errors = the 4 exact strings (429 / crawler / no company / 30 s).
- Hard failures exactly at indices 61, 143, 208 (`quartzworks.com` fails with "Timed out after 30s").
- Timing constants: tick 100 ms, end-freeze tail 1800 ms, retry attempt 1400 ms, post-retry
  cooldown 4500 ms then the loop restarts. Formatters (cost/duration/number) follow the original rules.
- Header/footer/tooltip/legend/keyboard semantics match: `done/total`, cost, `X so far` /
  `~X left` (ETA = avg duration × waiting ÷ 16 once ≥3 samples) / `Finished in X`; tooltip meta
  `agent · duration · cost · N attempts` or "Waiting for a worker", error only for failed/retrying,
  result only for done; legend covers done/running/retrying/failed with zero-count hiding;
  arrows/Home/End move, Enter/Space pins, Esc clears; SR live region announces progress/finish.

## Interactions
Hover → tooltip; click / pointerdown / Enter → pin (toggle); legend → status filter;
"Retry failed" → the 3 failed tasks run 1400 ms then finish (cost ×1.5, 3 attempts) and the run
loops after the cooldown; "Replay run" restarts; theme toggle switches `data-theme` (persisted,
defaults to `prefers-color-scheme`). Narrow screens (<560 px) shrink cells and stack the legend.

## Engineering constraints honoured
- **No rebuild in the tick loop**: the 240 cells, 4 legend buttons and the tooltip skeleton
  (including the pixel-mark's 9 `<i>` cells) are created once; each 100 ms tick only mutates
  `data-status` / `data-dim` / text content, and only when values actually change
  (harness asserts frozen ticks cause zero DOM churn and node identity is preserved).
- **Pin on `pointerdown`/`mousedown` capture** (plus click fallback), so a real mouse click can
  never be lost across a re-render.
- **Pixel-mark**: deterministic 3×3 mark per agent id (`Researcher N`) in the tooltip —
  markup contains exactly 9 cells; working cells twinkle via `data-busy`.

## Token audit
Every colour resolves through `:root` / `:root[data-theme="dark"]` custom properties
(page/surface/ink/muted/text/subtle/border/shadow/focus/accent + per-status bg/edge/ink);
no ad-hoc hex per element (only hue-rotate math for the decorative pixel-mark).
Dark theme re-themes all tokens (surface `#1c1c1f`, page `#101012`, amber retrying adjusted to
`#fde68a` on `#451a03`); both themes were inspected via token values and the harness theme toggle.

## Contrast results (measured, text on background)
Light: ink/page 16.74, muted/page 4.59, muted/card 4.80, running-ink/bg 5.25, retrying 6.37,
done 5.59, failed 4.52 — all ≥ 4.5. Dark: ink/page 16.23, muted/page 7.42, running 7.16,
retrying 12.03, done 6.69, failed 6.57. Two deliberate deviations from the original hex for
legibility, noted in code: running pill ink `#0190fe→#0b64b8` (was 2.89), done pill ink
`#1e8a4f→#166b3d` (was 3.73); retrying uses the spec amber pair. Filter-dimmed cells stay at
opacity 0.75 with reduced saturation per the v3 legibility rule (original used 0.2).

## Verification
- `node --check` passes on the page script and `harness.js`.
- `node harness.js` (DOM-stub loading the page's actual script, controllable clock): **all 54
  checks pass** — schedule counts over time, freeze at `LAST_END+1800` with exactly the 3 hard
  fails, no frozen churn, tooltip variants (done/failed/queued), exactly-9-cell pixel-mark,
  pointerdown pin surviving ticks, legend filter without rebuild, retry→done→loop restart,
  theme toggle + persistence, keyboard pin/clear, exact data spot-checks, <200 KB, no network URLs.
- Could not verify: pixel-perfect visual match against the proprietary rendered demo (no
  screenshot available in this environment) and real-browser pointer/keyboard feel — open
  `index.html` in a browser (toggle the theme button) for a final visual pass in light and dark.

## Files
- `index.html` — the deliverable. `harness.js` — headless verification (kept, per instructions).
  `demo-original.js` — pre-existing compiled demo, untouched. `REPLICATE_SPEC.md` — pre-existing spec.
