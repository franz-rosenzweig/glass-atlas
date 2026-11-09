// Hydroxychloroquine dive: slow to act and slow to leave (a year of daily tablets, on two half-lives) → the retina, where the eye scans look for damage.
// Retina: AAO 2016 and the label for screening, Melles 2014/2015/2023 for risk and pattern, Marmor & Hu 2014 for the stages.
import { TAU, clamp, lerp, rand } from './dive.js';
import { GUIDE, rgba, nucleus } from './dive-ra.js';
import { natural, raw, cc } from './theme.js';

const HC='#7CFFB2',LBL='rgba(236,230,218,.55)',FONT='11px "Martian Mono", monospace',RED='#F2705F',ORG='#F29A55';
const label=(x,t,px,py,al='left',col=LBL)=>{x.fillStyle=col;x.font=FONT;x.textAlign=al;x.fillText(t,px,py);};
const hash=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};

/* ---------------- shared drawing */
const LYS=[[-17,-6],[2,-14],[-6,12]];
function tissueCell(x,cx,cy,r,seed){x.beginPath();for(let i=0;i<=36;i++){const a=i/36*TAU,rr=r*(1+.07*Math.sin(a*3+seed)+.04*Math.sin(a*5+seed*2));const px=cx+Math.cos(a)*rr*1.15,py=cy+Math.sin(a)*rr*.85;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();
  x.fillStyle=rgba('#8FB3C9',.1);x.fill();x.strokeStyle=rgba('#8FB3C9',.5);x.lineWidth=1.4;x.stroke();
  nucleus(x,cx+r*.47,cy+r*.18,r*.26,r*.2,seed);
  x.strokeStyle=rgba('#C08CFF',.6);x.lineWidth=1.2;for(const [dx,dy] of LYS){x.beginPath();x.arc(cx+dx*r/34,cy+dy*r/34,8*r/34,0,TAU);x.stroke();}}
// how damaged the photoreceptors (or, with rpe, the pigment layer) are at a point xd,yd degrees from the fovea
function wAt(st,xd,yd,rpe){if(!st.stage||(rpe&&st.stage<3))return 0;const r=Math.hypot(xd,yd),th=Math.atan2(yd,xd);
  let g=st.pat==='para'?clamp((r-1.6)/.9,0,1)*clamp((6.6-r)/1.2,0,1):clamp((r-7.4)/1.2,0,1)*clamp((14.5-r)/2,0,1)*(.25+.75*Math.abs(Math.sin(th))**1.5);
  if(st.stage===1)g*=clamp(Math.sin(th*3+1.2)*1.6+Math.sin(th*7-.5)*.5-.5,0,1)*.8;   // patches
  else if(st.stage===2)g*=clamp(1.15+.5*Math.sin(th-2.6),0,1);                          // a 50–100% ring
  return rpe?g*.9:g;}
// the bull's-eye as a small bitmap, scaled up smooth (true colours, so drawn raw)
const FMAP={};
function dmgMap(st,deg){const k=st.stage+st.pat+deg;if(FMAP[k])return FMAP[k];const N=96,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');
  raw(()=>{for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=wAt(st,(i+.5-N/2)/(N/2)*deg,-(j+.5-N/2)/(N/2)*deg,true);if(a<.04)continue;const h=hash(i,j);
    g.fillStyle=h>.88?`rgba(106,36,22,${(.7*a).toFixed(2)})`:`rgba(226,166,116,${(a*(.45+.4*h)).toFixed(2)})`;g.fillRect(i,j,1,1);}});
  return FMAP[k]=c;}
// a fundus photo of the right eye (disc on the right), in true colours: call inside natural()
function fundus(x,cx,cy,R,pd,st){x.save();x.beginPath();x.arc(cx,cy,R,0,TAU);x.clip();
  const g=x.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,'#B84C2C');g.addColorStop(.75,'#A04628');g.addColorStop(1,'#7A2C1A');x.fillStyle=g;x.fillRect(cx-R,cy-R,2*R,2*R);
  const m=x.createRadialGradient(cx,cy,0,cx,cy,6*pd);m.addColorStop(0,'rgba(106,36,22,.9)');m.addColorStop(1,'rgba(106,36,22,0)');x.fillStyle=m;x.fillRect(cx-R,cy-R,2*R,2*R);
  if(st.stage===3){x.imageSmoothingEnabled=true;x.drawImage(dmgMap(st,R/pd),cx-R,cy-R,2*R,2*R);}
  const dx=cx+15*pd;x.lineCap='round';
  const ves=(col,w,pts)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(dx,cy);x.bezierCurveTo(...pts.map((v,i)=>i%2?cy+v*pd:cx+v*pd));x.stroke();};
  for(const s of [-1,1]){ves('#6A2416',2.6*pd/7,[8,s*12,-6,s*11,-19,s*5]);ves('#A8381F',1.8*pd/7,[9,s*9.5,-4,s*9.5,-19,s*3]);ves('#6A2416',1.6*pd/7,[18,s*8,22,s*14,26,s*16]);
    ves('#A8381F',1.2*pd/7,[10,s*4,6,s*3.2,3,s*2.4]);}
  x.fillStyle='#E8C49A';x.beginPath();x.ellipse(dx,cy,2.6*pd,3*pd,0,0,TAU);x.fill();x.fillStyle='#F3E3C4';x.beginPath();x.arc(dx+.3*pd,cy,1.2*pd,0,TAU);x.fill();
  x.fillStyle='rgba(243,227,196,.7)';x.beginPath();x.arc(cx,cy,Math.max(1.2,pd*.25),0,TAU);x.fill();x.restore();}

