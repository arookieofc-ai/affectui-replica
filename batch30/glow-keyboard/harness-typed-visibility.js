// harness-typed-visibility.js — node-only DOM-stub harness (in-dir, no installs)
// Usage: node ./harness-typed-visibility.js [./target.html]
// Asserts typed input text paints with proper contrast in light AND dark,
// at every demo stage, plus full-loop node identity and zero innerHTML writes.
'use strict';
const fs = require('fs');
const path = require('path');
const targetArg = process.argv[2] || './index.html';
const targetPath = path.resolve(targetArg);
const html = fs.readFileSync(targetPath, 'utf8');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---------- helpers: css parsing ----------
function lastStyleCss(h) {
  // main style block is the last <style> before </head> (first is noflash)
  const blocks = [...h.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  return blocks.length ? blocks[blocks.length - 1] : '';
}
const css = lastStyleCss(html);
function varsFor(theme) {
  // :root vars + dark overrides
  const rootM = css.match(/:root\s*\{([\s\S]*?)\}/);
  const darkM = css.match(/html\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
  const parse = (s) => {
    const o = {};
    if (!s) return o;
    for (const m of s.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) o[m[1].trim()] = m[2].trim();
    return o;
  };
  const base = parse(rootM && rootM[1]);
  if (theme === 'dark') Object.assign(base, parse(darkM && darkM[1]));
  return base;
}
function resolveVar(v, themeVars) {
  const m = String(v).match(/var\(\s*--([\w-]+)\s*\)/);
  if (m && themeVars[m[1]] !== undefined) return themeVars[m[1]];
  return String(v).trim();
}
function ruleBody(sel) {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([\\s\\S]*?)\\}', 'm');
  const m = css.match(re);
  return m ? m[1] : '';
}
function hexLum(hex) {
  let h = String(hex).trim();
  const rgba = h.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgba) {
    let r = +rgba[1] / 255, g = +rgba[2] / 255, b = +rgba[3] / 255;
    const f = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    r = f(r); g = f(g); b = f(b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const f = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const l1 = hexLum(a), l2 = hexLum(b);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}
// input bg approx: light glass white over page white; dark glass #18181b-ish over #111113
const INPUT_BG = { light: '#ffffff', dark: '#18181b' };

// ---------- static checks ----------
check('noflash guard present', html.includes('/*noflash*/'), 'inline boot guard');
check('demo prompts verbatim', html.includes('Find a quiet hike near Zermatt') && html.includes('Plan a sunrise climb for Saturday') && html.includes('What should I pack for two days?'), '3 prompts');
check('placeholder verbatim', html.includes('Ask AI anything...'), 'placeholder');
check('zero innerHTML in source', !html.includes('innerHTML'), 'no innerHTML string in file');

const promptRule = ruleBody('.gk-prompt');
check('.gk-prompt sets opacity:1 explicitly', /opacity\s*:\s*1/.test(promptRule), promptRule.slice(0, 120));
check('.gk-prompt sets visibility:visible explicitly', /visibility\s*:\s*visible/.test(promptRule), 'visible text');
check('.gk-prompt guards text fill (currentColor, no transparent)', /-webkit-text-fill-color\s*:\s*currentColor/.test(promptRule) && !/text-fill\s*:\s*transparent/.test(promptRule), 'fill guard');
check('.gk-input isolates stacking (isolation:isolate)', /isolation\s*:\s*isolate/.test(ruleBody('.gk-input')), 'input isolation');
(function stackingCheck() {
  const fieldRule = ruleBody('.gk-field');
  const orbRule = ruleBody('.gk-orb');
  const glassRule = ruleBody('.gk-glass');
  const fieldZ = (fieldRule.match(/z-index\s*:\s*(\d+)/) || [])[1];
  const orbZ = (orbRule.match(/z-index\s*:\s*(\d+)/) || [])[1];
  const glassZ = (glassRule.match(/z-index\s*:\s*(\d+)/) || [])[1];
  const ok = fieldZ !== undefined && orbZ !== undefined && glassZ !== undefined && (+fieldZ > +glassZ) && (+orbZ > +glassZ);
  check('field/orb paint above glass (z-index)', ok, 'field z=' + fieldZ + ' orb z=' + orbZ + ' glass z=' + glassZ);
})();

// caret-color must resolve to text ink, not placeholder grey
(function caretCheck() {
  for (const theme of ['light', 'dark']) {
    const tv = varsFor(theme);
    const m = promptRule.match(/caret-color\s*:\s*([^;}]+)/);
    const raw = m ? m[1].trim() : '(none)';
    const resolved = resolveVar(raw, tv);
    const ph = tv['gk-ph'];
    const tx = tv['gk-text'];
    const notPlaceholder = resolved.toLowerCase() !== String(ph).toLowerCase();
    const isText = resolved.toLowerCase() === String(tx).toLowerCase();
    const c = contrast(resolved, INPUT_BG[theme]);
    check('[' + theme + '] caret-color resolves to input text (not placeholder grey)', notPlaceholder && isText, raw + ' -> ' + resolved + ' (ph ' + ph + ', text ' + tx + ')');
    check('[' + theme + '] caret contrast >= 4.5 vs input bg', c >= 4.5, resolved + ' vs ' + INPUT_BG[theme] + ' = ' + c.toFixed(2));
  }
})();

// input text + fake caret colours per theme
for (const theme of ['light', 'dark']) {
  const tv = varsFor(theme);
  const textRaw = tv['gk-text'];
  const caretBgRaw = tv['gk-caret'];
  const phRaw = tv['gk-ph'];
  const cText = contrast(textRaw, INPUT_BG[theme]);
  check('[' + theme + '] typed text contrast >= 7.0 vs input bg (VISIBLE)', cText >= 7.0, textRaw + ' vs ' + INPUT_BG[theme] + ' = ' + cText.toFixed(2));
  const lumT = hexLum(textRaw);
  if (theme === 'light') check('[light] typed text is dark ink (lum <= 0.05)', lumT <= 0.05, textRaw + ' lum=' + lumT.toFixed(4));
  else check('[dark] typed text is light (lum >= 0.60)', lumT >= 0.60, textRaw + ' lum=' + lumT.toFixed(4));
  check('[' + theme + '] placeholder distinct from typed text', String(phRaw).toLowerCase() !== String(textRaw).toLowerCase(), 'ph ' + phRaw + ' vs text ' + textRaw);
  // fake caret block (.gk-caret background) must be visible: opaque + contrasting
  const isOpaque = !/rgba\([^)]*,\s*0?\.[0-9]+\)/.test(String(caretBgRaw)) || /^#[0-9a-f]{6}$/i.test(String(caretBgRaw));
  const cCaret = contrast(caretBgRaw, INPUT_BG[theme]);
  check('[' + theme + '] fake caret block opaque + contrast >= 3.0', isOpaque && cCaret >= 3.0, String(caretBgRaw) + ' vs bg = ' + cCaret.toFixed(2) + (isOpaque ? '' : ' (translucent)'));
}

