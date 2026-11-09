// Hadlima dive: one dose, from under the skin of the belly → the vessel cell that keeps it in the blood for two weeks → the molecule, beside Humira.
// Numbers from the April 2026 label unless a line says otherwise: 64% reaches the blood, peak at 5.5 days, half-life about two weeks.
import { TAU, clamp, lerp, rand } from './dive.js';
import { GUIDE, glow, rgba, nucleus, G } from './dive-ra.js';
import { HADLIMA } from './data.js';

const KA=HADLIMA.pk.ka,KE=Math.LN2/HADLIMA.pk.halfLifeDays,F=.64,PEAK=4.7;  // the same absorption model as the bench
const curve=d=>d<=0?0:Math.exp(-KE*d)-Math.exp(-KA*d);const TMAX=Math.log(KA/KE)/(KA-KE);const level=d=>PEAK*curve(d)/curve(TMAX);
const C={ab:'#5AA8FF',lt:'#A9D4FF',cdr:'#FFE08A',fat:'#E8C77A',lym:'#7FD3C8',cap:'#E0525F',aaa:'#C08CFF',fcrn:'#7FD3A3',alb:'#E8B04A',oth:'#8FA3A6',lys:'#FF9F43',gly:'#7FD3A3'};
const LBL='rgba(236,230,218,.55)',FONT='11px "Martian Mono", monospace';
function miniY(x,cx,cy,s,rot,col=C.ab,a=1){x.save();x.globalAlpha*=a;x.translate(cx,cy);x.rotate(rot);x.strokeStyle=col;x.lineWidth=2.4*s;x.lineCap='round';x.beginPath();x.moveTo(0,6*s);x.lineTo(0,0);x.lineTo(-4.5*s,-5.5*s);x.moveTo(0,0);x.lineTo(4.5*s,-5.5*s);x.stroke();x.restore();}
function label(x,t,px,py,al='left'){x.fillStyle=LBL;x.font=FONT;x.textAlign=al;x.fillText(t,px,py);}
let seed=11;const R=()=>(seed=seed*16807%2147483647)/2147483647;
const near=(pts,p,d)=>{for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const L=(bx-ax)**2+(by-ay)**2,u=clamp(((p.x-ax)*(bx-ax)+(p.y-ay)*(by-ay))/L,0,1);if(Math.hypot(p.x-ax-u*(bx-ax),p.y-ay-u*(by-ay))<d)return true;}return false;};
const sample=(pts,step=6)=>{const out=[];for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const n=Math.max(1,Math.round(Math.hypot(bx-ax,by-ay)/step));for(let k=0;k<n;k++)out.push([lerp(ax,bx,k/n),lerp(ay,by,k/n)]);}out.push(pts[pts.length-1]);return out;};
const path=(x,pts)=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));};

// the antibody drawn big, with its domains (design units, centred on the hinge)
function igg(x,cx,cy,s,o={}){x.save();x.translate(cx,cy);x.scale(s,s);const hl=o.hl;
  const dom=(px,py,rot,rx,ry,col,on)=>{x.save();x.translate(px,py);x.rotate(rot);x.beginPath();x.ellipse(0,0,rx,ry,0,0,TAU);x.fillStyle=rgba(col,on?.55:.28);x.fill();x.strokeStyle=col;x.lineWidth=on?3:1.8;x.stroke();x.restore();};
  for(const sg of [-1,1]){const a=sg*.62,ux=Math.sin(a),uy=-Math.cos(a),px=Math.cos(a),py=Math.sin(a);const at=(d,off)=>[ux*d+px*off*sg,-40+uy*d+py*off*sg];
    const on=hl==='arms';dom(...at(70,-20),a,20,28,C.ab,on);dom(...at(70,22),a,18,26,C.lt,on);dom(...at(142,-20),a,20,30,C.ab,on);dom(...at(142,22),a,18,28,C.lt,on);
    // the six loops at the tip that fit TNF, three from each chain
    const [tx,ty]=at(178,0);x.strokeStyle=C.cdr;x.lineWidth=hl==='tips'?4:2.6;for(const off of [-20,22])for(let i=-1;i<=1;i++){const [lx,ly]=at(176+Math.abs(i)*-4,off+i*9);x.beginPath();x.arc(lx,ly,4.6,0,TAU);x.stroke();}
    if(o.tnf?.[sg<0?0:1])G.tnf(x,tx+ux*30,ty+uy*30,1.15,o.t||0);
    if(o.aaa)miniY(x,tx+ux*20,ty+uy*20,3.2,a+Math.PI,C.aaa);
    // hinge
    x.strokeStyle=C.ab;x.lineWidth=hl==='hinge'?6:4;x.beginPath();x.moveTo(sg*8,-12);x.lineTo(...at(40,-20));x.stroke();}
  for(const sg of [-1,1]){dom(sg*24,40,0,20,30,C.ab,hl==='stem');dom(sg*24,108,0,20,28,C.ab,hl==='stem');
    if(o.lys?.[sg<0?0:1]){x.fillStyle=C.lys;x.beginPath();x.arc(sg*24,146,hl==='tail'?7:5,0,TAU);x.fill();}
    // the sugar chain tucked between the two upper stem domains (Asn297)
    x.strokeStyle=C.gly;x.lineWidth=hl==='sugars'?3:2;x.beginPath();x.moveTo(sg*8,58);x.lineTo(sg*8,40);x.lineTo(sg*3,26);x.moveTo(sg*8,40);x.lineTo(sg*14,24);x.stroke();
    x.fillStyle=C.gly;for(const [gx,gy] of [[sg*8,40],[sg*3,26],[sg*14,24]]){x.beginPath();x.arc(gx,gy,hl==='sugars'?4:3,0,TAU);x.fill();}}
  x.strokeStyle='rgba(169,212,255,.6)';x.lineWidth=2;x.beginPath();x.moveTo(-8,-12);x.lineTo(-8,10);x.moveTo(8,-12);x.lineTo(8,10);x.stroke();
  x.restore();}

