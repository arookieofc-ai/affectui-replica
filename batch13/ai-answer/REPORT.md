# AI Answer — replica report

## What was built
`index.html` (single file, ~48KB, no network, system fonts only) replicating the
affectUI **AI Answer** component: a streamed AI answer with sources, citations,
copy, regenerate (Stop while streaming), thumbs feedback with reasons, and
follow-up questions — clean-room code written from observed behaviour.

- **Header** follows the project pattern: `offsite-planner · AI Answer` + live
  phase indicator + `6 sources · 3 questions` counts (no generic toolbar), plus a
  **sun/moon theme toggle** (top-right). Default theme = light, matching the
  original demo's appearance; toggle overrides, persisted in localStorage, and
  `prefers-color-scheme` is honoured on first load.
- **Design tokens** as CSS custom properties for every colour (light + dark sets
  per spec: surface `#ffffff`/`#1c1c1f`, page `#fafaf9`/`#101012`, etc.),
  radius `16/10/6px`, soft shadows, 14px system sans, pills `999px`, hover lift,
  focus-visible outlines, 150–200ms transitions.
- **Streaming engine**: `reading` ("Reading 6 sources") → `writing` ("Writing",
  ~38 tokens/s word-by-word reveal with caret) → `done` ("Answer",
  "Answered in Xs"). Tokens are appended progressively — the DOM is never
  rebuilt inside the tick loop. Reduced-motion users get an instant reveal.
- **Sources row**: 3 cards + `+3 more` rest chip (responsive: 2 + rest on narrow),
  staggered entrance, letter-tile favicons (no external assets).
- **Citations**: merged chips (`[1][3]` → one "Notion +1" chip), hover/focus
  highlights the matching source card (`data-lit`, no re-render), popover
  tooltip with title + snippet opens on `pointerdown` capture / mouseenter /
  focus, closes after 140ms on leave, click pins it open (second click toggles
  closed), Escape dismisses, hovering the popover itself keeps it open.
- **Footer**: Stop while streaming; Copy (clipboard + "Copied" 1800ms),
  Regenerate, Good/Bad answer with expandable reasons
  (`Not accurate`, `Wrong source`, `Too long`, `Out of date`) → "Thanks for the
  feedback". "Related" follow-ups switch question and replay the full loop.
- Hard-won rules honoured: `[hidden]{display:none}` global rule, SVG classes only
  via `setAttribute`, no `.className` assignment on SVG, no DOM rebuild on
  hover/focus or inside the tick, no browser launched (node only).

## Original data / behaviour matched (verbatim, read from demo-original.js first)
- All 3 questions, all 3 answers word-for-word (Alfama verdict, dates/stay/
  flights bullets, houses-vs-hotel, 3-day agenda), all 6 sources (Notion, Slack,
  Wikipedia, Google Flights, Airbnb, Booking.com with titles, hrefs, snippets).
- Timings: reading delay `700 + min(n,4)*90` (= 1060ms for 6 sources), stream
  speed 38 tok/s, source stagger `120+i*90` / rest `390ms`, follow-ups
  `80+i*60`, Copied `1800ms`, popover close `140ms`, elapsed format
  (`4.2s` / `1m 05s`), status strings, cite-merge rule, snippet-only-for-single.
- Popover handlers in the original: `onMouseEnter=open`, `onMouseLeave=close`
  (140ms), `onFocus=open`, `onBlur=close`, `onClick=toggle`, `Escape=dismiss`,
  pop hover clears the close timer; reasons `data-open = feedback==='down' &&
  !thanked` (chips paint only after Bad answer, hide again after a reason is
  picked). The replica keeps both conditions and adds the required
  `pointerdown`-capture open.
- Goo-mark label with scan/follow/blink eye animations per phase.

## Browser-QA fixes (this round) — root causes
1. **Click opened NO popover.** Root cause: `pointerdown` (capture) opened the
   pop and the same gesture's `click` then value-toggled it straight back
   closed (`same && !hidden → close`), so a real click flashed open→closed and
   nothing stayed. Fix: `pointerdown` records whether that pop was already open
   and never resets the open timestamp when re-opening the same pop;
   `click` after a pointerdown-open of a closed pop forces it open (stays),
   a later distinct click (timestamp aged >600ms) toggles it closed again;
   the popover container clears the close timer on `mouseenter` and schedules
   it on `mouseleave` (as the original does), plus `Escape` dismisses.
2. **First demo-question chip truncated by JS** (`slice(0,42)+'…'`). The
   original has no such truncation (the switcher is replica harness UI), so the
   slice was removed — buttons render the full question — and the chip CSS was
   changed from `nowrap/ellipsis/hidden` to wrapping (`white-space:normal`,
   `overflow-wrap:anywhere`) so the full text always paints.
3. **Feedback chips never painted.** Checked against the original: they are
   *supposed* to be hidden until Bad answer (`data-open = down && !thanked`,
   `opacity:0 + 0fr` collapsed). Root cause of the QA report: nothing in the
   old harness ever asserted *visible* reason text, so the collapsed state was
   never proven to expand. Fix: kept the original display condition, made the
   tabindex update robust (`children` fallback), and the harness now asserts
   the painted strings (`Not accurate/Wrong source/Too long/Out of date`) via a
   paint-aware `visibleText` (data-open-gated) in light AND dark.
4. **Theme toggle must not replay/restart.** Verified against code: the toggle
   handler only flips `data-theme` + icons + localStorage and never touches
   `state`/timers/rAF/`startCycle` (reading this was the "QA has been wrong"
   check — no restart path exists). Fix: locked with a comment and a harness
   regression guard asserting phase/shown-count/answer-text/`t0` are identical
   across light→dark→light, during and after streaming.

## Verification (node only, files in this dir)
- Extracted page script compiles (`vm.Script`): **OK** (~33KB page script,
  `index.html` ~48KB < 200KB).
- `node verify-ans.cjs` — in-dir DOM-stub harness (fake timers + rAF) that boots
  the real page script, advances through reading → writing → done, and asserts
  **visible** text (hidden-ancestor/inline-hide/`data-open`-aware): **ALL CHECKS
  PASSED (105 checks)**, covering full loop for two questions, stop/copy/
  feedback, popover hover + **real-click (pointerdown+click) stays open** +
  capture listener + pop-hover persistence + toggle-close, **full-text
  question chips**, **visible reason chips in light AND dark**, **theme toggle
  with zero restart** (phase/shown/text/t0 unchanged both ways), no-network,
  `[hidden]` rule, SVG-setAttribute rule, and no global resets.
- Light AND dark checked: default `data-theme="light"`, toggle flips icons +
  `aria-label`, dark token block (`#1c1c1f`/`#101012`/`#2e2e33`) verified, and
  answer / follow-ups / status / reasons / popover / chips assert painted text
  in both themes.

## Not verified / notes
- No browser available here (headless Chrome cannot run in this environment), so
  pixel-level rendering, real fonts, and actual clipboard writes were not
  eyeballed — DOM behaviour and computed visibility were verified via the stub.
  Open `index.html` in a browser to inspect visually.
- Favicon tiles are letter monograms (brand SVG paths not copied); goo mark is
  a simplified gradient blob with the same scan/follow/blink phase behaviour.
- `ResizeObserver` height animation from the original is omitted (visual only).