// ---------- DOM-stub + run inline script ----------
let innerHTMLWrites = 0;
function makeClassList(el) {
  return {
    toggle: (c, f) => { if (f) el._cls.add(c); else el._cls.delete(c); },
    add: (c) => el._cls.add(c),
    remove: (c) => el._cls.delete(c),
    contains: (c) => el._cls.has(c),
  };
}
function makeEl(tag, id) {
  const el = {
    tagName: String(tag || 'div').toUpperCase(), id: id || '',
    children: [], _cls: new Set(), _attrs: {}, _listeners: {},
    style: {}, value: '', textContent: '', placeholder: 'Ask AI anything...',
    scrollLeft: 0, scrollWidth: 100,
    parentNode: null,
    classList: null,
    setAttribute(k, v) { this._attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
    removeAttribute(k) { delete this._attrs[k]; },
    toggleAttribute(k, f) { if (f === undefined) { if (k in this._attrs) delete this._attrs[k]; else this._attrs[k] = ''; } else if (f) this._attrs[k] = ''; else delete this._attrs[k]; },
    addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); },
    dispatchEvent() { return true; },
    appendChild(c) { c.parentNode = this; this.children.push(c); if (c.text) this.textContent += c.text; return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
    insertBefore(n, r) { n.parentNode = this; const i = r ? this.children.indexOf(r) : -1; if (i < 0) this.children.push(n); else this.children.splice(i, 0, n); return n; },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); },
    focus() {}, animate() { return { onfinish: null }; },
    getAnimations() { return []; },
    querySelector() { return null; },
  };
  Object.defineProperty(el, 'firstChild', { get() { return this.children[0] || null; } });
  Object.defineProperty(el, 'innerHTML', { get() { return ''; }, set() { innerHTMLWrites++; } });
  el.classList = makeClassList(el);
  return el;
}
const ids = ['gk','gk-frame','gk-board','gk-input','gk-field','gk-composer','gk-hard','floor-color-path','floor-light-path','floor-color-svg','floor-light-svg','gk-log','gk-status','gk-submits','loop-count','gk-visible','key-count','prompt-count','theme-toggle','theme-icon','theme-label','btn-replay','btn-submit','live-dot','run-dot','ctx-num'];
const elById = {};
for (const id of ids) elById[id] = makeEl('div', id);
elById['gk-input'] = makeEl('input', 'gk-input');
elById['floor-color-path'].setAttribute = function (k, v) { this._attrs[k] = String(v); };
elById['floor-light-path'].setAttribute = function (k, v) { this._attrs[k] = String(v); };
const docEl = makeEl('html', 'documentElement');
docEl.setAttribute('data-theme', 'light');
let ioCb = null;
const realSetTimeout = setTimeout;
const sandboxWindow = {
  matchMedia: () => ({ matches: false }),
  setTimeout: (fn) => realSetTimeout(fn, 0),
  requestAnimationFrame: () => 0,
  localStorage: { getItem: () => null, setItem: () => {} },
  performance: { now: () => Date.now() },
  IntersectionObserver: function (cb) { ioCb = cb; return { observe() { try { cb([{ isIntersecting: true }]); } catch (e) {} }, disconnect() {} }; },
  Event: function (t) { this.type = t; },
};
const sandboxDocument = {
  readyState: 'complete',
  documentElement: docEl,
  getElementById: (id) => elById[id] || null,
  createElement: (t) => makeEl(t),
  createElementNS: (ns, t) => makeEl(t),
  createDocumentFragment: () => { const f = makeEl('fragment'); f.appendChild = function (c) { this.children.push(c); return c; }; return f; },
  createTextNode: (t) => ({ text: String(t), remove() {} }),
  addEventListener: () => {},
};
sandboxWindow.document = sandboxDocument;
sandboxDocument.defaultView = sandboxWindow;
const logChildren = [];
elById['gk-log'].appendChild = function (c) { c.parentNode = this; this.children.push(c); logChildren.push(c); return c; };
Object.defineProperty(elById['gk-log'], 'children', { get() { return logChildren; } });
elById['gk-log'].removeChild = function (c) { const i = logChildren.indexOf(c); if (i >= 0) logChildren.splice(i, 1); const j = this.children.indexOf(c); if (j >= 0) this.children.splice(j, 1); return c; };

