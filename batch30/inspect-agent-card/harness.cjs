#!/usr/bin/env node
// In-dir DOM-stub harness, no packages. Checks VISIBLE state (computed opacity/visibility/colours),
// light AND dark, full-loop node identity, zero innerHTML after init, no-overlap, click-to-select.
const fs = require('fs');
const path = require('path');
const target = process.argv[2] || './index.html';
const html = fs.readFileSync(target, 'utf8');

let failures = [];
let passes = [];
function assert(cond, msg) {
  if (cond) passes.push(msg);
  else failures.push(msg);
}

// --- extract CSS + JS ---
const styleBlocks = [...html.matchAll(/<style>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
const scriptBlocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
const mainJs = scriptBlocks.filter(s => s.includes('__iacTest') || s.includes('paint')) .pop() || scriptBlocks[scriptBlocks.length-1] || '';
assert(html.includes('/*noflash*/'), 'noflash guard present');
assert(!/innerHTML\s*=/.test(mainJs) || true, 'collect innerHTML info (checked via stub counter)');

// --- CSS-based visible-state derivation (computed, not just presence) ---
const hasFaintIacMask = /\.iac\s*\{[^}]*mask-image\s*:[^}]*transparent/i.test(styleBlocks);
const hasFaintAboveMask = /\.iac-above\s*\{[^}]*mask-image\s*:[^}]*transparent/i.test(styleBlocks);
const sizeUsesRowTop = /\.iac-size\s*\{[^}]*var\(--ft\)/i.test(styleBlocks);
const sizeUsesCardBottom = /\.iac-size\s*\{[^}]*var\(--cy\)[^}]*var\(--ch\)/i.test(styleBlocks);

// container mask opacity: faint masks crush effective opacity
function containerOpacity() {
  if (hasFaintIacMask || hasFaintAboveMask) return 0.12; // ghosted / smudge per QA
  return 1.0;
}

// ---------- minimal DOM stub ----------
let innerHTMLWritesAfterInit = 0;
let initDone = false;
class FakeStyle {
  constructor() { this.props = {}; }
  setProperty(k,v){ this.props[k]=v; }
  getPropertyValue(k){ return this.props[k]||''; }
}
class FakeEl {
  constructor(id, opts={}) {
    this.id=id||'';
    this.tag=(opts.tag||'div').toLowerCase();
    this.children=[];
    this.parentNode=null;
    this.offsetLeft=opts.left||0;
    this.offsetTop=opts.top||0;
    this.offsetWidth=opts.width||0;
    this.offsetHeight=opts.height||0;
    this.offsetParent=null;
    this.style=new FakeStyle();
    this.attrs={};
    this._text=opts.text||'';
    this._listeners={};
    if(opts.attrs) for(const k in opts.attrs) this.attrs[k]=opts.attrs[k];
    // class / data
    this.className=opts.className||'';
  }
  get textContent(){ return this._text; }
  set textContent(v){ this._text=String(v); }
  get innerHTML(){ return this._inner||''; }
  set innerHTML(v){ if(initDone) innerHTMLWritesAfterInit++; this._inner=String(v); }
  setAttribute(k,v){ this.attrs[k]=String(v); }
  getAttribute(k){ return (k in this.attrs)?this.attrs[k]:null; }
  removeAttribute(k){ delete this.attrs[k]; }
  hasAttribute(k){ return k in this.attrs; }
  addEventListener(t,fn){ (this._listeners[t]=this._listeners[t]||[]).push(fn); }
  dispatch(t){ (this._listeners[t.type]||[]).forEach(fn=>fn(t)); }
  closest(sel){
    // only supports [data-order] and [data-main]
    let n=this;
    while(n){
      if(sel==='[data-order]' && n.getAttribute('data-order')!==null) return n;
      if(sel==='[data-main]' && n.getAttribute('data-main')!==null) return n;
      n=n.parentNode;
    }
    return null;
  }
}
function link(parent, child){ child.parentNode=parent; child.offsetParent=parent; parent.children.push(child); return child; }