/* ---------------- field guide (the RA dive's molecule entry is shared) */
const GUIDE_Q={
  hcq:GUIDE.hcq,
  hcq_store:{name:'The tissue store',kind:'Where the drug sits',size:'the whole body',draw:(x,cx,cy,s)=>{[[-72,-8],[0,10],[72,-6]].forEach(([dx,dy],i)=>{tissueCell(x,cx+dx*s,cy+dy*s,32*s,i*2);x.fillStyle=HC;for(const [lx,ly] of LYS)for(let k=0;k<4;k++){x.beginPath();x.arc(cx+(dx+lx*32/34+Math.cos(k*2.4)*3.6*(k?1:0))*s,cy+(dy+ly*32/34+Math.sin(k*2.4)*3.4*(k?1:0))*s,2.1*s,0,TAU);x.fill();}});},
    text:['Hydroxychloroquine is a weak base with what pharmacologists call a "deep" volume of distribution (Schrezenmeier 2020). Measured from blood it comes to about 5,500 litres (Tett 1988), far more than any body holds: it means almost all of the drug sits in the tissues and very little in the blood.','That store is why it lingers. Its persistence comes mainly from this tissue binding rather than from slow clearance (Tett 1988), and its terminal half-life in whole blood is 40 to 50 days (label), though in RA the blood level settles within about six weeks (label; Munster 2002).']},
  hcq_kidney:{name:'The kidneys',kind:'One way out',size:'about 11 cm each',draw:(x,cx,cy,s)=>{x.save();x.translate(cx-8*s,cy);x.scale(1.4*s,1.4*s);x.beginPath();x.ellipse(0,0,24,34,0,0,TAU);x.fillStyle=rgba('#C97B5A',.35);x.fill();x.strokeStyle='#C97B5A';x.lineWidth=2.5;x.stroke();
      x.fillStyle='#04070B';x.beginPath();x.ellipse(20,0,9,11,0,0,TAU);x.fill();x.fillStyle=HC;for(let k=0;k<5;k++){x.beginPath();x.arc(26+k*7,6+k*7,2.6,0,TAU);x.fill();}x.restore();},
    text:['About 16–30% of a dose leaves through the kidneys unchanged. Much of the rest is broken down first; lab studies point to the enzymes CYP2C8, CYP3A4 and CYP2D6 (label), and the kidneys clear those breakdown products too (Jorge 2024).','Kidney disease is one of the major risk factors for eye damage. It about doubled the odds in a study of 2,361 long-term users (Melles 2014), and chronic kidney disease stage 3 or worse did the same in a 2024 cohort, likely because weaker clearance means a higher effective dose (Jorge 2024).']},
  hcq_pr:{name:'Photoreceptors',kind:'Light-sensing cells',size:'the outer retina',draw:(x,cx,cy,s)=>{x.save();x.translate(cx,cy);x.scale(s,s);
      for(let i=0;i<7;i++){const px=-48+i*16,cone=i%3===1;x.fillStyle='#5B86FF';x.beginPath();x.arc(px,-30,4.2,0,TAU);x.fill();x.strokeStyle=rgba('#BFE6E1',.6);x.lineWidth=2.4;x.beginPath();x.moveTo(px,-26);x.lineTo(px,-3);x.stroke();
        x.fillStyle=cone?'#FFD27A':'#C08CFF';x.beginPath();if(cone){x.moveTo(px-4.5,0);x.lineTo(px+4.5,0);x.lineTo(px,20);}else x.roundRect(px-2.5,0,5,28,2);x.fill();}
      x.strokeStyle='#ECE6DA';x.lineWidth=2;x.beginPath();x.moveTo(-60,-2);x.lineTo(60,-2);x.stroke();x.restore();},
    text:['The rods and cones turn light into nerve signals. On an OCT scan their nuclei make a dark band, and their inner and outer segments make bright lines beneath it; the clearest is the ellipsoid zone, once called the IS/OS junction (Staurenghi 2014; Chen 2010).','This is where hydroxychloroquine damage shows first: thinning or loss of the photoreceptor layers and the ellipsoid zone in a ring around the fovea, before the pigment layer behind them is harmed (Yusuf 2017).']},
  hcq_rpe:{name:'Retinal pigment epithelium',kind:'Pigmented cell layer',size:'one cell thick',draw:(x,cx,cy,s)=>{for(let i=-3;i<=3;i++){x.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;x.lineTo(cx+(i*31+Math.cos(a)*18)*s,cy+Math.sin(a)*18*s);}x.closePath();
      x.fillStyle=rgba('#B07A4A',.45);x.fill();x.strokeStyle='#D9A441';x.lineWidth=1.5*s;x.stroke();x.fillStyle='#3A2414';for(let d=0;d<5;d++){x.beginPath();x.arc(cx+(i*31+Math.cos(d*1.9+i)*8)*s,cy+Math.sin(d*1.9+i)*8*s,2.2*s,0,TAU);x.fill();}}},
    text:['A single layer of pigmented cells behind the photoreceptors that tends them, digesting the worn tips of their outer segments. In monkeys given chloroquine for a long time, the drug bound widely to the eye\'s pigmented tissues, this layer included (Yusuf 2017).','When this layer is damaged too, the ring shows in the back of the eye as a bull\'s-eye. That is the severe stage: in 11 patients followed for up to about three years after stopping, damage at this stage kept worsening, while eyes caught before it largely kept their central structure (Marmor & Hu 2014).']},
  hcq_ring:{name:'The ring around the fovea',kind:'Where damage starts',size:'2–6° from the centre',natural:true,draw:(x,cx,cy,s)=>fundus(x,cx,cy,58*s,58*s/9,{stage:3,pat:'para'}),
    text:['The fovea is the small pit at the centre of the retina that gives sharp central vision. Hydroxychloroquine damage usually starts in a ring 2–6° from it and spares the centre at first; on the scan the intact middle between damaged sides looks like a "flying saucer" (Melles 2015; Chen 2010).','In Asian patients it is often further out, 8° or more from the centre near the big vessels: that pattern alone was found in half of Asian patients with toxicity and in 2% of white patients (Melles 2015). Why these zones are the vulnerable ones is still unclear (Yusuf 2017).']},
};

