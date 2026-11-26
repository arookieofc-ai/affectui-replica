# REPORT — agent-chat-progress (AI Chat / Progress)

## What I built
Single-file clean-room replica `index.html` (~32KB, inline CSS+JS, no external deps, system fonts only).
Layout: left chat thread + composer, right progress rail (300px) with three collapsible sections:
Progress (5-step trail with earlier-steps toggle) / Outputs (doc preview + 3 files) / Used in this session (Uploads, Connectors, Web search, Skills).
Header shows verbatim project title `Follow-up after sales calls` + meta `Q3 Campaign · 5 steps · 4 outputs` and a visible sun/moon theme toggle top-right.

## Matches the original (from demo-original.js verbatim)
- Chat: u1 `Can you automate the follow-up…`, a1 tool `notion.search / Searched your call notes in Notion` + text + tool `drive.read_file / Read Team Directory (Meetings)` + `What happens after each call now:` bullets, u2 `Why did the first draft treat Jo…`, a2 tool `directory.match_people / Checked the call's people against the team list` + Jo Gmail explanation.
- Steps: `Read the call notes in Notion / Map the team from the directory / Build the follow-up workflow / Draft a test email for Northwind / Fix how team and customer are told apart` (all done).
- Outputs: `Northwind – follow-up email / Google Docs` preview (`Northwind: follow-up` + `Thanks for the demo today…`), `Team Directory / Google Sheets`, `Offer template.docx / Word`, `call-notes-summary.md / Markdown`.
- Used: `Uploads: call-screenshot.png +1`, `Connectors: Notion, Google Drive and Slack`, `Web search: 2 pages`, `Skills: sales-follow-up`.
- Behaviours: tool cards click-to-expand (args/result), sections collapse, earlier-steps toggle, panel open/close + Escape on narrow, composer `Reply…` → running `search / Searching your notes and the web` + `Answer: …` step → after 1800ms success `Searched your notes and the web` + `Done – I checked your call notes…`.

## What I could not verify
No browser available (per task: never install/launch a browser). Verified only with node. Visual pixel-parity vs original screenshots not checked; dark mode checked via tokens + toggle logic, not screenshots.

## How to test
- `open index.html in a browser` (or any static server), toggle Dark/Light top-right, collapse sections, expand tools, hide/show progress, narrow window to ~700px for drawer mode, send a chat and wait ~2s for the done state.
- Node verification (no browser): `node --check ./harness.js`, extract app JS and `node --check` it, then `node ./harness.js`. Harness uses an in-dir DOM stub and asserts: VISIBLE painted text (all strings above), full-loop node identity (old thread/step nodes `===` after a full send→done cycle, one appended step, no re-render), zero `innerHTML` writes after init (static scan + runtime setter count), light AND dark (`data-theme` switch + amber dark tokens).

## Checks
- `node --check` app + harness: pass.
- `node ./harness.js`: ALL CHECKS PASSED (light+dark, identity, zero-innerHTML, visible text).
- Tokens: light `surface #ffffff / page #fafaf9 / ink #1c1917 / muted #78716c / subtle #f5f5f4 / border #e7e5e4`, dark `surface #1c1c1f / page #101012 / ink #ededed / muted #a1a1aa / subtle #26262a / border #2e2e33`; amber waiting light `#f59e0b on #fef3c7 / #92400e`, dark `#fbbf24 on #451a03 / #fde68a`.
- v4: `/*noflash*/` guard first in `<head>` + `html{background…}` + `color-scheme` meta; in-place updates only (`textContent`/attrs, `appendChild` for new loop nodes, no full re-render).
- v5: all `:hover` inside `@media (hover: hover) and (pointer: fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (`--r-lg 16px / --r 10px / --r-sm 6px`), borders for structure + layered shadows for elevation, inset outline on preview page, optical nudges on icon buttons.
- Clean-room: wrote own HTML/CSS/JS from public description + demo strings; did not copy compiled source.
