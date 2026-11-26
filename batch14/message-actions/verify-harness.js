/* verify-harness.js — in-dir DOM-stub harness (node only, no browser).
 * Simulates BOTH paths and asserts the version pager paints:
 *  - MANUAL path: user clicks Regenerate -> advance 1000ms -> pager painted.
 *  - DEMO path: fresh reload, advance tour timers to version stage WITHOUT
 *    any manual click -> pager painted (data-open, no inert/hidden,
 *    no opacity-0 / visibility:hidden, non-zero intended size).
 * Checks both light and dark themes (data-theme on <html>).
 */
'use strict';
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('PASS: ' + msg); }
  else { fail++; console.log('FAIL: ' + msg); }
}

// ---------- static checks ----------
ok(html.includes('/*noflash*/'), 'noflash guard present');
ok(html.includes('data-theme') && html.includes('--page'), 'light+dark theme tokens present');
const styleText = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
ok(/\.ui-ma__versions\s*\{[^}]*opacity:\s*0[^}]*visibility:\s*hidden/s.test(styleText), 'css: versions base hidden (opacity 0 + visibility hidden)');
ok(/\.ui-ma__versions\[data-open\][^{]*\{[^}]*opacity:\s*1[^}]*visibility:\s*visible/s.test(styleText), 'css: versions[data-open] painted (opacity 1 + visibility visible)');
ok(/\.ui-ma__versions\[data-open\][^{]*\{[^}]*grid-template-columns:\s*1fr/s.test(styleText) || /\.ui-ma__versions\[data-open\][\s\S]*?1fr/.test(styleText), 'css: versions[data-open] non-zero size (1fr)');
ok(/\[hidden\]\s*\{[^}]*display:\s*none/.test(styleText), 'css: [hidden] rule present');
ok(html.includes('meta name="color-scheme"'), 'meta color-scheme present');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const main = scripts[scripts.length - 1];
ok(!/innerHTML/.test(main), 'js: zero innerHTML writes (in-place updates only)');
ok(/localStorage\.getItem\('ma-theme'\)/.test(main) || /ma-theme/.test(main), 'js: theme persistence key present');
// Divergence regression: demo-path (gotoVersion->setAnswer) must paint like click-path (refreshVersions).
// Extract setAnswer body and require it to sync versionsWrap visibility (data-open/inert).
(function () {
  const m = main.match(/function setAnswer[\s\S]*?\n\}/);
  const body = m ? m[0] : '';
  ok(/versionsWrap\.setAttribute\('data-open'/.test(body), 'js: setAnswer syncs pager paint (sets data-open) — demo route paints like click route');
  ok(/versionsWrap\.removeAttribute\('inert'\)/.test(body), 'js: setAnswer clears inert when versions>1');
  ok(/gotoVersion[\s\S]*?setAnswer/.test(main), 'js: gotoVersion routes through setAnswer (inherits paint sync)');
})();

// ---------- minimal DOM stub ----------
function makeEnv() {
  const timers = [];
  let now = 0, seq = 0;
  class El {
    constructor(tag) {
      this.tagName = (tag || 'div').toUpperCase();
      this.children = [];
      this.attrs = new Map();
      this.listeners = new Map();
      this.parentNode = null;
      this._text = '';
      this._class = '';
      this.value = '';
      this.disabled = false;
      this.hidden = false;
      this._cls = new Set();
      this.classList = {
        add: (c) => { this._cls.add(c); },
        remove: (c) => { this._cls.delete(c); },
        contains: (c) => this._cls.has(c),
      };
      Object.defineProperty(this, 'offsetWidth', { get: () => 100 });
    }
    get className() { return this._class; }
    set className(v) { this._class = String(v == null ? '' : v); }
    get textContent() {
      // if has element children with text, join? keep simple: stored _text
      return this._text;
    }
    set textContent(v) { this._text = String(v == null ? '' : v); }
    setAttribute(k, v) { this.attrs.set(k, String(v)); }
    getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
    hasAttribute(k) { return this.attrs.has(k); }
    removeAttribute(k) { this.attrs.delete(k); }
    appendChild(c) {
      if (!c) return c;
      if (c.parentNode) {
        const i = c.parentNode.children.indexOf(c);
        if (i >= 0) c.parentNode.children.splice(i, 1);
      }
      c.parentNode = this;
      this.children.push(c);
      return c;
    }
    removeChild(c) {
      const i = this.children.indexOf(c);
      if (i >= 0) this.children.splice(i, 1);
      if (c) c.parentNode = null;
      return c;
    }
    addEventListener(t, fn) {
      if (!this.listeners.has(t)) this.listeners.set(t, []);
      this.listeners.get(t).push(fn);
    }
    click() {
      const fns = this.listeners.get('click') || [];
      const e = { target: this, key: '', preventDefault() {}, stopPropagation() {} };
      for (const fn of [...fns]) fn.call(this, e);
    }
    focus() { /* no-op; must NOT trigger demoRoot focus stopLoop in stub */ }
    contains(n) {
      let c = n;
      while (c) { if (c === this) return true; c = c.parentNode; }
      return false;
    }
  }

  const byId = new Map();
  function preId(id) {
    const e = new El('div');
    e.setAttribute('id', id);
    byId.set(id, e);
    return e;
  }
  ['tray', 'answerLine', 'demoRoot', 'themeToggle', 'iconSun', 'iconMoon', 'demoMeta', 'askLine'].forEach(preId);

  const docEl = new El('html');
  docEl.setAttribute('data-theme', 'light');

  const documentStub = {
    _els: byId,
    documentElement: docEl,
    createElement: (t) => new El(t),
    createElementNS: (ns, t) => new El(t),
    createTextNode: (txt) => {
      const n = new El('#text');
      n.textContent = txt;
      return n;
    },
    getElementById: (id) => byId.get(id) || null,
    addEventListener: () => {},
  };

  const windowStub = {
    setTimeout: (fn, ms) => {
      const id = ++seq;
      timers.push({ id, fn, due: now + (ms || 0) });
      return id;
    },
    clearTimeout: (id) => {
      const i = timers.findIndex(t => t.id === id);
      if (i >= 0) timers.splice(i, 1);
    },
    matchMedia: () => ({ matches: false }),
  };

  const store = {};
  const localStorageStub = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  };

  function runDue(limit) {
    // run timers in due order up to limit ms of virtual time
    const end = now + limit;
    while (true) {
      if (!timers.length) break;
      timers.sort((a, b) => a.due - b.due);
      if (timers[0].due > end) break;
      const t = timers.shift();
      now = t.due;
      t.fn();
    }
    now = end;
  }
  function runCount(n) {
    for (let i = 0; i < n && timers.length; i++) {
      timers.sort((a, b) => a.due - b.due);
      const t = timers.shift();
      now = t.due;
      t.fn();
    }
  }
  function pendingCount() { return timers.length; }

  return { El, documentStub, windowStub, localStorageStub, store, timers, runDue, runCount, pendingCount, getNow: () => now };
}