/* ---------------- level 1: a year of daily tablets, on two half-lives */
// Both curves are one compartment and illustrative: about 5 days, the mean measured in RA (123 h, Munster 2002), steady within
// six weeks as the label reports for RA; and 40 days, the terminal half-life from single doses in healthy volunteers (Tett 1988/1989).
function buildLevel(jump){
  const KA=Math.LN2/(123/24),KB=Math.LN2/40,SPD=12,END=365,CH={x0:200,x1:840,y0:440,y1:620},TC='#C08CFF';
  const cx=d=>CH.x0+d/END*(CH.x1-CH.x0),cy=v=>CH.y1-v*(CH.y1-CH.y0),pc=v=>Math.round(v*100);
  const cells=[];for(let r=0;r<2;r++)for(let i=0;i<7;i++)cells.push({x:200+i*96+(r?48:0),y:100+r*76,seed:i*1.7+r*3.1});
  // drug slots in each cell's lysosomes, filled in a shuffled order as the level rises
  const slots=[];cells.forEach((c,ci)=>LYS.forEach(([lx,ly],l)=>{for(let k=0;k<5;k++)slots.push({x:c.x+lx+Math.cos(k*2.4+l)*4.2*(k?1:0),y:c.y+ly+Math.sin(k*2.4+l)*3.8*(k?1:0),o:hash(ci*3+l,k)});}));slots.sort((a,b)=>a.o-b.o);
  let S,P=[],caps=[];
  // A, B: the RA and 40-day curves; RA, RB: the same without the missed tablets, to show what the misses cost
  function reset(){S={day:0,A:0,B:0,RA:0,RB:0,playing:false,done:false,stopped:false,stopDay:0,stopA:0,stopB:0,miss:new Set(),missN:0,hist:[[0,0,0]],lastH:0,acO:0};P=[];caps=[];}
  reset();
  function step(dt,api){if(!S.playing)return;let rem=dt*SPD;
    while(rem>0&&S.day<END){const h=Math.min(rem,.25),di=Math.floor(S.day),on=!S.stopped&&!S.miss.has(di)?1:0,ref=S.stopped?0:1,ea=Math.exp(-KA*h),eb=Math.exp(-KB*h);
      S.A=on+(S.A-on)*ea;S.B=on+(S.B-on)*eb;S.RA=ref+(S.RA-ref)*ea;S.RB=ref+(S.RB-ref)*eb;S.day+=h;rem-=h;
      if(Math.floor(S.day)!==di&&!S.stopped&&!S.miss.has(Math.floor(S.day)))caps.push({y:350});
      if(S.day-S.lastH>=.5){S.hist.push([S.day,S.A,S.B]);S.lastH=S.day;}}
    if(S.day>=END){S.day=END;S.playing=false;S.done=true;api.toast('A year of tablets');}}
  const drop=(k,n)=>pc(1-Math.exp(-k*n));
  function miss(n,api){if(S.stopped||S.done)return;const d0=Math.floor(S.day)+1;for(let i=0;i<n;i++)if(!S.miss.has(d0+i)){S.miss.add(d0+i);S.missN++;}if(!S.day)S.playing=true;
    note(api,(n===1?`In these models one missed tablet lowers the level by about ${drop(KA,1)}% on the RA curve and ${drop(KB,1)}% on the 40-day curve, and the gap closes over the following days or weeks.`
      :`A missed week, in these models: about ${drop(KA,7)}% lower on the RA curve and ${drop(KB,7)}% on the 40-day curve.`)+' These are model outputs, not measurements: real levels already swing about 40% between peak and trough within each day (Miller 1991). What to do after a missed tablet is a question for her pharmacist.');}
  const note=(api,t)=>{const n=api.card.querySelector('#bk-n');if(n){n.hidden=!t;n.textContent=t;}};
  function draw(x,dt,t,api){step(dt,api);
    x.fillStyle='#0A1014';x.fillRect(-400,-300,1800,1300);
    for(const c of cells)tissueCell(x,c.x,c.y,34,c.seed);
    // the tissue picture takes the RA curve on the way up and the 40-day curve for the tail after stopping
    const n=Math.round(Math.max(S.A,S.B)*slots.length);x.fillStyle=HC;for(let i=0;i<n;i++){x.beginPath();x.arc(slots[i].x,slots[i].y,2.2,0,TAU);x.fill();}
    // the blood: a few red cells and, at most, a couple of drug molecules
    x.fillStyle='#2A0C12';x.fillRect(-400,232,1800,56);x.strokeStyle='rgba(224,82,95,.45)';x.lineWidth=2;x.beginPath();x.moveTo(-400,232);x.lineTo(1400,232);x.moveTo(-400,288);x.lineTo(1400,288);x.stroke();
    x.fillStyle='rgba(224,82,95,.55)';for(let i=0;i<16;i++){x.beginPath();x.ellipse(((i*71+t*50)%1100)-50,246+(i*37)%30,9,5.5,0,0,TAU);x.fill();}
    x.fillStyle=HC;for(let k=0;k<Math.round(S.A*3);k++){x.beginPath();x.arc(((k*331+t*80)%1100)-50,250+k*9,2.4,0,TAU);x.fill();}
    // tablets arrive from the gut; molecules move into the tissues, and back out to the kidneys and liver
    for(const c of caps){c.y-=300*dt;if(c.y<272){c.gone=true;if(Math.random()<.3){const z=cells[Math.floor(Math.random()*cells.length)];P.push({x:172,y:262,tx:z.x+rand(-14,14),ty:z.y+rand(-8,8),k:'in'});}}}
    caps=caps.filter(c=>!c.gone);x.fillStyle='#F2D7B8';for(const c of caps){x.beginPath();x.roundRect(166,c.y-3,12,6,3);x.fill();}
    if(S.playing){S.acO+=dt*SPD*.3*S.A;while(S.acO>=1){S.acO--;const z=cells[Math.floor(Math.random()*cells.length)];P.push({x:z.x,y:z.y,tx:z.x+rand(-20,20),ty:rand(250,272),k:'out'});}}
    for(const p of P){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),v=110*dt;
      if(d<=v){if(p.k==='out'){p.k='exit';p.tx=836;p.ty=rand(250,272);}else if(p.k==='exit'){p.k='down';p.ty=350;}else p.gone=true;}else{p.x+=dx/d*v;p.y+=dy/d*v;}}
    P=P.filter(p=>!p.gone);for(const p of P){x.fillStyle=p.k==='down'?rgba(HC,clamp((350-p.y)/60,0,1)):HC;x.beginPath();x.arc(p.x,p.y,2.4,0,TAU);x.fill();}
    label(x,'TISSUES',150,52);label(x,'BLOOD',860,226,'right');label(x,'FROM THE GUT',190,322);label(x,'OUT: KIDNEYS, LIVER',860,322,'right');
    // the chart
    x.strokeStyle='rgba(236,230,218,.25)';x.lineWidth=1;x.beginPath();x.moveTo(CH.x0,CH.y0-14);x.lineTo(CH.x0,CH.y1);x.lineTo(CH.x1,CH.y1);x.moveTo(CH.x0-4,cy(.5));x.lineTo(CH.x0,cy(.5));x.stroke();
    x.fillStyle=rgba(ORG,.1);x.fillRect(cx(61),CH.y0-14,cx(91)-cx(61),CH.y1-CH.y0+14);
    x.strokeStyle=rgba(ORG,.55);x.setLineDash([4,4]);x.beginPath();x.moveTo(cx(182),CH.y0-14);x.lineTo(cx(182),CH.y1);x.stroke();
    x.strokeStyle='rgba(236,230,218,.35)';x.beginPath();x.moveTo(CH.x0,cy(1));x.lineTo(CH.x1,cy(1));x.stroke();
    for(const [k,col] of [[KA,HC],[KB,TC]]){x.strokeStyle=rgba(col,.28);x.beginPath();for(let d=0;d<=END;d+=1){const v=1-Math.exp(-k*d);d?x.lineTo(cx(d),cy(v)):x.moveTo(cx(d),cy(v));}x.stroke();}x.setLineDash([]);
    for(const [i,col,w] of [[2,TC,2],[1,HC,2.5]]){x.strokeStyle=col;x.lineWidth=w;x.beginPath();S.hist.forEach((h,j)=>j?x.lineTo(cx(h[0]),cy(h[i])):x.moveTo(cx(h[0]),cy(h[i])));x.lineTo(cx(S.day),cy(i===1?S.A:S.B));x.stroke();}
    x.strokeStyle=RED;x.lineWidth=2;x.beginPath();for(const d of S.miss){if(d>END)continue;x.moveTo(cx(d),CH.y1);x.lineTo(cx(d),CH.y1-8);}x.stroke();
    if(S.stopped){x.setLineDash([3,4]);x.beginPath();x.moveTo(cx(S.stopDay),CH.y0-14);x.lineTo(cx(S.stopDay),CH.y1);x.stroke();x.setLineDash([]);label(x,'STOPPED',cx(S.stopDay)+5,CH.y0+2,'left',rgba(RED,.85));}
    // the two values: low ones lift clear of the effect labels, and the pair never overlaps
    const V=[[S.B,TC,16,-32],[S.A,HC,-8,-32]].map(([v,col,dy,lo])=>({v,col,y:cy(v)+(v<.2?lo:dy)})).sort((a,b)=>a.y-b.y);if(V[1].y-V[0].y<14)V[0].y=V[1].y-14;
    for(const L of V){x.fillStyle=L.col;x.beginPath();x.arc(cx(S.day),cy(L.v),4.5,0,TAU);x.fill();if(S.day>0)label(x,pc(L.v)+'%',cx(S.day)+8,L.y,'left',L.col);}
    label(x,'BLOOD LEVEL · SHARE OF ITS STEADY LEVEL',CH.x0,CH.y0-26);label(x,'STEADY LEVEL',CH.x1,cy(1)-6,'right');
    [[HC,'IN RA · ~5-DAY HALF-LIFE',392],[TC,'VOLUNTEERS · 40-DAY',408]].forEach(([col,s,y])=>{x.strokeStyle=col;x.lineWidth=2.5;x.beginPath();x.moveTo(590,y-4);x.lineTo(606,y-4);x.stroke();label(x,s,612,y);});
    label(x,'100%',CH.x0-8,cy(1)+4,'right');label(x,'50%',CH.x0-8,cy(.5)+4,'right');label(x,'0',CH.x0-8,CH.y1+4,'right');
    for(const m of [0,3,6,9,12])label(x,String(m),cx(m*END/12),CH.y1+18,'center');label(x,'MONTHS',CH.x0-14,CH.y1+18,'right');
    label(x,'STARTS TO HELP',cx(61)+5,CH.y1-24);label(x,'USUALLY 2–3 MO',cx(61)+5,CH.y1-10);label(x,'FULL EFFECT',cx(182)+5,CH.y1-24);label(x,'UP TO 6 MO',cx(182)+5,CH.y1-10);
    const q=s=>api.card.querySelector(s);if(q('#bk-l')){const set=(s,v)=>{const e=q(s);if(e.textContent!==v)e.textContent=v;};
      set('#bk-day',String(Math.floor(S.day)));set('#bk-l',pc(S.A)+'%');q('#bk-lB').style.width=S.A*100+'%';set('#bk-l2',pc(S.B)+'%');q('#bk-l2B').style.width=S.B*100+'%';set('#bk-m',String(S.missN));
      const ca=(S.RA-S.A)*100,cb=(S.RB-S.B)*100;set('#bk-c',ca<.05&&cb<.05?'none':`${ca.toFixed(1)} / ${cb.toFixed(1)} points`);
      if(S.stopped){q('#bk-sw').hidden=false;set('#bk-s',`${Math.floor(S.day-S.stopDay)} days · ${S.stopA>0?pc(S.A/S.stopA):0}% / ${S.stopB>0?pc(S.B/S.stopB):0}% left`);}
      set('#bk-go',S.done?'A year done':S.playing?'Pause':S.day>0?'Play':'Start daily tablets');q('#bk-go').disabled=S.done;q('#bk-x').disabled=S.stopped||S.done;}
  }
  return {id:'build',label:'Build-up',size:'1 year',fit:'cover',bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:500,y:140},
    card(){return `<p class="k">Level 1 · the tissues · day <span id="bk-day">0</span></p><h2>Slow to act, slow to leave</h2>
      <p>Most of each tablet is absorbed, but hydroxychloroquine doesn't stay in the blood. It sinks so deeply into the tissues that, measured from blood, its volume of distribution is about 5,500 litres: almost all of it ends up in the tissues. In people with RA the blood level settles within about six weeks, yet the drug is slow to leave: its terminal half-life in whole blood is 40 to 50 days. The benefit builds more slowly still, over weeks to months.</p>
      <p><b style="color:var(--bone)">Start the daily tablets and watch a year go by.</b> Then miss a dose, miss a week, or stop.</p>
      <div class="dv-btns"><button class="dv-btn go" id="bk-go" type="button">Start daily tablets</button><button class="dv-btn" id="bk-1" type="button">Miss a dose</button><button class="dv-btn" id="bk-7" type="button">Miss a week</button><button class="dv-btn" id="bk-x" type="button">Stop it</button><button class="dv-btn" id="bk-re" type="button">Start over</button></div>
      <div class="dv-meter"><span>Blood level in RA, share of its steady level</span><b id="bk-l">0%</b><i><u id="bk-lB"></u></i></div>
      <div class="dv-meter"><span>On the 40-day curve</span><b id="bk-l2">0%</b><i><u id="bk-l2B" style="background:${cc(TC)}"></u></i></div>
      <div class="dv-meter"><span>Missed tablets</span><b id="bk-m">0</b></div><div class="dv-meter"><span>What the misses cost now, RA / 40-day</span><b id="bk-c">none</b></div>
      <div class="dv-meter" id="bk-sw" hidden><span>Since stopping, RA / 40-day</span><b id="bk-s"></b></div>
      <p class="dv-fine" id="bk-n" hidden></p>
      <div class="dv-btns"><button class="dv-btn" id="bk-eye" type="button">Zoom into the eye<small>why she has eye scans</small></button><button class="dv-btn" id="bk-lys" type="button">Where it acts<small>RA dive · inside the lysosome</small></button></div>
      <p class="dv-fine">Two simple one-compartment curves, both illustrative. Green uses a half-life of about 5 days, the mean measured in 123 people with RA (Munster 2002); like the label's data from RA patients on 400 mg a day, it is steady within about six weeks. Purple uses the 40-day half-life from healthy volunteers given single doses (Tett 1988, 1989): on it the level takes six months to reach 96%, and Tett suggests this is part of why the drug is slow to act. The 40-day figure describes the long tail after stopping better than the climb at the start, so the tissue picture follows green on the way up and purple on the way down. Real levels also swing about 40% between peak and trough within each day (Miller 1991) and vary widely between people. The effect bands are from the app's medicine page, which follows rheumatology guidance; the label says weeks to months. What to do after a missed tablet is a question for her pharmacist. Tap the tissues, the blood and the way out. Munster 2002; Tett 1988, 1989; Miller 1991; Plaquenil label; Schrezenmeier 2020.</p>`;},
    bind(card,api){card.querySelector('#bk-go').onclick=()=>{if(!S.done)S.playing=!S.playing;};
      card.querySelector('#bk-1').onclick=()=>miss(1,api);card.querySelector('#bk-7').onclick=()=>miss(7,api);
      card.querySelector('#bk-x').onclick=()=>{if(S.stopped||S.done)return;S.stopped=true;S.stopDay=S.day;S.stopA=S.A;S.stopB=S.B;if(S.day)S.playing=true;
        note(api,'Stopped. On the RA curve the level drops quickly at first; the label\'s terminal half-life of 40 to 50 days describes the long tail that lingers after that, which the 40-day curve follows better. The label notes that because of the long half-life, side effects such as mood changes can take several weeks off the drug to ease.');};
      card.querySelector('#bk-re').onclick=()=>{reset();note(api,'');card.querySelector('#bk-sw').hidden=true;};
      card.querySelector('#bk-eye').onclick=()=>api.go('retina',{from:{x:500,y:140}});
      card.querySelector('#bk-lys').onclick=()=>jump('ra',{level:'molecule',opt:{mode:'hcq'}});},
    tap(p,api){if(p.y<215)return api.discover('hcq_store');if(p.y>=228&&p.y<=292)return api.discover(p.x>760?'hcq_kidney':'hcq');if(p.y>292&&p.y<350&&p.x>700)return api.discover('hcq_kidney');},
    draw,
  };
}

