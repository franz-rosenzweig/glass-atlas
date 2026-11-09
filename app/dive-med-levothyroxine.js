// Levothyroxine dive: the pill's way in through the stomach and jejunum → one body cell, where T4 becomes T3 and switches genes on.
// Absorption numbers only where a study measured absorption (ATA 2014, Benvenga 2008, Zamfirescu 2011); the rest stay directional.
import { TAU, clamp, lerp, rand } from './dive.js';
import { rgba } from './dive-ra.js';

const L={t4:'#40C7AA',t3:'#7FD3A3',io:'#FFE36E',acid:'#B9E35A',wall:'#C9737F',blood:'#D9475E',tbg:'#E0A070',mct:'#62BED3',d2:'#F2C14E',nuc:'#5B86FF',tr:'#B193E3',rxr:'#7E8E90',co:'#7FD3A3',rna:'#FF8FB1'};
const LBL='rgba(236,230,218,.55)';
const font=(api,small)=>`${api?.phone?.()?(small?12:14):(small?10:11)}px "Martian Mono", monospace`;
function label(x,t,px,py,al='left',api,small){x.fillStyle=LBL;x.font=font(api,small);x.textAlign=al;x.fillText(t,px,py);}
// T4 and T3 as in the thyroid dive: a diamond with its iodines (yellow); T3 has lost one
function hormone(x,cx,cy,s=1,n=4,col=n===4?L.t4:L.t3){x.save();x.translate(cx,cy);x.scale(s,s);x.save();x.rotate(Math.PI/4);x.fillStyle=col;x.fillRect(-7,-7,14,14);x.restore();
  x.fillStyle=L.io;[[-10,0],[10,0],[0,-10],[0,10]].slice(0,n).forEach(([a,b])=>{x.beginPath();x.arc(a,b,3.2,0,TAU);x.fill();});x.restore();}
