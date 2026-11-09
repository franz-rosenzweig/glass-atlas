// Lexapro dive: a serotonin synapse over six weeks → the SERT pump escitalopram locks, in a nerve ending and in a platelet.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba, nucleus } from './dive-ra.js';
import { cc } from './theme.js';

const C={ht:'#FFD27A',sert:'#62BED3',esc:'#78A0F4',rec:'#B193E3',auto:'#F2705F',na:'#F29A55',cl:'#7FD3A3',pre:'#40C7AA',post:'#B193E3',plt:'#E8B9D0'};
const LBL='rgba(236,230,218,.55)',FONT='11px "Martian Mono", monospace';
const bg=h=>`style="background:${cc(h)}"`;
function label(x,t,px,py,al='left'){x.fillStyle=LBL;x.font=FONT;x.textAlign=al;x.fillText(t,px,py);}
function poly(x,cx,cy,r,n,rot){x.beginPath();for(let i=0;i<n;i++){const a=rot+i/n*TAU;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();}
// serotonin: an indole (six-ring fused to a five-ring) with its side chain
function ht(x,cx,cy,s,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.lineWidth=2;x.lineJoin='round';x.strokeStyle=C.ht;x.fillStyle=rgba(C.ht,.35);
  poly(x,-5,0,7,6,Math.PI/6);x.fill();x.stroke();poly(x,5.9,0,5.95,5,Math.PI*.8);x.fill();x.stroke();x.beginPath();x.moveTo(8,-5);x.lineTo(12,-11);x.lineTo(18,-11);x.stroke();
  x.beginPath();x.moveTo(-11,-3.5);x.lineTo(-16,-6);x.stroke();x.restore();}
// escitalopram: the fused phthalane rings, the fluorophenyl ring and the amine tail
function escG(x,cx,cy,s,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.lineWidth=2.2;x.lineJoin='round';x.strokeStyle=C.esc;x.fillStyle=rgba(C.esc,.45);
  poly(x,-6,0,8,6,Math.PI/6);x.fill();x.stroke();poly(x,6.4,0,6.8,5,Math.PI*.8);x.fill();x.stroke();
  x.beginPath();x.moveTo(10,-4);x.lineTo(16,-12);x.stroke();poly(x,21,-17,7,6,0);x.fill();x.stroke();
  x.beginPath();x.moveTo(11,5);x.lineTo(15,13);x.lineTo(22,13);x.lineTo(26,20);x.moveTo(-14,4);x.lineTo(-20,7);x.stroke();x.restore();}
const bz=(P,u)=>{const v=1-u;return [v*v*v*P[0][0]+3*v*v*u*P[1][0]+3*v*u*u*P[2][0]+u*u*u*P[3][0],v*v*v*P[0][1]+3*v*v*u*P[1][1]+3*v*u*u*P[2][1]+u*u*u*P[3][1]];};

export const GUIDE_LX={
  lex_neuron:{name:'Serotonin neuron',kind:'Nerve cell',size:'micrometres, with fibres across the brain',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.pre,.25);x.strokeStyle=C.pre;x.lineWidth=2*s;x.beginPath();x.arc(cx-30*s,cy,22*s,0,TAU);x.fill();x.stroke();nucleus(x,cx-30*s,cy,9*s,8*s);
      x.lineWidth=5*s;x.beginPath();x.moveTo(cx-8*s,cy);x.bezierCurveTo(cx+10*s,cy-30*s,cx+30*s,cy+20*s,cx+52*s,cy-6*s);x.stroke();x.beginPath();x.arc(cx+56*s,cy-6*s,8*s,0,TAU);x.fillStyle=rgba(C.pre,.5);x.fill();},
    text:['Their cell bodies sit mainly in the raphe nuclei of the brainstem, and their fibres reach almost every region of the brain (Charnay 2010). A small group of cells with a very wide reach.','At each fibre ending, an impulse releases serotonin into the gap with the next cell.']},
  lex_5ht:{name:'Serotonin (5-HT)',kind:'Messenger molecule',size:'under 1 nm',draw:(x,cx,cy,s)=>ht(x,cx,cy,s*2.4,0),
    text:['Released at the nerve ending, it lands on receptors on the next cell, then is pumped back in, which ends the message.','Most of the body\'s serotonin is outside the brain (Berger 2009), and in the blood nearly all of it rides inside platelets (Canobbio 2019).']},
  lex_sert:{name:'SERT',kind:'Transporter',size:'nanometres',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.sert,.35);x.strokeStyle=C.sert;x.lineWidth=2*s;for(const sg of [-1,1]){x.beginPath();x.moveTo(cx+sg*30*s,cy-34*s);x.lineTo(cx+sg*8*s,cy-34*s);x.lineTo(cx+sg*4*s,cy+34*s);x.lineTo(cx+sg*30*s,cy+34*s);x.closePath();x.fill();x.stroke();}},
    text:['The serotonin transporter: a pump in the nerve ending\'s membrane that grips serotonin together with sodium and chloride and carries it back inside. That is what ends the signal, and it is the target of every SSRI (Coleman 2016).','Platelets carry the very same pump.']},
  lex_esc:{name:'Escitalopram',kind:'Medicine (Lexapro)',size:'about 1 nm',draw:(x,cx,cy,s)=>escG(x,cx-8*s,cy+4*s,s*2.2,0),
    text:['The S-form of the older drug citalopram, at least 100 times more potent than its mirror image, with little or no pull on serotonin\'s own receptors or other receptors (label). It lodges in SERT\'s central pocket and locks the pump open to the outside (Coleman 2016).','Its half-life is 27–32 hours, so a steady level builds over about a week (label). It lengthens the QT interval a little, more at higher doses: 4.5 ms at 10 mg and 10.7 ms at 30 mg (above the highest approved dose) in the label\'s study of 113 healthy volunteers, with about 6.6 ms predicted at 20 mg, which is why it counts in the patient\'s QT conversation.']},
  lex_auto:{name:'Autoreceptor (5-HT1A)',kind:'Receptor on the serotonin cell itself',size:'nanometres',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.pre,.2);x.strokeStyle=C.pre;x.lineWidth=2*s;x.beginPath();x.arc(cx,cy+30*s,34*s,Math.PI*1.1,Math.PI*1.9);x.stroke();
      for(let i=-2;i<=2;i++){const a=-Math.PI/2+i*.28,px=cx+Math.cos(a)*34*s,py=cy+30*s+Math.sin(a)*34*s;x.strokeStyle=C.auto;x.lineWidth=3*s;x.beginPath();x.arc(px,py-5*s,5*s,Math.PI*.1,Math.PI*.9,true);x.stroke();}},
    text:['Serotonin cells sense their own serotonin through these receptors on their cell bodies in the raphe and slow their firing: a powerful brake (Charnay 2010).','The classic explanation for the slow build of an SSRI\'s effect: at first the extra serotonin around the cell bodies presses the brake, so the cells fire less; over weeks the brake becomes less sensitive and firing recovers while the pumps stay blocked (Blier 1994; Kim 2017). It is a long-standing idea, not a settled one (Harmer 2017).']},
  lex_plt:{name:'Platelet',kind:'Cell fragment in the blood',size:'a few micrometres',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.plt,.3);x.strokeStyle=C.plt;x.lineWidth=2*s;x.beginPath();x.ellipse(cx,cy,40*s,24*s,0,0,TAU);x.fill();x.stroke();
      for(const [a,b] of [[-14,-4],[8,6],[18,-8]]){x.fillStyle='rgba(30,20,40,.8)';x.beginPath();x.arc(cx+a*s,cy+b*s,6*s,0,TAU);x.fill();x.fillStyle=C.ht;x.beginPath();x.arc(cx+a*s,cy+b*s,2.2*s,0,TAU);x.fill();}},
    text:['Platelets plug leaks. They can\'t make serotonin: they collect it from the blood plasma through SERT and pack it into dense granules, then release it when they are activated, a weak extra signal that helps them clump (Canobbio 2019).','An SSRI blocks that pump too. In healthy men, two weeks of paroxetine, another SSRI, cut platelet serotonin by 83% and slowed plug formation (Hergovich 2000); four weeks of escitalopram in people with depression also clearly lowered it (Dvojkovic 2021). That is the likely reason behind the Lexapro label\'s bleeding warning (de Abajo 2011).']},
};

