# Voice Session — replica report

## What was built
`index.html` (60 KB, single self-contained file, no network, no external assets,
system fonts) — a clean-room replica of the **Voice Session** affectUI component:
a live voice-agent call with scrolling waveforms, streaming transcripts and a
latency breakdown panel.

- **Header**: deterministic 3×3 pixel-mark for agent id `atlas` (exactly 9 cells,
  twinkles while thinking/speaking) + title **Atlas** + subtitle **Billing support**
  + recording dot + settings gear with popover menu.
- **Live panel**: `Turn N` counter + status badge
  (Listening green / Thinking blue / Speaking blue / Ended grey / Paused),
  transcript of the last two messages with word-by-word reveal, and two
  waveform lanes (canvas, scrolling bars, masked left fade) with latency
  pause-pills (hover/focus tooltip with per-stage breakdown).
- **Latency panel**: big `voice to voice` number with unit, over/under delta badge
  vs budget (or `Measuring` while thinking), segmented bar with budget marker,
  3-column legend (Endpoint / Transcribe / Model / Voice / Network) with icons
  and animated count-up values.
- **Footer**: `Call ended` note, call-time clock (starts 01:36), turn count,
  P50 median voice-to-voice, Pause/Resume and Barge in buttons.
- **Themes**: visible sun/moon toggle (top-right) switching `data-theme` on
  `<html>`; default **light** = the original demo's appearance. All colours are
  CSS custom properties per the spec tokens (dark: surface `#1c1c1f`,
  page `#101012`, ink `#ededed`, …).

## Original data / behaviour matched (verbatim)
- Agent `{id:"atlas", name:"Atlas"}`, subtitle `Billing support`, person `Maya`.
- All 5 prehistory pairs + all 4 live turns with exact strings, exact latency
  stage values (Endpoint/Transcribe/Model/Voice/Network) and totals
  (625 / 1060 / 610 / 550 ms), and `cutAt: 0.5` barge-in on turn 2 with the
  `Interrupted` pill.
- Timings: 700 ms opening, 300 ms/person-word, endpoint→thinking→remainder,
  260 ms/agent-word, 900 ms + 3200 ms outro, then loop restart from prehistory.
- ms/clock formatting (`625 ms`, `1,060 ms`, `01:36`), P50 median, budget
  options 600/800/1000 (default 800), menu sections
  (Call: Show transcript / Noise reduction / Record call; Latency budget;
  Copy transcript / Download recording), keyboard nav (arrows/Home/End/Escape),
  pause freezing timers, Barge in interrupting speech.

## Deliberate deviations (noted)
- Person avatar uses the initial `M` (the original `/avatars/mara.jpg` is an
  external asset — not allowed offline).
- `Record call` toggles a small red dot in the header (effect invented; the
  original menu item's visual effect is not observable in the demo data).
- `Download recording` saves a `.txt` transcript blob (functional offline
  equivalent). `Copy transcript` uses the clipboard when available.
- Hard-rule compliance: canvas-only fast tick (no DOM rebuilds in the rAF
  loop; transcript/legend mutate in place), settings popover opens on
  `pointerdown`/`mousedown` capture, hover/focus legend highlight only flips
  `data-*` attributes, `[hidden]{display:none}` guard present, SVG classes set
  via `setAttribute`, no browser launched (node-only verification).

## Verification
- `node --check` on the extracted page script: **passes** (extracted as the
  longest `<script>` block, since `<head>` now also holds the tiny `/*noflash*/`
  guard — the old greedy first-to-last `match` broke after the guard was added).
- `node harness.cjs` (in-dir DOM-stub harness with virtual timers + fake DOM,
  advances through the **full loop**: turns 1–4, interrupt, pause-freeze,
  barge-in, ended, restart, menu, budget switch, dark/light toggle):
  **97 passed, 0 failed**. Assertions check *visible* text (hidden ancestors and
  `display:none`/`visibility:hidden` excluded) plus a CSS audit (no text-bearing
  class hidden by author CSS outside responsive queries; required tokens and
  `[hidden]` rule present; no network references).
- Light **and** dark checked: theme toggle flips `data-theme`, transcript/badge/
  big-number stay visible in dark, dark token values asserted.
- Browser-QA note regression (theme must not reset demo): mid-loop (Turn 8,
  speaking) the harness clicks the toggle light→dark and dark→light and asserts
  synchronously that `S.repl` / `ctl.run` / `S.turns.length` / words / status are
  untouched, that `vsn-theme` persists (`dark`/`light`), and that after +3 s in
  each theme the generation/turn-count never shrink and the turn label moves
  forward (never back to `Waiting`/prehistory) with transcript/badge/big-number
  still visibly painted.

## Browser-QA fix (2026-11-26) — theme toggle must not reset demo state
- Ground truth first (`demo-original.js`): the original ships **no theme-toggle
  JS at all** — only 2 `data-theme` hits, both CSS `:where(.dark,
  [data-theme="dark"])` overrides. Theme is an external shell concern and is
  CSS-only, so it can never restart the demo; the loop (`useEffect(…, [p])`,
  ending with `a("ended")`, 3200 ms outro, then replay-key increment) has zero
  theme dependency, and its timers are pause-aware. So the QA requirement is
  valid: theme changes must be pure `data-theme` flips.
- Root causes in the replica: (1) the theme click handler never persisted the
  choice (`localStorage` never written, so a reload always lost the theme), and
  (2) the `/*noflash*/` guard injected later was generated with an empty key
  (`var t=null`, no `localStorage.getItem`) because there was no `*-theme` key
  to detect — first paint could never restore a stored theme. Neither path
  touched demo state (`S`/`ctl`/`cols`/`runDemo`), but without persistence and
  without a continuity assertion the QA note could not be proven fixed.
- Fix (theme-only, demo untouched): added `THEME_KEY="vsn-theme"`; the toggle
  now only flips `document.documentElement[data-theme]`, persists it, and
  repaints the sun/moon icon — zero references to demo state; `init()` restores
  a stored theme (if any) before first paint logic runs, keeping the PASSED
  default (**light**, the original demo's appearance) for first-time visitors.
  No timer/loop/render code was changed.
- Harness also repaired: script/style extraction now takes the longest
  `<script>` block and joins all `<style>` blocks (head-guard-safe).

## How to test
Open `index.html` in a browser. To re-run the automated checks:
`node -e "const fs=require('fs'),html=fs.readFileSync('index.html','utf8');const src=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).reduce((a,b)=>a.length>=b.length?a:b);fs.writeFileSync('verify-script.js',src)" && node --check verify-script.js && node harness.cjs`
