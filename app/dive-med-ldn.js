// Low-dose naltrexone dive: the pain relay in the spinal cord (the microglia hypothesis and what two trials found) → the opioid
// receptors it surely blocks, hour by hour after a dose. Mechanisms other than the opioid block are labelled as hypotheses throughout.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba, nucleus } from './dive-ra.js';
import { cc } from './theme.js';

const C={mg:'#C08CFF',tlr:'#FF9F43',ntx:'#B193E3',end:'#7FD3A3',opi:'#F29A55',mor:'#8FA3C8',on:'#FFE36E',nerve:'#D9B45A',relay:'#71C6FF',cyt:'#FF6FA8',sleep:'#4A4AA0'};
const LBL='rgba(236,230,218,.55)';
function txt(x,t,px,py,k=1,al='left',col=LBL){x.fillStyle=col;x.font=`${Math.round(11*k)}px "Martian Mono", monospace`;x.textAlign=al;x.fillText(t,px,py);}
const tk=api=>Math.max(1,9/(11*api.fit().s));  // canvas lettering stays ≥ 9 screen px on a phone
const hhmm=h=>{const m=Math.round(((h%24)+24)%24*60);return `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;};

// a microglia: small body, branches that keep moving at rest; switched on it pulls them in and swells (Kettenmann 2011)
function microglia(x,cx,cy,s,t,act,seed=1){x.save();x.translate(cx,cy);x.scale(s,s);const L=1-act*.72;
  x.strokeStyle=rgba(C.mg,.85);x.lineCap='round';
  for(let i=0;i<6;i++){const a=i/6*TAU+seed+Math.sin(t*.5+i*1.7+seed)*.18*L,len=(46+((i*37+seed*13)%22))*L;
    const ex=Math.cos(a)*len,ey=Math.sin(a)*len;x.lineWidth=3.2+act*2;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(Math.cos(a+.3)*len*.5,Math.sin(a+.3)*len*.5,ex,ey);x.stroke();
    if(L>.4)for(const sg of [-1,1]){const b=a+sg*.6+Math.sin(t*.7+i+sg)*.2;x.lineWidth=1.6;x.beginPath();x.moveTo(ex*.6,ey*.6);x.lineTo(ex*.6+Math.cos(b)*len*.38,ey*.6+Math.sin(b)*len*.38);x.stroke();}}
  x.fillStyle=rgba(C.mg,.28+act*.25);x.beginPath();x.ellipse(0,0,13+act*6,10+act*6,seed,0,TAU);x.fill();x.strokeStyle=C.mg;x.lineWidth=2;x.stroke();
  nucleus(x,0,0,7+act*2,5+act*2,seed);x.restore();}
function tlr4(x,px,py,a,s=1,col=C.tlr){x.save();x.translate(px,py);x.rotate(a);x.scale(s,s);x.strokeStyle=col;x.lineWidth=3;x.beginPath();x.arc(-4,-6,5,Math.PI*.5,Math.PI*1.5);x.moveTo(4,-11);x.arc(4,-6,5,-Math.PI*.5,Math.PI*.5);x.stroke();x.restore();}
function receptor(x,px,py,s,col,lit=0){x.save();x.translate(px,py);x.scale(s,s);if(lit>0){x.save();x.globalCompositeOperation='lighter';glow(x,0,-6,46*lit,rgba(C.on,.55));x.restore();}
  x.fillStyle=rgba(col,.85);for(let i=0;i<7;i++){x.beginPath();x.roundRect(-24+i*7,-26+(i%2)*3,6,52,3);x.fill();}
  x.strokeStyle=col;x.lineWidth=2;x.beginPath();x.arc(0,-30,10,Math.PI*.1,Math.PI*.9,true);x.stroke();x.restore();}
const molNtx=(x,px,py,s=1)=>{x.fillStyle=C.ntx;x.beginPath();x.arc(px-4*s,py,4.6*s,0,TAU);x.arc(px+4*s,py,4.6*s,0,TAU);x.fill();};
const molEnd=(x,px,py,s=1,a=0)=>{x.fillStyle=C.end;for(let i=0;i<5;i++){x.beginPath();x.arc(px+Math.cos(a)*(i-2)*5*s,py+Math.sin(a)*(i-2)*5*s+Math.sin(i*1.3)*2*s,2.8*s,0,TAU);x.fill();}};
const molOpi=(x,px,py,s=1)=>{x.fillStyle=C.opi;x.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;x.lineTo(px+Math.cos(a)*6*s,py+Math.sin(a)*6*s);}x.closePath();x.fill();};

export const GUIDE_L={
  ldn_mg:{name:'Microglia',kind:'Cell · the nervous system\'s immune cell',size:'micrometres',draw:(x,cx,cy,s,t)=>microglia(x,cx,cy,s*1.5,t||0,0,1),
    text:['The resident immune cells of the brain and spinal cord. At rest they are branched, and the branches keep moving, checking their patch (Kettenmann 2011).','When they sense injury they switch on: they change shape, multiply and release signals that can help or harm the cells around them (Kettenmann 2011). In animal models of nerve-injury pain, switched-on microglia in the spinal cord help keep the pain going (Inoue 2018).']},
  ldn_tlr4:{name:'TLR4',kind:'Receptor · an alarm sensor',size:'nanometres',draw:(x,cx,cy,s)=>tlr4(x,cx,cy+18*s,0,s*4.5),
    text:['Toll-like receptor 4, an alarm sensor on immune cells, microglia among them (Younger 2014).','In rats with a nerve injury, TLR4 blockers given into the spinal fluid eased established pain, and naloxone and naltrexone turned out to block TLR4 too, even in mirror-image forms that don\'t touch opioid receptors (Hutchinson 2008). That is the root of the microglia explanation for LDN in chronic pain, though the data don\'t fit it perfectly (Younger 2014).']},
  ldn_mor:{name:'μ-opioid receptor',kind:'Receptor',size:'nanometres',draw:(x,cx,cy,s)=>receptor(x,cx,cy+20*s,s*2,C.mor,.6),
    text:['The receptor that opioid painkillers and the body\'s own endorphins act on; β-endorphin acting here is part of the body\'s own pain control (Younger 2014).','Naltrexone sits in the same pocket without switching it on, which blocks it. At usual doses it blocks μ receptors almost completely, κ receptors strongly and δ receptors little (Trøstheim 2023).']},
  ldn_ntx:{name:'Naltrexone',kind:'Medicine · small molecule',size:'under 1 nm',draw:(x,cx,cy,s)=>molNtx(x,cx,cy,s*5),
    text:['A pure opioid blocker: it fits opioid receptors without switching them on and competes with opioids for the same spot (label). The approved dose, 50 mg, blocks an opioid\'s effects for as long as 24 hours.','Low-dose naltrexone, usually 4.5 mg, is used off-label and made up mainly by compounding pharmacies (Gouda 2026). It peaks within an hour; its half-life is about 4 hours, and its breakdown product 6-β-naltrexol, which also blocks, has a half-life of about 13 hours (label). In brain scans the block outlasts both: 50 mg kept over 90% of μ receptors filled for about two days (Lee 1988, via Trøstheim 2023).']},
  ldn_end:{name:'Endorphins',kind:'The body\'s own opioids',size:'a small peptide, nanometres',draw:(x,cx,cy,s)=>molEnd(x,cx,cy,s*4.5,.3),
    text:['Peptides the body makes that act on the same receptors as opioid painkillers (Younger 2014).','The "rebound" idea for LDN: a few hours of block each night might lead the body to make more endorphins and more receptors. Rat studies showed that kind of rise after a short block (Younger 2014); whether it happens, or helps, in people is unproven (Gouda 2026).']},
  ldn_opi:{name:'Opioid painkillers',kind:'Medicines',size:'under 1 nm',draw:(x,cx,cy,s)=>molOpi(x,cx,cy,s*5),
    text:['Morphine, oxycodone and the other opioid painkillers act on opioid receptors. While naltrexone holds them, opioids work less well; because the two compete for the same spot, the block is potentially surmountable (label), which is the treating team\'s call.','That is why the app says to tell every surgical, dental or ER team about LDN: pain can still be treated, the team just needs to plan for it. Guidelines say to stop naltrexone before planned surgery whatever the dose, though none was built on a systematic review of the evidence and none was written for low-dose use in chronic pain (Goel 2024).']},
};

/* ---------------- level A: the pain relay in the spinal cord */
function hornLevel(){
  const FIB=[[150,640],[240,560],[330,480],[420,430],[492,404]],AX=[[600,318],[650,250],[720,190],[800,140],[880,96]],SOMA={x:572,y:352};
  const MG=[{x:280,y:255,s:1.45,sd:1},{x:770,y:450,s:1.45,sd:2.4},{x:400,y:560,s:1.3,sd:4.1},{x:470,y:150,s:1.25,sd:5.3}];
  const TR={final:{l:'FINAL 2024 · 6 mg',ldn:-1.3,pl:-.9,t:'99 women with fibromyalgia, 12 weeks, pain on a 0–10 scale. The difference, −0.34 points (95% CI −0.95 to 0.27), was not significant: LDN was not shown to be better than placebo (FINAL 2024). Side effects were about as common on placebo.'},
    innova:{l:'INNOVA 2026 · 4.5 mg',ldn:-.33,pl:-.64,t:'98 women with fibromyalgia, followed for 12 months; pain at 3 months on a 0–10 scale. No clinically meaningful benefit over placebo at 3 months or later (INNOVA 2026). Both trials were in fibromyalgia, not hEDS.'}};
  const S={mode:'rest',ldn:false,act:0,pulses:[],outs:[],cyt:[],drug:[],tick:.3,gain:1,trial:'final'};
  const along=(P,u)=>{const n=P.length-1,f=clamp(u,0,.9999)*n,i=Math.floor(f),g=f-i;return [lerp(P[i][0],P[i+1][0],g),lerp(P[i][1],P[i+1][1],g)];};
  const target=()=>S.mode==='on'?(S.ldn?.5:1):0;
  function draw(x,dt,t,api){const k=tk(api);
    S.act=lerp(S.act,target(),1-Math.exp(-dt*.9));S.gain=1+1.6*S.act;
    S.tick-=dt;if(S.tick<=0){S.tick=1.1;S.pulses.push({u:0});}
    for(const p of S.pulses){p.u+=dt/1.3;if(p.u>=1&&!p.done){p.done=true;let n=Math.floor(S.gain);if(Math.random()<S.gain-n)n++;for(let i=0;i<n;i++)S.outs.push({u:-i*.12});}}
    S.pulses=S.pulses.filter(p=>!p.done);for(const o of S.outs)o.u+=dt/1.1;S.outs=S.outs.filter(o=>o.u<1);
    if(S.act>.25)for(const m of MG)if(Math.random()<dt*S.act*2.2)S.cyt.push({x:m.x,y:m.y,tx:SOMA.x+rand(-60,40),ty:SOMA.y+rand(10,70),l:2.4});
    for(const c of S.cyt){c.x=lerp(c.x,c.tx,dt*.8);c.y=lerp(c.y,c.ty,dt*.8);c.l-=dt;}S.cyt=S.cyt.filter(c=>c.l>0);
    if(S.ldn&&S.drug.length<18&&Math.random()<dt*6){const m=MG[Math.floor(rand(0,MG.length))],a=rand(0,TAU);S.drug.push({m,a,x:m.x+Math.cos(a)*140,y:m.y+Math.sin(a)*140,on:0});}
    if(!S.ldn)S.drug=S.drug.filter(d=>(d.on-=dt*2)>-1);
    for(const d of S.drug){const tx=d.m.x+Math.cos(d.a)*20*d.m.s,ty=d.m.y+Math.sin(d.a)*20*d.m.s;d.x=lerp(d.x,tx,dt*1.5);d.y=lerp(d.y,ty,dt*1.5);}
    x.fillStyle='#0C0A14';x.fillRect(-400,-300,1800,1300);
    x.strokeStyle='rgba(200,180,230,.06)';x.lineWidth=2;for(let i=0;i<90;i++){const sx=(i*151)%1200-100,sy=(i*83)%800-40;x.beginPath();x.moveTo(sx,sy);x.bezierCurveTo(sx+30,sy-14,sx+60,sy+14,sx+96,sy);x.stroke();}
    // the incoming pain fibre and the relay neuron
    const path=(P,col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();P.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();};
    path([[-200,760],...FIB],rgba(C.nerve,.8),6);x.fillStyle=C.nerve;x.beginPath();x.arc(500,400,13,0,TAU);x.fill();
    path([[SOMA.x,SOMA.y],...AX,[1200,-60]],rgba(C.relay,.8),6);
    for(const [a,b] of [[-.4,90],[.9,80],[2.2,70],[3.6,85]]){x.strokeStyle=rgba(C.relay,.6);x.lineWidth=4;x.beginPath();x.moveTo(SOMA.x,SOMA.y);x.lineTo(SOMA.x+Math.cos(a)*b,SOMA.y+Math.sin(a)*b);x.stroke();}
    x.fillStyle=rgba(C.relay,.3);x.beginPath();x.arc(SOMA.x,SOMA.y,34,0,TAU);x.fill();x.strokeStyle=C.relay;x.lineWidth=2.5;x.stroke();nucleus(x,SOMA.x,SOMA.y,14,12);
    for(const p of S.pulses){const [px,py]=along(FIB,p.u);x.save();x.globalCompositeOperation='lighter';glow(x,px,py,22,rgba(C.on,.8));x.restore();x.fillStyle=C.on;x.beginPath();x.arc(px,py,4,0,TAU);x.fill();}
    for(const o of S.outs){if(o.u<0)continue;const [px,py]=along(AX,o.u);x.save();x.globalCompositeOperation='lighter';glow(x,px,py,20,rgba(C.on,.8));x.restore();x.fillStyle=C.on;x.beginPath();x.arc(px,py,4,0,TAU);x.fill();}
    for(const m of MG){microglia(x,m.x,m.y,m.s,t,S.act,m.sd);for(let i=0;i<3;i++){const a=m.sd+i*2.1;tlr4(x,m.x+Math.cos(a)*(14+S.act*6)*m.s,m.y+Math.sin(a)*(14+S.act*6)*m.s,a+Math.PI/2,.8);}}
    x.fillStyle=C.cyt;for(const c of S.cyt){x.globalAlpha=clamp(c.l,0,1);x.beginPath();x.arc(c.x,c.y,3,0,TAU);x.fill();}x.globalAlpha=1;
    for(const d of S.drug){x.globalAlpha=clamp(1+d.on,0,1);molNtx(x,d.x,d.y,.8);}x.globalAlpha=1;
    txt(x,'PAIN FIBRE FROM THE BODY',182,668,k);txt(x,'RELAY NEURON',SOMA.x+46,SOMA.y+8,k);txt(x,'TO THE BRAIN',838,70,k,'right');txt(x,'MICROGLIA',280,255+92+8*k,k,'center');
    if(S.ldn)txt(x,'LDN AT TLR4 · HYPOTHESIS',838,560,k,'right',rgba(C.ntx,.9));
    const q=s=>api.card.querySelector(s);if(q('#lh-g')){q('#lh-g').textContent='×'+S.gain.toFixed(1);q('#lh-gB').style.width=S.gain/2.6*100+'%';
      q('#lh-m').textContent=S.act<.15?'resting':S.mode==='on'&&S.ldn?'partly calmed (hypothesis)':S.mode==='on'?'switched on':'settling';}
  }
  function trial(card){const T=TR[S.trial];card.querySelector('#lh-tl').textContent=T.ldn.toFixed(2).replace(/0$/,'').replace('-','−')+' points';card.querySelector('#lh-tp').textContent=T.pl.toFixed(2).replace(/0$/,'').replace('-','−')+' points';
    card.querySelector('#lh-tlB').style.width=Math.abs(T.ldn)/2*100+'%';card.querySelector('#lh-tpB').style.width=Math.abs(T.pl)/2*100+'%';card.querySelector('#lh-tt').textContent=T.t;
    card.querySelectorAll('[data-tr]').forEach(b=>b.setAttribute('aria-checked',b.dataset.tr===S.trial));}
  return {id:'horn',label:'Spinal cord',size:'100 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic'},zoomFocus:{x:572,y:352},
    card(){return `<p class="k">Level 1 · the spinal cord</p><h2>The pain relay</h2>
      <p>Pain signals from the body pass to a relay neuron here, in the back of the spinal cord, which carries them up to the brain. Around them sit microglia, the nervous system's own immune cells; at rest their branches keep moving, checking their patch (Kettenmann 2011).</p>
      <p>Naltrexone's sure job is blocking opioid receptors (next level). One reason it is tried in small doses for chronic pain is a hypothesis about these cells: that it calms switched-on microglia through an alarm sensor called TLR4 (Younger 2014). <b style="color:var(--bone)">Switch the microglia on, then try the idea.</b></p>
      <div class="dv-seg" role="radiogroup" aria-label="Microglia"><button role="radio" data-mg="rest" aria-checked="true">Resting</button><button role="radio" data-mg="on" aria-checked="false">Switched on</button></div>
      <div class="dv-btns"><button class="dv-btn" id="lh-ldn" type="button">Low-dose naltrexone<small>the TLR4 idea, a hypothesis</small></button></div>
      <div class="dv-meter"><span>Signal passed up (illustrative)</span><b id="lh-g">×1.0</b><i><u id="lh-gB" style="background:${cc(C.on)}"></u></i></div>
      <div class="dv-meter"><span>Microglia</span><b id="lh-m">resting</b></div>
      <p class="sub">What the trials found</p>
      <div class="dv-seg" role="radiogroup" aria-label="Trial"><button role="radio" data-tr="final" aria-checked="true">${TR.final.l}</button><button role="radio" data-tr="innova" aria-checked="false">${TR.innova.l}</button></div>
      <div class="dv-meter"><span>Pain change on LDN</span><b id="lh-tl"></b><i><u id="lh-tlB" style="background:${cc(C.ntx)}"></u></i></div>
      <div class="dv-meter"><span>Pain change on placebo</span><b id="lh-tp"></b><i><u id="lh-tpB" style="background:${cc('#8FA3A6')}"></u></i></div>
      <p id="lh-tt" class="dv-fine" style="color:var(--bone-2)!important"></p>
      <div class="dv-btns"><button class="dv-btn" id="lh-go" type="button">Zoom into the receptors<small>what it surely does</small></button></div>
      <p class="dv-fine">Schematic; the amplification is illustrative, drawn to show the hypothesis, not measured. In rats with a nerve injury, single injections of TLR4 blockers into the spinal fluid, including mirror-image naloxone and naltrexone, eased established pain, and a four-day naloxone infusion reversed it and calmed the microglia (Hutchinson 2008); in animal models switched-on microglia help keep nerve-injury pain going (Inoue 2018). Whether a 4.5 mg tablet does anything like this in people is unproven; a 2026 review calls the proposed mechanisms largely theoretical (Gouda 2026). Tap the cells to collect them.</p>`;},
    bind(card,api){trial(card);
      card.querySelectorAll('[data-mg]').forEach(b=>b.onclick=()=>{S.mode=b.dataset.mg;card.querySelectorAll('[data-mg]').forEach(y=>y.setAttribute('aria-checked',y===b));});
      const l=card.querySelector('#lh-ldn');l.onclick=()=>{S.ldn=!S.ldn;l.classList.toggle('on',S.ldn);if(S.ldn)api.discover('ldn_tlr4',true);};
      card.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{S.trial=b.dataset.tr;trial(card);});
      card.querySelector('#lh-go').onclick=()=>api.go('receptor',{from:SOMA});},
    tap(p,api){for(const m of MG)for(let i=0;i<3;i++){const a=m.sd+i*2.1,r=(14+S.act*6)*m.s;if(Math.hypot(p.x-m.x-Math.cos(a)*r,p.y-m.y-Math.sin(a)*r)<10)return api.discover('ldn_tlr4');}
      for(const m of MG)if(Math.hypot(p.x-m.x,p.y-m.y)<70*m.s)return api.discover('ldn_mg');
      if(S.drug.some(d=>Math.hypot(d.x-p.x,d.y-p.y)<20))return api.discover('ldn_ntx');
      if(Math.hypot(p.x-SOMA.x,p.y-SOMA.y)<60)return api.discover('ldn_mor');},
    draw,
  };
}

/* ---------------- level B: opioid receptors over a day */
// Share of μ receptors held. Heights from PET (Trøstheim 2023): within 8 h, 4.5 mg ≈ 45% (ED50 5.59 mg; Rabiner 2011), 50 mg > 90%
// for ~2 days (Lee 1988). How the low dose's block fades is unmeasured: a sketch, holding ~6 h (the 6–8 h LDN's supporters propose) then halving every 6 h.
const held=(h,d)=>h<=0?0:(1-Math.exp(-3*h))*(d==='std'?.96*(1-.0012*h):.45*Math.pow(.5,Math.max(0,h-6)/6));
function receptorLevel(){
  const MEM=455,DY=MEM-46,RX=Array.from({length:10},(_,i)=>170+i*73.3),EXTRA=[2,7];
  const S={h:0,play:true,dose:'low',at:'bed',reb:false,rec:RX.map((x,i)=>({x,st:'free',t:0,lit:0,show:EXTRA.includes(i)?0:1})),mols:[],eTry:1,eHit:1,eT:.5,given:0,docked:0,puffs:[]};
  const doseHr=()=>S.at==='bed'?22:8;
  const live=()=>S.rec.filter(r=>r.show>.5);
  const rebound=()=>S.reb&&S.h>8;
  function spawn(kind,r){const tx=r?r.x:rand(170,830);S.mols.push({kind,r,x:tx+rand(-160,160),y:kind==='opi'?rand(150,230):rand(190,260),t:0,dead:false,vx:0,vy:0});}
  function step(dt){
    if(S.play){S.h+=dt*.6;if(S.h>=24){S.h=0;for(const r of S.rec)if(r.st==='ntx'){r.st='free';}}}
    for(const [i,j] of EXTRA.entries()){const r=S.rec[j];r.show=lerp(r.show,rebound()?1:0,1-Math.exp(-dt*1.5));if(r.show<.5&&r.st!=='free')r.st='free';}
    const L=live(),want=Math.round(held(S.h,S.dose)*L.length),have=L.filter(r=>r.st==='ntx').length+S.mols.filter(m=>m.kind==='ntx'&&!m.dead&&!m.leave).length;
    if(have<want){const free=L.filter(r=>r.st==='free'&&!S.mols.some(m=>m.r===r&&!m.dead));if(free.length){const r=free[Math.floor(rand(0,free.length))];r.st='claim';spawn('ntx',r);}}
    else if(have>want){const hr=L.filter(r=>r.st==='ntx');if(hr.length){const r=hr[Math.floor(rand(0,hr.length))];r.st='free';S.mols.push({kind:'ntx',x:r.x,y:DY,leave:true,t:0,vx:rand(-30,30),vy:-60});}}
    S.eT-=dt;if(S.eT<=0){S.eT=rebound()?.55:.9;const c=L[Math.floor(rand(0,L.length))];if(c)spawn('end',c);}
    for(const m of S.mols){m.t+=dt;
      if(m.leave){m.x+=m.vx*dt;m.y+=m.vy*dt;if(m.t>2)m.dead=true;continue;}
      if(m.bounce){m.x+=m.vx*dt;m.y+=m.vy*dt;if(m.t>1.6)m.dead=true;continue;}
      const tx=m.r.x,ty=DY,sp=m.kind==='ntx'?3.5:2.2;m.x=lerp(m.x,tx,dt*sp);m.y=lerp(m.y,ty,dt*sp);
      if(Math.hypot(m.x-tx,m.y-ty)<5){const r=m.r;
        if(m.kind==='ntx'){r.st='ntx';m.dead=true;}
        else if(r.st==='free'||(m.kind==='opi'&&r.st==='end')){r.st=m.kind;r.t=m.kind==='opi'?5:1.6;r.lit=1;m.dead=true;if(m.kind==='opi')S.docked++;else{S.eHit++;S.eTry++;}}
        else{m.bounce=true;m.t=0;m.vx=rand(-50,50);m.vy=-80;if(m.kind==='end')S.eTry++;}}}
    S.mols=S.mols.filter(m=>!m.dead);
    for(const r of S.rec){if(r.st==='end'||r.st==='opi'){r.t-=dt;if(Math.random()<dt*3)S.puffs.push({x:r.x+rand(-10,10),y:MEM+40,l:1});if(r.t<=0)r.st='free';}r.lit=lerp(r.lit,r.st==='end'||r.st==='opi'?1:0,1-Math.exp(-dt*4));}
    for(const p of S.puffs){p.y+=dt*50;p.l-=dt;}S.puffs=S.puffs.filter(p=>p.l>0);
    S.eHit*=Math.exp(-dt*.15);S.eTry*=Math.exp(-dt*.15);
  }
  function note(){const lo=S.dose==='low';
    return (lo?'In brain scans, 5 mg filled about half the μ receptors within 8 hours (Rabiner 2011, via Trøstheim 2023). LDN\'s supporters propose that the block lasts only about 6–8 hours, a key part of their theory (Gouda 2026); it hasn\'t been measured. The app plays it safe and treats it as partly blocking opioid painkillers for about a day.'
      :'The approved dose, 50 mg, blocks an opioid\'s effects for as long as 24 hours (label); in brain scans it filled over 90% of μ receptors for about two days (Lee 1988, via Trøstheim 2023).')+' '+
      (S.at==='bed'?'Taken at bedtime, the block falls on the night. Vivid dreams were the commonest side effect in Younger\'s trials, in about 37% of people, starting with the first doses and fading; why is unclear, and vivid dreams were also the commonest complaint on placebo, so some may come from expecting them (Younger 2014).'
      :'Taken in the morning, the block falls on the day instead; people whose sleep suffers are sometimes moved to morning doses (Younger 2014).');}
  function draw(x,dt,t,api){step(dt);const k=tk(api),dh=doseHr();
    x.fillStyle='#0A0B14';x.fillRect(-400,-300,1800,1300);
    x.fillStyle='rgba(140,120,200,.07)';x.fillRect(-400,MEM+35,1800,700);
    // the day, as a strip across the top
    const T={x:170,y:44,w:660,h:120},X=h=>T.x+h/24*T.w,Y=v=>T.y+T.h-v*T.h;
    x.fillStyle='rgba(236,230,218,.03)';x.fillRect(T.x,T.y,T.w,T.h);
    const sl=((23-dh)+24)%24;x.fillStyle=rgba(C.sleep,.3);const s0=sl,s1=sl+7.5;x.fillRect(X(s0),T.y,X(Math.min(24,s1))-X(s0),T.h);if(s1>24)x.fillRect(X(0),T.y,X(s1-24)-X(0),T.h);
    txt(x,'SLEEP',X(s0)+8,T.y+16*k,k);
    x.fillStyle=rgba(C.ntx,.35);x.strokeStyle=C.ntx;x.lineWidth=2.5;x.beginPath();x.moveTo(X(0),Y(0));for(let i=0;i<=120;i++){const h=i/5;x.lineTo(X(h),Y(held(h,S.dose)));}x.lineTo(X(24),Y(0));x.closePath();x.fill();
    x.beginPath();for(let i=0;i<=120;i++){const h=i/5;i?x.lineTo(X(h),Y(held(h,S.dose))):x.moveTo(X(h),Y(held(h,S.dose)));}x.stroke();
    x.strokeStyle='rgba(236,230,218,.4)';x.lineWidth=1;x.beginPath();x.moveTo(T.x,T.y+T.h);x.lineTo(T.x+T.w,T.y+T.h);x.stroke();
    for(let h=0;h<=24;h+=api.phone()?8:4){x.beginPath();x.moveTo(X(h),T.y+T.h);x.lineTo(X(h),T.y+T.h+5);x.stroke();txt(x,hhmm(dh+h),X(h),T.y+T.h+18*k,k,'center');}
    x.strokeStyle=C.on;x.lineWidth=2;x.beginPath();x.moveTo(X(S.h),T.y-4);x.lineTo(X(S.h),T.y+T.h);x.stroke();
    txt(x,S.dose==='std'?'μ RECEPTORS HELD · FROM BRAIN SCANS':'μ RECEPTORS HELD · SHAPE IS A SKETCH',T.x,T.y-10,k);
    x.strokeStyle='rgba(236,230,218,.22)';x.setLineDash([3,4]);x.beginPath();x.moveTo(T.x,Y(.5));x.lineTo(T.x+T.w,Y(.5));x.stroke();x.setLineDash([]);txt(x,'50%',T.x+T.w-4,Y(.5)-5,k*.85,'right');
    // membrane and receptors
    x.fillStyle='rgba(200,190,230,.10)';x.fillRect(-400,MEM-33,1800,66);
    x.fillStyle='rgba(200,190,230,.35)';for(let px=-380;px<1400;px+=13){x.beginPath();x.arc(px,MEM-31,4,0,TAU);x.arc(px,MEM+31,4,0,TAU);x.fill();}
    for(const r of S.rec){if(r.show<.05)continue;x.save();x.globalAlpha=r.show;receptor(x,r.x,MEM,1.3,C.mor,r.lit);
      if(r.st==='ntx')molNtx(x,r.x,DY,1.4);else if(r.st==='end')molEnd(x,r.x,DY,1.4,0);else if(r.st==='opi')molOpi(x,r.x,DY,1.4);x.restore();}
    for(const m of S.mols){x.globalAlpha=m.bounce||m.leave?clamp(1-m.t/1.6,0,1):1;(m.kind==='ntx'?molNtx:m.kind==='end'?molEnd:molOpi)(x,m.x,m.y,1.4);}x.globalAlpha=1;
    for(const p of S.puffs){x.fillStyle=rgba(C.on,.6*p.l);x.beginPath();x.arc(p.x,p.y,4,0,TAU);x.fill();}
    txt(x,'OUTSIDE THE NERVE CELL',170,T.y+T.h+50*k,k);txt(x,'OPIOID RECEPTORS (μ)',170,MEM+64+8*k,k);txt(x,'INSIDE THE NERVE CELL',830,MEM+64+8*k,k,'right');
    if(rebound())txt(x,'MORE RECEPTORS AND ENDORPHINS? · HYPOTHESIS',500,MEM+120+14*k,k,'center',rgba(C.end,.9));
    const q=s=>api.card.querySelector(s);if(q('#lr-clk')){const L=live(),hv=L.filter(r=>r.st==='ntx').length/Math.max(1,L.length),eg=S.eHit/Math.max(1,S.eTry);
      q('#lr-clk').textContent=`${hhmm(dh+S.h)} · ${Math.floor(S.h)} h`;
      q('#lr-held').textContent=Math.round(hv*100)+'%';q('#lr-heldB').style.width=hv*100+'%';q('#lr-e').textContent=Math.round(eg*100)+'%';q('#lr-eB').style.width=eg*100+'%';
      q('#lr-p').textContent=S.given?`${S.docked} of ${S.given}`:'not given';q('#lr-pB').style.width=(S.given?S.docked/S.given*100:0)+'%';
      const sl=q('#lr-h');if(S.play&&document.activeElement!==sl)sl.value=S.h;q('#lr-play').textContent=S.play?'Pause':'Play';}
  }
  return {id:'receptor',label:'Receptors',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:500,y:MEM},
    card(){return `<p class="k">Level 2 · molecules</p><h2>Blocked for part of each day</h2>
      <p>Opioid receptors on a nerve cell in the same relay. Naltrexone fits their pocket without switching them on, so while it sits there nothing else can use them: not the body's own endorphins (green), not an opioid painkiller (orange). It competes for the spot, and it leaves as its level falls (label).</p>
      <p><b style="color:var(--bone)">Let the day run, and give a painkiller at different hours.</b></p>
      <label class="dv-meter"><span>Time since the dose</span><b id="lr-clk">22:00 · 0 h</b></label><input id="lr-h" type="range" min="0" max="24" step=".1" value="0" style="width:100%;accent-color:${cc(C.ntx)}" aria-label="Hours after the dose">
      <div class="dv-btns"><button class="dv-btn go" id="lr-opi" type="button">Give an opioid painkiller now</button><button class="dv-btn" id="lr-play" type="button">Pause</button></div>
      <div class="dv-meter"><span>Receptors held by naltrexone</span><b id="lr-held">0%</b><i><u id="lr-heldB" style="background:${cc(C.ntx)}"></u></i></div>
      <div class="dv-meter"><span>Endorphins getting through</span><b id="lr-e">100%</b><i><u id="lr-eB" style="background:${cc(C.end)}"></u></i></div>
      <div class="dv-meter"><span>Painkiller that could dock</span><b id="lr-p">not given</b><i><u id="lr-pB" style="background:${cc(C.opi)}"></u></i></div>
      <div class="dv-seg" role="radiogroup" aria-label="Dose"><button role="radio" data-d="low" aria-checked="true">Low dose · 4.5 mg</button><button role="radio" data-d="std" aria-checked="false">Standard · 50 mg</button></div>
      <div class="dv-seg" role="radiogroup" aria-label="Taken at"><button role="radio" data-at="bed" aria-checked="true">At bedtime</button><button role="radio" data-at="am" aria-checked="false">In the morning</button></div>
      <div class="dv-btns"><button class="dv-btn" id="lr-reb" type="button">The rebound idea<small>a hypothesis</small></button></div>
      <p id="lr-note"></p>
      <p class="dv-fine">The curve's heights come from brain scans: about 45% for 4.5 mg within 8 hours, over 90% for 50 mg for two days (Rabiner 2011; Lee 1988, via Trøstheim 2023). How the low dose's block fades over the day hasn't been measured, so its shape is a sketch; the 4-hour blood half-life is no guide, since 50 mg holds the receptors for days. Molecules and timings are schematic. Tap the receptors and molecules to collect them.</p>`;},
    bind(card,api){const nt=()=>{card.querySelector('#lr-note').textContent=note();};nt();
      const sl=card.querySelector('#lr-h');sl.oninput=()=>{S.h=+sl.value;S.play=false;};
      card.querySelector('#lr-play').onclick=()=>{S.play=!S.play;};
      card.querySelector('#lr-opi').onclick=()=>{const L=live();S.given=L.length;S.docked=0;S.mols=S.mols.filter(m=>m.kind!=='opi');for(const r of L)if(r.st==='opi')r.st='free';L.forEach(r=>spawn('opi',r));};
      const seg=(attr,key)=>card.querySelectorAll(`[data-${attr}]`).forEach(b=>b.onclick=()=>{S[key]=b.dataset[attr];card.querySelectorAll(`[data-${attr}]`).forEach(y=>y.setAttribute('aria-checked',y===b));nt();});
      seg('d','dose');seg('at','at');
      const rb=card.querySelector('#lr-reb');rb.onclick=()=>{S.reb=!S.reb;rb.classList.toggle('on',S.reb);if(S.reb)api.discover('ldn_end',true);};},
    tap(p,api){const m=S.mols.find(m=>Math.hypot(m.x-p.x,m.y-p.y)<22);if(m)return api.discover(m.kind==='ntx'?'ldn_ntx':m.kind==='end'?'ldn_end':'ldn_opi');
      const r=S.rec.find(r=>r.show>.5&&Math.abs(r.x-p.x)<34&&Math.abs(p.y-MEM+20)<60);if(r)return api.discover(r.st==='ntx'&&p.y<MEM-34?'ldn_ntx':'ldn_mor');},
    draw,
  };
}

export const DIVE={color:'#B193E3',top:{label:'Neck',size:'10 cm'},
  target:({centreOf,V3})=>centreOf(['Sixth cervical vertebra']).add(V3(0,0,-.006)),view:{dist:.22,azim:-60,elev:10},
  text:'Into the patient\'s spinal cord, where pain signals are relayed to the brain. Meet the microglia that one of the main theories of low-dose naltrexone is about, then shrink to the opioid receptors it blocks for part of each day.',
  steps:[['The pain relay.','Switch the microglia on, try the TLR4 idea (a hypothesis), and see what two placebo-controlled trials found.'],['Opioid receptors, 10 nm.','Run a day after a dose and give an opioid painkiller at different hours. Compare the 50 mg dose, morning dosing and the rebound idea.']],
  also:[],
  refs:['lbl_ntx','younger2014','hutchinson2008','kettenmann2011','inoue2018','gouda2026','final2024','innova2026','goel2024','trostheim2023','rabiner2011','lee1988'],
  make:()=>({levels:[hornLevel(),receptorLevel()],guide:GUIDE_L}),
};
