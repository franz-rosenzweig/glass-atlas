// Glass Atlas · light and dark. Dark is the original vitrine. Light is the same specimen in daylight:
// paper instead of void, ink instead of bone, and the microscope switches from darkfield to brightfield.
//
// Three mechanisms, so the drawing code never has to know which theme is on:
//  - CSS tokens in index.html, swapped by <html data-theme="light">, for the chrome.
//  - cc(hex) for colours written into inline styles: a light-dark() pair that follows the theme live.
//  - every 2D canvas: fill, stroke, shadow and gradient colours pass through toLight() while the
//    theme is light. Lightness is turned over in OKLCH and hue kept, so a dark slide becomes pale
//    glass, a glow becomes a stain, and a cytokine stays the colour it was.
// The 3D scene has its own light setup (core.js, A.setTheme).

const KEY='glass-atlas-theme';
const root=document.documentElement;
let LIGHT=root.dataset.theme==='light',RAW=0;
const subs=new Set();

// Hand-tuned partners for the named colours (chrome, the seven systems, alert, ok). Everything else is computed.
const PAIR={
  '#0a0f11':'#f4f1ea','#04070b':'#f7f4ee','#111a1c':'#fffdf8','#0d1517':'#fffdf8','#25353a':'#ddd6c8','#33474c':'#cbc3b3',
  '#ece6da':'#1e2426','#b9b6ad':'#4a5254','#7e8e90':'#687275','#bfe6e1':'#2c7d74','#f2705f':'#c63f2c','#7fd3a3':'#23875a',
  '#b193e3':'#7652c2','#ee6f82':'#c8364f','#f29a55':'#c4651c','#40c7aa':'#13896f','#78a0f4':'#3a64c8','#ddb741':'#9a7608','#62bed3':'#1f7f96',
  '#ffffff':'#1a1f21','#fff':'#1a1f21','#000000':'#f7f4ee','#000':'#f7f4ee',
};

export const theme=()=>LIGHT?'light':'dark';
export function setTheme(t,{save=true}={}){
  LIGHT=t==='light';root.dataset.theme=theme();
  if(save)try{localStorage.setItem(KEY,theme());}catch(_){}
  subs.forEach(f=>f(theme()));
}
export const onTheme=f=>(subs.add(f),()=>subs.delete(f));
// follow the system until the viewer picks one
try{const mq=matchMedia('(prefers-color-scheme: light)');mq.addEventListener('change',e=>{let s=null;try{s=localStorage.getItem(KEY);}catch(_){}if(!s)setTheme(e.matches?'light':'dark',{save:false});});}catch(_){}

/* ---------------- colour maths: sRGB <-> OKLab */
const lin=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);
const gam=c=>c<=.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-.055;
function toLab(r,g,b){r=lin(r);g=lin(g);b=lin(b);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
function toRgb(L,a,b){const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
  return [gam(4.0767416621*l-3.3077115913*m+.2309699292*s),gam(-1.2684380046*l+2.6097574011*m-.3413193965*s),gam(-.0041960863*l-.7034186147*m+1.707614701*s)];}
const inGamut=c=>c.every(v=>v>=-.001&&v<=1.001);

// lightness in -> lightness out: darks become paper, mid accents darken a little to hold
// contrast on paper, and bone or white becomes ink.
const CURVE=[[0,.985],[.12,.972],[.2,.94],[.35,.85],[.5,.72],[.62,.63],[.78,.55],[.86,.44],[.93,.28],[1,.19]];
function curve(L){for(let i=1;i<CURVE.length;i++){const [x0,y0]=CURVE[i-1],[x1,y1]=CURVE[i];if(L<=x1)return y0+(y1-y0)*(L-x0)/(x1-x0);}return CURVE.at(-1)[1];}

function parse(s){
  s=s.trim().toLowerCase();
  if(s[0]==='#'){let h=s.slice(1);if(h.length<=4)h=[...h].map(c=>c+c).join('');
    const n=parseInt(h.slice(0,6),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255,h.length>6?parseInt(h.slice(6,8),16)/255:1];}
  const m=s.match(/^rgba?\(([^)]+)\)$/);if(!m)return null;
  const p=m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);if(p.length<3||p.some(isNaN))return null;
  return [p[0]/255,p[1]/255,p[2]/255,p.length>3?p[3]:1];
}
const hex2=v=>Math.round(Math.min(1,Math.max(0,v))*255).toString(16).padStart(2,'0');
const fmt=(r,g,b,a)=>a>=1?`#${hex2(r)}${hex2(g)}${hex2(b)}`:`rgba(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)},${+a.toFixed(3)})`;

const cache=new Map();
export function toLight(c){
  if(typeof c!=='string')return c;
  let out=cache.get(c);if(out!==undefined)return out;
  const p=parse(c);
  if(!p)out=c;
  else{
    const key=fmt(p[0],p[1],p[2],1);
    if(PAIR[key]){const q=parse(PAIR[key]);out=fmt(q[0],q[1],q[2],p[3]);}
    else{
      const [L,A,B]=toLab(p[0],p[1],p[2]);const L2=curve(L);
      // pale results keep only a hint of their colour, so paper stays paper
      let k=L2>.9?.55:L2>.8?.8:1;let rgb=toRgb(L2,A*k,B*k);
      for(let i=0;i<16&&!inGamut(rgb);i++){k*=.88;rgb=toRgb(L2,A*k,B*k);}
      out=fmt(rgb[0],rgb[1],rgb[2],p[3]);
    }
  }
  if(cache.size>4000)cache.clear();
  cache.set(c,out);return out;
}
export const tc=c=>LIGHT?toLight(c):c;                 // the colour for the current theme
export const cc=c=>`light-dark(${toLight(c)},${c})`;   // a CSS value that follows the theme by itself
export function raw(fn){RAW++;try{return fn();}finally{RAW--;}}  // draw without the light-theme remap

/* ---------------- every 2D canvas follows the theme */
{
  const P=CanvasRenderingContext2D.prototype;
  const skip=ctx=>!LIGHT||RAW||ctx.canvas?.dataset?.raw!==undefined;
  for(const prop of ['fillStyle','strokeStyle','shadowColor']){
    const d=Object.getOwnPropertyDescriptor(P,prop);
    Object.defineProperty(P,prop,{configurable:true,get(){return d.get.call(this);},
      set(v){d.set.call(this,typeof v==='string'&&!skip(this)?toLight(v):v);}});
  }
  // additive glow turns to white on paper; multiply is its brightfield twin
  const g=Object.getOwnPropertyDescriptor(P,'globalCompositeOperation');
  Object.defineProperty(P,'globalCompositeOperation',{configurable:true,get(){return g.get.call(this);},
    set(v){g.set.call(this,v==='lighter'&&!skip(this)?'multiply':v);}});
  const add=CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop=function(o,c){return add.call(this,o,LIGHT&&!RAW?toLight(c):c);};
}
