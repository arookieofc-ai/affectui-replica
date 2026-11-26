# Setup Guide — replica report

## What was built
`index.html` (23.5KB, self-contained, system fonts, no network) — clean-room replica of the
`Setup guide` onboarding panel from `demo-original.js`. Own markup/CSS/JS (`sgd-*` classes);
no verbatim copy of the compiled source.

Layout matches the original: 320px card, `16px 8px 8px` padding, 20px radius
(`16px + 4px`), 1px border + soft shadow, header (`Setup guide` + `Edit` + minimise/expand +
close), 5px progress track with `scaleX(w)` fill, collapsible groups (open group gets
tinted background), tasks with 16px round marks, strikethrough on done.

## Matched data (verbatim from demo-original.js)
- Title: `Setup guide`
- `Set up your workspace`: `Choose a workspace name` / `Invite your teammates to collaborate` / `Connect your calendar`
- `Set up billing`: `Add a payment method` / `Choose a plan`
- `Verify your account`: `Confirm your email address` (pre-done)
- Total 6 tasks, 1 pre-done → initial `aria-valuenow="17"`.

## Matched behaviour / timings
- Done-set init from `tasks.filter(done)`; open = first group with an undone task (`workspace`).
- Task states `done | locked | current`: only the first undone task per group is clickable;
  later tasks are `disabled` + muted.
- Clicking a task toggles done, updates progress (`Math.round(w*100)`, `scaleX`), strikes the
  label (`line-through`, 260ms), pops the check icon (420ms `sgd-pop`).
- Completing a whole group auto-opens the next incomplete group after **420ms**
  (`setTimeout(...,420)`); when all are done open becomes `null`.
- Group headers toggle open (`aria-expanded`, `aria-controls="sgd-<id>"`, `inert` panel,
  380ms grid-rows animation, chevron rotate 180°); title strikes via `::after scaleX`
  (420ms) when the group is fully done.
- Minimise toggles `data-hidden` on the body (420ms collapse); `Edit` is a no-op accent
  button; `Close` hides the panel and shows a "Show setup guide" reopen button.
- Transitions kept: fill 700ms, body 420ms, panel 380ms, chevron 320ms, task 260/320ms.
- `prefers-reduced-motion` disables all of it.

## In-place updates / hard-won rules
- DOM built **once** at init with `createElement`/`createElementNS`; timers and hover/focus
  only mutate text/`data-*`/attrs/style on existing nodes. No `innerHTML` anywhere.
- SVG classes only via `setAttribute("class",…)` — never `.className` (throws on SVG).
- `[hidden]{display:none!important}` present; no broad `.sgd svg` rule (only
  `.sgd-mark svg`, `.sgd-iconbtn svg` + theme icon), so hide rules can't be beaten by specificity.
- Dialog/popover behaviour N/A (no popovers); minimise/close update in place and are driven
  by `click` (no hover-triggered re-render).

## v5 polish / tokens / themes
- All `:hover` (7 rules) live inside `@media (hover:hover) and (pointer:fine)`.
- `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`.
- Concentric radii: card 20px = group 12px + 8px padding; task 10px nests inside the 12px group.
- Shadows for elevation (`--shadow-card`), 1px borders only for structure.
- Design tokens for every colour; light = spec (`#ffffff/#fafaf9/#171717/#78716c/#f5f5f4/#e7e5e4`);
  dark via `html[data-theme="dark"]` (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`).
- Visible sun/moon toggle (top-right) flips `data-theme`, persists to `sgd-theme`.
- Default theme = original demo appearance (**light**). No agent identities in this component,
  so no pixel-marks (spec: only when the component has agent identities).
- `<head>` starts with the `/*noflash*/` guard + `html{background}` paint block +
  `<meta name="color-scheme" content="light dark">`.
- Narrow (<420px) stacks to full width.

## Verification (node only, no browser, no installs)
- `node --check` on the extracted main script: **pass**.
- In-dir stub harness `harness.js` (`node harness.js`): **all pass** —
  asserts verbatim titles/labels, initial open `workspace`, progress `17 → 33 → … → 100`,
  locked/disabled states, auto-advance `workspace → billing → null` with 420ms timer flush,
  minimise `data-hidden`, group `data-done` strikes, theme toggle `light→dark` + persistence,
  `/*noflash*/`/meta/`[hidden]`/hover-guard/tap-highlight/tabular-nums/strike rules, no
  network URLs, size <200KB, and **node identity kept for section/fill/body/group/task/mark/label
  across the full loop with 0 `innerHTML` writes and 0 SVG `.className` assignments**.
- Light AND dark checked: harness flips the toggle and asserts persistence; both token sets
  are present in the file (`#ffffff` vs `#1c1c1f`, `#fafaf9` vs `#101012`) and the dark block
  re-themes card/line/ink/muted/track/open/dot. Open `index.html` in a browser and use the
  toggle to confirm visually.

## How to test
Open `index.html` in a browser (or `node harness.js` for the headless checks).
