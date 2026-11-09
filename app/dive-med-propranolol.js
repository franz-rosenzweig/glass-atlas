// Propranolol XR dive: the sinus node, where noradrenaline sets the pace → the beta receptors propranolol sits in, in the heart and the airways.
// Heart rates are the group averages two hours after single quick-release doses in Raj 2009, standing from sitting.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba } from './dive-ra.js';
import { cc } from './theme.js';

const P={prop:'#EE6F82',ne:'#F2A65A',camp:'#FFE36E',glu:'#7FD3A3',b1:'#78A0F4',b2:'#62BED3',node:'#D58FB4',atr:'#C0606E',cap:'#C23447'};
const LBL='rgba(236,230,218,.55)',FONT='11px "Martian Mono", monospace';
function label(x,t,px,py,al='left',back=false){x.font=FONT;x.textAlign=al;if(back){const w=x.measureText(t).width;x.fillStyle='rgba(4,7,11,.7)';x.fillRect(al==='left'?px-4:al==='center'?px-w/2-4:px-w-4,py-11,w+8,15);}x.fillStyle=LBL;x.fillText(t,px,py);}
let seed=7;const R=()=>(seed=seed*16807%2147483647)/2147483647;
const near=(pts,p,d)=>{for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const L=(bx-ax)**2+(by-ay)**2,u=clamp(((p.x-ax)*(bx-ax)+(p.y-ay)*(by-ay))/L,0,1);if(Math.hypot(p.x-ax-u*(bx-ax),p.y-ay-u*(by-ay))<d)return true;}return false;};
const path=(x,pts)=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));};
function hexP(x,cx,cy,r){x.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();}
// propranolol: a naphthalene (two fused rings) and its side chain
function propG(x,cx,cy,s=1,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=P.prop;x.lineWidth=2.4;x.lineJoin='round';hexP(x,-7.8,0,9);x.stroke();hexP(x,7.8,0,9);x.stroke();
  x.beginPath();x.moveTo(15.6,4.5);x.lineTo(23,9);x.lineTo(30,4);x.lineTo(37,9);x.stroke();x.restore();}
// noradrenaline and adrenaline: one ring, its two OH groups, a short chain
function catG(x,cx,cy,s=1,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=P.ne;x.lineWidth=2.4;x.lineJoin='round';hexP(x,0,0,8);x.stroke();
  x.beginPath();x.moveTo(-6.9,-4);x.lineTo(-12.5,-8);x.moveTo(-6.9,4);x.lineTo(-12.5,8);x.moveTo(6.9,-4);x.lineTo(13,-9);x.lineTo(20,-5);x.stroke();x.restore();}
function glucG(x,cx,cy,s=1,t=0){x.save();x.translate(cx,cy);x.scale(s,s);x.fillStyle=P.glu;for(let i=0;i<9;i++){x.beginPath();x.arc(-24+i*6,Math.sin(i*.9+t)*3.5,3.3,0,TAU);x.fill();}x.restore();}
// a seven-helix receptor across the membrane (y0 outer face, y1 inner face)
function gpcr(x,cx,y0,y1,col,act=0){for(let i=0;i<7;i++){x.fillStyle=rgba(col,(i%2?.55:.8)*(.7+.3*act));x.beginPath();x.roundRect(cx-21+i*6-2.6,y0-12+(i%2)*5,5.2,y1-y0+22-(i%2)*7,2.6);x.fill();}
  if(act>.02){x.save();x.globalAlpha*=act;glow(x,cx,y1+16,34,rgba(P.camp,.45));x.restore();}}
function membrane(x,x0,x1,y0,y1,tint){x.fillStyle=tint;x.fillRect(x0,y0,x1-x0,y1-y0);x.fillStyle='rgba(236,214,196,.32)';for(let px=x0+5;px<x1;px+=10){x.beginPath();x.arc(px,y0+4,3.6,0,TAU);x.fill();x.beginPath();x.arc(px,y1-4,3.6,0,TAU);x.fill();}}
function spindle(x,cx,cy,L,w,rot,f=0){x.save();x.translate(cx,cy);x.rotate(rot);x.fillStyle=rgba(P.node,.28+.5*f);x.strokeStyle=rgba(P.node,.85);x.lineWidth=1.3;x.beginPath();x.ellipse(0,0,L,w,0,0,TAU);x.fill();x.stroke();
  x.fillStyle='rgba(91,134,255,.85)';x.beginPath();x.ellipse(0,0,Math.min(5,L*.2),w*.55,0,0,TAU);x.fill();x.restore();}
