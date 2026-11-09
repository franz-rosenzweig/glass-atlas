// Adderall XR dive: one capsule across the patient's day (two waves of beads) → one nerve ending, where amphetamine turns the transporter around.
// Numbers from the Adderall XR label (revised 04/2026) unless a line says otherwise; the steps of the mechanism from Heal 2013 and Sulzer 2011.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba } from './dive-ra.js';
import { cc } from './theme.js';

const C={ir:'#9FC0FF',dr:'#4F78E0',coat:'#E6DEFF',amph:'#9FC0FF',da:'#F2C14E',na:'#7FD3A3',vmat:'#C08CFF',dat:'#40C7AA',rec:'#EE6F82',prop:'#E6DEFF',acid:'#F2705F',sleep:'#4A4AA0',line:'#ECE6DA'};
const LBL='rgba(236,230,218,.55)';
function txt(x,t,px,py,k=1,al='left',col=LBL){x.fillStyle=col;x.font=`${Math.round(11*k)}px "Martian Mono", monospace`;x.textAlign=al;x.fillText(t,px,py);}
const tk=api=>Math.max(1,9/(11*api.fit().s));  // canvas lettering stays ≥ 9 screen px on a phone
const hhmm=h=>{const m=Math.round(((h%24)+24)%24*60);return `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;};

// Blood level, as a share of its peak: two equal waves four hours apart (the label's 2 × 10 mg comparison; Heal 2013), d-amphetamine
// half-life 10 h in adults. KA is tuned to the label's d-amphetamine peaks with 30 mg: 5.2 h fasting, 7.7 h after a high-fat meal.
const KE=Math.LN2/10,GAP=4,PK={usual:{ka:2.6,lag:0},fat:{ka:.48,lag:0}};
const wave=(h,ka)=>h<=0?0:Math.exp(-KE*h)-Math.exp(-ka*h);
for(const p of Object.values(PK)){let m=0;for(let h=0;h<30;h+=.02)m=Math.max(m,wave(h-p.lag,p.ka)+wave(h-p.lag-GAP,p.ka));p.peak=m;}

function capsule(x,cx,cy,len,dia,shell=1){const r=dia/2;x.save();x.globalAlpha*=shell;
  x.beginPath();x.roundRect(cx-len/2,cy-r,len,dia,r);x.fillStyle=rgba(C.dr,.12);x.fill();x.strokeStyle=rgba('#B9C6E8',.8);x.lineWidth=2.5;x.stroke();
  x.beginPath();x.moveTo(cx+len*.06,cy-r);x.lineTo(cx+len*.06,cy+r);x.stroke();
  x.fillStyle='rgba(236,230,218,.10)';x.beginPath();x.roundRect(cx-len/2+r*.5,cy-r*.72,len-r,r*.28,r*.14);x.fill();x.restore();}
function bead(x,px,py,r,dr,f=0){if(f>=1)return;r*=1-f*.85;x.globalAlpha*=1-f*.7;x.fillStyle=dr?C.dr:C.ir;x.beginPath();x.arc(px,py,r,0,TAU);x.fill();
  if(dr&&f===0){x.strokeStyle=C.coat;x.lineWidth=Math.max(1,r*.32);x.stroke();}x.globalAlpha/=1-f*.7;}
function molAmph(x,px,py,s=1){x.fillStyle=C.amph;x.beginPath();x.moveTo(px,py-5*s);x.lineTo(px+4.5*s,py);x.lineTo(px,py+5*s);x.lineTo(px-4.5*s,py);x.closePath();x.fill();}
function transporter(x,px,py,s,dir,col){x.save();x.translate(px,py);x.scale(s,s);x.fillStyle=col;x.beginPath();x.roundRect(-21,-20,14,40,6);x.roundRect(7,-20,14,40,6);x.fill();
  if(dir){x.strokeStyle='rgba(236,230,218,.75)';x.lineWidth=2.4;x.beginPath();x.moveTo(0,10*dir);x.lineTo(0,-10*dir);x.moveTo(-5,-5*dir);x.lineTo(0,-11*dir);x.lineTo(5,-5*dir);x.stroke();}x.restore();}
function hexMol(x,cx,cy,s,col,tail,oh){x.strokeStyle=col;x.lineWidth=3*s;x.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;x.lineTo(cx+Math.cos(a)*14*s,cy+Math.sin(a)*14*s);}x.closePath();x.stroke();
  x.beginPath();x.moveTo(cx+12*s,cy+7*s);tail.forEach(([a,b])=>x.lineTo(cx+a*s,cy+b*s));x.stroke();x.fillStyle=col;for(const [a,b] of oh){x.beginPath();x.arc(cx+a*s,cy+b*s,4*s,0,TAU);x.fill();}}

export const GUIDE_AD={
  add_caps:{name:'The two-bead capsule',kind:'Medicine · extended-release capsule',size:'16–21 mm long',draw:(x,cx,cy,s)=>{capsule(x,cx,cy,150*s,54*s);for(let i=0;i<14;i++)bead(x,cx-54*s+(i%7)*18*s,cy+(i<7?-10:10)*s,6*s,i%2===1);},
    text:['Adderall XR holds two kinds of beads: immediate-release beads that free their amphetamine as soon as the capsule dissolves, and delayed-release beads that free theirs about four hours later (Heal 2013). The label compares one 20 mg capsule with two 10 mg immediate-release tablets taken four hours apart: the blood levels are comparable.','It can be opened and sprinkled on applesauce, which absorbs the same; the label says to swallow the mixture without chewing and never to divide a capsule\'s contents.']},
  add_amph:{name:'Amphetamine',kind:'Medicine · small molecule',size:'under 1 nm',draw:(x,cx,cy,s)=>hexMol(x,cx-40*s,cy,s*2.6,C.amph,[[24,10],[34,2],[46,8]],[[34,-8]]),
    text:['Shaped enough like dopamine and norepinephrine to ride their transporters into the nerve ending. The capsule mixes its d- and l-forms about 3 to 1 (label); in rat brain tissue the d-form was about four times stronger at releasing dopamine, while the l-form was as strong or stronger at releasing norepinephrine (Heal 2013).','It also releases serotonin (Heal 2013), which helps explain why its label warns about serotonin syndrome with SSRIs such as the patient\'s Lexapro; Zofran\'s label carries the same warning. The label also says stimulants may lower the seizure threshold.']},
  add_da:{name:'Dopamine',kind:'Signal molecule',size:'under 1 nm',draw:(x,cx,cy,s)=>hexMol(x,cx-40*s,cy,s*2.6,C.da,[[24,10],[36,4],[48,10]],[[-6,-17],[-17,-2]]),
    text:['A messenger that nerve endings store in vesicles and release when the nerve fires. A transporter, DAT, pulls it back in afterwards, which keeps each signal short.','Amphetamine raises dopamine and norepinephrine activity in the brain, which affects attention and executive function (Faraone 2018). The label is frank that exactly how this helps ADHD is not known.']},
  add_dat:{name:'DAT and NET',kind:'Transporters',size:'nanometres',draw:(x,cx,cy,s)=>transporter(x,cx,cy,s*2.6,1,C.dat),
    text:['Pumps in the outer membrane of a nerve ending that pull dopamine (DAT) or norepinephrine (NET) back in after release, to be used again.','Amphetamine is carried in by them in the messenger\'s place. Once enough is inside, they run backwards and push the messenger out even when the nerve is quiet: reverse transport (Heal 2013; Sulzer 2011).']},
  add_vmat:{name:'VMAT2 and the vesicle',kind:'Transporter + storage bubble',size:'nanometres',draw:(x,cx,cy,s)=>{s*=1.4;x.fillStyle=rgba(C.acid,.18);x.strokeStyle='#B9C6E8';x.lineWidth=2.5*s;x.beginPath();x.arc(cx,cy,30*s,0,TAU);x.fill();x.stroke();
      x.fillStyle=C.vmat;x.beginPath();x.roundRect(cx+18*s,cy-26*s,14*s,10*s,4*s);x.fill();x.fillStyle=C.da;for(let i=0;i<7;i++){const a=i/7*TAU;x.beginPath();x.arc(cx+Math.cos(a)*14*s,cy+Math.sin(a)*14*s,4*s,0,TAU);x.fill();}},
    text:['Vesicles are tiny bubbles inside the nerve ending that hold dopamine ready for release. VMAT2 pumps fill them, powered by the acid inside the bubble (Sulzer 2011).','Two lab explanations, probably both partly right: amphetamine is a weak base that soaks up the bubble\'s acid, and it competes with dopamine at VMAT2. Either way dopamine leaks out into the cell, where the transporter can push it out (Sulzer 2011; Heal 2013).']},
  add_ne:{name:'Norepinephrine and β1 receptors',kind:'Signal + receptor on the heart',size:'nanometres',draw:(x,cx,cy,s)=>{s*=2;x.strokeStyle=C.rec;x.lineWidth=7*s;x.beginPath();x.arc(cx,cy+8*s,22*s,Math.PI*1.1,Math.PI*1.9,true);x.stroke();x.fillStyle=C.na;x.beginPath();x.arc(cx,cy-2*s,7*s,0,TAU);x.fill();},
    text:['The sympathetic nerves that speed up the heart release norepinephrine onto β1 receptors on its muscle. Amphetamine acts on these nerves too, an action linked to its effects on the heart and blood pressure (Heal 2013); the label lists an average rise of about 3–6 beats a minute and 2–4 mmHg.','Propranolol blocks β receptors, so the same release pushes the heart less: the two medicines pull against each other, and the patient\'s prescribers balance them. The label also lists Raynaud\'s, cold, colour-changing fingers, worth telling the rheumatologist.']},
};

/* ---------------- level A: the capsule's day */
function dayLevel(){
  const S={dose:8,fed:false,clock:7.5,play:false,parts:[]};
  let sd=7;const R=()=>(sd=sd*16807%2147483647)/2147483647;
  const BEADS=Array.from({length:40},(_,i)=>({u:R()*.86-.43,v:(R()-.5)*.62,dr:i%2===1,ph:R()*TAU}));
  const P=()=>S.fed?PK.fat:PK.usual,lag=()=>P().lag;
  const w1=hd=>wave(hd-S.dose-lag(),P().ka)/P().peak,w2=hd=>wave(hd-S.dose-lag()-GAP,P().ka)/P().peak,lv=hd=>w1(hd)+w2(hd);
  const layout=api=>api.phone()?{cap:{x:500,y:110,u:13},leg:{x:250,y:224},ch:{x:170,y:316,w:670,h:274},tick:6}
    :{cap:{x:300,y:230,u:16},leg:{x:160,y:345},ch:{x:490,y:120,w:450,h:430},tick:3};
  function note(){const late=S.dose>=12,early=S.dose<=8;
    return (late?'The label: afternoon doses should be avoided because of the potential for insomnia. In its adult trial, 27% on Adderall XR reported insomnia, against 13% on placebo.'
      :(early?'Taken soon after waking, as the label advises.':'A mid-morning dose; the label says on waking.')+' With a 10-hour half-life, some is still there at night.')+(S.fed?' Food doesn\'t change how much gets in, only when: the peak comes about 2.5 hours later.':'');}
  function draw(x,dt,t,api){const k=tk(api),Ly=layout(api);
    if(S.play){S.clock=Math.min(30,S.clock+dt*1.4);if(S.clock>=30)S.play=false;}
    x.fillStyle='#080C14';x.fillRect(-400,-300,1800,1300);
    // the capsule, to scale, and its beads dissolving in two waves
    const {x:cx,y:cy,u}=Ly.cap,len=18*u,dia=6.4*u,h=S.clock-S.dose-lag();
    const f1=clamp(h/1.2,0,1),f2=clamp((h-GAP)/1.2,0,1),shell=1-clamp(h/.6,0,1);
    capsule(x,cx,cy,len,dia,Math.max(.18,shell));
    for(const b of BEADS){const f=b.dr?f2:f1;const px=cx+b.u*len+Math.sin(t*.8+b.ph)*(h>0?1.5:0),py=cy+b.v*dia;x.save();bead(x,px,py,.42*u,b.dr,f);x.restore();
      if(f>0&&f<1&&Math.random()<dt*3)S.parts.push({x:px,y:py,vx:api.phone()?rand(-20,20):rand(60,110),vy:api.phone()?rand(50,90):rand(-15,15),l:1.4,dr:b.dr});}
    for(const p of S.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;x.globalAlpha=clamp(p.l,0,1);molAmph(x,p.x,p.y,.7);}x.globalAlpha=1;S.parts=S.parts.filter(p=>p.l>0);
    // 5 mm bar beside the capsule
    const bx=cx+len/2-5*u,by=cy+dia/2+18;x.fillStyle='rgba(236,230,218,.75)';x.fillRect(bx,by,5*u,3);txt(x,'5 mm',bx+5*u,by+16*k,k,'right');
    txt(x,'ADDERALL XR CAPSULE',cx-len/2,cy-dia/2-12,k);
    // legend
    const lg=Ly.leg,lab=[['IMMEDIATE-RELEASE BEADS',false,'0 h'],['DELAYED-RELEASE BEADS',true,'+4 h']];
    lab.forEach(([s,dr,w],i)=>{const px=lg.x,py=lg.y+i*28*k;x.save();bead(x,px+8,py-4*k,7,dr,0);x.restore();txt(x,`${s} · ${w}`,px+24,py,k*.9);});
    // the chart: 24 h from 06:00
    const L=Ly.ch,X=hd=>L.x+(hd-6)/24*L.w,Y=v=>L.y+L.h-v*L.h*.86;
    x.fillStyle='rgba(236,230,218,.03)';x.fillRect(L.x,L.y,L.w,L.h);
    x.fillStyle=rgba(C.sleep,.28);x.fillRect(X(23),L.y,X(30)-X(23),L.h);txt(x,'SLEEP',X(26.5),L.y+18*k,k,'center');
    x.strokeStyle='rgba(236,230,218,.35)';x.lineWidth=1;x.setLineDash([4,4]);x.beginPath();x.moveTo(X(23),L.y);x.lineTo(X(23),L.y+L.h);x.stroke();x.setLineDash([]);
    x.strokeStyle='rgba(236,230,218,.4)';x.beginPath();x.moveTo(L.x,L.y+L.h);x.lineTo(L.x+L.w,L.y+L.h);x.stroke();
    for(let hd=6;hd<=30;hd+=Ly.tick){x.beginPath();x.moveTo(X(hd),L.y+L.h);x.lineTo(X(hd),L.y+L.h+6);x.stroke();txt(x,String(hd%24).padStart(2,'0'),X(hd),L.y+L.h+20*k,k,'center');}
    txt(x,'BLOOD LEVEL',L.x,L.y-12,k);
    const end=Math.min(S.clock,30),st=S.dose;
    if(end>st){const N=120,pts=[];for(let i=0;i<=N;i++){const hd=lerp(st,end,i/N);pts.push([X(hd),w1(hd),w2(hd)]);}
      x.fillStyle=rgba(C.ir,.32);x.beginPath();x.moveTo(pts[0][0],Y(0));pts.forEach(p=>x.lineTo(p[0],Y(p[1])));x.lineTo(pts[N][0],Y(0));x.closePath();x.fill();
      x.fillStyle=rgba(C.dr,.42);x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],Y(p[1]+p[2])):x.moveTo(p[0],Y(p[1]+p[2])));for(let i=N;i>=0;i--)x.lineTo(pts[i][0],Y(pts[i][1]));x.closePath();x.fill();
      x.strokeStyle=C.line;x.lineWidth=2.5;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],Y(p[1]+p[2])):x.moveTo(p[0],Y(p[1]+p[2])));x.stroke();
      if(end<30){x.fillStyle=C.line;x.beginPath();x.arc(X(end),Y(lv(end)),5,0,TAU);x.fill();}
      if(end>=23){const b=lv(23);x.fillStyle=C.coat;x.beginPath();x.arc(X(23),Y(b),6,0,TAU);x.fill();txt(x,`${Math.round(b*100)}%`,X(23)+10,Y(b)-12,k,'left','rgba(236,230,218,.85)');}}
    x.fillStyle=C.dr;x.beginPath();x.roundRect(X(st)-9,L.y+L.h-6,18,12,6);x.fill();txt(x,'DOSE',X(st),L.y+L.h+38*k,k,'center',rgba(C.ir,.8));
    if(S.play||S.clock<30){x.strokeStyle='rgba(236,230,218,.25)';x.beginPath();x.moveTo(X(Math.max(6,end)),L.y);x.lineTo(X(Math.max(6,end)),L.y+L.h);x.stroke();}
    const q=s=>api.card.querySelector(s);if(q('#ad-clk')){const n=lv(S.clock);q('#ad-clk').textContent=hhmm(S.clock);q('#ad-now').textContent=Math.round(n*100)+'%';q('#ad-nowB').style.width=n*100+'%';
      const b=lv(23);q('#ad-bed').textContent=S.clock>=23?Math.round(b*100)+'%':'…';q('#ad-bedB').style.width=(S.clock>=23?b*100:0)+'%';}
  }
  return {id:'day',label:'Capsule',size:'2 cm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'capsule drawn to scale'},zoomFocus:{x:300,y:230},
    enter(){S.clock=S.dose-.4;S.play=true;},
    card(){return `<p class="k">Level 1 · the capsule · <span id="ad-clk">08:00</span></p><h2>Two waves in one capsule</h2>
      <p>Adderall XR holds two kinds of beads. The light, immediate-release ones free their amphetamine as soon as the capsule dissolves; the darker, delayed-release ones about four hours later (Heal 2013). The label compares one 20 mg capsule with two 10 mg immediate-release tablets taken four hours apart: the blood levels are comparable. After the peak, the level halves about every 10 hours.</p>
      <p><b style="color:var(--bone)">Drag the dose time and watch what is left at lights-out.</b></p>
      <label class="dv-meter"><span>Dose time</span><b id="ad-dt">08:00</b></label><input id="ad-dose" type="range" min="6" max="16" step=".5" value="${S.dose}" style="width:100%;accent-color:${cc(C.dr)}" aria-label="Dose time">
      <div class="dv-seg" role="radiogroup" aria-label="Taken"><button role="radio" data-f="0" aria-checked="${!S.fed}">Empty stomach</button><button role="radio" data-f="1" aria-checked="${S.fed}">After a high-fat meal</button></div>
      <div class="dv-meter"><span>Blood level now</span><b id="ad-now">0%</b><i><u id="ad-nowB" style="background:${cc(C.dr)}"></u></i></div>
      <div class="dv-meter"><span>At lights-out, 23:00</span><b id="ad-bed">…</b><i><u id="ad-bedB" style="background:${cc(C.sleep)}"></u></i></div>
      <p id="ad-note">${note()}</p>
      <div class="dv-btns"><button class="dv-btn go" id="ad-play" type="button">Play the day</button><button class="dv-btn" id="ad-go" type="button">Into a nerve ending<small>where amphetamine works</small></button></div>
      <p class="dv-fine">The curve is a model built from the label's numbers for d-amphetamine: two equal waves four hours apart, a peak about 5 hours after a dose on an empty stomach and nearer 8 after a high-fat meal (label: 5.2 and 7.7 hours with 30 mg), and a 10-hour half-life in adults. The l-form, a quarter of the dose, lasts longer (half-life about 13 hours in adults). It is illustrative, shown as a share of its own peak, and real levels vary a lot between people (McGough 2003). The capsule is to scale (the label lists 16–21 mm by strength); the beads are schematic. Tap the capsule to collect it.</p>`;},
    bind(card,api){const sl=card.querySelector('#ad-dose'),upd=()=>{card.querySelector('#ad-dt').textContent=hhmm(S.dose);card.querySelector('#ad-note').textContent=note();};
      sl.oninput=()=>{S.dose=+sl.value;S.play=false;S.clock=30;S.parts=[];upd();};
      card.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{S.fed=b.dataset.f==='1';card.querySelectorAll('[data-f]').forEach(y=>y.setAttribute('aria-checked',y===b));S.play=false;S.clock=30;upd();});
      card.querySelector('#ad-play').onclick=()=>{S.clock=S.dose-.4;S.play=true;S.parts=[];};
      card.querySelector('#ad-go').onclick=()=>api.go('synapse',{from:{x:300,y:230}});upd();},
    tap(p,api){const Ly=layout(api);if(Math.abs(p.x-Ly.cap.x)<9*Ly.cap.u+20&&Math.abs(p.y-Ly.cap.y)<3.2*Ly.cap.u+30)api.discover('add_caps');},
    draw,
  };
}