const BIND={coffee:{col:'#9A6B4A',shape:'blob'},food:{col:'#C9A27A',shape:'chunk'},calcium:{col:'#E8E4D8',shape:'hex'},iron:{col:'#E8A23A',shape:'dot'},antacid:{col:'#A9C8FF',shape:'flake'}};
function binder(x,b,s=1){const B=BIND[b.k];x.save();x.translate(b.x,b.y);x.scale(s,s);x.rotate(b.rot||0);x.fillStyle=B.col;x.beginPath();
  if(B.shape==='hex')for(let i=0;i<6;i++){const a=i/6*TAU;x.lineTo(Math.cos(a)*8,Math.sin(a)*8);}
  else if(B.shape==='chunk'){x.roundRect(-11,-8,22,16,4);}else if(B.shape==='flake'){x.moveTo(-10,-3);x.lineTo(2,-8);x.lineTo(10,2);x.lineTo(-2,7);}
  else if(B.shape==='dot')x.arc(0,0,6,0,TAU);else for(let i=0;i<=12;i++){const a=i/12*TAU,r=8+2*Math.sin(i*2.3);x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
  x.closePath();x.fill();x.restore();}

export const GUIDE_L={
  levo_tab:{name:'Levothyroxine',kind:'Medicine · synthetic T4',size:'a small tablet; the molecule about 1 nm',draw:(x,cx,cy,s)=>{x.fillStyle='rgba(236,230,218,.85)';x.beginPath();x.ellipse(cx-30*s,cy,22*s,16*s,0,0,TAU);x.fill();x.strokeStyle='rgba(4,7,11,.4)';x.lineWidth=2*s;x.beginPath();x.moveTo(cx-30*s,cy-12*s);x.lineTo(cx-30*s,cy+12*s);x.stroke();hormone(x,cx+30*s,cy,s*2.2);},
    text:['T4 made in a factory, chemically identical to the hormone the thyroid makes (Synthroid label), so the body can\'t tell the difference.','On an empty stomach about 70–80% of a dose is absorbed (ATA 2014; the label gives a wider 40–80%). The label says once a day on an empty stomach, half an hour to an hour before breakfast.']},
  levo_bind:{name:'Binders in the gut',kind:'Iron, calcium, antacids, coffee, food',size:'whatever is in the gut at the same time',draw:(x,cx,cy,s)=>{const ks=['iron','calcium','antacid','coffee'];x.fillStyle='rgba(155,107,232,.45)';x.beginPath();x.arc(cx-75*s,cy-14*s,26*s,0,TAU);x.fill();ks.forEach((k,i)=>binder(x,{k,x:cx-75*s+i*50*s,y:cy+(i%2?14:-14)*s},s*2.6));hormone(x,cx-62*s,cy-24*s,s*.9);},
    text:['Iron, calcium and aluminium antacids latch on to levothyroxine in the gut and carry it out unabsorbed. Mixed in a test tube, iron and T4 form a poorly soluble purple complex (Campbell 1992), and T4 sticks to calcium carbonate in acid (Singh 2000). Fibre and soy flour may bind it too (Synthroid label). Coffee also cuts absorption, though in a test tube it held on to T4 more weakly than fibre (Benvenga 2008).','The label\'s rule: at least four hours from the binders, and half an hour to an hour before breakfast.']},
  levo_tbg:{name:'Carrier proteins',kind:'TBG, transthyretin and albumin',size:'proteins, a few nanometres',draw:(x,cx,cy,s)=>{for(const [dx,dy] of [[-28,0],[26,-6]]){x.fillStyle=rgba(L.tbg,.55);x.beginPath();x.ellipse(cx+dx*s,cy+dy*s,22*s,15*s,.3,0,TAU);x.fill();hormone(x,cx+dx*s+4*s,cy+dy*s-2*s,s*1.1);}},
    text:['More than 99.9% of the T4 in the blood rides on carrier proteins, and only the free sliver can act (Synthroid label).','The carriers grip T4 harder than T3, part of why T4 lasts about a week and T3 under two days. When carrier levels shift, as in pregnancy or on estrogen, labs look at free T4 (Synthroid label).']},
  levo_mct:{name:'Thyroid hormone transporter',kind:'Membrane protein · MCT8 and relatives',size:'nanometres',draw:(x,cx,cy,s0)=>{const s=s0*1.4;x.fillStyle='rgba(236,230,218,.12)';x.fillRect(cx-70*s,cy-10*s,140*s,20*s);x.fillStyle=L.mct;x.beginPath();x.roundRect(cx-16*s,cy-22*s,12*s,44*s,5*s);x.roundRect(cx+4*s,cy-22*s,12*s,44*s,5*s);x.fill();hormone(x,cx,cy-34*s,s);},
    text:['Thyroid hormone doesn\'t just soak into cells: transporter proteins such as MCT8 and the OATPs carry it in, and which ones a tissue has helps set how much hormone it gets (Brent 2012; ATA 2014).','MCT8 matters most in the brain (ATA 2014).']},
  levo_d2:{name:'D2 deiodinase, and T3',kind:'Enzyme · the active hormone it makes',size:'nanometres',draw:(x,cx,cy,s)=>{x.fillStyle=L.d2;x.beginPath();x.arc(cx-26*s,cy,16*s,.6,TAU-.6);x.lineTo(cx-26*s,cy);x.fill();hormone(x,cx+26*s,cy,s*2,3);x.fillStyle=L.io;x.beginPath();x.arc(cx+2*s,cy-26*s,5*s,0,TAU);x.fill();},
    text:['An enzyme in the cell\'s endoplasmic reticulum that snips one iodine off T4, making T3, the active hormone (ATA 2014). About 80% of the body\'s T3 is made outside the thyroid, most of it by D2 and some by D1 (ATA 2014; Synthroid label), and T3 is about four times as potent as T4 (Synthroid label).','D2 works in the brain, the pituitary, the heart and muscle; the liver and kidney use a cousin, D1, and a third, D3, switches hormone off (ATA 2014).']},
  levo_tr:{name:'Thyroid hormone receptor',kind:'Nuclear receptor, on the DNA',size:'nanometres',draw:(x,cx,cy,s0)=>{const s=s0*1.6;x.strokeStyle=rgba(L.nuc,.8);x.lineWidth=3*s;for(const ph of [0,Math.PI]){x.beginPath();for(let i=0;i<=40;i++){const px=cx-70*s+i*3.5*s;x.lineTo(px,cy+18*s+Math.sin(i*.45+ph)*7*s);}x.stroke();}
      x.fillStyle=L.tr;x.beginPath();x.roundRect(cx-2*s,cy-16*s,26*s,26*s,6*s);x.fill();x.fillStyle=L.rxr;x.beginPath();x.roundRect(cx-28*s,cy-16*s,26*s,26*s,6*s);x.fill();hormone(x,cx+11*s,cy-3*s,s*.8,3);x.fillStyle=L.co;x.beginPath();x.arc(cx+12*s,cy-30*s,10*s,0,TAU);x.fill();},
    text:['It waits on the DNA at its target genes, paired with a partner called RXR. Without T3 it holds a corepressor, a brake on the gene; T3 binding releases the brake and brings in coactivators, and the gene is read (Brent 2012).','In the pituitary one form, TRβ, runs the feedback on TSH: more T3 turns TSH down. That feedback is what a TSH test reads (Brent 2012; ATA 2014).']},
};

/* ---------------- level A: the stomach and the gut */
const COMP={water:{l:'Water only'},coffee:{l:'Coffee',rel:.69,v:'about 70%',gap:'60 min'},food:{l:'Breakfast',rel:.8,v:'about 80%',gap:'60 min'},
  calcium:{l:'Calcium',rel:.78,v:'about 75–80%',gap:'4 h'},iron:{l:'Iron tablet',rel:.6,gap:'4 h'},antacid:{l:'Antacid',rel:.7,gap:'4 h'}};
const EV={water:'On an empty stomach about 70–80% of a dose is absorbed (ATA 2014). Every other choice is compared with this.',
  coffee:['In 6 patients and 9 volunteers, swallowing it with coffee or espresso made the amount absorbed (AUC) 27–36% lower than with water, and the peak came about 40 minutes later (Benvenga 2008).','In the same small study, water first and coffee 60 minutes later absorbed just like water alone (Benvenga 2008).'],
  food:['In one isotope study 64% was absorbed with food against 80% fasting (cited in ATA 2014). In a crossover trial of 65 patients, TSH averaged 2.93 mIU/L when it was taken within 20 minutes of breakfast, against 1.06 at least an hour before (Bach-Huynh 2009).','The label says half an hour to an hour before breakfast. ATA 2014 suggests 60 minutes before, or at bedtime at least 3 hours after the evening meal.'],
  calcium:['In 8 healthy adults given a 1 mg test dose, 500 mg of calcium, as carbonate, citrate or acetate, taken at the same time cut absorption by about 20–25% (Zamfirescu 2011).',0],
  iron:['In an uncontrolled study of 14 patients, a 300 mg ferrous sulfate tablet taken with it every day for 12 weeks raised TSH from 1.6 to 5.4 mIU/L on average, and 9 of the 14 had more signs of an underactive thyroid (Campbell 1992). If the patient takes iron for her iron deficiency, this is the pair to keep apart.',0],
  antacid:['Aluminium antacids: in five patients TSH rose from 2.6 to 7.2, and T4 was found stuck to the antacid (ATA 2014). Aluminium and magnesium hydroxide antacids also lower stomach acid, which the label says cuts absorption too.',0]};
const SPACED4='The label says at least 4 hours apart. ATA 2014 notes that the 4 hours is traditional but untested.';
const PPI=' On a PPI: the label calls stomach acid essential for absorption. On omeprazole, TSH rose in all 10 patients in one study, and it took 37% more levothyroxine to bring it back (Centanni 2006). But two short studies in healthy volunteers found no change after a week on a PPI or an H2 blocker (the family famotidine belongs to), so it may take long-term use (ATA 2014).';
function gutLevel(){
  const P=[[468,340],[512,382],[522,470],[566,528],[700,532],[880,530]];const LEN=[0];for(let i=1;i<P.length;i++)LEN.push(LEN[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  const along=d=>{let i=1;while(i<P.length-1&&LEN[i]<d)i++;const u=clamp((d-LEN[i-1])/(LEN[i]-LEN[i-1]),0,1);return [lerp(P[i-1][0],P[i][0],u),lerp(P[i-1][1],P[i][1],u)];};
  // the stomach: fundus up by the gullet, greater curve round the left and bottom, antrum narrowing to the pylorus
  const SP=new Path2D('M262 112 C232 70 150 78 150 175 C152 300 205 410 315 420 C395 428 445 400 474 360 L462 318 C420 330 352 312 326 250 C308 205 300 150 292 112 Z');
  const pctx=document.createElement('canvas').getContext('2d');
  const inStomach=(px,py)=>pctx.isPointInPath(SP,px,py)&&pctx.isPointInPath(SP,px+8,py)&&pctx.isPointInPath(SP,px-8,py)&&pctx.isPointInPath(SP,px,py+8)&&pctx.isPointInPath(SP,px,py-8);
  const N=36,REF=.75;
  const S={comp:'water',spaced:false,ppi:false,run:null};
  const rel=()=>{const c=COMP[S.comp];let r=S.spaced||!c.rel?1:c.rel;if(S.ppi)r*=.75;return r;};
  // a number is shown only where a study measured absorption; the 4-hour rule is the label's, untested (ATA 2014)
  const measured=R=>!R.ppi&&(R.comp==='water'||(R.spaced?R.comp==='coffee':!!COMP[R.comp].v));
  function swallow(api){const k=S.comp,c=COMP[k],R=rel();const nAbs=Math.round(N*REF*R);
    const nBind=k!=='water'&&!S.spaced?Math.round(N*REF*(1-(c.rel||1))):0,nUnd=S.ppi?Math.round(N*REF*(S.spaced||!c.rel?1:c.rel)*.25):0;
    const fates=[...Array(nAbs).fill('abs'),...Array(nBind).fill('bind'),...Array(nUnd).fill('und')];while(fates.length<N)fates.push('pass');fates.sort(()=>Math.random()-.5);
    S.run={t:0,pill:{x:258,y:-30,r:15,left:N-nUnd},mol:[],dis:fates.filter(f=>f!=='und'),k:0,bind:[],ref:Math.round(N*REF),arr:0,lost:0,und:nUnd,done:false,late:k!=='water'&&S.spaced?(c.gap==='4 h'?7:5):-1,lateShown:0,
      comp:k,spaced:S.spaced,ppi:S.ppi};
    if(k!=='water'&&!S.spaced)spawnBinders();}
  function spawnBinders(){const R=S.run;R.bsp=1;for(let i=0;i<8;i++)R.bind.push({k:S.comp,x:258+rand(-12,12),y:-40-i*14,vy:rand(160,220),st:'fall',cargo:0,rot:rand(0,6),u:0,w:rand(-18,18),wait:rand(1.8,2.6)});}
  function step(dt){const R=S.run;if(!R||R.done)return;R.t+=dt;const p=R.pill;
    if(p.y<330){p.y+=dt*260;p.x=lerp(p.x,235,dt*2);}
    else if(p.left>0){const rate=R.ppi?5:12;R.acc=(R.acc||0)+dt*rate;while(R.acc>1&&p.left>0){R.acc--;p.left--;R.mol.push({x:p.x+rand(-6,6),y:p.y+rand(-6,6),vx:rand(-60,60),vy:rand(-60,60),f:R.dis[R.k++],st:'sto',age:0,wait:rand(.8,1.8)});}
      p.r=Math.max(R.ppi?6:0,15*p.left/N);}
    else if(p.r>0&&!p.u){p.go=(p.go||0)+dt;if(p.go>1.5)p.u=1e-3;}
    if(p.u){p.u+=dt*140;[p.x,p.y]=along(p.u);if(p.u>=LEN[LEN.length-1]){p.r=0;p.u=0;p.gone=true;}}
    if(R.late>0&&R.t>R.late&&!R.lateShown){R.lateShown=1;spawnBinders();}
    for(const b of R.bind){if(b.st==='fall'){b.y+=b.vy*dt;b.x=lerp(b.x,235,dt*1.8);if(b.y>250&&inStomach(b.x,b.y)){b.st='sto';b.vx=rand(-50,50);b.vy=rand(-50,50);}}
      else if(b.st==='sto'){b.wait-=dt;wander(b,dt);if(b.wait<0)b.st='out';}
      else if(b.st==='out'){const dx=468-b.x,dy=340-b.y,d=Math.hypot(dx,dy);if(d<12){b.st='path';}else{b.x+=dx/d*150*dt;b.y+=dy/d*150*dt;}}
      else if(b.st==='path'){b.u+=dt*150;const [px,py]=along(b.u);b.x=px;b.y=py+b.w*.6;if(b.u>=LEN[LEN.length-1])b.gone=true;}}
    for(const m of R.mol){m.age+=dt;
      if(m.st==='sto'){if(m.f==='bind'){const b=R.bind.filter(b=>!b.gone&&b.cargo<4&&(b.st==='sto'||b.st==='out')).sort((a,c)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(c.x-m.x,c.y-m.y))[0];
          if(!b&&R.bsp&&!R.bind.some(b=>b.st==='fall'||b.st==='sto')){m.f='pass';m.st='out';continue;}   // its binder has left: it passes through instead
          if(b){const dx=b.x-m.x,dy=b.y-m.y,d=Math.hypot(dx,dy);if(d<11){m.st='on';m.b=b;m.off=b.cargo++;R.lost++;}else{m.x+=dx/d*120*dt;m.y+=dy/d*120*dt;}continue;}
          wander(m,dt);continue;}   // waits in the stomach until its binder arrives
        wander(m,dt);if(m.age>m.wait)m.st='out';}
      else if(m.st==='out'){const dx=468-m.x,dy=340-m.y,d=Math.hypot(dx,dy);if(d<12){m.st='path';m.u=0;m.w=rand(-20,20);m.tx=rand(600,820);}else{m.x+=dx/d*160*dt;m.y+=dy/d*160*dt;}}
      else if(m.st==='path'){m.u+=dt*rand(130,170);const [px,py]=along(m.u);m.x=px;m.y=py+m.w;if(m.f==='abs'&&px>=m.tx&&py>500){m.st='up';m.y0=m.y;m.k=0;}if(m.u>=LEN[LEN.length-1])m.gone=true;}
      else if(m.st==='up'){m.k+=dt*1.6;m.y=lerp(m.y0,452,clamp(m.k,0,1));if(m.k>=1)m.st='vein';}
      else if(m.st==='vein'){if(m.x<840)m.x=Math.min(840,m.x+dt*300);else m.y-=dt*300;if(m.y<112){m.gone=true;R.arr++;}}
      else if(m.st==='on'){const b=m.b;const a=m.off*1.6;m.x=b.x+Math.cos(a)*11;m.y=b.y+Math.sin(a)*11;if(b.gone)m.gone=true;}}
    R.mol=R.mol.filter(m=>!m.gone);R.bind=R.bind.filter(b=>!b.gone);
    if(R.t>4&&!R.mol.length&&(!p.r||p.gone)&&(R.late<0||R.lateShown)&&!R.bind.length)R.done=true;}
  function wander(m,dt){m.vx+=rand(-140,140)*dt;m.vy+=rand(-140,140)*dt;m.vx*=.97;m.vy*=.97;const nx=m.x+m.vx*dt,ny=m.y+m.vy*dt;if(inStomach(nx,ny)){m.x=nx;m.y=ny;}else{m.vx=(230-m.x)*.8;m.vy=(330-m.y)*.8;m.x+=m.vx*dt;m.y+=m.vy*dt;}}
  function draw(x,dt,t,api){step(dt);const R=S.run;
    x.fillStyle='#0B1311';x.fillRect(-400,-300,1800,1300);
    // esophagus, stomach wall and the acid pool
    x.strokeStyle=rgba(L.wall,.5);x.lineWidth=34;x.lineCap='round';x.beginPath();x.moveTo(252,-40);x.lineTo(262,110);x.stroke();x.strokeStyle='#120C0E';x.lineWidth=20;x.stroke();
    x.fillStyle='#120C0E';x.fill(SP);x.save();x.clip(SP);x.fillStyle=rgba(L.acid,S.ppi?.08:.26);x.fillRect(100,282+Math.sin(t*1.5)*3,500,300);
    x.strokeStyle='rgba(201,115,127,.18)';x.lineWidth=3;for(let i=0;i<6;i++){x.beginPath();x.moveTo(170+i*22,150+i*10);x.bezierCurveTo(200+i*22,260,260+i*16,360,380+i*12,380-i*8);x.stroke();}x.restore();
    x.strokeStyle=rgba(L.wall,.55);x.lineWidth=18;x.lineJoin='round';x.stroke(SP);
    // the intestine and the blood that drains it
    const tube=(w,c)=>{x.strokeStyle=c;x.lineWidth=w;x.lineJoin='round';x.lineCap='butt';x.beginPath();P.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();};
    tube(78,rgba(L.wall,.5));tube(60,'#120C0E');
    for(let vx=596;vx<=830;vx+=26){x.fillStyle=rgba(L.wall,.45);x.beginPath();x.moveTo(vx-9,501);x.lineTo(vx,515);x.lineTo(vx+9,501);x.fill();x.strokeStyle=rgba(L.blood,.45);x.lineWidth=3;x.beginPath();x.moveTo(vx,492);x.lineTo(vx,454);x.stroke();}
    x.strokeStyle=rgba(L.blood,.8);x.lineWidth=12;x.lineCap='round';x.beginPath();x.moveTo(590,452);x.lineTo(840,452);x.lineTo(840,112);x.stroke();
    // pill, binders, hormone
    if(R){const p=R.pill;if(p.r>0&&!p.gone){x.fillStyle='rgba(236,230,218,.9)';x.beginPath();x.arc(p.x,p.y,p.r,0,TAU);x.fill();if(R.und&&p.left===0){x.fillStyle=L.io;for(let i=0;i<3;i++){x.beginPath();x.arc(p.x-3+i*3,p.y,1.6,0,TAU);x.fill();}}}
      for(const b of R.bind){const com=b.k==='iron'&&b.cargo>0;binder(x,b);if(com){x.fillStyle='rgba(155,107,232,.45)';x.beginPath();x.arc(b.x,b.y,15,0,TAU);x.fill();}}
      for(const m of R.mol)hormone(x,m.x,m.y,.55);
      if(R.lateShown&&R.t-R.late<2.5)label(x,`${COMP[S.comp].l.toUpperCase()} · ${COMP[S.comp].gap} LATER`,290,135,'left',api,true);}
    label(x,'STOMACH',150,60,'left',api);label(x,S.ppi?'ACID · WEAK (PPI)':'ACID',292,378,'center',api,true);label(x,'DUODENUM',548,420,'left',api,true);
    label(x,'JEJUNUM · MOST IS ABSORBED HERE',580,600,'left',api,true);label(x,'TO THE COLON',860,630,'right',api,true);label(x,'BLOOD · TO THE LIVER, THEN EVERY CELL',826,96,'right',api,true);
    ui(api);}
  let last=0;function ui(api){const n=performance.now();if(n-last<150)return;last=n;const q=s=>api.card.querySelector(s);if(!q('#lg-b'))return;const R=S.run;
    const f=R?clamp(R.arr/R.ref,0,1):0,ok=R&&measured(R),v=R&&COMP[R.comp];const bar=q('#lg-bB');bar.style.width=(R?f:0)*100+'%';bar.classList.toggle('hatch',!!R&&!ok);
    q('#lg-b').textContent=!R?'—':!R.done?(ok?Math.round(f*100)+'%':'arriving'):ok?(R.comp==='water'||R.spaced?'100%':v.v):R.ppi||!R.spaced?'lower · no % measured':'full, per the label';
    q('#lg-l').textContent=!R?'—':`${R.lost} of ${N}`;q('#lg-u').textContent=!R?'—':R.und?`${R.und} of ${N}`:'none';}
  function evidence(card){const c=COMP[S.comp];const e=EV[S.comp];let txt=typeof e==='string'?e:S.spaced?(e[1]||SPACED4):e[0];if(S.ppi)txt+=PPI;card.querySelector('#lg-ev').textContent=txt;
    const sp=card.querySelector('[data-s="1"]');sp.textContent=c.gap?`${c.gap} apart`:'apart';card.querySelector('#lg-tm').hidden=S.comp==='water';card.querySelectorAll('[data-s]').forEach(b=>b.setAttribute('aria-checked',(b.dataset.s==='1')===S.spaced));}
  return {id:'gut',label:'Gut',size:'20 cm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:65,label:'5 cm'},zoomFocus:{x:700,y:452},
    card(){return `<p class="k">Level 1 · the gut</p><h2>The pill's way in</h2>
      <p>Levothyroxine is T4, the thyroid's own hormone, made in a factory. The tablet has to dissolve in stomach acid, and the T4 is then absorbed mostly in the jejunum and upper ileum. Anything that sticks to it on the way, or weakens the acid, means less of it reaches the blood. How fast the stomach empties matters too: gastroparesis is one of the stomach conditions linked to needing more levothyroxine (Virili 2020), so the patient's slow stomach may be one more reason her TSH is watched.</p>
      <p class="sub">Take it with</p>
      <div class="dv-seg" role="radiogroup" aria-label="Taken with">${Object.entries(COMP).map(([k,c])=>`<button role="radio" data-c="${k}" aria-checked="${k==='water'}">${c.l}</button>`).join('')}</div>
      <div class="dv-seg" id="lg-tm" role="radiogroup" aria-label="Timing"><button role="radio" data-s="0" aria-checked="true">At the same time</button><button role="radio" data-s="1" aria-checked="false">apart</button></div>
      <div class="dv-btns"><button class="dv-btn go" id="lg-sw" type="button">Swallow the pill</button><button class="dv-btn" id="lg-ppi" type="button">Acid reducer (PPI)<small>off</small></button></div>
      <div class="dv-meter"><span>Reached the blood, compared with water alone</span><b id="lg-b">—</b><i><u id="lg-bB"></u></i></div>
      <div class="dv-meter"><span>T4 molecules stuck to something</span><b id="lg-l">—</b></div>
      <div class="dv-meter"><span>Left undissolved</span><b id="lg-u">—</b></div>
      <p class="dv-fine" id="lg-ev"></p>
      <div class="dv-btns"><button class="dv-btn" id="lg-go" type="button">Zoom into one cell<small>where T4 becomes T3</small></button></div>
      <p class="dv-fine">Schematic: the stomach roughly to scale (5 cm bar), the intestine shortened and widened. A number appears only where a study measured absorption. Iron, antacids and acid reducers were measured by their effect on TSH, so their bars are striped and their size is illustrative. Sources: Synthroid label; ATA 2014; Benvenga 2008; Zamfirescu 2011; Bach-Huynh 2009; Campbell 1992; Centanni 2006; Virili 2020. Tap the pill and what it meets to collect them.</p>
      <style>.dv-meter u.hatch{background:repeating-linear-gradient(135deg,var(--c) 0 5px,transparent 5px 9px)!important}</style>`;},
    bind(card,api){card.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{if(S.run?.done)S.run=null;S.comp=b.dataset.c;if(S.comp==='water')S.spaced=false;card.querySelectorAll('[data-c]').forEach(x=>x.setAttribute('aria-checked',x===b));evidence(card);});
      card.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{if(S.run?.done)S.run=null;S.spaced=b.dataset.s==='1';evidence(card);});
      const pp=card.querySelector('#lg-ppi');pp.onclick=()=>{if(S.run?.done)S.run=null;S.ppi=!S.ppi;pp.classList.toggle('on',S.ppi);pp.querySelector('small').textContent=S.ppi?'on: less acid':'off';evidence(card);};
      card.querySelector('#lg-sw').onclick=()=>swallow(api);card.querySelector('#lg-go').onclick=()=>api.go('cell',{from:{x:700,y:452}});evidence(card);},
    tap(p,api){const R=S.run;if(R){for(const b of R.bind)if(Math.hypot(b.x-p.x,b.y-p.y)<26)return api.discover('levo_bind');
        if(R.pill.r>0&&Math.hypot(R.pill.x-p.x,R.pill.y-p.y)<30)return api.discover('levo_tab');for(const m of R.mol)if(Math.hypot(m.x-p.x,m.y-p.y)<20)return api.discover('levo_tab');}
      if(inStomach(p.x,p.y))return api.discover('levo_tab');},
    draw,
  };
}

/* ---------------- level B: one body cell, and the six-week clock */
function cellLevel(jump){
  const C={x0:140,x1:860,y0:168,y1:512},NX=655,NY=352,NRX=170,NRY=118;
  const TR=[{x:560},{x:655},{x:750}].map(s=>({...s,y:NY+40,on:0,t3:null,co:0}));
  const MCT=[300,520,740],D2=[{x:220,y:300},{x:300,y:400},{x:390,y:300},{x:250,y:470}];
  let S;
  function reset(){S={old:1,tgt:1,wk:10,play:false,step:0,t4:[],t3:[],io:[],rna:[],car:[],prot:[],me:0,enz:0,acc:0,g:0};for(let i=0;i<9;i++)S.car.push({x:rand(100,900),y:rand(60,128),n:Math.random()<.5?2:1});}
  reset();
  const lvl=()=>S.old+(S.tgt-S.old)*(1-Math.pow(2,-S.wk));   // T4 half-life about a week
  function snip(m,byMe){m.gone=true;S.io.push({x:m.x,y:m.y-10,vx:rand(-60,60),vy:rand(-90,-40),l:1});S.t3.push({x:m.x,y:m.y,st:'go',l:9});if(byMe)S.me++;else S.enz++;}
  function step(dt){if(S.play){S.wk+=dt/2;if(S.wk>=10){S.wk=10;S.play=false;}}
    const Lb=lvl();
    for(const c of S.car){c.x+=dt*40;if(c.x>920){c.x=80;c.n=Math.random()<clamp(Lb*.5,.15,.95)?2:1;}}
    S.acc+=dt*1.1*Lb;while(S.acc>1){S.acc--;const mx=MCT[Math.floor(Math.random()*3)];S.t4.push({x:mx,y:C.y0-30,st:'in',vx:0,vy:60,age:0,d:D2[Math.floor(Math.random()*D2.length)]});}
    for(const m of S.t4){m.age+=dt;if(m.st==='in'){m.y+=dt*70;if(m.y>C.y0+22){m.st='free';m.vx=rand(-50,50);m.vy=rand(10,50);}continue;}
      m.vx+=rand(-90,90)*dt+(m.d.x-m.x)*.25*dt;m.vy+=rand(-90,90)*dt+(m.d.y-m.y)*.25*dt;m.vx*=.97;m.vy*=.97;m.x=clamp(m.x+m.vx*dt,C.x0+20,C.x1-20);m.y=clamp(m.y+m.vy*dt,C.y0+20,C.y1-20);
      if(((m.x-NX)/NRX)**2+((m.y-NY)/NRY)**2<1.1){const a=Math.atan2((m.y-NY)/NRY,(m.x-NX)/NRX);m.vx=Math.cos(a)*60;m.vy=Math.sin(a)*60;}
      for(const d of D2)if(Math.hypot(m.x-d.x,m.y-d.y)<30&&Math.random()<dt*2.5){snip(m,false);break;}
      if(m.age>9)m.gone=true;}
    S.t4=S.t4.filter(m=>!m.gone);
    for(const h of S.t3){h.l-=dt;if(h.st==='go'){const s=TR.find(s=>!s.t3);const tx=s?s.x:NX,ty=s?s.y-14:NY-40;const dx=tx-h.x,dy=ty-h.y,d=Math.hypot(dx,dy);
        if(d<8&&s){s.t3=h;h.st='on';h.l=3+rand(0,1);}else{h.x+=dx/Math.max(d,1)*110*dt;h.y+=dy/Math.max(d,1)*110*dt;}}}
    for(const s of TR){if(s.t3&&s.t3.l<=0){s.t3=null;}s.on=lerp(s.on,s.t3?1:0,1-Math.exp(-dt*3));if(s.on>.6&&Math.random()<dt*1.5)S.rna.push({x:s.x,y:s.y-6,u:0,a:rand(-2.6,-.6)});}
    S.t3=S.t3.filter(h=>h.l>0);
    for(const r of S.rna){r.u+=dt*.5;r.x+=Math.cos(r.a)*dt*70;r.y+=Math.sin(r.a)*dt*70;if(r.u>1.6){r.gone=true;if(S.prot.length<60)S.prot.push({x:r.x,y:r.y,l:8});}}
    S.rna=S.rna.filter(r=>!r.gone);for(const p of S.prot)p.l-=dt;S.prot=S.prot.filter(p=>p.l>0);
    for(const i of S.io){i.x+=i.vx*dt;i.y+=i.vy*dt;i.l-=dt*.7;}S.io=S.io.filter(i=>i.l>0);
    S.g=lerp(S.g,TR.reduce((a,s)=>a+s.on,0)/TR.length,1-Math.exp(-dt*2));}
  function draw(x,dt,t,api){step(dt);
    x.fillStyle='#0A1214';x.fillRect(-400,-300,1800,1300);
    // blood and its carrier proteins
    x.fillStyle='#1A0B10';x.fillRect(-400,30,1800,112);
    for(const c of S.car){x.fillStyle=rgba(L.tbg,.5);x.beginPath();x.ellipse(c.x,c.y,20,13,.3,0,TAU);x.fill();for(let k=0;k<c.n;k++)hormone(x,c.x-6+k*12,c.y-2,.45);}
    // the cell
    x.fillStyle='rgba(64,199,170,.05)';x.strokeStyle=rgba(L.t4,.7);x.lineWidth=3;x.beginPath();x.roundRect(C.x0,C.y0,C.x1-C.x0,C.y1-C.y0,26);x.fill();x.stroke();
    for(const mx of MCT){x.fillStyle=L.mct;x.beginPath();x.roundRect(mx-14,C.y0-16,11,32,4);x.roundRect(mx+3,C.y0-16,11,32,4);x.fill();}
    // endoplasmic reticulum with D2
    x.strokeStyle='rgba(236,230,218,.12)';x.lineWidth=5;for(let k=0;k<4;k++){x.beginPath();for(let i=0;i<=30;i++){const px=170+i*8;x.lineTo(px,285+k*55+Math.sin(i*.6+k)*10);}x.stroke();}
    for(const d of D2){x.fillStyle=L.d2;const o=.35+.25*Math.sin(t*6+d.x);x.beginPath();x.arc(d.x,d.y,12,o,TAU-o);x.lineTo(d.x,d.y);x.fill();}
    // nucleus, DNA and the receptors on it
    x.fillStyle=rgba(L.nuc,.12);x.strokeStyle=rgba(L.nuc,.8);x.lineWidth=2.5;x.beginPath();x.ellipse(NX,NY,NRX,NRY,0,0,TAU);x.fill();x.stroke();
    for(let i=0;i<14;i++){const a=i/14*TAU;x.fillStyle='#0A1214';x.beginPath();x.arc(NX+Math.cos(a)*NRX,NY+Math.sin(a)*NRY,3.5,0,TAU);x.fill();}
    x.strokeStyle=rgba(L.nuc,.7);x.lineWidth=3;for(const ph of [0,Math.PI]){x.beginPath();for(let i=0;i<=72;i++){const px=NX-150+i*300/72;x.lineTo(px,NY+52+Math.sin(i*.5+ph)*7);}x.stroke();}
    for(const s of TR){x.fillStyle=L.rxr;x.beginPath();x.roundRect(s.x-24,s.y-10,22,22,5);x.fill();x.fillStyle=L.tr;x.beginPath();x.roundRect(s.x,s.y-10,22,22,5);x.fill();
      if(s.t3)hormone(x,s.x+11,s.y+1,.55,3);
      x.fillStyle=s.on>.5?rgba(L.co,.85*s.on):`rgba(126,142,144,${.8*(1-s.on)})`;x.beginPath();x.arc(s.x+2,s.y-22,10,0,TAU);x.fill();
      if(s.on>.5){x.strokeStyle=rgba(L.io,.6*s.on);x.lineWidth=2;x.beginPath();x.moveTo(s.x-24,s.y+20);x.lineTo(s.x+22,s.y+20);x.stroke();}}
    x.strokeStyle=L.rna;x.lineWidth=2;for(const r of S.rna){x.beginPath();for(let k=0;k<6;k++)x.lineTo(r.x+k*3,r.y+Math.sin(k*1.4+r.u*8)*3);x.stroke();}
    x.fillStyle=rgba(L.co,.8);for(const p of S.prot){x.globalAlpha=clamp(p.l/3,0,1);x.beginPath();x.arc(p.x,p.y,3.2,0,TAU);x.fill();}x.globalAlpha=1;
    for(const m of S.t4)hormone(x,m.x,m.y,.7);for(const h of S.t3)if(h.st==='go')hormone(x,h.x,h.y,.7,3);
    x.fillStyle=L.io;for(const i of S.io){x.globalAlpha=clamp(i.l,0,1);x.beginPath();x.arc(i.x,i.y,3.5,0,TAU);x.fill();}x.globalAlpha=1;
    label(x,'BLOOD',150,58,'left',api);label(x,'TRANSPORTER',MCT[0]+22,C.y0-22,'left',api,true);label(x,'ER · D2 ENZYME',166,C.y0+40,'left',api,true);
    label(x,'NUCLEUS',NX,NY-NRY+30,'center',api,true);label(x,'RECEPTORS ON THE DNA',NX,NY+92,'center',api,true);
    // the six-week clock
    const gx0=170,gx1=820,gy0=544,gy1=616,wx=w=>gx0+w/10*(gx1-gx0);const changed=S.old!==S.tgt;
    x.fillStyle='rgba(255,227,110,.08)';x.fillRect(wx(6),gy0,wx(8)-wx(6),gy1-gy0);
    x.strokeStyle='rgba(236,230,218,.25)';x.lineWidth=1;x.beginPath();x.moveTo(gx0,gy1);x.lineTo(gx1,gy1);x.stroke();
    for(let w=0;w<=10;w+=2){x.fillStyle=LBL;x.font=font(api,true);x.textAlign='center';x.fillText(w+' wk',wx(w),gy1+15);}
    const lo=Math.min(S.old,S.tgt),hi=Math.max(S.old,S.tgt),yv=v=>changed?lerp(gy1-12,gy0+14,(v-lo)/(hi-lo||1)):(gy0+gy1)/2;const cv=w=>S.old+(S.tgt-S.old)*(1-Math.pow(2,-w));
    x.strokeStyle='rgba(64,199,170,.3)';x.lineWidth=2;x.beginPath();for(let w=0;w<=10;w+=.1)x.lineTo(wx(w),yv(cv(w)));x.stroke();
    if(changed){x.strokeStyle=L.t4;x.lineWidth=3;x.beginPath();for(let w=0;w<=S.wk;w+=.1)x.lineTo(wx(w),yv(cv(w)));x.stroke();x.fillStyle=L.t4;x.beginPath();x.arc(wx(S.wk),yv(cv(S.wk)),6,0,TAU);x.fill();}
    label(x,'BLOOD T4 AFTER A DOSE CHANGE',gx0,gy0-6,'left',api,true);label(x,'TSH CHECK',wx(7),gy0+14,'center',api,true);
    ui(api);}
  let last=0;function ui(api){const n=performance.now();if(n-last<150)return;last=n;const q=s=>api.card.querySelector(s);if(!q('#lc-g'))return;
    q('#lc-g').textContent=Math.round(S.g*100)+'%';q('#lc-gB').style.width=S.g*100+'%';q('#lc-m').textContent=`${S.me} by you · ${S.enz} by D2`;
    const changed=S.old!==S.tgt,p=1-Math.pow(2,-S.wk);q('#lc-w').textContent=changed?'week '+Math.floor(S.wk):'no change yet';
    q('#lc-p').textContent=changed?Math.round(p*100)+'% of the way':'—';q('#lc-pB').style.width=(changed?p:0)*100+'%';
    q('#lc-t').textContent=!changed?'—':S.wk<6?'too early: still moving':'settled enough to check';}
  return {id:'cell',label:'One cell',size:'20 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:NX,y:NY},
    card(){return `<p class="k">Level 2 · one cell</p><h2>Where T4 becomes T3</h2>
      <p>In the blood nearly all T4 rides on carrier proteins, and only the free sliver can act. It enters cells through transporter proteins. Inside, an enzyme called D2 snips off one iodine, turning T4 into T3, about four times as active. T3 goes into the nucleus and sits in the thyroid hormone receptor, which waits on the DNA with a brake on; T3 lifts the brake and the genes are read. About 80% of the body's T3 is made outside the thyroid, mostly by D2 and some by its cousin D1 in the liver and kidney (ATA 2014; Synthroid label); in someone whose thyroid makes little, nearly all of it is. <b style="color:var(--bone)">Tap a T4 (four yellow iodines) inside the cell to snip one off yourself.</b></p>
      <div class="dv-meter"><span>T3 made</span><b id="lc-m">0</b></div>
      <div class="dv-meter"><span>Genes switched on</span><b id="lc-g">0%</b><i><u id="lc-gB"></u></i></div>
      <p class="sub">Why TSH takes six weeks</p>
      <p>T4 lasts about a week in the blood. After a dose change the level gets half of the way there in a week, three quarters in two, and is close to steady only after about six weeks, five or six half-lives; TSH settles with it. The pituitary cells that make TSH read T4 with this same machinery, rich in D2, so a recheck much sooner than six to eight weeks measures a moving target. <b style="color:var(--bone)">Change the dose and watch the weeks.</b></p>
      <div class="dv-btns"><button class="dv-btn" id="lc-dn" type="button">− 12.5 mcg</button><button class="dv-btn go" id="lc-up" type="button">+ 12.5 mcg</button></div>
      <div class="dv-meter"><span>Since the change</span><b id="lc-w">no change yet</b></div>
      <div class="dv-meter"><span>Blood T4</span><b id="lc-p">—</b><i><u id="lc-pB"></u></i></div>
      <div class="dv-meter"><span>TSH</span><b id="lc-t">—</b></div>
      <div class="dv-btns"><button class="dv-btn" id="lc-hashi" type="button">Adjust the dose for a year<small>Hashimoto dive · the follicle</small></button></div>
      <p class="dv-fine">The cell is schematic, and the dose step is exaggerated so it shows. The timing is real: a half-life of about 7 days and steady state in about 6 weeks (ATA 2014), with TSH checked 6 to 8 weeks after any change (Synthroid label). In an underactive thyroid the half-life is longer, 9 to 10 days (Synthroid label). One week passes every 2 seconds. Sources: Synthroid label; ATA 2014; Brent 2012. Tap the blood, the doors, the enzymes and the receptors to collect them.</p>`;},
    bind(card,api){const ch=d=>()=>{S.old=lvl();S.tgt=clamp(S.tgt+d,.4,2.2);if(Math.abs(S.old-S.tgt)<1e-3)S.tgt=S.old+d;S.wk=0;S.play=true;};
      card.querySelector('#lc-up').onclick=ch(.35);card.querySelector('#lc-dn').onclick=ch(-.35);card.querySelector('#lc-hashi').onclick=()=>jump('hashi',{level:'follicle'});},
    tap(p,api){let best=null,bd=Math.max(30,22/p.s);for(const m of S.t4){if(m.st!=='free')continue;const d=Math.hypot(m.x-p.x,m.y-p.y);if(d<bd){bd=d;best=m;}}
      if(best)return snip(best,true);
      if(p.y<150)return api.discover('levo_tbg');
      if(MCT.some(mx=>Math.abs(p.x-mx)<30&&Math.abs(p.y-C.y0)<34))return api.discover('levo_mct');
      if(D2.some(d=>Math.hypot(p.x-d.x,p.y-d.y)<32)||S.t3.some(h=>Math.hypot(h.x-p.x,h.y-p.y)<24))return api.discover('levo_d2');
      if(((p.x-NX)/NRX)**2+((p.y-NY)/NRY)**2<1)return api.discover('levo_tr');},
    draw,
  };
}

export const DIVE={color:'#40C7AA',top:{label:'Belly',size:'30 cm'},
  target:({centreOf})=>centreOf(['Stomach']),view:{dist:.24,azim:20,elev:6},
  text:'Follow the patient\'s levothyroxine tablet through the stomach and gut, and see what coffee, breakfast, iron, calcium and acid reducers do to it. Then into one body cell, where T4 becomes T3, and why a dose change takes six weeks to show in TSH.',
  steps:[['Gut, 20 cm.','Swallow the pill with water, coffee, breakfast, calcium, iron or an antacid, together or spaced apart, with or without an acid reducer. Numbers only where a study measured them.'],['One cell, 20 µm.','Snip iodines to make T3 and watch genes switch on; change the dose and watch six weeks go by before TSH can be read.']],
  also:[{dive:'hashi',level:'follicle',label:'Hashimoto dive · the follicle',small:'adjust the dose for a year while the thyroid fails'}],
  refs:['lbl_levo','ata2014','campbell1992','singh2000','benvenga2008','zamfirescu2011','bachhuynh2009','centanni2006','virili2020','brent2012'],
  make:({jump})=>({levels:[gutLevel(),cellLevel(jump)],guide:GUIDE_L}),
};