/* ---------------- level 2: the retina, on the OCT */
function retinaLevel(){
  const BS={x0:150,x1:700,y0:56,y1:330,cx:425},PXD=(BS.x1-BS.x0)/30,UM=.36,FU={x:265,y:510,r:112},FPD=112/18,TL={x0:440,x1:820,max:25};
  const DOSE=[{l:'Up to 5',p:2.7,s:1.1},{l:'5 to 6',p:11.4,s:2.4},{l:'Over 6',p:21.6,s:5.9}];  // retinopathy by 15 years, Melles 2023
  const S={stage:0,pat:'para',dy:0,yr:0,dose:0,rf:false,drag:false};
  const GR={};const gray=v=>{v=clamp(Math.round(v/6)*6,0,252);return GR[v]||(GR[v]=`rgb(${v},${Math.min(255,v+4)},${Math.min(255,v+2)})`);};
  const SP=[0,1].map(k=>Array.from({length:1100},(_,i)=>({c:Math.floor(hash(i,k+7)*275),dx:hash(i,k+9)*2,u:hash(i,k+11),w:1+hash(i,k+13)*2.5})));
  const CV=Array.from({length:30},(_,i)=>({x:BS.x0+hash(i,1)*(BS.x1-BS.x0),d:.25+.6*hash(i,2),rx:6+10*hash(i,3),ry:3+4*hash(i,4)}));
  // the bands at one column, Bruch's membrane upward: [name, µm, brightness, top y]
  function col(xd,yd){const r=Math.hypot(xd,yd),pit=1-Math.exp(-((r/2.2)**2)),w=wAt(S,xd,yd),wr=wAt(S,xd,yd,true),yB=246+.04*xd*xd;
    const onl=(52+48*Math.exp(-((r/2.6)**2)))*(1-.55*w)*(S.stage===3?1-.22*Math.exp(-((r/1.6)**2)):1),inner=205*pit*(1-.018*Math.max(0,r-4)),rnfl=pit*(6+1.6*r+Math.max(0,xd)*2.2);
    const B=[['rpe',22*(1-.3*wr),lerp(240,150,wr)],['iz',28*(1-.85*w),lerp(120,40,w)],['ez',10*(1-.8*w),30+202*(1-w)**1.5],['myo',16*(1-.4*w),70],['elm',3,lerp(170,70,w)],['onl',onl,38],
      ['opl',inner*.16,165],['inl',inner*.26,62],['ipl',inner*.26,150],['gcl',inner*.32,95],['rnfl',rnfl,215]];
    let y=yB;for(const b of B){y-=b[1]*UM;b[3]=y;}return {yB,B,w,wr};}
  const exams=()=>{const t=[.5];for(let y=S.rf||S.dose?1.5:5;y<=TL.max;y++)t.push(y);return t;};
  const setDy=p=>{S.dy=clamp(Math.round((FU.y-p.y)/FPD*2)/2,-12,12);};
  const STX={0:{para:'A healthy scan: every band in place, the fovea a smooth dip in the middle.'},
    1:{para:'Early: patches of the photoreceptor band (the ellipsoid zone) break up in the ring 2–6° from the centre. Nothing shows in the photo yet; the scan sees it first.',peri:'Early: patches of the photoreceptor band break up 8° or more from the centre, near the big vessels. The middle of the scan looks normal, which is why screening has to look wider.'},
    2:{para:'Moderate: a 50–100% ring of thinning. On a scan through the centre, the intact middle between damaged sides looks like a "flying saucer". The pigment layer is still whole, and eyes caught by now largely kept their central structure after stopping.',peri:'Moderate: a broad band of photoreceptor loss out near the big vessels, with the pigment layer still whole.'},
    3:{para:'Severe: the pigment layer is damaged too, and the ring shows in the photo as a bull\'s-eye. In 11 patients followed for up to about three years after stopping, damage at this stage kept progressing (Marmor & Hu 2014).',peri:'Severe: the pigment layer is damaged too, and the damage starts to show in the photo. The pericentral pattern tended to be found at a more severe stage (Melles 2015).'}};
  function upd(card){const q=s=>card.querySelector(s);if(!q('#rt-st'))return;
    q('#rt-st').textContent=(STX[S.stage][S.pat]||STX[S.stage].para)+(S.pat==='peri'?' This pattern alone was found in half of Asian patients with toxicity and in 2% of white patients (Melles 2015), so the label advises a wider, 24° field test for patients of Asian descent.':'');
    q('#rt-y').textContent=S.yr+(S.yr===1?' year':' years');const n=exams().filter(t=>t<=S.yr).length;q('#rt-ex').textContent=n?`baseline + ${n-1} yearly`:'baseline due this year';
    q('#rt-r').textContent=S.yr<=5?'under 1%':S.yr<=10?'under 2%':S.yr<20?'rising':'almost 20%';const D=DOSE[S.dose];q('#rt-15').textContent=D.p+'%';q('#rt-15B').style.width=D.p+'%';q('#rt-15s').textContent=D.s+'%';}
  function draw(x,dt,t){
    x.fillStyle='#0A1014';x.fillRect(-400,-300,1800,1300);
    // the B-scan
    x.save();x.beginPath();x.rect(BS.x0,BS.y0,BS.x1-BS.x0,BS.y1-BS.y0);x.clip();x.fillStyle='#030506';x.fillRect(BS.x0,BS.y0,BS.x1-BS.x0,BS.y1-BS.y0);
    const cols=[];for(let px=BS.x0;px<BS.x1;px+=2){const xd=(px+1-BS.cx)/PXD,C=col(xd,S.dy);cols.push(C);
      x.fillStyle=gray(80+90*C.wr);x.fillRect(px,C.yB,2.6,72);
      C.B.forEach((b,i)=>{let v=b[2];if(i===0&&C.wr>.05)v*=.55+.9*hash(px>>2,99);x.fillStyle=gray(v);x.fillRect(px,b[3],2.6,b[1]*UM+.6);});}
    x.fillStyle=gray(24);for(const v of CV){const xd=(v.x-BS.cx)/PXD;x.beginPath();x.ellipse(v.x,246+.04*xd*xd+12+v.d*52,v.rx,v.ry,0,0,TAU);x.fill();}
    // speckle, as on any OCT
    for(const k of [0,1]){x.fillStyle=k?'rgba(255,255,255,.16)':'rgba(0,0,0,.4)';for(const s of SP[k]){const C=cols[s.c];x.fillRect(BS.x0+s.c*2+s.dx,lerp(C.B[10][3],C.yB+72,s.u),s.w,1.4);}}
    x.fillStyle='rgba(127,211,163,.10)';x.fillRect(BS.x0+((t*90)%(BS.x1-BS.x0)),BS.y0,3,BS.y1-BS.y0);x.restore();
    if(S.stage){let first=-1;x.fillStyle=RED;cols.forEach((C,i)=>{if(C.w>.35){x.fillRect(BS.x0+i*2,BS.y1+3,2.6,3);if(first<0)first=i;}});
      if(first>=0)label(x,'DAMAGE',BS.x0+first*2,BS.y1-6,'left',rgba(RED,.9));}
    x.strokeStyle='rgba(236,230,218,.18)';x.lineWidth=1;x.strokeRect(BS.x0,BS.y0,BS.x1-BS.x0,BS.y1-BS.y0);
    label(x,`OCT · RIGHT EYE · ${S.dy?Math.abs(S.dy)+'° '+(S.dy>0?'ABOVE':'BELOW')+' THE FOVEA':'THROUGH THE FOVEA'}`,BS.x0,BS.y0-12);
    for(let d=-15;d<=15;d+=5){const px=BS.cx+d*PXD;x.strokeStyle='rgba(236,230,218,.3)';x.beginPath();x.moveTo(px,BS.y1);x.lineTo(px,BS.y1+5);x.stroke();label(x,d?Math.abs(d)+'°':(Math.abs(S.dy)<2?'FOVEA':'0°'),px,BS.y1+17,'center');}
    label(x,'TEMPORAL',BS.x0,BS.y1+32);label(x,'NASAL',BS.x1,BS.y1+32,'right');
    // band names down the right edge, with leaders to where each band is
    const E=col(14.6,S.dy),at=i=>E.B[i][3]+E.B[i][1]*UM/2,want=[['NERVE FIBRES',at(10)],['PHOTORECEPTOR NUCLEI',at(5)],['ELLIPSOID ZONE',at(2)],['PIGMENT LAYER (RPE)',at(0)],['CHOROID',E.yB+36]];
    let ly=0;want.forEach(([s,y])=>{ly=Math.max(y,ly+16);x.strokeStyle='rgba(236,230,218,.3)';x.beginPath();x.moveTo(BS.x1,y);x.lineTo(BS.x1+8,y);x.lineTo(BS.x1+14,ly-4);x.stroke();label(x,s,BS.x1+18,ly);});
    // the photo of the back of the eye, with the scan line
    natural(()=>fundus(x,FU.x,FU.y,FU.r,FPD,S));
    x.strokeStyle='rgba(236,230,218,.25)';x.lineWidth=1;x.beginPath();x.arc(FU.x,FU.y,FU.r,0,TAU);x.stroke();
    x.save();x.beginPath();x.arc(FU.x,FU.y,FU.r,0,TAU);x.clip();const sy=FU.y-S.dy*FPD;x.strokeStyle='#7FD3A3';x.lineWidth=S.drag?3:2;x.beginPath();x.moveTo(FU.x-15*FPD,sy);x.lineTo(FU.x+15*FPD,sy);x.stroke();
    x.fillStyle='#7FD3A3';x.beginPath();x.moveTo(FU.x+15*FPD+2,sy);x.lineTo(FU.x+15*FPD-7,sy-5);x.lineTo(FU.x+15*FPD-7,sy+5);x.fill();x.restore();
    label(x,'PHOTO OF THE BACK OF THE EYE',FU.x-FU.r,FU.y-FU.r-12);
    // the exam timeline
    const tx=y=>TL.x0+y/TL.max*(TL.x1-TL.x0),E2=exams();
    label(x,`EYE EXAMS · YEAR ${S.yr} ON HYDROXYCHLOROQUINE`,TL.x0,400);
    x.strokeStyle='rgba(236,230,218,.35)';x.lineWidth=1;x.beginPath();x.moveTo(TL.x0,520);x.lineTo(TL.x1,520);for(let y=0;y<=TL.max;y+=5){x.moveTo(tx(y),520);x.lineTo(tx(y),526);}x.stroke();
    for(let y=0;y<=TL.max;y+=5)label(x,String(y),tx(y),540,'center');label(x,'YEARS',TL.x1,556,'right');
    for(const e of E2){x.beginPath();x.arc(tx(e),470,4,0,TAU);if(e<=S.yr){x.fillStyle='#ECE6DA';x.fill();}else{x.strokeStyle='rgba(236,230,218,.45)';x.stroke();}}
    label(x,S.rf||S.dose?'BASELINE, THEN YEARLY FROM THE START':'BASELINE, THEN YEARLY FROM YEAR 5',tx(.5)-4,446);
    x.strokeStyle=ORG;x.lineWidth=2;x.beginPath();x.moveTo(tx(S.yr),462);x.lineTo(tx(S.yr),528);x.stroke();x.fillStyle=ORG;x.beginPath();x.moveTo(tx(S.yr)-5,456);x.lineTo(tx(S.yr)+5,456);x.lineTo(tx(S.yr),463);x.fill();
    const br=(a,b,s)=>{x.strokeStyle='rgba(236,230,218,.3)';x.beginPath();x.moveTo(tx(a)+2,566);x.lineTo(tx(a)+2,572);x.lineTo(tx(b)-2,572);x.lineTo(tx(b)-2,566);x.stroke();label(x,s,(tx(a)+tx(b))/2,588,'center');};
    br(0,5,'UNDER 1%');br(5,10,'UNDER 2%');br(10,25,'RISES WITH THE YEARS');label(x,'RISK AT UP TO 5 MG/KG A DAY · AAO 2016',TL.x0,608);
    label(x,`${DOSE[S.dose].l.toUpperCase()} MG/KG: ${DOSE[S.dose].p}% BY YEAR 15 · MELLES 2023`,TL.x0,628,'left','rgba(236,230,218,.75)');
  }
  return {id:'retina',label:'Retina',size:'30° scan',fit:'cover',bar:{units:5*PXD,label:'5° on the scan'},zoomFocus:{x:265,y:510},
    card(){const seg=(k,list,cur,lab)=>`<div class="dv-seg" role="radiogroup" aria-label="${lab}">${list.map(([v,l])=>`<button type="button" role="radio" data-${k}="${v}" aria-checked="${String(v)===String(cur)}">${l}</button>`).join('')}</div>`;
      return `<p class="k">Level 2 · the retina</p><h2>Why she has eye scans</h2>
      <p>After years of use, hydroxychloroquine can damage the retina's light-sensing cells, and the damage doesn't heal. Screening aims to find it on the scan before it shows in the back of the eye. Here are an OCT, a cross-section of the retina made with light, and a photo of the back of the right eye with the scan line in green.</p>
      <p><b style="color:var(--bone)">Drag the green line to move the scan, and step through what toxicity looks like if it develops.</b></p>
      ${seg('st',[[0,'None'],[1,'Early'],[2,'Moderate'],[3,'Severe']],S.stage,'Stage')}${seg('pt',[['para','Ring near the centre'],['peri','Further out']],S.pat,'Pattern')}
      <p id="rt-st"></p>
      <p class="sub">Her exams and her risk</p>
      <label class="dv-meter" for="rt-yr"><span>Years on hydroxychloroquine</span><b id="rt-y"></b></label><input id="rt-yr" type="range" min="0" max="25" step="1" value="${S.yr}" style="width:100%;accent-color:var(--c)">
      <p class="dv-fine" style="margin:10px 0 0">Daily dose per kg of actual body weight</p>
      ${seg('ds',DOSE.map((d,i)=>[i,d.l+' mg']),S.dose,'Dose')}
      <div class="dv-btns"><button class="dv-btn${S.rf?' on':''}" id="rt-rf" type="button">Kidney disease or tamoxifen<small>${S.rf?'on: yearly exams from the start':'off'}</small></button></div>
      <div class="dv-meter"><span>Eye exams so far</span><b id="rt-ex"></b></div>
      <div class="dv-meter"><span>Risk so far at up to 5 mg/kg</span><b id="rt-r"></b></div>
      <div class="dv-meter"><span>Retinopathy by 15 years at this dose</span><b id="rt-15"></b><i><u id="rt-15B"></u></i></div>
      <div class="dv-meter"><span>Moderate or severe by 15 years</span><b id="rt-15s"></b></div>
      <p class="dv-fine">The two measures come from different kinds of study. The AAO figures rest on damage already present in long-term users (Melles 2014). Followed forward with regular scans, a 2023 cohort found lower numbers at the same dose: 2.7% by 15 years at up to 5 mg/kg and 8.6% overall, most of them mild (Melles 2023).</p>
      <p class="dv-fine">Screening, from the label and the American Academy of Ophthalmology: a baseline exam in the first year, then yearly from five years, or yearly from the start with a risk factor (more than 5 mg/kg a day, kidney disease, tamoxifen, other macular disease). Each exam pairs the OCT with an automated test of the central 10° of vision, or 24° for patients of Asian descent. The patient started in 2026, so her baseline exam falls in this first year.</p>
      <p class="dv-fine">Risk by years: at recommended doses, under 1% up to 5 years and under 2% up to 10, rising to almost 20% after 20; someone still clear at 20 years has about a 4% chance of it starting the following year (AAO 2016, from Melles 2014, 2,361 long-term users). By dose: 3,325 long-term users (Melles 2023). Kidney disease about doubled the odds, and tamoxifen raised them about 4.6 times (Melles 2014). For scale, 400 mg a day is 5 mg/kg at 80 kg and 6.7 mg/kg at 60 kg. Scan and photo are schematic, depth stretched as on an OCT screen; the stages follow Marmor & Hu 2014. Tap the layers to collect them.</p>`;},
    bind(card,api){const seg=(k,f)=>card.querySelectorAll(`[data-${k}]`).forEach(b=>b.onclick=()=>{card.querySelectorAll(`[data-${k}]`).forEach(y=>y.setAttribute('aria-checked',y===b));f(b.dataset[k]);upd(card);});
      seg('st',v=>{S.stage=+v;if(S.stage===1)api.discover('hcq_pr',true);if(S.stage===3)api.discover('hcq_rpe',true);});seg('pt',v=>{S.pat=v;});seg('ds',v=>{S.dose=+v;});
      const r=card.querySelector('#rt-yr');r.oninput=()=>{S.yr=+r.value;upd(card);};
      const rf=card.querySelector('#rt-rf');rf.onclick=()=>{S.rf=!S.rf;rf.classList.toggle('on',S.rf);rf.querySelector('small').textContent=S.rf?'on: yearly exams from the start':'off';upd(card);};
      upd(card);},
    press(p){if(Math.hypot(p.x-FU.x,p.y-FU.y)<FU.r){S.drag=true;setDy(p);}},
    move(p){if(S.drag)setDy(p);},
    release(){S.drag=false;},
    tap(p,api){if(Math.hypot(p.x-FU.x,p.y-FU.y)<FU.r){if(Math.hypot(p.x-FU.x,p.y-FU.y)<7*FPD)api.discover('hcq_ring',true);return;}
      if(p.x<BS.x0||p.x>BS.x1||p.y<BS.y0||p.y>BS.y1)return;const C=col((p.x-BS.cx)/PXD,S.dy);
      if(p.y>C.B[0][3]-4&&p.y<C.yB+6)return api.discover('hcq_rpe');if(p.y>C.B[5][3]-2)return api.discover('hcq_pr');return api.discover('hcq_ring');},
    draw,
  };
}