export const GUIDE_H={
  ada:GUIDE.ada,tnf:GUIDE.tnf,
  hd_fat:{name:'Fat cell (adipocyte)',kind:'Cell',size:'about 60–110 µm on average (Hong 2014)',draw:(x,cx,cy,s)=>{for(const [dx,dy] of [[-30,-18],[22,-22],[-8,16],[36,14],[-40,22]]){x.beginPath();x.arc(cx+dx*s,cy+dy*s,17*s,0,TAU);x.fillStyle=rgba(C.fat,.14);x.fill();x.strokeStyle=rgba(C.fat,.6);x.lineWidth=1.6*s;x.stroke();x.fillStyle='#5B86FF';x.beginPath();x.arc(cx+dx*s+12*s,cy+dy*s+6*s,3*s,0,TAU);x.fill();}},
    text:['Fat under the skin is made of these: each cell is one big droplet of fat with its nucleus squashed to the edge.','Hadlima goes into this layer, under the skin rather than into a muscle or a vein. The dose spreads between the cells and is absorbed slowly over days.']},
  hd_lymph:{name:'Lymph capillary',kind:'Vessel',size:'about 35–70 µm wide in skin (Breslin 2018)',draw:(x,cx,cy,s)=>{x.lineCap='round';x.strokeStyle=rgba(C.lym,.35);x.lineWidth=22*s;x.beginPath();x.moveTo(cx-60*s,cy+10*s);x.quadraticCurveTo(cx,cy-20*s,cx+60*s,cy);x.stroke();x.strokeStyle=C.lym;x.lineWidth=2*s;x.stroke();for(let i=0;i<4;i++)miniY(x,cx-40*s+i*26*s,cy-2*s,s*1.2,i,C.ab);},
    text:['A thin, blind-ended vessel that collects fluid from between the cells. Its wall cells overlap like roof tiles without tight seals, so large molecules can get in (Richter 2012). In the fat under the skin they run along the fibrous walls between the fat lobules, not inside them.','In sheep, molecules bigger than about 16 kDa left an injection mainly this way (Supersaxo 1990). Adalimumab is about 148 kDa, so most of it is thought to travel through lymph and lymph nodes before reaching the blood, which is part of why its level peaks days later.']},
  hd_cap:{name:'Blood capillary',kind:'Vessel',size:'about one red cell wide',draw:(x,cx,cy,s)=>{x.strokeStyle=C.cap;x.lineWidth=7*s;x.lineCap='round';x.beginPath();x.moveTo(cx-60*s,cy);x.bezierCurveTo(cx-20*s,cy-30*s,cx+20*s,cy+30*s,cx+60*s,cy);x.stroke();},
    text:['The smallest blood vessels, one red cell wide, with a tight wall of single cells.','Small molecules slip through it straight into the blood. Big proteins like antibodies get through only slowly, so after an injection under the skin most of the dose is thought to take the slower lymph route (Richter 2012).']},
  hd_fcrn:{name:'FcRn',kind:'Receptor',size:'nanometres',draw:(x,cx,cy,s)=>{x.strokeStyle=C.fcrn;x.lineWidth=7*s;x.lineCap='round';x.beginPath();x.moveTo(cx,cy+40*s);x.lineTo(cx,cy);x.arc(cx+14*s,cy,14*s,Math.PI,Math.PI*1.9);x.stroke();miniY(x,cx+26*s,cy-20*s,s*3,.6,C.ab);},
    text:['The "neonatal Fc receptor". Inside cells, in the slightly acidic compartments where swallowed proteins are sorted, it grips antibodies of the IgG kind by their stem and carries them back out, saving them from being broken down. That is why IgG lasts about three weeks in the blood while most other blood proteins last days (Pyzik 2019).','The same receptor carries the mother\'s antibodies across the placenta to the baby, and it carries adalimumab too.']},
  hd_aaa:{name:'Antibodies to the drug',kind:'The body\'s own antibodies',size:'about 10–15 nm',draw:(x,cx,cy,s)=>{G.ab(x,cx-10*s,cy+10*s,s*.55,0);G.ab(x,cx+30*s,cy-48*s,s*.38,Math.PI,C.aaa);},
    text:['Some people\'s immune systems make antibodies against adalimumab. In a study of 50 people with RA who had them, nearly all of the antibody activity was aimed at the tips of its arms, the very part that grabs TNF, so they block it from working (van Schouwenburg 2013).','High levels also lower the amount of free drug in the blood, in one Dutch cohort close to none (Bartelds 2011). Methotrexate makes them less likely, more so at higher doses (Krieckaert 2012), one reason the two are often given together.']},
  hd_glycan:{name:'The sugar chains',kind:'Part of the antibody',size:'a few nanometres',draw:(x,cx,cy,s)=>{x.strokeStyle=C.gly;x.lineWidth=3*s;x.beginPath();x.moveTo(cx,cy+30*s);x.lineTo(cx,cy);x.lineTo(cx-18*s,cy-22*s);x.moveTo(cx,cy);x.lineTo(cx+18*s,cy-22*s);x.stroke();x.fillStyle=C.gly;for(const [a,b] of [[0,0],[-18,-22],[18,-22],[0,30]]){x.beginPath();x.arc(cx+a*s,cy+b*s,6*s,0,TAU);x.fill();}},
    text:['Nearly every adalimumab molecule carries a small branched sugar on each half of its upper stem. Their exact mix varies from batch to batch, even for the original brand.','Immune cells\' Fc receptors need them to grip the stem (Pyzik 2019), so they are one of the things measured most closely when a biosimilar is compared with its reference. In Hadlima\'s comparison with Humira, the sugars that tune immune-cell binding stayed inside the range set from Humira\'s lots (Lee 2019).']},
};