/* ---------------- level B: one nerve ending */
function synapseLevel(){
  const MEM=400,POST=462,VP=[[300,170],[425,112],[565,128],[695,182],[360,292],[505,246],[645,300]],DX=[320,500,680],RX=[250,375,500,625,750];
  let S;
  function reset(){const mode=S?.mode||'brain',prop=S?.prop||false;
    S={mode,prop,amph:false,ves:VP.map(([x,y])=>({x,y,n:8,acid:1,fuse:0})),cleft:[],cyto:Array.from({length:4},()=>({x:rand(240,760),y:rand(80,360),vx:0,vy:0})),ain:[],aout:[],
      dat:DX.map(x=>({x,cd:rand(0,.3),fl:0})),rec:RX.map(x=>({x,busy:0})),fired:0,rev:0,sig:0,flash:0,auto:1.2,spawn:0,tr:[],trt:0};}
  reset();
  const back=()=>S.ain.length>=3;
  function fire(){S.flash=1;const vs=S.ves.filter(v=>v.n>0).sort((a,b)=>b.y-a.y).slice(0,2);
    for(const v of vs){for(let i=0;i<v.n;i++)S.cleft.push({x:v.x+rand(-14,14),y:MEM+6,vx:rand(-40,40),vy:rand(30,70),l:rand(4,6)});S.fired+=v.n;v.n=0;v.fuse=1;}}
  const walk=(m,dt,x0,x1,y0,y1,sp)=>{m.vx+=rand(-1,1)*sp*dt*6;m.vy+=rand(-1,1)*sp*dt*6;const v=Math.hypot(m.vx,m.vy);if(v>sp){m.vx*=sp/v;m.vy*=sp/v;}m.x+=m.vx*dt;m.y+=m.vy*dt;
    if(m.y<y0){m.y=y0;m.vy=Math.abs(m.vy);}if(m.y>y1){m.y=y1;m.vy=-Math.abs(m.vy);}if(x0!=null){if(m.x<x0){m.x=x0;m.vx=Math.abs(m.vx);}if(m.x>x1){m.x=x1;m.vx=-Math.abs(m.vx);}}};
  function step(dt){
    S.auto-=dt;if(S.auto<=0){S.auto=3.2;fire();}S.flash=Math.max(0,S.flash-dt*2.5);
    if(S.amph){S.spawn+=dt*3;while(S.spawn>1&&S.aout.length<18){S.spawn--;const l=Math.random()<.5;S.aout.push({x:l?150:850,y:rand(MEM+8,POST-8),vx:l?40:-40,vy:0});}}
    for(const m of S.cleft){walk(m,dt,null,null,MEM+5,POST-5,70);m.l-=dt;}S.cleft=S.cleft.filter(m=>m.l>0&&m.x>140&&m.x<860);
    for(const m of S.aout)walk(m,dt,150,850,MEM+5,POST-5,60);
    for(const m of S.cyto)walk(m,dt,210,790,70,MEM-14,50);
    for(const m of S.ain){walk(m,dt,210,790,70,MEM-14,60);m.l-=dt*(S.amph?.4:1);}S.ain=S.ain.filter(m=>m.l>0);
    const ai=Math.min(1,S.ain.length/8);
    for(const v of S.ves){v.fuse=Math.max(0,v.fuse-dt*1.5);v.acid=lerp(v.acid,1-.8*ai,1-Math.exp(-dt*.6));
      if(v.n>0&&Math.random()<dt*1.6*(1-v.acid)){v.n--;const a=rand(0,TAU);S.cyto.push({x:v.x+Math.cos(a)*30,y:v.y+Math.sin(a)*30,vx:0,vy:0});}
      if(v.n<8&&v.acid>.6&&Math.random()<dt*2.2){const i=S.cyto.findIndex(m=>Math.hypot(m.x-v.x,m.y-v.y)<80);if(i>=0){S.cyto.splice(i,1);v.n++;}}}
    const tot=S.ves.reduce((a,v)=>a+v.n,0)+S.cyto.length+S.cleft.length;if(tot<50&&Math.random()<dt*.8)S.cyto.push({x:rand(240,760),y:rand(70,200),vx:0,vy:0});
    for(const d of S.dat){d.cd-=dt;d.fl=Math.max(0,d.fl-dt*3);if(d.cd>0)continue;d.cd=.28;
      const ia=S.aout.findIndex(m=>Math.abs(m.x-d.x)<70);
      if(ia>=0&&Math.random()<.75){const m=S.aout.splice(ia,1)[0];S.ain.push({x:d.x,y:MEM-16,vx:rand(-20,20),vy:-40,l:8});d.fl=1;}
      else if(!back()){const ic=S.cleft.findIndex(m=>Math.abs(m.x-d.x)<50&&m.y<MEM+30);if(ic>=0){S.cleft.splice(ic,1);S.cyto.push({x:d.x,y:MEM-16,vx:rand(-20,20),vy:-40});d.fl=1;}}
      if(back()){const ic=S.cyto.findIndex(m=>Math.abs(m.x-d.x)<220&&m.y>MEM-260);if(ic>=0){S.cyto.splice(ic,1);S.cleft.push({x:d.x,y:MEM+8,vx:rand(-30,30),vy:50,l:rand(4,6)});S.rev++;d.fl=1;}}}
    const blk=S.mode==='heart'&&S.prop;let b=0;for(const r of S.rec){const hit=!blk&&S.cleft.some(m=>m.y>POST-22&&Math.abs(m.x-r.x)<22);r.busy=hit?1:Math.max(0,r.busy-dt*1.5);b+=r.busy;}
    S.sig=lerp(S.sig,b/S.rec.length,1-Math.exp(-dt*1.2));S.trt+=dt;if(S.trt>.05){S.trt=0;S.tr.push(S.sig);if(S.tr.length>160)S.tr.shift();}
  }
  function draw(x,dt,t,api){step(dt);const k=tk(api),heart=S.mode==='heart',MC=heart?C.na:C.da;
    x.fillStyle='#0A0D16';x.fillRect(-400,-300,1800,1300);
    // the cell on the other side
    x.fillStyle=heart?'rgba(238,111,130,.10)':'rgba(238,111,130,.06)';x.fillRect(-400,POST,1800,600);
    if(heart){x.strokeStyle='rgba(238,111,130,.16)';x.lineWidth=6;for(let px=-380;px<1400;px+=46){x.beginPath();x.moveTo(px,POST+8);x.lineTo(px,1000);x.stroke();}}
    x.strokeStyle='#C9A0AA';x.lineWidth=4;x.beginPath();x.moveTo(-400,POST);x.lineTo(1400,POST);x.stroke();
    // the nerve ending
    x.fillStyle='rgba(120,160,244,.09)';x.strokeStyle=S.flash>0?`rgba(255,227,110,${.5+S.flash*.5})`:'#7E8FB8';x.lineWidth=4+S.flash*3;
    x.beginPath();x.roundRect(180,-80,640,MEM+80,[0,0,70,70]);x.fill();x.stroke();
    for(const v of S.ves){if(v.fuse>0){x.save();x.globalCompositeOperation='lighter';glow(x,v.x,MEM,60*v.fuse,rgba(MC,.6));x.restore();}
      x.fillStyle=rgba(C.acid,.04+.16*v.acid);x.strokeStyle='#B9C6E8';x.lineWidth=2;x.beginPath();x.arc(v.x,v.y,28,0,TAU);x.fill();x.stroke();
      x.fillStyle=C.vmat;x.beginPath();x.roundRect(v.x+15,v.y-27,13,9,3);x.fill();
      x.fillStyle=MC;for(let i=0;i<v.n;i++){const a=i/8*TAU+.4,r=i%2?14:9;x.beginPath();x.arc(v.x+Math.cos(a)*r,v.y+Math.sin(a)*r,3.6,0,TAU);x.fill();}}
    for(const d of S.dat){if(d.fl>0){x.save();x.globalCompositeOperation='lighter';glow(x,d.x,MEM,40*d.fl,rgba(C.dat,.5));x.restore();}transporter(x,d.x,MEM,1,back()?-1:1,C.dat);}
    for(const r of S.rec){x.strokeStyle=C.rec;x.lineWidth=6;x.beginPath();x.arc(r.x,POST+12,15,Math.PI*1.12,Math.PI*1.88,false);x.stroke();
      if(r.busy>0){x.save();x.globalCompositeOperation='lighter';glow(x,r.x,POST,30*r.busy,rgba(C.rec,.7));x.restore();}
      if(heart&&S.prop){x.fillStyle=C.prop;x.beginPath();x.roundRect(r.x-9,POST-9,18,12,5);x.fill();}}
    x.fillStyle=MC;for(const m of [...S.cyto,...S.cleft]){x.beginPath();x.arc(m.x,m.y,4,0,TAU);x.fill();}
    for(const m of [...S.ain,...S.aout])molAmph(x,m.x,m.y,1.05);
    txt(x,'NERVE ENDING',206,84,k);txt(x,'VESICLE · VMAT2',300,218+8*k,k,'center');txt(x,heart?'NET':'DAT',DX[0]-30,MEM-30,k,'right');
    const ph=api.phone(),ly=POST+(ph?26:44)+10*k;txt(x,'GAP',158,MEM+36,k);txt(x,heart?'HEART MUSCLE · β1 RECEPTORS':'NEXT NEURON · DOPAMINE RECEPTORS',206,ly,k);
    if(S.amph)txt(x,'AMPHETAMINE',842,ly+(ph?26*k:0),k,'right',rgba(C.amph,.8));
    // what the cell on the other side receives, over the last eight seconds
    const TY=POST+(ph?178:210),AMP=ph?66:90;x.strokeStyle='rgba(236,230,218,.18)';x.lineWidth=1;x.beginPath();x.moveTo(206,TY);x.lineTo(800,TY);x.stroke();
    x.strokeStyle=C.rec;x.lineWidth=2.5;x.beginPath();S.tr.forEach((v,i)=>{const px=800-(S.tr.length-1-i)*594/159,py=TY-v*AMP;i?x.lineTo(px,py):x.moveTo(px,py);});x.stroke();
    txt(x,heart?'PUSH ON THE HEART RATE':'SIGNAL RECEIVED',206,ph?ly+28*k:TY-100-8*k,k);
    const q=s=>api.card.querySelector(s);if(q('#as-g')){const st=S.ves.reduce((a,v)=>a+v.n,0)/56,g=Math.min(1,S.cleft.length/40);
      q('#as-g').textContent=Math.round(g*100)+'%';q('#as-gB').style.width=g*100+'%';q('#as-s').textContent=Math.round(st*100)+'%';q('#as-sB').style.width=st*100+'%';
      q('#as-x').textContent=Math.round(S.sig*100)+'%';q('#as-xB').style.width=S.sig*100+'%';q('#as-p').textContent=back()?'running backwards':'pulling in';q('#as-f').textContent=S.fired;q('#as-r').textContent=S.rev;}
  }
  const T={brain:'Dopamine waits in vesicles and is released when the nerve fires; the transporter DAT then pulls it back in, so each signal is short. Amphetamine rides in through DAT. Inside, it empties the vesicles, and DAT starts pumping dopamine out even when the nerve is quiet (Heal 2013; Sulzer 2011). <b style="color:var(--bone)">Watch a few firings, then add amphetamine.</b>',
    heart:'The nerves that speed up the heart work the same way, with norepinephrine and its transporter, NET, and amphetamine acts on them too (Heal 2013). The label lists an average rise of about 3–6 beats a minute and 2–4 mmHg. Propranolol doesn\'t stop the release: it blocks the β receptors where norepinephrine lands. That is the tug of war in the patient\'s day, which her prescribers balance. <b style="color:var(--bone)">Add amphetamine, then propranolol.</b>'};
  function body(card){const heart=S.mode==='heart';card.querySelector('#as-t').innerHTML=T[S.mode];card.querySelector('#as-gl').textContent=heart?'Norepinephrine in the gap':'Dopamine in the gap';
    card.querySelector('#as-xl').textContent=heart?'Push on the heart (β1 receptors)':'Signal to the next neuron';card.querySelector('#as-prop').hidden=!heart;
    card.querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-checked',b.dataset.m===S.mode));}
  return {id:'synapse',label:'Nerve ending',size:'1 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:500,y:400},
    card(){return `<p class="k">Level 2 · one nerve ending</p><h2>The pump that runs backwards</h2>
      <div class="dv-seg" role="radiogroup" aria-label="Where"><button role="radio" data-m="brain" aria-checked="true">In the brain</button><button role="radio" data-m="heart" aria-checked="false">Nerve to the heart</button></div>
      <p id="as-t"></p>
      <div class="dv-btns"><button class="dv-btn go" id="as-fire" type="button">Fire the nerve</button><button class="dv-btn" id="as-amph" type="button">Amphetamine<small>off</small></button><button class="dv-btn" id="as-prop" type="button" hidden>Propranolol<small>off</small></button></div>
      <div class="dv-meter"><span id="as-gl">Dopamine in the gap</span><b id="as-g">0%</b><i><u id="as-gB" style="background:${cc(C.da)}"></u></i></div>
      <div class="dv-meter"><span>Stored in vesicles</span><b id="as-s">100%</b><i><u id="as-sB" style="background:${cc(C.vmat)}"></u></i></div>
      <div class="dv-meter"><span id="as-xl">Signal to the next neuron</span><b id="as-x">0%</b><i><u id="as-xB" style="background:${cc(C.rec)}"></u></i></div>
      <div class="dv-meter"><span>Transporter</span><b id="as-p">pulling in</b></div>
      <div class="dv-meter"><span>Released by firing</span><b id="as-f">0</b></div><div class="dv-meter"><span>Released with no firing</span><b id="as-r">0</b></div>
      <div class="dv-btns"><button class="dv-btn" id="as-re" type="button">Start over</button></div>
      <p class="dv-fine">Schematic, not to scale; the speeds and amounts are illustrative. The label itself says only that amphetamines block the reuptake of norepinephrine and dopamine and increase their release, and that how this helps ADHD is not known; the steps drawn here come from laboratory studies (Heal 2013; Sulzer 2011). The vesicles' fading pink shows one of two lab explanations for the leak, the acid being soaked up; amphetamine also competes with dopamine at VMAT2. In brain-slice recordings, each firing released less as amphetamine worked while the steady leak grew (Sulzer 2011), as it does here. Tap the vesicles, transporters and molecules to collect them.</p>`;},
    bind(card,api){body(card);
      card.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{S.mode=b.dataset.m;body(card);});
      card.querySelector('#as-fire').onclick=fire;
      const tg=(id,key,g)=>{const b=card.querySelector(id);b.onclick=()=>{S[key]=!S[key];b.classList.toggle('on',S[key]);b.querySelector('small').textContent=S[key]?'on':'off';if(S[key])api.discover(g,true);};};
      tg('#as-amph','amph','add_amph');tg('#as-prop','prop','add_ne');
      card.querySelector('#as-re').onclick=()=>{reset();card.querySelectorAll('.dv-btn.on').forEach(b=>{b.classList.remove('on');b.querySelector('small').textContent='off';});S.prop=false;};},
    tap(p,api){const heart=S.mode==='heart';
      if([...S.ain,...S.aout].some(m=>Math.hypot(m.x-p.x,m.y-p.y)<24))return api.discover('add_amph');
      if(S.dat.some(d=>Math.abs(d.x-p.x)<30&&Math.abs(p.y-MEM)<30))return api.discover('add_dat');
      if(S.ves.some(v=>Math.hypot(v.x-p.x,v.y-p.y)<34))return api.discover('add_vmat');
      if(p.y>POST-10)return api.discover(heart?'add_ne':'add_da');
      if(p.y>MEM||S.cyto.some(m=>Math.hypot(m.x-p.x,m.y-p.y)<20))return api.discover(heart?'add_ne':'add_da');},
    draw,
  };
}

export const DIVE={color:'#78A0F4',top:{label:'Brain',size:'15 cm'},
  target:({centreOf})=>centreOf(['Right caudate nucleus','Left caudate nucleus','Right putamen','Left putamen']),view:{dist:.42,azim:25,elev:8},
  text:'Follow one morning capsule of the patient\'s Adderall XR through her day, then shrink into a single nerve ending to watch amphetamine run the dopamine pump backwards, in the brain and on the nerves that speed up the heart.',
  steps:[['The capsule\'s day, 2 cm.','Two kinds of beads, two waves of amphetamine. Move the dose time and see what is left at lights-out.'],['One nerve ending, 1 µm.','Fire the nerve, then add amphetamine: it rides in through the transporter, empties the vesicles and turns the pump around. Switch to the heart and add propranolol.']],
  also:[{dive:'pots',level:'rhythm',label:'POTS dive · the rhythm game',small:'the heart rate Adderall nudges up and propranolol holds down'}],
  refs:['lbl_adderall','heal2013','sulzer2011','faraone2018','mcgough2003','lbl_prop','lbl_lexapro','lbl_zofran'],
  make:()=>({levels:[dayLevel(),synapseLevel()],guide:GUIDE_AD}),
};
