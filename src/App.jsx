import { useState, useRef, useEffect, useCallback, createContext, useContext, Component } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://tfetbksdzbvxnahyxfad.supabase.co";
const SUPABASE_KEY = "sb_publishable_RmrvpSeQPV367nQ5Xefryw_MGLHJqK1";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key:"beverages_alcoholic", name:"Alcohol", icon:"🍺",
    theme:{bg:"#0f1117",header:"linear-gradient(160deg,#1a1f2e,#161b27)",accent:"#f0c040",accentText:"#0f1117",card:"#1a1f2e",border:"#2a3050",sub:"#6b7280",badge:"#252c42",badgeBorder:"#3a4260",badgeText:"#9ba8c0",oosOverlay:"rgba(15,17,23,0.6)"},
    subcategories:[{key:"beer",name:"Beer",icon:"🍺"},{key:"wine",name:"Wine",icon:"🍷"},{key:"spirits",name:"Spirits",icon:"🥃"},{key:"hard_seltzer",name:"Hard Seltzer",icon:"🫧"},{key:"other_alcohol",name:"Other",icon:"🍶"}],
  },
  {
    key:"beverages_na", name:"Beverages", icon:"🥤",
    theme:{bg:"#0a1a0f",header:"linear-gradient(160deg,#0f2a18,#0a1a0f)",accent:"#2ecc71",accentText:"#0a1a0f",card:"#0f2018",border:"#1a4028",sub:"#4a8060",badge:"#0f2820",badgeBorder:"#1a4030",badgeText:"#5a9070",oosOverlay:"rgba(10,26,15,0.6)"},
    subcategories:[{key:"soda",name:"Soda",icon:"🥤"},{key:"water",name:"Water",icon:"💧"},{key:"juice",name:"Juice",icon:"🧃"},{key:"energy_drinks",name:"Energy Drinks",icon:"⚡"},{key:"sports_drinks",name:"Sports Drinks",icon:"🏃"},{key:"coffee_tea",name:"Coffee & Tea",icon:"☕"},{key:"other_drinks",name:"Other",icon:"🫙"}],
  },
  {
    key:"snacks_candy", name:"Snacks & Candy", icon:"🍫",
    theme:{bg:"#1a0a00",header:"linear-gradient(160deg,#2a1400,#1a0a00)",accent:"#ff6b35",accentText:"#fff",card:"#200f00",border:"#3a2010",sub:"#806040",badge:"#281500",badgeBorder:"#3a2010",badgeText:"#906040",oosOverlay:"rgba(26,10,0,0.6)"},
    subcategories:[{key:"chips",name:"Chips & Salty",icon:"🥨"},{key:"candy",name:"Candy",icon:"🍬"},{key:"gum_mints",name:"Gum & Mints",icon:"🌿"},{key:"nuts",name:"Nuts",icon:"🥜"},{key:"other_snacks",name:"Other",icon:"🍪"}],
  },
  {
    key:"grocery", name:"Grocery", icon:"🛒",
    theme:{bg:"#0a0a1a",header:"linear-gradient(160deg,#141428,#0a0a1a)",accent:"#7c83fd",accentText:"#fff",card:"#0f0f22",border:"#1e1e40",sub:"#505080",badge:"#101028",badgeBorder:"#202048",badgeText:"#6060a0",oosOverlay:"rgba(10,10,26,0.6)"},
    subcategories:[{key:"dairy",name:"Dairy",icon:"🥛"},{key:"bread",name:"Bread & Crackers",icon:"🍞"},{key:"pantry",name:"Pantry",icon:"🥫"},{key:"cooking",name:"Cooking",icon:"🧂"},{key:"frozen",name:"Frozen",icon:"🧊"},{key:"other_grocery",name:"Other",icon:"🛒"}],
  },
  {
    key:"tobacco_nicotine", name:"Tobacco", icon:"🚬",
    theme:{bg:"#111008",header:"linear-gradient(160deg,#1e1c0e,#111008)",accent:"#c8a84b",accentText:"#111008",card:"#181608",border:"#302c14",sub:"#706840",badge:"#201e08",badgeBorder:"#302c14",badgeText:"#907840",oosOverlay:"rgba(17,16,8,0.6)"},
    subcategories:[{key:"cigarettes",name:"Cigarettes",icon:"🚬"},{key:"cigars",name:"Cigars",icon:"💨"},{key:"nicotine_pouches",name:"Nicotine Pouches",icon:"🟢"},{key:"dip_snuff",name:"Dip & Snuff",icon:"🥫"},{key:"other_tobacco",name:"Other",icon:"📦"}],
  },
  {
    key:"household", name:"Household", icon:"🏠",
    theme:{bg:"#0a1218",header:"linear-gradient(160deg,#0f1e28,#0a1218)",accent:"#00b4d8",accentText:"#0a1218",card:"#0f1a24",border:"#1a2e3c",sub:"#405870",badge:"#0f2030",badgeBorder:"#1a3040",badgeText:"#506880",oosOverlay:"rgba(10,18,24,0.6)"},
    subcategories:[{key:"cleaning",name:"Cleaning",icon:"🧹"},{key:"paper_goods",name:"Paper Goods",icon:"🧻"},{key:"kitchen_basics",name:"Kitchen",icon:"🍽️"},{key:"personal_care",name:"Personal Care",icon:"🧴"},{key:"other_household",name:"Other",icon:"🏠"}],
  },
  {
    key:"misc", name:"Misc", icon:"📦",
    theme:{bg:"#121212",header:"linear-gradient(160deg,#1c1c1c,#121212)",accent:"#a0a0a0",accentText:"#121212",card:"#1a1a1a",border:"#2e2e2e",sub:"#585858",badge:"#1f1f1f",badgeBorder:"#303030",badgeText:"#686868",oosOverlay:"rgba(18,18,18,0.6)"},
    subcategories:[{key:"misc_other",name:"Other",icon:"📦"}],
  },
  {
    key:"print_cards", name:"Print & Cards", icon:"📰",
    theme:{bg:"#18080a",header:"linear-gradient(160deg,#280e12,#18080a)",accent:"#e84393",accentText:"#fff",card:"#200c10",border:"#381420",sub:"#704050",badge:"#200c10",badgeBorder:"#381420",badgeText:"#904060",oosOverlay:"rgba(24,8,10,0.6)"},
    subcategories:[{key:"newspapers",name:"Newspapers",icon:"📰"},{key:"magazines",name:"Magazines",icon:"📖"},{key:"greeting_cards",name:"Greeting Cards",icon:"💌"},{key:"other_print",name:"Other",icon:"📋"}],
  },
];

const SEVERITY_LEVELS = ["Low","Medium","High","Critical"];
const PACK_SIZES      = ["Single","4 Pack","6 Pack","12 Pack","15 Pack","18 Pack","30 Pack"];
const CONTAINER_TYPES = ["Can","Bottle"];
const WINE_TYPES      = ["Red","White","Rosé","Sparkling","Other"];
const PACK_SUBS       = ["beer","hard_seltzer","soda"];
const WINE_SUBS       = ["wine"];
const AUTO_DEPOSIT    = {"Single":0,"4 Pack":0.20,"6 Pack":0.30,"12 Pack":0.60,"15 Pack":0.75,"18 Pack":0.90,"30 Pack":1.50};
const THEME_KEY       = "proto-theme";
const DEFAULT_HOURS=[
  {days:"Sun",hours:"8 AM – 1 PM"},
  {days:"Mon – Thu",hours:"8 AM – 6:30 PM"},
  {days:"Fri – Sat",hours:"8 AM – 7:30 PM"},
];

function loadTheme(){try{return localStorage.getItem(THEME_KEY)||"dark";}catch{return "dark";}}

function emptyAlcoholForm(sub){
  if(PACK_SUBS.includes(sub)) return {packSize:"6 Pack",containerType:"Can",deposit:"0.30"};
  if(WINE_SUBS.includes(sub)) return {wineType:"Red"};
  return {};
}

// Every category shares the app's surfaces; only its accent color differs (tuned per theme for contrast)
const CAT_ACCENTS={
  beverages_alcoholic:["#f2c14e","#a86f00"], beverages_na:["#4fd18b","#1d8048"], snacks_candy:["#ff8f61","#c24c19"],
  grocery:["#8b91ff","#4f56d6"], tobacco_nicotine:["#d6b56c","#86661a"], household:["#4cc3e0","#0b7790"],
  misc:["#a9aeb6","#5c6169"], print_cards:["#f173ab","#bf2d6c"],
};
const TOKEN_THEME={bg:"var(--bg)",header:"var(--bg)",card:"var(--surface)",border:"var(--border)",sub:"var(--muted)",
  badge:"var(--surface-2)",badgeBorder:"var(--border)",badgeText:"var(--muted)",oosOverlay:"transparent"};
CATEGORIES.forEach(c=>{const [d]=CAT_ACCENTS[c.key]||["#f2c14e"];Object.assign(c.theme,TOKEN_THEME,{accent:d,accentText:"#15161a"});});
CAT_ACCENTS.recommendations=["#f2c14e","#a86f00"];
const RECS_CATEGORY={key:"recommendations",name:"Gillie's Recommendations",icon:"⭐",theme:{...TOKEN_THEME,accent:"#f2c14e",accentText:"#15161a"},subcategories:[]};
function catAccent(key,isDark){const a=CAT_ACCENTS[key]||["#f2c14e","#a86f00"];return isDark?a[0]:a[1];}
function buildThemeVariant(theme,mode,key){
  const a=CAT_ACCENTS[key];
  return {...theme,...(a&&mode==="light"?{accent:a[1],accentText:"#ffffff"}:{})};
}


const DT={appBg:"var(--bg)",headerBg:"var(--bg)",cardBg:"var(--surface)",cardBorder:"var(--border)",accent:"#0ea5c6",accentDim:"#0ea5c622",accentText:"#ffffff",text:"var(--text)",subText:"var(--muted)",inputBg:"var(--surface-2)",inputBorder:"var(--border)",green:"#16a34a",red:"#e5484d"};

// ── CSV helpers ───────────────────────────────────────────────────────────────
function buildCSV(items){
  const h="Name,Category,Subcategory,Pack Size,Container,Wine Type,Price,Deposit,Location,Out of Stock";
  const rows=items.map(i=>[
    `"${(i.name||"").replace(/"/g,'""')}"`,i.category,i.subcategory||"",
    PACK_SUBS.includes(i.subcategory)?(i.packSize||""):"",
    PACK_SUBS.includes(i.subcategory)?(i.containerType||""):"",
    WINE_SUBS.includes(i.subcategory)?(i.wineType||""):"",
    (i.price||0).toFixed(2),(i.deposit||0).toFixed(2),
    `"${(i.location||"").replace(/"/g,'""')}"`,i.outOfStock?"Yes":"No",
  ].join(","));
  return [h,...rows].join("\n");
}

// ── Comet hook ────────────────────────────────────────────────────────────────
function useCometCanvas(btnRef,canvasRef,active){
  useEffect(()=>{
    const btn=btnRef.current,canvas=canvasRef.current;
    if(!btn||!canvas)return;
    const PAD=4,R=9,bw=btn.offsetWidth,bh=btn.offsetHeight;
    canvas.width=bw+PAD*2;canvas.height=bh+PAD*2;
    const pts=[],STEPS=300;
    const sT=bw-2*R,sR=bh-2*R,sB=bw-2*R,sL=bh-2*R,aC=(Math.PI/2)*R,total=sT+aC+sR+aC+sB+aC+sL+aC;
    for(let i=0;i<STEPS;i++){
      let d=(i/STEPS)*total;
      if(d<sT){pts.push([PAD+R+d,PAD]);continue;}d-=sT;
      if(d<aC){const a=-Math.PI/2+(d/aC)*(Math.PI/2);pts.push([PAD+bw-R+Math.cos(a)*R,PAD+R+Math.sin(a)*R]);continue;}d-=aC;
      if(d<sR){pts.push([PAD+bw,PAD+R+d]);continue;}d-=sR;
      if(d<aC){const a=(d/aC)*(Math.PI/2);pts.push([PAD+bw-R+Math.cos(a)*R,PAD+bh-R+Math.sin(a)*R]);continue;}d-=aC;
      if(d<sB){pts.push([PAD+bw-R-d,PAD+bh]);continue;}d-=sB;
      if(d<aC){const a=Math.PI/2+(d/aC)*(Math.PI/2);pts.push([PAD+R+Math.cos(a)*R,PAD+bh-R+Math.sin(a)*R]);continue;}d-=aC;
      if(d<sL){pts.push([PAD,PAD+bh-R-d]);continue;}d-=sL;
      const a=Math.PI+(d/aC)*(Math.PI/2);pts.push([PAD+R+Math.cos(a)*R,PAD+R+Math.sin(a)*R]);
    }
    const RAINBOW=[[255,255,255],[255,0,128],[255,100,0],[255,220,0],[0,210,80],[0,170,255],[140,80,220]];
    function lerp(frac){const idx=frac*(RAINBOW.length-1),lo=Math.floor(idx),hi=Math.min(lo+1,RAINBOW.length-1),t=idx-lo;return RAINBOW[lo].map((v,i)=>Math.round(v+(RAINBOW[hi][i]-v)*t));}
    const N=pts.length,tailLen=Math.floor(0.55*N);
    let t=0,raf;
    function draw(){
      const ctx=canvas.getContext("2d");ctx.clearRect(0,0,canvas.width,canvas.height);
      if(active.current){t=(t+0.004)%1;const head=Math.floor(t*N);
        for(let i=0;i<tailLen;i++){const frac=1-i/tailLen;const[px,py]=pts[(head-i+N)%N];const[r,g,b]=lerp(1-frac);
          ctx.beginPath();ctx.arc(px,py,0.5+frac*1.2,0,Math.PI*2);ctx.fillStyle=`rgba(${r},${g},${b},${Math.pow(frac,1.5)})`;ctx.fill();}}
      raf=requestAnimationFrame(draw);
    }
    draw();return()=>cancelAnimationFrame(raf);
  },[]);
}

