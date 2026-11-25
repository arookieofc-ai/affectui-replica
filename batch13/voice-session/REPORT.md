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
- `node --check` on the extracted page script: **passes**.
- `node harness.cjs` (in-dir DOM-stub harness with virtual timers + fake DOM,
  advances through the **full loop**: turns 1–4, interrupt, pause-freeze,
  barge-in, ended, restart, menu, budget switch, dark/light toggle):
  **71 passed, 0 failed**. Assertions check *visible* text (hidden ancestors and
  `display:none`/`visibility:hidden` excluded) plus a CSS audit (no text-bearing
  class hidden by author CSS outside responsive queries; required tokens and
  `[hidden]` rule present; no network references).
- Light **and** dark checked: theme toggle flips `data-theme`, transcript/badge/
  big-number stay visible in dark, dark token values asserted.

## How to test
Open `index.html` in a browser. To re-run the automated checks:
`node -e "const r=require('fs').readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/);require('fs').writeFileSync('verify-script.js',r[1])" && node --check verify-script.js && node harness.cjs`
