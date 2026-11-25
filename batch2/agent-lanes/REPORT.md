# Agent Lanes — replica report

## What was built
Single self-contained `index.html` (~27 KB, no external deps) replicating the
affectUI "Agent Lanes" demo: one timeline lane per agent with task bars,
handoff connectors, and an approval card. Own HTML/CSS/JS written from the
demo's behaviour; no code copied verbatim from `demo-original.js`, no Pro
`.tsx` source used (only the public compiled demo chunk, read to extract data).

## Original demo data used (exact values from demo-original.js)
- Agents: `research` Researcher / Opus 5.5 · `writer` Writer / Sonnet 5.5 ·
  `review` Reviewer / GPT-6 Sol · `ops` Ops / Gemini 3.8 Flash.
- Tasks: `r1` Competitor pricing (done, −27→−16, handoff→w1,
  "Checked 6 competitors / Collected plans and prices / Handed the table to the Writer") ·
  `r2` Customer interviews (running from −9, "Read 14 interview notes / Grouping quotes by theme") ·
  `w1` Draft pricing page (running from −15, handoff→v2, "Outlined the page / Wrote plan copy and FAQ") ·
  `v1` PR #482 billing (done, −29→−19, "Read 12 changed files / 214 tests passed / Left 3 comments") ·
  `v2` Review pricing copy (appears at +4, "Checking tone and claims") ·
  `o1` Sync CRM (failed, −27→−20.5, "Loaded 18,240 contacts / Stopped at the API rate limit") ·
  `o2` Rotate API keys (waiting from −12, ask: "Rotate the production Stripe and OpenAI keys? Jobs reconnect in ~30 s.").
- Behaviour replicated: 30× live clock, w1 done at +4, o2 auto waiting→running at +9,
  r2 done at +13, loop reset at +17, any trusted pointer/key interaction holds the
  auto-advance (as in the original), approve (waiting→running) / reject (→failed).
- Tool badges map to the original tool slots (G/N, N/S, F/N, gh/L, F, H, S/gh) as
  small circular icons with initials; original SVGs were not copied.
- v3 additions applied: header "Agents + N working · 4 agents", token-count context
  bar "44k / 200k" (thin 3px, right-aligned label), deterministic 3×3 pixel-mark per
  agent id with twinkle while working, dimmed lanes kept at opacity ≥ 0.75,
  single-line ellipsis titles, padded detail card, reserved axis space.

## Themes checked
- Visible sun/moon toggle top-right switches `data-theme="light"|"dark"`;
  default follows `prefers-color-scheme` (localStorage override).
- Dark uses the spec tokens (surface `#1c1c1f`, page `#101012`, amber
  `#fbbf24` on `#451a03`/text `#fde68a`), not just inverted text.
- Contrast (WCAG AA ≥ 4.5) verified by script in both themes — all 12 pairs PASS:
  light ink 17.49, muted 4.80, run 5.49, done 6.49, wait 6.37, fail 6.80;
  dark ink 14.52, muted 6.63, run 8.10, done 12.26, wait 12.03, fail 11.16.
- Token audit: every `#[hex]` colour lives inside the `:root` /
  `html[data-theme="dark"]` token blocks; elsewhere only `var(--…)` (+ non-colour
  `rgba()` shadows). The single other `#482` match is the literal task title
  "PR #482 billing", not a colour. JS syntax passes `node --check`.

## How to verify
1. `open index.html` (or serve the directory) — no build, no network needed.
2. Watch bars advance at 30×; at +4 "Review pricing copy" appears and "Draft pricing
   page" completes; at +9 "Rotate API keys" auto-starts unless you've interacted.
3. Click any task bar (or Tab + Enter) for the detail card; approve/reject "Rotate
   API keys" in the lane or detail card; scrub with the slider; pause/reset.
4. Toggle sun/moon; reload with OS dark mode to check the default.
5. Narrow the window below ~720 px: lanes stack, axis and cards stay legible.

## Could not verify
- Pixel-exact colours/avatars of the original site (only the minified chunk was
  available; icons re-drawn as initial badges, pixel-marks generated per v3).
- The `44k / 200k` context figure is the v3 pattern placeholder; the demo chunk
  exposes no token counts.