function findByClass(root, cls) {
  const out = [];
  (function walk(n) {
    if (!n) return;
    const cn = (' ' + (n.className || '') + ' ');
    if (cn.includes(' ' + cls + ' ')) out.push(n);
    for (const c of (n.children || [])) walk(c);
  })(root);
  return out;
}
function findBtnByAria(root, label) {
  let found = null;
  (function walk(n) {
    if (found || !n) return;
    if (n.tagName === 'BUTTON' && n.getAttribute('aria-label') === label) { found = n; return; }
    for (const c of (n.children || [])) walk(c);
  })(root);
  return found;
}
function getText(n) { return n ? n.textContent : ''; }

function loadPage(env, theme) {
  const { documentStub, windowStub, localStorageStub } = env;
  if (theme) documentStub.documentElement.setAttribute('data-theme', theme);
  const sandboxWindow = windowStub;
  const fn = new Function('window', 'document', 'localStorage', 'navigator', main + '\n;return;');
  const navigatorStub = { clipboard: { writeText: () => Promise.resolve() } };
  try {
    // run with window==sandboxWindow etc.
    const runner = new Function('window', 'document', 'localStorage', 'navigator', main);
    runner(sandboxWindow, documentStub, localStorageStub, navigatorStub);
  } finally {}
}