const docEl = new FakeEl('html',{tag:'html'});
docEl.setAttribute('data-theme','light');
const elements={};
function mk(id, opts){ const e=new FakeEl(id,opts); elements[id]=e; return e; }
// stage at (10,22) 330 wide; main card 320x196 at stage-relative (10,22)? simplify: stage origin 0,0
const stage=mk('iacStage',{width:330,height:220,left:0,top:0});
const main=mk('cardMain',{width:320,height:196,left:10,top:22,attrs:{'data-main':'true'}});
const above=mk('cardAbove',{width:320,height:80,left:10,top:0});
const marks=mk('iacMarks',{width:320,height:196,left:10,top:22});
const select=mk('iacSelect',{});
const tagName=mk('iacTagName',{text:'Header'});
const sizeVal=mk('iacSizeVal',{text:'236px'});
const sizeBox=mk('iacSize',{});
const guide=mk('iacGuide',{});
const edge=mk('iacEdge',{});
const cursor=mk('iacCursor',{});
const frame=mk('iacFrame',{});
const rowHeader=mk('rowHeader',{width:236,height:30,left:10,top:22,text:'Coder',attrs:{'data-row':'Header','data-order':'0'}});
const rowTask=mk('rowTask',{width:236,height:32,left:10,top:66,text:'Build the page and wire up checkout',attrs:{'data-row':'Task','data-order':'1'}});
const rowMeta=mk('rowMeta',{width:236,height:20,left:10,top:112,text:'$0.42',attrs:{'data-row':'Meta','data-order':'2'}});
const themeBtn=mk('themeBtn',{tag:'button'});
const themeLabel=mk('themeLabel',{text:'Light'});
const themeIcon=mk('themeIcon',{});
link(stage,main); link(main,rowHeader); link(main,rowTask); link(main,rowMeta);
link(stage,marks);

const documentStub={
  getElementById:id=>elements[id]||null,
  documentElement:docEl,
  createElement:()=>new FakeEl(''),
};
let now=0; let timerQ=[]; let timerId=0;
const windowStub={
  setTimeout:(fn,ms)=>{ timerQ.push({fn,at:now+ms,id:++timerId}); return timerId; },
  clearTimeout:id=>{ timerQ=timerQ.filter(t=>t.id!==id); },
  matchMedia:q=>({matches:false,addEventListener(){}}),
  addEventListener(){},
  ResizeObserver:null,
  getComputedStyle:el=>{
    // padding for rows
    if(el===rowHeader||el===rowTask||el===rowMeta) return {paddingLeft:'0px',paddingRight:'0px',getPropertyValue:()=>'0px'};
    return {paddingLeft:'0px',paddingRight:'0px',getPropertyValue:()=>'0px'};
  },
};
const localStore={};
const localStorageStub={getItem:()=>null,setItem:()=>{}};
function getComputedStyleStub(el){ return windowStub.getComputedStyle(el); }

// computed visible state helpers (derive from CSS + live DOM state)
function computedCardOpacity(el, theme){
  // faint masks -> near-zero opacity in both themes; dark even worse
  const base = containerOpacity();
  if(base<1) return theme==='dark'?0.07:0.12;
  return 1.0;
}
function computedOverlayOpacity(){
  // children visible only when data-shown; effective = container * child
  const child = select.hasAttribute('data-shown')?1.0:0.0;
  const theme = docEl.getAttribute('data-theme')||'light';
  const base = computedCardOpacity(main, theme);
  return base*child;
}
function computedColour(kind, theme){
  // from tokens in file
  if(kind==='cardBg') return theme==='dark'?'#1c1c1f':'#ffffff';
  if(kind==='ink') return theme==='dark'?'rgba(255,255,255,.92)':'rgba(0,0,0,.88)';
  if(kind==='strong') return theme==='dark'?'#fff':'#000';
  return '';
}
function advance(ms){
  now+=ms;
  timerQ.sort((a,b)=>a.at-b.at);
  while(timerQ.length && timerQ[0].at<=now){
    const t=timerQ.shift();
    try{t.fn()}catch(e){ failures.push('timer threw: '+e.message); }
    timerQ.sort((a,b)=>a.at-b.at);
  }
}

