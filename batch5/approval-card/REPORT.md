# approval-card replica — report

## What was built
`index.html` (37,416 bytes, self-contained, no network, system fonts) — a clean-room
replica of the affectUI Pro approval-card component, presented as the original demo
does: a chat thread where an agent asks "I drafted the October newsletter. Ready to
send?", followed by the approval card.

- **Card 1 (exact original demo):** title `Send campaign email`, description
  `October product update · Newsletter`, risk `medium`, envelope icon, details
  `Subject = What's new in October` / `Send = Today, 9:00 AM`, recipient preview
  (`Mia, Jonas, Sara, Alex` + `+38 more` with `M/J/S/A` avatars), always-allow
  checkbox (`Always allow this action`), `Deny` + `Esc`, `Approve` + `⌘↵`/`Ctrl ↵`.
  No countdown — the original demo passes no `expiresIn`.
- **Card 2 (same component, extra states):** `Publish pricing page`, risk `high`,
  `expiresIn: 90`, an `Edit` button, and an illustrative warning preview. Clearly
  labelled on-page as "More states". The countdown format, pause-on-hover/focus,
  low-time (≤10s) warning, and `Expired` resolution all come from the original
  component logic, not invented data.
- **Header:** `October newsletter` + live `N pending · 1 agent` (derived from demo
  data; pending count updates as cards resolve) + sun/moon theme toggle.
- **Pixel-mark:** the requesting agent (`newsletter-agent`) gets a deterministic
  3×3 pixel-mark (id-hashed colour, exactly 9 `.px` cells, verified) that twinkles
  while its card is pending.

## Original data / behaviour used (from demo-original.js, re-implemented, not copied)
Labels (`Low/Medium/High risk`, `Always allow this action`, `Approve/Deny/Edit`,
`Esc`, `⌘↵`/`Ctrl ↵` platform detection), pending → busy(spinner) → resolved flow
(approve waits ~700 ms promise; deny immediate), auto-demo (press highlight at
2.8 s, auto-click at 3.0 s, reset 3.2 s after resolve, cancelled on first user
pointer/key interaction, `Replay` button after interaction), keyboard
(`Ctrl/Cmd+Enter` approve, `Escape` deny), countdown (`m:ss`/`h:mm:ss`, screen-reader
"Expires in N seconds/minutes/hours", pauses on hover/focus/busy, low at ≤10 s,
expiry → `Denied` with reason `timeout` rendered as `Expired`), relative time
(`just now / N min ago / N h ago / N d ago`, 30 s refresh), resolved row
(`Approved/Denied/Expired: title` + `· Always` + `· time`), responsive container
queries (400 px: full-width actions, kbd hidden; 340 px: tighter padding, risk-word
and row-time hidden), `prefers-reduced-motion` handling, focus management and
`aria-live` status announcements.

## Interactions
Hover/focus pauses the countdown · always-allow checkbox appends `· Always` to the
approved row · `Edit` (card 2) rewrites the Scope/Window details inline · theme
toggle flips `data-theme` on `<html>` (saved to localStorage, defaults to
`prefers-color-scheme`, original light appearance otherwise) · `Replay` re-runs the
auto-demo.

## Token audit
Every colour resolves through `:root` / `html[data-theme="dark"]` custom properties
(page, surface, ink, muted, body, subtle, tray, border, radii, shadow, amber waiting
pair, risk low/med/high pairs, ok/no pairs, timer-low, button pairs, focus ring);
no ad-hoc hex on elements. Dark theme redefines the full set (amber stays amber:
`#fbbf24` on `#451a03`).

## Contrast results (computed, AA ≥ 4.5)
Light: ink/surface 17.93, body/page 7.30, muted/surface 4.80, amber 6.37,
med-risk 4.74, high-risk 4.86, ok 4.52, timer-low 4.67, low-risk 4.76, on-button 17.93.
Dark: ink 14.52, muted 6.63, amber 12.03, med-risk 9.03, high-risk 7.42, ok 8.19,
on-button 15.00. Minimum 4.52 — all pass.
Note: two inks were darkened one step from the original bundle values to reach AA
(med-risk `#8f6c00`→`#8a6800`, 4.47→4.74; ok-ink `#1e8a4f`→`#1c7f47`, 3.93→4.52);
everything else matches the original values.

## Verification
- `node --check` on the extracted page script: passes.
- Headless run: a Node DOM-stub harness loaded the real page script with fake
  timers and asserted **65/65**: exact demo strings, 9-cell pixel-mark, auto-demo
  press/click/busy/resolve/reset timings, countdown advance/pause/resume/low/expire,
  Escape/Ctrl+Enter, edit, theme toggle, and all contrast pairs above.
- Checked light and dark token sets; dark verified via toggle + token values
  (no grey-on-grey, borders visible in both).

## How to test
Open `index.html` in a browser. Card 1 auto-approves after ~3 s; click anywhere
first to take manual control (`Replay` appears once it resolves). Card 2 counts
down from 1:30 — hover it to pause. Toggle the sun/moon button for dark mode.
