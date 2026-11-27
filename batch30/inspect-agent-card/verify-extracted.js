
(function(){
"use strict";
var HOLD=1600,DELAY=600,M=180,H=120;
var SHOW_AT=30,HIDE_AFTER=590+HOLD,NEXT_AFTER=590+HOLD+M+H;
var stage=document.getElementById("iacStage");
var main=document.getElementById("cardMain");
var marks=document.getElementById("iacMarks");
var select=document.getElementById("iacSelect");
var tagName=document.getElementById("iacTagName");
var sizeVal=document.getElementById("iacSizeVal");
var rows=[
{el:document.getElementById("rowHeader"),name:"Header",order:0},
{el:document.getElementById("rowTask"),name:"Task",order:1},
{el:document.getElementById("rowMeta"),name:"Meta",order:2}
];
function pos(el,stop){var x=0,y=0,n=el;while(n&&n!==stop){x+=n.offsetLeft||0;y+=n.offsetTop||0;n=n.offsetParent}return{x:x,y:y}}
function measure(){
try{
var mb=pos(main,stage);
var mw=main.offsetWidth||320,mh=main.offsetHeight||180;
var list=rows.map(function(r){
var card=r.el.closest? (r.el.closest("[data-main]")||main):main;
var cb=pos(card,stage);
var rel={x:cb.x-mb.x,y:cb.y-mb.y,w:card.offsetWidth||320,h:card.offsetHeight||120};
var rp=pos(r.el,card);
var cs=null,pl=0,pr=0;
try{cs=getComputedStyle(r.el);pl=parseFloat(cs.paddingLeft)||0;pr=parseFloat(cs.paddingRight)||0}catch(e){}
var rw=(r.el.offsetWidth||236)-pl-pr;
return{name:r.name,el:r.el,x:rel.x+rp.x+pl,top:rel.y+rp.y,height:r.el.offsetHeight||20,width:rw,card:rel};
});
return{x:mb.x,y:mb.y,w:mw,h:mh,rows:list};
}catch(e){
return{x:10,y:22,w:320,h:196,rows:rows.map(function(r,i){return{name:r.name,el:r.el,x:10,top:22+i*40,height:22,width:236,card:{x:0,y:0,w:320,h:196}}})};
}
}
var geom=measure();
function applyGeom(g){
geom=g;
marks.style.setProperty("--x",g.x+"px");
marks.style.setProperty("--y",g.y+"px");
marks.style.setProperty("--w",g.w+"px");
marks.style.setProperty("--h",g.h+"px");
}
applyGeom(geom);
try{
if(window.ResizeObserver){
var ro=new ResizeObserver(function(){applyGeom(measure());paint(cur,false)});
ro.observe(main);
}
window.addEventListener("resize",function(){applyGeom(measure());paint(cur,false)});
}catch(e){}
var cur=0,shown=false;
function paint(idx,withFlag){
var g=geom;
var r=g.rows[idx%g.rows.length];
if(!r)return;
var cx=r.card.x,cy=r.card.y,cw=r.card.w,ch=r.card.h;
marks.style.setProperty("--cx",cx+"px");
marks.style.setProperty("--cy",cy+"px");
marks.style.setProperty("--cw",cw+"px");
marks.style.setProperty("--ch",ch+"px");
marks.style.setProperty("--ft",(r.top-10)+"px");
marks.style.setProperty("--fh",(r.height+20)+"px");
marks.style.setProperty("--rx",r.x+"px");
marks.style.setProperty("--rw",r.width+"px");
if(tagName.textContent!==r.name)tagName.textContent=r.name;
var wtxt=Math.round(r.width)+"px";
if(sizeVal.textContent!==wtxt)sizeVal.textContent=wtxt;
var isLast=(idx%g.rows.length)===g.rows.length-1;
if(isLast){select.setAttribute("data-last","")}else{select.removeAttribute("data-last")}
if(withFlag!==undefined){
if(withFlag){select.setAttribute("data-shown","")}else{select.removeAttribute("data-shown")}
shown=withFlag;
}
}
var timers=[];
function later(fn,ms){var id=window.setTimeout(fn,ms);timers.push(id);return id}
function loop(){
paint(cur,true);
later(function(){select.setAttribute("data-shown","");shown=true},SHOW_AT);
later(function(){select.removeAttribute("data-shown");shown=false},HIDE_AFTER);
later(function(){cur=(cur+1)%geom.rows.length;loop()},NEXT_AFTER);
}
var reduce=false;
try{reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
if(reduce){paint(0,true)}else{shown=false;later(loop,DELAY)}
/* click-to-select (in place only) — clicking Coder rows selects with blue outline */
try{
main.style.cursor="pointer";
main.addEventListener("click",function(e){
var t=e&&e.target?e.target:null;var el=null;
try{if(t&&t.closest){el=t.closest("[data-order]")}}catch(_){}
if(!el&&t){var n=t;while(n&&n!==main){if(n.getAttribute&&n.getAttribute("data-order")!==null){el=n;break}if(n.parentNode)n=n.parentNode;else break}}
if(el){var idx=parseInt(el.getAttribute("data-order"),10);if(!isNaN(idx)){cur=idx;paint(cur,true)}}
});
}catch(e){}
/* theme toggle — in place only, no re-render */
var btn=document.getElementById("themeBtn"),label=document.getElementById("themeLabel");
function syncTheme(){
var t=document.documentElement.getAttribute("data-theme")||"light";
if(label)label.textContent=(t==="dark")?"Dark":"Light";
if(btn){btn.setAttribute("aria-pressed",(t==="dark")?"true":"false");btn.setAttribute("aria-label",(t==="dark")?"Switch to light theme":"Switch to dark theme")}
}
syncTheme();
if(btn){
btn.addEventListener("click",function(){
var cur2=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";
document.documentElement.setAttribute("data-theme",cur2);
try{localStorage.setItem("iac-theme",cur2)}catch(e){}
syncTheme();
});
}
/* test hooks (no DOM rebuild) */
try{
window.__iacTest={rows:rows,geom:function(){return geom},state:function(){return{idx:cur,shown:shown,tag:tagName.textContent,size:sizeVal.textContent}},nodes:{marks:marks,select:select,tag:tagName,size:sizeVal},timings:{hold:HOLD,delay:DELAY,m:M,h:H},paint:paint,remeasure:function(){applyGeom(measure())}};
}catch(e){}
})();
