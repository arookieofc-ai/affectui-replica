# Settings / Preferences — replica report

## What was built
Single self-contained `./index.html` (28.5 KB, inline CSS/JS, system fonts only) replicating affectUI `settings-preferences`:
- Header `Preferences` + sub `Make the assistant work the way you do.`, back link `Settings`, top-right sun/moon theme toggle.
- `Models` card: `Default model` (`Picked whenever you start a new chat`), `Image model` (`Used when you ask for a picture`), Auto nudge (`Get more out of your plan with Auto` / `It picks the right model for each message, so quick questions don’t use up your credits.` + `Switch to Auto`).
- `Model Wheel`: shown only when `Default model = Auto`. Donut (conic-gradient) + legend across chat models with live `%` that drifts every 3 s via in-place style/text updates.
- `Language and appearance` card: `Language` (`For menus and the assistant’s answers`, options English/Deutsch/Français/Español + GB/DE/FR/ES badge), `Appearance` (`System follows your device`, System/Light/Dark tray).
- `App actions` card: `Find app actions on its own` + `Beta` + `The chat can use connected apps without you tagging them first`, switch.
- `Chat tools` (`Extra tools for your own chats. Agents bring their own.`): Web search / Image generation / Memory with verbatim notes.
- `Custom instructions` (`Added to every message you send…`): `Use my instructions` switch + `About you` / `How it should answer` textareas (maxlength 1500, live `n / 1500` counters, Expand/Collapse), placeholders verbatim.
- `Memory` (`What the assistant has kept from your chats. Only you can see it.`): 3 verbatim memories + `Saved …` stamps, per-row Forget, `Clear all` → `Cancel` / `Forget everything` (Escape cancels), `Memory is off…` note when Memory tool off, `No memories yet` empty state with `Start a chat` / `Turn on memory`.
- Toasts with original strings: `Instructions saved`, `New chats use …`, `Pictures use …`, `Language: …`, `Following your system`/`Light mode`/`Dark mode`, `App actions …`, `Instructions on/paused`, `Memory cleared`, `Forgotten`, `Web search on/off` etc.

## Demo data (verbatim from `./demo-original.js`)
- defaults: `chatModel=claude-sonnet`, `imageModel=gpt-image`, `language=English`, `theme=system`, `findActions=false`, `tools=[web,images]`, `instructionsOn=true`, `about=I lead product design at Acme, a 40-person B2B SaaS company. I mostly ask about UX copy, research synthesis and planning.`, `style=''`.
- memories m1/m2/m3 with exact texts/saved labels (`2 days ago`, `last week`, `3 weeks ago`).
- languages `English/Deutsch/Français/Español (gb/de/fr/es)`, tools `web=Web search/Looks things up…`, `images=Image generation/Draws pictures…`, `memory=Memory/Remembers things…`.
- maxLength `1500`, field defs `About you/What should the model know…`, `How it should answer/E.g. Short and direct…`.
- Plausible-only (providers file not in scope, noted): chat list `Auto/Claude Sonnet/Claude Opus/GPT-5 Chat`, image list `GPT Image/Imagen 4`. Names/ids `claude-sonnet` + `gpt-image` kept verbatim; Auto wheel mix (55/30/15) is interpretation — original `ModelWheel` source not provided.

## What matches
Layout/cards/rows, 1px border + soft shadow, radius-lg 16 / radius 10 / radius-sm 6, pills 999px, system-ui 14px base, titles 15–16 semibold, meta 12–13 muted, gaps 8–12, in-place updates only (prebuilt nodes, `hidden`/`textContent`/`value`/`aria-checked` mutations, timer updates donut + `%` only).

## v5 polish
- All `:hover` inside `@media (hover:hover) and (pointer:fine)`.
- `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`.
- Concentric radius (card 16, inner nudge/wheel 10), shadows for elevation + borders for structure, focus-visible outlines, optical icon nudge (`padding-left:2px`, tray icon `margin-right:-2px`).

## Dark + no-flash
- Tokens via CSS vars; dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, amber `#fbbf24/#451a03/#fde68a`.
- `<head>` starts with `/*noflash*/` script (reads `spf-theme` → `prefers-color-scheme` before paint) + `<meta name=color-scheme>` + `html{background…}` guard.

## Could not verify
- Exact provider logos/names and `ModelWheel` visuals (compiled source not copied per clean-room rule; used plausible names + donut).
- Pixel-perfect original screenshots (no image access in this env).

## How to test
- `open index.html in a browser` (double-click `./index.html`), toggle theme, switch Default model to Auto to see wheel, toggle tools, edit instructions (blur → toast), forget/clear memories.
- Node only: `node --check ./harness.js && node ./harness.js`, plus `node --check ./inline-check.js` (extracted inline script). Harness asserts visible painted text, full-loop node identity, zero innerHTML writes after init, light+dark themes.
- Checked: light AND dark both legible, no grey-on-grey, size <200 KB.
