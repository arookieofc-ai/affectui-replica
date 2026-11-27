
(function(){
"use strict";
var FOCUS_MS=900, CHARGE_MS=620, SWEEP_MS=1100, BASE_W=2400;
var ITEMS=[
  {name:"Okta",mono:true,cls:"ic-okta",glyph:"O"},
  {name:"Snowflake",mono:false,cls:"ic-snow",glyph:"\u2744"},
  {name:"Slack",mono:false,cls:"ic-slack",slack:true},
  {name:"ClickUp",mono:false,cls:"ic-click",glyph:"\u25B2"},
  {name:"Zendesk",mono:true,cls:"ic-zen",glyph:"Z"}
];
var $=function(id){return document.getElementById(id);};
var flow=$("flow"),stage=$("stage"),pillsEl=$("pills"),link=$("link"),
    glowOut=$("glowOut"),glowIn=$("glowIn"),hub=$("hub"),
    sweepN=$("sweepN"),status=$("status"),toggle=$("themeToggle"),
    tLabel=$("themeLabel"),tIcon=$("themeIcon");
var pillNodes=[],i,node,subs,ttls;
for(i=0;i<pillsEl.children.length;i++){pillNodes.push(pillsEl.children[i]);}
var b=0,focused=false,charged=false,hubLit=false,sweeps=0,timers=[];
function later(fn,ms){var id=window.setTimeout(function(){timers.splice(timers.indexOf(id),1);fn();},ms);timers.push(id);return id;}
function pillItem(phase,offset){
  var n=phase, len=ITEMS.length;
  var idx=(((n-1-offset)%len)+len)%len;
  return ITEMS[idx];
}
function setBadge(bdg,item){
  if(item.slack){return;}
  bdg.className="bdg "+item.cls;
  if(bdg.firstChild&&bdg.firstChild.nodeType===3){bdg.firstChild.nodeValue=item.glyph;}
  else if(!bdg.firstChild){bdg.appendChild(document.createTextNode(item.glyph));}
}
function render(){
  var e,k,phase,disp,item;
  for(k=0;k<pillNodes.length;k++){
    e=k;phase=(e+b)%6;
    disp=(phase===0&&focused&&b>0)?6:phase;
    node=pillNodes[k];
    if(node.getAttribute("data-phase")!==String(disp)){node.setAttribute("data-phase",String(disp));}
    item=pillItem(disp,b);
    subs=node.querySelector(".sub"); ttls=node.querySelector(".ttl");
    if(subs&&subs.textContent!==item.name){subs.textContent=item.name;}
    if(ttls&&ttls.textContent!=="API Integration"){ttls.textContent="API Integration";}
    var bdg=node.querySelector(".bdg");
    if(bdg){
      var want="bdg "+item.cls;
      if(item.slack){if(bdg.className!==want){bdg.className=want;}}
      else{setBadge(bdg,item);}
      if(item.mono){node.setAttribute("data-fill","black");}else{node.setAttribute("data-fill","color");}
    }
  }
  if(pillsEl.className!==(""+(charged?"charged":""))){pillsEl.className=charged?"charged":"";}
  if(glowOut.className!==("glow glow-out"+(charged?" on":""))){glowOut.className="glow glow-out"+(charged?" on":"");}
  var hwant="hub"+(hubLit?" lit":"");
  if(hub.className!==hwant){hub.className=hwant;}
  if(glowIn.className!==("glow glow-in"+(hubLit?" on":""))){glowIn.className="glow glow-in"+(hubLit?" on":"");}
  var lwant="link"+(sweeps>0?" sweeping":"");
  if(link.className!==lwant){
    link.className=lwant;
    void link.offsetWidth;
    link.className="link";
    void link.offsetWidth;
    link.className=lwant;
  }
  if(sweepN&&sweepN.textContent!==String(sweeps)){sweepN.textContent=String(sweeps);}
  if(status){
    var h1=hubLit?"charged":"idle", p1=charged?"beaming":"settling";
    var msg="Hub "+h1+" \u00B7 pills "+p1+" \u00B7 sweep "+sweeps;
    if(status.textContent!==msg){
      while(status.firstChild){status.removeChild(status.firstChild);}
      var a=document.createElement("b");a.textContent="Hub";
      status.appendChild(a);status.appendChild(document.createTextNode(" "+h1+" \u00B7 pills "));
      var c=document.createElement("b");c.textContent=p1;status.appendChild(c);
      status.appendChild(document.createTextNode(" \u00B7 sweep "));
      var d=document.createElement("b");d.textContent=String(sweeps);status.appendChild(d);
    }
  }
}
function cycle(){
  charged=true;render();
  later(function(){
    sweeps+=1;charged=false;render();
    later(function(){hubLit=true;render();},Math.round(SWEEP_MS*0.55));
    later(function(){hubLit=false;render();},1250);
    later(function(){
      b+=1;focused=true;render();
      later(function(){focused=false;render();},FOCUS_MS);
      later(cycle,1220);
    },1360);
  },CHARGE_MS);
}
function fit(){
  if(!flow||!stage){return;}
  var w=flow.clientWidth||flow.parentNode.clientWidth||800;
  var sc=w/BASE_W;
  if(sc>1){sc=1;}
  stage.style.transform="scale("+sc+")";
  var h=Math.round(1490*sc);
  flow.style.height=h+"px";
}
var reduce=false;
try{reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){reduce=false;}
render();fit();
if(("ResizeObserver" in window)&&flow){
  try{
    var ro=new ResizeObserver(function(){fit();});
    ro.observe(flow);
  }catch(e){window.addEventListener("resize",fit);}
}else{window.addEventListener("resize",fit);}
if(!reduce){later(cycle,700);}
function syncToggle(){
  var dark=document.documentElement.getAttribute("data-theme")==="dark";
  toggle.setAttribute("aria-pressed",dark?"true":"false");
  if(tLabel&&tLabel.textContent!==(dark?"Light":"Dark")){tLabel.textContent=dark?"Light":"Dark";}
  if(tIcon&&tIcon.textContent!==(dark?"◑":"◐")){tIcon.textContent=dark?"◑":"◐";}
}
syncToggle();
toggle.addEventListener("click",function(){
  var cur=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";
  document.documentElement.setAttribute("data-theme",cur);
  try{localStorage.setItem("integration-flow-theme",cur);}catch(e){}
  syncToggle();
  try{window.__ifTheme=cur;}catch(e){}
});
try{window.__if={render:render,nodes:function(){return pillNodes.slice();},state:function(){return{b:b,focused:focused,charged:charged,hubLit:hubLit,sweeps:sweeps};}};}catch(e){}
})();