function heart(x,cx,cy,s){x.beginPath();x.moveTo(cx,cy+s*.9);x.bezierCurveTo(cx-s*1.4,cy-s*.1,cx-s*.7,cy-s*1.1,cx,cy-s*.45);x.bezierCurveTo(cx+s*.7,cy-s*1.1,cx+s*1.4,cy-s*.1,cx,cy+s*.9);x.fill();}
const rec=(col,act)=>(x,cx,cy,s)=>{x.save();x.translate(cx,cy);x.scale(s,s);membrane(x,-46,46,-18,18,'#2A1820');gpcr(x,0,-18,18,col,act);x.restore();};

const GUIDE={
  prop_sa:{name:'Sinus node cells',kind:'Pacemaker cells',size:'a crescent about 13.5 mm long',draw:(x,cx,cy,s)=>{for(let i=0;i<5;i++)spindle(x,cx-30*s+i*15*s,cy+(i%2?10:-10)*s,26*s,6*s,-.4+i*.08,.4);},
    text:['The heart\'s own pacemaker: slender cells that fire by themselves and drive the atrial muscle around them (Boyett 2000). After each beat their voltage creeps back up to a threshold, and the steepness of that creep sets the heart rate.','A major part of the creep comes from the "funny current" (how much is still debated), which cAMP inside the cell turns up. Beta receptors raise cAMP; the vagus nerve, the heart\'s brake, works the other way (DiFrancesco 2010).']},
  prop_ne:{name:'Noradrenaline and adrenaline',kind:'Signal molecules',size:'under 1 nm',draw:(x,cx,cy,s)=>{catG(x,cx-22*s,cy-8*s,1.7*s,.3);catG(x,cx+22*s,cy+10*s,1.7*s,-.5);},
    text:['Noradrenaline (norepinephrine) is released by sympathetic nerve endings straight onto the heart and blood vessels. Adrenaline (epinephrine) is its close relative, released into the blood by the adrenal glands.','Both act on beta receptors. The epinephrine in an auto-injector is adrenaline itself.']},
  prop_b1:{name:'Beta-1 receptor',kind:'Receptor',size:'nanometres',draw:rec(P.b1,.6),
    text:['The main beta receptor on heart cells (Baker 2005). When noradrenaline or adrenaline lands, the cell makes more cAMP: the pacemaker speeds up and the muscle squeezes harder.','With propranolol sitting in it, the same push raises the rate less (Inderal LA label).']},
  prop_b2:{name:'Beta-2 receptor',kind:'Receptor',size:'nanometres',draw:rec(P.b2,.6),
    text:['The beta receptor on the muscle wrapped around the airways (Baker 2005). Switched on, it relaxes that muscle and the airway opens; asthma relievers like albuterol (salbutamol) work here.','Propranolol blocks it too. That is why its label lists bronchial asthma as a reason not to use it: it can block the airway-opening effect of the body\'s own adrenaline and of epinephrine given as a drug.']},
  prop_mol:{name:'Propranolol',kind:'Medicine · non-selective beta blocker',size:'about 1 nm',draw:(x,cx,cy,s)=>propG(x,cx-12*s,cy,2*s),
    text:['Competes with noradrenaline and adrenaline for beta-1 and beta-2 receptors alike, taking the seat without switching the receptor on (Inderal LA label). A lab study with human receptors suggests it holds beta-2 at least as tightly as beta-1 (Baker 2005).','The patient\'s capsule is the slow-release form: blood levels peak about 6 hours after a dose and stay fairly level for about 12 hours, half-life about 10 hours. It is never stopped suddenly; the label calls for tapering over at least a few weeks.']},
  prop_glu:{name:'Glucagon',kind:'Hormone · an emergency backup',size:'a small protein',draw:(x,cx,cy,s,t)=>{rec(P.glu,.8)(x,cx,cy+14*s,s);glucG(x,cx,cy-24*s,1.4*s,t||0);},
    text:['Best known for raising blood sugar, but it also raises cAMP inside heart muscle without going through beta-1 (White 1999): a side door around the blocked receptor.','Emergency teams keep it for anaphylaxis that isn\'t answering epinephrine in someone on a beta blocker, though the evidence is very limited (WAO 2020). Epinephrine still comes first.']},
};

