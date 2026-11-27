# Breadcrumb — targeted overflow-menu fix

## Defect (real-browser QA)
Overflow `…` button (`aria-label "Show 1 more crumb"`) never opened the hidden-crumbs menu.
Three real mouse clicks left the button `[collapsed]`, nothing painted. Separator switcher on the
same page responded immediately, so clicks land — the menu's open path was broken.

## Root cause
`index.html` opened the menu on `pointerdown`/`mousedown` capture (house rule, so a re-render
cannot eat the click), but the `click` handler still toggled:

```js
pointerdown -> openMenu()          // menuOpen = true
mousedown   -> openMenu() (no-op)
click       -> if (menuOpen) closeMenu()   // immediately closes again
```

Net effect per real gesture (`pointerdown+mousedown+mouseup+click`): open then instant close.
The menu flashed closed within the same gesture, so QA saw `[collapsed]` and an empty paint.
CSS was innocent: `.ui-bcr__menu{display:grid}` + `[hidden]{display:none!important}` interplay is
correct (`hidden=false` shows, `hidden=true` hides). Node identity was also fine (`moreBtn` built
once, only moved via `appendChild`). The bug was purely the open-then-toggle-close sequence.
Original `demo-original.js` toggles on `onClick` only (`r(e=>!e)`) with no pointerdown opener,
so it does not have this double-handling.

## Fix (in `index.html` only, nothing else changed)
Suppress the `click` that completes the opening gesture; keep toggle for genuine later clicks:

```js
var moreOpenedOnPointer = false;
moreBtn pointerdown (capture): if (!menuOpen) { openMenu(); moreOpenedOnPointer = true; }
                                else { moreOpenedOnPointer = false; } // closing gesture
moreBtn mousedown (capture, fallback only): if (!menuOpen && !moreOpenedOnPointer) { openMenu(); moreOpenedOnPointer = true; }
                                // never clears: mousedown of the same gesture must not unsuppress
moreBtn click: if (moreOpenedOnPointer) { moreOpenedOnPointer = false; return; }
               if (menuOpen) closeMenu(false); else openMenu();
```

Second click / outside `pointerdown` still closes. Click-only open (keyboard Enter/Space,
no-pointer browsers, AT) still toggles because the flag is false. Demo data, layout, other
behaviour unchanged. `/*noflash*/` guard kept; in-place updates only; zero `innerHTML` writes
(the sole `innerHTML` string in the file is a code comment).

## How to test
Open `index.html` in a browser, click `…` — the menu listing `Agents` appears; click `…` again or
click outside — it closes. Repeat in light and dark (sun/moon toggle).

## Verification (node only, no installs)
- `node --check` on the extracted main script: OK.
- `node harness-fix.cjs` (in-dir DOM stub): dispatches full `pointerdown/mousedown/mouseup/click`
  on `…`, asserts menu visible (`hidden==false`, `display:grid` open rule, no beating
  `display:none`, contains `Agents` as visible text), second click closes, outside `pointerdown`
  closes — in light AND dark; asserts crumb/list/menu node identity kept and zero `innerHTML`
  writes after init. All checks pass.
