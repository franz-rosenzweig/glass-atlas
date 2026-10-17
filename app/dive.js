// Glass Atlas · the dive: a full-screen microscope that zooms from the 3D body down through tissue,
// cells and molecules. Levels are 2D canvas scenes drawn in a 1000×700 design space.
export const TAU=Math.PI*2;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const rand=(a,b)=>a+Math.random()*(b-a);
import { cc, natural } from './theme.js';
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const CSS=`
.dive{position:absolute;inset:0;z-index:50;background:var(--scope);color:var(--bone);clip-path:circle(0% at 50% 50%);transition:clip-path .9s cubic-bezier(.7,0,.2,1);touch-action:none}
.dive.on{clip-path:circle(150% at 50% 50%)}
.dive canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.dv-top{position:absolute;left:16px;right:16px;top:calc(12px + env(safe-area-inset-top,0px));display:flex;gap:10px;align-items:center;z-index:3;pointer-events:none}
.dv-top>*{pointer-events:auto}
.dv-scale{display:flex;gap:2px;flex:1;min-width:0;overflow-x:auto}
.dv-stop{font:10px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:7px 10px;border:1px solid var(--line-2);color:var(--dim);background:rgb(var(--lo) / .7);white-space:nowrap}
.dv-stop b{display:block;font-weight:500;font-size:9px;color:var(--dim);letter-spacing:.04em;text-transform:none;margin-top:1px}
.dv-stop[aria-current="true"]{color:var(--bone);border-color:var(--bone-2);background:rgb(var(--hi) / .08)}
.dv-stop[disabled]{opacity:.45;cursor:default}
.dv-exit{font:10px var(--mono);letter-spacing:.1em;text-transform:uppercase;padding:9px 12px;border:1px solid var(--line-2);background:rgb(var(--lo) / .7);white-space:nowrap}
.dv-card{position:absolute;left:16px;top:70px;bottom:16px;width:360px;z-index:3;background:rgb(var(--lo) / .9);border:1px solid var(--line);border-top:3px solid var(--c,#F29A55);border-radius:3px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);overflow:auto;overscroll-behavior:contain;padding:16px 18px 20px}
.dv-card h2{font:400 26px/1.1 var(--display);margin:4px 0 8px;text-wrap:balance}
.dv-card p{color:var(--bone-2);font-size:14px;margin:0 0 10px}
.dv-card .k{font:500 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--c,#F29A55);margin:0}
.dv-card .sub{font:500 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin:16px 0 8px}
.dv-meter{display:grid;grid-template-columns:1fr auto;gap:2px 10px;margin:8px 0}
.dv-meter span{font-size:13px;color:var(--bone-2)}.dv-meter b{font:500 13px var(--mono);font-variant-numeric:tabular-nums}
.dv-meter i{grid-column:1/-1;height:6px;background:var(--line);border-radius:3px;position:relative;overflow:hidden}
.dv-meter i u{position:absolute;left:0;top:0;bottom:0;background:var(--c,#F29A55);border-radius:3px;transition:width .2s}
.dv-btns{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.dv-btn{font:10.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:9px 11px;border:1px solid var(--line-2);border-radius:3px;text-align:left}
.dv-btn small{display:block;font:11px var(--body);letter-spacing:0;text-transform:none;color:var(--dim);margin-top:3px}
.dv-btn.on{border-color:var(--c,#F29A55);background:color-mix(in srgb,var(--c,#F29A55) 10%,transparent)}
.dv-btn.go{background:var(--bone);color:var(--void);border-color:var(--bone)}
.dv-btn[disabled]{opacity:.45}
.dv-seg{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0}
.dv-seg button{font-size:12px;padding:6px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--bone-2)}
.dv-seg button[aria-checked="true"]{background:var(--bone);color:var(--void);border-color:var(--bone)}
.dv-fine{font-size:12px!important;color:var(--dim)!important}
.dv-guide{position:absolute;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:3;font:10px var(--mono);letter-spacing:.1em;text-transform:uppercase;padding:9px 12px;border:1px solid var(--line-2);background:rgb(var(--lo) / .75);border-radius:3px}
.dv-pop{position:absolute;z-index:6;inset:0;display:grid;place-items:center;background:var(--scrim)}
.dv-pop[hidden]{display:none}
.dv-pc{width:min(360px,calc(100% - 32px));background:var(--solid);border:1px solid var(--line-2);border-radius:4px;padding:16px 18px 18px;max-height:80%;overflow:auto}
.dv-pc canvas{position:static;width:100%;height:150px;background:var(--scope);border-radius:3px;margin-bottom:10px}
.dv-pc h3{font:400 22px/1.15 var(--display);margin:2px 0 6px}
.dv-pc p{color:var(--bone-2);font-size:14px;margin:0 0 8px}
.dv-pc .sz{font:500 10.5px var(--mono);letter-spacing:.04em;color:var(--dim)}
.dv-pc .new{color:var(--ok)}
.dv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:10px}
.dv-grid button{border:1px solid var(--line-2);border-radius:3px;padding:6px;text-align:center;font-size:11.5px;color:var(--bone-2)}
.dv-grid button[disabled]{opacity:.35}
.dv-grid canvas{position:static;width:100%;height:56px;display:block;background:var(--scope);border-radius:2px;margin-bottom:4px}
.dv-toast{position:absolute;z-index:5;left:50%;top:80px;transform:translateX(-50%);font:11px var(--mono);letter-spacing:.06em;padding:8px 12px;background:rgb(var(--lo) / .92);border:1px solid var(--line-2);border-radius:3px;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
.dv-toast.on{opacity:1}
@media (max-width:860px){
  .dv-card{left:12px;right:12px;width:auto;top:auto;bottom:calc(12px + env(safe-area-inset-bottom,0px));max-height:44%}
  .dv-card h2{font-size:21px}
  .dv-guide{bottom:auto;top:calc(58px + env(safe-area-inset-top,0px));right:12px}
  .dv-stop{padding:6px 7px;font-size:9px}.dv-stop b{display:none}
}`;