/* ---------------- level A: the sinus node */
function nodeLevel(jump){
  const HR={none:[83,108],low:[70,87],high:[66,78]};
  const DOSE={none:'No propranolol',low:'Low dose',high:'High dose'};
  const NOTE={none:'The study\'s placebo morning: standing from sitting added about 25 beats a minute, to about 108.',
    low:'Low dose (20 mg): standing rate about 86 to 90, and symptoms eased more than on placebo.',
    high:'High dose (80 mg): the heart slowed further, to about 78 standing, yet two hours after the dose symptoms had eased less than on the low dose (median −2 versus −6 on the study\'s score, 18 patients). Over the full four hours the two doses didn\'t differ. The aim is to take the edge off the racing, not to flatten it.'};
  const NC={x:350,y:385},NR={x:175,y:112};seed=7;
  const cells=[];for(let i=0;i<44;i++){const a=R()*TAU,r=Math.sqrt(R());cells.push({x:NC.x+Math.cos(a)*r*NR.x,y:NC.y+Math.sin(a)*r*NR.y,rot:-.45+(R()-.5)*.7,L:22+R()*12,w:4+R()*1.6});}
  const atr=[],ca=Math.cos(-.45),sa=Math.sin(-.45);
  for(let v=-14;v<=14;v++)for(let u=-9;u<=9;u++){const uu=u*124+(v%2?62:0),vv=v*34,px=NC.x+uu*ca-vv*sa,py=NC.y+uu*sa+vv*ca;
    if(px<-160||px>1160||py<-90||py>790)continue;if(((px-NC.x)/NR.x)**2+((py-NC.y)/NR.y)**2<1.3)continue;atr.push({x:px,y:py,d:Math.hypot(px-NC.x,py-NC.y)});}
  for(const c of cells)c.d=Math.hypot(c.x-NC.x,c.y-NC.y);
  const NERVE=[[150,60],[205,140],[250,215],[296,290],[340,350],[392,412],[448,470],[505,540],[560,640]];
  const VAR=NERVE.slice(0,-1).map((p,i)=>[(p[0]+NERVE[i+1][0])/2,(p[1]+NERVE[i+1][1])/2]);
  const CAP=[[120,600],[240,566],[360,596],[470,560],[560,585]];
  const st={ts:0,s:0,dose:'none',hr:83,tc:0,buf:[],acc:0,waves:[],ne:[]};
  const volt=(tc,T)=>{const A=.24;if(tc<.05)return -40+50*Math.sin(tc/.05*Math.PI/2);if(tc<A)return 10-35*(1-Math.cos((tc-.05)/(A-.05)*Math.PI));return -60+20*Math.pow((tc-A)/(T-A),1.25);};
  const flash=d=>{let f=0;for(const w of st.waves)f=Math.max(f,Math.exp(-(((w.r-d)/55)**2)));return f;};
  return {id:'node',label:'Pacemaker',size:'0.5 mm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:200,label:'100 µm'},zoomFocus:{x:350,y:385},
    card(){return `<p class="k">Level 1 · tissue</p><h2>The heart's pacemaker</h2>
      <p>Every heartbeat starts in the sinus node, a patch of slender cells (pink) in the wall of the right atrium, and spreads from there into the muscle around it. These cells never rest: after each beat their voltage creeps back up until it reaches a threshold and fires again (the trace). The steeper the creep, the faster the heart. Noradrenaline from the sympathetic nerve (orange) steepens it, through beta receptors and a messenger inside the cell called cAMP. Together with the vagus easing off, that is how standing up speeds the heart, and the noradrenaline push is the part propranolol blunts.</p>
      <p><b style="color:var(--bone)">Stand the patient up, then compare the doses from the study.</b></p>
      <div class="dv-seg" role="radiogroup" aria-label="Propranolol">${Object.entries(DOSE).map(([k,v])=>`<button role="radio" data-d="${k}" aria-checked="${k===st.dose}">${v}</button>`).join('')}</div>
      <div class="dv-meter"><span>Heart rate</span><b id="pn-hr">—</b></div>
      <div class="dv-meter"><span>Rise from sitting</span><b id="pn-r">+0</b><i><u id="pn-rB"></u></i></div>
      <p id="pn-t"></p>
      <div class="dv-btns"><button class="dv-btn go" id="pn-st" type="button">Stand up</button><button class="dv-btn" id="pn-go" type="button">Zoom into a receptor<small>heart and airway</small></button><button class="dv-btn" id="pn-j" type="button">POTS rhythm game<small>propranolol as one of the tools</small></button></div>
      <p class="dv-fine">Rates are illustrative, set to the group averages two hours after single doses of quick-release tablets in Raj 2009 (placebo against 20 mg in 54 patients, 20 against 80 mg in 18), standing from sitting. That is a gentler test than standing from lying down, where the diagnostic line is a rise of 30 (HRS 2015). The patient's slow-release capsule peaks about 6 hours after a dose and stays fairly level for about 12 (Inderal LA label), so its milligrams can't be compared with the study's. Pacemaker: Boyett 2000, DiFrancesco 2010. The cells are roughly to scale (100 µm bar), but the real node is a crescent about 13.5 mm long (Sánchez-Quintana 2005), shown here shrunk to a few dozen cells. Tap the node and the nerve to collect them.</p>`;},
    bind(card,api){const txt=()=>card.querySelector('#pn-t').textContent=NOTE[st.dose];txt();
      card.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{st.dose=b.dataset.d;card.querySelectorAll('[data-d]').forEach(y=>y.setAttribute('aria-checked',y===b));txt();});
      const sb=card.querySelector('#pn-st');sb.textContent=st.ts?'Sit down':'Stand up';sb.onclick=()=>{st.ts=st.ts?0:1;sb.textContent=st.ts?'Sit down':'Stand up';};
      card.querySelector('#pn-go').onclick=()=>api.go('receptor',{from:NC});card.querySelector('#pn-j').onclick=()=>jump('pots',{level:'rhythm'});},
    tap(p,api){if(p.x>575&&p.y>130&&p.y<540)return;if(near(NERVE,p,24))return api.discover('prop_ne');
      if(((p.x-NC.x)/NR.x)**2+((p.y-NC.y)/NR.y)**2<1.2)return api.discover('prop_sa');if(st.dose!=='none')api.discover('prop_mol');},
    draw(x,dt,t,api){
      st.s=lerp(st.s,st.ts,1-Math.exp(-1.4*dt));const [a,b]=HR[st.dose];st.hr=lerp(st.hr,lerp(a,b,st.s),1-Math.exp(-1.6*dt));
      const T=60/st.hr;st.tc+=dt;if(st.tc>=T){st.tc-=T;st.waves.push({r:0});}
      st.acc+=dt;while(st.acc>=.01){st.acc-=.01;st.buf.push(volt(st.tc,T));if(st.buf.length>280)st.buf.shift();}
      for(const w of st.waves)w.r+=1100*dt;st.waves=st.waves.filter(w=>w.r<1000);
      const drive=.12+.88*st.s;for(const [vx,vy] of VAR)if(Math.random()<drive*dt*2.4)st.ne.push({x:vx,y:vy,vx:rand(-45,45),vy:rand(-45,45),l:1.8});
      for(const n of st.ne){n.x+=n.vx*dt;n.y+=n.vy*dt;n.l-=dt;}st.ne=st.ne.filter(n=>n.l>0);
      x.fillStyle='#120A0F';x.fillRect(-400,-300,1800,1300);
      // atrial muscle: striped bricks the beat spreads into
      for(const c of atr){const f=flash(c.d);x.save();x.translate(c.x,c.y);x.rotate(-.45);x.fillStyle=rgba(P.atr,.12+.26*f);x.strokeStyle=rgba(P.atr,.3+.3*f);x.lineWidth=1.4;x.beginPath();x.roundRect(-56,-13,112,26,11);x.fill();x.stroke();
        x.strokeStyle=rgba(P.atr,.2);x.lineWidth=1;x.beginPath();for(let k=-44;k<=44;k+=11){x.moveTo(k,-9);x.lineTo(k,9);}x.stroke();x.fillStyle='rgba(91,134,255,.55)';x.beginPath();x.ellipse(-4,0,6,3.4,0,0,TAU);x.fill();x.restore();}
      x.strokeStyle=rgba(P.cap,.7);x.lineWidth=11;x.lineCap='round';path(x,CAP);x.stroke();x.strokeStyle='rgba(255,140,150,.35)';x.lineWidth=3;x.stroke();
      x.fillStyle='rgba(213,143,180,.07)';x.beginPath();x.ellipse(NC.x,NC.y,NR.x*1.14,NR.y*1.14,0,0,TAU);x.fill();
      for(const c of cells)spindle(x,c.x,c.y,c.L,c.w,c.rot,flash(c.d*.8));
      if(st.dose!=='none')cells.forEach((c,i)=>{if(st.dose==='low'&&i%3)return;x.fillStyle=P.prop;x.beginPath();x.arc(c.x+Math.cos(c.rot)*c.L*.55,c.y+Math.sin(c.rot)*c.L*.55-c.w,2.4,0,TAU);x.fill();});
      // the sympathetic nerve and its beads, where noradrenaline is let out
      x.strokeStyle=P.ne;x.lineWidth=3.2;path(x,NERVE);x.stroke();x.fillStyle=rgba(P.ne,.55+.45*drive);for(const [vx,vy] of VAR){x.beginPath();x.arc(vx,vy,5.5,0,TAU);x.fill();}
      for(const n of st.ne){x.fillStyle=rgba(P.ne,clamp(n.l/1.8,0,1));x.beginPath();x.arc(n.x,n.y,2.6,0,TAU);x.fill();}
      label(x,'SINUS NODE',NC.x,NC.y-NR.y-22,'center',true);label(x,'SYMPATHETIC NERVE',160,60,'left',true);label(x,'ATRIAL MUSCLE',150,250,'left',true);label(x,'CAPILLARY',380,640,'left',true);
      // the voltage of one pacemaker cell
      const X0=588,X1=856,vy=v=>420-(v+70)/95*250;x.fillStyle='rgba(4,7,11,.84)';x.fillRect(X0-8,150,X1-X0+16,290);x.strokeStyle='rgba(236,230,218,.14)';x.lineWidth=1;x.strokeRect(X0-8,150,X1-X0+16,290);
      label(x,'PACEMAKER CELL VOLTAGE',X0,140);x.strokeStyle='rgba(242,112,95,.75)';x.setLineDash([5,5]);x.beginPath();x.moveTo(X0,vy(-40));x.lineTo(X1,vy(-40));x.stroke();x.setLineDash([]);label(x,'THRESHOLD',X1,vy(-40)-6,'right');
      x.strokeStyle=P.prop;x.lineWidth=2.2;x.lineJoin='round';x.beginPath();st.buf.forEach((v,i)=>{const px=X0+i*(X1-X0)/279;i?x.lineTo(px,vy(v)):x.moveTo(px,vy(v));});x.stroke();label(x,'SLOW RISE',X0,432);
      x.fillStyle='rgba(236,230,218,.92)';x.font='30px "Martian Mono", monospace';x.textAlign='left';const hs=String(Math.round(st.hr));x.fillText(hs,X0,488);const hw=x.measureText(hs).width;label(x,'BPM',X0+hw+8,488);
      label(x,(st.s>.5?'STANDING · ':'SITTING · ')+DOSE[st.dose].toUpperCase(),X0,512);
      const q=s=>api.card.querySelector(s);if(q('#pn-hr')){q('#pn-hr').textContent=Math.round(st.hr)+' bpm';const rise=Math.max(0,Math.round(st.hr-a));q('#pn-r').textContent='+'+rise;q('#pn-rB').style.width=clamp(rise/40*100,0,100)+'%';}
    },
  };
}

