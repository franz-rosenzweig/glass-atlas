// Ibuprofen dive: the stomach lining's prostaglandin shield (and what Lexapro adds to a bleed) → the COX channel ibuprofen sits in.
import { TAU, clamp, lerp, rand } from './dive.js';
import { G, glow, rgba, nucleus } from './dive-ra.js';
import { cc } from './theme.js';

const C={acid:'#F2705F',mucus:'#78A0F4',bic:'#9FE0F0',cell:'#E8B9B0',pg:'#F29A55',ibu:'#B193E3',rbc:'#E0525F',plt:'#E8B9D0',ht:'#FFD27A',cox1:'#62BED3',cox2:'#7FD3A3',aa:'#E8C77A',food:'#C9A26B'};
const LBL='rgba(236,230,218,.55)',FONT='11px "Martian Mono", monospace';
const bg=h=>`style="background:${cc(h)}"`;
function label(x,t,px,py,al='left'){x.fillStyle=LBL;x.font=FONT;x.textAlign=al;x.fillText(t,px,py);}
function poly(x,cx,cy,r,n,rot){x.beginPath();for(let i=0;i<n;i++){const a=rot+i/n*TAU;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();}
// one dose by the hour: the label's serum half-life of about 2 h; food slows absorption but doesn't shrink it (same area under the curve)
const KE=Math.LN2/2;
const level=(doses,h)=>doses.reduce((s,d)=>{const t=h-d.h;if(t<=0)return s;const ka=d.food?.9:2.2;return s+ka/(ka-KE)*(Math.exp(-KE*t)-Math.exp(-ka*t));},0);
const inh=L=>L/(L+.25);  // share of COX blocked at a given level: illustrative
// ibuprofen: a benzene ring with the isobutyl group on one side and the propionic acid on the other
function ibuG(x,cx,cy,s,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=C.ibu;x.fillStyle=rgba(C.ibu,.4);x.lineWidth=2.2;x.lineJoin='round';
  poly(x,0,0,8,6,Math.PI/6);x.fill();x.stroke();x.beginPath();x.moveTo(-7,0);x.lineTo(-13,-4);x.lineTo(-19,0);x.lineTo(-25,-4);x.moveTo(-19,0);x.lineTo(-19,7);
  x.moveTo(7,0);x.lineTo(13,-4);x.lineTo(13,-11);x.moveTo(13,-4);x.lineTo(19,0);x.stroke();x.fillStyle=C.acid;x.beginPath();x.arc(22,-2,2.6,0,TAU);x.arc(19,5,2.6,0,TAU);x.fill();x.restore();}
// arachidonic acid: a 20-carbon chain folded into a hairpin; PGH2: the same chain closed into a five-ring
function aaG(x,cx,cy,s,rot=0,col=C.aa){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=col;x.lineWidth=2.4;x.lineJoin='round';x.beginPath();
  for(let i=0;i<10;i++)x.lineTo(-16+i*3.6,-6+(i%2?-2.5:2.5));x.moveTo(-16,-6);x.quadraticCurveTo(-26,0,-16,6);for(let i=0;i<10;i++)x.lineTo(-16+i*3.6,6+(i%2?2.5:-2.5));x.stroke();x.restore();}
function pgG(x,cx,cy,s,rot=0,col=C.pg){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=col;x.fillStyle=rgba(col,.35);x.lineWidth=2.4;x.lineJoin='round';
  poly(x,-12,0,8,5,Math.PI);x.fill();x.stroke();x.beginPath();x.moveTo(-6,-5);for(let i=0;i<7;i++)x.lineTo(-2+i*3.6,-7+(i%2?-2.5:2.5));x.moveTo(-6,5);for(let i=0;i<7;i++)x.lineTo(-2+i*3.6,7+(i%2?2.5:-2.5));x.stroke();x.restore();}
function platelet(x,cx,cy,s,full){x.fillStyle=rgba(C.plt,.45);x.strokeStyle=C.plt;x.lineWidth=1.4;x.beginPath();x.ellipse(cx,cy,7*s,4.2*s,0,0,TAU);x.fill();x.stroke();
  if(full){x.fillStyle=C.ht;x.beginPath();x.arc(cx-2.5*s,cy,1.3*s,0,TAU);x.arc(cx+2.5*s,cy-.5*s,1.3*s,0,TAU);x.fill();}}

export const GUIDE_IB={
  ibu_mucus:{name:'Mucus and bicarbonate',kind:'The stomach\'s shield',size:'a gel layer over the cells',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.mucus,.3);x.fillRect(cx-60*s,cy-18*s,120*s,30*s);x.fillStyle=rgba(C.cell,.4);for(let i=-3;i<3;i++){x.beginPath();x.roundRect(cx+i*20*s+1,cy+14*s,18*s,30*s,4*s);x.fill();}
      x.fillStyle=C.bic;for(let i=0;i<9;i++){x.beginPath();x.arc(cx-50*s+i*12*s,cy+6*s-(i%3)*5*s,2.2*s,0,TAU);x.fill();}x.fillStyle=C.acid;for(let i=0;i<6;i++){x.beginPath();x.arc(cx-45*s+i*18*s,cy-30*s,2.2*s,0,TAU);x.fill();}},
    text:['The stomach holds acid strong enough to digest tissue (about 0.1 mol/L hydrochloric acid). Surface cells protect themselves with a gel of mucus and bicarbonate, tight seals between cells, constant renewal and a steady blood flow (Laine 2008).','NSAID injury comes mainly from switching off the COX enzymes that keep this defence going (Laine 2008).']},
  ibu_pg:{name:'Prostaglandins',kind:'Local signals',size:'under 1 nm',draw:(x,cx,cy,s)=>{aaG(x,cx-34*s,cy,s*1.6);x.strokeStyle=LBL;x.lineWidth=2*s;x.beginPath();x.moveTo(cx-6*s,cy);x.lineTo(cx+8*s,cy);x.stroke();pgG(x,cx+38*s,cy,s*1.6);},
    text:['Made on the spot from arachidonic acid, a fat cut from cell membranes, by the COX enzymes (Ricciotti 2011). They act where they are made.','In the stomach they keep up nearly every part of the lining\'s defence: mucus, bicarbonate, blood flow, repair (Wallace 2008). In inflamed tissue, PGE2 widens and leaks small vessels and sensitises pain nerves: redness, swelling and pain (Ricciotti 2011).']},
  ibu_cox1:{name:'COX-1',kind:'Enzyme, always on',size:'nanometres',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.cox1,.3);x.strokeStyle=C.cox1;x.lineWidth=2*s;x.beginPath();x.ellipse(cx,cy-4*s,46*s,38*s,0,0,TAU);x.fill();x.stroke();x.strokeStyle='#04070B';x.lineWidth=7*s;x.beginPath();x.moveTo(cx-8*s,cy+34*s);x.quadraticCurveTo(cx-14*s,cy,cx+4*s,cy-18*s);x.stroke();},
    text:['A "housekeeping" enzyme found in almost every tissue. Its prostaglandins protect the stomach lining and keep the kidneys\' blood flow steady, and in platelets it makes thromboxane (Crofford 1997; Ricciotti 2011).','Blocking COX-1 is thought to drive most of the stomach harm of NSAIDs (Warner 1999), though in rats the damage needed both COX-1 and COX-2 blocked (Wallace 2000).']},
  ibu_cox2:{name:'COX-2',kind:'Enzyme, switched on by inflammation',size:'nanometres',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.cox2,.3);x.strokeStyle=C.cox2;x.lineWidth=2*s;x.beginPath();x.ellipse(cx,cy-4*s,46*s,38*s,0,0,TAU);x.fill();x.stroke();x.strokeStyle='#04070B';x.lineWidth=7*s;x.beginPath();x.moveTo(cx-8*s,cy+34*s);x.quadraticCurveTo(cx-14*s,cy,cx+4*s,cy-18*s);x.stroke();G.tnf(x,cx+52*s,cy-30*s,.5*s);},
    text:['Barely present in most tissues until inflammation switches it on: signals such as IL-1 and TNF raise it in joint-lining cells, cartilage, bone and immune cells, and RA joint linings make extra (Crofford 1997).','Its prostaglandins drive the pain and swelling ibuprofen eases. Steroids turn it down too (Crofford 1997).']},
  ibu_drug:{name:'Ibuprofen',kind:'Medicine (NSAID)',size:'about 1 nm',draw:(x,cx,cy,s)=>ibuG(x,cx,cy,s*2.2,0),
    text:['It blocks both COX-1 and COX-2. It fills the enzyme\'s long channel just above its entrance, anchored there by two of its building blocks, arginine 120 and tyrosine 355 (shown in mouse COX-2). A tablet holds two mirror-image forms (label); in the crystal only the S-form was bound (Orlando 2015).','It doesn\'t stay: the serum half-life is about 2 hours and peak levels come 1–2 hours after a dose (label), so the channels open again within hours.']},
  ibu_txa:{name:'Platelets and thromboxane',kind:'Plugging a leak',size:'platelets a few µm',draw:(x,cx,cy,s)=>{for(const [a,b] of [[-26,4],[-8,-6],[10,6],[28,-2],[0,14]])platelet(x,cx+a*s,cy+b*s,s*2.2,true);x.strokeStyle='#FF6FA8';x.lineWidth=2*s;for(let i=0;i<3;i++){x.beginPath();x.arc(cx,cy,(30+i*12)*s,-.6,.6);x.stroke();}},
    text:['Platelets make thromboxane A2 mainly with COX-1, and it calls more platelets to stick and clump into a plug (Ricciotti 2011). Ibuprofen dulls this, but unlike aspirin its effect on platelets is smaller, shorter and reversible (label).','SSRIs like Lexapro drain much of the serotonin platelets release as a weak second clumping signal (paroxetine, −83%: Hergovich 2000; escitalopram: Dvojkovic 2021), and the two together raise the odds of a bleed from the stomach or upper gut more than either alone (Oka 2014). See the Lexapro dive.']},
};