/* ---------------- level 1: under the skin, fourteen days */
function skinLevel(){
  seed=11;const SURF=58,DERM=212,FAT=600,DEP={x:500,y:395};
  const septa=[[[330,212],[345,300],[318,420],[352,520],[336,600]],[[690,212],[668,320],[702,430],[682,600]]];
  // lymphatics: a plexus where dermis meets fat, trunks down the fibrous septa; fat lobules have none (Richter 2012)
  const lymA=[[392,218],[520,210],[640,220],[700,250],[680,320],[714,430],[820,452],[1300,470]],lymB=[[290,218],[333,300],[306,420],[340,520],[344,586],[520,592],[690,588],[860,576],[1300,566]],lymC=[[-300,150],[120,138],[420,150],[720,140],[1300,160]];
  const capP=[[[-300,110],[60,96],[140,170],[240,100],[360,176],[470,104],[580,172],[690,98],[800,170],[910,104],[1300,120]],septa[0].map(([a,b])=>[a+12,b]),septa[1].map(([a,b])=>[a-12,b])];
  const LA=sample(lymA),LB=sample(lymB);
  const cells=[];for(let y=232,r=0;y<FAT;y+=26,r++)for(let x=-300+(r%2)*15;x<1300;x+=30){const c={x:x+(R()-.5)*7,y:y+(R()-.5)*6,r:12+R()*3};if(septa.some(s=>near(s,c,20)))continue;cells.push(c);}
  let S;const N=150;
  function reset(){S={day:0,ph:'ready',t:0,playing:false,cloud:0,ab:[],rbc:Array.from({length:14},(_,i)=>({u:i/14}))};}
  reset();
  function inject(){if(S.ph!=='ready')return;S.ph='needle';S.t=0;}
  function step(dt){S.t+=dt;
    if(S.ph==='needle'&&S.t>1.2){S.ph='depot';S.t=0;for(let i=0;i<N;i++){const a=rand(0,TAU),r=Math.sqrt(R())*30;S.ab.push({x:DEP.x+Math.cos(a)*r,y:DEP.y+Math.sin(a)*r,st:'depot',rot:rand(0,6),a:1});}}
    if(S.ph==='depot'){S.cloud=Math.min(1,S.cloud+dt);if(S.t>1.4){S.ph='run';S.playing=true;}}
    if(S.ph==='run'&&S.playing){S.day=Math.min(14,S.day+dt*.5);if(S.day>=14){S.playing=false;S.ph='done';}}
    const want=Math.round(N*Math.exp(-KA*S.day));let inDepot=S.ab.filter(p=>p.st==='depot');
    while(inDepot.length>want){const p=inDepot.splice(Math.floor(Math.random()*inDepot.length),1)[0];
      if(Math.random()<F){const P=p.y>450?LB:LA;let bi=0,bd=1e9;P.forEach(([a,b],i)=>{const d=Math.hypot(a-p.x,b-p.y);if(d<bd){bd=d;bi=i;}});p.st='to';p.P=P;p.i=bi;}else{p.st='broken';}}
    const cr=40+S.cloud*130*(.55+.45*Math.exp(-KA*S.day));
    for(const p of S.ab){p.rot+=dt*.6;
      if(p.st==='depot'){p.x+=rand(-18,18)*dt;p.y+=rand(-18,18)*dt;const dx=p.x-DEP.x,dy=p.y-DEP.y,d=Math.hypot(dx,dy);if(d>cr){p.x=DEP.x+dx/d*cr;p.y=DEP.y+dy/d*cr;}if(!p.r0)p.r0=Math.sqrt(Math.random());const want=p.r0*cr;p.x+=dx/(d||1)*(want-d)*dt*.8;p.y+=dy/(d||1)*(want-d)*dt*.8;}
      else if(p.st==='to'){const [tx,ty]=p.P[p.i];p.x=lerp(p.x,tx,dt*2.5);p.y=lerp(p.y,ty,dt*2.5);if(Math.hypot(p.x-tx,p.y-ty)<4)p.st='lymph';}
      else if(p.st==='lymph'){p.i+=dt*14;if(p.i>=p.P.length-1){p.st='gone';continue;}const k=Math.floor(p.i),f=p.i-k;p.x=lerp(p.P[k][0],p.P[k+1][0],f);p.y=lerp(p.P[k][1],p.P[k+1][1],f);}
      else if(p.st==='broken'){p.a-=dt*.8;if(p.a<=0)p.st='gone';}}
    S.ab=S.ab.filter(p=>p.st!=='gone');
    for(const r of S.rbc)r.u=(r.u+dt*.05)%1;
  }
  function draw(x,dt,t,api){step(dt);
    x.fillStyle='#0B0A0C';x.fillRect(-300,-200,1600,1100);
    // epidermis and dermis
    x.fillStyle='#4A3530';x.fillRect(-300,SURF,1600,16);x.fillStyle='#6E5448';x.fillRect(-300,SURF,1600,3);
    x.fillStyle='#24131A';x.fillRect(-300,SURF+16,1600,DERM-SURF-16);
    x.strokeStyle='rgba(224,170,160,.10)';x.lineWidth=3;for(let i=0;i<26;i++){x.beginPath();const y0=SURF+30+(i*37)%(DERM-SURF-40);x.moveTo(-300+i*70,y0);x.bezierCurveTo(-260+i*70,y0-14,-200+i*70,y0+16,-150+i*70,y0);x.stroke();}
    // fat
    x.fillStyle='#17140E';x.fillRect(-300,DERM,1600,FAT-DERM);
    for(const c of cells){x.beginPath();x.arc(c.x,c.y,c.r,0,TAU);x.fillStyle=rgba(C.fat,.10);x.fill();x.strokeStyle=rgba(C.fat,.38);x.lineWidth=1.3;x.stroke();}
    x.strokeStyle='#3A2A30';x.lineWidth=9;x.lineCap='round';for(const s of septa){path(x,s);x.stroke();}
    // muscle below
    x.fillStyle='#2A1016';x.fillRect(-300,FAT,1600,300);x.strokeStyle='rgba(224,82,95,.18)';x.lineWidth=2;for(let y=FAT+14;y<FAT+120;y+=12){x.beginPath();x.moveTo(-300,y);x.lineTo(1300,y+4);x.stroke();}
    x.fillStyle='#5A4248';x.fillRect(-300,FAT,1600,5);
    // vessels
    for(const P of capP){x.strokeStyle=C.cap;x.lineWidth=2.4;path(x,P);x.stroke();}
    for(const P of [lymA,lymB,lymC]){x.strokeStyle=rgba(C.lym,.16);x.lineWidth=13;path(x,P);x.stroke();x.strokeStyle=rgba(C.lym,.75);x.lineWidth=1.6;x.stroke();}
    for(const [bx,by] of [lymA[0],lymB[0]]){x.fillStyle=rgba(C.lym,.16);x.beginPath();x.arc(bx,by,10,0,TAU);x.fill();}
    const CP=sample(capP[0],12);for(const r of S.rbc){const [a,b]=CP[Math.floor(r.u*(CP.length-1))];x.fillStyle='rgba(225,70,80,.9)';x.beginPath();x.arc(a,b,2,0,TAU);x.fill();}
    // the dose
    if(S.cloud>0){const cr=40+S.cloud*130*(.55+.45*Math.exp(-KA*S.day));x.fillStyle=rgba(C.ab,.07+.08*Math.exp(-KA*S.day));x.beginPath();x.arc(DEP.x,DEP.y,cr,0,TAU);x.fill();}
    for(const p of S.ab){if(p.st==='broken'){x.fillStyle=rgba(C.ab,p.a*.8);for(let k=0;k<3;k++){x.beginPath();x.arc(p.x+Math.cos(k*2+p.rot)*6*(1-p.a),p.y+Math.sin(k*2+p.rot)*6*(1-p.a),1.6,0,TAU);x.fill();}continue;}
      miniY(x,p.x,p.y,1.05,p.rot);}
    // the needle, drawn far wider than the molecules are big: nothing here is at the molecules' scale
    if(S.ph==='needle'||S.ph==='depot'){const k=S.ph==='needle'?clamp(S.t/.8,0,1):1-clamp((S.t-.6)/.6,0,1);const tip=lerp(-160,DEP.y-10,k*k*(3-2*k));
      x.fillStyle='#C9D6D8';x.beginPath();x.moveTo(DEP.x-11,-200);x.lineTo(DEP.x+11,-200);x.lineTo(DEP.x+11,tip-20);x.lineTo(DEP.x-11,tip);x.closePath();x.fill();x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.beginPath();x.moveTo(DEP.x-4,-200);x.lineTo(DEP.x-4,tip-6);x.stroke();}
    // labels stay inside x 140–860, the part that a phone's crop and the desktop card both leave visible
    label(x,'SKIN SURFACE',140,SURF-12);label(x,'DERMIS',140,DERM-12);label(x,'FAT UNDER THE SKIN',140,DERM+28);label(x,'MUSCLE',140,FAT+36);
    label(x,'LYMPH CAPILLARY',lymA[0][0]+30,lymA[0][1]+30);label(x,'BLOOD CAPILLARY',380,92);label(x,'TO A LYMPH NODE,',860,494,'right');label(x,'THEN THE BLOOD →',860,512,'right');
    const q=s=>api.card.querySelector(s);if(q('#hs-day')){const dep=S.ph==='ready'||S.ph==='needle'?1:Math.exp(-KA*S.day),inj=S.ph!=='ready';
      q('#hs-day').textContent=inj?S.day.toFixed(S.day<1?1:0):'0';q('#hs-dep').textContent=inj?Math.round(dep*100)+'%':'—';q('#hs-depB').style.width=(inj?dep*100:0)+'%';
      q('#hs-bl').textContent=inj?Math.round(F*(1-dep)*100)+'% of the dose':'—';q('#hs-blB').style.width=(inj?F*(1-dep)*100:0)+'%';
      q('#hs-br').textContent=inj?Math.round((1-F)*(1-dep)*100)+'%':'—';q('#hs-lv').textContent=inj?level(S.day).toFixed(1)+' µg/mL':'—';
      q('#hs-dot').setAttribute('cx',(10+S.day/14*280).toFixed(1));q('#hs-dot').setAttribute('cy',(62-level(S.day)/5*52).toFixed(1));
      q('#hs-go').disabled=S.ph!=='ready';q('#hs-pl').textContent=S.playing?'Pause':'Play';q('#hs-pl').disabled=S.ph!=='run';
      const end=q('#hs-end');if(S.ph==='done'&&end.hidden){end.hidden=false;}}
  }
  const spark=()=>{let d='';for(let i=0;i<=56;i++){const day=i/4;d+=(i?'L':'M')+(10+day/14*280).toFixed(1)+' '+(62-level(day)/5*52).toFixed(1);}return d;};
  return {id:'skin',label:'Under the skin',size:'5 mm',fit:'cover',bar:{units:200,label:'1 mm'},zoomFocus:{x:500,y:330},
    card(){return `<p class="k">Level 1 · under the skin · day <span id="hs-day">0</span> of 14</p><h2>One dose, fourteen days</h2>
      <p>The autoinjector puts 40 mg into the fat under the skin of the belly or thigh. Antibodies get into the blood capillaries there only slowly, so most of the dose is thought to seep between the fat cells into the lymph, passes through lymph nodes and reaches the blood over days. Some of it is broken down on the way.</p>
      <div class="dv-btns"><button class="dv-btn go" id="hs-go" type="button">Inject 40 mg</button><button class="dv-btn" id="hs-pl" type="button" disabled>Play</button><button class="dv-btn" id="hs-re" type="button">Start over</button></div>
      <div class="dv-meter"><span>Still under the skin</span><b id="hs-dep">—</b><i><u id="hs-depB"></u></i></div>
      <div class="dv-meter"><span>Reached the blood</span><b id="hs-bl">—</b><i><u id="hs-blB" style="background:${C.ab}"></u></i></div>
      <div class="dv-meter"><span>Broken down on the way</span><b id="hs-br">—</b></div>
      <div class="dv-meter"><span>Level in the blood</span><b id="hs-lv">—</b></div>
      <svg viewBox="0 0 300 80" width="100%" height="80" aria-hidden="true" style="display:block;margin:4px 0 2px"><line x1="10" y1="62" x2="290" y2="62" stroke="var(--line-2)"/><path d="${spark()}" fill="none" stroke="var(--c)" stroke-width="2"/><circle id="hs-dot" cx="10" cy="62" r="4.5" fill="var(--bone)"/><text x="10" y="77" font-size="8.5" fill="var(--dim)" font-family="Martian Mono, monospace">DAY 0</text><text x="290" y="77" font-size="8.5" fill="var(--dim)" text-anchor="end" font-family="Martian Mono, monospace">DAY 14</text></svg>
      <div id="hs-end" hidden><p>Day 14, and the next dose is due. In this model about three quarters of the peak is still in the blood, so each dose tops up the last; the bench shows the weeks after.</p></div>
      <div class="dv-btns"><button class="dv-btn" id="hs-next" type="button">Zoom into a vessel cell<small>why it lasts two weeks</small></button></div>
      <p class="dv-fine">The label's numbers for one 40 mg dose: 64% reaches the blood, peaking after about 5.5 days at 4.7 µg/mL in healthy volunteers, with a half-life of about two weeks. The route through the lymph is from Supersaxo 1990 and Richter 2012. Cells and vessels roughly to scale; the dermis and the fat are drawn far thinner than they are (belly fat is several millimetres to a few centimetres deep), and the needle and the molecules are not to scale. Tap the fat, the vessels or a molecule to collect them.</p>`;},
    bind(card,api){card.querySelector('#hs-go').onclick=()=>inject();card.querySelector('#hs-pl').onclick=()=>{if(S.ph==='run')S.playing=!S.playing;};
      card.querySelector('#hs-re').onclick=()=>{reset();card.querySelector('#hs-end').hidden=true;};card.querySelector('#hs-next').onclick=()=>api.go('vessel',{from:{x:600,y:150}});},
    tap(p,api){for(const a of S.ab)if(Math.hypot(a.x-p.x,a.y-p.y)<14)return api.discover('ada');
      if([lymA,lymB,lymC].some(P=>near(P,p,14)))return api.discover('hd_lymph');if(capP.some(P=>near(P,p,10)))return api.discover('hd_cap');
      if(p.y>DERM&&p.y<FAT)return api.discover('hd_fat');},
    draw,
  };
}

