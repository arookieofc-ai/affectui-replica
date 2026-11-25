# affectUI clean-room replica — worker spec

## Goal
Replicate ONE affectUI item's UI/UX as a standalone interactive HTML page. Not identical code, same look, behaviour and interactions. Clean-room: write your own HTML/CSS/JS from the public description, demo behaviour and API docs. Do NOT copy verbatim source from any fetched JS bundle, do NOT paste large excerpts from the site.

## Rules for every worker
- Output is ONE self-contained file: `index.html` in your assigned workdir (e.g. `workspace/affectui-replica/pilot/agent-tree/index.html`). Inline CSS + JS, no external deps except system fonts. No Tailwind, no build step.
- Match the original: layout, card styles, colours (light theme, white bg, soft pastel accents, amber for waiting), typography, spacing, states (working/waiting/idle), animations, hover/focus chain highlight, click-to-open details, keyboard support where the original has it, responsive (narrow = stacked/list).
- Use the demo data from the public docs page for that item (names, models, tools, tasks). If data is unknown, use plausible demo data in the same shape and note it in REPORT.md.
- Interactive, not a screenshot: buttons work, states change, timers/animations run.
- Dark mode optional; light mode is required and must look right.
- Write a short `REPORT.md` next to index.html: what you built, what matches the original, what you could not verify, and how to test it (open index.html in a browser).
- Do NOT fetch or reproduce the Pro .tsx source. The public demo chunk is compiled/minified — you may read it only to understand behaviour, never copy its code verbatim.
- Keep the file reasonably sized (<200KB).

## Model / tool
Workers run via OpenCode CLI: `opencode run -m opencode-go/muse-spark-1.3-contributor "<prompt>" < /dev/null`
Stdin must be redirected from /dev/null or the run hangs.