/* ---------------- level B: the receptors */
function receptorLevel(){
  const Y0=336,Y1=392,MID=510;
  const SPEC=[[150,'b1'],[215,'gcg'],[280,'b1'],[345,'b1'],[410,'gcg'],[475,'b1'],[565,'b2'],[655,'b2'],[745,'b2'],[835,'b2']];
  const COL={b1:P.b1,b2:P.b2,gcg:P.glu};
  const EV={stand:'Standing: the heart\'s sympathetic nerves release noradrenaline. With propranolol in the seats, fewer beta-1 receptors catch it, so the rate climbs less. That is what the patient takes it for.',
    sugar:'Low blood sugar: the body releases adrenaline, and a racing heart is one of the early warnings. Propranolol can mute that warning, and it can also make low sugar more likely and longer-lasting. That is why its label flags fasting, not eating regularly or vomiting.',
    epi:'Epinephrine is adrenaline itself, in a big dose. Because propranolol competes rather than locks, epinephrine wins some receptors back, but fewer than usual. The label warns that people on beta blockers with a history of severe allergic reactions may react more strongly to a repeat exposure and may not respond to the usual doses of epinephrine, and that on long-term propranolol epinephrine can push blood pressure up sharply. Epinephrine still comes first and straight away, and the team needs to hear that she takes propranolol.',
    glu:'Glucagon (green) uses its own receptor, which raises cAMP in heart muscle without going through beta-1: a side door around the blocked one. It is the emergency team\'s backup when epinephrine isn\'t enough in someone on a beta blocker, though the evidence for it is very limited.'};
  let S;
  function reset(){S={on:false,prop:0,boost:[0,0],G:0,camp:[0,0],rec:SPEC.map(([x,k])=>({x,k,side:x>MID?1:0,st:0,act:0})),free:[],cd:[],beat:0,lum:.3};}
  reset();
  const A=i=>.3+S.boost[i];
  function sync(k,side,n){const have=S.free.filter(f=>f.k===k&&f.side===side&&!f.out);
    for(let i=have.length;i<n;i++)S.free.push({k,side,x:side?rand(540,860):rand(140,490),y:rand(60,300),vx:rand(-30,30),vy:rand(-30,30),rot:rand(0,TAU),vr:rand(-1,1),a:0,out:false});
    for(let i=n;i<have.length;i++)have[i].out=true;}
  function step(dt){
    S.prop=lerp(S.prop,S.on?1:0,1-Math.exp(-1.2*dt));for(let i=0;i<2;i++)S.boost[i]*=Math.exp(-dt/6);S.G*=Math.exp(-dt/9);
    let a1=0,a2=0,ag=0;
    // competitive binding: an empty seat takes whichever molecule arrives first, in proportion to how much of each is around
    for(const r of S.rec){const u=Math.random();
      if(r.k==='gcg'){if(r.st===0&&u<2.2*S.G*dt)r.st=3;else if(r.st===3&&u<.7*dt)r.st=0;}
      else{const ka=1.5*A(r.side)*dt,kp=3*S.prop*dt;if(r.st===0){if(u<ka)r.st=1;else if(u<ka+kp)r.st=2;}else if(r.st===1&&u<1.2*dt)r.st=0;else if(r.st===2&&u<.5*dt)r.st=0;}
      const on=r.st===1||r.st===3;r.act=lerp(r.act,on?1:0,1-Math.exp(-5*dt));
      if(on&&Math.random()<dt*6)S.cd.push({x:r.x+rand(-14,14),y:Y1+14,vx:rand(-30,30),vy:rand(40,90),l:1.6});
      if(r.k==='b1')a1+=r.act;else if(r.k==='b2')a2+=r.act;else ag+=r.act;}
    S.camp[0]=lerp(S.camp[0],clamp((a1+1.5*ag)/4,0,1),1-Math.exp(-1.5*dt));S.camp[1]=lerp(S.camp[1],clamp(a2/4,0,1),1-Math.exp(-1.5*dt));
    for(let i=0;i<2;i++){sync('a',i,Math.min(18,Math.round(4*A(i))));sync('p',i,Math.round(11*S.prop));}sync('g',0,Math.round(7*S.G));
    for(const f of S.free){f.vx=(f.vx+rand(-60,60)*dt)*.98;f.vy=(f.vy+rand(-60,60)*dt)*.98;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt;
      const x0=f.side?540:140,x1=f.side?862:490;if(f.x<x0){f.x=x0;f.vx=Math.abs(f.vx);}if(f.x>x1){f.x=x1;f.vx=-Math.abs(f.vx);}if(f.y<62){f.y=62;f.vy=Math.abs(f.vy);}if(f.y>298){f.y=298;f.vy=-Math.abs(f.vy);}
      f.a=clamp(f.a+(f.out?-2:2)*dt,0,1);}
    S.free=S.free.filter(f=>!(f.out&&f.a<=0));
    for(const c of S.cd){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy*=.97;c.l-=dt;}S.cd=S.cd.filter(c=>c.l>0);
    S.beat+=dt*(.9+1.5*S.camp[0]);S.lum=lerp(S.lum,S.camp[1],1-Math.exp(-1.2*dt));}
  function ev(api,k){const n=api.card.querySelector('#rp-n');n.hidden=false;n.textContent=EV[k];
    if(k==='stand')S.boost[0]=Math.max(S.boost[0],1.4);if(k==='sugar')S.boost=S.boost.map(b=>Math.max(b,1.6));if(k==='epi')S.boost=[5,5];if(k==='glu')S.G=1.2;}
  return {id:'receptor',label:'Receptor',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic'},zoomFocus:{x:300,y:360},
    card(){return `<p class="k">Level 2 · molecules</p><h2>Two receptors, one blocker</h2>
      <p>Noradrenaline and adrenaline (orange) work through beta receptors. On heart cells these are mostly beta-1: the cell makes more cAMP (yellow) and the heart beats faster and harder. On the muscle around the airways they are beta-2: switched on, they relax that muscle and the airway opens. Propranolol (pink) is non-selective. It sits in both kinds and competes with whatever arrives.</p>
      <p><b style="color:var(--bone)">Switch propranolol on, then try each event.</b></p>
      <div class="dv-meter"><span>Beta receptors blocked</span><b id="rp-b">0%</b><i><u id="rp-bB" style="background:${cc(P.prop)}"></u></i></div>
      <div class="dv-meter"><span>Heart cell: cAMP (rate, squeeze)</span><b id="rp-h">0%</b><i><u id="rp-hB" style="background:${cc(P.b1)}"></u></i></div>
      <div class="dv-meter"><span>Airway muscle: relaxing signal</span><b id="rp-a">0%</b><i><u id="rp-aB" style="background:${cc(P.b2)}"></u></i></div>
      <div class="dv-btns"><button class="dv-btn" id="rp-p" type="button" aria-pressed="false">Propranolol<small>off</small></button></div>
      <div class="dv-btns"><button class="dv-btn" id="rp-st" type="button">Stand up</button><button class="dv-btn" id="rp-su" type="button">Low blood sugar</button><button class="dv-btn" id="rp-ep" type="button">Severe allergic reaction<small>epinephrine</small></button><button class="dv-btn" id="rp-gl" type="button">Glucagon<small>the emergency backup</small></button></div>
      <p id="rp-n" hidden></p>
      <p class="dv-fine">Schematic, with the molecules drawn large; amounts and timings are illustrative. Propranolol competes with beta agonists for the receptor sites, and its label lists bronchial asthma as a contraindication because it blocks the airways' beta response (Inderal LA label). Heart mainly beta-1, airways beta-2 (Baker 2005). Glucagon raises cAMP in heart muscle without beta-1 (White 1999); in anaphylaxis it is a backup with very limited evidence (WAO 2020). Tap receptors and molecules to collect them.</p>`;},
    bind(card,api){const pb=card.querySelector('#rp-p');const sync=()=>{pb.classList.toggle('on',S.on);pb.setAttribute('aria-pressed',S.on);pb.querySelector('small').textContent=S.on?'on: in both kinds of receptor':'off';};sync();
      pb.onclick=()=>{S.on=!S.on;sync();if(S.on)api.discover('prop_mol',true);};
      card.querySelector('#rp-st').onclick=()=>ev(api,'stand');card.querySelector('#rp-su').onclick=()=>ev(api,'sugar');card.querySelector('#rp-ep').onclick=()=>ev(api,'epi');card.querySelector('#rp-gl').onclick=()=>ev(api,'glu');},
    tap(p,api){let best=null,bd=26;for(const f of S.free){const d=Math.hypot(f.x-p.x,f.y-p.y);if(d<bd){bd=d;best=f;}}
      if(best)return api.discover(best.k==='a'?'prop_ne':best.k==='p'?'prop_mol':'prop_glu');
      for(const r of S.rec)if(Math.abs(p.x-r.x)<30&&p.y>Y0-50&&p.y<Y1+30)return api.discover(r.k==='b1'?'prop_b1':r.k==='b2'?'prop_b2':'prop_glu');},
    draw(x,dt,t,api){step(dt);
      x.fillStyle='#090D12';x.fillRect(-400,-300,1800,1300);
      x.fillStyle='rgba(238,111,130,.05)';x.fillRect(-400,-300,MID+400,1300);x.fillStyle='rgba(98,190,211,.05)';x.fillRect(MID,-300,900,1300);
      x.fillStyle='rgba(238,111,130,.07)';x.fillRect(-400,Y1,MID+396,800);x.fillStyle='rgba(98,190,211,.07)';x.fillRect(MID+4,Y1,900,800);
      membrane(x,-400,MID-4,Y0,Y1,'#2A1820');membrane(x,MID+4,1400,Y0,Y1,'#142A2E');
      x.strokeStyle='rgba(236,230,218,.18)';x.lineWidth=1;x.setLineDash([5,6]);x.beginPath();x.moveTo(MID,20);x.lineTo(MID,690);x.stroke();x.setLineDash([]);
      for(const c of S.cd){x.fillStyle=rgba(P.camp,clamp(c.l/1.6,0,1));x.beginPath();x.arc(c.x,c.y,3.2,0,TAU);x.fill();}
      for(const r of S.rec){gpcr(x,r.x,Y0,Y1,COL[r.k],r.act);if(r.st===1)catG(x,r.x,Y0-20,.95,-Math.PI/2);else if(r.st===2)propG(x,r.x,Y0-20,.8,-Math.PI/2);else if(r.st===3)glucG(x,r.x,Y0-20,.8,t);}
      for(const f of S.free){x.save();x.globalAlpha*=f.a;if(f.k==='a')catG(x,f.x,f.y,.8,f.rot);else if(f.k==='p')propG(x,f.x,f.y,.7,f.rot);else glucG(x,f.x,f.y,.75,t+f.rot);x.restore();}
      // what the cAMP does: the beat, and the airway's width
      const pulse=Math.pow(Math.max(0,Math.sin(S.beat*Math.PI)),6);x.fillStyle=rgba(P.prop,.75);heart(x,300,548,38*(1+.16*pulse));
      const lr=12+28*S.lum;x.fillStyle=rgba(P.b2,.28);x.strokeStyle=rgba(P.b2,.8);x.lineWidth=2;x.beginPath();x.arc(700,548,58,0,TAU);x.fill();x.stroke();
      x.fillStyle='#090D12';x.beginPath();x.arc(700,548,lr,0,TAU);x.fill();x.strokeStyle=rgba(P.b2,.55);x.lineWidth=1.5;x.beginPath();x.arc(700,548,lr+4,0,TAU);x.stroke();
      label(x,'HEART CELL · β1 AND GLUCAGON RECEPTORS',140,44);label(x,'AIRWAY MUSCLE · β2',540,44);label(x,'INSIDE · cAMP',140,600);label(x,'INSIDE · SIGNAL',540,600);
      label(x,'BEAT',300,626,'center');label(x,'AIRWAY',700,626,'center');
      const q=s=>api.card.querySelector(s);if(q('#rp-b')){const bl=S.rec.filter(r=>r.st===2).length/8;q('#rp-b').textContent=Math.round(bl*100)+'%';q('#rp-bB').style.width=bl*100+'%';
        q('#rp-h').textContent=Math.round(S.camp[0]*100)+'%';q('#rp-hB').style.width=S.camp[0]*100+'%';q('#rp-a').textContent=Math.round(S.camp[1]*100)+'%';q('#rp-aB').style.width=S.camp[1]*100+'%';}
    },
  };
}