/* ---------------- level A: a synapse, week by week */
function synapseLevel(){
  // [label, share of pumps blocked, brake, firing as a share of usual]: illustrative values for the autoreceptor model
  const WK=[['Before',0,.2,1],['Day 1',.6,.75,.55],['Week 1',.8,.65,.65],['Week 2',.8,.45,.78],['Week 4',.8,.3,.9],['Week 6',.8,.25,.95]];
  const Y0=334,Y1=390,PUMPS=[285,312,339,366,393,607,634,661,688,715],ORDER=[0,9,2,7,4,5,1,8,3,6],RECS=[330,387,443,500,557,613,670];
  const SOMA={x:205,y:104,r:40},AXP=[[240,100],[300,40],[380,50],[440,104]];
  let S;
  function reset(){S={w:0,brake:.2,fire:1,paused:false,acc:.6,sparks:[],ht:[],pumps:PUMPS.map(x=>({x,busy:0,blocked:false})),recs:RECS.map(x=>({x,t:0,rip:0})),
    ves:Array.from({length:16},(_,i)=>{const x=330+(i%8)*48+(i>7?24:0),y=i>7?285:225+(i%3)*8;return {x,y,hx:x,hy:y,full:1,fuse:0};}),soma:Array.from({length:22},(_,i)=>({a:i*2.4,r:SOMA.r+12+(i%3)*5})),flash:0};setWeek(0);}
  function setWeek(i){S.w=i;const nb=Math.round(WK[i][1]*10);S.pumps.forEach(p=>p.blocked=false);ORDER.slice(0,nb).forEach(k=>S.pumps[k].blocked=true);}
  reset();
  const target=()=>{const [,b,br,f]=WK[S.w];const per=1/(1-.6*b);return {b,br,f,sig:f*per};};
  function impulse(){S.sparks.push({u:0});S.flash=1;}
  function release(){const ready=S.ves.filter(v=>v.full>.9&&!v.fuse).sort((a,b)=>Math.abs(a.x-500)-Math.abs(b.x-500)).slice(0,2);for(const v of ready)v.fuse=.001;}
  function step(dt){const T=target();S.brake=lerp(S.brake,T.br,1-Math.exp(-dt*2));S.fire=lerp(S.fire,T.f,1-Math.exp(-dt*2));
    if(!S.paused){S.acc+=dt*S.fire/.9;if(S.acc>=1){S.acc=0;impulse();}}
    S.flash=Math.max(0,S.flash-dt*3);
    for(const s of S.sparks){s.u+=dt/.45;if(s.u>=1&&!s.done){s.done=true;release();}}S.sparks=S.sparks.filter(s=>!s.done);
    for(const v of S.ves){if(v.fuse){v.fuse+=dt/.18;if(v.fuse>=1){for(let k=0;k<11;k++){const a=rand(.3,Math.PI-.3);S.ht.push({x:v.x+rand(-8,8),y:Y0+5,a,st:'free',t:0});}v.fuse=0;v.full=0;}}
      else v.full=Math.min(1,v.full+dt*.45);}
    for(const p of S.pumps)p.busy=Math.max(0,p.busy-dt);for(const r of S.recs){r.t=Math.max(0,r.t-dt);r.rip=Math.max(0,r.rip-dt*1.6);}
    for(const m of S.ht){m.t+=dt;
      if(m.st==='in'){m.y-=dt*60;m.f=(m.f??1)-dt*1.6;continue;}
      if(m.st==='bound'){if(m.r.t<=0){m.st='free';m.y=Y1-6;m.a=-rand(.4,Math.PI-.4);}continue;}
      m.a+=rand(-1,1)*dt*9;m.x+=Math.cos(m.a)*220*dt;m.y+=Math.sin(m.a)*220*dt;
      if(m.y<Y0+4){m.y=Y0+4;m.a=-m.a;const p=S.pumps.find(p=>Math.abs(p.x-m.x)<12);if(p&&!p.blocked&&p.busy<=0&&Math.random()<.6){p.busy=.35;m.st='in';m.x=p.x;m.y=Y0-2;}}
      else if(m.y>Y1-4){m.y=Y1-4;m.a=-m.a;const r=S.recs.find(r=>Math.abs(r.x-m.x)<11);if(r&&r.t<=0&&Math.random()<.45){r.t=.3;r.rip=1;m.st='bound';m.r=r;m.x=r.x;m.y=Y1-6;}}
      if(Math.random()<dt*.03)m.gone=true;if(m.x<240||m.x>760){if(Math.random()<.2)m.gone=true;else{m.x=clamp(m.x,240,760);m.a=Math.PI-m.a;}}if(m.st==='in'&&m.f<=0)m.gone=true;}
    S.ht=S.ht.filter(m=>!m.gone&&!(m.st==='in'&&m.f<=0));
    for(const o of S.soma)o.a+=dt*.25;}
  const bouton=x=>{x.beginPath();x.moveTo(272,Y0);x.quadraticCurveTo(245,Y0,245,290);x.bezierCurveTo(240,150,330,92,500,92);x.bezierCurveTo(670,92,760,150,755,290);x.quadraticCurveTo(755,Y0,728,Y0);x.closePath();};
  const nextCell=x=>{x.beginPath();x.moveTo(205,760);x.lineTo(205,450);x.quadraticCurveTo(205,Y1,265,Y1);x.lineTo(735,Y1);x.quadraticCurveTo(795,Y1,795,450);x.lineTo(795,760);};
  function draw(x,dt,t,api){step(dt);const T=target();
    x.fillStyle='#0A0E16';x.fillRect(-400,-300,1800,1300);
    x.strokeStyle='rgba(140,160,200,.07)';x.lineWidth=2;for(let i=0;i<46;i++){const sx=(i*173)%1300-150,sy=(i*97)%760-30;x.beginPath();x.moveTo(sx,sy);x.bezierCurveTo(sx+40,sy-20,sx+80,sy+20,sx+120,sy);x.stroke();}
    // the next cell, and the receptors on it
    nextCell(x);x.fillStyle=rgba(C.post,.1);x.fill();x.strokeStyle=rgba(C.post,.75);x.lineWidth=3;x.stroke();
    glow(x,500,Y1+40,120+150*clamp(S.fire/(1-.6*T.b)-.5,0,1.5),rgba(C.rec,.22));
    for(const r of S.recs){if(r.rip>0){x.strokeStyle=rgba(C.rec,.6*r.rip);x.lineWidth=2;x.beginPath();x.arc(r.x,Y1,6+(1-r.rip)*16,.2*Math.PI,.8*Math.PI);x.stroke();}
      x.strokeStyle=C.rec;x.lineWidth=3.5;x.beginPath();x.arc(r.x,Y1-9,7,Math.PI*.05,Math.PI*.95);x.stroke();if(r.t>0){x.save();x.globalCompositeOperation='lighter';glow(x,r.x,Y1-6,18,rgba(C.rec,.7));x.restore();}}
    // the axon from the cell body, then the nerve ending
    x.strokeStyle=rgba(C.pre,.55);x.lineWidth=14;x.lineCap='round';x.beginPath();x.moveTo(...AXP[0]);x.bezierCurveTo(...AXP[1],...AXP[2],...AXP[3]);x.stroke();
    const [bx,by]=bz(AXP,.42);x.strokeStyle='#0A0E16';x.lineWidth=4;x.beginPath();x.moveTo(bx-12,by-4);x.lineTo(bx-2,by+12);x.moveTo(bx-2,by-8);x.lineTo(bx+8,by+8);x.stroke();
    bouton(x);x.fillStyle=rgba(C.pre,.1);x.fill();x.strokeStyle=rgba(C.pre,.85);x.lineWidth=3;x.stroke();
    for(const s of S.sparks){const [px,py]=bz(AXP,clamp(s.u,0,1));x.save();x.globalCompositeOperation='lighter';glow(x,px,py,22,'rgba(255,240,170,.8)');x.restore();x.fillStyle='#FFF2B0';x.beginPath();x.arc(px,py,4,0,TAU);x.fill();}
    for(const v of S.ves){const vy=v.fuse?lerp(v.y,Y0-12,v.fuse):v.y;x.strokeStyle=rgba(C.pre,.8);x.lineWidth=2;x.fillStyle='rgba(10,20,22,.6)';x.beginPath();x.arc(v.x,vy,14,0,TAU);x.fill();x.stroke();
      x.fillStyle=C.ht;const n=Math.round(v.full*6);for(let k=0;k<n;k++){x.beginPath();x.arc(v.x+Math.cos(k*1.05)*6,vy+Math.sin(k*1.05)*6,2.2,0,TAU);x.fill();}}
    // SERT pumps on the nerve ending, some plugged by escitalopram
    for(const p of S.pumps){x.fillStyle=p.busy>0?'#9FE6F2':C.sert;x.beginPath();x.roundRect(p.x-10,Y0-10,7,18,3);x.roundRect(p.x+3,Y0-10,7,18,3);x.fill();
      if(p.blocked){x.fillStyle=C.esc;x.beginPath();x.roundRect(p.x-3.5,Y0-3,7,12,3);x.fill();}}
    // serotonin
    for(const m of S.ht){x.globalAlpha=m.st==='in'?Math.max(0,m.f):1;x.fillStyle=C.ht;x.beginPath();x.arc(m.x,m.y,3.2,0,TAU);x.fill();x.globalAlpha=1;}
    // inset: the cell body in the brainstem, with its brake
    x.fillStyle='rgba(10,14,22,.85)';x.strokeStyle='rgba(236,230,218,.18)';x.lineWidth=1.5;x.beginPath();x.roundRect(SOMA.x-62,SOMA.y-68,124,166,6);x.fill();x.stroke();
    if(S.flash>0){x.save();x.globalCompositeOperation='lighter';glow(x,SOMA.x,SOMA.y,SOMA.r*1.6,`rgba(255,240,170,${.5*S.flash})`);x.restore();}
    x.fillStyle=rgba(C.pre,.22);x.strokeStyle=C.pre;x.lineWidth=2.5;x.beginPath();x.arc(SOMA.x,SOMA.y,SOMA.r,0,TAU);x.fill();x.stroke();nucleus(x,SOMA.x-4,SOMA.y+2,14,12);
    const nAmb=Math.round(4+16*T.b);x.fillStyle=C.ht;for(let i=0;i<nAmb;i++){const o=S.soma[i];x.beginPath();x.arc(SOMA.x+Math.cos(o.a)*o.r,SOMA.y+Math.sin(o.a)*o.r*.8,2.4,0,TAU);x.fill();}
    for(let i=0;i<7;i++){const a=-Math.PI*.92+i*Math.PI*.14;const px=SOMA.x+Math.cos(a)*SOMA.r,py=SOMA.y+Math.sin(a)*SOMA.r;x.save();x.translate(px,py);x.rotate(a+Math.PI/2);
      x.strokeStyle=rgba(C.auto,.35+.65*S.brake);x.lineWidth=3;x.beginPath();x.arc(0,-8,5,Math.PI*.1,Math.PI*.9);x.stroke();x.restore();}
    label(x,'CELL BODY',SOMA.x,SOMA.y+SOMA.r+30,'center');label(x,'RAPHE',SOMA.x,SOMA.y+SOMA.r+44,'center');
    label(x,'NERVE ENDING',500,130,'center');label(x,'SERT PUMPS',339,Y0-20,'center');label(x,'THE GAP',768,Y0+36);label(x,'RECEPTORS',500,Y1+46,'center');label(x,'NEXT CELL',500,560,'center');
    const q=s=>api.card.querySelector(s);if(q('#lx-pb')){const nb=S.pumps.filter(p=>p.blocked).length;q('#lx-pb').textContent=`${nb} of 10`;q('#lx-pbB').style.width=nb*10+'%';
      const gap=S.ht.filter(m=>m.st!=='in').length;q('#lx-gB').style.width=clamp(gap/90,0,1)*100+'%';q('#lx-g').textContent=gap;
      q('#lx-br').textContent=S.brake>.6?'pressed hard':S.brake>.4?'easing':S.brake>.23?'eased':'resting';q('#lx-brB').style.width=S.brake*100+'%';
      q('#lx-f').textContent=Math.round(S.fire*100)+'% of usual';q('#lx-fB').style.width=S.fire*100+'%';
      const sig=S.fire/(1-.6*T.b);q('#lx-s').textContent=sig<.95?'a little lower':sig<1.1?'about the same':sig<1.45?'higher':'much higher';q('#lx-sB').style.width=clamp(sig/2,0,1)*100+'%';}
  }
  return {id:'synapse',label:'Synapse',size:'1 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:339,y:Y0},
    card(){return `<p class="k">Level 1 · a synapse in the brain</p><h2>Six weeks at one synapse</h2>
      <p>The patient's serotonin cells begin in the brainstem and send fibres all over the brain. At each ending an impulse releases serotonin (yellow) into a narrow gap, where it lands on the next cell's receptors. Then SERT pumps (teal) pull it back inside and the message ends. Lexapro plugs those pumps, so serotonin lingers.</p>
      <p><b style="color:var(--bone)">Step through the weeks.</b> Watch the classic model: the cell's own brake (red, on the cell body) presses hard at first, then eases.</p>
      <div class="dv-seg" role="radiogroup" aria-label="Time on Lexapro">${WK.map((w,i)=>`<button role="radio" data-w="${i}" aria-checked="${i===S.w}">${w[0]}</button>`).join('')}</div>
      <div class="dv-meter"><span>Pumps blocked</span><b id="lx-pb">0 of 10</b><i><u id="lx-pbB" ${bg('#78A0F4')}></u></i></div>
      <div class="dv-meter"><span>Serotonin in the gap now</span><b id="lx-g">0</b><i><u id="lx-gB" ${bg('#DDB741')}></u></i></div>
      <div class="dv-meter"><span>Brake on the cell body</span><b id="lx-br">resting</b><i><u id="lx-brB" ${bg('#F2705F')}></u></i></div>
      <div class="dv-meter"><span>Firing of the serotonin cell</span><b id="lx-f">100% of usual</b><i><u id="lx-fB"></u></i></div>
      <div class="dv-meter"><span>Signal on the next cell</span><b id="lx-s">about the same</b><i><u id="lx-sB" ${bg('#B193E3')}></u></i></div>
      <div class="dv-btns"><button class="dv-btn" id="lx-pause" type="button">Pause the firing</button><button class="dv-btn" id="lx-one" type="button">Send one impulse</button></div>
      <div class="dv-btns"><button class="dv-btn go" id="lx-go" type="button">Zoom into one pump<small>SERT, 10 nm</small></button></div>
      <p class="dv-fine">In trials, people on an SSRI are already a little better than on placebo by the end of week 1 and keep improving for at least six weeks (Taylor 2006). The fading brake is the classic explanation for that slow build (Blier 1994; Kim 2017), not a settled one: newer ideas involve early shifts in how emotions are processed and slower rewiring of the brain (Harmer 2017).</p>
      <p class="dv-fine">Schematic, and the gap is drawn far wider than life. The lowest effective doses of five antidepressants block about 80% of SERT pumps in PET scans (Meyer 2004); one study found approved escitalopram doses fall a little short of that (Kim 2017). A single dose blocks about 60–75% (Klein 2006; Lundberg 2007), as Day 1 shows, and the level steadies within about a week (label). The brake, firing and signal values are illustrative. Raphe: Charnay 2010. Tap the cell body, pumps or serotonin to collect them.</p>`;},
    bind(card,api){card.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{setWeek(+b.dataset.w);card.querySelectorAll('[data-w]').forEach(y=>y.setAttribute('aria-checked',y===b));if(S.w>=3)api.discover('lex_auto',true);});
      const pb=card.querySelector('#lx-pause');pb.onclick=()=>{S.paused=!S.paused;pb.classList.toggle('on',S.paused);pb.textContent=S.paused?'Resume the firing':'Pause the firing';};
      card.querySelector('#lx-one').onclick=impulse;card.querySelector('#lx-go').onclick=()=>api.go('sert',{from:{x:339,y:Y0}});},
    tap(p,api){if(Math.hypot(p.x-SOMA.x,p.y-SOMA.y)<SOMA.r+14)return api.discover(Math.hypot(p.x-SOMA.x,p.y-SOMA.y)>SOMA.r-8?'lex_auto':'lex_neuron');
      if(Math.abs(p.y-Y0)<16){const pu=S.pumps.find(q=>Math.abs(q.x-p.x)<14);if(pu)return api.discover(pu.blocked?'lex_esc':'lex_sert');}
      if(p.y>Y0&&p.y<Y1+20&&p.x>240&&p.x<760)return api.discover('lex_5ht');
      if(p.y<Y0&&p.y>92&&p.x>245&&p.x<755)return api.discover('lex_neuron');},
    exit(){S.sparks=[];},draw,
  };
}

