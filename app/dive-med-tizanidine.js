// Tizanidine dive: the spinal cord in the neck → the alpha-2 brake on one nerve ending → CYP1A2, the liver enzyme that sets how much reaches the body.
// Timing from the Zanaflex label; the interaction rises are the measured ones (Granfors 2004, 2005), the pictures around them illustrative.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba, nucleus } from './dive-ra.js';
import { cc } from './theme.js';

const T={tiz:'#B193E3',mn:'#7FD3A3',int:'#78A0F4',str:'#FFE36E',pain:'#F2A65A',cyp:'#D9785A',mus:'#D9606E',ca:'#FFE36E',glu:'#E6DEFF'};
const LBL='rgba(236,230,218,.55)',FONT='11px "Martian Mono", monospace';
function label(x,t,px,py,al='left',back=false){x.font=FONT;x.textAlign=al;if(back){const w=x.measureText(t).width;x.fillStyle='rgba(4,7,11,.7)';x.fillRect(al==='left'?px-4:al==='center'?px-w/2-4:px-w-4,py-11,w+8,15);}x.fillStyle=LBL;x.fillText(t,px,py);}
const near=(pts,p,d)=>{for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const L=(bx-ax)**2+(by-ay)**2,u=clamp(((p.x-ax)*(bx-ax)+(p.y-ay)*(by-ay))/L,0,1);if(Math.hypot(p.x-ax-u*(bx-ax),p.y-ay-u*(by-ay))<d)return true;}return false;};
const path=(x,pts)=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));};
function track(pts){const c=[0];for(let i=1;i<pts.length;i++)c.push(c[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return {pts,len:c[c.length-1],at(d){let i=1;while(i<pts.length-1&&c[i]<d)i++;const f=clamp((d-c[i-1])/(c[i]-c[i-1]||1),0,1);return [lerp(pts[i-1][0],pts[i][0],f),lerp(pts[i-1][1],pts[i][1],f)];}};}
function hexP(x,cx,cy,r){x.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();}
function pent(x,cx,cy,r,rot=0){x.beginPath();for(let i=0;i<5;i++){const a=rot+i/5*TAU-Math.PI/2;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();}
// tizanidine: a benzothiadiazole (six-ring fused to a five-ring) with chlorine, joined through NH to an imidazoline ring
function tizG(x,cx,cy,s=1,rot=0,col=T.tiz){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=col;x.lineWidth=2.4;x.lineJoin='round';
  hexP(x,-6,0,8);x.stroke();pent(x,7.5,0,6.5,Math.PI/2);x.stroke();x.beginPath();x.moveTo(-6,8);x.lineTo(-6,15);x.lineTo(1,20);x.stroke();pent(x,8,24,6);x.stroke();
  x.fillStyle=col;x.beginPath();x.arc(-15,-6,2.8,0,TAU);x.fill();x.restore();}
function neuron(x,cx,cy,r,col,act=0,n=5,seed=0){x.strokeStyle=rgba(col,.75);x.lineWidth=Math.max(1.4,r*.2);x.lineCap='round';
  for(let i=0;i<n;i++){const a=seed+i/n*TAU;x.beginPath();x.moveTo(cx,cy);x.quadraticCurveTo(cx+Math.cos(a+.35)*r*1.7,cy+Math.sin(a+.35)*r*1.7,cx+Math.cos(a)*r*2.5,cy+Math.sin(a)*r*2.5);x.stroke();}
  if(act>.02)glow(x,cx,cy,r*3,rgba(col,.5*act));x.fillStyle=rgba(col,.3+.45*act);x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.strokeStyle=col;x.lineWidth=2;x.stroke();nucleus(x,cx,cy,r*.42,r*.38);}
// a seven-helix receptor drawn across a membrane, its outside toward local −y
function rec7(x,col,act=0){for(let i=0;i<7;i++){x.fillStyle=rgba(col,(i%2?.55:.85)*(.7+.3*act));x.beginPath();x.roundRect(-16+i*4.6-2,-15+(i%2)*4,4,30-(i%2)*6,2);x.fill();}}
function enzyme(x,cx,cy,r,busy=0,t=0){x.save();x.translate(cx,cy);x.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,rr=r*(1+.07*Math.sin(a*5+1.3)+.05*busy*Math.sin(a*9+t*20));x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}x.closePath();
  x.fillStyle=rgba(T.cyp,.3+.2*busy);x.fill();x.strokeStyle=rgba(T.cyp,.9);x.lineWidth=2;x.stroke();glow(x,0,4,r*.45,'rgba(255,90,60,.55)');x.fillStyle='#FF7A4A';x.fillRect(-4,0,8,8);
  x.fillStyle='#0A0D12';x.beginPath();x.arc(0,-r*.78,r*.3,0,TAU);x.fill();x.restore();}
const INHC={pill:'#F2A65A',famo:'#DDB741',cipro:'#62BED3',fluvox:'#E0566A'};
function inhG(x,cx,cy,s,col){x.fillStyle=col;x.beginPath();x.roundRect(cx-9*s,cy-7*s,18*s,14*s,5*s);x.fill();x.fillStyle='rgba(4,7,11,.5)';x.fillRect(cx-4*s,cy-2*s,8*s,4*s);}

const GUIDE={
  tiz_mn:{name:'Motor neuron',kind:'Nerve cell',size:'cell body in the front horn, fibre out to the muscle',draw:(x,cx,cy,s)=>neuron(x,cx,cy,15*s,T.mn,.4,6,.3),
    text:['Sits in the front (ventral) horn of the spinal cord\'s grey matter and sends its fibre out to a muscle. When it fires, the muscle fibres it supplies contract; every push toward a spasm ends here.','Tizanidine\'s label says its overall effect is thought to reduce the facilitation of spinal motor neurons: they get pushed less.']},
  tiz_int:{name:'Interneuron',kind:'Relay nerve cell',size:'inside the grey matter',draw:(x,cx,cy,s)=>{neuron(x,cx-26*s,cy-6*s,9*s,T.int,.3,4);neuron(x,cx+26*s,cy+8*s,9*s,T.int,.3,4,1);},
    text:['A nerve cell that stays inside the cord, passing signals between incoming sensory fibres and the motor neurons. Most reflexes run through one or more of them; the stretch reflex is the famous exception, with a direct line.','Tizanidine\'s effects are greatest on these many-synapse (polysynaptic) pathways (Zanaflex label).']},
  tiz_a2:{name:'Alpha-2 receptor',kind:'Receptor · a brake',size:'nanometres',draw:(x,cx,cy,s)=>{x.save();x.translate(cx,cy+10*s);x.scale(s*1.6,s*1.6);x.fillStyle='rgba(120,160,244,.25)';x.fillRect(-34,-10,68,20);rec7(x,T.tiz,.7);tizG(x,0,-30,.8);x.restore();},
    text:['Sits on nerve endings: switched on, it cuts the calcium coming in and the release of transmitter (Giovannitti 2015). On noradrenaline\'s own endings that is a feedback loop; on other nerves\' endings, like the relay cell here, it is a "heteroreceptor", and in mouse studies that is where drugs like it do most of their work (Gilsbach 2012). Tizanidine, clonidine and dexmedetomidine all switch it on.','In the spinal cord that quiets the push on motor neurons. In the brainstem it turns down the sympathetic nerves, so blood pressure and pulse can fall, and it brings drowsiness.']},
  tiz_mol:{name:'Tizanidine',kind:'Medicine · central alpha-2 agonist',size:'under 1 nm',draw:(x,cx,cy,s)=>tizG(x,cx,cy-10*s,2.2*s),
    text:['Closely related to clonidine (Zanaflex label), but shorter acting and with less effect on heart rate and blood pressure (Giovannitti 2015). Less is not none: its label warns about low blood pressure, especially when getting up from lying down.','On an empty stomach the level peaks about an hour after a dose; half-life about 2.5 hours. Food, or switching between tablets and capsules, changes how much is absorbed. After high daily doses for weeks it is tapered, never stopped suddenly (label).']},
  tiz_cyp:{name:'CYP1A2',kind:'Liver enzyme',size:'a protein, nanometres',draw:(x,cx,cy,s,t)=>enzyme(x,cx,cy,30*s,0,t||0),
    text:['One of the liver\'s drug-processing enzymes. About 95% of a tizanidine dose is broken down, mainly by this one, and so much is caught on the first pass through the liver that only about 40% of a swallowed dose reaches the body (Zanaflex label).','It also handles caffeine: the interaction studies measured its activity with a caffeine test (Granfors 2004).']},
  tiz_inh:{name:'CYP1A2 blockers',kind:'Interacting medicines',size:'under 1 nm',draw:(x,cx,cy,s)=>{inhG(x,cx-34*s,cy,1.6*s,INHC.fluvox);inhG(x,cx,cy,1.6*s,INHC.cipro);inhG(x,cx+34*s,cy,1.6*s,INHC.pill);},
    text:['Fluvoxamine and the antibiotic ciprofloxacin are strong blockers: alongside them a 4 mg dose gave 33 and 10 times the usual exposure, and a big drop in blood pressure (Granfors 2004). Tizanidine is contraindicated with both.','Moderate or weak blockers on the label\'s avoid list include the birth-control pill, famotidine, cimetidine, zileuton, acyclovir and several heart-rhythm medicines (Zanaflex label).']},
};

// one dose: peak about an hour after it, half-life about 2.5 hours (label), scaled to 1 at the peak
const KE=Math.LN2/2.5,KA=2.5,shape=h=>h<=0?0:Math.exp(-KE*h)-Math.exp(-KA*h),TMAX=Math.log(KA/KE)/(KA-KE);
const level=h=>shape(h)/shape(TMAX);

/* ---------------- level A: the spinal cord in the neck */
function cordLevel(){
  const C={x:330,y:340},RX=240,RY=160;  // C5 is about 12 × 8 mm in cross-section (Ko 2004); 400 units = 1 cm
  const GMR=[[6,-22],[30,-70],[52,-118],[70,-140],[86,-132],[78,-92],[70,-52],[96,-30],[128,0],[150,44],[150,86],[124,112],[82,118],[44,98],[14,64],[6,30]];
  const GM=[...GMR,...GMR.slice().reverse().map(([a,b])=>[-a,b])].map(([a,b])=>[C.x+a*.82,C.y+b*.82+4]);
  const IN1=[378,272],IN2=[386,336],MN=[428,400],DRG=[560,190],J=[650,330],SP=[775,470],JT=[650,560];
  const STR=track([SP,[720,410],J,[600,250],DRG,[490,185],[425,200],[402,250],[404,330],[420,386]]);
  const PAIN=track([JT,[668,470],[657,334],[607,254],[566,198],[490,193],[428,208],[386,258]]);
  const P1=track([IN1,[385,322]]),P2=track([IN2,[418,386]]);
  const MOT=track([MN,[466,432],[505,452],[574,416],[644,326],[700,372],[742,410]]);
  const RATE={calm:{str:.9,pain:.6},flare:{str:1.6,pain:4}};
  const S={mode:'calm',pulses:[],puffs:[],E:0,fire:0,rate:0,ten:0,h:null,acts:{in1:0,in2:0,mn:0}};
  const eff=()=>S.h==null?0:clamp((level(S.h)-.25)/.75,0,1);  // the drop in tone is biggest at 1–2 h and gone by 6 h (label)
  const go=(P,k)=>S.pulses.push({P,k,d:0});
  // each synapse on the way is braked; a pathway through interneurons has three of them, the stretch reflex one
  const pass=(at,k)=>{if(Math.random()<k*eff()){S.puffs.push({x:at[0],y:at[1],t:0});return false;}return true;};
  function arrive(p){if(p.k==='str'){if(pass(MN,.25))S.E+=.6;}
    else if(p.k==='pain'){if(pass(IN1,.45)){go(P1,'p1');S.acts.in1=1;}}
    else if(p.k==='p1'){if(pass(IN2,.45)){go(P2,'p2');S.acts.in2=1;}}
    else if(p.k==='p2'){if(pass(MN,.45))S.E+=.6;}
    else if(p.k==='mot')S.ten=Math.min(1,S.ten+.28);}
  function step(dt){const R=RATE[S.mode];if(Math.random()<R.str*dt)go(STR,'str');if(Math.random()<R.pain*dt)go(PAIN,'pain');
    for(const p of S.pulses){p.d+=800*dt;if(p.d>=p.P.len&&!p.done){p.done=true;arrive(p);}}S.pulses=S.pulses.filter(p=>!p.done);
    S.E*=Math.exp(-dt/.7);if(S.E>=1){S.E=0;S.acts.mn=1;S.rate+=1/1.5;go(MOT,'mot');}
    S.rate*=Math.exp(-dt/1.5);S.ten*=Math.exp(-dt/1);for(const k in S.acts)S.acts[k]=Math.max(0,S.acts[k]-dt*3);
    for(const f of S.puffs)f.t+=dt;S.puffs=S.puffs.filter(f=>f.t<.6);
    if(S.h!=null&&S.h<8)S.h=Math.min(8,S.h+dt/5);}
  return {id:'cord',label:'Spinal cord',size:'1 cm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:200,label:'5 mm'},zoomFocus:{x:428,y:400},
    card(){return `<p class="k">Level 1 · the spinal cord in the neck</p><h2>Where tizanidine works</h2>
      <p>A muscle only tightens when its motor neurons (green), in the front of the spinal cord, fire. They are pushed by signals from the neck: stretch sensors in the muscle (yellow) reach them directly, and signals from a sore joint (orange) arrive through relay cells called interneurons (blue). Tizanidine works here, in the cord, not in the muscle. Its label says it presumably works by braking the nerve endings that pass those signals on, and that the effect is greatest on the pathways that run through interneurons.</p>
      <p><b style="color:var(--bone)">Set off a flare, then take a dose and watch the next eight hours.</b></p>
      <div class="dv-seg" role="radiogroup" aria-label="Signals from the neck"><button role="radio" data-m="calm" aria-checked="true">Calm</button><button role="radio" data-m="flare" aria-checked="false">Flare</button></div>
      <div class="dv-meter"><span>Time</span><b id="tc-h">no dose yet</b></div>
      <div class="dv-meter"><span>Tizanidine in the blood</span><b id="tc-l">—</b><i><u id="tc-lB" style="background:${cc(T.tiz)}"></u></i></div>
      <div class="dv-meter"><span>Motor neuron firing</span><b id="tc-f">0/s</b><i><u id="tc-fB" style="background:${cc(T.mn)}"></u></i></div>
      <div class="dv-meter"><span>Muscle tension</span><b id="tc-m">0%</b><i><u id="tc-mB" style="background:${cc(T.mus)}"></u></i></div>
      <div class="dv-meter"><span>Systolic pressure</span><b id="tc-bp">—</b></div>
      <div class="dv-btns"><button class="dv-btn go" id="tc-d" type="button">Take a dose</button><button class="dv-btn" id="tc-go" type="button">Zoom into one synapse<small>the alpha-2 brake</small></button></div>
      <p class="dv-fine">Its approved use is spasticity; the patient takes it as needed for neck spasms. Timing from the Zanaflex label: the blood level peaks about an hour after a dose on an empty stomach, half-life about 2.5 hours, and in a single-dose spasticity study muscle tone dropped most 1 to 2 hours after the dose and was back to placebo levels by 6 hours. Pressure change shaped on 4 mg in healthy volunteers: on tizanidine alone, in the placebo phase of the ciprofloxacin study, systolic pressure fell about 15 mmHg at the peak (Granfors 2004). Eight hours run in forty seconds; firing is illustrative. The cord's outline is to scale (Ko 2004); nerve cells are drawn hundreds of times larger and the ganglion, joint and muscle are brought closer. Tap the cells to collect them.</p>`;},
    bind(card,api){card.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{S.mode=b.dataset.m;card.querySelectorAll('[data-m]').forEach(y=>y.setAttribute('aria-checked',y===b));});
      card.querySelector('[data-m="'+S.mode+'"]').click();
      const d=card.querySelector('#tc-d');d.onclick=()=>{S.h=0;d.textContent='Take another dose';};if(S.h!=null)d.textContent='Take another dose';
      card.querySelector('#tc-go').onclick=()=>api.go('synapse',{from:{x:428,y:400}});},
    tap(p,api){const hit=(c,r)=>Math.hypot(p.x-c[0],p.y-c[1])<r;
      if(hit(MN,40))return api.discover('tiz_mn');if(hit(IN1,34)||hit(IN2,34))return api.discover('tiz_int');if(S.h!=null&&level(S.h)>.2&&(hit(IN1,70)||hit(MN,70)))return api.discover('tiz_mol');},
    draw(x,dt,t,api){step(dt);const L=S.h==null?0:level(S.h),e=eff();
      x.fillStyle='#0B0A10';x.fillRect(-400,-300,1800,1300);
      // the nerve's sheath: roots → ganglion → spinal nerve → muscle, and the joint branch
      x.strokeStyle='rgba(236,230,218,.08)';x.lineCap='round';x.lineJoin='round';x.lineWidth=26;path(x,[[430,200],DRG,J,[742,410]]);x.stroke();path(x,[[505,452],[574,416],J]);x.stroke();x.lineWidth=14;path(x,[JT,[668,470],J]);x.stroke();
      // the cord: white matter, the grey butterfly, central canal
      x.fillStyle='rgba(225,215,200,.07)';x.strokeStyle='rgba(225,215,200,.4)';x.lineWidth=2;x.beginPath();x.ellipse(C.x,C.y,RX,RY,0,0,TAU);x.fill();x.stroke();
      x.strokeStyle='rgba(225,215,200,.25)';x.beginPath();x.moveTo(C.x,C.y+RY);x.lineTo(C.x,C.y+RY-34);x.moveTo(C.x,C.y-RY);x.lineTo(C.x,C.y-30);x.stroke();
      x.fillStyle='rgba(190,160,205,.17)';x.strokeStyle='rgba(190,160,205,.45)';path(x,GM);x.closePath();x.fill();x.stroke();x.fillStyle='rgba(225,215,200,.4)';x.beginPath();x.arc(C.x,C.y+10,4,0,TAU);x.fill();
      x.strokeStyle='rgba(236,230,218,.3)';x.lineWidth=1.5;for(const dy of [-8,0,8]){x.beginPath();x.moveTo(DRG[0]-30,DRG[1]+dy*.4);x.quadraticCurveTo(470,190+dy,428+dy*.6,202+dy*.7);x.stroke();x.beginPath();x.moveTo(560,430+dy*.4);x.quadraticCurveTo(530,450+dy,500+dy*.6,452+dy*.5);x.stroke();}
      // fibres
      x.lineWidth=2.2;x.strokeStyle=rgba(T.str,.55);path(x,STR.pts);x.stroke();x.strokeStyle=rgba(T.pain,.55);path(x,PAIN.pts);x.stroke();
      x.strokeStyle=rgba(T.int,.6);path(x,P1.pts);x.stroke();path(x,P2.pts);x.stroke();x.strokeStyle=rgba(T.mn,.6);path(x,MOT.pts);x.stroke();
      // ganglion, joint, muscle
      x.fillStyle='rgba(255,227,110,.16)';x.strokeStyle=rgba(T.str,.7);x.lineWidth=1.6;x.beginPath();x.ellipse(DRG[0],DRG[1],36,22,-.2,0,TAU);x.fill();x.stroke();
      for(const dx of [-10,10]){x.fillStyle=`rgba(230,215,190,${S.mode==='flare'?.5:.35})`;x.beginPath();x.ellipse(JT[0]+dx*1.6,JT[1],14,20,dx>0?.3:-.3,0,TAU);x.fill();}
      if(S.mode==='flare')glow(x,JT[0],JT[1],34+4*Math.sin(t*5),'rgba(242,166,90,.45)');
      const sq=S.ten;x.strokeStyle=rgba(T.mus,.8);x.lineWidth=2;x.fillStyle=rgba(T.mus,.1+.12*sq);x.beginPath();x.ellipse(790,420,58*(1+.12*sq),175*(1-.1*sq),0,0,TAU);x.fill();x.stroke();
      for(let i=0;i<8;i++){const fx=748+i*12;x.strokeStyle=rgba(T.mus,.3+.45*sq);x.lineWidth=6;x.beginPath();const hl=150*(1-.12*sq)*Math.sqrt(1-((fx-790)/66)**2);x.moveTo(fx,420-hl);x.lineTo(fx,420+hl);x.stroke();}
      x.strokeStyle=rgba(T.str,.9);x.lineWidth=1.6;x.beginPath();x.ellipse(SP[0],SP[1],7,22,0,0,TAU);x.stroke();
      // cells
      neuron(x,...IN1,10,T.int,S.acts.in1,4,.4);neuron(x,...IN2,10,T.int,S.acts.in2,4,1.2);neuron(x,...MN,16,T.mn,S.acts.mn,6,.3);
      x.fillStyle=rgba(T.str,.9);x.beginPath();x.arc(DRG[0],DRG[1],8,0,TAU);x.fill();
      // tizanidine at the braked endings, and the signals it stops
      if(L>.05){const n=Math.round(L*5);for(const [sx,sy] of [IN1,IN2,MN])for(let i=0;i<n;i++){const a=i/n*TAU+t*.4;tizG(x,sx+Math.cos(a)*30,sy+Math.sin(a)*24,.42,a);}}
      for(const f of S.puffs){x.strokeStyle=rgba(T.tiz,1-f.t/.6);x.lineWidth=2.5;x.beginPath();x.arc(f.x,f.y,8+f.t*40,0,TAU);x.stroke();}
      for(const p of S.pulses){const [px,py]=p.P.at(p.d);const col=p.k==='str'?T.str:p.k==='pain'?T.pain:p.k==='mot'?T.mn:T.int;glow(x,px,py,14,rgba(col,.7));x.fillStyle=col;x.beginPath();x.arc(px,py,4,0,TAU);x.fill();}
      label(x,'SPINAL CORD',150,170,'left');label(x,'SENSORY GANGLION',DRG[0],DRG[1]-32,'center');label(x,'NECK MUSCLE',790,228,'center');label(x,'STRETCH SENSOR',SP[0],SP[1]+40,'center',true);
      label(x,'SORE JOINT',JT[0],JT[1]+40,'center');label(x,'INTERNEURONS',IN1[0]-30,IN1[1]+38,'right',true);label(x,'MOTOR NEURON',MN[0],MN[1]+44,'center',true);
      label(x,S.h==null?'NO DOSE YET':`${S.h.toFixed(1)} H AFTER THE DOSE`,860,70,'right');
      const q=s=>api.card.querySelector(s);if(q('#tc-h')){q('#tc-h').textContent=S.h==null?'no dose yet':`${S.h.toFixed(1)} h after the dose`;q('#tc-l').textContent=S.h==null?'—':Math.round(L*100)+'% of peak';q('#tc-lB').style.width=L*100+'%';
        q('#tc-f').textContent=S.rate.toFixed(1)+'/s';q('#tc-fB').style.width=clamp(S.rate/3,0,1)*100+'%';q('#tc-m').textContent=Math.round(S.ten*100)+'%';q('#tc-mB').style.width=S.ten*100+'%';
        q('#tc-bp').textContent=S.h==null?'—':`${L>.03?'−':''}${Math.round(16*L)} mmHg`;}
    },
  };
}

/* ---------------- level B: one synapse */
function synapseLevel(){
  const BX=500,BY=245,BRX=250,BRY=165,PY=446;const ybot=px=>BY+BRY*Math.sqrt(Math.max(0,1-((px-BX)/BRX)**2));
  const CONC={none:{l:'None',c:0,n:0},dose:{l:'After a dose',c:.5,n:7},raised:{l:'Raised by a blocker',c:3,n:20}};
  const CA=[410,470,530,590],PR=[410,440,470,500,530,560,590];
  const A2=[Math.PI+.35,Math.PI+.8,Math.PI+1.2,-1.2,-.8,-.35].map(th=>{const nx=Math.cos(th)/BRX,ny=Math.sin(th)/BRY,m=Math.hypot(nx,ny);return {x:BX+BRX*Math.cos(th),y:BY+BRY*Math.sin(th),rot:Math.atan2(nx/m,-ny/m),on:0,act:0};});
  let S;
  function reset(){S={mode:'none',spikes:[],ca:[],tx:[],fus:[],ves:[],buf:[],acc:0,v:0,auto:0,flash:0,log:[],cal:1,pr:PR.map(()=>0),mnf:0,free:[]};
    for(let i=0;i<6;i++){const px=425+i*30;S.ves.push({x:px,y:ybot(px)-14,dock:true,hx:px});}
    for(let i=0;i<26;i++){const a=i*2.39996,r=Math.sqrt((i+.5)/26);S.ves.push({x:BX+Math.cos(a)*r*150,y:330+Math.sin(a)*r*48,dock:false});}}
  reset();
  const occ=()=>A2.filter(r=>r.on).length/A2.length;
  function signal(){S.spikes.push({y:-60});}
  function release(){const o=occ(),ca=1-.75*o;S.cal=lerp(S.cal,ca,.6);for(const cx of CA)for(let i=0;i<Math.round(3*ca);i++)S.ca.push({x:cx+rand(-6,6),y:ybot(cx),vy:-rand(40,90),l:.5});
    let n=4*(1-.8*o);n=Math.floor(n)+(Math.random()<n%1?1:0);const docked=S.ves.filter(v=>v.dock&&!v.gone);docked.sort(()=>Math.random()-.5);
    for(const v of docked.slice(0,n)){v.gone=true;S.fus.push({x:v.x,y:v.y,t:0});for(let k=0;k<9;k++)S.tx.push({x:v.x+rand(-10,10),y:ybot(v.x)+2,vx:rand(-40,40),vy:rand(150,220),hit:false});}
    S.log.unshift({n,fired:false});S.log=S.log.slice(0,10);}
  function step(dt){
    const C=CONC[S.mode];for(const r of A2){const u=Math.random();if(!r.on&&u<2*C.c*dt)r.on=1;else if(r.on&&u<.6*dt)r.on=0;r.act=lerp(r.act,r.on,1-Math.exp(-5*dt));}
    S.auto+=dt;if(S.auto>1.1){S.auto=0;signal();}
    for(const s of S.spikes){s.y+=600*dt;if(s.y>=BY-BRY+10&&!s.done){s.done=true;S.flash=1;setTimeout(release,80);}}S.spikes=S.spikes.filter(s=>!s.done);
    S.flash=Math.max(0,S.flash-dt*3);for(const c of S.ca){c.y+=c.vy*dt;c.l-=dt;}S.ca=S.ca.filter(c=>c.l>0);for(const f of S.fus)f.t+=dt;S.fus=S.fus.filter(f=>f.t<.4);
    for(const m of S.tx){m.x+=m.vx*dt;m.y+=m.vy*dt;if(!m.hit&&m.y>=PY-2){m.hit=true;m.vy=0;m.vx=0;m.l=.25;const i=PR.reduce((b,px,k)=>Math.abs(px-m.x)<Math.abs(PR[b]-m.x)?k:b,0);S.pr[i]=1;S.v+=.055;}if(m.hit)m.l-=dt;}
    S.tx=S.tx.filter(m=>!m.hit||m.l>0);S.pr=S.pr.map(p=>Math.max(0,p-dt*3));
    // used packets come back: the gaps at the release site refill from the cluster behind
    for(const v of S.ves)if(v.gone){v.t=(v.t||0)+dt;if(v.t>.7){v.gone=false;v.t=0;v.y=v.hx?ybot(v.hx)-14:v.y;}}
    S.v*=Math.exp(-dt/.14);if(S.v>=1){S.v=0;S.mnf=1;if(S.log[0])S.log[0].fired=true;}S.mnf=Math.max(0,S.mnf-dt*2.5);
    S.acc+=dt;while(S.acc>=.01){S.acc-=.01;S.buf.push(S.mnf>.85?1.6:S.v);if(S.buf.length>300)S.buf.shift();}
    // free tizanidine drifts outside the ending
    const want=C.n,have=S.free.filter(f=>!f.out);for(let i=have.length;i<want;i++)S.free.push({x:rand(170,830),y:rand(40,120),vx:rand(-30,30),vy:rand(-30,30),rot:rand(0,TAU),a:0});for(let i=want;i<have.length;i++)have[i].out=true;
    for(const f of S.free){f.vx=(f.vx+rand(-60,60)*dt)*.98;f.vy=(f.vy+rand(-60,60)*dt)*.98;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=dt*.5;
      const ex=(f.x-BX)/(BRX+30),ey=(f.y-BY)/(BRY+30);if(ex*ex+ey*ey<1){const m=Math.hypot(ex,ey)||1;f.x=BX+ex/m*(BRX+30);f.y=BY+ey/m*(BRY+30);f.vx=ex*40;f.vy=ey*40;}
      if(f.x<160){f.x=160;f.vx=Math.abs(f.vx);}if(f.x>840){f.x=840;f.vx=-Math.abs(f.vx);}if(f.y<30){f.y=30;f.vy=Math.abs(f.vy);}if(f.y>425){f.y=425;f.vy=-Math.abs(f.vy);}f.a=clamp(f.a+(f.out?-2:2)*dt,0,1);}
    S.free=S.free.filter(f=>!(f.out&&f.a<=0));}
  return {id:'synapse',label:'Synapse',size:'1 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic'},zoomFocus:{x:500,y:430},
    card(){return `<p class="k">Level 2 · one synapse</p><h2>The alpha-2 brake</h2>
      <p>A relay cell's nerve ending (top) passes signals to a motor neuron (below). Each signal opens calcium channels at the bottom of the ending (yellow), and the calcium makes packets of transmitter spill across the gap and push the motor neuron. Alpha-2 receptors on the ending are a built-in brake: switched on, they cut the calcium and the release. Tizanidine (purple) switches them on. Its label says it presumably eases spasticity this way, by increasing "presynaptic inhibition".</p>
      <p><b style="color:var(--bone)">Tap to send extra signals, then change the tizanidine level.</b></p>
      <div class="dv-seg" role="radiogroup" aria-label="Tizanidine">${Object.entries(CONC).map(([k,v])=>`<button role="radio" data-c="${k}" aria-checked="${k===S.mode}">${v.l}</button>`).join('')}</div>
      <div class="dv-meter"><span>Alpha-2 receptors switched on</span><b id="sy-o">0%</b><i><u id="sy-oB" style="background:${cc(T.tiz)}"></u></i></div>
      <div class="dv-meter"><span>Calcium let in</span><b id="sy-c">100%</b><i><u id="sy-cB" style="background:${cc(T.ca)}"></u></i></div>
      <div class="dv-meter"><span>Packets per signal</span><b id="sy-r">—</b></div>
      <div class="dv-meter"><span>Signals that fired the motor neuron</span><b id="sy-m">—</b></div>
      <p class="sub">The same brake in the brainstem</p>
      <p>Alpha-2 receptors in the brainstem turn down the sympathetic nerves; that is how clonidine, tizanidine's close relative, lowers blood pressure, and the pulse can slow too. For the patient this lands on top of POTS and propranolol, and tizanidine's label warns about moving from lying down to standing and about adding it to other blood-pressure-lowering medicines.</p>
      <div class="dv-meter"><span>Brainstem's push on vessels and heart</span><b id="sy-b">100%</b><i><u id="sy-bB" style="background:${cc('#F2A65A')}"></u></i></div>
      <div class="dv-btns"><button class="dv-btn" id="sy-go" type="button">Into the liver<small>why some medicines can't be combined with it</small></button></div>
      <p class="dv-fine">Schematic: the gap and the molecules are drawn large, and amounts are illustrative. Mechanism: Zanaflex label (presumably presynaptic inhibition, greatest on polysynaptic pathways); Giovannitti 2015 (alpha-2 receptors on nerve endings cut calcium entry and transmitter release; clonidine lowers blood pressure through the brainstem; tizanidine has less effect on heart rate and blood pressure than clonidine); Gilsbach 2012 (heteroreceptors). Tap the receptors, the molecules and the motor neuron to collect them.</p>`;},
    bind(card,api){card.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.mode=b.dataset.c;card.querySelectorAll('[data-c]').forEach(y=>y.setAttribute('aria-checked',y===b));});
      card.querySelector('#sy-go').onclick=()=>api.go('liver',{from:{x:500,y:300}});},
    tap(p,api){for(const r of A2)if(Math.hypot(p.x-r.x,p.y-r.y)<30)return api.discover('tiz_a2');
      for(const f of S.free)if(Math.hypot(p.x-f.x,p.y-f.y)<26)return api.discover('tiz_mol');
      if(p.y>PY+20)api.discover('tiz_mn');signal();},
    draw(x,dt,t,api){step(dt);
      x.fillStyle='#0A0B12';x.fillRect(-400,-300,1800,1300);
      // the motor neuron below
      x.fillStyle=rgba(T.mn,.1+.12*S.mnf);x.strokeStyle=rgba(T.mn,.7);x.lineWidth=6;x.beginPath();x.roundRect(150,PY,700,400,40);x.fill();x.stroke();
      for(let i=0;i<PR.length;i++){x.fillStyle=S.pr[i]>.05?'#E6DEFF':rgba(T.mn,.9);x.beginPath();x.roundRect(PR[i]-5,PY-8,10,18,3);x.fill();}
      // the ending: axon, membrane, mitochondrion, packets
      x.fillStyle=rgba(T.int,.1);x.strokeStyle=rgba(T.int,.65+.35*S.flash);x.lineWidth=6;x.beginPath();x.rect(478,-80,44,BY-BRY+90);x.fill();
      x.beginPath();x.ellipse(BX,BY,BRX,BRY,0,0,TAU);x.fill();x.stroke();x.beginPath();x.moveTo(478,-80);x.lineTo(478,BY-BRY+6);x.moveTo(522,-80);x.lineTo(522,BY-BRY+6);x.stroke();
      x.strokeStyle='rgba(236,214,196,.18)';x.lineWidth=1;x.beginPath();x.ellipse(BX,BY,BRX-6,BRY-6,0,0,TAU);x.stroke();
      x.fillStyle='rgba(242,166,90,.18)';x.strokeStyle='rgba(242,166,90,.55)';x.lineWidth=1.6;x.beginPath();x.ellipse(350,215,62,26,-.2,0,TAU);x.fill();x.stroke();
      x.beginPath();for(let k=-3;k<=3;k++){x.moveTo(350+k*15-6,201);x.quadraticCurveTo(350+k*15,215,350+k*15-6,229);}x.stroke();
      for(const v of S.ves){if(v.gone)continue;x.fillStyle='rgba(230,222,255,.16)';x.strokeStyle='rgba(230,222,255,.6)';x.lineWidth=1.2;x.beginPath();x.arc(v.x,v.y,11,0,TAU);x.fill();x.stroke();x.fillStyle='rgba(230,222,255,.7)';for(let k=0;k<3;k++){x.beginPath();x.arc(v.x-4+k*4,v.y+(k%2?2:-2),1.4,0,TAU);x.fill();}}
      for(const f of S.fus){x.strokeStyle=`rgba(230,222,255,${.8-f.t*2})`;x.lineWidth=2;x.beginPath();x.arc(f.x,ybot(f.x)-4,11*(1+f.t*2),0,Math.PI);x.stroke();}
      for(const cx of CA){x.fillStyle=rgba(T.ca,.5+.5*S.flash);x.beginPath();x.roundRect(cx-6,ybot(cx)-8,12,16,3);x.fill();}
      for(const c of S.ca){x.fillStyle=rgba(T.ca,clamp(c.l*2,0,1));x.beginPath();x.arc(c.x,c.y,2.6,0,TAU);x.fill();}
      for(const s of S.spikes){glow(x,500,s.y,30,'rgba(120,160,244,.8)');}
      x.fillStyle=T.glu;for(const m of S.tx){x.globalAlpha=m.hit?clamp(m.l*4,0,1):1;x.beginPath();x.arc(m.x,m.y,2.4,0,TAU);x.fill();}x.globalAlpha=1;
      // the brake: alpha-2 receptors on the ending's outer membrane
      for(const r of A2){x.save();x.translate(r.x,r.y);x.rotate(r.rot);rec7(x,T.tiz,r.act);if(r.on)tizG(x,0,-30,.62,Math.PI/2);if(r.act>.05)glow(x,0,14,20,rgba(T.tiz,.4*r.act));x.restore();}
      for(const f of S.free){x.save();x.globalAlpha*=f.a;tizG(x,f.x,f.y,.62,f.rot);x.restore();}
      // the motor neuron's voltage
      const X0=300,X1=700,vy=v=>672-v*80;x.fillStyle='rgba(4,7,11,.55)';x.fillRect(X0-8,512,X1-X0+16,172);
      x.strokeStyle='rgba(242,112,95,.75)';x.setLineDash([5,5]);x.lineWidth=1;x.beginPath();x.moveTo(X0,vy(1));x.lineTo(X1,vy(1));x.stroke();x.setLineDash([]);label(x,'FIRES',X1,vy(1)-6,'right');
      x.strokeStyle=T.mn;x.lineWidth=2;x.beginPath();S.buf.forEach((v,i)=>{const px=X0+i*(X1-X0)/299;i?x.lineTo(px,vy(v)):x.moveTo(px,vy(v));});x.stroke();
      label(x,'MOTOR NEURON VOLTAGE',X0,505);label(x,'NERVE ENDING',BX+40,64,'left',true);label(x,'α2 RECEPTORS',A2[0].x-10,A2[0].y-34,'center',true);label(x,'CALCIUM CHANNELS',BX,ybot(BX)+24,'center',true);
      const q=s=>api.card.querySelector(s);if(q('#sy-o')){const o=A2.reduce((a,r)=>a+r.act,0)/A2.length;q('#sy-o').textContent=Math.round(o*100)+'%';q('#sy-oB').style.width=o*100+'%';
        const ca=1-.75*o;q('#sy-c').textContent=Math.round(ca*100)+'%';q('#sy-cB').style.width=ca*100+'%';
        const lg=S.log.slice(0,6);q('#sy-r').textContent=lg.length?(lg.reduce((a,l)=>a+l.n,0)/lg.length).toFixed(1):'—';q('#sy-m').textContent=S.log.length?`${S.log.filter(l=>l.fired).length} of ${S.log.length}`:'—';
        const b=1-.55*o;q('#sy-b').textContent=Math.round(b*100)+'%';q('#sy-bB').style.width=b*100+'%';}
    },
  };
}

