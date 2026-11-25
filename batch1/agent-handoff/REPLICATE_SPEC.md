# affectUI clean-room replica — worker spec v2

## Goal
Replicate ONE affectUI item's UI/UX as a standalone interactive HTML page. Not identical code, same look, behaviour and interactions. Clean-room: write your own HTML/CSS/JS from the public description, demo behaviour and API docs. Do NOT copy verbatim source from any fetched JS bundle, do NOT paste large excerpts from the site.

## Workdir rule (hard)
- Work ONLY in this directory. Do NOT read, glob, list, or open anything outside it — no `**/*`, no parent directories, no other components. Only `REPLICATE_SPEC.md` in this directory plus the files you create here. If a tool asks for permission to read outside this directory, decline it and keep building from the prompt.

## Rules for every worker
- Output is ONE self-contained file: `index.html` in your assigned workdir. Inline CSS + JS, no external deps except system fonts. No Tailwind, no build step. Keep it <200KB.
- Match the original: layout, card styles, colours, typography, spacing, states (working/waiting/idle), animations, hover/focus chain highlight, click-to-open details, keyboard support where the original has it, responsive (narrow = stacked/list).
- Use the demo data given in your prompt (names, models, tools, tasks, step labels). Do NOT invent generic demo data when real demo data is supplied. If data is unknown, use plausible demo data in the same shape and note it in REPORT.md.
- Interactive, not a screenshot: buttons work, states change, timers/animations run.

## Design tokens (required — this is where v1 fell short)
Use CSS custom properties for every colour, so light and dark stay consistent. Do NOT hard-code ad-hoc hex colours per element.
- Light: surface `#ffffff`, page `#fafaf9`, ink `#171717` / `#1c1917`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg `16px`, radius `10px`, radius-sm `6px`, shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`.
- Status: working blue/green, waiting amber `#f59e0b` bg `#fef3c7` text `#92400e`, idle grey, failed red.
- Font: system sans (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), base 14px, titles 15–16px semibold, meta 12–13px muted. Tight, consistent spacing: card padding 12–16px, gaps 8–12px. Pills are fully rounded (`999px`).
- Polish: cards have a 1px border + soft shadow, hover lifts slightly, focus-visible outline, transitions 150–200ms ease, no jarring colours, no pure-black text on pure-white without muted secondary text. Every state must be legible; every button must have a hover state.

## Dark mode (required)
- A visible theme toggle (sun/moon button, top-right of the page) switching `data-theme="light" | "dark"` on `<html>`. Default follows `prefers-color-scheme`, and the toggle overrides it.
- Dark theme via the same tokens: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, shadows darker. Amber waiting stays amber, adjusted for dark (`#fbbf24` on `#451a03` bg, text `#fde68a`). Check contrast in both themes before finishing: no grey-on-grey, no invisible borders.
- Verify both themes: the page must look finished in dark, not just light with inverted text.

## Report
- Write a short `REPORT.md` next to index.html: what you built, what matches the original, what you could not verify, how to test it (open index.html in a browser), and confirm you checked light AND dark mode.
- Do NOT fetch or reproduce the Pro .tsx source. The public demo chunk is compiled/minified — you may read it only to understand behaviour, never copy its code verbatim.

## Model / tool
Workers run via OpenCode CLI: `opencode run -m opencode-go/muse-spark-1.3-contributor "<prompt>" < /dev/null`
Stdin must be redirected from /dev/null or the run hangs.
