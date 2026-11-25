# AI Answer — replica report

## What was built
`index.html` (single file, ~36KB, no network, system fonts only) replicating the
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
  focus, closes after 140ms on leave, click toggles, Escape dismisses.
- **Footer**: Stop while streaming; Copy (clipboard + "Copied" 1800ms),
  Regenerate, Good/Bad answer with expandable reasons
  (`Not accurate`, `Wrong source`, `Too long`, `Out of date`) → "Thanks for the
  feedback". "Related" follow-ups switch question and replay the full loop.
- Hard-won rules honoured: `[hidden]{display:none}` global rule, SVG classes only
  via `setAttribute`, no `.className` assignment on SVG, no DOM rebuild on
  hover/focus, no browser launched (node only).

## Original data / behaviour matched (verbatim)
- All 3 questions, all 3 answers word-for-word (Alfama verdict, dates/stay/
  flights bullets, houses-vs-hotel, 3-day agenda), all 6 sources (Notion, Slack,
  Wikipedia, Google Flights, Airbnb, Booking.com with titles, hrefs, snippets).
- Timings: reading delay `700 + min(n,4)*90` (= 1060ms for 6 sources), stream
  speed 38 tok/s, source stagger `120+i*90` / rest `390ms`, follow-ups
  `80+i*60`, Copied `1800ms`, popover close `140ms`, elapsed format
  (`4.2s` / `1m 05s`), status strings, cite-merge rule, snippet-only-for-single.
- Goo-mark label with scan/follow/blink eye animations per phase.

## Verification (node only, files in this dir)
- `node --check` on the extracted page script: **OK**.
- `node verify-ans.cjs` — in-dir DOM-stub harness (fake timers + rAF) that boots
  the real page script, advances through reading → writing → done, and asserts
  **visible** text (hidden-ancestor/inline-hide aware): **ALL CHECKS PASSED
  (73 checks)**, covering full loop for two questions, stop/copy/feedback,
  popover open/close + capture listener, theme toggle light→dark→light with
  dark token values, no-network, `[hidden]` rule, and no global resets.
- Light AND dark checked: default `data-theme="light"`, toggle flips icons +
  `aria-label`, dark token block (`#1c1c1f`/`#101012`/`#2e2e33`) verified.

## Not verified / notes
- No browser available here (headless Chrome cannot run in this environment), so
  pixel-level rendering, real fonts, and actual clipboard writes were not
  eyeballed — DOM behaviour and computed visibility were verified via the stub.
  Open `index.html` in a browser to inspect visually.
- Favicon tiles are letter monograms (brand SVG paths not copied); goo mark is
  a simplified gradient blob with the same scan/follow/blink phase behaviour.
- `ResizeObserver` height animation from the original is omitted (visual only).