export const DIVE={color:'#F29A55',top:{label:'Eye',size:'2.5 cm'},
  // no eye mesh: the right eye sits between the nasal bone and the cheekbone, just above the cheekbone's centre
  target:({centreOf,V3})=>{const z=centreOf(['Right zygomatic bone']),n=centreOf(['Right nasal bone']);return V3(lerp(n.x,z.x,.6),z.y+.022,n.z-.016);},
  view:{dist:.16,azim:-18,elev:4},
  text:'Why hydroxychloroquine is slow to act and slow to leave: it sinks into the body\'s tissues. Then into the patient\'s right eye, to the retina her eye scans watch (a baseline now, yearly from five years of use), and what damage there would look like.',
  steps:[['Build-up, a year.','Daily tablets for a year on two half-lives: the one measured in RA and the long one from healthy volunteers. Miss a dose, miss a week, or stop, and watch the blood level.'],['Retina, a 30° scan.','An OCT scan beside a photo of the back of the eye: move the scan, step through the stages of toxicity, and see how her exams and risk change with years and dose.']],
  also:[{dive:'ra',level:'molecule',opt:{mode:'hcq'},label:'RA dive · molecules',small:'hydroxychloroquine in the lysosome'},{dive:'ra',level:'lining',label:'RA dive · the lining game',small:'hydroxychloroquine is the slow one'}],
  refs:['lbl_hcq','marmor2016','tett1988','tett1989','schrezenmeier2020','melles2014','melles2015','melles2023','jorge2024','marmorhu2014','chen2010','yusuf2017','staurenghi2014','munster2002','miller1991'],
  make:({jump})=>({levels:[buildLevel(jump),retinaLevel()],guide:GUIDE_Q}),
};