/* ---------------- level 2: one vessel cell, and the receptor that sends it back */
function vesselLevel(){
  const TOP=200,BOT=520,LYS={x:200,y:430,r:58};let S;
  function reset(keep){S={mode:keep?.mode||'vessel',fcrn:keep?keep.fcrn:true,aaa:keep?keep.aaa:false,blood:[],ves:[],frags:[],tick:0,saved:0,broken:0,baby:0,cx:[]};
    for(let i=0;i<52;i++)S.blood.push(newP(rand(-300,1300)));}
  const newP=x=>{const r=Math.random();return {x,y:rand(22,TOP-40),k:r<.36?'ab':r<.66?'alb':'oth',rot:rand(0,6),v:rand(40,70)};};
  reset();
  const cargoTo=v=>S.mode==='placenta'?{x:v.x,y:BOT}:{x:v.x,y:TOP};
  function step(dt,api){S.tick+=dt;
    for(const p of S.blood){p.x+=p.v*dt;p.rot+=dt*.5;if(p.x>1300){Object.assign(p,newP(-300));p.bound=null;}}
    // antibodies to the drug find adalimumab in the blood and sit on its tips
    if(S.aaa&&S.mode==='vessel')for(const p of S.blood)if(p.k==='ab'&&!p.bound&&Math.random()<dt*.5){p.bound=true;p.life=rand(2.5,4.5);}
    for(const p of S.blood)if(p.bound){p.life-=dt;if(p.life<=0){S.cx.push({x:p.x,y:p.y,t:0});S.broken++;Object.assign(p,newP(-300));p.bound=null;}}
    for(const c of S.cx)c.t+=dt;S.cx=S.cx.filter(c=>c.t<1);
    // a sip of plasma every second or so
    if(S.tick>1.05){S.tick=0;const vx=rand(320,720);const cargo=[];for(const p of S.blood)if(!p.bound&&Math.abs(p.x-vx)<70&&cargo.length<3){cargo.push({k:p.k,rot:p.rot,held:false});Object.assign(p,newP(-300));}
      if(cargo.length<2)cargo.push({k:Math.random()<.4?'ab':Math.random()<.5?'alb':'oth',rot:rand(0,6),held:false});
      S.ves.push({x:vx,y:TOP-6,ph:'in',t:0,cargo,acid:0});}
    for(const v of S.ves){v.t+=dt;
      if(v.ph==='in'){v.y=lerp(v.y,TOP+120,dt*1.6);v.acid=Math.min(1,v.acid+dt*.8);if(v.acid>.6&&S.fcrn)for(const c of v.cargo)if(c.k==='ab'||c.k==='alb'&&S.mode==='vessel')c.held=true;  // albumin crosses the placenta far less than IgG (Pyzik 2019)
        if(v.t>2.1){v.ph='split';v.t=0;const keep=v.cargo.filter(c=>c.held),rest=v.cargo.filter(c=>!c.held);
          if(keep.length){const to=cargoTo(v);S.ves.push({x:v.x+20,y:v.y,ph:'out',t:0,cargo:keep,acid:1,tx:to.x,ty:to.y});}
          v.cargo=rest;v.ph='lys';v.t=0;}}
      else if(v.ph==='out'){v.x=lerp(v.x,v.tx,dt*2);v.y=lerp(v.y,v.ty+(S.mode==='placenta'?-10:10),dt*1.8);v.acid=Math.max(0,v.acid-dt*1.2);
        if(v.t>1.6){v.gone=true;for(const c of v.cargo){if(c.k==='ab'){S.mode==='placenta'?S.baby++:S.saved++;}
          if(S.mode==='vessel'){const back={x:v.x,y:TOP-24,k:c.k,rot:c.rot,v:rand(40,70)};const i=S.blood.findIndex(b=>b.x<-100);i>=0?S.blood[i]=back:S.blood.push(back);}else S.frags.push({x:v.x,y:BOT+40,k:c.k,t:0,baby:true,rot:c.rot});}}}
      else if(v.ph==='lys'){v.x=lerp(v.x,LYS.x+rand(-10,10),dt*1.4);v.y=lerp(v.y,LYS.y,dt*1.4);
        if(v.t>1.5){v.gone=true;for(const c of v.cargo){if(c.k==='ab')S.broken++;for(let k=0;k<4;k++)S.frags.push({x:LYS.x+rand(-30,30),y:LYS.y+rand(-30,30),k:c.k,t:0,rot:rand(0,6)});}}}}
    S.ves=S.ves.filter(v=>!v.gone);
    for(const f of S.frags){f.t+=dt;if(f.baby)f.y+=dt*16;}S.frags=S.frags.filter(f=>f.t<(f.baby?3:1.6));
  }
  function particle(x,k,px,py,rot,a=1){if(k==='ab')miniY(x,px,py,1.9,rot,C.ab,a);else if(k==='alb'){x.fillStyle=rgba(C.alb,.85*a);x.beginPath();x.ellipse(px,py,8,5,rot,0,TAU);x.fill();}
    else{x.strokeStyle=rgba(C.oth,.9*a);x.lineWidth=2.2;x.beginPath();for(let i=0;i<5;i++)x.lineTo(px-8+i*4,py+(i%2?3:-3));x.stroke();}}
  function draw(x,dt,t,api){step(dt,api);const plac=S.mode==='placenta';
    x.fillStyle='#0A0E12';x.fillRect(-300,-200,1600,1100);
    x.fillStyle=plac?'#2A0C16':'#2A0C12';x.fillRect(-300,-200,1600,TOP+200);
    x.fillStyle='#10201C';x.beginPath();x.roundRect(-320,TOP,1640,BOT-TOP,30);x.fill();
    x.fillStyle=plac?'#1E0C1A':'#0C1418';x.fillRect(-300,BOT,1600,400);
    for(const y of [TOP,BOT]){x.strokeStyle='#5E7A72';x.lineWidth=5;x.beginPath();x.moveTo(-300,y);x.lineTo(1300,y);x.stroke();}
    nucleus(x,860,360,78,46,.05);
    // lysosome with its enzymes
    x.fillStyle=rgba(C.aaa,.12);x.beginPath();x.arc(LYS.x,LYS.y,LYS.r,0,TAU);x.fill();x.strokeStyle=C.aaa;x.lineWidth=3;x.stroke();
    for(let i=0;i<4;i++){const a=t*.7+i*1.6,mo=.5+.5*Math.sin(t*6+i);const ex=LYS.x+Math.cos(a)*30,ey=LYS.y+Math.sin(a)*24;x.fillStyle='#FF6FA8';x.beginPath();x.moveTo(ex,ey);x.arc(ex,ey,8,mo*.6+a,TAU-mo*.6+a);x.closePath();x.fill();}
    for(const p of S.blood){particle(x,p.k,p.x,p.y,p.rot);if(p.bound){miniY(x,p.x-5,p.y-13,1.1,Math.PI+.4,C.aaa);miniY(x,p.x+6,p.y-13,1.1,Math.PI-.4,C.aaa);}}
    for(const c of S.cx){x.strokeStyle=rgba(C.aaa,1-c.t);x.lineWidth=2.5;x.beginPath();x.arc(c.x,c.y,10+c.t*30,0,TAU);x.stroke();}
    for(const v of S.ves){const r=v.ph==='out'?26:36;
      x.fillStyle=`rgba(${Math.round(lerp(90,255,v.acid))},${Math.round(lerp(150,160,v.acid))},${Math.round(lerp(190,90,v.acid))},.16)`;x.beginPath();x.arc(v.x,v.y,r,0,TAU);x.fill();x.strokeStyle='#8FB3AA';x.lineWidth=2.5;x.stroke();
      if(S.fcrn)for(let i=0;i<5;i++){const a=i/5*TAU+.3;x.strokeStyle=C.fcrn;x.lineWidth=3;x.beginPath();x.moveTo(v.x+Math.cos(a)*r,v.y+Math.sin(a)*r);x.lineTo(v.x+Math.cos(a)*(r-7),v.y+Math.sin(a)*(r-7));x.stroke();}
      v.cargo.forEach((c,i)=>{const a=i/Math.max(1,v.cargo.length)*TAU+v.t;const rr=c.held?r-12:r*.35;particle(x,c.k,v.x+Math.cos(a)*rr,v.y+Math.sin(a)*rr,c.rot);});
      if(v.ph==='in'&&v.acid>.5){x.fillStyle=LBL;x.font='10px "Martian Mono", monospace';x.textAlign='center';x.fillText('pH 6',v.x,v.y+r+14);}}
    for(const f of S.frags){if(f.baby){particle(x,f.k,f.x,f.y,f.rot,1-f.t/3);continue;}x.fillStyle=f.k==='ab'?rgba(C.ab,1-f.t/1.6):f.k==='alb'?rgba(C.alb,1-f.t/1.6):rgba(C.oth,1-f.t/1.6);x.fillRect(f.x+f.t*10,f.y-f.t*6,3,3);}
    label(x,plac?'THE MOTHER\'S BLOOD':'BLOOD',24,34);label(x,plac?'A PLACENTA CELL':'A CELL LINING THE VESSEL',24,TOP+34);label(x,plac?'THE BABY\'S BLOOD':'TISSUE',24,BOT+40);
    label(x,'LYSOSOME',LYS.x,LYS.y+LYS.r+20,'center');
    const q=s=>api.card.querySelector(s);if(q('#hv-s')){q('#hv-s').textContent=plac?S.baby:S.saved;q('#hv-b').textContent=S.broken;
      if(q('#hv-hl'))q('#hv-hl').textContent=!S.fcrn?'about 3 days (like IgG without FcRn)':plac?'—':S.aaa?'about 5 days (illustrative)':'about 2 weeks';}
  }
  return {id:'vessel',label:'Vessel cell',size:'20 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:500,y:330},
    card(){const plac=S.mode==='placenta';return `<p class="k">Level 2 · one cell</p><h2>Why it lasts two weeks</h2>
      <div class="dv-seg" role="radiogroup" aria-label="Where"><button role="radio" data-hm="vessel" aria-checked="${!plac}">In a blood vessel</button><button role="radio" data-hm="placenta" aria-checked="${plac}">In the placenta</button></div>
      <div id="hv-body"></div>`;},
    bind(card,api){const body=card.querySelector('#hv-body');
      const render=()=>{const plac=S.mode==='placenta';
        body.innerHTML=(plac?`<p>The same receptor that rescues it in blood vessels carries it across the placenta. In the third trimester the cells there pick up the mother's IgG antibodies, and adalimumab with them, and FcRn ferries them across to the baby's side. That is why a baby exposed late in pregnancy is usually born with a level about as high as the mother's, or higher (label; Julsgaard 2016).</p>`:
          `<p>The cells lining every blood vessel keep sipping the plasma. Inside, the sip turns slightly acidic, and there <b style="color:var(--bone)">FcRn</b> grips antibodies like adalimumab (blue) and albumin (amber) and carries them back out, where the neutral blood makes it let go. Other proteins (grey) go on to the lysosome and are broken down.</p>`)+
          `<div class="dv-btns"><button class="dv-btn${S.fcrn?' on':''}" id="hv-f" type="button" aria-pressed="${S.fcrn}">FcRn working<small>switch it off to see what it does</small></button>${plac?'':`<button class="dv-btn${S.aaa?' on':''}" id="hv-a" type="button" aria-pressed="${S.aaa}">Antibodies to the drug<small>made by some people's immune systems</small></button>`}</div>
          <div class="dv-meter"><span>${plac?'Carried to the baby':'Rescued and sent back'}</span><b id="hv-s">0</b></div><div class="dv-meter"><span>Broken down</span><b id="hv-b">0</b></div>
          ${plac?'':'<div class="dv-meter"><span>Half-life of the drug</span><b id="hv-hl">about 2 weeks</b></div>'}
          ${S.aaa&&!plac?'<p>They latch onto the tips of its arms, the part that grabs TNF, and the drug is cleared faster. Methotrexate makes them less likely.</p>':''}
          <div class="dv-btns"><button class="dv-btn" id="hv-next" type="button">Zoom into the molecule<small>Hadlima beside Humira</small></button></div>
          <p class="dv-fine">${plac?'The label: adalimumab is actively transferred across the placenta in the third trimester; in a study of ten women, cord blood had more adalimumab than the mother\'s blood in nine. FcRn: Roopenian 2007, Pyzik 2019. Albumin crosses far less, so it isn\'t drawn crossing. ':'FcRn grips at pH 5–6.5 and lets go at the blood\'s pH 7.4; IgG and albumin last about three weeks while most blood proteins last days, and in two people born without working FcRn their IgG lasted about three days (Pyzik 2019; Roopenian 2007). Adalimumab\'s half-life is about two weeks (label). Antibodies to the drug: van Schouwenburg 2013, Bartelds 2011, Krieckaert 2012; the 5-day figure is this app\'s illustrative model, the same as on the bench. '}A schematic, not to scale.</p>`;
        body.querySelector('#hv-f').onclick=()=>{S.fcrn=!S.fcrn;api.discover('hd_fcrn',true);render();};
        body.querySelector('#hv-a')?.addEventListener('click',()=>{S.aaa=!S.aaa;if(S.aaa)api.discover('hd_aaa',true);render();});
        body.querySelector('#hv-next').onclick=()=>api.go('molecule',{from:{x:500,y:120}});};
      card.querySelectorAll('[data-hm]').forEach(b=>b.onclick=()=>{reset({mode:b.dataset.hm,fcrn:S.fcrn,aaa:S.aaa});card.querySelectorAll('[data-hm]').forEach(x=>x.setAttribute('aria-checked',x===b));render();});
      render();},
    tap(p,api){if(p.y<TOP-10){for(const b of S.blood)if(b.bound&&Math.hypot(b.x-p.x,b.y-p.y)<24)return api.discover('hd_aaa');for(const b of S.blood)if(b.k==='ab'&&Math.hypot(b.x-p.x,b.y-p.y)<20)return api.discover('ada');return;}
      if(Math.hypot(p.x-LYS.x,p.y-LYS.y)<LYS.r)return api.toast('The lysosome: the cell\'s recycling bin');
      for(const v of S.ves)if(Math.hypot(v.x-p.x,v.y-p.y)<36)return api.discover('hd_fcrn');},
    draw,
  };
}

/* ---------------- level 3: the molecule, Hadlima and Humira */
function moleculeLevel(jump){
  const M={mode:'parts',hl:null,tnf:[],held:[false,false],t:0};
  const PARTS={
    tips:['The tips','Six small loops at the end of each arm, three from each chain, shaped to fit TNF. They are what make adalimumab adalimumab; the rest is built like any human IgG1 antibody. Antibodies to the drug, when someone makes them, nearly always aim here (van Schouwenburg 2013).'],
    arms:['The arms','Two arms, so one antibody can hold two TNF molecules. Each arm is a whole light chain (paler) plus the top half of a heavy chain (darker); the rest of the two heavy chains makes the stem. They grab TNF floating free or sitting on a cell\'s surface (Lee 2019) and stop it reaching either of its two receptors (label). They don\'t touch the related molecule lymphotoxin.'],
    hinge:['The hinge','A flexible stretch that lets the arms swing and reach.'],
    stem:['The stem','The stem (Fc) is the standard part of a human IgG1 antibody. Where its upper and lower sections meet is the spot FcRn grips to rescue it, which gives it its two-week half-life (Pyzik 2019). In a dish it can also call in complement to burst cells that carry TNF on their surface (label).'],
    sugars:['The sugar chains','One small branched sugar on each side of the stem. Immune cells\' Fc receptors need them to grip the stem (Pyzik 2019), so they are measured closely when a biosimilar is compared with its original.'],
    tail:['The tail lysine','The last amino acid of each heavy chain, a lysine, is often trimmed off while the antibody is being made. Hadlima has fewer of them left on than Humira. It was the biggest difference in electric charge between the two, and lab tests found it made no difference to catching TNF or to the stem\'s jobs (Lee 2019).'],
  };
  // which part a tap hits; the big antibody is drawn at 1.25×
  const where=p=>{const dx=(p.x-500)/1.25,dy=(p.y-330)/1.25;for(const sg of [-1,1]){const a=sg*.62,ux=Math.sin(a),uy=-Math.cos(a);const tx=ux*178,ty=-40+uy*178;if(Math.hypot(dx-tx,dy-ty)<36)return 'tips';
      const u=(dx*ux+(dy+40)*uy);const perp=Math.abs(dx*-uy+(dy+40)*ux);if(u>30&&u<165&&perp<48)return 'arms';}
    if(Math.abs(dx)<26&&dy>-36&&dy<14)return 'hinge';if(Math.abs(dx)<40&&dy>20&&dy<66&&Math.abs(Math.abs(dx)-8)<14)return 'sugars';if(Math.abs(Math.abs(dx)-24)<12&&Math.abs(dy-146)<14)return 'tail';if(Math.abs(dx)<50&&dy>8&&dy<140)return 'stem';return null;};
  function draw(x,dt,t,api){M.t+=dt;x.fillStyle='#0A1418';x.fillRect(-300,-200,1600,1100);
    if(M.mode==='compare'){igg(x,300,330,1.05,{lys:[false,true]});igg(x,700,330,1.05,{lys:[true,true]});
      x.fillStyle='rgba(236,230,218,.75)';x.font='13px "Martian Mono", monospace';x.textAlign='center';x.fillText('HADLIMA',300,560);x.fillText('HUMIRA',700,560);
      label(x,'adalimumab-bwwd',300,580,'center');label(x,'adalimumab',700,580,'center');label(x,'tail lysines',500,488,'center');
      x.strokeStyle=LBL;x.lineWidth=1;x.setLineDash([3,4]);x.beginPath();x.moveTo(440,482);x.lineTo(345,482);x.moveTo(560,482);x.lineTo(650,482);x.stroke();x.setLineDash([]);return;}
    if(M.mode==='tnf'){for(const m of M.tnf){const free=[0,1].filter(i=>!M.held[i]);if(free.length){const a=(free[0]?1:-1)*.62;m.vx+=(500+Math.sin(a)*222-m.x)*dt*.15;m.vy+=(280-Math.cos(a)*222-m.y)*dt*.15;m.vx*=1-dt*.3;m.vy*=1-dt*.3;}
        m.x+=m.vx*dt;m.y+=m.vy*dt;m.rot+=dt*.4;if(m.x<-80||m.x>1080)m.vx*=-1;if(m.y<-40||m.y>740)m.vy*=-1;
        for(const sg of [0,1]){if(M.held[sg])continue;const a=(sg?1:-1)*.62;const tx=500+Math.sin(a)*222,ty=280-Math.cos(a)*222;if(Math.hypot(m.x-tx,m.y-ty)<70){M.held[sg]=true;m.gone=true;api.toast('Caught');break;}}}
      M.tnf=M.tnf.filter(m=>!m.gone);for(const m of M.tnf)G.tnf(x,m.x,m.y,1.15,m.rot);}
    igg(x,500,330,1.25,{hl:M.mode==='parts'?M.hl:null,lys:[true,true],tnf:M.mode==='tnf'?M.held:null,t:M.t});
    if(M.mode==='parts'){label(x,'TIPS',629,62,'center');label(x,'ARMS',345,228,'right');label(x,'HINGE',540,316);label(x,'STEM',570,400);label(x,'SUGARS',380,372,'right');label(x,'TAIL',560,520);}
    const q=s=>api.card.querySelector(s);if(M.mode==='tnf'&&q('#hm-n'))q('#hm-n').textContent=M.held.filter(Boolean).length+' of 2';
  }
  return {id:'molecule',label:'Molecule',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},get bar(){return M.mode==='compare'?{units:0,label:'schematic'}:{units:100,label:'5 nm'};},zoomFocus:{x:500,y:330},
    card(){return `<p class="k">Level 3 · the molecule</p><h2>One antibody</h2>
      <div class="dv-seg" role="radiogroup" aria-label="View"><button role="radio" data-mo="parts" aria-checked="${M.mode==='parts'}">Its parts</button><button role="radio" data-mo="compare" aria-checked="${M.mode==='compare'}">Hadlima and Humira</button><button role="radio" data-mo="tnf" aria-checked="${M.mode==='tnf'}">Catching TNF</button></div>
      <div id="hm-body"></div>`;},
    bind(card,api){const body=card.querySelector('#hm-body');
      const render=()=>{
        if(M.mode==='parts'){const P=M.hl&&PARTS[M.hl];body.innerHTML=`<p>Adalimumab is a fully human IgG1 antibody: four protein chains, two heavy and two light, 1,330 amino acids in all and about 148 kDa, made in hamster ovary cells (label). <b style="color:var(--bone)">Tap a part.</b></p>
          <div class="dv-seg" role="group" aria-label="Parts">${Object.entries(PARTS).map(([k,v])=>`<button type="button" data-pt="${k}" aria-checked="${M.hl===k}">${v[0].replace('The ','')}</button>`).join('')}</div>
          ${P?`<p class="sub">${P[0]}</p><p>${P[1]}</p>`:''}`;
          body.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{M.hl=b.dataset.pt;if(M.hl==='sugars')api.discover('hd_glycan',true);if(M.hl==='stem')api.discover('hd_fcrn',true);render();});}
        else if(M.mode==='compare')body.innerHTML=`<p>A biosimilar has to match its original's amino-acid sequence exactly. Biologics are made in living cells, so even batches of the original vary a little; the question is whether the copy stays inside that variation. Samsung Bioepis compared Hadlima with more than 100 lots of Humira on 55 tests (Lee 2019):</p>
          <div class="dv-meter"><span>Amino-acid sequence</span><b>identical</b></div>
          <div class="dv-meter"><span>Sugars that tune immune-cell binding</span><b>8.7–11.9%</b></div><p class="dv-fine" style="margin:-2px 0 6px">The range allowed from Humira's lots was 5.6–12.2%.</p>
          <div class="dv-meter"><span>Charge variants</span><b>a little different</b></div><p class="dv-fine" style="margin:-2px 0 6px">Fewer basic forms because more tail lysines were trimmed, and slightly more acidic forms, partly from extra sialic acid on the sugars. Not clinically meaningful.</p>
          <div class="dv-meter"><span>Catching TNF, FcRn and immune-cell tests</span><b>highly similar</b></div>
          <div class="dv-meter"><span>In people with RA on methotrexate, ACR20 at 24 weeks</span><b>72.4% vs 72.2%</b></div>
          <p class="dv-fine">Lab comparison: Lee 2019 (Samsung Bioepis, the maker). The trial: Weinblatt 2018. FDA approved Hadlima in 2019 (label) and has designated it interchangeable with Humira (Organon 2025). The tail lysines are drawn to show the direction, not the count.</p>`;
        else{body.innerHTML=`<p>TNF is a trimer, three identical units. Each arm can catch one. <b style="color:var(--bone)">Release some TNF</b> and watch the tips grab it.</p>
          <div class="dv-meter"><span>TNF held</span><b id="hm-n">0 of 2</b></div>
          <div class="dv-btns"><button class="dv-btn go" id="hm-t" type="button">Release TNF</button><button class="dv-btn" id="hm-r" type="button">Let go</button></div>
          <div class="dv-btns"><button class="dv-btn" id="hm-ra" type="button">Into the knuckle<small>the RA dive's molecules: Hadlima against TNF at the joint lining</small></button></div>
          <p class="dv-fine">To scale: a TNF trimer is about 5 nm across, an antibody about 10–15 nm. Label: it binds TNF and stops it reaching the p55 and p75 receptors.</p>`;
          body.querySelector('#hm-t').onclick=()=>{for(let i=0;i<3;i++)M.tnf.push({x:rand(80,920),y:Math.random()<.5?rand(-30,40):rand(620,700),vx:rand(-60,60),vy:rand(-50,50),rot:rand(0,6)});};
          body.querySelector('#hm-r').onclick=()=>{M.held=[false,false];};
          body.querySelector('#hm-ra').onclick=()=>jump('ra',{level:'molecule',opt:{mode:'tnf'}});}};
      card.querySelectorAll('[data-mo]').forEach(b=>b.onclick=()=>{M.mode=b.dataset.mo;card.querySelectorAll('[data-mo]').forEach(x=>x.setAttribute('aria-checked',x===b));render();});
      render();this._render=render;},
    tap(p,api){if(M.mode==='tnf'){for(const m of M.tnf)if(Math.hypot(m.x-p.x,m.y-p.y)<40)return api.discover('tnf');return api.discover('ada',true);}
      if(M.mode!=='parts'){const x0=p.x<500?300:700;if(Math.abs(p.x-x0)<160)api.discover('ada');return;}
      const w=where(p);if(!w)return;M.hl=w;if(w==='sugars')api.discover('hd_glycan');else if(w==='stem')api.discover('hd_fcrn');else api.discover('ada',true);this._render?.();},
    draw,
  };
}

export const DIVE={color:'#F29A55',top:{label:'Belly',size:'10 cm'},
  target:({V3})=>V3(.06,.95,.11),view:{dist:.22,azim:12,elev:2},
  text:'Follow one dose of the patient\'s Hadlima: from the injection under the skin, through the lymph into the blood, into the cell that keeps it there for two weeks, and down to the antibody itself, beside Humira.',
  steps:[['Under the skin, 5 mm.','Inject, then watch fourteen days: the dose seeps into the lymph and peaks in the blood after five and a half days.'],['One vessel cell, 20 µm.','The receptor that rescues it from being broken down, what antibodies to the drug do, and the same receptor carrying it across the placenta.'],['The molecule, 10 nm.','Its parts, Hadlima beside Humira, and catching TNF.']],
  also:[{dive:'ra',level:'molecule',opt:{mode:'tnf'},label:'RA dive · molecules',small:'Hadlima catching TNF at the joint lining'},{dive:'ra',level:'lining',label:'RA dive · the lining game',small:'protect the bone and cartilage for a year with the patient\'s medicines'}],
  refs:['lbl_hadlima','supersaxo1990','richter2012','roopenian2007','pyzik2019','julsgaard2016','bartelds2011','vschouwenburg2013','krieckaert2012','lee2019','weinblatt2018','organon2025','hong2014','breslin2018'],
  make:({jump})=>({levels:[skinLevel(),vesselLevel(),moleculeLevel(jump)],guide:GUIDE_H}),
};