/* ---------------- level A: the stomach lining */
function liningLevel(jump){
  const SY=270,LOOPS=[210,500,790],VY=560;
  const CELLS=Array.from({length:50},(_,i)=>({x:-140+i*26+13,y:SY}));
  const M={lex:true};let S;
  function reset(){S={h:0,doses:[],food:S?.food??true,L:0,I:0,P:1,Sh:1,U:0,er:[],reg:0,regNext:0,tabs:[],parts:[],pgs:[],drops:[],
    acid:Array.from({length:46},()=>({x:rand(-100,1100),y:rand(10,200),vx:rand(-20,20),vy:rand(-20,20)})),blood:Array.from({length:40},(_,i)=>({x:rand(-150,1150),y:VY+rand(-14,14),k:i%5===0?'plt':'rbc'}))};}
  reset();
  function takeDose(){S.doses.push({h:S.h+.05,food:S.food});S.U=Math.min(1,S.U+(S.food?.25:.7));S.tabs.push({x:rand(380,620),y:-30,t:0,food:S.food});}
  function step(dt){const dh=dt/(S.reg>0?.45:1);S.h+=dh;
    if(S.reg>0&&S.h>=S.regNext){takeDose();S.reg--;S.regNext=S.h+6;}
    S.doses=S.doses.filter(d=>S.h-d.h<24);S.L=level(S.doses,S.h);S.I=inh(S.L);
    S.P=lerp(S.P,1-S.I,1-Math.exp(-dh/.5));S.Sh=lerp(S.Sh,.15+.85*S.P,1-Math.exp(-dh/3));S.U*=Math.exp(-dh/1.5);
    if(S.Sh<.6&&S.er.length<5&&Math.random()<dh*(.6-S.Sh)*1.5){const ex=rand(180,820);if(!S.er.some(e=>Math.abs(e.x-ex)<50))S.er.push({x:ex,d:.05,bleed:false,plug:0});}
    const pw=(1-.5*S.I)*(M.lex?.55:1);let bleed=0;
    for(const e of S.er){if(S.Sh<.6)e.d=Math.min(1,e.d+dh*(.6-S.Sh)*.9);else e.d-=dh*(e.bleed&&e.plug<1?.03:.12);
      if(!e.bleed&&e.d>.7&&Math.random()<dh*.8)e.bleed=true;
      if(e.bleed&&e.plug<1){e.plug=Math.min(1,e.plug+dh*.35*pw);const b=e.d*(1-e.plug);bleed+=b;if(Math.random()<dt*8*b)S.drops.push({x:e.x+rand(-8,8),y:SY+10,vy:-rand(30,60),f:1});}}
    S.er=S.er.filter(e=>e.d>0);S.bleed=bleed;
    for(const a of S.acid){a.vx+=rand(-40,40)*dt;a.vy+=rand(-40,40)*dt;a.vx*=.98;a.vy*=.98;a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.x<-100)a.x=1100;if(a.x>1100)a.x=-100;
      const floor=SY-mucusH()+(1-S.Sh)*mucusH()*.85;if(a.y>floor){a.y=floor;a.vy=-Math.abs(a.vy);}if(a.y<10){a.y=10;a.vy=Math.abs(a.vy);}}
    for(const b of S.blood){b.x+=dt*(b.k==='plt'?50:60);if(b.x>1150)b.x=-150;}
    for(const tb of S.tabs){tb.t+=dt;tb.y=Math.min(SY-mucusH()-20,tb.y+dt*160);if(tb.t>1.2&&!tb.done){tb.done=true;for(let k=0;k<18;k++)S.parts.push({x:tb.x+rand(-10,10),y:tb.y,vx:rand(-50,50),vy:rand(-20,30),f:1});}}
    S.tabs=S.tabs.filter(tb=>!tb.done);
    for(const p of S.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.f-=dt*.35;}S.parts=S.parts.filter(p=>p.f>0);
    if(Math.random()<dt*7*S.P){const c=CELLS[Math.floor(rand(0,CELLS.length))];S.pgs.push({x:c.x+rand(-8,8),y:c.y+20,f:1,rot:rand(-.3,.3)});}
    for(const g of S.pgs){g.y-=dt*14;g.f-=dt*.6;}S.pgs=S.pgs.filter(g=>g.f>0);
    for(const d of S.drops){d.y+=d.vy*dt;d.f-=dt*.4;}S.drops=S.drops.filter(d=>d.f>0);}
  const mucusH=()=>18+52*S.Sh;
  function draw(x,dt,t,api){step(dt);const mh=mucusH(),food=S.doses.some(d=>d.food&&S.h-d.h<2.5);
    x.fillStyle='#140F0C';x.fillRect(-400,-300,1800,SY+300);x.fillStyle='#1A1012';x.fillRect(-400,SY,1800,800);
    x.strokeStyle='rgba(200,150,170,.08)';x.lineWidth=2;for(let i=0;i<70;i++){const fx=(i*137)%1300-150,fy=SY+80+(i*71)%400;x.beginPath();x.moveTo(fx,fy);x.bezierCurveTo(fx+30,fy-10,fx+60,fy+10,fx+90,fy);x.stroke();}
    // food in the lumen
    if(food)for(let i=0;i<12;i++){const fx=150+((i*137)%700),fy=60+((i*71)%(SY-mh-90));x.fillStyle=rgba(C.food,.45);x.beginPath();x.ellipse(fx,fy,18+(i%3)*6,11+(i%2)*4,i,0,TAU);x.fill();}
    // capillaries: the vessel below and its loops up toward the surface
    x.strokeStyle='rgba(200,50,70,.55)';x.lineWidth=12;x.lineCap='round';for(const lx of LOOPS){x.beginPath();x.moveTo(lx-14,VY);x.lineTo(lx-14,SY+90);x.arc(lx,SY+90,14,Math.PI,0);x.lineTo(lx+14,VY);x.stroke();}
    x.fillStyle='rgba(120,20,34,.65)';x.fillRect(-400,VY-20,1800,40);
    for(const b of S.blood){if(b.k==='rbc'){x.fillStyle='rgba(225,70,80,.8)';x.beginPath();x.ellipse(b.x,b.y,8,5,0,0,TAU);x.fill();}else platelet(x,b.x,b.y,1,!M.lex);}
    const nI=Math.round(16*S.L);for(let i=0;i<nI;i++){const px=((i*157+t*60)%1300)-150,py=VY+((i*29)%26)-13;x.fillStyle=C.ibu;x.beginPath();x.arc(px,py,3,0,TAU);x.fill();}
    // mucus gel with bicarbonate near the cells
    x.fillStyle=rgba(C.mucus,.18+.12*S.Sh);x.fillRect(-400,SY-mh,1800,mh);
    const nb=Math.round(40*S.Sh);x.fillStyle=C.bic;for(let i=0;i<nb;i++){const bx=((i*97)%1000),by=SY-4-((i*37)%Math.max(4,mh*.6));x.beginPath();x.arc(bx,by,2,0,TAU);x.fill();}
    // the surface cells, with raw spots where they've been lost
    const hurt=cx=>{let h=0;for(const e of S.er){const w=14+20*e.d;if(Math.abs(cx-e.x)<w)h=Math.max(h,e.d);}return h;};
    for(const c of CELLS){const h=hurt(c.x);if(h>.5)continue;x.save();x.translate(c.x,c.y+32);x.globalAlpha=1-h*1.4;
      x.fillStyle=rgba(C.cell,.26);x.strokeStyle=rgba(C.cell,.6);x.lineWidth=1.4;x.beginPath();x.roundRect(-11,-30,22,60,4);x.fill();x.stroke();
      x.fillStyle=rgba(C.mucus,.5);x.beginPath();x.ellipse(0,-20,7,6,0,0,TAU);x.fill();nucleus(x,0,16,5,6);x.restore();}
    for(const e of S.er){const w=10+16*e.d,dp=14+110*e.d;x.fillStyle='rgba(70,18,26,.9)';x.beginPath();x.moveTo(e.x-w,SY-2);x.quadraticCurveTo(e.x-w*.6,SY+dp,e.x,SY+dp);x.quadraticCurveTo(e.x+w*.6,SY+dp,e.x+w,SY-2);x.closePath();x.fill();
      x.strokeStyle=rgba(C.acid,.8);x.lineWidth=2;x.stroke();
      if(e.bleed){x.fillStyle='rgba(225,70,80,.85)';x.beginPath();x.arc(e.x,SY+dp-4,4+5*(1-e.plug),0,TAU);x.fill();
        const n=Math.round(e.plug*8);for(let k=0;k<n;k++)platelet(x,e.x-8+(k%4)*5,SY+dp-12-Math.floor(k/4)*7,.8,!M.lex);}}
    for(const d of S.drops){x.globalAlpha=d.f;x.fillStyle='rgba(225,70,80,.9)';x.beginPath();x.arc(d.x,d.y,3.5,0,TAU);x.fill();x.globalAlpha=1;}
    for(const g of S.pgs){x.globalAlpha=Math.min(1,g.f);pgG(x,g.x,g.y,.55,g.rot);x.globalAlpha=1;}
    // acid, the tablet and what dissolves from it
    x.fillStyle=C.acid;for(const a of S.acid){x.beginPath();x.arc(a.x,a.y,2.4,0,TAU);x.fill();}
    for(const tb of S.tabs){x.fillStyle='#ECE6DA';x.beginPath();x.roundRect(tb.x-16,tb.y-8,32,16,8);x.fill();x.strokeStyle=C.ibu;x.lineWidth=2;x.stroke();}
    for(const p of S.parts){x.globalAlpha=p.f;x.fillStyle=C.ibu;x.beginPath();x.arc(p.x,p.y,2.6,0,TAU);x.fill();x.globalAlpha=1;}
    label(x,'STOMACH ACID',150,34);label(x,'MUCUS + BICARBONATE',850,SY-mh-8,'right');label(x,'SURFACE CELLS',355,SY+88,'center');label(x,'CAPILLARY',150,VY+44);
    const q=s=>api.card.querySelector(s);if(q('#ib-h')){q('#ib-h').textContent=Math.floor(S.h);
      const set=(k,v,w)=>{q('#ib-'+k).textContent=w;q('#ib-'+k+'B').style.width=clamp(v,0,1)*100+'%';};
      set('l',S.L/.75,S.L<.03?'none':S.L<.3?'low':S.L<.6?'moderate':'peak');set('p',S.P,Math.round(S.P*100)+'%');set('s',S.Sh,S.Sh>.8?'intact':S.Sh>.6?'thinning':'thin');
      set('u',S.U,S.U<.1?'none':S.U<.4?'mild':'marked');set('b',S.bleed/1.2,S.er.length?`${S.er.length} raw ${S.er.length>1?'spots':'spot'}${S.bleed>.02?', bleeding':''}`:'none');
      const used=S.doses.length>0||S.reg>0,row=(M.lex?1:0)+(used?2:0);api.card.querySelectorAll('[data-odds]').forEach(r=>{const on=+r.dataset.odds===row;r.querySelector('span').style.color=on?'var(--bone)':'';r.querySelector('span').style.fontWeight=on?'600':'';r.querySelector('b').textContent=r.dataset.v+(on?' · now':'');});
      q('#ib-dose').disabled=S.reg>0;}
  }
  return {id:'lining',label:'Stomach lining',size:'100 µm',fit:'cover',bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:500,y:SY+60},
    prep(o){if(o?.lex!==undefined)M.lex=!!o.lex;},
    card(){const odds=[['Neither','1.0×',25],['An SSRI like Lexapro','1.7×',43],['An NSAID like ibuprofen','2.6×',64],['Both','4.0×',100]];
      return `<p class="k">Level 1 · the stomach lining · hour <span id="ib-h">0</span></p><h2>Why food doesn't remove the risk</h2>
      <p>The lining survives its own acid behind a shield of mucus and bicarbonate from the surface cells, kept renewed by a steady blood supply (Laine 2008). Prostaglandins made by COX enzymes right here keep nearly every part of that shield going (Wallace 2008). Ibuprofen reaches them from the blood, however it was swallowed.</p>
      <p><b style="color:var(--bone)">Take doses with and without food, then try round-the-clock doses.</b></p>
      <div class="dv-seg" role="radiogroup" aria-label="Taken"><button role="radio" data-f="1" aria-checked="${S.food}">With food</button><button role="radio" data-f="0" aria-checked="${!S.food}">Empty stomach</button></div>
      <div class="dv-btns"><button class="dv-btn go" id="ib-dose" type="button">Take a dose</button><button class="dv-btn" id="ib-reg" type="button">Round the clock<small>four a day for three days</small></button><button class="dv-btn${M.lex?' on':''}" id="ib-lex" type="button">Lexapro<small>${M.lex?'on: platelets low on serotonin':'off'}</small></button></div>
      <div class="dv-meter"><span>Ibuprofen in the blood</span><b id="ib-l">none</b><i><u id="ib-lB" ${bg(C.ibu)}></u></i></div>
      <div class="dv-meter"><span>Prostaglandins in the lining</span><b id="ib-p">100%</b><i><u id="ib-pB" ${bg(C.pg)}></u></i></div>
      <div class="dv-meter"><span>Mucus and bicarbonate shield</span><b id="ib-s">intact</b><i><u id="ib-sB" ${bg(C.mucus)}></u></i></div>
      <div class="dv-meter"><span>Upset stomach (illustrative)</span><b id="ib-u">none</b><i><u id="ib-uB" ${bg('#DDB741')}></u></i></div>
      <div class="dv-meter"><span>Damage</span><b id="ib-b">none</b><i><u id="ib-bB" ${bg(C.rbc)}></u></i></div>
      <p class="sub">Odds of a bleed from the stomach or upper gut</p>
      ${odds.map(([l,v,w],i)=>`<div class="dv-meter" data-odds="${i}" data-v="${v}"><span>${l}</span><b>${v}</b><i><u style="background:${cc(C.rbc)};width:${w}%"></u></i></div>`).join('')}
      <p class="dv-fine" style="margin-top:4px">From a meta-analysis, compared with taking neither (Oka 2014). The SSRI-alone figure wasn't statistically clear; the others were.</p>
      <div class="dv-btns"><button class="dv-btn" id="ib-go" type="button">Zoom into the COX enzyme<small>where ibuprofen works, 10 nm</small></button><button class="dv-btn" id="ib-lx" type="button">Lexapro and platelets<small>the Lexapro dive</small></button><button class="dv-btn" id="ib-re" type="button">Start over</button></div>
      <p class="dv-fine">Food: the label suggests meals or milk if ibuprofen upsets the stomach, and food slows absorption without lowering how much gets in. The injury comes mainly from losing COX-made prostaglandins (Laine 2008), so food doesn't remove the bleeding risk.</p>
      <p class="dv-fine">Time is squeezed (an hour passes in about a second, faster during round-the-clock doses) and the damage is exaggerated so you can see it; the prostaglandin and shield levels are illustrative. In real life, ulcers, bleeding or perforation from NSAIDs happen in about 1% of people treated for 3–6 months and 2–4% over a year, more with an SSRI, a steroid or a blood thinner; the label says to use the lowest dose for the shortest time. Slow, hidden bleeding can also cause anaemia (label). Tap the mucus, the cells or the vessel to collect them.</p>`;},
    bind(card,api){card.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{S.food=b.dataset.f==='1';card.querySelectorAll('[data-f]').forEach(y=>y.setAttribute('aria-checked',y===b));});
      card.querySelector('#ib-dose').onclick=takeDose;card.querySelector('#ib-reg').onclick=()=>{S.reg=12;S.regNext=S.h;};
      const lx=card.querySelector('#ib-lex');lx.onclick=()=>{M.lex=!M.lex;lx.classList.toggle('on',M.lex);lx.querySelector('small').textContent=M.lex?'on: platelets low on serotonin':'off';};
      card.querySelector('#ib-re').onclick=reset;card.querySelector('#ib-go').onclick=()=>api.go('cox',{from:{x:500,y:SY+60}});
      card.querySelector('#ib-lx').onclick=()=>jump('med:lexapro',{level:'sert',opt:{mode:'plt',drug:true}});},
    tap(p,api){const mh=mucusH();if(p.y>VY-30&&p.y<VY+30)return api.discover('ibu_txa');
      if(S.er.some(e=>Math.abs(p.x-e.x)<30&&p.y>SY-10&&p.y<SY+140))return api.discover('ibu_txa');
      if(p.y>SY-mh-6&&p.y<SY+6)return api.discover('ibu_mucus');if(p.y>=SY+6&&p.y<SY+80)return api.discover('ibu_pg');
      if(p.y<SY-mh&&S.parts.length)return api.discover('ibu_drug');},
    draw,
  };
}