/* ---------------- level C: the liver enzyme */
function liverLevel(jump){
  const INH={none:{l:'Nothing',jam:0,cmax:1,auc:1,th:1.5,n:'Alone, about 60% of a dose is broken down on its first pass through the liver, so about 40% reaches the body (label). In healthy volunteers a 4 mg dose lowered systolic pressure by about 15 to 17 mmHg at its peak (Granfors 2004, 2005).'},
    pill:{l:'Birth-control pill',jam:3,cmax:3,auc:3.9,th:1.5,n:'In women on a combined pill (ethinyl estradiol with gestodene), the peak was 3 times higher and total exposure 3.9 times greater than in women not on it, and systolic pressure fell 29 mmHg against 17. One woman\'s exposure was nearly 20 times the non-users\' average (Granfors 2005). The label says the combination isn\'t recommended.'},
    famo:{l:'Famotidine',jam:0,cmax:null,n:'Famotidine (Pepcid), an acid reducer: no study has tested it with tizanidine, so there is no curve to draw and no enzyme drawn jammed. It is on the label\'s list of moderate or weak CYP1A2 blockers to avoid, though most studies with theophylline, another drug broken down mainly by CYP1A2 (Tjia 1996), found famotidine had no effect on it (Lin 1987, Bachmann 1995); one study of 7 patients found it slowed (Dal Negro 1993). The prescriber should still know if it\'s started.'},
    cipro:{l:'Ciprofloxacin',jam:5,cmax:7,auc:10,th:1.8,n:'Ciprofloxacin, an antibiotic: a 7-fold peak and 10 times the exposure. Systolic pressure fell 35 mmHg against 15 with tizanidine alone, with much more drowsiness (Granfors 2004). The combination is contraindicated.'},
    fluvox:{l:'Fluvoxamine',jam:6,cmax:12,auc:33,th:4.3,n:'Fluvoxamine: a 12-fold peak and 33 times the exposure (14 to 103 times from person to person), and the half-life stretched from 1.5 to 4.3 hours. Systolic pressure fell to about 80 mmHg or lower (Granfors 2004). The combination is contraindicated.'}};
  const EX=[220,330,440,550,660,770],EY=212,ORDER=[1,4,2,5,0,3],SY=132;
  const cx0=150,cx1=850,cyb=600,cyt=355,HMAX=12,YMAX=13,gx=h=>cx0+h/HMAX*(cx1-cx0),gy=v=>cyb-v/YMAX*(cyb-cyt);
  // each curve keeps the measured peak and half-life; its shape is the one-dose model with those numbers
  const curve=(d,h)=>{if(d.cmax==null)return 0;const k=Math.LN2/d.th,f=h=>h<=0?0:Math.exp(-k*h)-Math.exp(-KA*h),tm=Math.log(KA/k)/(KA-k);return d.cmax*f(h)/f(tm);};
  const S={sel:'none',h:null,emit:0,vt:0,mol:[],frag:[],inn:0,out:0,enz:EX.map((x,i)=>({x,jam:false,ij:0,busy:0}))};
  function setJam(){const n=INH[S.sel].jam;S.enz.forEach(e=>e.jam=false);ORDER.slice(0,n).forEach(i=>{S.enz[i].jam=true;S.enz[i].col=INHC[S.sel];});}
  function step(dt){
    for(const e of S.enz){e.ij=lerp(e.ij,e.jam?1:0,1-Math.exp(-4*dt));e.busy=Math.max(0,e.busy-dt*2);}
    if(S.h!=null&&S.h<HMAX){S.h=Math.min(HMAX,S.h+dt/1.5);const v0=S.vt;S.vt+=dt;S.emit+=36*(Math.exp(-v0/2.5)-Math.exp(-S.vt/2.5));while(S.emit>=1){S.emit--;S.inn++;S.mol.push({x:110,y:SY+rand(-14,14),ph:rand(0,6),c:null,t:0});}}
    for(const m of S.mol){if(m.c){m.t+=dt;const e=S.enz[m.c-1];m.x=lerp(m.x,e.x,1-Math.exp(-10*dt));m.y=lerp(m.y,EY-26,1-Math.exp(-10*dt));
        if(m.t>.35&&!m.gone){m.gone=true;e.busy=1;for(const s of [-1,1])S.frag.push({x:e.x+s*8,y:EY+10,vx:s*rand(20,40),vy:rand(30,60),l:1.4});}continue;}
      const px=m.x;m.x+=170*dt;m.ph+=dt*3;m.y=SY+Math.sin(m.ph)*10;
      // one in seven caught at each free enzyme: with all six free, about 40% gets through, as on the label
      S.enz.forEach((e,i)=>{if(!m.c&&!e.jam&&px<e.x&&m.x>=e.x&&Math.random()<.143)m.c=i+1;});
      if(m.x>880&&!m.out){m.out=true;S.out++;}}
    S.mol=S.mol.filter(m=>!m.gone&&m.x<900);for(const f of S.frag){f.x+=f.vx*dt;f.y+=f.vy*dt;f.l-=dt;}S.frag=S.frag.filter(f=>f.l>0);}
  function note(api){const d=INH[S.sel],q=s=>api.card.querySelector(s);q('#lv-n').textContent=d.n;q('#lv-j').textContent=d.cmax==null?'not known':`${d.jam} of 6`;
    q('#lv-p').textContent=d.cmax==null?'not measured':'×'+d.cmax;q('#lv-a').textContent=d.cmax==null?'not measured':'×'+d.auc;q('#lv-t').textContent=d.cmax==null?'not measured':d.th+' h';}
  return {id:'liver',label:'Liver enzyme',size:'nanometres',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic'},zoomFocus:{x:500,y:212},
    card(){return `<p class="k">Level 3 · the liver</p><h2>One enzyme sets the level</h2>
      <p>Tizanidine is broken down mostly by one liver enzyme, CYP1A2 (rust), and most of a dose is caught on its first pass through the liver, before it ever reaches the body. Some medicines jam that enzyme. Then far more tizanidine gets through (with fluvoxamine it also lingers), and its effects on blood pressure and alertness grow with it.</p>
      <p><b style="color:var(--bone)">Pick what's taken alongside, then take one dose.</b></p>
      <div class="dv-seg" role="radiogroup" aria-label="Taken alongside">${Object.entries(INH).map(([k,v])=>`<button role="radio" data-i="${k}" aria-checked="${k===S.sel}">${v.l}</button>`).join('')}</div>
      <div class="dv-meter"><span>Enzymes jammed (illustrative)</span><b id="lv-j">0 of 6</b></div>
      <div class="dv-meter"><span>Peak level, measured</span><b id="lv-p">×1</b></div>
      <div class="dv-meter"><span>Total exposure, measured</span><b id="lv-a">×1</b></div>
      <div class="dv-meter"><span>Half-life, measured</span><b id="lv-t">1.5 h</b></div>
      <p id="lv-n"></p>
      <div class="dv-btns"><button class="dv-btn go" id="lv-d" type="button">Take one dose</button><button class="dv-btn" id="lv-pots" type="button">POTS dive · the standing reflex<small>what a blood-pressure drop lands on</small></button></div>
      <p class="dv-fine">The rises are measured: single 4 mg doses in healthy volunteers (Granfors 2004, fluvoxamine and ciprofloxacin, 10 people each; Granfors 2005, 15 women on the pill and 15 not). The label gives the same fluvoxamine and ciprofloxacin numbers. Each curve is drawn from its measured peak and half-life. The 1.5-hour half-life is what the volunteer studies measured; the label gives about 2.5 hours. The jammed enzymes and the molecule counts are illustrative. Twelve hours run in eighteen seconds. Tap an enzyme or a molecule to collect it.</p>`;},
    bind(card,api){card.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{S.sel=b.dataset.i;card.querySelectorAll('[data-i]').forEach(y=>y.setAttribute('aria-checked',y===b));setJam();S.h=null;S.mol=[];S.inn=S.out=0;note(api);
        if(S.sel==='cipro'||S.sel==='fluvox')api.discover('tiz_inh',true);});
      card.querySelector('#lv-d').onclick=()=>{S.h=0;S.vt=0;S.emit=0;S.mol=[];S.inn=S.out=0;};card.querySelector('#lv-pots').onclick=()=>jump('pots',{level:'circuit'});note(api);},
    tap(p,api){for(const e of S.enz)if(Math.hypot(p.x-e.x,p.y-EY)<40)return api.discover(e.jam?'tiz_inh':'tiz_cyp');if(Math.abs(p.y-SY)<40&&S.mol.length)return api.discover('tiz_mol');},
    draw(x,dt,t,api){step(dt);const d=INH[S.sel];
      x.fillStyle='#0C0B10';x.fillRect(-400,-300,1800,1300);
      x.fillStyle='rgba(217,120,90,.06)';x.fillRect(-400,60,1800,250);x.fillStyle='rgba(236,214,196,.22)';x.fillRect(-400,250,1800,6);x.fillRect(-400,268,1800,6);
      x.strokeStyle='rgba(236,230,218,.12)';x.lineWidth=30;x.lineCap='round';x.beginPath();x.moveTo(120,SY);x.lineTo(880,SY);x.stroke();
      for(const e of S.enz){x.strokeStyle=rgba(T.cyp,.5);x.lineWidth=5;x.beginPath();x.moveTo(e.x,EY+30);x.lineTo(e.x,252);x.stroke();enzyme(x,e.x,EY,34,e.busy,t);
        if(e.ij>.02){const iy=lerp(-40,EY-26,e.ij);x.save();x.globalAlpha*=e.ij;inhG(x,e.x,iy,1.1,e.col||INHC.pill);x.restore();}}
      if(S.sel==='famo')for(const i of [1,4]){const fx=EX[i]+46,fy=EY-44+Math.sin(t*1.6+i)*6;inhG(x,fx,fy,1.1,INHC.famo);label(x,'?',fx,fy-14,'center');}
      for(const m of S.mol)tizG(x,m.x,m.y,.55,m.ph*.3);
      for(const f of S.frag){x.fillStyle=`rgba(150,140,160,${clamp(f.l,0,1)*.8})`;x.beginPath();x.arc(f.x,f.y,4,0,TAU);x.fill();}
      label(x,'FROM THE GUT',150,90,'left');label(x,'TO THE BODY',850,90,'right');label(x,'LIVER CELL · CYP1A2',150,296,'left');
      if(S.inn)label(x,`THROUGH: ${S.out} OF ${S.inn}`,850,296,'right');
      // the blood level after one dose
      x.strokeStyle='rgba(236,230,218,.14)';x.lineWidth=1;for(const v of [1,4,8,12]){x.beginPath();x.moveTo(cx0,gy(v));x.lineTo(cx1,gy(v));x.stroke();label(x,'×'+v,cx0+4,gy(v)-4);}
      x.strokeStyle='rgba(236,230,218,.4)';x.beginPath();x.moveTo(cx0,cyb);x.lineTo(cx1,cyb);x.stroke();for(let h=0;h<=HMAX;h+=2)label(x,h+' h',gx(h),cyb+16,'center');
      label(x,'TIZANIDINE IN THE BLOOD · ONE 4 MG DOSE, AS IN THE STUDIES',cx0,cyt-14);
      const plot=(dd,h1)=>{x.beginPath();for(let h=0;h<=h1;h+=.05){const X=gx(h),Y=gy(curve(dd,h));h?x.lineTo(X,Y):x.moveTo(X,Y);}x.stroke();};
      x.strokeStyle='rgba(236,230,218,.5)';x.setLineDash([5,5]);x.lineWidth=1.6;plot(INH.none,HMAX);x.setLineDash([]);label(x,'ALONE',gx(1.2)+10,gy(1)-6);
      if(d.cmax==null)label(x,'NOT MEASURED',(cx0+cx1)/2,(cyb+cyt)/2,'center');
      else if(S.h!=null){x.strokeStyle=T.tiz;x.lineWidth=3;plot(d,S.h);const k=Math.LN2/d.th,tm=Math.log(KA/k)/(KA-k);if(S.h>tm&&S.sel!=='none')label(x,`×${d.cmax} PEAK`,gx(tm)+10,gy(d.cmax)-6);
        x.strokeStyle='rgba(236,230,218,.35)';x.beginPath();x.moveTo(gx(S.h),cyb);x.lineTo(gx(S.h),cyt);x.stroke();}
    },
  };
}