function paintedState(versionsWrap) {
  const hasOpen = versionsWrap.hasAttribute('data-open');
  const hasInert = versionsWrap.hasAttribute('inert');
  const hasHidden = versionsWrap.hasAttribute('hidden');
  const style = versionsWrap.getAttribute('style') || '';
  const inlineHides = /opacity\s*:\s*0|visibility\s*:\s*hidden|display\s*:\s*none/i.test(style);
  // intended size: data-open drives 1fr in CSS; without it, 0fr => zero size
  const painted = hasOpen && !hasInert && !hasHidden && !inlineHides;
  return { hasOpen, hasInert, hasHidden, inlineHides, painted };
}

// ---------- MANUAL path (both themes) ----------
for (const theme of ['light', 'dark']) {
  const env = makeEnv();
  loadPage(env, theme);
  const tray = env.documentStub.getElementById('tray');
  // let init timers settle (none pending except loop); find regen button
  const regenBtn = findBtnByAria(tray, 'Regenerate response') || findBtnByAria(tray, 'Regenerate');
  ok(!!regenBtn, `[manual/${theme}] regen button exists`);
  if (regenBtn) {
    regenBtn.click(); // manual user click
    env.runDue(1300); // regen busy 1000ms + margin
    const vw = findByClass(tray, 'ui-ma__versions')[0];
    ok(!!vw, `[manual/${theme}] versions wrap exists`);
    if (vw) {
      const st = paintedState(vw);
      ok(st.painted, `[manual/${theme}] pager PAINTED after manual Regenerate (data-open, no inert/hidden/inline-hide)`);
      ok(st.hasOpen && !st.hasInert, `[manual/${theme}] data-open present, inert removed`);
      const counts = findByClass(tray, 'ui-ma__count')[0];
      const label = counts ? counts.getAttribute('aria-label') : '';
      ok(/Version 2 of 2/.test(label || ''), `[manual/${theme}] aria-label is "Version 2 of 2" (got "${label}")`);
    }
  }
}

// ---------- DEMO path (fresh reload, no manual click, both themes) ----------
for (const theme of ['light', 'dark']) {
  const env = makeEnv();
  loadPage(env, theme);
  const tray = env.documentStub.getElementById('tray');
  // Advance the AUTO tour timers to the version stage:
  // LOOP = 700 copy, 1000 down, 700 chip, 900 send, 2600 regen, (1000 regen-busy), 2800 prev
  // Total to just past regen completion: 700+1000+700+900+2600+1000 = 5900; prev fires at 8700.
  // Run virtual time to cover regen completion but BEFORE reset (13700).
  env.runDue(7500); // lands after regen completion (6900) and before/at prev — version stage
  const vw = findByClass(tray, 'ui-ma__versions')[0];
  ok(!!vw, `[demo/${theme}] versions wrap exists at version stage without manual click`);
  if (vw) {
    const st = paintedState(vw);
    ok(st.painted, `[demo/${theme}] pager PAINTED during AUTO-DEMO version stage (data-open, no inert/hidden/inline-hide)`);
    ok(st.hasOpen && !st.hasInert && !st.hasHidden && !st.inlineHides,
      `[demo/${theme}] painted-state attrs: data-open=${st.hasOpen} inert=${st.hasInert} hidden=${st.hasHidden} inlineHide=${st.inlineHides}`);
    const counts = findByClass(tray, 'ui-ma__count')[0];
    const label = counts ? counts.getAttribute('aria-label') : '';
    ok(/Version 2 of 2/.test(label || ''), `[demo/${theme}] demo aria-label is "Version 2 of 2" (got "${label}")`);
    // count text should read 2 / 2
    const nowEl = findByClass(tray, 'ui-ma__count-now')[0];
    const nowTxt = nowEl ? getText(nowEl.children[0] || nowEl) || getText(nowEl) : '';
    ok(/2/.test(nowTxt) || /2/.test(label || ''), `[demo/${theme}] demo count shows 2 (got "${nowTxt}" / "${label}")`);
    // prev/next buttons exist (accessibility) AND pager is painted (pixels)
    const prev = findBtnByAria(tray, 'Previous version');
    const next = findBtnByAria(tray, 'Next version');
    ok(!!prev && !!next, `[demo/${theme}] Previous/Next buttons exist in demo`);
  }
  // Also verify still painted after prev step (tour continues), before reset
  env.runDue(2000); // through prev (~8700)
  const vw2 = findByClass(tray, 'ui-ma__versions')[0];
  if (vw2) {
    const st2 = paintedState(vw2);
    ok(st2.painted, `[demo/${theme}] pager STILL PAINTED after tour prev step`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
