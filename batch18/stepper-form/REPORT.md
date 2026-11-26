# Stepper Form — Replica Report

## What was built
ONE self-contained `index.html` (45KB, inline CSS+JS, system fonts, no network) replicating the affectUI **Stepper Form** multi-step onboarding flow.

Layout matches the original demo:
- Tray (`--tray`) + card (`--surface`) with 1px border + soft shadow, `max-width:520px`, `radius-lg:16px`.
- Progress header: 4 steps `Workspace / Team / Plan / Review` as `1.` numbers, check-draw when done, `current/upcoming/done` states, compact `Step X of 4 · Title` / `All 4 steps done` for narrow (≤420px stacked, choices stack, review rows stack).
- Sliding panels with viewport height transition (380ms), enter `translateX(±28px)`, leave handling, first-paint no animation.
- Footer: `Back` (ghost, hidden on step 0/success) + `Continue` / `Back to {lowercased}` / `Create workspace` + `Creating…` busy with spinner + inline submit error `role=alert`.
- Success: check circle pop, `${name} is ready`, trial line, `Start over` secondary.
- Fields: `Workspace name` (`Acme Inc.`), `Workspace URL` (`affect.app/` + `acme`, hint `Lowercase letters, numbers and dashes`), `Email addresses` (`Optional`, tags + `name@company.com` / `Add another`, hint `Press Enter or comma to add`), `Plan` radiogroup with sliding ring, review `dl` with `Edit` buttons.
- Live region `aria-live=polite`: `Step X of 4: Title`, field errors, `All done`.
- Theme toggle top-right (sun/moon SVG) switching `data-theme="light"|"dark"`.

Clean-room: wrote own HTML/CSS/JS from observed behaviour. No verbatim copy of compiled source. SVG classes via `setAttribute("class")` only. `[hidden]{display:none!important}` explicit. No broad `svg{display:block}` beating hide (scoped). Hover/focus only update classes/styles, never rebuild. Dialogs use `pointerdown/mousedown` capture where applicable (no dialogs in this component, toggle uses click + capture flag).

## Matched data / behaviour / timings (verbatim from demo-original.js)
- Steps: titles/heading/descriptions exactly (`Name your workspace` / `This is where your team's projects live.` / `Invite your teammates` / `They'll get an email with a link to join.` / `Pick a plan` / `Every plan starts with a 14‑day trial.` U+2011 / `Review and create` / `Everything can be changed later in settings.`).
- Plans: `free/Free/$0/Up to 3 members and 5 projects`, `pro/Pro/$12 / seat` NBSP/`Unlimited projects, guests and history`/`Popular`, `business/Business/$24 / seat` NBSP/`SSO, audit log and priority support`.
- Initial: `name=""`, `slug=""`, `invites=["maya@northwind.studio","leo@northwind.studio"]`, `plan="pro"`.
- Autoplay: `Northwind Studio`, 650ms delay, 55+random*45ms/char, slugify `lower→NFKD→[\u0300-\u036F]→[^a-z0-9]+→-→trim→slice(0,32)`, cancels on focus, restarts on `Start over`.
- Validation verbatim: `Give your workspace a name`, `Use at least 3 characters`, `That doesn't look like an email address`, `Already on the list`, `Up to 20`, `Check this step`, `Something went wrong – try again` en-dash.
- Email: regex `/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/`, split `/[\s,;]+/`, lowercased, max 20, Enter/comma/semicolon add, paste with separators, Backspace removes last, remove-button, `Add another` placeholder.
- Navigation: clickable visited steps, `Back to {lowercased}` pending logic (`lowerTitle` via `\p{Lu}\p{Ll}+`), `Back`, `Continue`, `Create workspace`, `Creating…` U+2026, 1100ms submit, `All done`, `Step X of Y: Title`, `All 4 steps done`, `Just you for now`, `invite/invites`, `affect.app/slug`, `${n} invite is/are on the way. Your trial runs for 14 days.` NBSP, `Start over`.
- Timings: typing 650ms + per-char, submit 1100ms, pane 420ms/380ms, ring 380ms, shake 340ms, chip 240ms.
- Dark default = original light appearance; toggle overrides, stored as `stepper-form-theme`.

## How to test
Open `index.html` in a browser (no server needed). Watch autoplay type `Northwind Studio`, click `Continue` through Team → Plan → Review → `Create workspace` → success `* is ready` → `Start over` loops. Toggle sun/moon top-right for dark. Narrow <420px shows compact header.

## Verification (node only, no browser)
- `node --check` on extracted main script: **CHECK_OK**.
- In-dir stub `verify.js` loads page script in fake DOM, advances timers through full loop:
  - asserts VISIBLE text (not sr-only): autoplay name, invites, headings, plans, review, `Creating…`, success `is ready/on the way/Start over`.
  - asserts node identity: step `li`, panes, primary/back buttons `===` before/after full loop (startOver + retype).
  - asserts zero `innerHTML/outerHTML/insertAdjacentHTML` writes (static + runtime counter).
  - asserts light AND dark: toggle to dark/back to light, tokens present.
- Result: `ALL CHECKS PASSED (light AND dark checked)`.
- Could not verify: pixel-perfect animation curves vs original screenshots, real ResizeObserver/animate timing in stub (guarded), screen-reader narration order beyond live-region text.