export const DIVE={color:'#B193E3',top:{label:'Neck',size:'10 cm'},
  target:({centreOf,V3})=>centreOf(['Fifth cervical vertebra']).add(V3(0,0,-.01)),view:{dist:.18,azim:150,elev:8},
  text:'Into the patient\'s neck, to the spinal cord where tizanidine works, then onto one nerve ending and its alpha-2 brake, and finally into the liver, where one enzyme decides how much of each dose reaches her body.',
  steps:[['Spinal cord, 1 cm.','The circuit behind a muscle spasm. Set off a flare, take a dose and watch eight hours of it.'],['Synapse, 1 µm.','The alpha-2 brake on a nerve ending, and the blood-pressure side of the same receptor.'],['Liver enzyme.','CYP1A2 gets jammed: the pill, ciprofloxacin and fluvoxamine with their measured rises, and famotidine, which hasn\'t been measured.']],
  also:[{dive:'pots',level:'circuit',label:'POTS dive · the standing reflex',small:'what tizanidine\'s blood-pressure drop lands on'}],
  refs:['lbl_tiz','giovannitti2015','gilsbach2012','granfors2004f','granfors2004c','granfors2005','ko2004','tjia1996','lin1987','bachmann1995','dalnegro1993'],
  make:({jump})=>({levels:[cordLevel(),synapseLevel(),liverLevel(jump)],guide:GUIDE}),
};