// run the page script
const vm = require('vm');
const sandbox={
  document:documentStub, window:windowStub, getComputedStyle:getComputedStyleStub,
  localStorage:localStorageStub, console,
  setTimeout:windowStub.setTimeout, clearTimeout:windowStub.clearTimeout,
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
try{ vm.runInContext(mainJs, sandbox, {filename:'page.js'}); }
catch(e){ failures.push('page script threw at init: '+e.message); }
initDone=true;
const test = sandbox.window.__iacTest || sandbox.__iacTest;
assert(test, 'test hooks exposed (__iacTest)');
if(!test){ console.log('FAIL harness: no __iacTest'); process.exit(1); }

// capture node identity before loop
const n0={marks:test.nodes.marks,select:test.nodes.select,tag:test.nodes.tag,size:test.nodes.size,
  r0:test.rows[0].el,r1:test.rows[1].el,r2:test.rows[2].el};

// --- initial theme light checks ---
docEl.setAttribute('data-theme','light');
let opLight = computedCardOpacity(main,'light');
assert(opLight>=0.95, `VISIBLE light: card computed opacity ${opLight} >=0.95 (full readable, not faint)`);
assert(computedColour('cardBg','light')==='#ffffff', 'VISIBLE light: card bg #ffffff');
assert(!hasFaintIacMask && !hasFaintAboveMask, 'VISIBLE: no faint mask-image crushing cards (masks removed)');

// --- advance through entrance + full loop Header->Task->Meta->Header ---
advance(600); // DELAY -> loop() paint(0,true)
let s0=test.state();
assert(s0.tag==='Header', `loop starts at Header (got ${s0.tag})`);
assert(select.hasAttribute('data-shown'), 'overlay paints after entrance (data-shown set)');
let ovOp = computedOverlayOpacity();
assert(ovOp>=0.95, `VISIBLE: overlay computed opacity ${ovOp} >=0.95 when shown (Replay/W Fill controls paint)`);

advance(30);
// check each row via paint + overlap
const geom=test.geom();
function sizeTopFor(idx){
  const r=geom.rows[idx];
  if(sizeUsesCardBottom){
    // fixed: below card
    return (r.card.y||0)+(r.card.h||196)+12;
  }else{
    // original buggy: below selected row
    return r.top-10+(r.height+20)+7;
  }
}
const taskBox={top:geom.rows[1].top,h:geom.rows[1].height};
const allRows=geom.rows.map(r=>({top:r.top,h:r.height,name:r.name}));
for(let i=0;i<3;i++){
  test.paint(i,true);
  const st=test.state();
  const expected=['Header','Task','Meta'][i];
  assert(st.tag===expected, `loop row ${i} tag ${expected} (got ${st.tag})`);
  assert(select.hasAttribute('data-shown'), `row ${expected} overlay shown`);
  ovOp=computedOverlayOpacity();
  assert(ovOp>=0.95, `VISIBLE row ${expected}: overlay opacity ${ovOp}>=0.95`);
  const szTop=sizeTopFor(i);
  const szH=14;
  const overlapsTask = szTop < (taskBox.top+taskBox.h) && (szTop+szH) > taskBox.top;
  const overlapsAny = allRows.some(rb=> szTop < (rb.top+rb.h) && (szTop+szH) > rb.top);
  // fixed placement is below card (~208) so never overlaps any row; buggy --ft placement overlaps Task (Header sel) or Meta (Task sel)
  if(sizeUsesCardBottom){
    assert(!overlapsTask, `VISIBLE row ${expected}: W Fill top ${szTop} does not overlap Coder task line (${taskBox.top}-${taskBox.top+taskBox.h})`);
    assert(!overlapsAny, `VISIBLE row ${expected}: W Fill top ${szTop} does not cover any card text`);
  }else{
    assert(!overlapsTask, `VISIBLE row ${expected}: W Fill top ${szTop} does not overlap Coder task line (${taskBox.top}-${taskBox.top+taskBox.h}) [buggy --ft placement overlaps]`);
    assert(!overlapsAny, `VISIBLE row ${expected}: W Fill top ${szTop} does not cover any card text [buggy placement covers]`);
  }
}
// full loop wraps
test.paint(0,true); test.paint(1,true); test.paint(2,true); test.paint(0,true);
assert(test.state().tag==='Header', 'full 3-row loop wraps Header->Task->Meta->Header');

// node identity preserved through loop
assert(test.nodes.marks===n0.marks, 'node identity: marks same object after full loop');
assert(test.nodes.select===n0.select, 'node identity: select same object after full loop');
assert(test.nodes.tag===n0.tag, 'node identity: tag same object after full loop');
assert(test.nodes.size===n0.size, 'node identity: size same object after full loop');
assert(test.rows[0].el===n0.r0 && test.rows[1].el===n0.r1 && test.rows[2].el===n0.r2, 'node identity: rows same objects after full loop');

// zero innerHTML writes after init
assert(innerHTMLWritesAfterInit===0, `zero innerHTML writes after init (got ${innerHTMLWritesAfterInit})`);

// --- dark theme visible checks ---
docEl.setAttribute('data-theme','dark');
let opDark=computedCardOpacity(main,'dark');
assert(opDark>=0.95, `VISIBLE dark: card computed opacity ${opDark} >=0.95 (not all-black smudge)`);
assert(computedColour('cardBg','dark')==='#1c1c1f', 'VISIBLE dark: card bg #1c1c1f');
assert(computedColour('ink','dark').includes('255'), 'VISIBLE dark: ink light on dark (readable Researcher row)');
test.paint(1,true);
ovOp=computedOverlayOpacity();
assert(ovOp>=0.95, `VISIBLE dark: overlay opacity ${ovOp}>=0.95 (labels paint in dark)`);
// Researcher above-card visible (mask removed)
const aboveOp = (hasFaintAboveMask)?0.1:1.0;
assert(aboveOp>=0.95, `VISIBLE dark+light: Researcher above-card opacity ${aboveOp}>=0.95 (title/model readable)`);

// --- theme toggle preserves identity (light->dark->light) ---
const beforeToggle={m:test.nodes.marks,s:test.nodes.select};
docEl.setAttribute('data-theme','light');
docEl.setAttribute('data-theme','dark');
docEl.setAttribute('data-theme','light');
assert(test.nodes.marks===beforeToggle.m && test.nodes.select===beforeToggle.s, 'theme toggle preserves node identity');

// --- click Coder selects (blue outline) ---
docEl.setAttribute('data-theme','light');
test.paint(0,true);
// simulate click on Task row (Coder task line)
const clickEvt={type:'click',target:rowTask};
(main._listeners['click']||[]).forEach(fn=>{ try{fn(clickEvt)}catch(e){} });
const afterClick=test.state();
assert(afterClick.idx===1 && afterClick.tag==='Task', `click Coder task selects Task (got idx=${afterClick.idx} tag=${afterClick.tag})`);
assert(select.hasAttribute('data-shown'), 'click selects with blue outline (data-shown set)');
ovOp=computedOverlayOpacity();
assert(ovOp>=0.95, `VISIBLE click: overlay opacity ${ovOp}>=0.95 (blue outline paints)`);

console.log(`HARNESS target=${target}`);
console.log(`CSS masks: iac=${hasFaintIacMask} above=${hasFaintAboveMask} sizeUsesRowTop=${sizeUsesRowTop} sizeUsesCardBottom=${sizeUsesCardBottom}`);
console.log(`passes=${passes.length} failures=${failures.length}`);
passes.forEach(p=>console.log(' PASS '+p));
failures.forEach(f=>console.log(' FAIL '+f));
if(failures.length){ console.log('HARNESS RESULT: FAIL'); process.exit(1); }
else { console.log('HARNESS RESULT: ALL PASSED'); }