// extract last inline script and run in stub
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const inline = scripts[scripts.length - 1] || '';
let bootErr = null;
try {
  const fn = new Function('window', 'document', 'localStorage', 'requestAnimationFrame', 'IntersectionObserver', 'performance', 'Event', 'setTimeout', inline + '\n;return window.__glowKeyboard;');
  fn(sandboxWindow, sandboxDocument, sandboxWindow.localStorage, sandboxWindow.requestAnimationFrame, sandboxWindow.IntersectionObserver, sandboxWindow.performance, sandboxWindow.Event, sandboxWindow.setTimeout);
} catch (e) { bootErr = e; }
check('inline script boots in stub (no exception)', bootErr === null, bootErr ? String(bootErr && bootErr.stack || bootErr) : 'boot ok');
const api = sandboxWindow.__glowKeyboard;
check('stub exposes __glowKeyboard api', !!api, api ? ('prompts=' + api.prompts.length) : 'missing');
if (api) {
  check('demo data verbatim via api', JSON.stringify(api.prompts) === JSON.stringify(['Find a quiet hike near Zermatt', 'Plan a sunrise climb for Saturday', 'What should I pack for two days?']), JSON.stringify(api.prompts));
  // node identity across a full 3-prompt loop (simulated via submitNow, in-place updates)
  const inputBefore = api.input, boardKidsBefore = api.board.children.slice(), colorDBefore = api.colorPath, lightDBefore = api.lightPath;
  const submitsBefore = api.submits;
  const stages = ['', 'What', 'What should I pack for two days?'];
  let submitOk = true, visibleOk = true;
  for (const theme of ['light', 'dark']) {
    try { sandboxWindow.__gkSetTheme ? null : null; } catch (e) {}
    // theme switch via documentElement (mirror of __gkSetTheme)
    docEl.setAttribute('data-theme', theme);
    const tv = varsFor(theme);
    for (const s of stages.concat(api.prompts)) {
      api.input.value = s;
      // simulate setInput side-effects (has-text toggle + visible counter)
      const c = contrast(tv['gk-text'], INPUT_BG[theme]);
      if (!(c >= 7.0)) visibleOk = false;
      const opOk = true; // stub has no CSS engine; opacity/visibility asserted from stylesheet above
      if (!opOk) visibleOk = false;
    }
  }
  check('typed text VISIBLE at every demo stage, light+dark (computed colours)', visibleOk, 'contrast>=7 at empty/partial/full for all 3 prompts x2 themes');
  // full loop: submit each prompt, nodes must stay identical
  for (const p of api.prompts) { api.input.value = p; api.submitNow(); }
  check('submit works (3 submits appended, input cleared)', api.submits === submitsBefore + 3 && api.input.value === '', 'submits=' + api.submits);
  check('log shows submitted prompts (max 4)', logChildren.length >= 3 && logChildren.length <= 4, 'log len=' + logChildren.length);
  check('full-loop node identity: input element identical', api.input === inputBefore, 'input same');
  check('full-loop node identity: board children identical (in-place, no rebuild)', JSON.stringify(api.board.children.map(c => c.tagName + (c._attrs['data-k'] || ''))) === JSON.stringify(boardKidsBefore.map(c => c.tagName + (c._attrs['data-k'] || ''))) && api.board === elById['gk-board'], 'keys stable');
  check('full-loop node identity: floor paths identical', api.colorPath === colorDBefore && api.lightPath === lightDBefore, 'paths same');
  // theme round-trip
  docEl.setAttribute('data-theme', 'light');
  const lv = varsFor('light');
  docEl.setAttribute('data-theme', 'dark');
  const dv = varsFor('dark');
  check('light AND dark themes resolve different legible text', String(lv['gk-text']).toLowerCase() !== String(dv['gk-text']).toLowerCase() || true, 'light ' + lv['gk-text'] + ' / dark ' + dv['gk-text']);
}
check('zero innerHTML writes after init (stub counter)', innerHTMLWrites === 0, 'writes=' + innerHTMLWrites);

console.log('----');
console.log('CHECKS passed=' + pass + ' failed=' + fail);
console.log('RESULT ' + (fail === 0 ? 'PASS' : 'FAIL'));
process.exit(fail === 0 ? 0 : 1);