/* ---------------- level B: the COX channel */
function coxLevel(jump){
  const MY=560,EZ=[{cx:300,col:C.cox1,k:'ibu_cox1'},{cx:700,col:C.cox2,k:'ibu_cox2'}];
  const chan=cx=>[[cx-26,MY-6],[cx-46,MY-90],[cx+34,MY-130],[cx+8,MY-214]];
  const at=(P,u)=>{const v=1-u;return [v*v*v*P[0][0]+3*v*v*u*P[1][0]+3*v*u*u*P[2][0]+u*u*u*P[3][0],v*v*v*P[0][1]+3*v*v*u*P[1][1]+3*v*u*u*P[2][1]+u*u*u*P[3][1]];};
  const heme=cx=>[cx+76,MY-262];
  let S;
  function reset(){S={h:0,doses:[],L:0,inflam:false,a2:.15,aa:[],ibu:[],prod:[],tnf:[],acc:0,ch:EZ.map(e=>({...e,busy:null,seat:null,occ:0}))};}
  reset();
  function step(dt){const dh=dt/2;S.h+=dh;S.doses=S.doses.filter(d=>S.h-d.h<24);S.L=level(S.doses,S.h);
    S.a2=lerp(S.a2,S.inflam?1:.15,1-Math.exp(-dt*.8));
    // arachidonic acid, freed from the membrane, slides along it to the channel mouths
    S.acc+=dt*1.3;while(S.acc>1){S.acc--;const dir=Math.random()<.5?1:-1;S.aa.push({x:dir>0?120:880,y:MY-14,vx:dir*rand(60,90),st:'mem',u:0,t:0});}
    for(const a of S.aa){a.t+=dt;
      if(a.st==='mem'){a.x+=a.vx*dt;for(const c of S.ch){const m=chan(c.cx)[0];if(Math.abs(a.x-m[0])<10&&!c.busy&&!c.seat&&!a.tried?.includes(c)){(a.tried??=[]).push(c);if(Math.random()<(c.cx>500?S.a2:1)){c.busy=a;a.c=c;a.st='chan';a.u=0;}}}if(a.x<100||a.x>900)a.gone=true;}
      else if(a.st==='chan'){a.u+=dt/.9;if(a.u>=1){a.st='perox';a.t=0;}}
      else if(a.st==='perox'){if(a.t>.45){a.st='out';a.t=0;a.c.busy=null;const [hx,hy]=heme(a.c.cx);S.prod.push({x:hx,y:hy,tx:a.c.cx>500?720:250,ty:110,f:1,c:a.c});a.gone=true;}}}
    S.aa=S.aa.filter(a=>!a.gone);
    for(const p of S.prod){p.x=lerp(p.x,p.tx,dt*1.2);p.y=lerp(p.y,p.ty,dt*1.2);p.f-=dt*.5;}S.prod=S.prod.filter(p=>p.f>0);
    // ibuprofen: free molecules track the blood level; each one seated in a channel entrance leaves again after a second or so
    const want=Math.round(12*S.L),free=S.ibu.filter(m=>m.st==='free'&&!m.leave);
    if(free.length+S.ch.filter(c=>c.seat).length<want&&Math.random()<dt*6)S.ibu.push({x:rand(160,840),y:rand(140,200),a:rand(0,TAU),st:'free',rot:rand(0,6)});
    if(free.length+S.ch.filter(c=>c.seat).length>want+1&&free.length)free[0].leave=true;
    for(const m of S.ibu){m.rot+=dt*.5;if(m.st==='free'){m.a+=rand(-1,1)*dt*4;m.x+=Math.cos(m.a)*55*dt;m.y+=(m.leave?-90:Math.sin(m.a)*55)*dt;if(m.leave){if(m.y<-40)m.gone=true;continue;}
        if(m.x<150||m.x>850){m.x=clamp(m.x,150,850);m.a=Math.PI-m.a;}if(m.y<130||m.y>MY-40){m.y=clamp(m.y,130,MY-40);m.a=-m.a;}}
      else if(m.st==='seat'){const [sx,sy]=at(chan(m.c.cx),.2);m.x=lerp(m.x,sx,dt*6);m.y=lerp(m.y,sy,dt*6);m.t-=dt;if(m.t<=0){m.c.seat=null;m.st='free';m.y=MY-60;m.a=-Math.PI/2;}}}
    for(const c of S.ch){if(!c.seat&&!c.busy&&Math.random()<dt*3*S.L){const f=S.ibu.filter(m=>m.st==='free'&&!m.leave);if(f.length){const m=f.reduce((b,y)=>Math.abs(y.x-c.cx)<Math.abs(b.x-c.cx)?y:b);m.st='seat';m.c=c;m.t=-Math.log(Math.random())*1.2;c.seat=m;}}
      c.occ=lerp(c.occ,c.seat?1:0,1-Math.exp(-dt/2.5));}
    S.ibu=S.ibu.filter(m=>!m.gone);
    if(S.inflam&&S.tnf.length<4&&Math.random()<dt)S.tnf.push({x:900,y:rand(150,230),f:0,rot:rand(0,6)});for(const k of S.tnf){k.x-=dt*30;k.f=Math.min(1,k.f+dt);k.rot+=dt*.3;if(!S.inflam||k.x<760)k.f-=dt*2;}S.tnf=S.tnf.filter(k=>k.f>0);}
  function enzyme(x,c,a){x.save();x.globalAlpha*=a;const cx=c.cx;
    // membrane-binding helices dip into the upper leaflet only
    x.fillStyle=rgba(c.col,.5);for(let i=-2;i<=1;i++){x.beginPath();x.roundRect(cx-40+i*30,MY-26,22,18,6);x.fill();}
    x.beginPath();x.moveTo(cx-150,MY-60);x.bezierCurveTo(cx-170,MY-200,cx-90,MY-300,cx+10,MY-300);x.bezierCurveTo(cx+130,MY-300,cx+170,MY-200,cx+150,MY-90);x.bezierCurveTo(cx+130,MY-20,cx-120,MY-10,cx-150,MY-60);x.closePath();
    x.fillStyle=rgba(c.col,.22);x.fill();x.strokeStyle=c.col;x.lineWidth=2.5;x.stroke();
    const P=chan(cx);x.strokeStyle='#0A0F14';x.lineWidth=24;x.lineCap='round';x.beginPath();x.moveTo(...P[0]);x.bezierCurveTo(...P[1],...P[2],...P[3]);x.stroke();
    x.strokeStyle=rgba(c.col,.5);x.lineWidth=1.5;x.setLineDash([4,4]);x.beginPath();x.moveTo(...P[0]);x.bezierCurveTo(...P[1],...P[2],...P[3]);x.stroke();x.setLineDash([]);
    const [hx,hy]=heme(cx);x.fillStyle='#C0392B';x.beginPath();poly(x,hx,hy,10,4,Math.PI/4);x.fill();x.fillStyle='#FFB36B';x.beginPath();x.arc(hx,hy,3,0,TAU);x.fill();x.restore();}
  function draw(x,dt,t,api){step(dt);
    x.fillStyle='#0C1016';x.fillRect(-400,-300,1800,MY+300);x.fillStyle='#120B12';x.fillRect(-400,MY,1800,600);
    for(let xx=-300;xx<=1300;xx+=20)for(const s of [-1,1]){x.fillStyle='#8FA3A6';x.beginPath();x.arc(xx,MY+s*30,7,0,TAU);x.fill();x.strokeStyle='rgba(143,163,166,.5)';x.lineWidth=2;x.beginPath();x.moveTo(xx-3,MY+s*23);x.lineTo(xx-3,MY+s*4);x.moveTo(xx+3,MY+s*23);x.lineTo(xx+3,MY+s*4);x.stroke();}
    enzyme(x,S.ch[0],1);enzyme(x,S.ch[1],.3+.7*S.a2);
    for(const k of S.tnf){x.save();x.globalAlpha=clamp(k.f,0,1);G.tnf(x,k.x,k.y,.7,k.rot);x.restore();}
    for(const a of S.aa){let px=a.x,py=a.y,rot=0;if(a.st==='chan'){[px,py]=at(chan(a.c.cx),a.u);rot=-Math.PI/2;}else if(a.st==='perox'){const [ax,ay]=at(chan(a.c.cx),1),[hx,hy]=heme(a.c.cx);const u=clamp(a.t/.45,0,1);px=lerp(ax,hx,u);py=lerp(ay,hy,u);rot=-Math.PI/2;
        x.save();x.globalCompositeOperation='lighter';glow(x,ax,ay,26*(1-u),'rgba(255,200,120,.6)');x.restore();}
      aaG(x,px,py,.9,rot);}
    for(const p of S.prod){x.globalAlpha=clamp(p.f,0,1);pgG(x,p.x,p.y,.9,0,p.c.cx>500?C.pg:'#FF6FA8');x.globalAlpha=1;}
    for(const m of S.ibu)ibuG(x,m.x,m.y,1,m.st==='seat'?-Math.PI/2:m.rot);
    label(x,'STOMACH SHIELD,',250,64,'center');label(x,'PLATELET THROMBOXANE',250,80,'center');label(x,'PAIN, SWELLING',720,72,'center');
    label(x,'COX-1 · ALWAYS ON',300,MY+64,'center');label(x,'COX-2 · INDUCED',700,MY+64,'center');label(x,'CHANNEL',236,MY-160,'right');
    if(S.inflam)label(x,'TNF, IL-1',850,138,'right');
    const q=s=>api.card.querySelector(s);if(q('#ic-h')){q('#ic-h').textContent=Math.floor(S.h);q('#ic-l').textContent=S.L<.03?'none':S.L<.3?'low':S.L<.6?'moderate':'peak';q('#ic-lB').style.width=clamp(S.L/.75,0,1)*100+'%';
      const o1=1-S.ch[0].occ,o2=S.a2*(1-S.ch[1].occ);q('#ic-1').textContent=Math.round(o1*100)+'%';q('#ic-1B').style.width=o1*100+'%';q('#ic-2').textContent=Math.round(o2*100)+'%';q('#ic-2B').style.width=o2*100+'%';}
  }
  return {id:'cox',label:'COX enzyme',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:300,y:MY-150},
    card(){return `<p class="k">Level 2 · one enzyme · hour <span id="ic-h">0</span></p><h2>Inside the COX channel</h2>
      <p>Cells cut a fat called arachidonic acid (gold) from their membranes. A COX enzyme, anchored in one layer of the membrane, draws it up a long channel and makes PGH2, the parent of the prostaglandins and thromboxane (Picot 1994; Ricciotti 2011).</p>
      <p>COX-1 is on almost everywhere and keeps the stomach lining and platelets working. COX-2 is barely there until inflammation switches it on (IL-1 and TNF do this in an RA joint lining), and its prostaglandins drive pain and swelling (Crofford 1997).</p>
      <p><b style="color:var(--bone)">Switch on the inflammation, then take a dose</b> and watch ibuprofen (violet) sit in both channels and let go as the level falls.</p>
      <div class="dv-btns"><button class="dv-btn" id="ic-inf" type="button">Inflammation<small>off</small></button><button class="dv-btn go" id="ic-dose" type="button">Take a dose</button><button class="dv-btn" id="ic-re" type="button">Start over</button></div>
      <div class="dv-meter"><span>Ibuprofen in the blood</span><b id="ic-l">none</b><i><u id="ic-lB" ${bg(C.ibu)}></u></i></div>
      <div class="dv-meter"><span>Pain and swelling signals (COX-2)</span><b id="ic-2">15%</b><i><u id="ic-2B" ${bg(C.pg)}></u></i></div>
      <div class="dv-meter"><span>Stomach shield, thromboxane (COX-1)</span><b id="ic-1">100%</b><i><u id="ic-1B" ${bg(C.cox1)}></u></i></div>
      <p class="sub">What it doesn't touch</p>
      <p>Ibuprofen works downstream. The immune signals that switched COX-2 on carry on, and so does the joint damage they drive in RA: NSAIDs ease pain and stiffness but don't slow the damage seen on X-rays (Crofford 2013). Its label covers "relief of the signs and symptoms" of RA; Hadlima's label adds "inhibiting the progression of structural damage".</p>
      <div class="dv-btns"><button class="dv-btn" id="ic-ra" type="button">The RA joint lining<small>where COX-2 is switched on, and what the DMARDs protect</small></button></div>
      <p class="dv-fine">Schematic, one enzyme of each kind. Ibuprofen blocks both; it fills the channel just above its entrance, anchored by arginine 120 and tyrosine 355 (Orlando 2015, mouse COX-2). Blocking COX-1 is thought to drive most of the stomach harm (Warner 1999), though in rats both had to be blocked (Wallace 2000). Its half-life is about 2 hours (label), so channels reopen within hours; time here runs an hour every two seconds, and the levels are illustrative. Tap an enzyme or a molecule to collect it.</p>`;},
    bind(card,api){const inf=card.querySelector('#ic-inf');inf.onclick=()=>{S.inflam=!S.inflam;inf.classList.toggle('on',S.inflam);inf.querySelector('small').textContent=S.inflam?'on: COX-2 switched on':'off';if(S.inflam)api.discover('ibu_cox2',true);};
      card.querySelector('#ic-dose').onclick=()=>S.doses.push({h:S.h,food:false});
      card.querySelector('#ic-re').onclick=()=>{reset();inf.classList.remove('on');inf.querySelector('small').textContent='off';};
      card.querySelector('#ic-ra').onclick=()=>jump('ra',{level:'lining'});},
    tap(p,api){for(const m of S.ibu)if(Math.hypot(p.x-m.x,p.y-m.y)<30)return api.discover('ibu_drug');
      for(const a of S.aa){if(a.st==='mem'&&Math.hypot(p.x-a.x,p.y-a.y)<26)return api.discover('ibu_pg');}
      for(const pr of S.prod)if(Math.hypot(p.x-pr.x,p.y-pr.y)<30)return api.discover(pr.c.cx>500?'ibu_pg':'ibu_txa');
      if(p.y<110)return api.discover(p.x<500?'ibu_txa':'ibu_pg');
      for(const e of EZ)if(Math.abs(p.x-e.cx)<160&&p.y>MY-310&&p.y<MY)return api.discover(e.k);},
    draw,
  };
}

export const DIVE={color:'#F29A55',top:{label:'Stomach',size:'10 cm'},
  target:({centreOf})=>centreOf(['Stomach']),view:{dist:.4,azim:20,elev:10},
  text:'Into the patient\'s stomach lining, to see why food makes ibuprofen gentler on the stomach but doesn\'t remove the bleeding risk, and then into the COX enzyme it blocks, which is also how it eases pain and swelling.',
  steps:[['Stomach lining.','Take doses with and without food and watch the prostaglandin shield thin; see what Lexapro adds when a raw spot bleeds.'],['COX enzyme, 10 nm.','Switch on inflammation, then watch ibuprofen sit in the COX-1 and COX-2 channels and let go.']],
  also:[{dive:'ra',level:'lining',label:'RA dive · the lining game',small:'where COX-2 is switched on; ibuprofen eases the pain, the DMARDs protect the joint'}],
  refs:['lbl_ibu','laine2008','wallace2008','ricciotti2011','picot1994','orlando2015','crofford1997','warner1999','crofford2013','wallace2000','oka2014','hergovich2000','dvojkovic2021','lbl_lexapro','lbl_hadlima'],
  make:({jump})=>({levels:[liningLevel(jump),coxLevel(jump)],guide:GUIDE_IB}),
};
