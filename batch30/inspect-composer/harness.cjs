#!/usr/bin/env node
// harness.cjs — in-dir DOM-stub verification for inspect-composer fix.
// No installs. Uses only node builtins. Run: node ./harness.cjs [./index.html|./original-backup.html]
// Asserts VISIBLE state (computed opacity/visibility/colours), light AND dark,
// full-loop node identity, zero innerHTML, and jump-button wiring.
const fs = require('fs');
const path = require('path');

const targetArg = process.argv[2] || './index.html';
const targetPath = path.resolve(process.cwd(), targetArg);
let html;
try { html = fs.readFileSync(targetPath, 'utf8'); }
catch (e) { console.log(`FAIL: cannot read ${targetArg}: ${e.message}`); process.exit(1); }

let failures = [];
let passes = [];
function ok(name, cond, detail) {
  if (cond) { passes.push(name); console.log(`PASS: ${name}${detail ? ' — ' + detail : ''}`); }
  else { failures.push(name); console.log(`FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- static source checks ----------
ok('noflash guard present', html.includes('/*noflash*/'), '/*noflash*/ found');
ok('color-scheme meta present', html.includes('name="color-scheme"'), 'meta found');
ok('zero innerHTML in source', !html.includes('innerHTML'), html.includes('innerHTML') ? 'found innerHTML' : 'none found');

const VERBATIM = [
  'Ask the agents to ship the new pricing page',
  'Summarize the pricing research for the team',
  'Auto',
  'Work in a folder',
  'Connect apps'
];
for (const s of VERBATIM) ok(`verbatim "${s.slice(0,24)}..." present`, html.includes(s));

for (const r of ['Message', 'Toolbar', 'Footer']) ok(`row label "${r}" present`, html.includes(r));

// CSS parsing for VISIBLE-state causes
function parseHint(theme) {
  const re = new RegExp(`html\\[data-theme="${theme}"\\]\\{([^}]+)\\}`, 'gs');
  const all = [...html.matchAll(re)];
  for (const m of all) {
    const hm = m[1].match(/--hint:([^;]+);/);
    if (hm) return hm[1].trim();
  }
  return null;
}
function alphaOf(col) {
  if (!col) return null;
  const m = col.match(/rgba\([^,]+,[^,]+,[^,]+,([^\)]+)\)/);
  if (m) return parseFloat(m[1]);
  if (col.startsWith('#')) return 1;
  if (col.startsWith('rgb(')) return 1;
  return null;
}
const hintLight = parseHint('light');
const hintDark = parseHint('dark');
const aLight = alphaOf(hintLight);
const aDark = alphaOf(hintDark);
ok('light message colour readable (alpha>=0.6)', aLight !== null && aLight >= 0.6, `hint light=${hintLight} alpha=${aLight}`);
ok('dark message colour readable (alpha>=0.6)', aDark !== null && aDark >= 0.6, `hint dark=${hintDark} alpha=${aDark}`);

// mask stops: vertical must keep composer opaque, horizontal must not clip left
function maskStops() {
  // find all mask-image lines
  const masks = [...html.matchAll(/mask-image:([^;]+);/g)].map(m => m[1]);
  return masks.join(' || ');
}
const maskText = maskStops();
// vertical: linear-gradient(180deg,#000 XX%,transparent YY%)
const vert = [...html.matchAll(/linear-gradient\(180deg,#000\s+(\d+)%,transparent\s+(\d+)%\)/g)];
let vertOpaque = null;
for (const v of vert) {
  // only consider .icp scene masks (ignore .icp-above and guide masks which are different pattern)
  // scene masks are the ones with #000 first; above mask starts with transparent, guide mask different — our regex already filters #000 first
  // take minimum opaque (most aggressive) as worst case
  const o = parseInt(v[1], 10);
  if (vertOpaque === null || o < vertOpaque) vertOpaque = o;
}
// horizontal: 90deg or 270deg #000 XX%
const horiz = [...html.matchAll(/linear-gradient\((?:90|270)deg,#000\s+(\d+)%,transparent\s+(\d+)%\)/g)];
let horizOpaque = null;
for (const h of horiz) {
  const o = parseInt(h[1], 10);
  if (horizOpaque === null || o < horizOpaque) horizOpaque = o;
}
ok('scene vertical mask keeps composer opaque (>=65%)', vertOpaque !== null && vertOpaque >= 65, `min vertical opaque=${vertOpaque}%`);
ok('scene horizontal mask keeps composer inside (>=85%)', horizOpaque !== null && horizOpaque >= 85, `min horizontal opaque=${horizOpaque}%`);

// positioning: mirror padding left must not be 0, above offsets must not be negative-clipped
let mirrorPadLeft = null;
const mp = html.match(/\.icp\[data-mirror="true"\]\{padding:([^;]+);/);
if (mp) {
  const parts = mp[1].trim().split(/\s+/);
  // padding: top right bottom left (4 values) or fewer
  if (parts.length === 4) mirrorPadLeft = parts[3];
  else if (parts.length === 3) mirrorPadLeft = parts[1]; // right/left shared? conservative
  else mirrorPadLeft = parts[parts.length - 1];
}
function pxVal(v) { if (!v) return null; const m = v.match(/(\d+)/); return m ? parseInt(m[1], 10) : null; }
const mpLeftPx = pxVal(mirrorPadLeft);
ok('mirror padding leaves left room (>=12px)', mpLeftPx !== null && mpLeftPx >= 12, `mirror padding left=${mirrorPadLeft}`);

const aboveLefts = [...html.matchAll(/\.icp-above\{[^}]*left:([^;]+);/g)].map(m => m[1].trim());
const aboveMirrorLefts = [...html.matchAll(/\.icp\[data-mirror="true"\]\s*\.icp-above\{[^}]*left:([^;]+);/g)].map(m => m[1].trim());
const allAboveLeft = aboveLefts.concat(aboveMirrorLefts);
let aboveNeg = false;
for (const v of allAboveLeft) {
  const n = parseInt(v, 10);
  if (!isNaN(n) && n < -20) aboveNeg = true;
}
ok('above offsets not clipped far left (<-20px)', !aboveNeg, `above lefts=[${allAboveLeft.join(', ')}]`);

// ---------- DOM stub + runtime ----------
let innerWrites = 0;

// Minimal element
function makeEl(tag) {
  const e = {
    tagName: (tag || 'div').toUpperCase(),
    className: '',
    children: [],
    parent: null,
    attrs: {},
    style: {},
    listeners: {},
    _text: '',
    tabIndex: 0,
    offsetLeft: 0, offsetTop: 0, offsetWidth: 0, offsetHeight: 0,
    offsetParent: null,
    setAttribute(k, v) { this.attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; },
    removeAttribute(k) { delete this.attrs[k]; },
    appendChild(c) {
      if (!c) return c;
      // text node
      if (c && c.__text) { this.children.push(c); c.parent = this; this._text += c.nodeValue; return c; }
      this.children.push(c); c.parent = this;
      if (c.tagName) { /* keep */ }
      return c;
    },
    addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); },
    click() { const a = this.listeners['click'] || []; for (const fn of a) fn.call(this, { preventDefault() {} }); },
    get textContent() { return this._text + this.children.map(ch => ch.textContent !== undefined ? ch.textContent : (ch.nodeValue || '')).join(''); },
    set textContent(v) { this._text = String(v); this.children = this.children.filter(ch => ch.__text && false); },
    querySelectorAll(sel) {
      const out = [];
      function walk(n) {
        if (!n || !n.children) return;
        for (const ch of n.children) {
          if (ch.attrs) {
            if (sel === '[data-row]' && ch.attrs['data-row'] !== undefined) out.push(ch);
            if (sel === '[data-goto]' && ch.attrs['data-goto'] !== undefined) out.push(ch);
          }
          walk(ch);
        }
      }
      walk(this);
      return out;
    },
    closest(sel) {
      // supports [data-card], [data-main]
      const wants = sel.replace(/[\[\]]/g, '').split(',');
      let n = this;
      while (n) {
        for (let w of wants) {
          w = w.trim();
          if (w === '[data-card]' && n.attrs && n.attrs['data-card'] !== undefined) return n;
          if (w === '[data-main]' && n.attrs && n.attrs['data-main'] !== undefined) return n;
          if (w === 'data-card' && n.attrs && n.attrs['data-card'] !== undefined) return n;
          if (w === 'data-main' && n.attrs && n.attrs['data-main'] !== undefined) return n;
        }
        // generic [x]
        const m = sel.match(/\[([^\]]+)\]/);
        if (m && n.attrs && n.attrs[m[1]] !== undefined) return n;
        n = n.parent;
      }
      return null;
    }
  };
  e.style.setProperty = function (k, v) { this[k] = v; };
  // innerHTML tracking
  let _ih = '';
  Object.defineProperty(e, 'innerHTML', {
    get() { return _ih; },
    set(v) { innerWrites++; _ih = String(v); },
    configurable: true
  });
  Object.defineProperty(e, 'class', {
    get() { return this.className; },
    set(v) { this.className = v; }
  });
  return e;
}
function makeText(t) { return { __text: true, nodeValue: String(t), textContent: String(t) }; }

// Pre-create static controls (as in HTML)
const mountEl = makeEl('div');
const statusEl = makeEl('p'); statusEl.textContent = 'Selected: Message';
const playBtn = makeEl('button'); playBtn.setAttribute('aria-pressed', 'true');
const playLabel = makeEl('span'); playLabel.textContent = 'Pause';
const mirrorBtn = makeEl('button'); mirrorBtn.setAttribute('aria-pressed', 'true');
const flatBtn = makeEl('button'); flatBtn.setAttribute('aria-pressed', 'false');
const themeBtn = makeEl('button');
const docEl = makeEl('html'); docEl.setAttribute('data-theme', 'light');
const dots = [0, 1, 2].map(i => {
  const b = makeEl('button');
  b.setAttribute('data-goto', String(i));
  b.setAttribute('data-active', i === 0 ? 'true' : 'false');
  b.textContent = ['Message', 'Toolbar', 'Footer'][i];
  return b;
});

const timerQ = [];
let timerId = 1;
const docStub = {
  createElement: (t) => makeEl(t),
  createElementNS: (ns, t) => makeEl(t),
  createTextNode: (t) => makeText(t),
  getElementById: (id) => {
    if (id === 'mount') return mountEl;
    if (id === 'status') return statusEl;
    if (id === 'playBtn') return playBtn;
    if (id === 'playLabel') return playLabel;
    if (id === 'mirrorBtn') return mirrorBtn;
    if (id === 'flatBtn') return flatBtn;
    if (id === 'themeBtn') return themeBtn;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel === '[data-goto]') return dots;
    return [];
  },
  documentElement: docEl,
  body: makeEl('body'),
  activeElement: null
};
const winStub = {
  setTimeout(fn, ms) { const id = timerId++; timerQ.push({ id, fn, ms: ms || 0 }); return id; },
  clearTimeout(id) { for (let i = timerQ.length - 1; i >= 0; i--) if (timerQ[i].id === id) timerQ.splice(i, 1); },
  matchMedia: () => ({ matches: false }),
  getComputedStyle(elm) {
    // simulate CSS: overlay children hidden when select not shown; message colour from hint
    // find select ancestor
    let n = elm;
    let sel = null;
    while (n) {
      if (n.attrs && n.attrs['data-shown'] !== undefined && (n.className || '').includes('icp-select')) { sel = n; break; }
      n = n.parent;
    }
    // if element itself is select children? check parent chain for select
    n = elm.parent;
    while (n && !sel) {
      if (n.attrs && n.attrs['data-shown'] !== undefined && (n.className || '').includes('icp-select')) { sel = n; break; }
      n = n.parent;
    }
    let opacity = '1';
    if (sel && sel.getAttribute('data-shown') !== 'true') {
      // overlay marks are opacity 0 when hidden; composer bodies are NOT inside select so stay 1
      // determine if elm is inside select (overlay) vs composer
      let inside = false;
      let m = elm;
      while (m) { if (m === sel) { inside = true; break; } m = m.parent; }
      if (inside) {
        // frame itself is opacity 1 per CSS (.icp-frame{opacity:1}), children 0
        if ((elm.className || '').includes('icp-frame')) opacity = '1';
        else opacity = '0';
      }
    }
    if (elm.style && elm.style.opacity) opacity = String(elm.style.opacity);
    let visibility = (elm.style && elm.style.visibility) || 'visible';
    // colour: message uses hint
    let color = 'rgb(23, 23, 23)';
    if ((elm.className || '').includes('icp-message')) {
      const theme = docEl.getAttribute('data-theme') || 'light';
      color = theme === 'dark' ? (hintDark || '') : (hintLight || '');
    }
    return {
      opacity, visibility, color,
      paddingLeft: '0px', paddingRight: '0px',
      getPropertyValue(p) {
        if (p === 'opacity') return opacity;
        if (p === 'visibility') return visibility;
        if (p === 'color') return color;
        return '';
      }
    };
  }
};
const localStub = { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); } };

// extract app script (second script block; first is noflash)
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length < 2) {
  console.log('FAIL: expected 2 script blocks (noflash + app)');
  process.exit(1);
}
const appJS = scripts[1];

// run app
const vm = require('vm');
const sandbox = {
  document: docStub,
  window: winStub,
  localStorage: localStub,
  ResizeObserver: undefined,
  console
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try {
  vm.runInContext(appJS, sandbox, { filename: 'app.js' });
} catch (e) {
  ok('app script runs without throwing', false, e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : String(e));
  console.log(`\nRESULT: ${failures.length} failures, ${passes.length} passes`);
  process.exit(1);
}
ok('app script runs without throwing', true);

const icp = sandbox.window.__icp;
ok('window.__icp exposed', !!icp);
if (!icp) { console.log(`\nRESULT: ${failures.length} failures`); process.exit(1); }

// helpers to find message + cards
function findByClass(root, cls) {
  let found = null;
  function walk(n) {
    if (!n || !n.children) return;
    for (const ch of n.children) {
      if (ch.className && ch.className.split(' ').includes(cls)) { found = ch; return; }
      walk(ch);
      if (found) return;
    }
  }
  walk(root);
  return found;
}
function findAllByClass(root, cls) {
  const out = [];
  function walk(n) {
    if (!n || !n.children) return;
    for (const ch of n.children) {
      if (ch.className && ch.className.split(' ').includes(cls)) out.push(ch);
      walk(ch);
    }
  }
  walk(root);
  return out;
}
// root stage is icp.root? __icp.root
const rootNode = icp.root;
const stageNode = icp.stage;
const mainCard = icp.mainCard;

// VISIBLE entrance: immediately after init (no timer flush) select must be shown
const selShown = icp.select.getAttribute('data-shown');
ok('entrance resolves visible (data-shown true after init)', selShown === 'true', `data-shown=${selShown}`);

// computed VISIBLE for composer
const allMsgs = findAllByClass(rootNode, 'icp-message');
ok('composer message nodes exist (2: back+front)', allMsgs.length >= 2, `found=${allMsgs.length}`);
const msgTexts = allMsgs.map(m => m.textContent || '').join(' || ');
ok('back message verbatim present in DOM', msgTexts.includes('Summarize the pricing research for the team'), msgTexts.slice(0, 80));
ok('front message verbatim present in DOM', msgTexts.includes('Ask the agents to ship the new pricing page'), msgTexts.slice(0, 120));
// pick front (main) message: the one inside mainCard, else longest/first with Ask...
let msgEl = null;
for (const m of allMsgs) {
  let n = m;
  while (n) { if (n === mainCard) { msgEl = m; break; } n = n.parent; }
  if (msgEl) break;
}
if (!msgEl) msgEl = allMsgs.find(m => (m.textContent || '').includes('Ask the agents')) || allMsgs[0];
ok('composer message node exists', !!msgEl);
if (msgEl) {
  const cs = winStub.getComputedStyle(msgEl);
  ok('message computed opacity 1 (not ghosted)', cs.opacity === '1', `opacity=${cs.opacity}`);
  ok('message computed visibility visible', cs.visibility !== 'hidden', `visibility=${cs.visibility}`);
  const a = alphaOf(cs.color);
  ok('message computed colour readable (alpha>=0.6)', a !== null && a >= 0.6, `color=${cs.color} alpha=${a}`);
  ok('message text verbatim main', (msgEl.textContent || '').includes('Ask the agents to ship the new pricing page'), msgEl.textContent.slice(0, 50));
}
if (mainCard) {
  const cs = winStub.getComputedStyle(mainCard);
  ok('main card computed opacity 1', cs.opacity === '1', `opacity=${cs.opacity}`);
  ok('main card computed visibility visible', cs.visibility !== 'hidden', `visibility=${cs.visibility}`);
}

// geometry: no left clipping
const rows = icp.rows || [];
ok('3 inspection rows', rows.length === 3, `rows=${rows.length}`);
for (const r of rows) {
  ok(`row "${r.name}" card.x >=0 (not clipped left)`, r.card && r.card.x >= 0, `${r.name} card.x=${r.card && r.card.x}`);
  ok(`row "${r.name}" x >=0 (not clipped left)`, r.x >= 0, `${r.name} x=${r.x}`);
}
const frameLeft = parseFloat((icp.frame.style && icp.frame.style.left) || '0');
ok('selection frame left >=0 (not clipped)', !isNaN(frameLeft) && frameLeft >= 0, `frame.left=${icp.frame.style && icp.frame.style.left}`);

// status + tag after init
ok('status Selected: Message after init', (statusEl.textContent || '').includes('Selected: Message'), statusEl.textContent);
ok('tag shows Message after init', (icp.tag.textContent || '').includes('Message'), icp.tag.textContent.slice(0, 40));

// full-loop node identity (3 steps)
const refFrame = icp.frame, refTag = icp.tag, refGuide = icp.guide, refCursor = icp.cursor,
  refSize = icp.size, refTop = icp.badgeTop, refSide = icp.badgeSide, refEdge = icp.badgeEdge;
const rowNodesBefore = rows.map(r => r.node);
const names = [];
for (let i = 0; i < 3; i++) {
  const idx = icp.next();
  names.push(icp.status.textContent);
}
ok('full loop cycles 3 rows', names.length === 3, names.join(' | '));
ok('overlay frame node identity across loop', icp.frame === refFrame);
ok('overlay tag node identity across loop', icp.tag === refTag);
ok('overlay guide node identity across loop', icp.guide === refGuide);
ok('overlay cursor node identity across loop', icp.cursor === refCursor);
ok('overlay size node identity across loop', icp.size === refSize);
ok('row nodes identity across loop', (icp.rows.map(r => r.node).every((n, i) => n === rowNodesBefore[i])), 'row nodes stable');
// after 3 next() from 0 -> 0 again? start 0, next->1, next->2, next->0
ok('loop wraps to Message', (statusEl.textContent || '').includes('Message'), statusEl.textContent);

// light AND dark VISIBLE
function checkTheme(theme) {
  docEl.setAttribute('data-theme', theme);
  // re-apply current selection to refresh? call apply
  try { icp.apply(icp.index, true); } catch (e) {}
  const m = findByClass(rootNode, 'icp-message');
  const cs = winStub.getComputedStyle(m);
  const a = alphaOf(cs.color);
  return { opacity: cs.opacity, vis: cs.visibility, alpha: a, color: cs.color };
}
const lv = checkTheme('light');
ok('light theme message visible opacity 1', lv.opacity === '1', `opacity=${lv.opacity}`);
ok('light theme message colour readable', lv.alpha !== null && lv.alpha >= 0.6, `color=${lv.color}`);
const dv = checkTheme('dark');
ok('dark theme message visible opacity 1', dv.opacity === '1', `opacity=${dv.opacity}`);
ok('dark theme message colour readable', dv.alpha !== null && dv.alpha >= 0.6, `color=${dv.color}`);
ok('light/dark tokens distinct', (hintLight !== hintDark) || (lv.color !== dv.color), `light=${hintLight} dark=${hintDark}`);
docEl.setAttribute('data-theme', 'light');
try { icp.apply(icp.index, true); } catch (e) {}

// jump buttons: Message does something (Selected moves, scene moves, stays)
// Use playing=true so stale auto timers exist for original (which fails to clear them).
try { icp.setPlaying(true); } catch (e) {}
// go to Toolbar first via jump (this schedules/stale state)
dots[1].click();
ok('jump to Toolbar sets Selected: Toolbar', (statusEl.textContent || '').includes('Toolbar'), statusEl.textContent);
// snapshot old timers (scheduled before Message click)
const oldIds = new Set(timerQ.map(t => t.id));
const frameTopBefore = icp.frame.style.top;
const tagBefore = icp.tag.textContent;
dots[0].click();
const statusAfterClick = statusEl.textContent;
const tagAfterClick = icp.tag.textContent;
const frameTopAfter = icp.frame.style.top;
ok('Message jump sets Selected: Message immediately', statusAfterClick.includes('Message'), statusAfterClick);
ok('Message jump moves tag to Message', tagAfterClick.includes('Message'), tagAfterClick.slice(0, 40));
ok('Message jump moves scene (frame top changes vs Toolbar)', frameTopAfter !== frameTopBefore, `before=${frameTopBefore} after=${frameTopAfter}`);
ok('Message jump sets dot active', dots[0].getAttribute('data-active') === 'true' && dots[1].getAttribute('data-active') === 'false', `d0=${dots[0].getAttribute('data-active')} d1=${dots[1].getAttribute('data-active')}`);
// flush only old timers (those pending before click) — original leaves them, fixed clears them
const oldTimers = timerQ.filter(t => oldIds.has(t.id));
for (const t of [...oldTimers]) {
  try { t.fn(); } catch (e) {}
  const ix = timerQ.indexOf(t);
  if (ix >= 0) timerQ.splice(ix, 1);
}
ok('Message jump survives pending auto timers (stays Message)', (statusEl.textContent || '').includes('Message'), `after old timers: ${statusEl.textContent}`);
ok('Message jump stays visible after pending timers (data-shown true)', icp.select.getAttribute('data-shown') === 'true', `data-shown=${icp.select.getAttribute('data-shown')}`);

// zero innerHTML writes after init
ok('zero innerHTML writes after init (runtime)', innerWrites === 0, `writes=${innerWrites}`);

console.log(`\nRESULT: ${failures.length === 0 ? 'ALL CHECKS PASSED' : failures.length + ' FAILURES'} (${passes.length} passes) — ${targetArg}`);
process.exit(failures.length === 0 ? 0 : 1);