export const DIVE={color:'#EE6F82',top:{label:'Heart',size:'10 cm'},
  target:({centreOf,V3})=>centreOf(['Wall of heart']).add(V3(-.025,.03,0)),view:{dist:.2,azim:-30,elev:8},
  text:'Into the patient\'s heart, to the sinus node where every beat starts: see how standing speeds it and how propranolol takes the edge off. Then down to the beta receptors themselves, in the heart and the airways, and what that means in a severe allergic reaction.',
  steps:[['Pacemaker, 0.5 mm.','The cells that set the pace. Stand the patient up and compare no propranolol with the low and high doses of a 2009 study.'],['Receptor, 10 nm.','Beta-1 and beta-2 receptors with propranolol in them. Try standing, low blood sugar, epinephrine and glucagon.']],
  also:[{dive:'pots',level:'rhythm',label:'POTS dive · the rhythm game',small:'propranolol is one of the tools'},{dive:'pots',level:'circuit',label:'POTS dive · the standing reflex',small:'where the racing comes from'}],
  refs:['lbl_prop','raj2009','hrs2015','wao2020','difrancesco2010','boyett2000','sanchez2005','baker2005','white1999'],
  make:({jump})=>({levels:[nodeLevel(jump),receptorLevel()],guide:GUIDE}),
};