function CometButton({onClick,accent,accentText,cancelBg,cancelText,cancelBorder,showCancel}){
  const addBtnRef=useRef(null),addCanvasRef=useRef(null);
  const canBtnRef=useRef(null),canCanvasRef=useRef(null);
  const addActive=useRef(!showCancel),canActive=useRef(showCancel);
  useEffect(()=>{addActive.current=!showCancel;canActive.current=showCancel;},[showCancel]);
  useCometCanvas(addBtnRef,addCanvasRef,addActive);
  useCometCanvas(canBtnRef,canCanvasRef,canActive);

  // Card shuffle: both buttons occupy the same space, one on top of the other.
  // Active button: translateY(0), scale(1), zIndex 2, full opacity
  // Inactive button: translateY(10px), scale(0.92), zIndex 1, low opacity — peeking behind
  const addStyle={
    position:"absolute",top:0,left:0,
    transform:showCancel?"translateY(8px) scale(0.93)":"translateY(0) scale(1)",
    opacity:showCancel?0.45:1,
    zIndex:showCancel?1:2,
    transition:"transform 0.32s var(--ease-out), opacity 0.32s ease",
    pointerEvents:showCancel?"none":"auto",
  };
  const canStyle={
    position:"absolute",top:0,left:0,
    transform:showCancel?"translateY(0) scale(1)":"translateY(-8px) scale(0.93)",
    opacity:showCancel?1:0.45,
    zIndex:showCancel?2:1,
    transition:"transform 0.32s var(--ease-out), opacity 0.32s ease",
    pointerEvents:showCancel?"auto":"none",
  };

  return(
    <div style={{position:"relative",width:100,height:36,flexShrink:0}}>
      {/* Add button — back when form open */}
      <div style={{...addStyle,position:"absolute"}}>
        <div style={{position:"relative",display:"inline-flex"}}>
          <canvas ref={addCanvasRef} style={{position:"absolute",top:-4,left:-4,pointerEvents:"none",zIndex:3}}/>
          <button ref={addBtnRef} onClick={()=>onClick("add")}
            style={{background:accent,color:accentText,border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",height:36,width:100,textAlign:"center"}}>
            + Add
          </button>
        </div>
      </div>
      {/* Cancel button — back when form closed */}
      <div style={{...canStyle,position:"absolute"}}>
        <div style={{position:"relative",display:"inline-flex"}}>
          <canvas ref={canCanvasRef} style={{position:"absolute",top:-4,left:-4,pointerEvents:"none",zIndex:3}}/>
          <button ref={canBtnRef} onClick={()=>onClick("cancel")}
            style={{background:cancelBg,color:cancelText,border:`1px solid ${cancelBorder}`,borderRadius:8,padding:"8px 0",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",height:36,width:100,textAlign:"center"}}>
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LockIcon ──────────────────────────────────────────────────────────────────
function LockIcon({unlocked,size=18}){
  // Shackle moves up and rotates when unlocking
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display:"block",overflow:"visible"}}>
      <style>{`
        @keyframes shackleUnlock{
          0%{transform:rotate(0deg) translateY(0px);}
          40%{transform:rotate(-35deg) translateY(-2px);}
          100%{transform:rotate(-35deg) translateY(-2px);}
        }
        @keyframes shackleLock{
          0%{transform:rotate(-35deg) translateY(-2px);}
          60%{transform:rotate(5deg) translateY(1px);}
          100%{transform:rotate(0deg) translateY(0px);}
        }
        @keyframes bodyPop{
          0%{transform:scale(1);}
          50%{transform:scale(1.12);}
          100%{transform:scale(1);}
        }
        .shackle-unlocked{animation:shackleUnlock 0.38s var(--ease-out) 0.5s forwards;}
        .shackle-locked{animation:shackleLock 0.32s var(--ease-out) 0.5s forwards;}
        .body-pop{animation:bodyPop 0.3s ease 0.6s both;}
      `}</style>
      {/* Lock body */}
      <rect x="3" y="11" width="18" height="12" rx="2.5"
        fill="currentColor" opacity={unlocked?1:0.85}
        className="body-pop" key={String(unlocked)}/>
      {/* Keyhole */}
      <circle cx="12" cy="16.5" r="1.5" fill={unlocked?"rgba(255,255,255,0.6)":"rgba(0,0,0,0.4)"}
        style={{transition:"fill 0.3s ease"}}/>
      <rect x="11.1" y="16.5" width="1.8" height="2.5" rx="0.9"
        fill={unlocked?"rgba(255,255,255,0.6)":"rgba(0,0,0,0.4)"}
        style={{transition:"fill 0.3s ease"}}/>
      {/* Shackle */}
      <g className={unlocked?"shackle-unlocked":"shackle-locked"}
        style={{transformOrigin:"7px 11px"}} key={`shackle-${unlocked}`}>
        <path d="M7 11V8a5 5 0 0 1 10 0v3"
          stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}

// ── Floor plan ────────────────────────────────────────────────────────────────
// ── Line icons (Lucide shapes, ISC license) ───────────────────────────────────
const ICONS={
  back:'<path d="m15 18-6-6 6-6"/>',
  chevronDown:'<path d="m6 9 6 6 6-6"/>',
  chevronRight:'<path d="m9 18 6-6-6-6"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>',
  tag:'<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  cash:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  list:'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  idea:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  bug:'<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
  log:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  terminal:'<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  edit:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  user:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
};
function Icon({name,size=20,stroke=2,style}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink:0,display:"block",...style}}
    dangerouslySetInnerHTML={{__html:ICONS[name]||""}}/>;
}
// Icon tile at the top of empty states and sign-in prompts
const EMPTY_ICON={width:56,height:56,borderRadius:18,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--surface-2)",color:"var(--muted)"};
// Small label on item cards
const TAG={background:"var(--surface-2)",borderRadius:7,padding:"2px 8px",fontSize:12,color:"var(--muted)",fontWeight:500,lineHeight:1.5};
// Secondary action button (card actions, sheet footers)
const ACTION_BTN=(color="var(--text)",bg="var(--surface-2)")=>({display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:44,padding:"10px 8px",
  background:bg,border:"none",borderRadius:12,color,fontSize:13.5,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"});
// Filter / choice chip (filled when selected)
function chipStyle(on,accent="var(--brand)",ink="var(--brand-ink)"){
  return {flexShrink:0,height:34,padding:"0 13px",borderRadius:999,display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",
    fontSize:13.5,fontWeight:on?600:500,cursor:"pointer",border:`1px solid ${on?accent:"var(--border)"}`,
    background:on?accent:"var(--surface)",color:on?ink:"var(--muted)"};
}
// Round icon button used in every header
function IconButton({icon,label,onClick,active=false,size=40,tone}){
  return(
    <button aria-label={label} title={label} onClick={onClick} className="press"
      style={{width:size,height:size,flexShrink:0,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
        background:active?"var(--surface-3)":"var(--surface)",border:"1px solid var(--border)",color:tone||"var(--text)",boxShadow:"var(--shadow)"}}>
      <Icon name={icon} size={18}/>
    </button>
  );
}

// ── Shared page header: store name, page title, one optional action, optional row underneath ──
function PageHeader({title,icon,accent,action,children,sub}){
  return(
    <div style={{position:"sticky",top:0,zIndex:90,background:"var(--glass)",backdropFilter:"saturate(1.4) blur(14px)",WebkitBackdropFilter:"saturate(1.4) blur(14px)",
      borderBottom:"1px solid var(--border)",padding:"14px 16px 12px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,minHeight:40}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
          {icon&&<span style={{width:36,height:36,borderRadius:11,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
            background:accent?`${accent}1f`:"var(--surface-2)",color:accent||"var(--text)"}}>{ICONS[icon]?<Icon name={icon} size={19}/>:<span style={{fontSize:18}}>{icon}</span>}</span>}
          <div style={{minWidth:0}}>
            <div style={{fontSize:21,fontWeight:700,color:"var(--text)",lineHeight:1.15,letterSpacing:"-0.02em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</div>
            {sub&&<div style={{fontSize:12,color:"var(--muted)",marginTop:1}}>{sub}</div>}
          </div>
        </div>
        {action}
      </div>
      {children&&<div style={{marginTop:12}}>{children}</div>}
    </div>
  );
}
function HeaderAction({on,onClick,accent,isDark,ink="#fff",children,offLabel}){
  return(
    <button onClick={onClick} className="press" style={{flexShrink:0,minHeight:40,padding:"8px 15px",display:"flex",alignItems:"center",gap:6,
      background:on?"var(--surface)":accent,border:`1px solid ${on?"var(--border)":accent}`,borderRadius:12,color:on?"var(--muted)":ink,
      fontSize:14,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",boxShadow:on?"none":"var(--shadow)"}}>
      {on?(offLabel||<><Icon name="x" size={16}/>Cancel</>):children}
    </button>
  );
}

// ── Page safety net: a crash on one page shows a message instead of blanking the whole app ──
class PageErrorBoundary extends Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(err){return{err};}
  componentDidCatch(err,info){console.error("Page crashed:",err,info?.componentStack);}
  render(){
    if(!this.state.err)return this.props.children;
    const dark=this.props.isDark!==false;
    return(
      <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:"40px 24px",textAlign:"center",fontFamily:"var(--font)",color:dark?"#f0f0f0":"#1a1a1a"}}>
        <div style={{fontSize:40}}>⚠️</div>
        <div style={{fontSize:18,fontWeight:700}}>Something went wrong on this page</div>
        <div style={{fontSize:13,color:dark?"#7a879e":"#707060",maxWidth:300,lineHeight:1.5}}>The rest of the app still works. Try again, or switch to another tab.</div>
        <button onClick={()=>this.setState({err:null})} style={{marginTop:6,minHeight:44,padding:"10px 22px",background:"var(--brand)",border:"none",borderRadius:10,color:"var(--brand-ink)",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Try again</button>
        <div style={{fontSize:10,color:dark?"#3a4a60":"#a0a090",fontFamily:"var(--mono)",maxWidth:320,wordBreak:"break-word"}}>{String(this.state.err?.message||this.state.err)}</div>
      </div>
    );
  }
}

// ── STORE LAYOUT (paste a Store Builder export over this block) ──────────────
const STORE_SIZE = {"w":40,"d":33};
const FLOOR_ZONES = [
  {key:"back_room",         label:"Back Room",          x:8,   y:8,   w:22,  h:22,  color:"#141a14", tappable:true},
  {key:"counter",           label:"Counter",            x:51,  y:8,   w:18,  h:9,   color:"#2a1e0a", tappable:true},
  {key:"snacks_1",          label:"Snacks 1",           x:70,  y:8,   w:16,  h:8,   color:"#1e2a1e", tappable:true},
  {key:"wine_rack_4",       label:"Wine Rack 4",        x:33,  y:10,  w:5,   h:20,  color:"#1a2a3a", tappable:true},
  {key:"wine_rack_5",       label:"Wine Rack 5",        x:33,  y:8,   w:11,  h:4,   color:"#1a2a3a", tappable:true},
  {key:"wine_rack_6",       label:"Wine Rack 6",        x:39,  y:10,  w:5,   h:20,  color:"#1a2a3a", tappable:true},
  {key:"candy_3",           label:"Candy 3",            x:45,  y:10,  w:6,   h:20,  color:"#2a1a14", tappable:true},
  {key:"wine_rack_1",       label:"Wine Rack 1",        x:18,  y:38,  w:16,  h:8,   color:"#1a2a3a", tappable:true},
  {key:"wine_rack_2",       label:"Wine Rack 2",        x:13,  y:38,  w:4,   h:8,   color:"#1a2a3a", tappable:true},
  {key:"beer_wine_case_5",  label:"Beer/Wine Case 5",   x:13,  y:50,  w:6,   h:5,   color:"#0e2030", tappable:true},
  {key:"beer_case_4",       label:"Beer Case 4",        x:13,  y:56,  w:6,   h:7,   color:"#0e2030", tappable:true},
  {key:"meat_block",        label:"Meat Block (Table)", x:22,  y:52,  w:9,   h:8,   color:"#2a1a0a", tappable:true},
  {key:"wine_rack_3",       label:"Wine Rack 3",        x:33,  y:48,  w:6,   h:22,  color:"#1a2a3a", tappable:true},
  {key:"cigar_case_2",      label:"Cigar Case 2",       x:40,  y:44,  w:8,   h:20,  color:"#2a1a1a", tappable:true},
  {key:"greeting_cards",    label:"Greeting Cards",     x:51,  y:28,  w:6,   h:38,  color:"#1a1e2a", tappable:true},
  {key:"rack_sep_1",        label:"",                   x:58,  y:28,  w:2,   h:38,  color:"#0d0d0d", tappable:false},
  {key:"candy_2",           label:"Candy 2",            x:61,  y:28,  w:6,   h:38,  color:"#2a1a14", tappable:true},
  {key:"rack_sep_2",        label:"",                   x:68,  y:28,  w:2,   h:38,  color:"#0d0d0d", tappable:false},
  {key:"candy_1",           label:"Candy 1",            x:71,  y:28,  w:6,   h:38,  color:"#2a1a14", tappable:true},
  {key:"rack_sep_3",        label:"",                   x:78,  y:28,  w:2,   h:38,  color:"#0d0d0d", tappable:false},
  {key:"grocery_1",         label:"Grocery 1",          x:81,  y:28,  w:6,   h:20,  color:"#1a2a14", tappable:true},
  {key:"grocery_2",         label:"Grocery 2",          x:89,  y:44,  w:7,   h:10,  color:"#1a2a14", tappable:true},
  {key:"newspaper_stand",   label:"Newspaper Stand",    x:51,  y:69,  w:12,  h:8,   color:"#1a1a2a", tappable:true},
  {key:"cooler_3",          label:"Cooler 3",           x:89,  y:8,   w:7,   h:8,   color:"#0e2030", tappable:true},
  {key:"cooler_4",          label:"Cooler 4",           x:89,  y:17,  w:7,   h:8,   color:"#0e2030", tappable:true},
  {key:"cooler_5",          label:"Cooler 5",           x:89,  y:26,  w:7,   h:8,   color:"#0e2030", tappable:true},
  {key:"cooler_6",          label:"Cooler 6",           x:89,  y:35,  w:7,   h:8,   color:"#0e2030", tappable:true},
  {key:"cooler_2",          label:"Cooler 2",           x:89,  y:55,  w:7,   h:9,   color:"#0e2030", tappable:true},
  {key:"cooler_1",          label:"Cooler 1",           x:89,  y:65,  w:7,   h:9,   color:"#0e2030", tappable:true},
  {key:"household",         label:"Household",          x:89,  y:75,  w:7,   h:18,  color:"#1a2a2a", tappable:true},
  {key:"beer_case_3",       label:"Beer Case 3",        x:13,  y:82,  w:6,   h:12,  color:"#0e2030", tappable:true},
  {key:"beer_case_2",       label:"Beer Case 2",        x:20,  y:82,  w:6,   h:12,  color:"#0e2030", tappable:true},
  {key:"beer_case_1",       label:"Beer Case 1",        x:27,  y:82,  w:6,   h:12,  color:"#0e2030", tappable:true},
  {key:"ice_cream_3",       label:"Ice Cream 3",        x:34,  y:82,  w:5,   h:12,  color:"#0e2a3a", tappable:true},
  {key:"ice_cream_2",       label:"Ice Cream 2",        x:40,  y:82,  w:6,   h:12,  color:"#0e2a3a", tappable:true},
  {key:"ice_cream_1",       label:"Ice Cream 1",        x:47,  y:82,  w:9,   h:12,  color:"#0e2a3a", tappable:true},
  {key:"cigar_case_1",      label:"Cigar Case 1",       x:60,  y:79,  w:18,  h:15,  color:"#2a1a1a", tappable:true},
];
const FLOOR_WALLS = [
  {"x1":8,"y1":7,"x2":96,"y2":7},{"x1":96,"y1":7,"x2":96,"y2":96},{"x1":8,"y1":7,"x2":8,"y2":96},
  {"x1":8,"y1":96,"x2":43,"y2":96},{"x1":53,"y1":96,"x2":96,"y2":96},
  {"x1":30,"y1":8,"x2":30,"y2":30},{"x1":8,"y1":30,"x2":30,"y2":30},{"x1":13,"y1":35,"x2":33,"y2":35},
  {"x1":30,"y1":37,"x2":38,"y2":46},{"x1":34,"y1":35,"x2":42,"y2":44}
];
// ── END STORE LAYOUT ─────────────────────────────────────────────────────────
// The live layout comes from Supabase (app_settings.store_layout, saved by the dev Store Builder);
// the constants above are the fallback until it loads.
const DEFAULT_LAYOUT={size:STORE_SIZE,zones:FLOOR_ZONES,walls:FLOOR_WALLS};
const LayoutCtx=createContext(DEFAULT_LAYOUT);
const loadStore3d=()=>import("./store3d.js"); // three.js only downloads when someone opens 3D

function FloorPlan3D({layout,pinZone,onSelectZone,accent,readonly}){
  const ref=useRef(null),viewer=useRef(null),cb=useRef(onSelectZone),pinRef=useRef(pinZone);
  cb.current=onSelectZone;pinRef.current=pinZone;
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    let dead=false;
    loadStore3d().then(m=>{
      if(dead||!ref.current)return;
      viewer.current=m.mountViewer(ref.current,layout,{accent,onSelectZone:readonly?null:k=>cb.current&&cb.current(k)});
      viewer.current.setPin(pinRef.current);
    }).catch(e=>{console.error(e);setFailed(true);});
    return()=>{dead=true;if(viewer.current){viewer.current.dispose();viewer.current=null;}};
  },[layout,readonly,accent]);
  useEffect(()=>{viewer.current&&viewer.current.setPin(pinZone);},[pinZone]);
  return(
    <div ref={ref} style={{width:"100%",aspectRatio:`${layout.size.w} / ${layout.size.d}`,minHeight:240,position:"relative",background:"#06080d"}}>
      {failed&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,255,255,0.45)",textAlign:"center",padding:16}}>The 3D map couldn't load. Switch back to 2D.</div>}
    </div>
  );
}

// Same color treatment as the 3D map (store3d.js brighten), so 2D reads as a top-down view of 3D
// Dates were once saved as "4/16/2026" text; new ones are ISO timestamps. Show both the same way.
function fmtDate(v){
  if(!v)return"";
  const d=new Date(v);
  return isNaN(d)?String(v):d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
}
function guessKind(key){
  if(/back_room/.test(key))return"floor";
  if(/rack_sep|separator/.test(key))return"separator";
  if(/cooler|beer_case|beer_wine/.test(key))return"cooler";
  if(/ice_cream|freezer/.test(key))return"freezer";
  return"shelf";
}
function fixtureColor(hex,kind){
  const toLin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
  const toS=c=>c<=0.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-0.055;
  const n=parseInt((hex||"#1a2a14").slice(1),16);
  let r=toLin((n>>16&255)/255),g=toLin((n>>8&255)/255),b=toLin((n&255)/255);
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;sat=l>0.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
  sat=Math.min(1,sat*1.25+0.05);l=Math.max(l*1.9,kind==="separator"?0.14:0.3);
  const q=l<0.5?l*(1+sat):l+sat-l*sat,p=2*l-q;
  const f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  const hx=v=>Math.round(Math.min(1,Math.max(0,toS(v)))*255).toString(16).padStart(2,"0");
  return "#"+hx(f(h+1/3))+hx(f(h))+hx(f(h-1/3));
}

function FloorPlan({pinZone,onSelectZone,accent,readonly=false}){
  const layout=useContext(LayoutCtx);
  const [hovered,setHovered]=useState(null);
  const [mode,setMode]=useState(()=>{try{return localStorage.getItem("floor-mode")||"2d";}catch{return "2d";}});
  function pickMode(m){setMode(m);try{localStorage.setItem("floor-mode",m);}catch{}}
  const W=540, H=Math.round(540*layout.size.d/layout.size.w);
  function px(x){return x/100*W;}
  function py(y){return y/100*H;}
  function pw(w){return w/100*W;}
  function ph(h){return h/100*H;}
  return(
    <div data-no-swipe style={{position:"relative",width:"100%",borderRadius:10,overflow:"hidden",background:"#080808",border:"1px solid rgba(255,255,255,0.07)"}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:6,right:6,zIndex:3,display:"flex",background:"rgba(8,11,18,0.85)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,overflow:"hidden"}}>
        {["2d","3d"].map(m=>(
          <button key={m} type="button" onClick={()=>pickMode(m)}
            style={{padding:"4px 9px",fontSize:10,fontWeight:700,letterSpacing:"0.06em",border:"none",cursor:"pointer",fontFamily:"inherit",
              background:mode===m?(accent||"#f0c040"):"transparent",color:mode===m?"var(--brand-ink)":"var(--muted)",transition:"background 0.2s"}}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      {mode==="3d"?<FloorPlan3D layout={layout} pinZone={pinZone} onSelectZone={onSelectZone} accent={accent||"#f0c040"} readonly={readonly}/>:
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block",background:"#07090f"}}>
        <defs><style>{`@keyframes floorFlash{0%{opacity:1}40%{opacity:0.35}100%{opacity:1}}`}</style></defs>
        {/* Floor + 1 ft grid — same as the 3D floor */}
        <rect x={0} y={0} width={W} height={H} fill="#2a2e36"/>
        {Array.from({length:Math.floor(layout.size.w)},(_,i)=>i+1).map(i=><line key={"gx"+i} x1={i/layout.size.w*W} y1={0} x2={i/layout.size.w*W} y2={H} stroke="#363b46" strokeWidth={0.5}/>)}
        {Array.from({length:Math.floor(layout.size.d)},(_,i)=>i+1).map(i=><line key={"gy"+i} x1={0} y1={i/layout.size.d*H} x2={W} y2={i/layout.size.d*H} stroke="#363b46" strokeWidth={0.5}/>)}
        {/* Fixtures, flat areas first then shortest → tallest, like looking down on the 3D map */}
        {[...layout.zones].sort((a,b)=>(+a.height||0)-(+b.height||0)).map(zone=>{
          const kind=zone.kind||guessKind(zone.key);
          const x=px(zone.x),y=py(zone.y),w=pw(zone.w),h=ph(zone.h);
          const fill=fixtureColor(zone.color,kind);
          if(!zone.tappable) return <rect key={zone.key} x={x} y={y} width={w} height={h} fill={fill} stroke="rgba(0,0,0,0.45)" strokeWidth={0.8}/>;
          const isPin=pinZone===zone.key;
          const isHov=hovered===zone.key;
          const cx=x+w/2,cy=y+h/2;
          return(
            <g key={zone.key} onClick={()=>!readonly&&onSelectZone&&onSelectZone(zone.key)} onMouseEnter={()=>setHovered(zone.key)} onMouseLeave={()=>setHovered(null)} style={{cursor:readonly?"default":"pointer"}}>
              <rect x={x} y={y} width={w} height={h} fill={fill} fillOpacity={isHov&&!readonly&&!isPin?0.82:1}
                stroke={isPin?accent:"rgba(0,0,0,0.45)"} strokeWidth={isPin?2:0.8}/>
              {isPin&&<rect x={x} y={y} width={w} height={h} fill={accent} fillOpacity={0.28} stroke={accent} strokeWidth={2} style={{animation:"floorFlash 0.35s ease"}} filter={`drop-shadow(0 0 5px ${accent})`}/>}

            </g>
          );
        })}
        {/* Walls — same red and thickness as the 3D walls */}
        {layout.walls.map((wl,i)=>(
          <line key={i} x1={px(wl.x1)} y1={py(wl.y1)} x2={px(wl.x2)} y2={py(wl.y2)} stroke="#b7413a" strokeWidth={Math.max(3,0.45/layout.size.w*W)} strokeLinecap="square" style={{pointerEvents:"none"}}/>
        ))}
        {/* Labels — one readable size, placed biggest-first so they never overlap; the pinned fixture always gets one */}
        {(()=>{
          const placed=[],out=[];
          const cand=layout.zones.filter(z=>z.label&&z.tappable).map(z=>({z,x:px(z.x),y:py(z.y),w:pw(z.w),h:ph(z.h)}))
            .sort((a,b)=>(b.z.key===pinZone)-(a.z.key===pinZone)||(b.w*b.h)-(a.w*a.h));
          for(const c of cand){
            const pin=c.z.key===pinZone,fs=pin?15:12,lw=c.z.label.length*fs*0.56+fs*1.1,lh=fs*1.5;
            const vertical=!pin&&c.h>c.w*1.6&&lw>c.w+4;
            const bw=vertical?lh:lw,bh=vertical?lw:lh;
            const cx=c.x+c.w/2,cy=pin&&c.h<lh*1.2?c.y-lh*0.7:c.y+c.h/2;
            const box={x:Math.max(1,Math.min(W-bw-1,cx-bw/2)),y:Math.max(1,Math.min(H-bh-1,cy-bh/2)),w:bw,h:bh};
            const fitsOwn=pin||(vertical?c.h>=lw*0.85:c.w>=lw*0.85||c.h>=lh*2.2);
            if(!fitsOwn||placed.some(p=>box.x<p.x+p.w&&box.x+box.w>p.x&&box.y<p.y+p.h&&box.y+box.h>p.y))continue;
            placed.push(box);
            const tx=box.x+bw/2,ty=box.y+bh/2;
            out.push(
              <g key={"lbl"+c.z.key} transform={vertical?`rotate(-90 ${tx} ${ty})`:undefined} style={{pointerEvents:"none",userSelect:"none"}}>
                <rect x={tx-lw/2} y={ty-lh/2} width={lw} height={lh} rx={lh/2} fill={pin?accent:"rgba(8,11,18,0.86)"}/>
                <text x={tx} y={ty+fs*0.05} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fontWeight={700}
                  fill={pin?"#141005":"#eef1f6"} fontFamily="Inter,system-ui,sans-serif">{c.z.label}</text>
              </g>
            );
          }
          return out;
        })()}
      </svg>}
    </div>
  );
}

// ── SwipeRow ──────────────────────────────────────────────────────────────────
function SwipeRow({onSwipeLeft,children,accentColor}){
  const startX=useRef(null);
  const [offset,setOffset]=useState(0);
  const TH=72;
  return(
    <div style={{position:"relative",marginBottom:10}}>
      {/* edit hint, only visible while the card is being swiped */}
      <div aria-hidden style={{position:"absolute",right:0,top:0,bottom:0,width:TH,background:accentColor||"var(--brand)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:16,
        opacity:Math.min(1,-offset/TH),transition:offset===0?"opacity .2s var(--ease)":"none"}}>
        <Icon name="edit" size={20}/>
      </div>
      <div style={{position:"relative",transform:`translateX(${offset}px)`,transition:offset===0?"transform .3s var(--ease-out)":"none"}}
        onTouchStart={e=>{startX.current=e.target.closest("[data-no-swipe]")?null:e.touches[0].clientX;}}
        onTouchMove={e=>{if(startX.current===null)return;const dx=e.touches[0].clientX-startX.current;if(dx<0)setOffset(Math.max(dx,-TH));}}
        onTouchEnd={()=>{if(offset<=-TH){setOffset(0);onSwipeLeft();}else setOffset(0);startX.current=null;}}
      >{children}</div>
    </div>
  );
}

// ── ItemCard ──────────────────────────────────────────────────────────────────
function ItemCard({item,T,onDelete,onToggle,onEdit,forceExpand=false,canEdit=false}){
  const layout=useContext(LayoutCtx);
  const [expanded,setExpanded]=useState(forceExpand);
  const [pressed,setPressed]=useState(false);
  const [mapExpanded,setMapExpanded]=useState(false);
  const [mapMini,setMapMini]=useState(true);
  const oos=item.outOfStock;
  const isPackSub=PACK_SUBS.includes(item.subcategory);
  const isWineSub=WINE_SUBS.includes(item.subcategory);
  const todayPrice=priceOn(item), total=todayPrice+(item.deposit||0);
  const hasInventory=item.inventory!=null;
  const isLowStock=hasInventory&&item.inventory>0&&item.inventory<=5;
  const zoneName=layout.zones.find(z=>z.key===item.mapZone)?.label||item.mapZone;
  return(
    <>
    {/* Fullscreen map takeover */}
    {mapExpanded&&(
      <div data-no-swipe style={{
        position:"fixed",inset:0,zIndex:1000,
        background:"#050810",
        display:"flex",flexDirection:"column",
        animation:"fadeIn 0.25s ease",
      }}>
        {/* Top bar */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px 20px",
          background:"linear-gradient(180deg,#0a0e1a,transparent)",
          position:"absolute",top:0,left:0,right:0,zIndex:2,
        }}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:"var(--text)"}}>{item.name}</div>
            <div style={{fontSize:12,color:T.accent,fontWeight:600,marginTop:2}}>📍 {zoneName}</div>
          </div>
          <button
            onClick={()=>setMapExpanded(false)}
            style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--text)",fontSize:18,fontFamily:"inherit"}}>
            ✕
          </button>
        </div>

        {/* Map — centered, fills available space */}
        <div style={{
          flex:1,display:"flex",alignItems:"center",justifyContent:"center",
          padding:"80px 20px 100px",
        }}>
          <div style={{width:"100%",maxWidth:480,animation:"modalIn 0.3s var(--ease-out)"}}>
            <FloorPlan pinZone={item.mapZone} accent={T.accent} readonly={true}/>
          </div>
        </div>

        {/* Bottom zone label */}
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,
          padding:"16px 20px 32px",
          background:"linear-gradient(0deg,#050810 60%,transparent)",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"rgba(255,255,255,0.04)",borderRadius:14,border:`1px solid ${T.accent}28`,backdropFilter:"blur(10px)"}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:T.accent,flexShrink:0,boxShadow:`0 0 10px ${T.accent}`,animation:"pulse 2s infinite"}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:T.accent}}>{zoneName}</div>
              {item.location&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{item.location}</div>}
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",letterSpacing:"0.05em"}}>TAP ✕ TO CLOSE</div>
          </div>
        </div>
      </div>
    )}

    <div
      onClick={()=>setExpanded(e=>!e)}
      onMouseDown={()=>setPressed(true)}
      onMouseUp={()=>setPressed(false)}
      onMouseLeave={()=>setPressed(false)}
      onTouchStart={()=>setPressed(true)}
      onTouchEnd={()=>setPressed(false)}
      style={{
        background:"var(--surface)",border:`1px solid ${oos?"var(--danger-soft)":"var(--border)"}`,borderRadius:16,padding:"14px 15px",
        cursor:"pointer",position:"relative",overflow:"hidden",
        transform:pressed?"scale(0.985)":"scale(1)",
        transition:"transform .18s var(--ease), box-shadow .25s var(--ease), border-color .25s var(--ease)",
        boxShadow:expanded?"var(--shadow-lg)":"var(--shadow)",
      }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,position:"relative",opacity:oos?.62:1,transition:"opacity .25s var(--ease)"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:600,color:"var(--text)",marginBottom:7,lineHeight:1.3,letterSpacing:"-0.01em",textDecoration:oos?"line-through":"none"}}>{item.name}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
            {oos&&<span style={{...TAG,background:"var(--danger-soft)",color:"var(--danger)",fontWeight:600}}>Out of stock</span>}
            {!oos&&isLowStock&&<span style={{...TAG,background:"rgba(230,126,34,.13)",color:"#d9731a",fontWeight:600}}>Low stock</span>}
            {isPackSub&&item.packSize&&<span style={TAG}>{item.packSize}</span>}
            {isPackSub&&item.containerType&&<span style={TAG}>{item.containerType}</span>}
            {isWineSub&&item.wineType&&<span style={TAG}>{item.wineType}</span>}
            {priceSchedule(item).map(x=>{const today=x.days.includes(String(new Date().getDay()));return(
              <span key={x.days} style={{...TAG,...(today?{background:"var(--success-soft)",color:"var(--success)",fontWeight:600}:{}),fontVariantNumeric:"tabular-nums"}}>{daysLabel(x.days)} ${x.price.toFixed(2)}</span>
            );})}
            {hasInventory&&<span style={TAG}>{item.inventory} left</span>}
            {item.gilliesRecommendation&&<span style={{...TAG,background:"var(--brand-soft)",color:"var(--brand)",fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}><Icon name="star" size={12} stroke={2.4}/>Gillie's pick</span>}
            {item.location&&<span style={{fontSize:12.5,color:"var(--muted)",display:"inline-flex",alignItems:"center",gap:3,marginLeft:1}}><Icon name="pin" size={13}/>{item.location}</span>}
            {item.expiryDate&&(()=>{
              const days=Math.ceil((new Date(item.expiryDate)-new Date())/(1000*60*60*24));
              if(days>7)return null;
              const color=days<=0?"#e74c3c":days<=3?"#e74c3c":"#e67e22";
              return <span style={{...TAG,background:`${color}1f`,color,fontWeight:600}}>{days<=0?"⚠️ Expired":`⚠️ Exp. ${days}d`}</span>;
            })()}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:24,fontWeight:700,lineHeight:1.1,color:oos?"var(--muted)":T.accent,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>${todayPrice.toFixed(2)}</div>
          {item.dayPrices?.length>0&&<div style={{fontSize:11,color:"var(--muted)",marginTop:3}}>today</div>}
          {item.deposit>0&&<div style={{fontSize:12.5,fontWeight:600,color:"var(--muted)",marginTop:3,fontVariantNumeric:"tabular-nums"}}>${total.toFixed(2)} w/ dep.</div>}
        </div>
      </div>
      {/* Animated expand section */}
      <div style={{display:"grid",gridTemplateRows:expanded?"1fr":"0fr",transition:"grid-template-rows .32s var(--ease)"}}>
        <div style={{overflow:"hidden"}}>
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)",position:"relative",zIndex:2,opacity:expanded?1:0,transition:"opacity .25s var(--ease)"}} onClick={e=>e.stopPropagation()}>
            {item.deposit>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13,color:"var(--muted)"}}><span>Price ${todayPrice.toFixed(2)} + deposit ${item.deposit.toFixed(2)}</span><span style={{fontWeight:700,color:T.accent}}>${total.toFixed(2)}</span></div>}
            {item.notes&&<div style={{fontSize:13,color:"var(--muted)",marginBottom:10,padding:"9px 11px",background:"var(--surface-2)",borderRadius:10,lineHeight:1.5}}>{item.notes}</div>}
            {item.expiryDate&&(()=>{
              const days=Math.ceil((new Date(item.expiryDate)-new Date())/(1000*60*60*24));
              const color=days<=0?"#e74c3c":days<=3?"#e74c3c":days<=7?"#e67e22":"#27ae60";
              return(
                <div style={{fontSize:13,color,marginBottom:10,padding:"9px 11px",background:`${color}17`,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>{days<=0?"⚠️ Expired":days<=7?"⚠️ Expiring soon":"✓ Next expiry"}</span>
                  <span style={{fontWeight:700}}>{days<=0?"Expired":days===1?"Tomorrow":`${days} days — ${new Date(item.expiryDate+"T12:00").toLocaleDateString("en",{month:"short",day:"numeric"})}`}</span>
                </div>
              );
            })()}
            {/* Map location — starts minimized */}
            {item.mapZone&&(
              <div style={{marginBottom:10}}>
                <button onClick={e=>{e.stopPropagation();setMapMini(m=>!m);}} className="press" style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--surface-2)",border:"none",borderRadius:12,padding:"11px 12px",minHeight:46,cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,color:T.accent}}>
                    <Icon name="pin" size={17}/>
                    <span style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{zoneName}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4,color:"var(--muted)"}}>
                    <span style={{fontSize:13}}>{mapMini?"Show map":"Hide map"}</span>
                    <span style={{transform:mapMini?"rotate(0deg)":"rotate(180deg)",transition:"transform .3s var(--ease)",display:"inline-flex"}}><Icon name="chevronDown" size={16}/></span>
                  </div>
                </button>
                <div style={{display:"grid",gridTemplateRows:mapMini?"0fr":"1fr",transition:"grid-template-rows .32s var(--ease)"}}>
                  <div style={{overflow:"hidden"}}>
                    <div style={{paddingTop:6}}>
                      {/* Only mount the map while it's open — every card used to load its own (40 3D engines per page) */}
                      {expanded&&!mapMini&&!mapExpanded&&<FloorPlan pinZone={item.mapZone} accent={T.accent} readonly={true}/>}
                      <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}>
                        <button onClick={e=>{e.stopPropagation();setMapExpanded(true);}} style={{fontSize:11,color:T.accent,background:"transparent",border:`1px solid ${T.accent}44`,borderRadius:8,padding:"7px 12px",minHeight:34,cursor:"pointer",fontFamily:"inherit",fontWeight:600,letterSpacing:"0.04em"}}>⤢ Full Screen</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {canEdit&&<>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <button onClick={onToggle} className="press" style={ACTION_BTN(oos?"var(--success)":"var(--text)",oos?"var(--success-soft)":undefined)}>
                  <Icon name={oos?"check":"x"} size={16}/>{oos?"In stock":"Out of stock"}
                </button>
                <button onClick={e=>{e.stopPropagation();onEdit(item);}} className="press" style={ACTION_BTN()}><Icon name="edit" size={16}/>Edit</button>
                <button onClick={onDelete} className="press" style={ACTION_BTN("var(--danger)","var(--danger-soft)")}><Icon name="trash" size={16}/>Delete</button>
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ── BugCard ───────────────────────────────────────────────────────────────────
function BugCard({bug,T,canDelete,onDelete}){
  const [expanded,setExpanded]=useState(false);
  const [pressed,setPressed]=useState(false);
  const sColor={Low:"#27ae60",Medium:"#f0c040",High:"#e67e22",Critical:"#e74c3c"}[bug.severity]||"#9ba8c0";
  return(
    <div
      onClick={()=>setExpanded(e=>!e)}
      onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)} onMouseLeave={()=>setPressed(false)}
      onTouchStart={()=>setPressed(true)} onTouchEnd={()=>setPressed(false)}
      style={{background:T.card||DT.cardBg,border:`1px solid ${T.border||DT.cardBorder}`,borderRadius:12,padding:14,marginBottom:10,cursor:"pointer",transform:pressed?"scale(0.985)":"scale(1)",transition:"transform 0.12s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text||DT.text,marginBottom:4}}>{bug.title}</div>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6,background:`${sColor}22`,color:sColor,border:`1px solid ${sColor}44`}}>{bug.severity}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:11,color:T.sub||DT.subText}}>{bug.status}</div>
          <div style={{fontSize:12,color:T.sub||DT.subText,transform:expanded?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s ease"}}>▾</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateRows:expanded?"1fr":"0fr",transition:"grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1)"}}>
        <div style={{overflow:"hidden"}}>
          <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border||DT.cardBorder}`}} onClick={e=>e.stopPropagation()}>
            <p style={{fontSize:13,color:T.text||DT.text,lineHeight:1.6,marginBottom:8}}>{bug.description}</p>
            {bug.created_at&&<div style={{fontSize:11,color:T.sub||DT.subText,marginBottom:canDelete?10:0}}>Reported: {fmtDate(bug.created_at)}</div>}
            {canDelete&&<button onClick={onDelete} className="press" style={{...ACTION_BTN("var(--danger)","var(--danger-soft)"),width:"100%"}}><Icon name="trash" size={16}/>Delete</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ManagerButton ─────────────────────────────────────────────────────────────
function ManagerButton({isManager,isDev,isDark,onSignIn,onSignOut}){
  const [displayLabel,setDisplayLabel]=useState(isDev?"Developer":isManager?"Manager":"sign-out");
  const [textOpacity,setTextOpacity]=useState(1);

  const activeLabel = isDev?"Developer":isManager?"Manager":"sign-out";

  useEffect(()=>{
    setTextOpacity(0);
    const swap=setTimeout(()=>setDisplayLabel(activeLabel),180);
    const fadein=setTimeout(()=>setTextOpacity(1),200);
    return()=>{clearTimeout(swap);clearTimeout(fadein);};
  },[activeLabel]);

  const signedIn = isManager||isDev;
  const bg = isDev
    ? "linear-gradient(135deg,#00c4ef,#0090bb)"
    : isManager
    ? "linear-gradient(135deg,#f0c040,#e0a020)"
    : "var(--surface-2)";
  const shadow = isDev
    ? "0 2px 12px #00d4ff55"
    : isManager
    ? "0 2px 12px #f0c04055"
    : "none";
  const textColor = signedIn ? "#0a0e1a" : "var(--muted)";
  const minW = displayLabel==="sign-out"?140:displayLabel==="Developer"?114:92;

  return(
    <button
      onClick={signedIn?onSignOut:onSignIn}
      style={{
        display:"flex",alignItems:"center",gap:7,
        padding:"7px 13px",
        background:bg,
        border:signedIn?"none":"1px solid var(--border)",
        borderRadius:20,cursor:"pointer",fontFamily:"inherit",
        boxShadow:shadow,color:textColor,
        transition:"background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, min-width 0.35s ease",
        minWidth:minW,flexShrink:0,
      }}>
      <LockIcon unlocked={signedIn} size={16}/>
      <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.04em",whiteSpace:"nowrap",opacity:textOpacity,transition:"opacity 0.18s ease",fontFamily:isDev?"var(--mono)":"inherit"}}>
        {displayLabel==="sign-out"?"Manager Sign in":displayLabel}
      </span>
    </button>
  );
}

// ── HomeGrid ──────────────────────────────────────────────────────────────────
function HomeGrid({items,onSelectCategory,isManager,isDev,isDark,onSignIn,onSignOut,onToggleTheme,hasShownWelcomeRef,bannerOffset=0,onDevUnlock}){
  const tapCountRef=useRef(0);
  const tapTimerRef=useRef(null);
  const [search,setSearch]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [showExport,setShowExport]=useState(false);
  const [showWelcome,setShowWelcome]=useState(false);

  useEffect(()=>{
    if(isDev&&!hasShownWelcomeRef.current.dev){
      hasShownWelcomeRef.current.dev=true;
      const t=setTimeout(()=>{
        setShowWelcome("dev");
        setTimeout(()=>setShowWelcome(false),3000);
      },600);
      return()=>clearTimeout(t);
    }
  },[isDev]);

  useEffect(()=>{
    if(isManager&&!isDev&&!hasShownWelcomeRef.current.manager){
      hasShownWelcomeRef.current.manager=true;
      const t=setTimeout(()=>{
        setShowWelcome("manager");
        setTimeout(()=>setShowWelcome(false),3000);
      },600);
      return()=>clearTimeout(t);
    }
  },[isManager,isDev]);

  function handleSearch(val){
    setSearch(val);
    if(!val.trim()){setSearchResults([]);return;}
    setSearchResults(items.filter(i=>i.name.toLowerCase().includes(val.toLowerCase())).slice(0,10));
  }
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font)",paddingBottom:110,transition:"background 0.4s ease",paddingTop:0,animation:"pageEnter 0.28s var(--ease-out)"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes bannerSlide{from{opacity:0;transform:translateX(-50%) translateY(-100%)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        .cat-card{transition:transform 0.18s ease,box-shadow 0.18s ease;}
        .cat-card:active{transform:scale(0.96)!important;}
        .cat-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.35);}
        .search-result-row{transition:background 0.15s ease;}
        @media (hover:hover){.menu-item:hover{background:var(--surface-2)!important;}}
        .icon-btn{transition:transform 0.15s ease,opacity 0.15s ease;}
        .icon-btn:hover{transform:scale(1.08);}
        .icon-btn:active{transform:scale(0.94);}
        .export-item{transition:background 0.12s ease;}
        .export-item:hover{background:rgba(255,255,255,0.07)!important;}
        .tap-btn{transition:transform 0.1s ease,opacity 0.1s ease;}
        .tap-btn:active{transform:scale(0.94);opacity:0.8;}
        .slide-toggle{transition:background 0.22s ease;}
        @keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes devWelcome{
          0%  {transform:translateX(120%);opacity:0;}
          10% {transform:translateX(0%);opacity:1;}
          75% {transform:translateX(0%);opacity:1;}
          100%{transform:translateX(-120%);opacity:0;}
        }
      `}</style>

      {/* Header */}
      <div style={{padding:"16px 16px 6px",position:"relative",zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div onClick={()=>{
            tapCountRef.current+=1;
            clearTimeout(tapTimerRef.current);
            if(tapCountRef.current>=3){tapCountRef.current=0;onDevUnlock&&onDevUnlock();return;}
            tapTimerRef.current=setTimeout(()=>{tapCountRef.current=0;},600);
          }} style={{display:"flex",alignItems:"center",gap:9,cursor:"default",userSelect:"none",padding:"4px 0"}}>
            <span style={{width:32,height:32,borderRadius:10,background:"var(--brand)",color:"var(--brand-ink)",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="tag" size={17} stroke={2.2}/></span>
            <span style={{fontSize:15,fontWeight:700,color:"var(--text)",letterSpacing:"-0.01em"}}>Gil's Grocery</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}>
            {isManager&&<span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,padding:"6px 10px",borderRadius:999,background:isDev?"var(--info-soft)":"var(--brand-soft)",color:isDev?"var(--info)":"var(--brand)",animation:"popIn .3s var(--ease-out)"}}><Icon name="unlock" size={13}/>{isDev?"Developer":"Manager"}</span>}
            <IconButton icon="more" label="Menu" active={showExport} onClick={e=>{e.stopPropagation();setShowExport(v=>!v);}}/>
            {showExport&&<div onClick={()=>setShowExport(false)} style={{position:"fixed",inset:0,zIndex:250}}/>}
            {showExport&&(()=>{
              const item=(icon,label,onClick,color)=>(
                <button onClick={()=>{setShowExport(false);onClick();}} className="press menu-item"
                  style={{display:"flex",alignItems:"center",gap:11,width:"100%",minHeight:46,padding:"10px 12px",background:"none",border:"none",color:color||"var(--text)",fontSize:15,cursor:"pointer",borderRadius:10,textAlign:"left"}}>
                  <Icon name={icon} size={18}/>{label}
                </button>
              );
              return(
                <div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:48,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:6,zIndex:300,width:230,boxShadow:"var(--shadow-lg)",animation:"popIn .2s var(--ease-out)",transformOrigin:"top right"}}>
                  {item(isDark?"sun":"moon",isDark?"Light mode":"Dark mode",onToggleTheme)}
                  <div style={{height:1,background:"var(--border)",margin:"4px 6px"}}/>
                  {isManager?item("logout","Sign out",onSignOut,"var(--danger)"):item("lock","Manager sign in",onSignIn)}
                </div>
              );
            })()}
          </div>
        </div>
        <div style={{fontSize:30,fontWeight:800,lineHeight:1.1,color:"var(--text)",margin:"18px 0 4px",letterSpacing:"-0.03em"}}>Price Manager</div>
        <div style={{fontSize:13,color:"var(--muted)",height:20,overflow:"hidden",position:"relative"}}>
          <span style={{position:"absolute",left:0,top:0,transition:"opacity .3s var(--ease)",opacity:showWelcome?0:1}}>
            {items.length} items · {CATEGORIES.length} categories
          </span>
          <span style={{
            position:"absolute",left:0,top:0,color:showWelcome==="dev"?"var(--info)":"var(--brand)",fontWeight:600,whiteSpace:"nowrap",
            animation:showWelcome?"devWelcome 2.8s var(--ease) forwards":"none",opacity:showWelcome?1:0,
          }}>
            {showWelcome==="dev"?"Welcome back, Developer.":"Welcome back, Manager."}
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{padding:"14px 16px 6px",position:"relative"}}>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--faint)",pointerEvents:"none"}}><Icon name="search" size={18}/></span>
          <input value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Search every item" aria-label="Search all items" className="field"
            style={{paddingLeft:42,height:48,borderRadius:14,background:"var(--surface)",boxShadow:"var(--shadow)"}}/>
          {search&&<button aria-label="Clear search" onClick={()=>handleSearch("")} className="press" style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:10,border:"none",background:"var(--surface-2)",color:"var(--muted)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Icon name="x" size={16}/></button>}
        </div>
        {searchResults.length>0&&(
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,marginTop:8,overflow:"hidden",boxShadow:"var(--shadow-lg)",animation:"popIn .2s var(--ease-out)",transformOrigin:"top center"}}>
            {searchResults.map((item,idx)=>{
              const cat=CATEGORIES.find(c=>c.key===item.category);
              return(
                <div key={item.id} className="press menu-item" onClick={()=>{onSelectCategory(cat, item.id);setSearch("");setSearchResults([]);}}
                  style={{padding:"11px 14px",borderTop:idx?"1px solid var(--border)":"none",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,animation:`fadeIn .2s var(--ease) ${idx*0.03}s both`,cursor:"pointer"}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                    <div style={{fontSize:12,color:"var(--muted)",marginTop:1}}>{cat?.icon} {cat?.name}</div>
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:cat?catAccent(cat.key,isDark):"var(--brand)",fontVariantNumeric:"tabular-nums"}}>${priceOn(item).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Categories */}
      <div style={{padding:"16px 20px 8px",fontSize:13,fontWeight:600,color:"var(--muted)"}}>Categories</div>
      <div style={{padding:"0 16px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} onClick={()=>setShowExport(false)}>
        {CATEGORIES.map((cat,idx)=>{
          const count=items.filter(i=>i.category===cat.key).length;
          const oos=items.filter(i=>i.category===cat.key&&i.outOfStock).length;
          const a=catAccent(cat.key,isDark);
          return(
            <button key={cat.key} onClick={()=>onSelectCategory(cat)} className="press lift"
              style={{textAlign:"left",background:"var(--surface)",border:"1px solid var(--border)",boxShadow:"var(--shadow)",borderRadius:18,padding:14,cursor:"pointer",
                display:"flex",flexDirection:"column",gap:12,minHeight:118,animation:`fadeUp .4s var(--ease-out) ${idx*0.035}s both`}}>
              <span style={{width:44,height:44,borderRadius:13,background:`${a}1c`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:23}}>{cat.icon}</span>
              <span>
                <span style={{display:"block",fontSize:15,fontWeight:600,color:"var(--text)",letterSpacing:"-0.01em"}}>{cat.name}</span>
                <span style={{display:"block",fontSize:12.5,color:"var(--muted)",marginTop:2}}>{count} item{count!==1?"s":""}{oos>0&&<span style={{color:"var(--danger)"}}> · {oos} out</span>}</span>
              </span>
            </button>
          );
        })}
        {/* Recommendations — double-wide */}
        {(()=>{
          const recCount=items.filter(i=>i.gilliesRecommendation).length;
          return(
            <button onClick={()=>onSelectCategory(RECS_CATEGORY)} className="press lift"
              style={{gridColumn:"1 / -1",textAlign:"left",display:"flex",alignItems:"center",gap:14,background:"var(--surface)",border:"1px solid var(--border)",boxShadow:"var(--shadow)",
                borderRadius:18,padding:14,cursor:"pointer",animation:`fadeUp .4s var(--ease-out) ${CATEGORIES.length*0.035}s both`}}>
              <span style={{width:44,height:44,borderRadius:13,background:"var(--brand-soft)",color:"var(--brand)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="star" size={21}/></span>
              <span style={{flex:1,minWidth:0}}>
                <span style={{display:"block",fontSize:15,fontWeight:600,color:"var(--text)"}}>Gillie's Recommendations</span>
                <span style={{display:"block",fontSize:12.5,color:"var(--muted)",marginTop:2}}>{recCount} item{recCount!==1?"s":""} picked by the owner</span>
              </span>
              <span style={{color:"var(--faint)"}}><Icon name="chevronRight" size={18}/></span>
            </button>
          );
        })()}
      </div>

    </div>
  );
}

// ── CategoryPage ──────────────────────────────────────────────────────────────
function CategoryPage({category,items,setItems,onBack,isManager,isDev,onRequireManager,isDark,onToggleTheme,onAuditLog,scrollToItem,managerDisabled=false,bannerOffset=0}){
  const layout=useContext(LayoutCtx);
  function requireManager(){
    if(!isManager){onRequireManager();return false;}
    if(managerDisabled&&!isDev){onRequireManager();return false;}
    return true;
  }
  // Special recommendations view
  if(category.key==="recommendations"){
    const recItems=items.filter(i=>i.gilliesRecommendation&&!i.outOfStock);
    const bg="var(--bg)";
    const card="var(--surface)";
    const border="var(--border)";
    const text="var(--text)";
    const sub="var(--muted)";
    const accent=isDark?"#f2c14e":"#a86f00";
    return(
      <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:110}}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{background:"var(--bg)",borderBottom:`1px solid ${border}`,padding:"16px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:0}}>
            <button onClick={onBack} style={{background:"var(--brand-soft)",border:`1px solid ${border}`,borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:text,fontFamily:"inherit",flexShrink:0}}>←</button>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:accent}}>⭐ Gillie's Recommendations</div>
              <div style={{fontSize:11,color:sub}}>{recItems.length} item{recItems.length!==1?"s":""} · personally selected by the owner</div>
            </div>
          </div>
        </div>
        <div style={{padding:"14px"}}>
          {recItems.length===0&&(
            <div style={{textAlign:"center",padding:"50px 20px",color:sub}}>
              <div style={{fontSize:40,marginBottom:10}}>⭐</div>
              <div style={{fontSize:16,fontWeight:600,color:text,marginBottom:6}}>No recommendations yet</div>
              <div style={{fontSize:13}}>Toggle "Gillie's Recommendation" on any item to feature it here</div>
            </div>
          )}
          {recItems.map((item,idx)=>{
            const cat=CATEGORIES.find(c=>c.key===item.category);
            const T2=buildThemeVariant(cat?.theme||category.theme,isDark?"dark":"light");
            return(
              <div key={item.id} style={{animation:`fadeUp 0.22s ease ${idx*0.05}s both`,transition:"box-shadow 0.15s ease",cursor:"default"}}>
                <ItemCard item={item} T={T2} onEdit={()=>{}} onDelete={()=>{}} onToggle={()=>{}}/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const baseT=category.theme;
  const T=buildThemeVariant(baseT,isDark?"dark":"light",category.key);
  const isAlcohol=category.key==="beverages_alcoholic";

  const [activeSub,setActiveSub]=useState(null);
  const [search,setSearch]=useState("");
  const [filterPack,setFilterPack]=useState("All");
  const [filterContainer,setFilterContainer]=useState("All");
  const [sortBy,setSortBy]=useState("name");
  const [showForm,setShowForm]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [syncing,setSyncing]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [massSelectMode,setMassSelectMode]=useState(false);
  const [selected,setSelected]=useState(new Set());
  const [mapOpen,setMapOpen]=useState(false);
  const [highlightedItem,setHighlightedItem]=useState(scrollToItem||null);
  const itemRefs=useRef({});

  // Scroll to and open item when arriving from search
  useEffect(()=>{
    if(!scrollToItem)return;
    // Small delay to let items render
    const t=setTimeout(()=>{
      const el=itemRefs.current[scrollToItem];
      if(el){
        el.scrollIntoView({behavior:"smooth",block:"center"});
      }
      // Clear highlight after 2s
      const t2=setTimeout(()=>setHighlightedItem(null),2000);
      return()=>clearTimeout(t2);
    },300);
    return()=>clearTimeout(t);
  },[scrollToItem]);

  const emptyForm={name:"",dayPrices:[],subcategory:category.subcategories[0].key,price:"",location:"",inventory:"",notes:"",outOfStock:false,mapZone:null,expiryDate:"",gilliesRecommendation:false,...emptyAlcoholForm(category.subcategories[0].key)};
  const [form,setForm]=useState(emptyForm);

  function setSubcategory(sub){setForm(f=>({...f,subcategory:sub,...emptyAlcoholForm(sub)}));}

  const filtered=items
    .filter(i=>i.category===category.key)
    .filter(i=>!activeSub||i.subcategory===activeSub)
    .filter(i=>i.name.toLowerCase().includes(search.toLowerCase()))
    .filter(i=>filterPack==="All"||!PACK_SUBS.includes(i.subcategory)||i.packSize===filterPack)
    .filter(i=>filterContainer==="All"||!PACK_SUBS.includes(i.subcategory)||i.containerType===filterContainer)
    .sort((a,b)=>{
      if(sortBy==="type"&&WINE_SUBS.includes(activeSub||"wine")){
        const ta=WINE_TYPES.indexOf(a.wineType||"Other"),tb=WINE_TYPES.indexOf(b.wineType||"Other");
        return ta!==tb?ta-tb:a.name.localeCompare(b.name);
      }
      if(sortBy==="price_desc")return b.price-a.price;
      if(sortBy==="price_asc")return a.price-b.price;
      return a.name.localeCompare(b.name);
    });

  const hasFilters=search||filterPack!=="All"||filterContainer!=="All"||sortBy!=="name";
  function resetFilters(){setSearch("");setFilterPack("All");setFilterContainer("All");setSortBy("name");}

  function openEdit(item){
    if(!requireManager())return;
    setEditItem(item);
    setForm({name:item.name,dayPrices:(item.dayPrices||[]).map(x=>({days:x.days,price:String(x.price)})),subcategory:item.subcategory,price:String(item.price),location:item.location||"",
      packSize:item.packSize||"6 Pack",containerType:item.containerType||"Can",
      deposit:item.deposit!=null?String(item.deposit):"",wineType:item.wineType||"Red",
      inventory:item.inventory!=null?String(item.inventory):"",
      notes:item.notes||"",
      outOfStock:item.outOfStock||false,
      mapZone:item.mapZone||null,
      expiryDate:item.expiryDate||"",
      gilliesRecommendation:item.gilliesRecommendation||false});
    setMapOpen(!!item.mapZone);
    setShowForm(true);
  }

  function handleAddClick(action){
    if(action==="cancel"){setShowForm(false);setEditItem(null);setForm(emptyForm);setMapOpen(false);return;}
    if(!requireManager())return;
    setEditItem(null);setForm(emptyForm);setMapOpen(false);setShowForm(true);
  }

  async function handleSave(){
    if(!form.name.trim()||!form.price)return;
    const dayPricesOut=form.subcategory==="newspapers"
      ?(form.dayPrices||[]).filter(x=>x.days&&x.price!==""&&!isNaN(+x.price)).map(x=>({days:x.days,price:+x.price})):[];
    setSyncing(true);
    const inventoryCount = form.inventory!==""?parseInt(form.inventory):null;
    const autoOos = inventoryCount===0 ? true : form.outOfStock;
    const autoLocation = form.location.trim() || (form.mapZone ? layout.zones.find(z=>z.key===form.mapZone)?.label||"" : "");
    const base={
      name:form.name.trim(), subcategory:form.subcategory, price:parseFloat(form.price),
      location:autoLocation, notes:form.notes||"",
      inventory:inventoryCount, outOfStock:autoOos,
      mapZone:form.mapZone||null,
      expiryDate:form.expiryDate||"",
      gilliesRecommendation:form.gilliesRecommendation||false,
      dayPrices:dayPricesOut,
    };
    const extra=PACK_SUBS.includes(form.subcategory)
      ?{packSize:form.packSize,containerType:form.containerType,deposit:form.deposit?parseFloat(form.deposit):0}
      :WINE_SUBS.includes(form.subcategory)?{wineType:form.wineType}:{};
    // Build Supabase row (snake_case)
    const row={
      name:base.name, category:category.key, subcategory:base.subcategory,
      price:base.price, location:base.location, notes:base.notes,
      inventory:base.inventory, out_of_stock:base.outOfStock,
      map_zone:base.mapZone, expiry_date:base.expiryDate||null,
      gillies_recommendation:base.gilliesRecommendation||false,
      pack_size:extra.packSize||null, container_type:extra.containerType||null,
      deposit:extra.deposit??null, wine_type:extra.wineType||null,
      // only sent when there are day prices (or were), so nothing else depends on the column existing
      ...(dayPricesOut.length||editItem?.dayPrices?.length?{day_prices:dayPricesOut.length?JSON.stringify(dayPricesOut):null}:{}),
    };
    const action=editItem?"edited":"added";
    try{
      if(editItem){
        const {error}=await sb.from("items").update(row).eq("id",editItem.id);
        if(!error)setItems(prev=>prev.map(i=>i.id===editItem.id?{...i,...base,...extra}:i));
      } else {
        const {data,error}=await sb.from("items").insert(row).select().single();
        if(!error&&data)setItems(prev=>[...prev,{id:data.id,category:category.key,...base,...extra}]);
      }
    }catch(e){console.error("Save error:",e);}
    const cat=CATEGORIES.find(c=>c.key===category.key);
    const sub=category.subcategories.find(s=>s.key===base.subcategory);
    onAuditLog&&onAuditLog({
      id:Date.now(), action, itemName:base.name,
      category:cat?.name||category.key, subcategory:sub?.name||base.subcategory,
      price:parseFloat(form.price),
      details:PACK_SUBS.includes(form.subcategory)?`${form.packSize} · ${form.containerType}`:WINE_SUBS.includes(form.subcategory)?form.wineType:"",
      timestamp:new Date(),
      role:isDev?"Developer":"Manager",
      // snapshot for undo: previous item state (for edits) or item id (for adds/deletes)
      snapshot:action==="edited"?editItem:null,
      itemId:action==="edited"?editItem?.id:null,
      categoryKey:category.key,
    });
    setSyncing(false);setEditItem(null);setShowForm(false);setForm(emptyForm);
  }

  // Pack size groups for beer view
  const packGroups=isAlcohol&&activeSub&&PACK_SUBS.includes(activeSub)&&sortBy==="name"
    ? PACK_SIZES.filter(p=>filtered.some(i=>i.packSize===p)) : null;
  // Wine type groups
  const wineGroups=isAlcohol&&activeSub==="wine"&&sortBy==="type"
    ? WINE_TYPES.filter(t=>filtered.some(i=>i.wineType===t)) : null;

  const showPackFilters=isAlcohol&&activeSub&&PACK_SUBS.includes(activeSub);
  const showWineSort=isAlcohol&&activeSub==="wine";

  const inp={};
  const accentColor=T.accent;

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:"var(--text)",fontFamily:"var(--font)",paddingBottom:110,transition:"background 0.4s ease",animation:"pageEnter 0.28s var(--ease-out)"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        .icon-btn{transition:transform 0.15s ease,opacity 0.15s ease;}
        .icon-btn:hover{transform:scale(1.08);}
        .icon-btn:active{transform:scale(0.94);}
        .tap-btn{transition:transform 0.1s ease,opacity 0.12s ease;}
        .tap-btn:active{transform:scale(0.95);opacity:0.8;}
        .item-row{transition:box-shadow 0.15s ease;}
        .item-row:hover{box-shadow:0 4px 18px rgba(0,0,0,0.22);}
        .form-input:focus{outline:none;box-shadow:0 0 0 2px var(--accent-glow,rgba(240,192,64,0.35));border-color:var(--accent-focus,rgba(240,192,64,0.7))!important;transition:box-shadow 0.2s ease,border-color 0.2s ease;}
        @keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>

      {/* Confirm delete modal */}
      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,background:"var(--overlay)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .25s var(--ease)"}}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:24,padding:"26px 24px 22px",width:"100%",maxWidth:320,boxShadow:"var(--shadow-lg)",animation:"modalIn .32s var(--ease-out)"}}>
            <span style={{...EMPTY_ICON,background:"var(--danger-soft)",color:"var(--danger)"}}><Icon name="trash" size={24}/></span>
            <div style={{fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:8,textAlign:"center"}}>
              {confirmDelete.ids?"Delete Items?":"Delete Item?"}
            </div>
            <div style={{fontSize:13,color:baseT.sub,marginBottom:20,textAlign:"center",lineHeight:1.5}}>
              {confirmDelete.ids
                ? <><span style={{color:"#e74c3c",fontWeight:700}}>{confirmDelete.name}</span> will be permanently removed.</>
                : <>"<span style={{color:"var(--text)",fontWeight:600}}>{confirmDelete.name}</span>" will be permanently removed for everyone.</>
              }
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDelete(null)} className="press" style={{...ACTION_BTN("var(--muted)"),flex:1,minHeight:48,fontSize:15}}>Cancel</button>
              <button onClick={async()=>{
                if(confirmDelete.ids){
                  await sb.from("items").delete().in("id",confirmDelete.ids);
                  setItems(prev=>prev.filter(i=>!confirmDelete.ids.includes(i.id)));
                  setSelected(new Set());
                  setMassSelectMode(false);
                } else {
                  await sb.from("items").delete().eq("id",confirmDelete.id);
                  setItems(prev=>prev.filter(i=>i.id!==confirmDelete.id));
                }
                setConfirmDelete(null);
              }} className="press" style={{...ACTION_BTN("#fff","var(--danger)"),flex:2,minHeight:48,fontSize:15,fontWeight:700}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Mass delete confirm modal */}
      {massSelectMode&&(
        <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,zIndex:300,animation:"slideDown 0.2s ease"}}>
          <div style={{background:"#1a0a0a",border:"1px solid #5a2a2a",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
            <div style={{fontSize:13,color:"#e07070",fontWeight:600}}>{selected.size} item{selected.size!==1?"s":""} selected</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setSelected(new Set(filtered.map(i=>i.id)))} style={{padding:"7px 12px",background:"transparent",border:"1px solid #3a2a2a",borderRadius:8,color:"#e07070",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Select All</button>
              <button onClick={()=>setConfirmDelete({id:"__mass__",name:`${selected.size} item${selected.size!==1?"s":""}`,ids:[...selected]})} style={{padding:"7px 14px",background:"#e74c3c",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Header: back, title, sign-in, add — then subcategory chips and search */}
      <div style={{position:"sticky",top:bannerOffset,zIndex:100,background:"var(--glass)",backdropFilter:"saturate(1.4) blur(14px)",WebkitBackdropFilter:"saturate(1.4) blur(14px)",borderBottom:"1px solid var(--border)",padding:"12px 14px 0"}}>
        {managerDisabled&&!isDev&&(
          <div style={{background:"var(--danger-soft)",color:"var(--danger)",borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,animation:"slideDown .25s var(--ease)"}}>
            <Icon name="lock" size={15}/>Manager permissions are temporarily disabled
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <IconButton icon="back" label="Back" onClick={onBack}/>
          <div style={{flex:1,minWidth:0,paddingLeft:2}}>
            <div style={{fontSize:19,fontWeight:700,color:"var(--text)",letterSpacing:"-0.02em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><span style={{marginRight:6}}>{category.icon}</span>{category.name}</div>
            <div style={{fontSize:12.5,color:"var(--muted)"}}>{filtered.length} item{filtered.length!==1?"s":""}{syncing&&<span style={{animation:"pulse 1s infinite"}}> · Saving…</span>}</div>
          </div>
          {isDev&&<IconButton icon={massSelectMode?"x":"trash"} label={massSelectMode?"Stop selecting":"Select items to delete"} active={massSelectMode} tone={massSelectMode?"var(--danger)":undefined}
            onClick={()=>{setMassSelectMode(m=>!m);setSelected(new Set());}}/>}
          <IconButton icon={isManager?"unlock":"lock"} label={isManager?"Signed in":"Manager sign in"} onClick={()=>onRequireManager()} tone={isManager?accentColor:undefined}/>
          <HeaderAction on={showForm} onClick={()=>handleAddClick(showForm?"cancel":undefined)} accent={accentColor} ink={T.accentText}><Icon name="plus" size={17} stroke={2.4}/>Add</HeaderAction>
        </div>

        {/* Subcategory chips */}
        <div className="chip-row" style={{paddingBottom:10,margin:"0 -14px",padding:"0 14px 10px"}}>
          <button onClick={()=>{setActiveSub(null);setFilterPack("All");setFilterContainer("All");}} className="press" style={chipStyle(!activeSub,accentColor,T.accentText)}>All</button>
          {category.subcategories.map(sub=>(
            <button key={sub.key} onClick={()=>{setActiveSub(sub.key===activeSub?null:sub.key);setFilterPack("All");setFilterContainer("All");}} className="press"
              style={chipStyle(activeSub===sub.key,accentColor,T.accentText)}>
              <span>{sub.icon}</span>{sub.name}
            </button>
          ))}
        </div>

        {/* Search + sort (hidden while the form is open) */}
        {!showForm&&(
          <div style={{paddingBottom:12}}>
            <div style={{display:"flex",gap:8}}>
              <div style={{position:"relative",flex:1,minWidth:0}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--faint)",pointerEvents:"none"}}><Icon name="search" size={16}/></span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${category.name.toLowerCase()}`} aria-label="Search this category" className="field" style={{paddingLeft:36,height:42,fontSize:14}}/>
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="Sort" className="field" style={{width:"auto",height:42,fontSize:14,padding:"0 10px",flexShrink:0}}>
                <option value="name">A–Z</option>
                {showWineSort&&<option value="type">By type</option>}
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
            </div>
            {(showPackFilters||hasFilters)&&(
              <div style={{display:"flex",gap:6,marginTop:8}}>
                {showPackFilters&&<>
                  <select value={filterPack} onChange={e=>setFilterPack(e.target.value)} aria-label="Pack size" className="field" style={{flex:1,height:38,fontSize:13,padding:"0 8px"}}>
                    <option value="All">All sizes</option>{PACK_SIZES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={filterContainer} onChange={e=>setFilterContainer(e.target.value)} aria-label="Can or bottle" className="field" style={{flex:1,height:38,fontSize:13,padding:"0 8px"}}>
                    <option value="All">Can & bottle</option>{CONTAINER_TYPES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </>}
                {hasFilters&&<button onClick={resetFilters} className="press" style={{...chipStyle(false),height:38}}><Icon name="x" size={14}/>Reset</button>}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{padding:"14px 14px 20px"}}>
        {/* Add/Edit form */}
        {showForm&&(
          <Sheet onClose={()=>handleAddClick("cancel")} label={editItem?"Edit item":"New item"}><div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:16}}>
              <div style={{fontSize:20,fontWeight:700,color:"var(--text)",letterSpacing:"-0.02em"}}>{editItem?"Edit item":`New ${category.name} item`}</div>
              <IconButton icon="x" label="Close" size={36} onClick={()=>handleAddClick("cancel")}/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Item Name</div>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Bud Light" className="field" style={inp}/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Subcategory</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {category.subcategories.map(sub=>(
                  <button key={sub.key} onClick={()=>setSubcategory(sub.key)} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${form.subcategory===sub.key?accentColor:T.border}`,background:form.subcategory===sub.key?accentColor:"transparent",color:form.subcategory===sub.key?T.accentText:baseT.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    {sub.icon} {sub.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Newspapers: different price on some days */}
            {form.subcategory==="newspapers"&&(()=>{
              const rows=form.dayPrices||[];
              const setRow=(ri,patch)=>setForm(f=>({...f,dayPrices:f.dayPrices.map((r,k)=>k===ri?{...r,...patch}:r)}));
              const label={fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"};
              const usual=[0,1,2,3,4,5,6].filter(d=>!rows.some(r=>r.days.includes(String(d)))).join("");
              return(
                <div style={{marginBottom:10}}>
                  <div style={label}>Different price on some days</div>
                  {rows.map((r,ri)=>(
                    <div key={ri} style={{border:`1px solid ${T.border}`,borderRadius:10,padding:10,marginBottom:8}}>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:4,marginBottom:8}}>
                        {["S","M","T","W","T","F","S"].map((l,d)=>{
                          const on=r.days.includes(String(d)), taken=!on&&rows.some((o,k)=>k!==ri&&o.days.includes(String(d)));
                          return(
                            <button key={d} disabled={taken} aria-pressed={on} aria-label={["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d]}
                              onClick={()=>{const ds=new Set(r.days);on?ds.delete(String(d)):ds.add(String(d));setRow(ri,{days:[...ds].sort().join("")});}}
                              style={{minHeight:40,borderRadius:8,border:`1px solid ${on?accentColor:T.border}`,background:on?accentColor:"transparent",color:on?T.accentText:baseT.sub,opacity:taken?0.3:1,fontSize:13,fontWeight:700,cursor:taken?"default":"pointer",fontFamily:"inherit"}}>{l}</button>
                          );
                        })}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:13,color:baseT.sub,flexShrink:0,minWidth:64}}>{daysLabel(r.days)||"Pick days"}</span>
                        <input type="number" inputMode="decimal" step="0.01" value={r.price} onChange={e=>setRow(ri,{price:e.target.value})} placeholder="Price" className="field" style={{...inp,flex:1}}/>
                        <button aria-label="Remove this day price" onClick={()=>setForm(f=>({...f,dayPrices:f.dayPrices.filter((_,k)=>k!==ri)}))}
                          style={{width:40,height:40,flexShrink:0,background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:"#e74c3c",cursor:"pointer",fontSize:14}}>✕</button>
                      </div>
                    </div>
                  ))}
                  {usual&&<button onClick={()=>setForm(f=>({...f,dayPrices:[...(f.dayPrices||[]),{days:"",price:""}]}))}
                    style={{width:"100%",minHeight:42,background:"transparent",border:`1px dashed ${T.border}`,borderRadius:10,color:baseT.sub,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Add a day with a different price</button>}
                  {rows.some(r=>r.days)&&<div style={{fontSize:11,color:baseT.sub,marginTop:6}}>{usual?`The usual price below is used ${daysLabel(usual)}.`:"Every day has its own price, so the usual price isn't used."}</div>}
                </div>
              );
            })()}
            {/* Pack size */}
            {PACK_SUBS.includes(form.subcategory)&&<>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Pack Size</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {PACK_SIZES.map(p=>(
                    <button key={p} onClick={()=>setForm(f=>({...f,packSize:p,deposit:String(AUTO_DEPOSIT[p]??0)}))} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${form.packSize===p?accentColor:T.border}`,background:form.packSize===p?accentColor:"transparent",color:form.packSize===p?T.accentText:baseT.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:form.packSize===p?700:400}}>{p}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Container</div>
                <div style={{display:"flex",gap:6}}>
                  {CONTAINER_TYPES.map(c=>(
                    <button key={c} onClick={()=>setForm(f=>({...f,containerType:c}))} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${form.containerType===c?accentColor:T.border}`,background:form.containerType===c?accentColor:"transparent",color:form.containerType===c?T.accentText:baseT.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:form.containerType===c?700:400}}>{c==="Can"?"🥫 Can":"🍶 Bottle"}</button>
                  ))}
                </div>
              </div>
            </>}
            {/* Wine type */}
            {WINE_SUBS.includes(form.subcategory)&&(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Wine Type</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {WINE_TYPES.map(w=>(
                    <button key={w} onClick={()=>setForm(f=>({...f,wineType:w}))} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${form.wineType===w?accentColor:T.border}`,background:form.wineType===w?accentColor:"transparent",color:form.wineType===w?T.accentText:baseT.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:form.wineType===w?700:400}}>{w}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8,marginBottom:PACK_SUBS.includes(form.subcategory)?10:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>{form.subcategory==="newspapers"&&form.dayPrices?.length?"Usual price ($)":"Price ($)"}</div>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" className="field" style={inp}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Location Label</div>
                <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Aisle 2" className="field" style={inp}/>
              </div>
            </div>

            {/* Floor plan zone picker — collapsible */}
            <div style={{marginBottom:12}}>
              <button type="button" onClick={()=>setMapOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",padding:"0 0 5px",cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{fontSize:11,color:baseT.sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                  Pin on Floor Map {form.mapZone&&<span style={{color:accentColor}}>· {layout.zones.find(z=>z.key===form.mapZone)?.label}</span>}
                </div>
                <span style={{fontSize:12,color:baseT.sub,transform:mapOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s ease",display:"inline-block"}}>▾</span>
              </button>
              <div style={{display:"grid",gridTemplateRows:mapOpen?"1fr":"0fr",transition:"grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1)"}}>
                <div style={{overflow:"hidden"}}>
                  {mapOpen&&<FloorPlan pinZone={form.mapZone} onSelectZone={z=>{
                    const newZone=form.mapZone===z?null:z;
                    const zoneLabel=newZone?layout.zones.find(fz=>fz.key===newZone)?.label||"":"";
                    setForm(f=>({...f,mapZone:newZone,location:zoneLabel||f.location}));
                  }} accent={accentColor}/>}
                  {form.mapZone&&(
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
                      <span style={{fontSize:11,color:accentColor,fontWeight:600}}>📍 {layout.zones.find(z=>z.key===form.mapZone)?.label}</span>
                      <button onClick={()=>setForm(f=>({...f,mapZone:null}))} style={{fontSize:11,color:baseT.sub,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}>✕ Clear</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {PACK_SUBS.includes(form.subcategory)&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Deposit ($) <span style={{opacity:0.5,fontWeight:400,textTransform:"none",letterSpacing:0}}>— auto-filled, editable</span></div>
                <input type="number" min="0" step="0.01" value={form.deposit||""} onChange={e=>setForm(f=>({...f,deposit:e.target.value}))} placeholder="0.00" className="field" style={inp}/>
              </div>
            )}

            {/* Inventory count */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                Inventory Count <span style={{opacity:0.5,fontWeight:400,textTransform:"none",letterSpacing:0}}>— optional · 0 = out of stock</span>
              </div>
              <input type="number" min="0" step="1" value={form.inventory}
                onChange={e=>{
                  const val=e.target.value;
                  setForm(f=>({...f,inventory:val,outOfStock:val!==""&&parseInt(val)===0?true:f.outOfStock}));
                }}
                placeholder="e.g. 24" className="field" style={inp}/>
            </div>

            {/* Out of stock toggle */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"11px 14px",background:isDark?baseT.bg:"#f8f8f0",border:`1px solid ${form.outOfStock?"#e74c3c44":T.border}`,borderRadius:10,transition:"border-color 0.25s ease"}}>
              <div>
                <div style={{fontSize:14,color:"var(--text)"}}>Out of Stock</div>
                {form.inventory!==""&&parseInt(form.inventory)===0&&<div style={{fontSize:11,color:"#e74c3c",marginTop:2}}>Auto-set because inventory is 0</div>}
              </div>
              <button onClick={()=>setForm(f=>({...f,outOfStock:!f.outOfStock}))}
                style={{width:48,height:26,borderRadius:13,border:"none",cursor:"pointer",background:form.outOfStock?"#e74c3c":T.badge,position:"relative",transition:"background 0.22s var(--ease-out)",flexShrink:0}}>
                <div style={{width:20,height:20,borderRadius:10,background:"#fff",position:"absolute",top:3,left:form.outOfStock?25:3,transition:"left 0.28s var(--ease-out)",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
              </button>
            </div>

            {/* Gillie's Recommendation toggle */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,padding:"11px 14px",background:isDark?baseT.bg:"#f8f8f0",border:`1px solid ${form.gilliesRecommendation?"#f0c04044":T.border}`,borderRadius:10,transition:"border-color 0.25s ease"}}>
              <div>
                <div style={{fontSize:14,color:"var(--text)"}}>⭐ Gillie's Recommendation</div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Highlighted in the recommendations section</div>
              </div>
              <button onClick={()=>setForm(f=>({...f,gilliesRecommendation:!f.gilliesRecommendation}))}
                style={{width:48,height:26,borderRadius:13,border:"none",cursor:"pointer",background:form.gilliesRecommendation?"#f0c040":T.badge,position:"relative",transition:"background 0.22s var(--ease-out)",flexShrink:0}}>
                <div style={{width:20,height:20,borderRadius:10,background:"#fff",position:"absolute",top:3,left:form.gilliesRecommendation?25:3,transition:"left 0.28s var(--ease-out)",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
              </button>
            </div>

            {/* Notes */}
            <div style={{marginBottom:category.key==="grocery"?10:14}}>
              <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Notes <span style={{opacity:0.5,fontWeight:400,textTransform:"none",letterSpacing:0}}>— optional</span></div>
              <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="e.g. Price change coming, check with supplier…" className="field" style={{...inp,minHeight:70,resize:"none",lineHeight:1.5}}/>
            </div>

            {/* Next Expiration Date — grocery only */}
            {category.key==="grocery"&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:baseT.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                  Next Expiration Date <span style={{opacity:0.5,fontWeight:400,textTransform:"none",letterSpacing:0}}>— optional</span>
                </div>
                <input type="date" value={form.expiryDate} onChange={e=>setForm(f=>({...f,expiryDate:e.target.value}))} className="field" style={{...inp,colorScheme:isDark?"dark":"light"}}/>
                {form.expiryDate&&(()=>{
                  const days=Math.ceil((new Date(form.expiryDate)-new Date())/(1000*60*60*24));
                  const color=days<=3?"#e74c3c":days<=7?"#e67e22":"#27ae60";
                  return <div style={{fontSize:11,color,marginTop:4,fontWeight:600}}>{days<=0?"⚠️ Expired":days===1?"⚠️ Expires tomorrow":`✓ Expires in ${days} day${days!==1?"s":""}`}</div>;
                })()}
              </div>
            )}

            <button onClick={handleSave} disabled={syncing} className="tap-btn" style={{width:"100%",padding:"12px",background:accentColor,border:"none",borderRadius:10,color:T.accentText,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:syncing?0.7:1}}>
              {syncing?"Saving…":editItem?"Save Changes":"Add Item"}
            </button>
          </div></Sheet>
        )}

        {filtered.length===0&&!showForm&&(
          <div style={{textAlign:"center",color:baseT.sub,padding:"50px 20px"}}>
            <span style={EMPTY_ICON}><span style={{fontSize:26}}>{category.icon}</span></span>
            <div style={{fontSize:15}}>No items{hasFilters?" matching filters":""}.{hasFilters&&<span style={{display:"block",fontSize:12,marginTop:4,opacity:0.7}}>Try resetting filters.</span>}</div>
          </div>
        )}

        {/* Render with grouping — hidden while form is open */}
        {!showForm&&(()=>{
          function renderItem(item,idx){
            const isChecked=selected.has(item.id);
            const isHighlighted=highlightedItem===item.id;
            const toggle=()=>{
              setSelected(prev=>{
                const n=new Set(prev);
                n.has(item.id)?n.delete(item.id):n.add(item.id);
                return n;
              });
            };
            if(massSelectMode){
              return(
                <div key={item.id} onClick={toggle} style={{animation:`fadeUp 0.22s ease ${idx*0.05}s both`,display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"pointer"}}>
                  <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${isChecked?accentColor:T.border}`,background:isChecked?accentColor:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s ease"}}>
                    {isChecked&&<span style={{color:T.accentText,fontSize:13,fontWeight:700,lineHeight:1}}>✓</span>}
                  </div>
                  <div style={{flex:1,opacity:isChecked?1:0.6,transition:"opacity 0.15s",pointerEvents:"none"}}>
                    <ItemCard item={item} T={T} onEdit={()=>{}} onDelete={()=>{}} onToggle={()=>{}}/>
                  </div>
                </div>
              );
            }
            return(
              <div key={item.id} ref={el=>itemRefs.current[item.id]=el}
                className="item-row"
                style={{borderRadius:14,
                  animation:`fadeUp 0.22s ease ${idx*0.05}s both`,
                  borderRadius:14,
                  boxShadow:isHighlighted?`0 0 0 2px ${accentColor}, 0 0 20px ${accentColor}55`:"none",
                  transition:"box-shadow 0.4s ease",
                }}>
                <SwipeRow onSwipeLeft={()=>openEdit(item)} accentColor={accentColor}>
                  <ItemCard item={item} T={T} canEdit={isManager} onEdit={()=>openEdit(item)}
                    forceExpand={isHighlighted}
                    onDelete={()=>{if(!requireManager())return;setConfirmDelete({id:item.id,name:item.name});}}
                    onToggle={()=>{if(!requireManager())return;const newOos=!item.outOfStock;sb.from('items').update({out_of_stock:newOos}).eq('id',item.id);setItems(prev=>prev.map(i=>i.id===item.id?{...i,outOfStock:newOos}:i));}}/>
                </SwipeRow>
              </div>
            );
          }
          return packGroups ? packGroups.map(pack=>(
            <div key={pack} style={{animation:"fadeUp 0.25s ease both"}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:accentColor,margin:"18px 0 8px",opacity:0.8}}>{pack}</div>
              {filtered.filter(i=>i.packSize===pack).map((item,idx)=>renderItem(item,idx))}
            </div>
          )) : wineGroups ? wineGroups.map(type=>(
            <div key={type} style={{animation:"fadeUp 0.25s ease both"}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:accentColor,margin:"18px 0 8px",opacity:0.8}}>🍷 {type}</div>
              {filtered.filter(i=>i.wineType===type).map((item,idx)=>renderItem(item,idx))}
            </div>
          )) : !activeSub ? category.subcategories.map(sub=>{
            const subItems=filtered.filter(i=>i.subcategory===sub.key);
            if(!subItems.length)return null;
            return(
              <div key={sub.key}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--muted)",margin:"20px 4px 10px",display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>{sub.icon}</span>{sub.name}</div>
                {subItems.map((item,idx)=>renderItem(item,idx))}
              </div>
            );
          }) : filtered.map((item,idx)=>renderItem(item,idx));
        })()}
      </div>
    </div>
  );
}

// ── BugsPage ──────────────────────────────────────────────────────────────────
function BugsPage({T,isManager,onRequireManager,managerDisabled=false}){
  const [knownBugs,setKnownBugs]=useState([]);
  const [reports,setReports]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",description:"",severity:"Medium"});
  const inp={};
  useEffect(()=>{
    sb.from("known_bugs").select("*").order("id",{ascending:false}).then(({data})=>{if(data)setKnownBugs(data);});
  },[]);
  return(
    <div style={{fontFamily:"var(--font)"}}>
    <PageHeader title="Bug Reports" icon="bug" accent={T.accent}/>
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:4}}>Known bugs</div>
      <div style={{fontSize:12,color:T.sub||T.subText,marginBottom:16}}>Issues the team is aware of</div>
      {knownBugs.length===0&&<div style={{textAlign:"center",padding:"24px",background:T.card||T.cardBg,borderRadius:12,border:`1px solid ${T.border||T.cardBorder}`,marginBottom:20}}><span style={{...EMPTY_ICON,background:"var(--success-soft)",color:"var(--success)",width:48,height:48,borderRadius:15,marginBottom:10}}><Icon name="check" size={22}/></span><div style={{fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:2}}>No known bugs!</div><div style={{fontSize:12,color:T.sub||T.subText}}>Found something? Report it below.</div></div>}
      {knownBugs.map(bug=><BugCard key={bug.id} bug={bug} T={{card:T.card||T.cardBg,border:T.border||T.cardBorder,text:"var(--text)",sub:T.sub||T.subText}} canDelete={false}/>)}
      <div style={{height:1,background:T.border||T.cardBorder,margin:"24px 0"}}/>
      <div style={{fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:4}}>Report a bug</div>
      <div style={{fontSize:12,color:T.sub||T.subText,marginBottom:16}}>Requires manager PIN</div>
      {!showForm?(
        <button onClick={()=>{if(!isManager||managerDisabled){onRequireManager();return;}setShowForm(true);}} style={{width:"100%",minHeight:48,padding:"13px",background:T.accent,border:"none",borderRadius:10,color:T.accentText,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Submit Bug Report</button>
      ):(
        <div style={{background:T.card||T.cardBg,border:`1px solid ${T.border||T.cardBorder}`,borderRadius:14,padding:18}}>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:T.sub||T.subText,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Title</div><input className="field" style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Short description"/></div>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:T.sub||T.subText,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Description</div><textarea className="field" style={{...inp,minHeight:80,resize:"none",lineHeight:1.5}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What happened?"/></div>
          <div style={{marginBottom:14}}><div style={{fontSize:11,color:T.sub||T.subText,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Severity</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SEVERITY_LEVELS.map(s=>{const c={Low:"#27ae60",Medium:"#f0c040",High:"#e67e22",Critical:"#e74c3c"}[s];return <button key={s} onClick={()=>setForm(f=>({...f,severity:s}))} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${form.severity===s?c:T.border||T.cardBorder}`,background:form.severity===s?`${c}22`:"transparent",color:form.severity===s?c:T.sub||T.subText,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:form.severity===s?700:400}}>{s}</button>;})}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowForm(false)} style={{flex:1,padding:12,background:"transparent",border:`1px solid ${T.border||T.cardBorder}`,borderRadius:10,color:T.sub||T.subText,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={async()=>{if(!form.title||!form.description)return;await sb.from("bug_reports").insert({title:form.title,description:form.description,severity:form.severity,status:"Open",created_at:new Date().toISOString()});setForm({title:"",description:"",severity:"Medium"});setShowForm(false);alert("Bug report submitted!");}} style={{flex:2,padding:12,background:T.accent,border:"none",borderRadius:10,color:T.accentText,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Submit</button>
          </div>
        </div>
      )}
      {reports.length>0&&<><div style={{height:1,background:T.border||T.cardBorder,margin:"24px 0"}}/><div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:12}}>Reports ({reports.length})</div>{reports.map(r=><BugCard key={r.id} bug={r} T={{card:T.card||T.cardBg,border:T.border||T.cardBorder,text:"var(--text)",sub:T.sub||T.subText}} canDelete={false}/>)}</>}
    </div>
    </div>
  );
}

// ── Dev console: item data export / import ────────────────────────────────────
function DevDataTools({items,setItems}){
  const [view,setView]=useState(null); // null | "show" | "paste"
  const [pasteText,setPasteText]=useState("");
  const fileRef=useRef(null);
  function downloadCSV(){
    const url=URL.createObjectURL(new Blob([buildCSV(items)],{type:"text/csv"}));
    const a=document.createElement("a");a.href=url;a.download="all-pricing.csv";a.click();
    URL.revokeObjectURL(url);
  }
  function handleImport(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>alert(`Import preview: ${ev.target.result.split("\n").length-1} rows found. (Full import not wired yet.)`);
    reader.readAsText(file);e.target.value="";
  }
  const btn={minHeight:44,padding:"10px",background:`${DT.accent}15`,border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:12,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em"};
  const area={width:"100%",minHeight:180,background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:10,color:DT.text,fontSize:11,fontFamily:"var(--mono)",resize:"vertical",marginTop:10};
  return(
    <>
      <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// data.items</div>
      <div style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:24}}>
        <div style={{fontSize:14,fontWeight:700,color:DT.text,marginBottom:4}}>Item Data</div>
        <div style={{fontSize:11,color:DT.subText,marginBottom:12,letterSpacing:"0.04em"}}>// {items.length} items · export or import</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <button onClick={downloadCSV} style={btn}>EXPORT_CSV ↓</button>
          <button onClick={()=>setView(v=>v==="show"?null:"show")} style={btn}>{view==="show"?"✕ HIDE_JSON":"SHOW_JSON"}</button>
          <button onClick={()=>fileRef.current?.click()} style={btn}>IMPORT_CSV ↑</button>
          <button onClick={()=>setView(v=>v==="paste"?null:"paste")} style={btn}>{view==="paste"?"✕ CANCEL":"PASTE_JSON"}</button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleImport}/>
        {view==="show"&&<>
          <textarea readOnly value={JSON.stringify(items,null,2)} style={area} onFocus={e=>e.target.select()}/>
          <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(items)).catch(()=>{})} style={{...btn,width:"100%",marginTop:8}}>COPY →</button>
        </>}
        {view==="paste"&&<>
          <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder="// paste JSON array here" style={area}/>
          <button onClick={()=>{try{const p=JSON.parse(pasteText);if(!Array.isArray(p))throw 0;setItems(p);setView(null);setPasteText("");}catch{alert("Invalid JSON (expected an array)");}}} style={{...btn,width:"100%",marginTop:8}}>LOAD →</button>
        </>}
      </div>
    </>
  );
}

// ── Dev console: quick-time shift presets ─────────────────────────────────────
function DevShiftPresets({list,onChange,storeHours}){
  const set=(i,k,v)=>onChange(list.map((p,j)=>j===i?{...p,[k]:v}:p));
  const auto=shiftPresets(storeHoursFor(storeHours,1)); // Monday's hours as the starting point
  const field={background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"8px",color:DT.text,fontSize:12,fontFamily:"var(--mono)",minWidth:0,colorScheme:"dark"};
  const btn={width:"100%",minHeight:40,padding:"8px",background:"transparent",border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:11,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em"};
  return(
    <>
      <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// config.shiftPresets</div>
      <div style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:24}}>
        <div style={{fontSize:14,fontWeight:700,color:DT.text,marginBottom:4}}>Quick-Time Shifts</div>
        {list.length===0?(<>
          <div style={{fontSize:11,color:DT.subText,marginBottom:12,lineHeight:1.6,letterSpacing:"0.04em"}}>
            // automatic: follows each day's store hours<br/>
            {auto.map(p=><span key={p.label}>// {p.label}: {fmtMin(p.start)} – {fmtMin(p.end)} (Mon)<br/></span>)}
          </div>
          <button onClick={()=>onChange(auto.map(p=>({label:p.label,start:minToTime(p.start),end:minToTime(p.end)})))} style={btn}>CUSTOMIZE →</button>
        </>):(<>
          <div style={{fontSize:11,color:DT.subText,marginBottom:12,letterSpacing:"0.04em"}}>// {list.length} custom · shown as buttons when adding a shift</div>
          {list.map((p,i)=>(
            <div key={i} style={{border:`1px solid ${DT.cardBorder}`,borderRadius:8,padding:10,marginBottom:8,display:"grid",gap:8}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input value={p.label} onChange={e=>set(i,"label",e.target.value)} placeholder="Name, e.g. Opening" style={{...field,flex:1}}/>
                <button aria-label={`Delete ${p.label||"preset"}`} onClick={()=>onChange(list.filter((_,j)=>j!==i))}
                  style={{width:36,height:36,flexShrink:0,background:"none",border:`1px solid ${DT.cardBorder}`,borderRadius:6,color:DT.red,cursor:"pointer",fontSize:14}}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,alignItems:"center"}}>
                <input type="time" value={p.start} onChange={e=>set(i,"start",e.target.value)} style={field}/>
                <span style={{color:DT.subText,fontSize:12}}>to</span>
                <input type="time" value={p.end} onChange={e=>set(i,"end",e.target.value)} style={field}/>
              </div>
              {p.start&&p.end&&<div style={{fontSize:10,color:DT.subText,letterSpacing:"0.04em"}}>// {+parseHours(p.start,p.end).toFixed(2)}h{toMin(p.end)<=toMin(p.start)?" · ends next day":""}</div>}
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <button onClick={()=>onChange([...list,{label:"",start:"09:00",end:"17:00"}])} style={btn}>+ ADD_PRESET</button>
            <button onClick={()=>onChange([])} style={{...btn,color:DT.subText,borderColor:DT.cardBorder}}>RESET_TO_AUTO</button>
          </div>
        </>)}
      </div>
    </>
  );
}

// ── Dev console: combine old "Paper (Sunday)" / "Paper (Monday-Saturday)" pairs ──
function DevNewspaperMerge({items,setItems}){
  const plan=newspaperMergePlan(items);
  const [state,setState]=useState(null); // null | "ask" | "busy" | message
  if(!plan.length&&!(typeof state==="string"&&state.startsWith("✓")))return null;
  async function run(){
    setState("busy");
    try{
      for(const g of plan){
        const {error}=await sb.from("items").update({name:g.name,day_prices:JSON.stringify(g.dayPrices)}).eq("id",g.keep.id);
        if(error)throw error;
        for(const r of g.remove){const {error:e2}=await sb.from("items").delete().eq("id",r.id);if(e2)throw e2;}
      }
      const gone=new Set(plan.flatMap(g=>g.remove.map(r=>r.id)));
      setItems(prev=>prev.filter(i=>!gone.has(i.id)).map(i=>{const g=plan.find(x=>x.keep.id===i.id);return g?{...i,name:g.name,dayPrices:g.dayPrices}:i;}));
      setState(`✓ Combined ${plan.length} paper${plan.length!==1?"s":""}`);
    }catch(e){
      setState(/day_prices/.test(e?.message||"")?"✕ Run the SQL first: alter table items add column if not exists day_prices text;":`✕ ${e?.message||"Something went wrong"}`);
    }
  }
  const btn={width:"100%",minHeight:44,padding:"10px",background:`${DT.accent}15`,border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:12,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em"};
  return(
    <>
      <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// data.newspapers</div>
      <div style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:24}}>
        <div style={{fontSize:14,fontWeight:700,color:DT.text,marginBottom:4}}>Combine Newspaper Prices</div>
        <div style={{fontSize:11,color:DT.subText,marginBottom:12,letterSpacing:"0.04em",lineHeight:1.6}}>// one item per paper, with its price for each day</div>
        {plan.map(g=>(
          <div key={g.keep.id} style={{fontSize:12,color:DT.text,padding:"6px 0",borderTop:`1px solid ${DT.cardBorder}`}}>
            <b>{g.name}</b>
            <div style={{color:DT.subText,fontSize:11}}>{priceSchedule({price:+g.keep.price,dayPrices:g.dayPrices}).map(x=>`${daysLabel(x.days)} $${x.price.toFixed(2)}`).join(" · ")} — merges {g.remove.length+1} items</div>
          </div>
        ))}
        <div style={{marginTop:12}}>
          {state===null&&plan.length>0&&<button onClick={()=>setState("ask")} style={btn}>COMBINE →</button>}
          {state==="ask"&&<div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:8}}>
            <button onClick={()=>setState(null)} style={{...btn,color:DT.subText,borderColor:DT.cardBorder}}>CANCEL</button>
            <button onClick={run} style={{...btn,background:DT.accent,color:"#000",fontWeight:700}}>CONFIRM: DELETE {plan.reduce((a,g)=>a+g.remove.length,0)} DUPLICATES</button>
          </div>}
          {state==="busy"&&<div style={{fontSize:12,color:DT.subText}}>// combining…</div>}
          {typeof state==="string"&&/^[✓✕]/.test(state)&&<div style={{fontSize:12,color:state[0]==="✓"?DT.accent:DT.red,lineHeight:1.5}}>{state}</div>}
        </div>
      </div>
    </>
  );
}

// ── DevPage ───────────────────────────────────────────────────────────────────
// ── Notification Banner ───────────────────────────────────────────────────────
const NOTIF_COLORS={
  blue:  {label:"Blue",   bg:"#0d2540",border:"#2a6aaa",text:"#7ab8f5",dot:"#4a9af0",   bubble:"#4a9af0"},
  green: {label:"Green",  bg:"#0a2a0a",border:"#1a6a1a",text:"#4aaa4a",dot:"#27ae60",   bubble:"#27ae60"},
  yellow:{label:"Yellow", bg:"#2a2200",border:"#6a5500",text:"#f0c040",dot:"#f0c040",   bubble:"#f0c040"},
  red:   {label:"Red",    bg:"#2a0a0a",border:"#6a1a1a",text:"#e07070",dot:"#e74c3c",   bubble:"#e74c3c"},
  purple:{label:"Purple", bg:"#1a0a2a",border:"#4a1a6a",text:"#b070f0",dot:"#9b59b6",   bubble:"#9b59b6"},
  orange:{label:"Orange", bg:"#2a1400",border:"#6a3000",text:"#e09040",dot:"#e67e22",   bubble:"#e67e22"},
  teal:  {label:"Teal",   bg:"#0a2424",border:"#1a6060",text:"#40c0c0",dot:"#00b4d8",   bubble:"#00b4d8"},
  pink:  {label:"Pink",   bg:"#2a0a1a",border:"#6a1a4a",text:"#f070b0",dot:"#e84393",   bubble:"#e84393"},
};

function NotifBanner({notif,onExpire}){
  const col=NOTIF_COLORS[notif.color]||NOTIF_COLORS.blue;
  const expiresAt=notif.expiresAt?new Date(notif.expiresAt):null;
  const calcLeft=()=>expiresAt?Math.max(0,Math.floor((expiresAt-new Date())/1000)):null;
  const [timeLeft,setTimeLeft]=useState(calcLeft);

  useEffect(()=>{
    if(!expiresAt)return;
    const iv=setInterval(()=>{
      const s=calcLeft();
      setTimeLeft(s);
      if(s<=0){onExpire&&onExpire();clearInterval(iv);}
    },1000);
    return()=>clearInterval(iv);
  },[]);

  function fmtTime(s){
    if(s===null||s===undefined)return"";
    if(s<=0)return"Expired";
    const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
    if(h>0)return`${h}h ${m}m remaining`;
    if(m>0)return`${m}m ${sec}s remaining`;
    return`${sec}s remaining`;
  }

  return(
    <div style={{background:col.bg,borderBottom:`2px solid ${col.border}`,padding:"9px 16px",animation:"bannerSlide 0.35s var(--ease-out)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:col.dot,flexShrink:0,boxShadow:`0 0 8px ${col.dot}88`}}/>
        <span style={{fontSize:12,fontWeight:600,color:col.text,flex:1}}>{notif.message}</span>
        {timeLeft!==null&&<span style={{fontSize:10,color:col.text,opacity:0.65,flexShrink:0,fontFamily:"var(--mono)"}}>{fmtTime(timeLeft)}</span>}
      </div>
    </div>
  );
}

function StoreBuilderPanel({layout,onSave}){
  const ref=useRef(null),saveRef=useRef(onSave);saveRef.current=onSave;
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    let dead=false,b=null;
    loadStore3d().then(m=>{if(!dead&&ref.current)b=m.mountBuilder(ref.current,layout,{onSave:l=>saveRef.current(l)});})
      .catch(e=>{console.error(e);setFailed(true);});
    return()=>{dead=true;if(b)b.dispose();};
  },[]);// mounts once; the builder keeps its own draft from here
  if(failed)return <div style={{fontSize:12,color:DT.red,padding:"8px 0 20px",letterSpacing:"0.06em"}}>// ERROR: builder failed to load — check your connection and reopen it</div>;
  return <div ref={ref} style={{marginBottom:24}}/>;
}

function DevPage({isDev,onUnlock,auditLog=[],taxRate=DEFAULT_TAX_RATE,onTaxRateChange,managerDisabledProp=false,onManagerDisabledChange,storeHours=DEFAULT_HOURS,onStoreHoursChange,presetList=[],onPresetListChange,setItems,items=[],activeNotif,onNotifChange,layout=DEFAULT_LAYOUT,onLayoutSave}){
  const [showBuilder,setShowBuilder]=useState(false);
  const [knownBugs,setKnownBugs]=useState([]);
  const [reports,setReports]=useState([]);
  const [managerDisabled,setManagerDisabled]=useState(managerDisabledProp);

  // Load known bugs, reports from Supabase
  useEffect(()=>{
    sb.from("known_bugs").select("*").order("id",{ascending:false}).then(({data})=>{if(data)setKnownBugs(data);});
    sb.from("bug_reports").select("*").order("id",{ascending:false}).then(({data})=>{if(data)setReports(data);});
  },[]);

  // Sync managerDisabled from parent
  useEffect(()=>{setManagerDisabled(managerDisabledProp);},[managerDisabledProp]);

  async function toggleManagerDisabled(){
    const next=!managerDisabled;
    setManagerDisabled(next);
    await sb.from("app_settings").upsert({key:"manager_disabled",value:String(next)},{onConflict:"key"});
    onManagerDisabledChange&&onManagerDisabledChange(next);
  }
  const [showAddBug,setShowAddBug]=useState(false);
  const [bugForm,setBugForm]=useState({title:"",description:"",severity:"Medium",status:"Open"});
  const [taxRateInput,setTaxRateInput]=useState(String((taxRate*100).toFixed(2)));
  const [taxRateSaved,setTaxRateSaved]=useState(false);
  const [confirmDisable,setConfirmDisable]=useState(false);
  const [showNotifForm,setShowNotifForm]=useState(false);
  const [notifMsg,setNotifMsg]=useState("");
  const [notifColor,setNotifColor]=useState("blue");
  const [notifDuration,setNotifDuration]=useState("60"); // minutes, "" = permanent
  function handleTaxSave(){
    const val=parseFloat(taxRateInput);
    if(isNaN(val)||val<0||val>100)return;
    onTaxRateChange&&onTaxRateChange(val/100);
    setTaxRateSaved(true);
    setTimeout(()=>setTaxRateSaved(false),2000);
  }
  if(!isDev)return(
    <div style={{minHeight:"100vh",background:DT.appBg,fontFamily:"'Courier New',Courier,monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,paddingBottom:80}}>
      <div style={{fontSize:11,color:DT.subText,letterSpacing:"0.15em",marginBottom:12}}>// AUTHENTICATION REQUIRED</div>
      <div style={{fontSize:28,fontWeight:700,color:DT.accent,marginBottom:8,letterSpacing:"0.05em"}}>ACCESS_DENIED</div>
      <div style={{fontSize:12,color:DT.subText,marginBottom:32,letterSpacing:"0.05em"}}>Enter developer credentials to proceed</div>
      <button onClick={onUnlock} style={{padding:"13px 32px",background:DT.accent,border:"none",borderRadius:6,color:DT.accentText,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.1em"}}>ENTER_PIN →</button>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:DT.appBg,fontFamily:"'Courier New',Courier,monospace",paddingBottom:80,animation:"pageEnter 0.28s var(--ease-out)"}}>
      <div style={{background:DT.headerBg,borderBottom:`1px solid ${DT.cardBorder}`,padding:"16px 16px 14px"}}>
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",marginBottom:3}}>// developer console</div>
        <div style={{fontSize:20,fontWeight:700,color:DT.accent,letterSpacing:"0.05em",marginBottom:8}}>DEV MODE</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:`${DT.green}15`,color:DT.green,border:`1px solid ${DT.green}30`,letterSpacing:"0.08em"}}>● SESSION ACTIVE</span>
          <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:`${DT.accent}15`,color:DT.accent,border:`1px solid ${DT.accent}30`,letterSpacing:"0.08em"}}>● FULL ACCESS</span>
          {managerDisabled&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:`${DT.red}15`,color:DT.red,border:`1px solid ${DT.red}30`,letterSpacing:"0.08em"}}>● MANAGERS LOCKED</span>}
        </div>
      </div>
      <div style={{padding:"20px 14px"}}>
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// security.managerPin</div>
        <div style={{background:DT.cardBg,border:`1px solid ${managerDisabled?"#ff446644":DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:24,transition:"border-color 0.3s"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:700,color:DT.text}}>Manager PIN</div>
            <span style={{fontSize:10,padding:"3px 8px",background:managerDisabled?`${DT.red}15`:`${DT.green}15`,color:managerDisabled?DT.red:DT.green,border:`1px solid ${managerDisabled?DT.red+"44":DT.green+"44"}`,borderRadius:4,letterSpacing:"0.06em"}}>{managerDisabled?"DISABLED":"ACTIVE"}</span>
          </div>
          {managerDisabled&&<div style={{fontSize:11,color:DT.red,marginBottom:12,padding:"8px 10px",background:"#ff446610",border:"1px solid #ff446630",borderRadius:6,letterSpacing:"0.05em"}}>// WARNING: Manager permissions currently DISABLED</div>}

          {/* Confirm modal */}
          {confirmDisable&&(
            <div style={{background:"#1a0a0a",border:"1px solid #ff446644",borderRadius:8,padding:14,marginBottom:10,animation:"popIn 0.2s ease"}}>
              <div style={{fontSize:12,color:DT.red,fontWeight:700,marginBottom:6,letterSpacing:"0.06em"}}>// CONFIRM: DISABLE_MANAGERS?</div>
              <div style={{fontSize:11,color:DT.subText,marginBottom:10,lineHeight:1.5}}>
                This will immediately block all manager PIN logins. You can re-enable at any time from this page, or via the Supabase SQL editor:<br/>
                <span style={{color:DT.accent,fontFamily:"var(--mono)",fontSize:10}}>update app_settings set value='false' where key='manager_disabled';</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setConfirmDisable(false)} style={{flex:1,padding:"8px",background:"transparent",border:`1px solid ${DT.cardBorder}`,borderRadius:6,color:DT.subText,fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>CANCEL</button>
                <button onClick={async()=>{setConfirmDisable(false);await toggleManagerDisabled();}} style={{flex:2,padding:"8px",background:"#ff446618",border:"1px solid #ff446644",borderRadius:6,color:DT.red,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em"}}>⊘ CONFIRM_DISABLE →</button>
              </div>
            </div>
          )}

          <button onClick={()=>managerDisabled?toggleManagerDisabled():setConfirmDisable(true)}
            style={{width:"100%",padding:"10px",background:managerDisabled?`${DT.green}15`:"#ff446615",border:`1px solid ${managerDisabled?DT.green+"44":"#ff446644"}`,borderRadius:6,color:managerDisabled?DT.green:DT.red,fontSize:12,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em",marginBottom:10,transition:"all 0.3s"}}>
            {managerDisabled?"✓ ENABLE_MANAGERS →":"⊘ DISABLE_MANAGERS →"}
          </button>
          <button style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:12,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em"}}>CHANGE_PIN →</button>
        </div>
        <div style={{height:1,background:DT.cardBorder,margin:"20px 0"}}/>
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// config.taxRate</div>
        <div style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:700,color:DT.text}}>Sales Tax Rate</div>
            <span style={{fontSize:16,fontWeight:700,color:DT.accent}}>{(taxRate*100).toFixed(2)}%</span>
          </div>
          <div style={{fontSize:11,color:DT.subText,marginBottom:10,letterSpacing:"0.04em"}}>// affects Cash Tools tax calculator</div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input type="number" min="0" max="100" step="0.01" value={taxRateInput}
              onChange={e=>{setTaxRateInput(e.target.value);setTaxRateSaved(false);}}
              style={{flex:1,background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"9px 12px",color:DT.text,fontSize:14,fontFamily:"var(--mono)",boxSizing:"border-box"}}/>
            <span style={{display:"flex",alignItems:"center",fontSize:14,color:DT.subText,paddingRight:4}}>%</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setTaxRateInput(String((DEFAULT_TAX_RATE*100).toFixed(2)));setTaxRateSaved(false);}}
              style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${DT.cardBorder}`,borderRadius:6,color:DT.subText,fontSize:11,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em"}}>
              RESET_DEFAULT →
            </button>
            <button onClick={handleTaxSave}
              style={{flex:2,padding:"9px",background:taxRateSaved?`${DT.green}20`:`${DT.accent}15`,border:`1px solid ${taxRateSaved?DT.green:DT.accent}44`,borderRadius:6,color:taxRateSaved?DT.green:DT.accent,fontSize:11,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em",transition:"all 0.2s"}}>
              {taxRateSaved?"✓ SAVED":"SAVE_RATE →"}
            </button>
          </div>
        </div>
        <div style={{height:1,background:DT.cardBorder,margin:"20px 0"}}/>
        <DevNewspaperMerge items={items} setItems={setItems}/>
        <DevDataTools items={items} setItems={setItems}/>
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// store.builder</div>
        <div style={{background:DT.cardBg,border:`1px solid ${showBuilder?DT.accent+"55":DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:showBuilder?12:24,transition:"border-color 0.3s"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{fontSize:14,fontWeight:700,color:DT.text}}>3D Store Builder</div>
            <span style={{fontSize:10,padding:"3px 8px",background:`${DT.accent}15`,color:DT.accent,border:`1px solid ${DT.accent}44`,borderRadius:4,letterSpacing:"0.06em"}}>DEV ONLY</span>
          </div>
          <div style={{fontSize:11,color:DT.subText,marginBottom:12,letterSpacing:"0.04em"}}>// live map: {layout.size.w}×{layout.size.d} ft · {layout.zones.length} fixtures · {layout.walls.length} walls</div>
          <button onClick={()=>setShowBuilder(v=>!v)}
            style={{width:"100%",padding:"10px",background:showBuilder?"transparent":`${DT.accent}15`,border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:12,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em"}}>
            {showBuilder?"✕ CLOSE_BUILDER":"OPEN_BUILDER →"}
          </button>
        </div>
        {showBuilder&&<StoreBuilderPanel layout={layout} onSave={onLayoutSave}/>}
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// config.storeHours</div>
        <div style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:24}}>
          <div style={{fontSize:11,color:DT.subText,marginBottom:10,letterSpacing:"0.04em"}}>// shown on the schedule page</div>
          {(storeHours||DEFAULT_HOURS).map((row,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <input value={row.days} onChange={e=>{const h=[...(storeHours||DEFAULT_HOURS)];h[i]={...h[i],days:e.target.value};onStoreHoursChange&&onStoreHoursChange(h);}}
                style={{flex:"0 0 74px",width:74,background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"7px 8px",color:DT.text,fontSize:12,fontFamily:"var(--mono)"}}/>
              <input value={row.hours} onChange={e=>{const h=[...(storeHours||DEFAULT_HOURS)];h[i]={...h[i],hours:e.target.value};onStoreHoursChange&&onStoreHoursChange(h);}}
                style={{flex:1,minWidth:0,background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"7px 8px",color:DT.text,fontSize:12,fontFamily:"var(--mono)"}}/>
              <button onClick={()=>{const h=(storeHours||DEFAULT_HOURS).filter((_,j)=>j!==i);onStoreHoursChange&&onStoreHoursChange(h);}}
                style={{background:"none",border:`1px solid ${DT.cardBorder}`,borderRadius:6,width:28,height:28,flexShrink:0,color:DT.red,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          ))}
          <button onClick={()=>onStoreHoursChange&&onStoreHoursChange([...(storeHours||DEFAULT_HOURS),{days:"",hours:""}])}
            style={{width:"100%",padding:"8px",background:"transparent",border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:11,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em",marginTop:4}}>
            + ADD_ROW →
          </button>
        </div>
        <DevShiftPresets list={presetList} onChange={l=>onPresetListChange&&onPresetListChange(l)} storeHours={storeHours}/>
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// bugs.known [{knownBugs.length}]</div>
        <button onClick={()=>setShowAddBug(v=>!v)} style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:12,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em",marginBottom:12}}>{showAddBug?"✕ CANCEL":"+ ADD_KNOWN_BUG →"}</button>
        {showAddBug&&(
          <div style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:14}}>
            <input style={{width:"100%",background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"9px 12px",color:DT.text,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",marginBottom:8}} placeholder="Bug title" value={bugForm.title} onChange={e=>setBugForm(f=>({...f,title:e.target.value}))}/>
            <textarea style={{width:"100%",background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"9px 12px",color:DT.text,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",minHeight:70,resize:"none",lineHeight:1.5,marginBottom:10}} placeholder="Description" value={bugForm.description} onChange={e=>setBugForm(f=>({...f,description:e.target.value}))}/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {SEVERITY_LEVELS.map(s=>{const c={Low:"#00ff88",Medium:"#f0c040",High:"#e67e22",Critical:"#ff4466"}[s];return <button key={s} onClick={()=>setBugForm(f=>({...f,severity:s}))} style={{padding:"5px 10px",borderRadius:4,border:`1px solid ${bugForm.severity===s?c:DT.cardBorder}`,background:bugForm.severity===s?`${c}20`:"transparent",color:bugForm.severity===s?c:DT.subText,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{s.toUpperCase()}</button>;})}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowAddBug(false)} style={{flex:1,padding:"8px",background:"transparent",border:`1px solid ${DT.cardBorder}`,borderRadius:6,color:DT.subText,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>CANCEL</button>
              <button onClick={async()=>{if(!bugForm.title||!bugForm.description)return;const{data}=await sb.from("known_bugs").insert({title:bugForm.title,description:bugForm.description,severity:bugForm.severity,status:bugForm.status,created_at:new Date().toISOString()}).select().single();if(data)setKnownBugs(prev=>[data,...prev]);setBugForm({title:"",description:"",severity:"Medium",status:"Open"});setShowAddBug(false);}} style={{flex:2,padding:"8px",background:DT.accent,border:"none",borderRadius:6,color:DT.accentText,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em"}}>PUSH_BUG →</button>
            </div>
          </div>
        )}
        {knownBugs.length===0&&<div style={{fontSize:12,color:DT.subText,padding:"8px 0 20px",letterSpacing:"0.08em"}}>// array empty</div>}
        {knownBugs.map(bug=><BugCard key={bug.id} bug={bug} T={{card:DT.cardBg,border:DT.cardBorder,text:DT.text,sub:DT.subText}} canDelete onDelete={async()=>{await sb.from("known_bugs").delete().eq("id",bug.id);setKnownBugs(prev=>prev.filter(b=>b.id!==bug.id));}}/>)}

        <div style={{height:1,background:DT.cardBorder,margin:"20px 0"}}/>
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// bugs.reports [{reports.length}]</div>
        {reports.length===0&&<div style={{fontSize:12,color:DT.subText,padding:"8px 0 20px",letterSpacing:"0.08em"}}>// array empty</div>}
        {reports.map(r=><BugCard key={r.id} bug={r} T={{card:DT.cardBg,border:DT.cardBorder,text:DT.text,sub:DT.subText}} canDelete onDelete={async()=>{await sb.from("bug_reports").delete().eq("id",r.id);setReports(prev=>prev.filter(b=>b.id!==r.id));}}/>)}

        <div style={{height:1,background:DT.cardBorder,margin:"20px 0"}}/>

        {/* Audit log */}
        <div style={{height:1,background:DT.cardBorder,margin:"20px 0"}}/>

        {/* ── Notifications ── */}
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// system.notification</div>

        {/* Active notification */}
        {activeNotif?(
          <div style={{background:DT.cardBg,border:`2px solid ${NOTIF_COLORS[activeNotif.color]?.border||DT.cardBorder}`,borderRadius:10,padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:NOTIF_COLORS[activeNotif.color]?.dot||DT.accent,boxShadow:`0 0 6px ${NOTIF_COLORS[activeNotif.color]?.dot||DT.accent}`}}/>
              <span style={{fontSize:12,fontWeight:600,color:NOTIF_COLORS[activeNotif.color]?.text||DT.text,flex:1}}>{activeNotif.message}</span>
            </div>
            <div style={{fontSize:10,color:DT.subText,marginBottom:10,letterSpacing:"0.04em"}}>
              {activeNotif.expiresAt?`// expires: ${new Date(activeNotif.expiresAt).toLocaleTimeString()}`:"// permanent — no expiry set"}
            </div>
            <button onClick={()=>{onNotifChange&&onNotifChange(null);saveActiveNotif(null);}}
              style={{width:"100%",padding:"8px",background:"#ff446615",border:"1px solid #ff446644",borderRadius:6,color:DT.red,fontSize:11,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em"}}>
              ⊘ DISMISS_NOTIFICATION →
            </button>
          </div>
        ):(
          <div style={{fontSize:12,color:DT.subText,padding:"6px 0 10px",letterSpacing:"0.06em"}}>// no active notification</div>
        )}

        {/* New notification form */}
        <button onClick={()=>setShowNotifForm(v=>!v)}
          style={{width:"100%",padding:"9px",background:"transparent",border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:11,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.08em",marginBottom:showNotifForm?10:20}}>
          {showNotifForm?"✕ CANCEL":"+ NEW_NOTIFICATION →"}
        </button>

        {showNotifForm&&(
          <div style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:10,padding:16,marginBottom:20,animation:"slideDown 0.2s ease"}}>
            {/* Message */}
            <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.1em",marginBottom:5}}>// message</div>
            <input value={notifMsg} onChange={e=>setNotifMsg(e.target.value)}
              placeholder="e.g. Inventory check in progress..."
              style={{width:"100%",background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"9px 12px",color:DT.text,fontSize:13,fontFamily:"var(--mono)",boxSizing:"border-box",marginBottom:12}}/>

            {/* Color picker */}
            <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.1em",marginBottom:8}}>// color</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              {Object.entries(NOTIF_COLORS).map(([key,col])=>(
                <button key={key} onClick={()=>setNotifColor(key)}
                  title={col.label}
                  style={{width:26,height:26,borderRadius:"50%",background:col.bubble,border:`2px solid ${notifColor===key?"#fff":"transparent"}`,cursor:"pointer",boxShadow:notifColor===key?`0 0 8px ${col.bubble}88`:"none",transition:"all 0.15s",transform:notifColor===key?"scale(1.2)":"scale(1)"}}/>
              ))}
            </div>

            {/* Duration */}
            <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.1em",marginBottom:5}}>// duration (minutes — leave blank for permanent)</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
              {[{label:"15m",val:"15"},{label:"30m",val:"30"},{label:"1h",val:"60"},{label:"2h",val:"120"},{label:"4h",val:"240"},{label:"∞",val:""}].map(opt=>(
                <button key={opt.val} onClick={()=>setNotifDuration(opt.val)}
                  style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${notifDuration===opt.val?DT.accent:DT.cardBorder}`,background:notifDuration===opt.val?`${DT.accent}20`:"transparent",color:notifDuration===opt.val?DT.accent:DT.subText,fontSize:11,cursor:"pointer",fontFamily:"var(--mono)",transition:"all 0.15s"}}>
                  {opt.label}
                </button>
              ))}
              <input value={notifDuration} onChange={e=>setNotifDuration(e.target.value)}
                placeholder="custom"
                style={{width:60,background:DT.inputBg,border:`1px solid ${DT.inputBorder}`,borderRadius:6,padding:"5px 8px",color:DT.text,fontSize:11,fontFamily:"var(--mono)",textAlign:"center"}}/>
              <span style={{display:"flex",alignItems:"center",fontSize:11,color:DT.subText}}>min</span>
            </div>

            {/* Preview */}
            {notifMsg.trim()&&(
              <div style={{background:NOTIF_COLORS[notifColor]?.bg||"#0d2540",border:`1px solid ${NOTIF_COLORS[notifColor]?.border||DT.cardBorder}`,borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:NOTIF_COLORS[notifColor]?.dot||DT.accent,flexShrink:0}}/>
                <span style={{fontSize:12,color:NOTIF_COLORS[notifColor]?.text||DT.text,flex:1}}>{notifMsg}</span>
                {notifDuration&&<span style={{fontSize:10,color:NOTIF_COLORS[notifColor]?.text||DT.text,opacity:0.6,fontFamily:"var(--mono)"}}>{notifDuration}m</span>}
              </div>
            )}

            <button onClick={()=>{
              if(!notifMsg.trim())return;
              const mins=notifDuration?parseInt(notifDuration):null;
              const expiresAt=mins?new Date(Date.now()+mins*60*1000).toISOString():null;
              const n={message:notifMsg.trim(),color:notifColor,expiresAt};
              onNotifChange&&onNotifChange(n);
              saveActiveNotif(n);
              setNotifMsg("");setShowNotifForm(false);
            }} style={{width:"100%",padding:"9px",background:`${DT.accent}20`,border:`1px solid ${DT.accent}44`,borderRadius:6,color:DT.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.08em"}}>
              BROADCAST_NOTIFICATION →
            </button>
          </div>
        )}

        <div style={{height:1,background:DT.cardBorder,margin:"0 0 20px"}}/>

        {/* Audit log */}
        <div style={{fontSize:10,color:DT.subText,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>// audit.log [last {auditLog.length}/10]</div>
        {auditLog.length===0?(
          <div style={{fontSize:12,color:DT.subText,padding:"8px 0",letterSpacing:"0.08em"}}>// array empty — no edits recorded this session</div>
        ):(
          auditLog.map((entry,i)=>{
            const actionColor=entry.action==="added"?DT.green:entry.action==="deleted"?DT.red:"#f0c040";
            const t=entry.timestamp instanceof Date?entry.timestamp:new Date(entry.timestamp);
            const timeStr=t?`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}`:"--:--:--";
            const canUndo=entry.action==="edited"&&entry.snapshot&&entry.snapshot.id;
            return(
              <div key={entry.id} style={{background:DT.cardBg,border:`1px solid ${DT.cardBorder}`,borderRadius:8,padding:"12px 14px",marginBottom:8,borderLeft:`3px solid ${actionColor}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:actionColor,letterSpacing:"0.08em",textTransform:"uppercase"}}>{entry.action==="added"?"+ ADDED":entry.action==="deleted"?"✕ DELETED":"~ EDITED"}</span>
                    {entry.role&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${DT.accent}15`,color:DT.subText,border:`1px solid ${DT.cardBorder}`}}>{entry.role}</span>}
                  </div>
                  <span style={{fontSize:10,color:DT.subText,fontFamily:"var(--mono)"}}>{timeStr}</span>
                </div>
                <div style={{fontSize:13,color:DT.text,fontWeight:600,marginBottom:3}}>{entry.itemName}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${DT.accent}15`,color:DT.accent,border:`1px solid ${DT.accent}30`}}>{entry.category}</span>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${DT.accent}10`,color:DT.subText,border:`1px solid ${DT.cardBorder}`}}>{entry.subcategory}</span>
                  {entry.details&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${DT.accent}10`,color:DT.subText,border:`1px solid ${DT.cardBorder}`}}>{entry.details}</span>}
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"#f0c04015",color:"#f0c040",border:"1px solid #f0c04030"}}>${entry.price?.toFixed(2)}</span>
                </div>
                {canUndo&&(
                  <button onClick={async()=>{
                    const s=entry.snapshot;
                    const row={name:s.name,category:s.category,subcategory:s.subcategory,price:s.price,location:s.location||"",notes:s.notes||"",inventory:s.inventory??null,out_of_stock:s.outOfStock||false,map_zone:s.mapZone||null,expiry_date:s.expiryDate||null,pack_size:s.packSize||null,container_type:s.containerType||null,deposit:s.deposit??null,wine_type:s.wineType||null,gillies_recommendation:s.gilliesRecommendation||false};
                    const {error}=await sb.from("items").update(row).eq("id",s.id);
                    if(!error){setItems&&setItems(prev=>prev.map(i=>i.id===s.id?{...i,...s}:i));}
                  }} style={{marginTop:6,width:"100%",padding:"5px 10px",background:"#f0c04015",border:"1px solid #f0c04040",borderRadius:5,color:"#f0c040",fontSize:10,cursor:"pointer",fontFamily:"var(--mono)",letterSpacing:"0.06em",textAlign:"center"}}>
                    ↩ UNDO EDIT
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── SchedulePage ──────────────────────────────────────────────────────────────
const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURLY_RATE=15;

// ── Schedule shifts via Supabase ──────────────────────────────────────────────
// Persist month in sessionStorage so it remembers last viewed (UI state only)
function loadMonth(){try{const s=sessionStorage.getItem("sched-month");return s?JSON.parse(s):null;}catch{return null;}}
function saveMonth(m){try{sessionStorage.setItem("sched-month",JSON.stringify(m));}catch{}}

async function fetchShifts(){
  const {data,error}=await sb.from("schedule_shifts").select("*");
  if(error||!data)return{};
  // Convert array to {month-day: [...shifts]} map
  const map={};
  data.forEach(row=>{
    const key=row.day_key;
    if(!map[key])map[key]=[];
    map[key].push({id:row.id,name:row.name,startTime:row.start_time,endTime:row.end_time,notes:row.notes||""});
  });
  return map;
}

async function saveShiftToSupabase(dayKey,shift){
  const {data,error}=await sb.from("schedule_shifts").insert({
    day_key:dayKey,name:shift.name,start_time:shift.startTime,end_time:shift.endTime,notes:shift.notes||""
  }).select().single();
  if(error)throw error;
  return data.id;
}

async function updateShiftInSupabase(id,shift){
  await sb.from("schedule_shifts").update({
    name:shift.name,start_time:shift.startTime,end_time:shift.endTime,notes:shift.notes||""
  }).eq("id",id);
}

async function deleteShiftFromSupabase(id){
  await sb.from("schedule_shifts").delete().eq("id",id);
}

function toMin(t){const [h,m]=(t||"0:0").split(":").map(Number);return h*60+(m||0);}
function minToTime(m){m=((m%1440)+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;}
// shift as [start,end] minutes; an end before the start means it runs past midnight
function shiftSpan(s){const a=toMin(s.startTime),b=toMin(s.endTime);return [a,b<=a?b+1440:b];}
function parseHours(startTime,endTime){
  if(!startTime||!endTime)return 0;
  const [a,b]=shiftSpan({startTime,endTime});
  return (b-a)/60;
}
// Store hours for a weekday (0=Sun) from the free-text config, e.g. {days:"Mon – Thu",hours:"8 AM – 6:30 PM"}.
// Returns {open,close} in minutes, or null when closed / unreadable.
const DAY_ABBR=["sun","mon","tue","wed","thu","fri","sat"];
// Weekdays (0=Sun) named in text like "Mon – Thu", "Monday-Saturday", "Sat, Sun" or "Daily"
function parseDays(text){
  const t=(text||"").toLowerCase(), days=new Set();
  if(/daily|every|all/.test(t))return new Set([0,1,2,3,4,5,6]);
  for(const part of t.split(/[,&/]|\band\b/)){
    const d=[...part.matchAll(/sun|mon|tue|wed|thu|fri|sat/g)].map(m=>DAY_ABBR.indexOf(m[0]));
    if(d.length===2&&/[-–—]|to|thr/.test(part)){for(let x=d[0];;x=(x+1)%7){days.add(x);if(x===d[1])break;}}
    else d.forEach(x=>days.add(x));
  }
  return days;
}
// "123456" -> "Mon–Sat", "0" -> "Sun", "56" -> "Fri–Sat", "6012345" -> "Every day"
function daysLabel(str){
  const s=new Set([...(str||"")].map(Number)), N=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  if(!s.size)return "";
  if(s.size===7)return "Every day";
  const starts=[...s].filter(d=>!s.has((d+6)%7));
  if(starts.length===1){let e=starts[0];while(s.has((e+1)%7))e=(e+1)%7;return e===starts[0]?N[e]:`${N[starts[0]]}–${N[e]}`;}
  return [...s].sort().map(d=>N[d]).join(", ");
}
// Papers can cost more on some days: item.price is the usual price, item.dayPrices the exceptions [{days:"0",price:6}]
function parseDayPrices(v){
  try{const a=typeof v==="string"?JSON.parse(v):v;
    return Array.isArray(a)?a.filter(x=>x&&x.days&&x.price!=null&&!isNaN(+x.price)).map(x=>({days:String(x.days),price:+x.price})):[];
  }catch{return [];}
}
function priceOn(item,dow=new Date().getDay()){
  const o=(item.dayPrices||[]).find(x=>x.days.includes(String(dow)));
  return o?o.price:item.price;
}
// every day's price, usual price first: [{days:"123456",price:4},{days:"0",price:6}]
function priceSchedule(item){
  const dp=item.dayPrices||[];if(!dp.length)return [];
  const used=dp.map(x=>x.days).join("");
  const rest=[0,1,2,3,4,5,6].filter(d=>!used.includes(String(d))).join("");
  return [...(rest?[{days:rest,price:item.price}]:[]),...dp];
}
// Old-style pairs like "Herald (Monday-Saturday)" + "Herald (Sunday)" -> one "Herald" with a Sunday price
function newspaperMergePlan(items){
  const groups={};
  for(const it of items){
    if(it.subcategory!=="newspapers")continue;
    const m=it.name.match(/^(.*?)\s*\(([^)]*day[^)]*)\)\s*$/i);if(!m)continue;
    const days=[...parseDays(m[2])].sort().join("");if(!days)continue;
    const k=m[1].trim().toLowerCase();
    (groups[k]=groups[k]||{name:m[1].trim(),parts:[]}).parts.push({item:it,days});
  }
  return Object.values(groups).filter(g=>g.parts.length>1).map(g=>{
    const parts=[...g.parts].sort((a,b)=>b.days.length-a.days.length); // the most days is the usual price
    return {name:g.name,keep:parts[0].item,dayPrices:parts.slice(1).map(x=>({days:x.days,price:+x.item.price})),remove:parts.slice(1).map(x=>x.item)};
  });
}
function storeHoursFor(storeHours,dow){
  for(const row of storeHours||[]){
    if(!parseDays(row.days).has(dow))continue;
    const times=[...(row.hours||"").matchAll(/(\d{1,2})(?::(\d{2}))?\s*([ap])?/gi)].slice(0,2).map(m=>{
      let h=+m[1]%(m[3]?12:24);if(m[3]&&m[3].toLowerCase()==="p")h+=12;return h*60+(+m[2]||0);
    });
    if(times.length<2)return null;
    return {open:times[0],close:times[1]<=times[0]?times[1]+1440:times[1]};
  }
  return null;
}
// one-tap shift presets that follow the store's hours for that day
function shiftPresets(hrs){
  if(!hrs)return [];
  const mid=Math.round((hrs.open+hrs.close)/2/30)*30;
  return [{label:"Opening",start:hrs.open,end:mid},{label:"Closing",start:mid,end:hrs.close},{label:"Full day",start:hrs.open,end:hrs.close}];
}
// stretches of open hours with nobody scheduled (15 min or longer)
function coverageGaps(dayShifts,hrs){
  if(!hrs)return [];
  const spans=dayShifts.map(shiftSpan).sort((a,b)=>a[0]-b[0]);
  const gaps=[];let t=hrs.open;
  for(const [a,b] of spans){if(a>t)gaps.push([t,Math.min(a,hrs.close)]);t=Math.max(t,b);if(t>=hrs.close)break;}
  if(t<hrs.close)gaps.push([t,hrs.close]);
  return gaps.filter(([a,b])=>b-a>=15);
}
function fmtMin(m){return fmt12(minToTime(m)).replace(":00 "," ");}
const STAFF_HUES=[230,145,25,330,190,50,280,0,100,210];
function fmt12(t){
  if(!t)return"";
  const [h,m]=t.split(":").map(Number);
  const ampm=h>=12?"PM":"AM";
  const h12=h%12||12;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}

function SchedulePage({isManager,isDark,onUnlock,storeHours=DEFAULT_HOURS,presetList=[]}){
  const now=new Date();
  const currentYear=now.getFullYear();
  const saved=loadMonth();
  const [month,setMonth]=useState(saved?saved.month:now.getMonth());
  const [shifts,setShifts]=useState({});
  const [shiftsLoading,setShiftsLoading]=useState(true);
  const [focusDay,setFocusDay]=useState(null);
  const [showShiftForm,setShowShiftForm]=useState(false);
  const [editShift,setEditShift]=useState(null);
  const [shiftForm,setShiftForm]=useState({name:"",startTime:"09:00",endTime:"17:00",notes:""});
  const [staff,setStaff]=useState(null); // [{name,hue}] shared via app_settings.staff_list
  const [addingName,setAddingName]=useState(false);
  const [newName,setNewName]=useState("");
  const [copyAsk,setCopyAsk]=useState(false);
  const [notice,setNotice]=useState("");
  const [openPay,setOpenPay]=useState(null);
  useEffect(()=>{window.scrollTo(0,0);},[focusDay]);

  const bg="var(--bg)";
  const card="var(--surface)";
  const border="var(--border)";
  const text="var(--text)";
  const sub="var(--muted)";
  const accent=isDark?"#8b91ff":"#4f56d6";
  const inp={};

  useEffect(()=>{saveMonth({month});},[month]);

  // Load shifts from Supabase on mount
  useEffect(()=>{
    fetchShifts().then(data=>{setShifts(data);setShiftsLoading(false);}).catch(()=>setShiftsLoading(false));
    sb.from("app_settings").select("value").eq("key","staff_list").maybeSingle()
      .then(({data})=>{try{setStaff(data?.value?JSON.parse(data.value):[]);}catch{setStaff([]);}})
      .catch(()=>setStaff([]));
  },[]);
  // First run: build the staff list from names already on the schedule
  useEffect(()=>{
    if(staff===null||shiftsLoading||staff.length)return;
    const seen=new Map();
    Object.values(shifts).flat().forEach(x=>{const n=(x.name||"").trim().replace(/\s+/g," ");if(n&&!seen.has(n.toLowerCase()))seen.set(n.toLowerCase(),n);});
    if(seen.size)saveStaff([...seen.values()].map((name,i)=>({name,hue:STAFF_HUES[i%STAFF_HUES.length]})));
  },[staff,shiftsLoading]);

  function saveStaff(list){
    setStaff(list);
    sb.from("app_settings").upsert({key:"staff_list",value:JSON.stringify(list)},{onConflict:"key"}).then(()=>{},()=>{});
  }
  function addStaff(raw){
    const name=raw.trim().replace(/\s+/g," ");if(!name)return null;
    const list=staff||[];
    const hit=list.find(x=>x.name.toLowerCase()===name.toLowerCase());if(hit)return hit.name;
    const used=new Set(list.map(x=>x.hue));
    saveStaff([...list,{name,hue:STAFF_HUES.find(h=>!used.has(h))??(list.length*67)%360}]);
    return name;
  }
  // the staff-list spelling of a name, so "sam " and "Sam" count as one person
  function canon(n){const t=(n||"").trim().replace(/\s+/g," ");const p=(staff||[]).find(x=>x.name.toLowerCase()===t.toLowerCase());return p?p.name:t;}
  function flash(msg){setNotice(msg);setTimeout(()=>setNotice(""),2800);}

  // Last week's shifts for the empty days of the week containing `day` (Sun–Sat)
  function weekPlan(day){
    const start=day-new Date(currentYear,month,day).getDay();
    const at=o=>new Date(currentYear,month,start+o);
    const key=d=>`${d.getMonth()}-${d.getDate()}`, nice=d=>`${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}`;
    const plan=[];
    for(let i=0;i<7;i++){const k=key(at(i)),src=shifts[key(at(i-7))]||[];if(src.length&&!(shifts[k]||[]).length)plan.push({k,src});}
    return {plan,count:plan.reduce((a,x)=>a+x.src.length,0),from:`${nice(at(-7))} – ${nice(at(-1))}`,to:`${nice(at(0))} – ${nice(at(6))}`};
  }
  async function copyLastWeek(){
    const {plan,count}=weekPlan(focusDay);setCopyAsk(false);
    try{
      const added={};
      for(const {k,src} of plan)added[k]=await Promise.all(src.map(async x=>({...x,id:await saveShiftToSupabase(k,x)})));
      setShifts(prev=>({...prev,...added}));
      flash(`Copied ${count} shift${count!==1?"s":""} from last week`);
    }catch{
      fetchShifts().then(setShifts).catch(()=>{});
      flash("Couldn't copy every shift. Check your connection.");
    }
  }

  const firstDay=new Date(currentYear,month,1).getDay();
  const daysInMonth=new Date(currentYear,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(d);

  function dayKey(d){return `${month}-${d}`;}
  function dayShifts(d){return shifts[dayKey(d)]||[];}

  async function addOrUpdateShift(){
    if(!shiftForm.name.trim())return;
    const key=dayKey(focusDay);
    const arr=[...(shifts[key]||[])];
    if(editShift!==null){
      // Update existing
      const existing=arr[editShift];
      await updateShiftInSupabase(existing.id,shiftForm);
      arr[editShift]={...existing,...shiftForm};
    } else {
      // Insert new
      const newId=await saveShiftToSupabase(key,shiftForm);
      arr.push({...shiftForm,id:newId});
    }
    setShifts(prev=>({...prev,[key]:arr}));
    setShiftForm({name:"",startTime:"09:00",endTime:"17:00",notes:""});
    setShowShiftForm(false);setEditShift(null);
  }

  async function deleteShift(day,idx){
    const key=dayKey(day);
    const arr=[...(shifts[key]||[])];
    const shift=arr[idx];
    if(shift?.id)await deleteShiftFromSupabase(shift.id);
    arr.splice(idx,1);
    setShifts(prev=>({...prev,[key]:arr}));
  }

  function nameColor(name,lightness){
    const n=(name||"").trim().toLowerCase();
    const p=(staff||[]).find(x=>x.name.toLowerCase()===n);
    const hue=p?p.hue:(n.split("").reduce((a,c)=>a+c.charCodeAt(0),0)*47)%360;
    return `hsl(${hue},55%,${lightness}%)`;
  }

  if(!isManager) return(
    <div style={{minHeight:"100vh",background:bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,paddingBottom:80}}>
      <span style={{...EMPTY_ICON,background:`${accent}1f`,color:accent}}><Icon name="calendar" size={26}/></span>
      <div style={{fontSize:20,fontWeight:700,color:"var(--text)",marginBottom:6,letterSpacing:"-0.02em"}}>Sign in to see the schedule</div>
      <div style={{fontSize:14,color:"var(--muted)",marginBottom:24,textAlign:"center"}}>Only managers can view and edit shifts.</div>
      <button onClick={onUnlock} className="press" style={{...ACTION_BTN("#fff",accent),padding:"12px 26px",fontSize:15,minHeight:48}}><Icon name="lock" size={17}/>Sign in</button>
    </div>
  );

  // ── Day detail view ────────────────────────────────────────────────────────
  if(focusDay!==null){
    const daySh=dayShifts(focusDay);
    const dow=new Date(currentYear,month,focusDay).getDay();
    const hrs=storeHoursFor(storeHours,dow);
    const gaps=coverageGaps(daySh,hrs);
    const autoPresets=shiftPresets(hrs);
    const presets=presetList.length
      ?presetList.filter(p=>p.label&&p.start&&p.end).map(p=>{const [start,end]=shiftSpan({startTime:p.start,endTime:p.end});return {label:p.label,start,end};})
      :autoPresets;
    const dayHrs=daySh.reduce((a,x)=>a+parseHours(x.startTime,x.endTime),0);
    const week=weekPlan(focusDay);
    const green="var(--success)", red="#e07070";
    const label={fontSize:11,color:sub,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"};
    const chip=(on,c)=>({minHeight:38,padding:"7px 13px",borderRadius:19,border:`1px solid ${on?(c||accent):border}`,background:on?(c||accent):"transparent",color:on?"#fff":text,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"});
    const staffNames=(staff||[]).map(x=>x.name);
    const pickNames=shiftForm.name.trim()&&!staffNames.some(n=>n.toLowerCase()===shiftForm.name.trim().toLowerCase())?[...staffNames,shiftForm.name.trim()]:staffNames;
    const blankForm=()=>({name:"",startTime:autoPresets[2]?minToTime(autoPresets[2].start):"09:00",endTime:autoPresets[2]?minToTime(autoPresets[2].end):"17:00",notes:""});
    const commitNewName=()=>{const n=addStaff(newName);if(n)setShiftForm(f=>({...f,name:n}));setAddingName(false);setNewName("");};
    return(
      <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:80}}>
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{position:"sticky",top:0,zIndex:90,background:"var(--glass)",backdropFilter:"saturate(1.4) blur(14px)",WebkitBackdropFilter:"saturate(1.4) blur(14px)",borderBottom:"1px solid var(--border)",padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <IconButton icon="back" label="Back to month" onClick={()=>{setFocusDay(null);setShowShiftForm(false);setEditShift(null);setCopyAsk(false);setAddingName(false);}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:19,fontWeight:700,color:"var(--text)",lineHeight:1.2,letterSpacing:"-0.02em"}}>{["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dow]}, {MONTH_NAMES[month].slice(0,3)} {focusDay}</div>
              <div style={{fontSize:12,color:sub,marginTop:2}}>{hrs?`Open ${fmtMin(hrs.open)} – ${fmtMin(hrs.close)}`:"Store closed"}{daySh.length>0&&` · ${daySh.length} shift${daySh.length!==1?"s":""} · ${+dayHrs.toFixed(1)}h`}</div>
            </div>
            <HeaderAction on={showShiftForm} onClick={()=>{setEditShift(null);setShiftForm(blankForm());setAddingName(false);setShowShiftForm(v=>!v);}} accent={accent}><Icon name="plus" size={17} stroke={2.4}/>Shift</HeaderAction>
          </div>
        </div>
        <div style={{padding:"14px"}}>
          {notice&&<div style={{background:"var(--success-soft)",border:`1px solid ${green}55`,color:green,borderRadius:10,padding:"10px 12px",fontSize:13,marginBottom:12,animation:"slideDown 0.2s ease"}}>{notice}</div>}

          {showShiftForm&&(
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:14,animation:"slideDown 0.22s var(--ease-out)"}}>
              <div style={label}>Who</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                {pickNames.map(n=>{const on=shiftForm.name.trim().toLowerCase()===n.toLowerCase();return(
                  <button key={n} onClick={()=>setShiftForm(f=>({...f,name:n}))} style={chip(on,nameColor(n,isDark?40:45))}>{n}</button>
                );})}
                {addingName?(
                  <div style={{display:"flex",gap:6,width:"100%"}}>
                    <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&commitNewName()} placeholder="Name" className="field" style={{...inp,flex:1}}/>
                    <button onClick={commitNewName} style={chip(true)}>Add</button>
                  </div>
                ):(
                  <button onClick={()=>{setAddingName(true);setNewName("");}} style={{...chip(false),borderStyle:"dashed",color:sub}}>+ New person</button>
                )}
              </div>
              {presets.length>0&&<>
                <div style={label}>Quick times</div>
                <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(3,presets.length)},minmax(0,1fr))`,gap:6,marginBottom:12}}>
                  {presets.map(p=>{const on=shiftForm.startTime===minToTime(p.start)&&shiftForm.endTime===minToTime(p.end);const t=m=>fmtMin(m).replace(/ (A|P)M/,(_,x)=>x.toLowerCase());return(
                    <button key={p.label} onClick={()=>setShiftForm(f=>({...f,startTime:minToTime(p.start),endTime:minToTime(p.end)}))}
                      style={{...chip(on),borderRadius:12,padding:"8px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,whiteSpace:"normal",lineHeight:1.2}}>
                      <span>{p.label}</span>
                      <span style={{fontWeight:400,fontSize:10.5,opacity:0.75}}>{t(p.start)}–{t(p.end)}</span>
                    </button>
                  );})}
                </div>
              </>}
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={label}>Start</div>
                  <input type="time" value={shiftForm.startTime} onChange={e=>setShiftForm(f=>({...f,startTime:e.target.value}))} className="field" style={inp}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={label}>End</div>
                  <input type="time" value={shiftForm.endTime} onChange={e=>setShiftForm(f=>({...f,endTime:e.target.value}))} className="field" style={inp}/>
                </div>
              </div>
              {(()=>{
                const h=parseHours(shiftForm.startTime,shiftForm.endTime);
                const overnight=toMin(shiftForm.endTime)<=toMin(shiftForm.startTime);
                return h>0?(
                  <div style={{background:"var(--success-soft)",border:`1px solid ${"var(--success-soft)"}`,borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,color:green}}>{+h.toFixed(2)}h @ ${HOURLY_RATE}/hr{overnight&&" · ends next day"}</span>
                    <span style={{fontSize:14,fontWeight:700,color:green}}>${(h*HOURLY_RATE).toFixed(2)}</span>
                  </div>
                ):null;
              })()}
              <div style={label}>Notes <span style={{opacity:0.6,textTransform:"none",letterSpacing:0}}>(optional)</span></div>
              <textarea value={shiftForm.notes} onChange={e=>setShiftForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes…" className="field" style={{...inp,minHeight:54,resize:"none",lineHeight:1.5,marginBottom:12}}/>
              <button onClick={addOrUpdateShift} disabled={!shiftForm.name.trim()} style={{width:"100%",minHeight:46,padding:11,background:accent,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:shiftForm.name.trim()?"pointer":"default",opacity:shiftForm.name.trim()?1:0.45,fontFamily:"inherit"}}>
                {!shiftForm.name.trim()?"Pick who's working":editShift!==null?"Save Changes":"Add Shift"}
              </button>
            </div>
          )}

          {(hrs||daySh.length>0)&&(()=>{
            const spans=daySh.map(shiftSpan);
            let lo=Math.min(...(hrs?[hrs.open]:[]),...spans.map(x=>x[0])), hi=Math.max(...(hrs?[hrs.close]:[]),...spans.map(x=>x[1]));
            lo=Math.floor(lo/60)*60; hi=Math.max(lo+60,Math.ceil(hi/60)*60);
            const len=hi-lo, L=m=>`${(m-lo)/len*100}%`, W=(a,b)=>`${(b-a)/len*100}%`;
            const step=len<=480?60:len<=900?120:180, ticks=[];
            for(let m=lo;m<=hi;m+=step)ticks.push(m);
            const short=m=>{const h=Math.floor(m/60)%24;return `${h%12||12}${h<12?"a":"p"}`;};
            const track={position:"relative",flex:1,height:26,borderRadius:7,background:"var(--surface-2)",overflow:"hidden"};
            const band=hrs&&<div style={{position:"absolute",top:0,bottom:0,left:L(hrs.open),width:W(hrs.open,hrs.close),background:"rgba(124,131,253,0.1)"}}/>;
            const nameCol={width:62,flexShrink:0,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"};
            return(
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:14,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{...label,marginBottom:0}}>Coverage</span>
                  {hrs&&<span style={{fontSize:12,fontWeight:700,color:gaps.length?red:green}}>{gaps.length?`⚠ ${gaps.length} gap${gaps.length!==1?"s":""}`:"✓ Fully covered"}</span>}
                </div>
                {daySh.map((x,i)=>{const [a,b]=spans[i];return(
                  <div key={x.id||i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{...nameCol,color:text}}>{canon(x.name)}</div>
                    <div style={track}>{band}
                      <div style={{position:"absolute",top:3,bottom:3,left:L(a),width:W(a,b),borderRadius:5,background:nameColor(x.name,isDark?40:48),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden"}}>{short(a)}–{short(b)}</div>
                    </div>
                  </div>
                );})}
                {hrs&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{...nameCol,color:sub}}>Open hours</div>
                    <div style={{...track,height:10,borderRadius:5}}>
                      <div style={{position:"absolute",top:0,bottom:0,left:L(hrs.open),width:W(hrs.open,hrs.close),background:green,opacity:0.7}}/>
                      {gaps.map(([a,b],i)=><div key={i} style={{position:"absolute",top:0,bottom:0,left:L(a),width:W(a,b),background:red}}/>)}
                    </div>
                  </div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <div style={{width:62,flexShrink:0}}/>
                  <div style={{position:"relative",flex:1,height:14}}>
                    {ticks.map(m=><span key={m} style={{position:"absolute",left:L(m),transform:m===lo?"none":m>=hi?"translateX(-100%)":"translateX(-50%)",fontSize:9,color:sub,whiteSpace:"nowrap"}}>{short(m)}</span>)}
                  </div>
                </div>
                {gaps.length>0&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${border}`,fontSize:12,color:red,lineHeight:1.7}}>
                  {gaps.map(([a,b],i)=><div key={i}>Nobody scheduled {fmtMin(a)} – {fmtMin(b)}</div>)}
                </div>}
              </div>
            );
          })()}

          {week.plan.length>0&&(copyAsk?(
            <div style={{background:card,border:`1px solid ${accent}55`,borderRadius:14,padding:14,marginBottom:12,animation:"slideDown 0.2s ease"}}>
              <div style={{fontSize:14,fontWeight:700,color:text,marginBottom:4}}>Copy last week's shifts?</div>
              <div style={{fontSize:12,color:sub,lineHeight:1.5,marginBottom:12}}>{week.count} shift{week.count!==1?"s":""} from {week.from} will go into {week.plan.length} empty day{week.plan.length!==1?"s":""} of {week.to}. Days that already have shifts aren't changed.</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setCopyAsk(false)} style={{flex:1,minHeight:44,background:"transparent",border:`1px solid ${border}`,borderRadius:10,color:sub,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={copyLastWeek} style={{flex:2,minHeight:44,background:accent,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Copy {week.count} shift{week.count!==1?"s":""}</button>
              </div>
            </div>
          ):(
            <button onClick={()=>setCopyAsk(true)} style={{width:"100%",minHeight:44,marginBottom:12,background:"transparent",border:`1px dashed ${border}`,borderRadius:12,color:sub,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>⟳ Copy last week's shifts into this week</button>
          ))}

          {daySh.length===0&&!showShiftForm&&(
            <div style={{textAlign:"center",color:sub,padding:"36px 20px"}}>
              <span style={EMPTY_ICON}><Icon name="list" size={26}/></span>
              <div style={{fontSize:14}}>No shifts yet. Tap + Shift to add one.</div>
            </div>
          )}
          {daySh.map((x,idx)=>{
            const h=parseHours(x.startTime,x.endTime);
            return(
              <div key={x.id||idx} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:"12px 12px 12px 14px",marginBottom:10,animation:`pageEnter 0.25s var(--ease-out) ${idx*0.06}s both`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:nameColor(x.name,isDark?30:80),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:14,fontWeight:700,color:nameColor(x.name,isDark?80:25)}}>{x.name.trim()[0]?.toUpperCase()||"?"}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:text}}>{canon(x.name)}</div>
                    <div style={{fontSize:12,color:sub}}>{fmt12(x.startTime)} – {fmt12(x.endTime)} · {+h.toFixed(2)}h</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:green}}>${(h*HOURLY_RATE).toFixed(2)}</div>
                  <button aria-label="Edit shift" onClick={()=>{setEditShift(idx);setShiftForm({name:canon(x.name),startTime:x.startTime,endTime:x.endTime,notes:x.notes||""});setAddingName(false);setShowShiftForm(true);window.scrollTo({top:0,behavior:"smooth"});}} className="press" style={{...ACTION_BTN(),width:40,height:40,minHeight:40,padding:0,flexShrink:0}}><Icon name="edit" size={17}/></button>
                  <button aria-label="Delete shift" onClick={()=>deleteShift(focusDay,idx)} className="press" style={{...ACTION_BTN("var(--danger)","var(--danger-soft)"),width:40,height:40,minHeight:40,padding:0,flexShrink:0}}><Icon name="trash" size={17}/></button>
                </div>
                {x.notes&&<div style={{fontSize:12,color:sub,padding:"6px 10px",marginTop:8,background:"var(--surface-2)",borderRadius:7,lineHeight:1.4}}>📝 {x.notes}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // ── Month calendar view ────────────────────────────────────────────────────
  const SS_RATE=0.062, MED_RATE=0.0145;
  const money=x=>"$"+x.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const green="var(--success)", red="#e07070";
  const isThisMonth=month===now.getMonth();
  // Sun–Sat weeks of this month (clipped to the month), and each person's hours in each
  const weeks=[];
  for(let d=1;d<=daysInMonth;d++){const w=Math.floor((firstDay+d-1)/7);(weeks[w]=weeks[w]||{first:d,last:d}).last=d;}
  const people={};
  for(let d=1;d<=daysInMonth;d++){
    const w=Math.floor((firstDay+d-1)/7);
    dayShifts(d).forEach(x=>{const n=canon(x.name);if(!n)return;(people[n]=people[n]||weeks.map(()=>0))[w]+=parseHours(x.startTime,x.endTime);});
  }
  const payOf=h=>{const gross=h*HOURLY_RATE,ss=gross*SS_RATE,med=gross*MED_RATE;return {h,gross,ss,med,net:gross-ss-med};};
  const monthHrs=Object.values(people).flat().reduce((a,h)=>a+h,0);
  const monthShifts=cells.reduce((a,d)=>a+(d?dayShifts(d).length:0),0);
  const mon=MONTH_NAMES[month].slice(0,3);
  const navBtn={width:40,height:40,borderRadius:12,background:"var(--surface-2)",border:`1px solid ${border}`,color:text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",flexShrink:0};
  const num={fontVariantNumeric:"tabular-nums",textAlign:"right"};
  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:80,animation:"pageEnter 0.28s var(--ease-out)"}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .cal-day{transition:background 0.15s ease;}
        .cal-day:active{background:${"var(--surface-3)"}!important;}
      `}</style>
      <PageHeader title="Schedule" icon="calendar" accent={accent}>
        <div className="chip-row">
          {(storeHours||DEFAULT_HOURS).map(({days,hours},i)=>(
            <div key={i} style={{flexShrink:0,background:"var(--surface-2)",borderRadius:12,padding:"7px 11px"}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--muted)",marginBottom:1}}>{days}</div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",whiteSpace:"nowrap"}}>{hours}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      <div style={{padding:"14px 12px"}}>
        {/* Month switcher + month at a glance */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <button aria-label="Previous month" onClick={()=>setMonth(m=>(m+11)%12)} style={navBtn}>‹</button>
          <div style={{flex:1,textAlign:"center",minWidth:0}}>
            <div style={{fontSize:20,fontWeight:700,color:text,lineHeight:1.2}}>{MONTH_NAMES[month]}</div>
            <div style={{fontSize:11,color:sub,marginTop:2}}>{monthShifts?`${monthShifts} shift${monthShifts!==1?"s":""} · ${+monthHrs.toFixed(1)}h · ${money(monthHrs*HOURLY_RATE)}`:"Nothing scheduled yet"}</div>
          </div>
          <button aria-label="Next month" onClick={()=>setMonth(m=>(m+1)%12)} style={navBtn}>›</button>
        </div>
        {!isThisMonth&&<div style={{textAlign:"center",marginTop:-4,marginBottom:10}}>
          <button onClick={()=>setMonth(now.getMonth())} style={{minHeight:32,padding:"4px 14px",borderRadius:16,border:`1px solid ${accent}66`,background:"transparent",color:accent,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Back to today</button>
        </div>}

        {/* Calendar */}
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",borderBottom:`1px solid ${border}`}}>
            {DAY_NAMES.map((d,i)=>(
              <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:i===0||i===6?accent:sub,letterSpacing:"0.06em",padding:"9px 0",textTransform:"uppercase"}}>{d}</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:1,background:border,animation:"fadeIn 0.3s ease"}}>
            {[...cells,...Array((7-cells.length%7)%7).fill(null)].map((day,i)=>{
              if(!day) return <div key={`e${i}`} style={{background:"var(--surface-2)"}}/>;
              const sh=dayShifts(day);
              const names=[...new Set(sh.map(x=>canon(x.name)).filter(Boolean))];
              const hrsDay=sh.reduce((a,x)=>a+parseHours(x.startTime,x.endTime),0);
              const isToday=isThisMonth&&day===now.getDate();
              const isPast=isThisMonth?day<now.getDate():month<now.getMonth();
              const gap=sh.length>0&&coverageGaps(sh,storeHoursFor(storeHours,new Date(currentYear,month,day).getDay())).length>0;
              return(
                <button key={day} className="cal-day" onClick={()=>{setFocusDay(day);setAddingName(false);}} aria-label={`${MONTH_NAMES[month]} ${day}${sh.length?`, ${sh.length} shifts`:""}`}
                  style={{background:isToday?("var(--info-soft)"):card,border:"none",padding:"6px 4px 5px",minHeight:70,cursor:"pointer",position:"relative",display:"flex",flexDirection:"column",alignItems:"stretch",gap:4,fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:isToday?700:500,background:isToday?accent:"transparent",color:isToday?"#fff":isPast?sub:text}}>{day}</span>
                    {gap&&<span title="Gap in coverage" style={{width:6,height:6,borderRadius:"50%",background:red,marginRight:2}}/>}
                  </div>
                  {names.length>0&&<div style={{display:"flex",paddingLeft:2,opacity:isPast?0.6:1}}>
                    {names.slice(0,3).map((n,ni)=>(
                      <span key={n} title={n} style={{width:17,height:17,borderRadius:"50%",marginLeft:ni?-4:0,background:nameColor(n,isDark?45:50),border:`1.5px solid ${card}`,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{n[0].toUpperCase()}</span>
                    ))}
                    {names.length>3&&<span style={{fontSize:9,color:sub,marginLeft:3,alignSelf:"center"}}>+{names.length-3}</span>}
                  </div>}
                  {hrsDay>0&&<div style={{marginTop:"auto",fontSize:9.5,color:sub,paddingLeft:3,fontVariantNumeric:"tabular-nums"}}>{+hrsDay.toFixed(1)}h</div>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",fontSize:11,color:sub,marginTop:8,padding:"0 4px"}}>
          <span>Tap a day to add or edit shifts</span>
          {cells.some(d=>d&&dayShifts(d).length&&coverageGaps(dayShifts(d),storeHoursFor(storeHours,new Date(currentYear,month,d).getDay())).length)&&(
            <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:red}}/>Gap in open hours</span>
          )}
        </div>

        {/* Staff */}
        <div style={{marginTop:14,background:card,border:`1px solid ${border}`,borderRadius:14,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
            <span style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700}}>Staff</span>
            <span style={{fontSize:11,color:sub}}>{(staff||[]).length} {(staff||[]).length===1?"person":"people"}</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {(staff||[]).map(p=>(
              <span key={p.name} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"0 2px 0 11px",minHeight:38,borderRadius:19,background:nameColor(p.name,isDark?16:93),border:`1px solid ${nameColor(p.name,isDark?30:80)}`,fontSize:13,color:text}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:nameColor(p.name,50)}}/>{p.name}
                <button aria-label={`Remove ${p.name}`} onClick={()=>saveStaff(staff.filter(x=>x.name!==p.name))} style={{width:32,height:32,background:"none",border:"none",color:sub,fontSize:16,cursor:"pointer",borderRadius:16}}>×</button>
              </span>
            ))}
            {addingName?(
              <div style={{display:"flex",gap:6,width:"100%"}}>
                <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){addStaff(newName);setNewName("");setAddingName(false);}}} placeholder="Name" className="field" style={{...inp,flex:1}}/>
                <button onClick={()=>{addStaff(newName);setNewName("");setAddingName(false);}} style={{minHeight:38,padding:"7px 14px",borderRadius:19,border:"none",background:accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Add</button>
              </div>
            ):(
              <button onClick={()=>{setAddingName(true);setNewName("");}} style={{minHeight:38,padding:"7px 13px",borderRadius:19,border:`1px dashed ${border}`,background:"transparent",color:sub,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Add person</button>
            )}
          </div>
          {(staff||[]).length>0&&<div style={{fontSize:11,color:sub,marginTop:10}}>Removing someone keeps their past shifts.</div>}
        </div>
        {/* Pay summary — one card per person; tap to see each week */}
        {Object.keys(people).length>0&&(()=>{
          const total=payOf(monthHrs);
          return(
            <div style={{marginTop:14,background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,animation:"fadeUp 0.3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <span style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700}}>{MONTH_NAMES[month]} Pay</span>
                <span style={{fontSize:11,color:sub}}>${HOURLY_RATE}/hr · SS 6.2% · Medicare 1.45%</span>
              </div>
              <div style={{display:"flex",gap:8,margin:"10px 0 14px"}}>
                {[["Payroll",money(total.gross),text],["Hours",`${+monthHrs.toFixed(1)}h`,text],["Take-home",money(total.net),green]].map(([l,v,c])=>(
                  <div key={l} style={{flex:1,minWidth:0,background:"var(--surface-2)",borderRadius:10,padding:"9px 10px"}}>
                    <div style={{fontSize:10,color:sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
                    <div style={{fontSize:15,fontWeight:700,color:c,marginTop:2,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</div>
                  </div>
                ))}
              </div>
              {Object.entries(people).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,wk])=>{
                const m=payOf(wk.reduce((a,h)=>a+h,0)), open=openPay===name;
                const cols="minmax(0,1.1fr) repeat(4,minmax(0,1fr))";
                const Row=({label,p,strong})=>(
                  <div style={{display:"grid",gridTemplateColumns:cols,gap:4,alignItems:"baseline",fontSize:strong?12.5:12,fontWeight:strong?700:400,padding:"7px 0",borderTop:`1px solid ${border}`,opacity:p.h||strong?1:0.45}}>
                    <span style={{color:strong?text:sub,whiteSpace:"nowrap"}}>{label}<br/><span style={{fontSize:10,color:sub,fontWeight:400}}>{+p.h.toFixed(2)}h</span></span>
                    {p.h?<>
                      <span style={{...num,color:text}}>{money(p.gross)}</span>
                      <span style={{...num,color:red}}>−{p.ss.toFixed(2)}</span>
                      <span style={{...num,color:red}}>−{p.med.toFixed(2)}</span>
                      <span style={{...num,color:green}}>{money(p.net)}</span>
                    </>:<span style={{...num,gridColumn:"2 / -1",color:sub}}>No shifts</span>}
                  </div>
                );
                return(
                  <div key={name} style={{border:`1px solid ${open?nameColor(name,isDark?35:75):border}`,borderRadius:12,marginBottom:8,overflow:"hidden",transition:"border-color 0.2s"}}>
                    <button onClick={()=>setOpenPay(open?null:name)} aria-expanded={open}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 12px",minHeight:56,background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                      <span style={{width:32,height:32,borderRadius:"50%",background:nameColor(name,isDark?30:80),color:nameColor(name,isDark?80:25),fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{name[0].toUpperCase()}</span>
                      <span style={{flex:1,minWidth:0}}>
                        <span style={{display:"block",fontSize:15,fontWeight:600,color:text}}>{name}</span>
                        <span style={{display:"block",fontSize:11,color:sub}}>{+m.h.toFixed(1)}h · {money(m.gross)} gross</span>
                      </span>
                      <span style={{textAlign:"right"}}>
                        <span style={{display:"block",fontSize:15,fontWeight:700,color:green,fontVariantNumeric:"tabular-nums"}}>{money(m.net)}</span>
                        <span style={{display:"block",fontSize:10,color:sub}}>take-home</span>
                      </span>
                      <span style={{color:sub,fontSize:12,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",marginLeft:2}}>▾</span>
                    </button>
                    {open&&(
                      <div style={{padding:"0 12px 12px",animation:"slideDown 0.2s ease"}}>
                        <div style={{display:"grid",gridTemplateColumns:cols,gap:4,fontSize:9.5,color:sub,textTransform:"uppercase",letterSpacing:"0.05em",paddingBottom:6}}>
                          <span>Week</span><span style={num}>Gross</span><span style={num}>SS</span><span style={num}>Med.</span><span style={num}>Net</span>
                        </div>
                        {weeks.map((w,wi)=><Row key={wi} label={w.first===w.last?`${mon} ${w.first}`:`${mon} ${w.first}–${w.last}`} p={payOf(wk[wi])}/>)}
                        <Row label="Month" p={m} strong/>
                        <div style={{marginTop:8,padding:"8px 10px",borderRadius:8,background:"var(--danger-soft)",fontSize:11.5,color:red,display:"flex",justifyContent:"space-between",gap:8}}>
                          <span>Withheld this month</span><span style={{fontWeight:700,fontVariantNumeric:"tabular-nums"}}>−{money(m.ss+m.med).slice(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{fontSize:10.5,color:sub,marginTop:6,lineHeight:1.5}}>Net is take-home after Social Security (SS) and Medicare. Weeks run Sunday–Saturday and only count days in {MONTH_NAMES[month]}. Income tax isn't included.</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
// ── CashPage ──────────────────────────────────────────────────────────────────
const DEFAULT_TAX_RATE=0.0323;
async function fetchTaxRate(){
  const {data}=await sb.from("app_settings").select("value").eq("key","tax_rate").single();
  return data?parseFloat(data.value):DEFAULT_TAX_RATE;
}
async function saveTaxRate(r){
  await sb.from("app_settings").upsert({key:"tax_rate",value:String(r)},{onConflict:"key"});
}

async function fetchStoreHours(){
  try{
    const {data}=await sb.from("app_settings").select("value").eq("key","store_hours").single();
    if(!data||!data.value||data.value==="null")return DEFAULT_HOURS;
    const parsed=JSON.parse(data.value);
    return Array.isArray(parsed)&&parsed.length>0?parsed:DEFAULT_HOURS;
  }catch{return DEFAULT_HOURS;}
}
async function saveStoreHours(h){
  await sb.from("app_settings").upsert({key:"store_hours",value:JSON.stringify(h)},{onConflict:"key"});
}
// Custom quick-time shifts [{label,start:"HH:MM",end:"HH:MM"}]; an empty list means "follow store hours"
async function fetchShiftPresetList(){
  try{
    const {data}=await sb.from("app_settings").select("value").eq("key","shift_presets").maybeSingle();
    const parsed=data?.value?JSON.parse(data.value):[];
    return Array.isArray(parsed)?parsed:[];
  }catch{return [];}
}
async function saveShiftPresetList(list){
  await sb.from("app_settings").upsert({key:"shift_presets",value:JSON.stringify(list)},{onConflict:"key"});
}

async function fetchActiveNotif(){
  const {data}=await sb.from("app_settings").select("value").eq("key","active_notif").single();
  if(!data||!data.value||data.value==="null")return null;
  try{return JSON.parse(data.value);}catch{return null;}
}
async function saveActiveNotif(n){
  await sb.from("app_settings").upsert({key:"active_notif",value:JSON.stringify(n)},{onConflict:"key"});
}
const DENOMINATIONS=[
  {label:"Pennies",     value:0.01},
  {label:"Nickels",     value:0.05},
  {label:"Dimes",       value:0.10},
  {label:"Quarters",    value:0.25},
  {label:"Half Dollars",value:0.50},
  {label:"$1 Coins",   value:1.00},
  {label:"$1 Bills",   value:1.00},
  {label:"$2 Bills",   value:2.00},
  {label:"$5 Bills",   value:5.00},
  {label:"$10 Bills",  value:10.00},
  {label:"$20 Bills",  value:20.00},
  {label:"$50 Bills",  value:50.00},
  {label:"$100 Bills", value:100.00},
];

function CashPage({isDark,taxRate=DEFAULT_TAX_RATE}){
  const [tab,setTab]=useState("calc");
  const [display,setDisplay]=useState("0");
  const [prev,setPrev]=useState(null);
  const [op,setOp]=useState(null);
  const [fresh,setFresh]=useState(true);
  const [counts,setCounts]=useState(Object.fromEntries(DENOMINATIONS.map((_,i)=>[i,0])));
  const [taxInput,setTaxInput]=useState("");
  const [taxMode,setTaxMode]=useState("add");
  const [changeTotal,setChangeTotal]=useState("");
  const [changeGiven,setChangeGiven]=useState("");

  const bg="var(--bg)";
  const card="var(--surface)";
  const border="var(--border)";
  const text="var(--text)";
  const sub="var(--muted)";
  const accent=isDark?"#f2c14e":"#a86f00";

  function calcPress(val){
    if(val==="C"){setDisplay("0");setPrev(null);setOp(null);setFresh(true);return;}
    if(val==="±"){setDisplay(d=>String(-parseFloat(d)));return;}
    if(val==="%"){setDisplay(d=>String(parseFloat(d)/100));return;}
    if(val==="⌫"){setDisplay(d=>d.length>1?d.slice(0,-1):"0");return;}
    if(["+","-","×","÷"].includes(val)){setPrev(parseFloat(display));setOp(val);setFresh(true);return;}
    if(val==="="){
      if(op&&prev!=null){
        const cur=parseFloat(display);
        const res=op==="+"?prev+cur:op==="-"?prev-cur:op==="×"?prev*cur:op==="÷"&&cur!==0?prev/cur:cur;
        setDisplay(String(parseFloat(res.toFixed(10))));setPrev(null);setOp(null);setFresh(true);
      }
      return;
    }
    if(val==="."){
      if(fresh){setDisplay("0.");setFresh(false);}
      else if(!display.includes("."))setDisplay(d=>d+".");
      return;
    }
    if(fresh){setDisplay(val);setFresh(false);}
    else setDisplay(d=>d==="0"?val:d+val);
  }

  const calcRows=[["C","±","%","÷"],["7","8","9","×"],["4","5","6","-"],["1","2","3","+"],["⌫","0",".","="]];
  const cashTotal=DENOMINATIONS.reduce((sum,d,i)=>sum+(counts[i]||0)*d.value,0);
  const taxAmt=taxInput?parseFloat(taxInput)*taxRate:0;
  const taxTotal=taxInput?parseFloat(taxInput)+(taxMode==="add"?taxAmt:-taxAmt):0;

  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:80,animation:"pageEnter 0.28s var(--ease-out)"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .calc-btn{transition:transform 0.08s ease;}
        .calc-btn:active{transform:scale(0.92);}
      `}</style>
      <PageHeader title="Cash Tools" icon="cash" accent={accent} isDark={isDark}>
        <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
          {[{id:"calc",label:"Calculator"},{id:"change",label:"Change"},{id:"cash",label:"Cash Counter"},{id:"tax",label:"Tax"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,minHeight:40,padding:"9px 14px",borderRadius:10,border:`1px solid ${tab===t.id?accent:border}`,background:tab===t.id?accent:"transparent",color:tab===t.id?"var(--brand-ink)":sub,fontSize:12,fontWeight:tab===t.id?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",whiteSpace:"nowrap"}}>{t.label}</button>
          ))}
        </div>
      </PageHeader>
      <div style={{padding:"16px"}}>

        {tab==="calc"&&(
          <div style={{animation:"fadeUp 0.2s ease"}}>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:"20px 20px 14px",marginBottom:12,textAlign:"right"}}>
              {op&&<div style={{fontSize:12,color:sub,marginBottom:2}}>{prev} {op}</div>}
              <div style={{fontSize:48,fontWeight:300,color:text,lineHeight:1,wordBreak:"break-all",minHeight:56}}>
                {display.length>10?parseFloat(display).toExponential(4):display}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {calcRows.flat().map(btn=>{
                const isOp=["+","-","×","÷"].includes(btn);
                const isEq=btn==="=";
                const isFn=["C","±","%","⌫"].includes(btn);
                return(
                  <button key={btn} className="calc-btn tap-btn" onClick={()=>calcPress(btn)} style={{
                    padding:"18px 0",borderRadius:14,border:"none",cursor:"pointer",
                    fontSize:isOp||isEq?22:18,fontWeight:isOp||isEq?700:400,fontFamily:"inherit",
                    background:isEq?accent:isOp?`${accent}22`:isFn?"var(--border)":card,
                    color:isEq?"#0f1117":isOp?accent:text,
                    border:`1px solid ${isEq?accent:isOp?`${accent}44`:border}`,
                    boxShadow:isEq?`0 4px 16px ${accent}44`:"none",
                  }}>{btn}</button>
                );
              })}
            </div>
          </div>
        )}

        {tab==="cash"&&(
          <div style={{animation:"fadeUp 0.2s ease"}}>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"16px 18px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>Total Cash</div>
                <div style={{fontSize:36,fontWeight:700,color:accent}}>${cashTotal.toFixed(2)}</div>
              </div>
              <button onClick={()=>setCounts(Object.fromEntries(DENOMINATIONS.map((_,i)=>[i,0])))} style={{padding:"8px 14px",background:"transparent",border:`1px solid ${border}`,borderRadius:10,color:sub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Clear All</button>
            </div>
            {DENOMINATIONS.map((d,i)=>(
              <div key={i} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:text}}>{d.label}</div>
                  <div style={{fontSize:11,color:sub}}>${d.value.toFixed(2)} each · <span style={{color:accent,fontWeight:600}}>${((counts[i]||0)*d.value).toFixed(2)}</span></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>setCounts(c=>({...c,[i]:Math.max(0,(c[i]||0)-1)}))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${border}`,background:"transparent",color:text,fontSize:18,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                  <input type="number" min="0" value={counts[i]||0} onChange={e=>setCounts(c=>({...c,[i]:Math.max(0,parseInt(e.target.value)||0)}))} style={{width:44,textAlign:"center",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:8,padding:"6px 4px",color:text,fontSize:14,fontFamily:"inherit"}}/>
                  <button onClick={()=>setCounts(c=>({...c,[i]:(c[i]||0)+1}))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${accent}44`,background:`${accent}11`,color:accent,fontSize:18,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="tax"&&(
          <div style={{animation:"fadeUp 0.2s ease"}}>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:12}}>
              <div style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Tax Rate</div>
              <div style={{fontSize:28,fontWeight:700,color:accent}}>{(taxRate*100).toFixed(2)}%</div>
              <div style={{fontSize:11,color:sub,marginTop:2}}>Current sales tax rate</div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[{id:"add",label:"+ Add Tax to Price"},{id:"remove",label:"− Remove Tax from Total"}].map(m=>(
                <button key={m.id} onClick={()=>setTaxMode(m.id)} style={{flex:1,padding:"9px 6px",borderRadius:10,border:`1px solid ${taxMode===m.id?accent:border}`,background:taxMode===m.id?`${accent}22`:"transparent",color:taxMode===m.id?accent:sub,fontSize:12,fontWeight:taxMode===m.id?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:12}}>
              <div style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{taxMode==="add"?"Pre-Tax Price ($)":"Total with Tax ($)"}</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22,color:sub}}>$</span>
                <input type="number" min="0" step="0.01" value={taxInput} onChange={e=>setTaxInput(e.target.value)} placeholder="0.00" style={{flex:1,minWidth:0,width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:10,padding:"12px 14px",color:text,fontSize:22,fontFamily:"inherit",fontWeight:300}}/>
              </div>
            </div>
            {taxInput&&!isNaN(parseFloat(taxInput))&&(
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:12,animation:"fadeUp 0.2s ease"}}>
                {[
                  {label:taxMode==="add"?"Pre-Tax Amount":"Total (with tax)",value:`$${parseFloat(taxInput).toFixed(2)}`,big:false},
                  {label:`Tax (${(taxRate*100).toFixed(2)}%)`,value:`$${Math.abs(taxAmt).toFixed(2)}`,big:false},
                  {label:taxMode==="add"?"Total with Tax":"Pre-Tax Amount",value:`$${Math.abs(taxTotal).toFixed(2)}`,big:true},
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<2?`1px solid ${border}`:"none"}}>
                    <span style={{fontSize:13,color:row.big?text:sub}}>{row.label}</span>
                    <span style={{fontSize:row.big?22:16,fontWeight:row.big?700:400,color:row.big?accent:text}}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16}}>
              <div style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Quick Reference</div>
              {[1,5,10,20,50,100].map(amt=>(
                <div key={amt} onClick={()=>setTaxInput(String(amt))} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${border}`,cursor:"pointer"}}>
                  <span style={{fontSize:13,color:sub}}>${amt}.00</span>
                  <span style={{fontSize:13,color:text}}>+${(amt*taxRate).toFixed(2)} tax</span>
                  <span style={{fontSize:13,fontWeight:700,color:accent}}>${(amt*(1+taxRate)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Change Calculator ── */}
        {tab==="change"&&(
          <div style={{animation:"fadeUp 0.2s ease"}}>
            {/* Inputs */}
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:12}}>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Sale Total ($)</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20,color:sub}}>$</span>
                  <input type="number" min="0" step="0.01" value={changeTotal}
                    onChange={e=>setChangeTotal(e.target.value)}
                    placeholder="0.00"
                    style={{flex:1,minWidth:0,width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:10,padding:"12px 14px",color:text,fontSize:22,fontFamily:"inherit",fontWeight:300}}/>
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:sub,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Amount Given ($)</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20,color:sub}}>$</span>
                  <input type="number" min="0" step="0.01" value={changeGiven}
                    onChange={e=>setChangeGiven(e.target.value)}
                    placeholder="0.00"
                    style={{flex:1,minWidth:0,width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:10,padding:"12px 14px",color:text,fontSize:22,fontFamily:"inherit",fontWeight:300}}/>
                </div>
              </div>
            </div>

            {/* Quick "given" buttons */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {[1,5,10,20,50,100].map(amt=>(
                <button key={amt} onClick={()=>setChangeGiven(String(amt))}
                  style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${border}`,background:parseFloat(changeGiven)===amt?accent:"transparent",color:parseFloat(changeGiven)===amt?"var(--brand-ink)":sub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.12s"}}>
                  ${amt}
                </button>
              ))}
            </div>

            {/* Result */}
            {(()=>{
              const total=parseFloat(changeTotal);
              const given=parseFloat(changeGiven);
              if(!changeTotal||!changeGiven||isNaN(total)||isNaN(given)) return(
                <div style={{textAlign:"center",color:sub,padding:"30px 20px",background:card,border:`1px solid ${border}`,borderRadius:14}}>
                  <div style={{fontSize:28,marginBottom:8}}>💰</div>
                  <div style={{fontSize:13}}>Enter the sale total and amount given</div>
                </div>
              );
              if(given<total) return(
                <div style={{background:"#2e1a1a",border:"1px solid #5a2a2a",borderRadius:14,padding:16,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"#e74c3c",marginBottom:4}}>Not Enough</div>
                  <div style={{fontSize:13,color:"#e07070"}}>Customer is ${(total-given).toFixed(2)} short</div>
                </div>
              );
              const changeDue=Math.round((given-total)*100)/100;
              if(changeDue===0) return(
                <div style={{background:"var(--success-soft)",border:`1px solid ${"var(--success-soft)"}`,borderRadius:14,padding:16,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"#27ae60",marginBottom:4}}>✓ Exact Change</div>
                  <div style={{fontSize:13,color:sub}}>No change needed</div>
                </div>
              );
              // Break into denominations (largest first, prefer fewer bills)
              const breakDown=[
                {label:"$100 Bills", value:100.00},
                {label:"$50 Bills",  value:50.00},
                {label:"$20 Bills",  value:20.00},
                {label:"$10 Bills",  value:10.00},
                {label:"$5 Bills",   value:5.00},
                {label:"$1 Bills",   value:1.00},
                {label:"Quarters",   value:0.25},
                {label:"Dimes",      value:0.10},
                {label:"Nickels",    value:0.05},
                {label:"Pennies",    value:0.01},
              ];
              const result=[];
              let remaining=Math.round(changeDue*100);
              breakDown.forEach(d=>{
                const count=Math.floor(remaining/Math.round(d.value*100));
                if(count>0){
                  result.push({...d,count});
                  remaining-=count*Math.round(d.value*100);
                }
              });
              return(
                <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,overflow:"hidden",animation:"fadeUp 0.2s ease"}}>
                  {/* Change due header */}
                  <div style={{background:`${accent}18`,borderBottom:`1px solid ${accent}33`,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:13,color:sub}}>Change Due</div>
                    <div style={{fontSize:32,fontWeight:700,color:accent}}>${changeDue.toFixed(2)}</div>
                  </div>
                  {/* Breakdown */}
                  {result.map((d,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:i<result.length-1?`1px solid ${border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,borderRadius:10,background:`${accent}18`,border:`1px solid ${accent}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontSize:14,fontWeight:700,color:accent}}>{d.count}</span>
                        </div>
                        <span style={{fontSize:14,color:text}}>{d.label}</span>
                      </div>
                      <span style={{fontSize:13,color:sub}}>${(d.count*d.value).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Clear button */}
            {(changeTotal||changeGiven)&&(
              <button onClick={()=>{setChangeTotal("");setChangeGiven("");}}
                style={{width:"100%",marginTop:12,padding:11,background:"transparent",border:`1px solid ${border}`,borderRadius:10,color:sub,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Clear
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── ChecklistsPage ────────────────────────────────────────────────────────────
function loadChecklists(){try{const s=localStorage.getItem("checklists");return s?JSON.parse(s):[];}catch{return[];}}
function saveChecklists(cl){try{localStorage.setItem("checklists",JSON.stringify(cl));}catch{}}

function ChecklistsPage({isDev,isDark,onUnlock}){
  const [lists,setLists]=useState(loadChecklists);
  const [focusList,setFocusList]=useState(null); // index
  const [showNewForm,setShowNewForm]=useState(false);
  const [newTitle,setNewTitle]=useState("");
  const [newItem,setNewItem]=useState("");

  const bg="var(--bg)";
  const card="var(--surface)";
  const border="var(--border)";
  const text="var(--text)";
  const sub="var(--muted)";
  const accent=isDark?"#8b91ff":"#4f56d6";

  function persist(updated){setLists(updated);saveChecklists(updated);}

  function createList(){
    if(!newTitle.trim())return;
    persist([...lists,{id:Date.now(),title:newTitle.trim(),items:[]}]);
    setNewTitle("");setShowNewForm(false);
  }

  function deleteList(idx){persist(lists.filter((_,i)=>i!==idx));}

  function addItem(listIdx){
    if(!newItem.trim())return;
    const updated=lists.map((l,i)=>i===listIdx?{...l,items:[...l.items,{id:Date.now(),text:newItem.trim(),done:false}]}:l);
    persist(updated);setNewItem("");
  }

  function toggleItem(listIdx,itemId){
    const updated=lists.map((l,i)=>i===listIdx?{...l,items:l.items.map(it=>it.id===itemId?{...it,done:!it.done}:it)}:l);
    persist(updated);
  }

  function deleteItem(listIdx,itemId){
    const updated=lists.map((l,i)=>i===listIdx?{...l,items:l.items.filter(it=>it.id!==itemId)}:l);
    persist(updated);
  }

  function resetChecks(listIdx){
    const updated=lists.map((l,i)=>i===listIdx?{...l,items:l.items.map(it=>({...it,done:false}))}:l);
    persist(updated);
  }

  // ── Detail view ──────────────────────────────────────────────────────────────
  if(focusList!==null){
    const list=lists[focusList];
    if(!list){setFocusList(null);return null;}
    const done=list.items.filter(i=>i.done).length;
    const pct=list.items.length?Math.round(done/list.items.length*100):0;
    return(
      <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:80,animation:"pageEnter 0.28s var(--ease-out)"}}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{background:"var(--bg)",borderBottom:`1px solid ${border}`,padding:"16px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setFocusList(null)} style={{background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:text,fontFamily:"inherit",flexShrink:0}}>←</button>
            <div style={{flex:1}}>
              <div style={{fontSize:18,fontWeight:700,color:accent}}>{list.title}</div>
              <div style={{fontSize:11,color:sub}}>{done}/{list.items.length} complete</div>
            </div>
            {isDev&&<button onClick={()=>resetChecks(focusList)} style={{fontSize:11,padding:"5px 10px",background:"transparent",border:`1px solid ${border}`,borderRadius:8,color:sub,cursor:"pointer",fontFamily:"inherit"}}>Reset</button>}
          </div>
          {list.items.length>0&&(
            <div style={{marginTop:10}}>
              <div style={{height:4,background:"var(--border)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#27ae60":accent,borderRadius:4,transition:"width 0.3s ease"}}/>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"14px"}}>
          {list.items.length===0&&(
            <div style={{textAlign:"center",color:sub,padding:"40px 20px"}}>
              <span style={EMPTY_ICON}><Icon name="list" size={26}/></span>
              <div style={{fontSize:14}}>{isDev?"Add items below to build this checklist.":"No items yet."}</div>
            </div>
          )}
          {list.items.map((item,i)=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:card,border:`1px solid ${item.done?accent+"33":border}`,borderRadius:12,marginBottom:8,animation:`fadeUp 0.2s ease ${i*0.04}s both`,transition:"border-color 0.2s"}}>
              <button onClick={()=>toggleItem(focusList,item.id)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${item.done?accent:sub}`,background:item.done?accent:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                {item.done&&<span style={{color:"var(--brand-ink)",fontSize:14,fontWeight:900}}>✓</span>}
              </button>
              <span style={{flex:1,fontSize:14,color:item.done?sub:text,textDecoration:item.done?"line-through":"none",transition:"all 0.2s"}}>{item.text}</span>
              {isDev&&<button aria-label="Delete" onClick={()=>deleteItem(focusList,item.id)} className="press" style={{width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",borderRadius:10,color:"var(--faint)",cursor:"pointer"}}><Icon name="trash" size={17}/></button>}
            </div>
          ))}
          {isDev&&(
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem(focusList)}
                placeholder="Add item…"
                style={{flex:1,background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:10,padding:"10px 14px",color:text,fontSize:14,fontFamily:"inherit"}}/>
              <button onClick={()=>addItem(focusList)} style={{padding:"10px 16px",background:accent,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:80,animation:"pageEnter 0.28s var(--ease-out)"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <PageHeader title="Checklists" icon="list" accent={accent} isDark={isDark}
        action={isDev&&<HeaderAction on={showNewForm} onClick={()=>setShowNewForm(v=>!v)} accent={accent} isDark={isDark}>+ New List</HeaderAction>}/>
      <div style={{padding:"14px"}}>
        {showNewForm&&(
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:14,animation:"slideDown 0.2s ease"}}>
            <div style={{fontSize:11,color:sub,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>List Title</div>
            <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createList()}
              placeholder="e.g. Closing Checklist"
              style={{width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:10,padding:"10px 14px",color:text,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:10}}/>
            <button onClick={createList} className="tap-btn" style={{width:"100%",padding:11,background:accent,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Create Checklist</button>
          </div>
        )}
        {lists.length===0&&!showNewForm&&(
          <div style={{textAlign:"center",color:sub,padding:"60px 20px"}}>
            <span style={EMPTY_ICON}><Icon name="list" size={26}/></span>
            <div style={{fontSize:16,fontWeight:600,color:"var(--text)",marginBottom:6}}>No checklists yet</div>
            <div style={{fontSize:13}}>{isDev?"Tap + New List to create one":"No checklists have been created yet"}</div>
          </div>
        )}
        {lists.map((list,idx)=>{
          const done=list.items.filter(i=>i.done).length;
          const pct=list.items.length?Math.round(done/list.items.length*100):0;
          return(
            <div key={list.id} onClick={()=>setFocusList(idx)}
              style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,cursor:"pointer",animation:`fadeUp 0.22s ease ${idx*0.06}s both`,position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:list.items.length?8:0}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:text}}>{list.title}</div>
                  <div style={{fontSize:11,color:sub,marginTop:1}}>{list.items.length} item{list.items.length!==1?"s":""}{list.items.length>0&&` · ${done} done`}</div>
                </div>
                {isDev&&<button aria-label="Delete" onClick={e=>{e.stopPropagation();deleteList(idx);}} className="press" style={{width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",borderRadius:10,color:"var(--faint)",cursor:"pointer"}}><Icon name="trash" size={17}/></button>}
                <span style={{color:sub,fontSize:16}}>›</span>
              </div>
              {list.items.length>0&&(
                <div style={{height:3,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#27ae60":accent,borderRadius:3,transition:"width 0.3s"}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ── SuggestionsPage ───────────────────────────────────────────────────────────
function SuggestionsPage({isDark,isManager,isDev}){
  const [suggestions,setSuggestions]=useState([]);
  const [form,setForm]=useState({title:"",description:"",category:"Feature"});
  const [showForm,setShowForm]=useState(false);
  const [loading,setLoading]=useState(true);

  const bg="var(--bg)";
  const card="var(--surface)";
  const border="var(--border)";
  const text="var(--text)";
  const sub="var(--muted)";
  const accent=isDark?"#8b91ff":"#4f56d6";

  useEffect(()=>{
    sb.from("suggestions").select("*").order("id",{ascending:false})
      .then(({data})=>{if(data)setSuggestions(data);setLoading(false);})
      .catch(()=>setLoading(false));
  },[]);

  async function submit(){
    if(!form.title.trim())return;
    const row={title:form.title.trim(),description:form.description.trim(),category:form.category,created_at:new Date().toISOString(),votes:0};
    const {data}=await sb.from("suggestions").insert(row).select().single();
    if(data){setSuggestions(prev=>[data,...prev]);}
    setForm({title:"",description:"",category:"Feature"});setShowForm(false);
  }

  function hasVoted(id){try{const v=JSON.parse(localStorage.getItem("voted_suggestions")||"[]");return v.includes(id);}catch{return false;}}
  function markVoted(id){try{const v=JSON.parse(localStorage.getItem("voted_suggestions")||"[]");localStorage.setItem("voted_suggestions",JSON.stringify([...v,id]));}catch{}}
  async function vote(id){
    if(hasVoted(id))return;
    const s=suggestions.find(s=>s.id===id);
    if(!s)return;
    await sb.from("suggestions").update({votes:(s.votes||0)+1}).eq("id",id);
    setSuggestions(prev=>prev.map(s=>s.id===id?{...s,votes:(s.votes||0)+1}:s));
    markVoted(id);
  }
  async function deleteSuggestion(id){
    await sb.from("suggestions").delete().eq("id",id);
    setSuggestions(prev=>prev.filter(s=>s.id!==id));
  }

  const cats=["Feature","Improvement","Other"];

  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:80,animation:"pageEnter 0.28s var(--ease-out)"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <PageHeader title="Suggestions" icon="idea" accent={accent} isDark={isDark}
        action={<HeaderAction on={showForm} onClick={()=>setShowForm(v=>!v)} accent={accent} isDark={isDark}>+ Suggest</HeaderAction>}/>
      <div style={{padding:"14px"}}>
        {showForm&&(
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:14,animation:"slideDown 0.2s ease"}}>
            <div style={{fontSize:11,color:sub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Title</div>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="What would you like to see?" style={{width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:8,padding:"9px 12px",color:text,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",marginBottom:10}}/>
            <div style={{fontSize:11,color:sub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Details <span style={{opacity:0.5,fontWeight:400,textTransform:"none"}}>— optional</span></div>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the idea..." style={{width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:8,padding:"9px 12px",color:text,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",minHeight:60,resize:"none",lineHeight:1.4,marginBottom:10}}/>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {cats.map(cat=>(
                <button key={cat} onClick={()=>setForm(f=>({...f,category:cat}))} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${form.category===cat?accent:border}`,background:form.category===cat?`${accent}22`:"transparent",color:form.category===cat?accent:sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.12s"}}>{cat}</button>
              ))}
            </div>
            <button onClick={submit} style={{width:"100%",padding:11,background:accent,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Submit Suggestion</button>
          </div>
        )}
        {loading&&<div style={{textAlign:"center",color:sub,padding:40}}>Loading…</div>}
        {!loading&&suggestions.length===0&&!showForm&&(
          <div style={{textAlign:"center",color:sub,padding:"50px 20px"}}>
            <span style={EMPTY_ICON}><Icon name="idea" size={26}/></span>
            <div style={{fontSize:15,fontWeight:600,color:text,marginBottom:4}}>No suggestions yet</div>
            <div style={{fontSize:13}}>Be the first to suggest a feature!</div>
          </div>
        )}
        {suggestions.map((s,i)=>{
          const catColor={Feature:accent,Improvement:"#27ae60",Bug:"#e74c3c",Other:"#f0c040"}[s.category]||sub;
          return(
            <div key={s.id} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:"12px 14px",marginBottom:10,animation:`fadeUp 0.2s ease ${i*0.04}s both`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <button onClick={()=>vote(s.id)} disabled={hasVoted(s.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:hasVoted(s.id)?`${accent}18`:"var(--surface-2)",border:`1px solid ${hasVoted(s.id)?accent:border}`,borderRadius:8,padding:"6px 8px",cursor:hasVoted(s.id)?"default":"pointer",minWidth:36,flexShrink:0,transition:"all 0.15s"}}>
                  <span style={{fontSize:12,color:hasVoted(s.id)?accent:"inherit"}}>▲</span>
                  <span style={{fontSize:12,fontWeight:700,color:hasVoted(s.id)?accent:text}}>{s.votes||0}</span>
                </button>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:700,color:text}}>{s.title}</span>
                    <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:`${catColor}22`,color:catColor,border:`1px solid ${catColor}44`}}>{s.category}</span>
                  </div>
                  {s.description&&<div style={{fontSize:12,color:sub,lineHeight:1.4,marginBottom:3}}>{s.description}</div>}
                  <div style={{fontSize:10,color:sub}}>{fmtDate(s.created_at)}</div>
                </div>
                {isDev&&<button aria-label="Delete" onClick={()=>deleteSuggestion(s.id)} className="press" style={{width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",borderRadius:10,color:"var(--faint)",cursor:"pointer"}}><Icon name="trash" size={17}/></button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── UpdateLogPage ─────────────────────────────────────────────────────────────
function UpdateLogPage({isDark,isDev}){
  const [logs,setLogs]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({version:"",title:"",notes:""});
  const [loading,setLoading]=useState(true);

  const bg="var(--bg)";
  const card="var(--surface)";
  const border="var(--border)";
  const text="var(--text)";
  const sub="var(--muted)";
  const accent=isDark?"#f2c14e":"#a86f00";

  useEffect(()=>{
    sb.from("update_logs").select("*").order("id",{ascending:false})
      .then(({data})=>{if(data)setLogs(data);setLoading(false);})
      .catch(()=>setLoading(false));
  },[]);

  async function addLog(){
    if(!form.title.trim())return;
    const row={version:form.version.trim()||null,title:form.title.trim(),notes:form.notes.trim(),created_at:new Date().toISOString()};
    const {data}=await sb.from("update_logs").insert(row).select().single();
    if(data)setLogs(prev=>[data,...prev]);
    setForm({version:"",title:"",notes:""});setShowForm(false);
  }

  async function deleteLog(id){
    await sb.from("update_logs").delete().eq("id",id);
    setLogs(prev=>prev.filter(l=>l.id!==id));
  }

  return(
    <div style={{minHeight:"100vh",background:bg,fontFamily:"var(--font)",paddingBottom:80,animation:"pageEnter 0.28s var(--ease-out)"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <PageHeader title="Update Log" icon="log" accent={accent} isDark={isDark}
        action={isDev&&<HeaderAction on={showForm} onClick={()=>setShowForm(v=>!v)} accent={accent} isDark={isDark} ink="var(--brand-ink)">+ Add Update</HeaderAction>}/>
      <div style={{padding:"14px"}}>
        {isDev&&showForm&&(
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:14,animation:"slideDown 0.2s ease"}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div style={{flex:"0 0 90px"}}>
                <div style={{fontSize:11,color:sub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Version</div>
                <input value={form.version} onChange={e=>setForm(f=>({...f,version:e.target.value}))} placeholder="v1.2" style={{width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:8,padding:"8px 10px",color:text,fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:sub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Title</div>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="What changed?" style={{width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:8,padding:"8px 10px",color:text,fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{fontSize:11,color:sub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Notes <span style={{opacity:0.5,fontWeight:400,textTransform:"none"}}>— optional</span></div>
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Details of what was added, fixed, or changed..." style={{width:"100%",background:"var(--surface-2)",border:`1px solid ${border}`,borderRadius:8,padding:"9px 12px",color:text,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",minHeight:80,resize:"none",lineHeight:1.5,marginBottom:10}}/>
            <button onClick={addLog} style={{width:"100%",padding:11,background:accent,border:"none",borderRadius:10,color:"var(--brand-ink)",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Post Update</button>
          </div>
        )}
        {loading&&<div style={{textAlign:"center",color:sub,padding:40}}>Loading…</div>}
        {!loading&&logs.length===0&&!showForm&&(
          <div style={{textAlign:"center",color:sub,padding:"50px 20px"}}>
            <span style={EMPTY_ICON}><Icon name="log" size={26}/></span>
            <div style={{fontSize:15,fontWeight:600,color:"var(--text)",marginBottom:4}}>No updates posted yet</div>
            {isDev&&<div style={{fontSize:13}}>Tap + Add Update to post the first one</div>}
          </div>
        )}
        {logs.map((log,i)=>(
          <div key={log.id} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"14px 16px",marginBottom:12,animation:`fadeUp 0.2s ease ${i*0.05}s both`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  {log.version&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:`${accent}22`,color:accent,border:`1px solid ${accent}44`,fontWeight:700}}>{log.version}</span>}
                  <span style={{fontSize:14,fontWeight:700,color:text}}>{log.title}</span>
                </div>
                {log.notes&&<div style={{fontSize:13,color:sub,lineHeight:1.6,whiteSpace:"pre-line"}}>{log.notes}</div>}
                <div style={{fontSize:10,color:sub,marginTop:6}}>{fmtDate(log.created_at)}</div>
              </div>
              {isDev&&<button aria-label="Delete" onClick={()=>deleteLog(log.id)} className="press" style={{width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",borderRadius:10,color:"var(--faint)",cursor:"pointer"}}><Icon name="trash" size={17}/></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── BottomNav — morphing pill + More tray ────────────────────────────────────
function BottomNav({page,setPage,activeCategoryTheme,isDark,onMoreOpen}){
  const tabs=[
    {id:"pricing",label:"Pricing",icon:"tag"},
    {id:"schedule",label:"Schedule",icon:"calendar"},
    {id:"cash",label:"Cash",icon:"cash"},
    {id:"checklists",label:"Lists",icon:"list"},
    {id:"more",label:"More",icon:"grid"},
  ];
  const moreActive=["suggestions","updates","bugs","dev"].includes(page);
  const idx=moreActive?4:Math.max(0,tabs.findIndex(t=>t.id===page));
  return(
    <nav aria-label="Main" style={{position:"fixed",left:"50%",transform:"translateX(-50%)",bottom:0,width:"100%",maxWidth:480,zIndex:150,
      padding:"0 10px calc(10px + env(safe-area-inset-bottom))",pointerEvents:"none"}}>
      <div style={{position:"relative",display:"grid",gridTemplateColumns:"repeat(5,1fr)",padding:5,borderRadius:22,pointerEvents:"auto",
        background:"var(--glass)",backdropFilter:"saturate(1.5) blur(18px)",WebkitBackdropFilter:"saturate(1.5) blur(18px)",
        border:"1px solid var(--border)",boxShadow:"var(--shadow-lg)"}}>
        {/* active pill */}
        <div aria-hidden style={{position:"absolute",top:5,bottom:5,left:5,width:"calc((100% - 10px) / 5)",borderRadius:17,
          background:"var(--brand-soft)",transform:`translateX(${idx*100}%)`,transition:"transform .38s var(--ease-out)"}}/>
        {tabs.map((t,i)=>{
          const on=i===idx;
          return(
            <button key={t.id} aria-label={t.label} aria-current={on?"page":undefined} className="press"
              onClick={()=>t.id==="more"?onMoreOpen():setPage(t.id)}
              style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
                height:52,background:"none",border:"none",cursor:"pointer",color:on?"var(--brand)":"var(--muted)",transition:"color .25s var(--ease)"}}>
              <Icon name={t.icon} size={21} stroke={on?2.3:1.9}/>
              <span style={{fontSize:10.5,fontWeight:on?700:500,letterSpacing:"0.01em"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── More tray ─────────────────────────────────────────────────────────────────
function Sheet({onClose,children,label}){
  // bottom sheet: dims the page, slides up, closes on backdrop tap or Escape
  useEffect(()=>{const k=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k);},[onClose]);
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"var(--overlay)",zIndex:300,animation:"fadeIn .25s var(--ease)"}}/>
      <div role="dialog" aria-label={label} style={{position:"fixed",left:"50%",bottom:0,width:"100%",maxWidth:480,zIndex:301,
        transform:"translateX(-50%)",maxHeight:"90vh",overflowY:"auto",background:"var(--surface)",borderRadius:"24px 24px 0 0",
        boxShadow:"var(--shadow-lg)",padding:"10px 16px calc(24px + env(safe-area-inset-bottom))",animation:"sheetUp .42s var(--ease-out)"}}>
        <div style={{width:40,height:5,borderRadius:3,background:"var(--border-strong)",margin:"0 auto 14px"}}/>
        {children}
      </div>
    </>
  );
}

function MoreTray({open,onClose,page,setPage,isDark,isDev}){
  if(!open)return null;
  const items=[
    {id:"suggestions",label:"Ideas & Suggestions",icon:"idea",desc:"Suggest a feature",tone:isDark?"#f2c14e":"#a86f00"},
    {id:"updates",label:"Update Log",icon:"log",desc:"What's new",tone:isDark?"#4fd18b":"#1d8048"},
    {id:"bugs",label:"Bug Reports",icon:"bug",desc:"Report a problem",tone:isDark?"#f07373":"#cf3d3d"},
  ];
  if(isDev)items.push({id:"dev",label:"Developer Console",icon:"terminal",desc:"Settings & tools",tone:isDark?"#4cc3e0":"#0b7790"});
  return(
    <Sheet onClose={onClose} label="More">
      <div style={{fontSize:13,fontWeight:600,color:"var(--muted)",margin:"0 4px 10px"}}>More</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {items.map((it,k)=>{
          const on=page===it.id;
          return(
            <button key={it.id} onClick={()=>{setPage(it.id);onClose();}} className="press"
              style={{textAlign:"left",padding:14,borderRadius:16,cursor:"pointer",minHeight:104,display:"flex",flexDirection:"column",justifyContent:"space-between",gap:10,
                background:on?`${it.tone}14`:"var(--surface-2)",border:`1px solid ${on?it.tone+"55":"var(--border)"}`,
                animation:`fadeUp .35s var(--ease-out) ${k*0.04}s both`}}>
              <span style={{width:36,height:36,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",background:`${it.tone}1f`,color:it.tone}}><Icon name={it.icon} size={19}/></span>
              <span>
                <span style={{display:"block",fontSize:14,fontWeight:600,color:"var(--text)"}}>{it.label}</span>
                <span style={{display:"block",fontSize:12,color:"var(--muted)",marginTop:2}}>{it.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}


// ── Root App ──────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("pricing");
  const [selectedCategory,setSelectedCategory]=useState(null);
  const [scrollToItem,setScrollToItem]=useState(null);
  const [items,setItems]=useState([]);
  const [isDev,setIsDev]=useState(()=>{try{return sessionStorage.getItem("isDev")==="true";}catch{return false;}});
  const [isManager,setIsManager]=useState(()=>{try{return sessionStorage.getItem("isManager")==="true";}catch{return false;}});
  const [showPinModal,setShowPinModal]=useState(false);
  const [pinInput,setPinInput]=useState("");
  const [pinError,setPinError]=useState(false);
  const [isDark,setIsDark]=useState(()=>loadTheme()==="dark");
  useEffect(()=>{
    document.documentElement.dataset.theme=isDark?"dark":"light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",isDark?"#0e1014":"#f5f5f1");
  },[isDark]);
  const [auditLog,setAuditLog]=useState(()=>{try{const s=localStorage.getItem("audit_log");return s?JSON.parse(s):[];}catch{return[];}});
  const [taxRate,setTaxRate]=useState(DEFAULT_TAX_RATE);
  const [loading,setLoading]=useState(true);
  const [managerDisabled,setManagerDisabled]=useState(false);
  const [showMgrDisabledModal,setShowMgrDisabledModal]=useState(false);
  const [storeHours,setStoreHours]=useState(DEFAULT_HOURS);
  const [presetList,setPresetList]=useState([]);
  const [activeNotif,setActiveNotif]=useState(null);
  const [showMore,setShowMore]=useState(false);
  const [layout,setLayout]=useState(DEFAULT_LAYOUT);
  useEffect(()=>{document.title="Gil's Grocery";},[]);

  // Load items and settings from Supabase on mount
  useEffect(()=>{
    async function init(){
      try{
        const {data:itemData}=await sb.from("items").select("*").order("name");
        if(itemData&&itemData.length>0){
          setItems(itemData.map(row=>({
            id:row.id, name:row.name, category:row.category,
            subcategory:row.subcategory||"", price:parseFloat(row.price),
            location:row.location||"", notes:row.notes||"",
            inventory:row.inventory??null, outOfStock:row.out_of_stock||false,
            mapZone:row.map_zone||null, expiryDate:row.expiry_date||"",
            packSize:row.pack_size||null, containerType:row.container_type||null,
            deposit:row.deposit!=null?parseFloat(row.deposit):null,
            wineType:row.wine_type||null,
            dayPrices:parseDayPrices(row.day_prices),
            gilliesRecommendation:row.gillies_recommendation||false,
          })));
        }
        const rate=await fetchTaxRate();
        setTaxRate(rate);
        // Load managerDisabled
        const {data:md}=await sb.from("app_settings").select("value").eq("key","manager_disabled").single();
        if(md)setManagerDisabled(md.value==="true");
        // Load store hours
        const hours=await fetchStoreHours();
        setStoreHours(hours);
        setPresetList(await fetchShiftPresetList());
        // Store layout saved by the dev Store Builder (falls back to the built-in map)
        try{
          const {data:lay}=await sb.from("app_settings").select("value").eq("key","store_layout").maybeSingle();
          const l=lay&&lay.value?JSON.parse(lay.value):null;
          if(l&&l.size&&Array.isArray(l.zones)&&l.zones.length)setLayout({size:l.size,zones:l.zones,walls:Array.isArray(l.walls)?l.walls:[]});
        }catch(layEx){console.warn("store_layout not loaded:",layEx);}
        // New year check — delete all shifts from previous years
        const storedYear=parseInt(localStorage.getItem("shifts_year")||"0");
        const thisYear=new Date().getFullYear();
        if(storedYear!==0&&storedYear!==thisYear){
          await sb.from("schedule_shifts").delete().neq("id",0);
          localStorage.setItem("shifts_year",String(thisYear));
        } else if(storedYear===0){
          localStorage.setItem("shifts_year",String(thisYear));
        }
        // Load active notification
        const notif=await fetchActiveNotif();
        if(notif&&notif.expiresAt&&new Date(notif.expiresAt)>new Date()){
          setActiveNotif(notif);
        } else if(notif&&!notif.expiresAt){
          setActiveNotif(notif); // permanent until deleted
        }
      }catch(e){console.error("Init error:",e);}
      finally{setLoading(false);}
    }
    init();
  },[]);
  // Lifted welcome refs so they survive navigation back to home
  const hasShownWelcomeRef=useRef({dev:false,manager:false});

  const MANAGER_PIN="3018",DEV_PIN="130654";

  function addAuditEntry(entry){
    setAuditLog(prev=>{
      const snap=entry.snapshot?{
        id:entry.snapshot.id,name:entry.snapshot.name,category:entry.snapshot.category,
        subcategory:entry.snapshot.subcategory,price:entry.snapshot.price,
        location:entry.snapshot.location,notes:entry.snapshot.notes,
        inventory:entry.snapshot.inventory,outOfStock:entry.snapshot.outOfStock,
        mapZone:entry.snapshot.mapZone,expiryDate:entry.snapshot.expiryDate,
        packSize:entry.snapshot.packSize,containerType:entry.snapshot.containerType,
        deposit:entry.snapshot.deposit,wineType:entry.snapshot.wineType,
        gilliesRecommendation:entry.snapshot.gilliesRecommendation,
      }:null;
      const serialized={...entry,timestamp:entry.timestamp instanceof Date?entry.timestamp.toISOString():entry.timestamp,snapshot:snap};
      const next=[serialized,...prev].slice(0,10);
      try{localStorage.setItem("audit_log",JSON.stringify(next));}catch{}
      return next;
    });
  }

  function submitPin(){
    if(managerDisabled&&pinInput===MANAGER_PIN){setPinError(true);setPinInput("");return;}
    if(pinInput===MANAGER_PIN||pinInput===DEV_PIN){
      setIsManager(true);
      if(pinInput===DEV_PIN)setIsDev(true);
      try{sessionStorage.setItem("isManager","true");if(pinInput===DEV_PIN)sessionStorage.setItem("isDev","true");}catch{}
      setShowPinModal(false);setPinInput("");setPinError(false);
    } else {setPinError(true);setPinInput("");}
  }  function logout(){
    setIsManager(false);setIsDev(false);
    try{sessionStorage.removeItem("isManager");sessionStorage.removeItem("isDev");}catch{}
    hasShownWelcomeRef.current={dev:false,manager:false};
  }
  function toggleTheme(){setIsDark(v=>{try{localStorage.setItem(THEME_KEY,v?"light":"dark");}catch{}return!v;});}

  const activeCatTheme=selectedCategory?.theme||null;
  // How many px of fixed banners are showing at top
  const bannerRef=useRef(null);
  const [bannerOffset,setBannerOffset]=useState(0);
  useEffect(()=>{
    const el=bannerRef.current;if(!el||typeof ResizeObserver==="undefined")return;
    const ro=new ResizeObserver(()=>setBannerOffset(el.offsetHeight));ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  // a new page or category always starts at the top (unless jumping to a searched item)
  useEffect(()=>{if(!scrollToItem)window.scrollTo(0,0);},[page,selectedCategory?.key]);
  const bugsT={accent:isDark?"#8b91ff":"#4f56d6",accentText:"#fff",card:"var(--surface)",border:"var(--border)",sub:"var(--muted)",inputBg:"var(--surface-2)",inputBorder:"var(--border)"};

  async function saveLayout(l){
    const {error}=await sb.from("app_settings").upsert({key:"store_layout",value:JSON.stringify(l)},{onConflict:"key"});
    if(error)throw error;
    setLayout(l);
  }
  function handlePageChange(p){setPage(p);if(p!=="pricing")setSelectedCategory(null);}

  return(
    <LayoutCtx.Provider value={layout}>
    <div style={{maxWidth:480,margin:"0 auto",position:"relative"}}>
      <style>{`
        @keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes popInWobble{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes bannerSlide{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes pageEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes staggerFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadTextIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floorFlash{0%{opacity:1}40%{opacity:0.4}100%{opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        @keyframes sheetUp{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .press,.tap-btn{transition:transform .18s var(--ease),background-color .2s var(--ease),border-color .2s var(--ease),color .2s var(--ease),box-shadow .2s var(--ease),opacity .2s var(--ease);}
        .press:active,.tap-btn:active{transform:scale(.97);}
        @media (hover:hover){.lift{transition:transform .22s var(--ease),box-shadow .22s var(--ease),border-color .22s var(--ease);}.lift:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg);}}
        .field{width:100%;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:11px 13px;color:var(--text);font-size:15px;transition:border-color .2s var(--ease),box-shadow .2s var(--ease),background-color .2s var(--ease);}
        .field:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-soft);background:var(--surface);}
        .field::placeholder{color:var(--faint);}
        .chip-row{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;}
        .chip-row::-webkit-scrollbar{display:none;}
        input,select,textarea{min-width:0;max-width:100%;box-sizing:border-box;}
        .skel{background:${"linear-gradient(90deg,var(--surface-2) 25%,var(--surface-3) 50%,var(--surface-2) 75%)"};background-size:200% 100%;animation:skelShimmer 1.3s ease-in-out infinite;}
        @keyframes skelShimmer{0%{background-position:150% 0}100%{background-position:-50% 0}}
        .cat-tap:active{transform:scale(0.96)!important;transition:transform 0.08s ease!important;}
      `}</style>
      {/* Loading skeleton: the page shape appears instantly, data fills in */}
      {loading&&(
        <div aria-busy="true" aria-label="Loading" style={{position:"fixed",inset:0,background:"var(--bg)",zIndex:999,overflow:"hidden"}}>
          <div style={{padding:"16px 16px 6px"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <span style={{width:32,height:32,borderRadius:10,background:"var(--brand)",color:"var(--brand-ink)",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="tag" size={17} stroke={2.2}/></span>
              <span style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>Gil's Grocery</span>
            </div>
            <div className="skel" style={{width:210,height:32,borderRadius:10,marginTop:18}}/>
            <div className="skel" style={{width:140,height:14,borderRadius:7,marginTop:8}}/>
            <div className="skel" style={{height:48,borderRadius:14,marginTop:20}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"40px 16px 16px"}}>
            {Array.from({length:8},(_,i)=><div key={i} className="skel" style={{height:118,borderRadius:18,animationDelay:`${i*0.06}s`}}/>)}
          </div>
        </div>
      )}
      {/* Manager Disabled Modal */}
      {showMgrDisabledModal&&(
        <div style={{position:"fixed",inset:0,background:"var(--overlay)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .25s var(--ease)"}} onClick={()=>setShowMgrDisabledModal(false)}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:24,padding:"26px 24px 22px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"var(--shadow-lg)",animation:"modalIn .32s var(--ease-out)"}} onClick={e=>e.stopPropagation()}>
            <span style={{...EMPTY_ICON,background:"var(--danger-soft)",color:"var(--danger)"}}><Icon name="lock" size={24}/></span>
            <div style={{fontSize:20,fontWeight:700,color:"var(--text)",marginBottom:6,letterSpacing:"-0.02em"}}>Manager access is off</div>
            <div style={{fontSize:14,color:"var(--muted)",marginBottom:20,lineHeight:1.5}}>Manager permissions have been temporarily disabled by the developer. Please check back later.</div>
            <button onClick={()=>setShowMgrDisabledModal(false)} className="press" style={{...ACTION_BTN(),width:"100%",minHeight:48,fontSize:15}}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Top banners — measured, and the spacer below pushes every page down by their real height */}
      <div ref={bannerRef} style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:200}}>
        {managerDisabled&&!isDev&&(
          <div style={{background:"#e74c3c",padding:"8px 16px",display:"flex",alignItems:"center",gap:8,animation:"bannerSlide 0.3s var(--ease-out)"}}>
            <span style={{fontSize:14}}>🔒</span>
            <span style={{fontSize:12,fontWeight:600,color:"#fff",flex:1}}>Manager permissions are temporarily disabled</span>
          </div>
        )}
        {activeNotif&&!managerDisabled&&<NotifBanner notif={activeNotif} onExpire={()=>{setActiveNotif(null);saveActiveNotif(null);}}/>}
      </div>
      <div style={{height:bannerOffset}}/>

      {/* PIN Modal */}
      {showPinModal&&(
        <div style={{position:"fixed",inset:0,background:"var(--overlay)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"fadeIn .25s var(--ease)"}}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:24,padding:"26px 24px 22px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:"var(--shadow-lg)",animation:"modalIn .32s var(--ease-out)"}}>
            <span style={{width:52,height:52,borderRadius:16,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",background:managerDisabled?"var(--danger-soft)":"var(--brand-soft)",color:managerDisabled?"var(--danger)":"var(--brand)"}}><Icon name="lock" size={24}/></span>
            <div style={{fontSize:20,fontWeight:700,color:"var(--text)",marginBottom:4,letterSpacing:"-0.02em"}}>Sign in</div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:4}}>Enter your PIN to continue</div>
            {managerDisabled&&<div style={{fontSize:11,color:"#e74c3c",marginBottom:12,padding:"6px 10px",background:"#e74c3c11",border:"1px solid #e74c3c33",borderRadius:8}}>Manager access is temporarily disabled</div>}
            {!managerDisabled&&<div style={{height:12,marginBottom:8}}/>}
            <input type="password" inputMode="numeric" maxLength={6} value={pinInput} autoFocus
              onChange={e=>{setPinInput(e.target.value);setPinError(false);}}
              onKeyDown={e=>e.key==="Enter"&&submitPin()}
              placeholder="••••"
              className="field" style={{height:60,fontSize:28,textAlign:"center",letterSpacing:"0.35em",marginBottom:8,borderRadius:16,...(pinError?{borderColor:"var(--danger)",animation:"shake .35s var(--ease)"}:{})}}/>
            {pinError&&<div style={{fontSize:13,color:"var(--danger)",marginBottom:12}}>Incorrect PIN, try again</div>}
            {!pinError&&<div style={{height:20,marginBottom:12}}/>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setShowPinModal(false);setPinInput("");setPinError(false);}} className="press" style={{...ACTION_BTN("var(--muted)"),flex:1,minHeight:48,fontSize:15}}>Cancel</button>
              <button onClick={submitPin} className="press" style={{...ACTION_BTN("var(--brand-ink)","var(--brand)"),flex:2,minHeight:48,fontSize:15,fontWeight:700}}>Unlock</button>
            </div>
          </div>
        </div>
      )}

      <PageErrorBoundary key={page+"|"+(selectedCategory?.key||"")} isDark={isDark}>
      {page==="pricing"&&(
        selectedCategory
          ?<CategoryPage category={selectedCategory} items={items} setItems={setItems} onBack={()=>{setSelectedCategory(null);setScrollToItem(null);}} isManager={isManager} isDev={isDev} managerDisabled={managerDisabled} onRequireManager={()=>managerDisabled&&!isDev?setShowMgrDisabledModal(true):setShowPinModal(true)} isDark={isDark} onToggleTheme={toggleTheme} onAuditLog={addAuditEntry} scrollToItem={scrollToItem} bannerOffset={bannerOffset}/>
          :<HomeGrid items={items} onSelectCategory={(cat,itemId)=>{setSelectedCategory(cat);setScrollToItem(itemId||null);}} isManager={isManager} isDev={isDev} isDark={isDark} onSignIn={()=>setShowPinModal(true)} onSignOut={logout} onToggleTheme={toggleTheme} hasShownWelcomeRef={hasShownWelcomeRef} bannerOffset={bannerOffset} onDevUnlock={()=>setShowPinModal(true)}/>
      )}
      {page==="schedule"&&<SchedulePage isManager={isManager} isDark={isDark} onUnlock={()=>setShowPinModal(true)} storeHours={storeHours} presetList={presetList} bannerOffset={bannerOffset}/>}
      {page==="cash"&&<CashPage isDark={isDark} taxRate={taxRate}/>}
      {page==="checklists"&&<ChecklistsPage isDev={isDev} isDark={isDark} bannerOffset={bannerOffset}/>}
      {page==="suggestions"&&<SuggestionsPage isDark={isDark} isManager={isManager} isDev={isDev}/>}
      {page==="updates"&&<UpdateLogPage isDark={isDark} isDev={isDev}/>}
      {page==="bugs"&&<div style={{minHeight:"100vh",background:"var(--bg)",paddingBottom:80}}><BugsPage T={bugsT} isManager={isManager} managerDisabled={managerDisabled} onRequireManager={()=>managerDisabled&&!isDev?setShowMgrDisabledModal(true):setShowPinModal(true)}/></div>}
      {page==="dev"&&<DevPage isDev={isDev} onUnlock={()=>setShowPinModal(true)} auditLog={auditLog} taxRate={taxRate} onTaxRateChange={r=>{setTaxRate(r);saveTaxRate(r);}} managerDisabledProp={managerDisabled} onManagerDisabledChange={v=>{setManagerDisabled(v);if(v&&isManager&&!isDev){setIsManager(false);try{sessionStorage.removeItem("isManager");}catch{}}}} storeHours={storeHours} onStoreHoursChange={h=>{setStoreHours(h);saveStoreHours(h);}} presetList={presetList} onPresetListChange={l=>{setPresetList(l);saveShiftPresetList(l);}} setItems={setItems} items={items} activeNotif={activeNotif} onNotifChange={setActiveNotif} layout={layout} onLayoutSave={saveLayout}/>}
      </PageErrorBoundary>
      <MoreTray open={showMore} onClose={()=>setShowMore(false)} page={page} setPage={handlePageChange} isDark={isDark} isDev={isDev}/>
      <BottomNav page={page} setPage={handlePageChange} activeCategoryTheme={activeCatTheme} isDark={isDark} onMoreOpen={()=>setShowMore(true)}/>
    </div>
    </LayoutCtx.Provider>
  );
}