export function createDive(A,{levels,guide,color='#F29A55',onExit,top={label:'Hand',size:'10 cm'}}){
  const app=document.getElementById('app');
  if(!document.getElementById('dive-css')){const st=document.createElement('style');st.id='dive-css';st.textContent=CSS;document.head.appendChild(st);}
  const root=document.createElement('div');root.className='dive';root.hidden=true;root.style.setProperty('--c',cc(color));
  root.innerHTML=`<canvas aria-label="Microscope view"></canvas>
    <div class="dv-top"><nav class="dv-scale" aria-label="Zoom level"></nav><button class="dv-exit" type="button">Back to the body</button></div>
    <section class="dv-card" aria-live="polite"></section>
    <button class="dv-guide" type="button"></button>
    <div class="dv-toast"></div>
    <div class="dv-pop" hidden><div class="dv-pc"></div></div>`;
  app.appendChild(root);
  const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');const card=root.querySelector('.dv-card');const pop=root.querySelector('.dv-pop'),pc=root.querySelector('.dv-pc');
  const scaleNav=root.querySelector('.dv-scale');const toastEl=root.querySelector('.dv-toast');
  const STOPS=[{id:'hand',label:top.label,size:top.size},...levels.map(l=>({id:l.id,label:l.label,size:l.size}))];
  let cur=null,visited=new Set(),raf=0,last=0,trans=null,W=0,H=0,dpr=1,paused=false;
  // field guide, remembered per viewer when storage allows
  let found=new Set();try{found=new Set(JSON.parse(localStorage.getItem('glass-atlas-guide')||'[]'));}catch(_){}
  const saveFound=()=>{try{localStorage.setItem('glass-atlas-guide',JSON.stringify([...found]));}catch(_){}};
  const phone=()=>innerWidth<=860;
  const art=(g,fn)=>g.natural?natural(fn):fn();  // true-colour entries keep their colours in light mode
  function resize(){dpr=Math.min(devicePixelRatio||1,2);W=root.clientWidth;H=root.clientHeight;cv.width=W*dpr;cv.height=H*dpr;}
  function stage(){if(phone()){const ch=card.offsetHeight||H*.44;return {x:0,y:100,w:W,h:Math.max(160,H-100-ch-20)};}return {x:392,y:64,w:W-392-16,h:H-64-16};}
  function fit(lv){const st=stage();const s=lv.fit==='cover'?Math.max(st.w/1000,st.h/700):Math.min(st.w/1000,st.h/700);return {s,ox:st.x+(st.w-1000*s)/2,oy:st.y+(st.h-700*s)/2,st};}
  const toDesign=(lv,cx,cy)=>{const r=cv.getBoundingClientRect(),f=fit(lv);return {x:(cx-r.left-f.ox)/f.s,y:(cy-r.top-f.oy)/f.s,s:f.s};};
  function navHTML(){scaleNav.innerHTML=STOPS.map((s,i)=>`<button class="dv-stop" type="button" data-i="${i}" aria-current="${cur&&s.id===cur.id}" ${i>0&&!visited.has(s.id)?'disabled':''}>${s.label}<b>${s.size}</b></button>`).join('');}
  function guideBtn(){root.querySelector('.dv-guide').textContent=`Field guide ${[...found].filter(k=>guide[k]).length}/${Object.keys(guide).length}`;}
  function toast(t){toastEl.textContent=t;toastEl.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>toastEl.classList.remove('on'),1800);}
  const api={ctx,toast,phone,discover,showCard,go,pause:v=>paused=v,get paused(){return paused||!pop.hidden;},card,root,
    fit:()=>fit(cur)};
  function go(id,{from}={}){
    const lv=levels.find(l=>l.id===id);if(!lv||lv===cur)return;
    const prev=cur;if(prev)prev.exit?.();
    trans=prev?{from:prev,to:lv,t:0,focus:from||prev.zoomFocus||{x:500,y:350}}:null;
    cur=lv;visited.add(id);navHTML();
    card.innerHTML=lv.card();lv.bind?.(card,api);card.scrollTop=0;lv.enter?.(api);
    requestAnimationFrame(()=>resize());
  }
  function discover(key,quiet){const g=guide[key];if(!g)return;const isNew=!found.has(key);if(quiet&&!isNew)return;found.add(key);saveFound();guideBtn();showCard(key,isNew);}
  function showCard(key,isNew){const g=guide[key];
    pc.innerHTML=`<canvas width="640" height="300"></canvas><div class="sz">${esc(g.kind)} · ${esc(g.size)}${isNew?' · <span class="new">new in your field guide</span>':''}</div><h3>${esc(g.name)}</h3>${g.text.map(t=>`<p>${t}</p>`).join('')}<div class="dv-btns"><button class="dv-btn go" type="button" data-close>Back to the microscope</button></div>`;
    const c=pc.querySelector('canvas');const x=c.getContext('2d');x.fillStyle='#04070B';x.fillRect(0,0,640,300);art(g,()=>g.draw(x,320,150,1.6,performance.now()/1000));
    pop.hidden=false;pc.querySelector('[data-close]').focus();}
  function quiz(score,n){
    const keys=Object.keys(guide);const pool=keys.filter(k=>found.has(k)).length>=4?keys.filter(k=>found.has(k)):keys;
    const k=pool[Math.floor(Math.random()*pool.length)];const others=keys.filter(x=>x!==k).sort(()=>Math.random()-.5).slice(0,3);const opts=[k,...others].sort(()=>Math.random()-.5);
    pc.innerHTML=`<div class="sz">Quiz · ${n} answered · ${score} right</div><h3>What is this?</h3><canvas width="640" height="300"></canvas><div class="dv-seg" role="group">${opts.map(o=>`<button type="button" data-o="${o}">${esc(guide[o].name)}</button>`).join('')}</div><p id="qz-f"></p><div class="dv-btns"><button class="dv-btn" type="button" data-close>Done</button></div>`;
    const c=pc.querySelector('canvas'),x=c.getContext('2d');x.fillStyle='#04070B';x.fillRect(0,0,640,300);art(guide[k],()=>guide[k].draw(x,320,150,1.6,0));
    pc.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const ok=b.dataset.o===k;pc.querySelectorAll('[data-o]').forEach(y=>{y.disabled=true;if(y.dataset.o===k)y.setAttribute('aria-checked','true');});
      if(ok&&!found.has(k)){found.add(k);saveFound();guideBtn();}
      pc.querySelector('#qz-f').innerHTML=`<b style="color:${ok?'var(--ok)':'var(--alert)'}">${ok?'Right.':'It\'s '+esc(guide[k].name)+'.'}</b> ${guide[k].text[0]}`;
      const nb=document.createElement('button');nb.className='dv-btn go';nb.type='button';nb.textContent='Next';nb.onclick=()=>quiz(score+(ok?1:0),n+1);pc.querySelector('.dv-btns').prepend(nb);});
    pop.hidden=false;}
  function guideList(){
    pc.innerHTML=`<div class="sz">Field guide</div><h3>Everything you've met</h3><p>Tap cells and molecules in the microscope to collect them.</p><div class="dv-grid">${Object.entries(guide).map(([k,g])=>`<button type="button" data-k="${k}" ${found.has(k)?'':'disabled'}><canvas width="200" height="112"></canvas>${found.has(k)?esc(g.name):'?'}</button>`).join('')}</div><div class="dv-btns"><button class="dv-btn go" type="button" data-quiz>Quiz me</button><button class="dv-btn" type="button" data-close>Close</button></div>`;
    pc.querySelectorAll('.dv-grid button').forEach(b=>{const k=b.dataset.k;const c=b.querySelector('canvas'),x=c.getContext('2d');x.fillStyle='#04070B';x.fillRect(0,0,200,112);if(found.has(k))art(guide[k],()=>guide[k].draw(x,100,56,.6,0));else{x.fillStyle='#1B2A30';x.font='28px Gloock, serif';x.textAlign='center';x.fillText('?',100,66);}
      b.onclick=()=>showCard(k,false);});
    pc.querySelector('[data-quiz]').onclick=()=>quiz(0,0);
    pop.hidden=false;}
  pop.addEventListener('click',e=>{if(e.target===pop||e.target.closest('[data-close]'))pop.hidden=true;});
  root.querySelector('.dv-guide').onclick=guideList;
  root.querySelector('.dv-exit').onclick=()=>close();
  scaleNav.addEventListener('click',e=>{const b=e.target.closest('.dv-stop');if(!b||b.disabled)return;const s=STOPS[+b.dataset.i];if(s.id==='hand')close();else go(s.id);});
  // pointer input in design space
  let down=null;
  cv.addEventListener('pointerdown',e=>{if(!cur)return;down={x:e.clientX,y:e.clientY,t:performance.now()};const p=toDesign(cur,e.clientX,e.clientY);cur.press?.(p,api,e);});
  cv.addEventListener('pointermove',e=>{if(!cur)return;const p=toDesign(cur,e.clientX,e.clientY);cur.move?.(p,api,e);});
  cv.addEventListener('pointerup',e=>{if(!cur||!down)return;const p=toDesign(cur,e.clientX,e.clientY);cur.release?.(p,api,e);
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<10)cur.tap?.(p,api,e);down=null;});
  addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape'){if(!pop.hidden)pop.hidden=true;else close();}});
  addEventListener('resize',()=>{if(!root.hidden)resize();});
  function frame(now){
    const dt=clamp((now-last)/1000,0,.05);last=now;  // the first frame can start before `last`
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#04070B';ctx.fillRect(0,0,W,H);
    const drawLv=(lv,alpha,zoom,focus)=>{const f=fit(lv);ctx.save();ctx.globalAlpha=alpha;
      ctx.translate(f.ox,f.oy);ctx.scale(f.s,f.s);if(zoom!==1){ctx.translate(focus.x,focus.y);ctx.scale(zoom,zoom);ctx.translate(-focus.x,-focus.y);}
      const run=()=>lv.draw(ctx,api.paused?0:dt,now/1000,api);lv.natural?natural(run):run();ctx.restore();};
    if(trans){trans.t+=dt/1.1;const k=clamp(trans.t,0,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      if(k<.6)drawLv(trans.from,1-k/.6,1+e*7,trans.focus);
      drawLv(trans.to,clamp((k-.35)/.65,0,1),.55+.45*e,{x:500,y:350});
      if(k>=1)trans=null;}
    else if(cur)drawLv(cur,1,1,{x:500,y:350});
    // scale bar, as on a micrograph
    if(cur&&!trans){const f=fit(cur);const px=Math.max(0,cur.bar.units*f.s);const x0=(phone()?W-16:W-24)-px,y0=phone()?f.st.y+f.st.h-10:H-60;
      ctx.fillStyle='rgba(236,230,218,.9)';ctx.fillRect(x0,y0,px,3);ctx.font='10px "Martian Mono", monospace';ctx.textAlign='right';ctx.fillText(cur.bar.label,x0+px,y0-6);}
    raf=requestAnimationFrame(frame);
  }
  function open(startId){
    root.hidden=false;resize();visited=new Set();cur=null;trans=null;guideBtn();A.paused=true;
    go(startId||levels[0].id);last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
    requestAnimationFrame(()=>root.classList.add('on'));
  }
  function close(){
    root.classList.remove('on');cur?.exit?.();A.paused=false;
    setTimeout(()=>{root.hidden=true;cancelAnimationFrame(raf);cur=null;onExit?.();},700);
  }
  return {open,close,root,api};
}