/* ---------------- level B: one SERT pump, in a nerve ending or a platelet */
function sertLevel(jump){
  const MY=360,XS=[230,410,590,770];const M={mode:'neuron',drug:0};let S,drag=null;
  function reset(){S={pumps:XS.map(x=>({x,a:1,st:'out',t:0,esc:null,lid:null,cargo:null})),ht:[],drug:[],inside:[],carried:0,rate:0,store:.9,day:0,acc:0,lost:0};}
  reset();
    function addDrug(n,px,py){for(let i=0;i<n;i++)S.drug.push({x:px??rand(160,840),y:py??rand(60,80),a:rand(0,TAU),st:'free',t:0,rot:rand(0,6)});}
  function setDrug(v){M.drug=v;if(!v){for(const d of S.drug)if(d.st==='free')d.leave=true;S.day=0;}}
  function step(dt){
    // serotonin arrives: bursts at a nerve ending, a steady supply in plasma
    S.acc+=dt;const want=M.mode==='plt'?9:0;
    if(M.mode==='neuron'&&S.acc>1.6){S.acc=0;for(let k=0;k<4;k++)S.ht.push({x:rand(300,700),y:rand(60,90),a:rand(.5,2.6),st:'free'});}
    if(M.mode==='plt'&&S.ht.filter(m=>m.st==='free').length<want&&S.acc>.25){S.acc=0;S.ht.push({x:rand(150,850),y:60,a:rand(.5,2.6),st:'free'});}
    if(M.drug&&S.drug.filter(d=>!d.leave).length<7&&Math.random()<dt*2)addDrug(1);
    for(const m of S.ht){if(m.st!=='free')continue;m.a+=rand(-1,1)*dt*5;m.x+=Math.cos(m.a)*80*dt;m.y+=(Math.sin(m.a)*80+22)*dt;
      if(m.y<60){m.y=60;m.a=-m.a;}if(m.y>MY-50){m.y=MY-50;m.a=-m.a;}if(m.x<150||m.x>850){m.x=clamp(m.x,150,850);m.a=Math.PI-m.a;}
      for(const p of S.pumps)if(p.st==='out'&&!p.cargo&&Math.abs(m.x-p.x)<34&&m.y>MY-92){p.cargo=m;m.st='ride';p.st='occ';p.t=0;break;}
      if(M.mode==='neuron'&&Math.random()<dt*.02){m.gone=true;S.lost++;}}
    for(const p of S.pumps){p.t+=dt;
      const tgt=p.st==='out'||p.st==='ret'||p.st==='blocked'?1:p.st==='occ'?0:-1;p.a=lerp(p.a,tgt,1-Math.exp(-dt*7));
      if(p.cargo){const c=p.cargo;const ty=p.st==='occ'?MY-6:MY+30;c.x=lerp(c.x,p.x,dt*8);c.y=lerp(c.y,ty,dt*6);}
      if(p.st==='occ'&&p.t>.4){p.st='in';p.t=0;}
      else if(p.st==='in'&&p.t>.4){const c=p.cargo;p.cargo=null;c.st='in';c.tx=M.mode==='plt'?[360,500,640][Math.floor(rand(0,3))]:500;c.ty=M.mode==='plt'?610:620;S.inside.push(c);c.gone=true;S.carried++;S.rate+=1;
        if(M.mode==='plt')S.store=Math.min(1,S.store+.0095);p.st='ret';p.t=0;}
      else if(p.st==='ret'&&p.t>.55){p.st='out';p.t=0;}}
    S.ht=S.ht.filter(m=>!m.gone);S.rate*=Math.exp(-dt/6);
    for(const c of S.inside){c.x=lerp(c.x,c.tx,dt*1.4);c.y=lerp(c.y,c.ty,dt*1.4);c.f=(c.f??1)-dt*.5;}S.inside=S.inside.filter(c=>c.f>0);
    if(M.mode==='plt'){S.store=Math.max(0,S.store-dt*.03*S.store);if(M.drug)S.day=Math.min(28,S.day+dt/4);}
    // escitalopram: wanders, lodges in an outward-open pump, sometimes caps it from the side pocket, then lets go
    for(const d of S.drug){d.rot+=dt*.6;
      if(d.st==='free'){if(d===drag)continue;d.a+=rand(-1,1)*dt*4;d.x+=Math.cos(d.a)*(d.leave?110:60)*dt;d.y+=d.leave?-110*dt:(Math.sin(d.a)*60+18)*dt;
        if(d.leave){if(d.y<-60)d.gone=true;continue;}
        if(d.y<60){d.y=60;d.a=-d.a;}if(d.y>MY-48){d.y=MY-48;d.a=-d.a;}if(d.x<150||d.x>850){d.x=clamp(d.x,150,850);d.a=Math.PI-d.a;}
        bindNear(d);}
      else if(d.st==='site'){const p=d.p;d.x=lerp(d.x,p.x,dt*8);d.y=lerp(d.y,MY-2,dt*8);if(!p.lid)d.t-=dt;if(d.t<=0||(!M.drug&&Math.random()<dt*.5)){p.esc=null;p.st='out';p.t=0;d.st='free';d.y=MY-60;d.a=-Math.PI/2;if(!M.drug)d.leave=true;}}
      else if(d.st==='lid'){const p=d.p;d.x=lerp(d.x,p.x,dt*8);d.y=lerp(d.y,MY-64,dt*8);d.t-=dt;if(d.t<=0||!p.esc){p.lid=null;d.st='free';d.y=MY-80;d.a=-Math.PI/2;if(!M.drug)d.leave=true;}}}
    S.drug=S.drug.filter(d=>!d.gone);}
  function bindNear(d){for(const p of S.pumps){if(Math.abs(d.x-p.x)>34||d.y<MY-96)continue;
      if(p.st==='out'&&!p.cargo&&!p.esc){p.esc=d;p.st='blocked';d.st='site';d.p=p;d.t=rand(5,9);return true;}
      if(p.esc&&!p.lid&&Math.random()<.06){p.lid=d;d.st='lid';d.p=p;d.t=rand(4,7);return true;}}return false;}
  function membrane(x){for(let xx=-300;xx<=1300;xx+=20)for(const s of [-1,1]){x.fillStyle='#8FA3A6';x.beginPath();x.arc(xx,MY+s*36,8,0,TAU);x.fill();x.strokeStyle='rgba(143,163,166,.5)';x.lineWidth=2;x.beginPath();x.moveTo(xx-3,MY+s*28);x.lineTo(xx-3,MY+s*5);x.moveTo(xx+3,MY+s*28);x.lineTo(xx+3,MY+s*5);x.stroke();}}
  function pump(x,p){const gT=6+18*Math.max(0,p.a),gB=6+18*Math.max(0,-p.a);
    x.fillStyle=M.mode==='plt'?'#14101A':'#0A1418';x.fillRect(p.x-54,MY-46,108,92);
    for(const sg of [-1,1]){x.beginPath();x.moveTo(p.x+sg*52,MY-70);x.lineTo(p.x+sg*gT,MY-70);x.lineTo(p.x+sg*gB,MY+70);x.lineTo(p.x+sg*52,MY+70);x.closePath();
      x.fillStyle=rgba(C.sert,.32);x.fill();x.strokeStyle=C.sert;x.lineWidth=2.5;x.lineJoin='round';x.stroke();
      x.strokeStyle=rgba(C.sert,.45);x.lineWidth=1.5;for(let k=1;k<4;k++){const f=k/4;x.beginPath();x.moveTo(p.x+sg*lerp(gT,52,f),MY-66);x.lineTo(p.x+sg*lerp(gB,52,f),MY+66);x.stroke();}}
    x.strokeStyle='rgba(236,230,218,.25)';x.setLineDash([3,4]);x.lineWidth=1.2;x.beginPath();x.arc(p.x,MY,12,0,TAU);x.stroke();x.setLineDash([]);
    if(p.st==='blocked'){x.save();x.globalCompositeOperation='lighter';glow(x,p.x,MY,40,'rgba(120,160,244,.35)');x.restore();}}
  function draw(x,dt,t,api){step(dt);const plt=M.mode==='plt';
    x.fillStyle=plt?'#120C14':'#0A1418';x.fillRect(-400,-300,1800,MY+300);x.fillStyle=plt?'#1A1220':'#0D1220';x.fillRect(-400,MY,1800,700);
    membrane(x);
    // inside: a vesicle in the nerve ending, or dense granules in the platelet
    if(plt){[360,500,640].forEach((gx,i)=>{x.fillStyle='rgba(30,18,36,.9)';x.strokeStyle=rgba(C.plt,.7);x.lineWidth=2;x.beginPath();x.arc(gx,610,36,0,TAU);x.fill();x.stroke();
        const n=Math.round(S.store*14);x.fillStyle=C.ht;for(let k=0;k<n;k++){const a=k*2.4+i,r=6+(k%4)*6;x.beginPath();x.arc(gx+Math.cos(a)*r,610+Math.sin(a)*r,3,0,TAU);x.fill();}});}
    else{x.strokeStyle=rgba(C.pre,.7);x.lineWidth=2;x.fillStyle='rgba(10,20,22,.7)';x.beginPath();x.arc(500,624,40,0,TAU);x.fill();x.stroke();}
    for(const p of S.pumps)pump(x,p);
    for(const m of S.ht)ht(x,m.x,m.y,1,m.a);
    for(const p of S.pumps)if(p.cargo){const c=p.cargo;x.fillStyle=C.na;x.beginPath();x.arc(c.x-14,c.y+12,4,0,TAU);x.fill();x.fillStyle=C.cl;x.beginPath();x.arc(c.x+14,c.y+12,4,0,TAU);x.fill();}
    for(const c of S.inside){x.globalAlpha=clamp(c.f,0,1);ht(x,c.x,c.y,1,0);x.globalAlpha=1;}
    for(const d of S.drug)escG(x,d.x,d.y,1,d.st==='free'?d.rot:0);
    label(x,plt?'BLOOD PLASMA':'THE GAP, OUTSIDE',150,38);label(x,plt?'INSIDE A PLATELET':'INSIDE THE NERVE ENDING',150,MY+110);label(x,'MEMBRANE',680,MY+64,'center');
    if(plt)label(x,'DENSE GRANULES',500,676,'center');S.pumps.forEach(p=>label(x,'SERT',p.x,MY+90,'center'));
    const q=s=>api.card.querySelector(s);if(q('#ls-w')){const w=S.pumps.filter(p=>!p.esc).length;q('#ls-w').textContent=`${w} of 4`;q('#ls-wB').style.width=w*25+'%';
      q('#ls-cB').style.width=clamp(S.rate/14,0,1)*100+'%';
      if(q('#ls-o')){const o=S.ht.filter(m=>m.st==='free').length;q('#ls-o').textContent=o;q('#ls-oB').style.width=clamp(o/40,0,1)*100+'%';}
      if(q('#ls-st')){q('#ls-st').textContent=Math.round(S.store*100)+'%';q('#ls-stB').style.width=S.store*100+'%';q('#ls-d').textContent=M.drug?`day ${Math.floor(S.day)}`:'not taking it';}
      q('#ls-add').classList.toggle('on',!!M.drug);}
  }
  return {id:'sert',label:'SERT pump',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:100,label:'5 nm'},zoomFocus:{x:410,y:MY},
    prep(o){if(o?.mode){M.mode=o.mode;reset();}if(o?.drug)setDrug(1);},exit(){drag=null;},
    card(){return `<p class="k">Level 2 · one transporter</p><h2>The pump Lexapro locks</h2>
      <div class="dv-seg" role="radiogroup" aria-label="Where"><button role="radio" data-mm="neuron" aria-checked="${M.mode==='neuron'}">Nerve ending</button><button role="radio" data-mm="plt" aria-checked="${M.mode==='plt'}">Platelet</button></div>
      <div id="ls-body"></div>`;},
    bind(card,api){const body=card.querySelector('#ls-body');
      const render=()=>{const plt=M.mode==='plt';body.innerHTML=(plt?`<p>Platelets can't make serotonin. They collect it from the blood plasma through the very same SERT pump and pack it into dense granules, then release it when they're activated as a weak extra signal that helps them clump into a plug (Canobbio 2019). Block the pumps for a couple of weeks and their stores run low.</p>
          <p><b style="color:var(--bone)">Add Lexapro and let the days run.</b></p>`:`<p>SERT grips one serotonin together with sodium (orange) and chloride (green), rocks shut, and opens on the inside. Escitalopram lodges in the same central pocket and locks the pump open to the outside, so serotonin can't get in. In the crystal, a second escitalopram can sit in a low-affinity side pocket at the mouth, like a lid, which slows the first one leaving (Coleman 2016). Whether that happens at usual doses isn't known.</p>
          <p><b style="color:var(--bone)">Tap above the membrane to drop in an escitalopram</b>, drag one into an open pump, or add a steady level.</p>`)+`
          <div class="dv-meter"><span>Pumps working</span><b id="ls-w">4 of 4</b><i><u id="ls-wB" ${bg('#62BED3')}></u></i></div>
          <div class="dv-meter"><span>Serotonin carried in</span><b></b><i><u id="ls-cB" ${bg('#DDB741')}></u></i></div>
          ${plt?`<div class="dv-meter"><span>Serotonin stored in the platelets</span><b id="ls-st">90%</b><i><u id="ls-stB" ${bg('#E8B9D0')}></u></i></div><div class="dv-meter"><span>Lexapro</span><b id="ls-d">not taking it</b></div>`
            :`<div class="dv-meter"><span>Serotonin left in the gap</span><b id="ls-o">0</b><i><u id="ls-oB" ${bg('#DDB741')}></u></i></div>`}
          <div class="dv-btns"><button class="dv-btn" id="ls-add" type="button">Add Lexapro<small>a steady daily level</small></button><button class="dv-btn" id="ls-wash" type="button">Wash it out</button></div>
          ${plt?`<p class="sub">Why it matters</p><p>In healthy men, two weeks of another SSRI cut platelet serotonin by 83% and plugs formed more slowly (Hergovich 2000). Four weeks of escitalopram in people with depression clearly lowered it too (Dvojkovic 2021). That is the likely reason the Lexapro label warns about bleeding (de Abajo 2011), and the label says NSAIDs like the patient's ibuprofen may add to it. In a meta-analysis, the odds of bleeding from the stomach or upper gut were 1.7 times higher with an SSRI alone, 2.6 with an NSAID alone and 4.0 with both (Oka 2014); the SSRI-alone figure on its own wasn't statistically clear.</p>
            <div class="dv-btns"><button class="dv-btn go" id="ls-ibu" type="button">See it in the stomach lining<small>the ibuprofen dive</small></button></div>
            <p class="dv-fine">The store's fall and the day count are illustrative; the 83% is from paroxetine; the escitalopram study reports a clear fall without that figure in its summary. Tap a platelet granule, a pump or a molecule to collect it.</p>`
            :`<p class="dv-fine">Roughly to scale (5 nm bar); the pump's shape is simplified from the crystal structures of the human pump with escitalopram (Coleman 2016). The label: escitalopram is the S-form of citalopram, at least 100 times more potent than the R-form, and has little or no pull on other receptors. Rates, and how often the lid appears, are illustrative. Tap a molecule or a pump to collect it.</p>`}`;
        body.querySelector('#ls-add').onclick=()=>setDrug(1);body.querySelector('#ls-wash').onclick=()=>setDrug(0);
        body.querySelector('#ls-ibu')?.addEventListener('click',()=>jump('med:ibuprofen',{level:'lining',opt:{lex:true}}));};
      card.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>{if(M.mode===b.dataset.mm)return;M.mode=b.dataset.mm;const d=M.drug;reset();M.drug=d;card.querySelectorAll('[data-mm]').forEach(y=>y.setAttribute('aria-checked',y===b));render();if(M.mode==='plt')api.discover('lex_plt',true);});
      render();},
    press(p){for(const d of S.drug)if(d.st==='free'&&!d.leave&&Math.hypot(p.x-d.x,p.y-d.y)<34){drag=d;return;}},
    move(p){if(drag){drag.x=clamp(p.x,150,850);drag.y=clamp(p.y,60,MY-40);if(bindNear(drag))drag=null;}},
    release(){drag=null;},
    tap(p,api){for(const d of S.drug)if(Math.hypot(p.x-d.x,p.y-d.y)<30)return api.discover('lex_esc');
      for(const m of S.ht)if(Math.hypot(p.x-m.x,p.y-m.y)<26)return api.discover('lex_5ht');
      for(const q of S.pumps)if(Math.abs(p.x-q.x)<54&&Math.abs(p.y-MY)<72)return api.discover('lex_sert');
      if(p.y>MY+50)return api.discover(M.mode==='plt'?'lex_plt':'lex_neuron');
      if(p.y<MY-60)addDrug(1,clamp(p.x,150,850),Math.max(60,p.y));},
    draw,
  };
}

export const DIVE={color:'#78A0F4',top:{label:'Brainstem',size:'10 cm'},
  target:({centreOf})=>centreOf(['midbrain, nsn','Pons']),view:{dist:.3,azim:-90,elev:6},
  text:'Into the patient\'s brainstem, where her serotonin cells begin, and out to one of their nerve endings: see what Lexapro changes at a synapse over six weeks, then hold its target, the SERT pump, in a nerve ending and in a platelet.',
  steps:[['Synapse, 1 µm.','Serotonin released and pumped back. Step through six weeks on Lexapro and watch the cell\'s brake ease off, the classic explanation for the slow start.'],['SERT pump, 10 nm.','Lock pumps with escitalopram, then see the same pump in a platelet: the link to bleeding with ibuprofen.']],
  also:[],
  refs:['lbl_lexapro','charnay2010','coleman2016','meyer2004','kim2017','blier1994','harmer2017','taylor2006','berger2009','klein2006','lundberg2007','canobbio2019','hergovich2000','dvojkovic2021','deabajo2011','oka2014'],
  make:({jump})=>({levels:[synapseLevel(),sertLevel(jump)],guide:GUIDE_LX}),
};
