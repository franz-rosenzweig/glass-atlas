// Zofran dive: the gut wall and the nausea line to the brainstem → the 5-HT3 receptor, the ion channel ondansetron plugs.
// Mechanism, side effects, QT and serotonin-syndrome numbers from the Zofran label; receptor from Lummis 2012 and Basak 2020.
import { TAU, clamp, lerp, rand } from './dive.js';
import { rgba, nucleus } from './dive-ra.js';
import { cc } from './theme.js';

const Z={drug:'#DDB741',ht:'#FF8FB1',rec:'#62BED3',nerve:'#8FB0FF',fire:'#FFE36E',ec:'#E39A5B',ent:'#C9A27A',ion:'#7FD3A3',irr:'#B6E35A',ap:'#C08CFF',cap:'#D9475E'};
const LBL='rgba(236,230,218,.55)';
const font=api=>`${api?.phone?.()?14:11}px "Martian Mono", monospace`;
function label(x,t,px,py,al='left',api){x.fillStyle=LBL;x.font=font(api);x.textAlign=al;x.fillText(t,px,py);}
const poly=(x,cx,cy,r,n,rot=0)=>{x.beginPath();for(let i=0;i<n;i++){const a=rot+i/n*TAU;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();};
// serotonin: an indole (a hexagon fused to a pentagon) with its short side chain
function htG(x,cx,cy,s=1,col=Z.ht){x.save();x.translate(cx,cy);x.scale(s,s);x.strokeStyle=col;x.fillStyle=rgba(col,.3);x.lineWidth=2;x.lineJoin='round';
  poly(x,-6,0,7,6,Math.PI/6);x.fill();x.stroke();x.beginPath();x.moveTo(0,-3.5);x.lineTo(6,-6);x.lineTo(10,0);x.lineTo(6,6);x.lineTo(0,3.5);x.fill();x.stroke();
  x.beginPath();x.moveTo(6,-6);x.lineTo(9,-13);x.lineTo(15,-14);x.stroke();x.restore();}
// ondansetron: three fused rings (the carbazolone) with an imidazole hanging off
function ondG(x,cx,cy,s=1,col=Z.drug){x.save();x.translate(cx,cy);x.scale(s,s);x.strokeStyle=col;x.fillStyle=rgba(col,.35);x.lineWidth=2.2;x.lineJoin='round';
  poly(x,-15,0,8,6,Math.PI/6);x.fill();x.stroke();poly(x,0,0,6.5,5,-Math.PI/2);x.fill();x.stroke();poly(x,15,0,8,6,Math.PI/6);x.fill();x.stroke();
  x.beginPath();x.moveTo(20,-6);x.lineTo(24,-13);x.stroke();poly(x,28,-19,6,5,-Math.PI/2);x.fill();x.stroke();x.restore();}
// the receptor seen from above: five subunits around a pore, a pocket at every interface
function rec5(x,cx,cy,r,open=0,pk=null,t=0){x.save();x.translate(cx,cy);
  for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2;x.save();x.rotate(a);x.beginPath();x.ellipse(r*.56,0,r*.38,r*.27,0,0,TAU);x.fillStyle=rgba(Z.rec,.26);x.fill();x.strokeStyle=rgba(Z.rec,.95);x.lineWidth=Math.max(1.4,r*.02);x.stroke();
    x.beginPath();x.ellipse(r*.6,0,r*.2,r*.13,0,0,TAU);x.strokeStyle=rgba(Z.rec,.35);x.stroke();x.restore();}
  const pr=r*(.07+.13*open);x.fillStyle='#04070B';x.beginPath();x.arc(0,0,pr,0,TAU);x.fill();x.strokeStyle=rgba(Z.ion,.25+.7*open);x.lineWidth=Math.max(1.2,r*.015);x.stroke();
  for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2+Math.PI/5,px=Math.cos(a)*r*.74,py=Math.sin(a)*r*.74;const st=pk?pk[i]:0;
    x.fillStyle='rgba(4,7,11,.85)';x.beginPath();x.arc(px,py,r*.11,0,TAU);x.fill();x.strokeStyle=rgba(Z.rec,.6);x.lineWidth=1.2;x.stroke();
    if(st===1)htG(x,px,py,r*.0075,Z.ht);else if(st===2)ondG(x,px-r*.02,py+r*.01,r*.0052,Z.drug);}
  x.restore();}

export const GUIDE_Z={
  ond_ec:{name:'Enterochromaffin cell',kind:'Cell',size:'a gut-lining cell, tens of µm tall',draw:(x,cx,cy,s)=>{s*=1.5;x.fillStyle=rgba(Z.ec,.3);x.strokeStyle=Z.ec;x.lineWidth=2*s;x.beginPath();x.moveTo(cx-6*s,cy-40*s);x.lineTo(cx+6*s,cy-40*s);x.quadraticCurveTo(cx+24*s,cy+10*s,cx+18*s,cy+38*s);x.lineTo(cx-18*s,cy+38*s);x.quadraticCurveTo(cx-24*s,cy+10*s,cx-6*s,cy-40*s);x.fill();x.stroke();
      nucleus(x,cx,cy,7*s,9*s);x.fillStyle=Z.ht;for(let i=0;i<9;i++){x.beginPath();x.arc(cx-13*s+i*3.3*s,cy+30*s-(i%2)*5*s,2.6*s,0,TAU);x.fill();}},
    text:['A sensor cell scattered among the ordinary lining cells of the gut. It makes and stores serotonin and works as a sensor: what it releases starts the gut\'s own movement and fluid reflexes and sends messages up to the brain (Gershon 2007).','Chemotherapy makes these cells release serotonin, and so, it is thought, do some infections, such as rotavirus and cholera toxin (Zofran label; Babic 2014).']},
  ond_5ht:{name:'Serotonin (5-HT)',kind:'Signal molecule',size:'under 1 nm',draw:(x,cx,cy,s)=>htG(x,cx,cy,s*2.6),
    text:['The same molecule that works as a messenger in the brain. Most of it is made in the gut, where it works as a local signal between cells (Gershon 2007; Basak 2020).','It acts on many receptor types. Six of the seven families work through messengers inside the cell; 5-HT3 alone is an ion channel, a fast gate, and that is the one ondansetron blocks (Lummis 2012). Spent serotonin is cleared by a transporter that pulls it back into cells (Gershon 2007).']},
  ond_vagus:{name:'Vagus nerve endings',kind:'Sensory nerve',size:'fine endings on a long nerve',draw:(x,cx,cy,s)=>{x.strokeStyle=Z.nerve;x.lineWidth=3*s;x.lineCap='round';x.beginPath();x.moveTo(cx-50*s,cy+30*s);x.quadraticCurveTo(cx,cy+20*s,cx+10*s,cy-8*s);x.moveTo(cx+10*s,cy-8*s);x.lineTo(cx-4*s,cy-30*s);x.moveTo(cx+10*s,cy-8*s);x.lineTo(cx+30*s,cy-28*s);x.stroke();
      x.fillStyle=Z.rec;for(const [a,b] of [[-4,-30],[30,-28],[10,-8]]){x.beginPath();x.arc(cx+a*s,cy+b*s,4*s,0,TAU);x.fill();}},
    text:['The vagus carries a huge amount of sensory news from the chest and belly up to the brainstem. Its endings in the gut wall carry 5-HT3 receptors, so a burst of serotonin makes them fire (Zofran label; Babic 2014).','The same nerve also runs the other way, carrying the brainstem\'s orders back to the stomach.']},
  ond_ap:{name:'Area postrema and NTS',kind:'Brainstem centres',size:'small patches of the brainstem',draw:(x,cx,cy,s)=>{x.fillStyle='rgba(143,176,255,.14)';x.beginPath();x.ellipse(cx,cy+8*s,48*s,36*s,0,0,TAU);x.fill();x.fillStyle='#04070B';x.beginPath();x.moveTo(cx-12*s,cy-28*s);x.lineTo(cx,cy-12*s);x.lineTo(cx+12*s,cy-28*s);x.fill();
      x.fillStyle=rgba(Z.ap,.75);x.beginPath();x.ellipse(cx,cy-6*s,12*s,7*s,0,0,TAU);x.fill();x.fillStyle=rgba(Z.nerve,.6);for(const d of [-1,1]){x.beginPath();x.ellipse(cx+d*20*s,cy+12*s,12*s,8*s,0,0,TAU);x.fill();}},
    text:['Two neighbours low in the brainstem. The nucleus of the solitary tract (NTS) receives the vagus and coordinates the nausea and vomiting reflexes. The area postrema has leaky capillaries with no blood–brain barrier, so it can taste the blood for toxins and drugs: it is the "chemoreceptor trigger zone" (Babic 2014).','The brainstem has more 5-HT3 receptors than anywhere else in the brain, especially in these two (Lummis 2012), which is why it is not certain whether ondansetron works mostly in the gut or in the brainstem (Zofran label).']},
  ond_5ht3:{name:'5-HT3 receptor',kind:'Ion channel',size:'a few nanometres',draw:(x,cx,cy,s,t)=>rec5(x,cx,cy,82*s,.6,[1,0,2,1,0],t),
    text:['Five protein subunits ring a water-filled pore through the cell membrane. Serotonin binds in pockets between neighbouring subunits, the pore opens, and positive ions flow through, mostly sodium and potassium, with some calcium, and the nerve fires (Lummis 2012).','It is the only serotonin receptor that is an ion channel; it belongs to the same family as the nicotine receptor for acetylcholine (Lummis 2012).']},
  ond_drug:{name:'Ondansetron',kind:'Medicine · 5-HT3 blocker',size:'under 1 nm',draw:(x,cx,cy,s)=>ondG(x,cx-6*s,cy+6*s,s*2.4),
    text:['A "setron": it sits in serotonin\'s pocket on the 5-HT3 receptor, holds on tightly, and doesn\'t open the pore, so serotonin finds the pocket taken. That is competitive blocking (Basak 2020). It is not a dopamine blocker (Zofran label).','Drugs in general stop vomiting more reliably than they stop nausea itself (Andrews 2006).','It doesn\'t speed the stomach: the label says plainly that it does not stimulate the movement of the stomach or gut, and with days of use it slows the colon (Zofran label).']},
};

/* ---------------- level A: the gut wall, and the line to the brainstem */
function wallLevel(){
  const COLS=Array.from({length:21},(_,i)=>-16+i*32);const ECI=[7,12,17];
  const EC=ECI.map(i=>({x:COLS[i],y:225,fire:0}));
  const ENDS=EC.map(e=>{const ex=e.x+4;return {x:ex,y:304,act:0,cool:0,path:[[ex,304],[ex-10,380],[ex+30,470],[605,470],[690,404],[738,236]]};});
  for(const e of ENDS){e.len=[0];for(let i=1;i<e.path.length;i++)e.len.push(e.len[i-1]+Math.hypot(e.path[i][0]-e.path[i-1][0],e.path[i][1]-e.path[i-1][1]));}
  const along=(e,d)=>{const L=e.len;let i=1;while(i<L.length-1&&L[i]<d)i++;const u=clamp((d-L[i-1])/(L[i]-L[i-1]),0,1);return [lerp(e.path[i-1][0],e.path[i][0],u),lerp(e.path[i-1][1],e.path[i][1],u)];};
  const S={drug:false,irr:[],ht:[],spk:[],N:0,rel:0,sent:0,acc:0,blocked:0};
  function burst(cx){for(let i=0;i<26;i++)S.irr.push({x:cx!=null?cx+rand(-60,60):i%2?EC[i%3].x+rand(-24,24):rand(60,610),y:rand(-60,60),vy:rand(80,130),vx:rand(-10,10)});}
  function release(e){e.fire=1;S.rel+=.25;for(let i=0;i<9;i++)S.ht.push({x:e.x+rand(-8,8),y:282,vx:rand(-25,25),vy:rand(20,55),l:4});}
  function step(dt){
    S.acc+=dt*.5;while(S.acc>1){S.acc--;S.irr.push({x:rand(60,610),y:-10,vy:rand(60,110),vx:rand(-10,10)});}
    for(const m of S.irr){m.x+=m.vx*dt;m.y+=m.vy*dt;if(m.y>158&&!m.hit){m.hit=true;const e=EC.find(e=>Math.abs(e.x-m.x)<16);if(e&&e.fire<.6)release(e);}}
    S.irr=S.irr.filter(m=>m.y<175);
    for(const h of S.ht){h.vx+=rand(-60,60)*dt;h.vy+=rand(-40,40)*dt;h.x+=h.vx*dt;h.y=clamp(h.y+h.vy*dt,288,560);h.l-=dt;
      for(const e of ENDS)if(!h.done&&Math.hypot(h.x-e.x,h.y-e.y)<20){h.done=true;
        if(S.drug&&Math.random()<.92){S.blocked=1;h.vx*=-1;h.vy=-Math.abs(h.vy);}   // the pocket is taken
        else{h.l=0;e.act=1;if(e.cool<=0){e.cool=.18;S.spk.push({e,d:0});}}}}
    S.ht=S.ht.filter(h=>h.l>0);
    for(const s of S.spk){s.d+=dt*520;if(s.d>=s.e.len[s.e.len.length-1]&&!s.done){s.done=true;S.N=Math.min(1,S.N+(S.drug?.035:.07));S.sent++;}}
    S.spk=S.spk.filter(s=>!s.done);
    for(const e of EC)e.fire=Math.max(0,e.fire-dt*.5);for(const e of ENDS){e.act=Math.max(0,e.act-dt*2.5);e.cool-=dt;}
    S.N=Math.max(0,S.N-dt*.09);S.rel=Math.max(0,S.rel-dt*.3);S.blocked=Math.max(0,S.blocked-dt*1.5);
    S.rate=lerp(S.rate||0,S.spk.length,1-Math.exp(-dt*2));}
  function draw(x,dt,t,api){step(dt);
    x.fillStyle='#0B0F12';x.fillRect(-400,-300,1800,1300);
    x.save();x.beginPath();x.rect(-400,-300,1025,1300);x.clip();
    // lumen, lining, lamina propria, muscle
    x.fillStyle='#120F0C';x.fillRect(-400,-300,1025,460);
    x.fillStyle='#14101A';x.fillRect(-400,292,1025,270);x.strokeStyle='rgba(200,150,170,.08)';x.lineWidth=2;for(let i=0;i<70;i++){const sx=(i*137)%760-120,sy=300+(i*71)%250;x.beginPath();x.moveTo(sx,sy);x.bezierCurveTo(sx+30,sy-8,sx+60,sy+8,sx+90,sy);x.stroke();}
    x.fillStyle='#1A0F12';x.fillRect(-400,562,1025,400);for(let r=0;r<4;r++)for(let i=-2;i<16;i++){const cx=i*52+(r%2)*26,cy=590+r*30;x.fillStyle='rgba(224,120,130,.16)';x.beginPath();x.ellipse(cx,cy,24,7,0,0,TAU);x.fill();x.fillStyle='rgba(91,134,255,.5)';x.beginPath();x.ellipse(cx,cy,5,2,0,0,TAU);x.fill();}
    for(const cx of [290,450]){x.strokeStyle='rgba(217,71,94,.7)';x.lineWidth=9;x.beginPath();x.moveTo(cx-14,560);x.lineTo(cx-14,330);x.arc(cx,330,14,Math.PI,0);x.lineTo(cx+14,560);x.stroke();}
    COLS.forEach((cx,i)=>{const top=160+Math.sin(i*1.3)*3;const isEC=ECI.includes(i);
      if(isEC){const e=EC[ECI.indexOf(i)];x.fillStyle=rgba(Z.ec,.28+e.fire*.3);x.strokeStyle=rgba(Z.ec,.95);x.lineWidth=2;x.beginPath();x.moveTo(cx-4,top);x.lineTo(cx+4,top);x.quadraticCurveTo(cx+17,top+70,cx+14,290);x.lineTo(cx-14,290);x.quadraticCurveTo(cx-17,top+70,cx-4,top);x.fill();x.stroke();
        nucleus(x,cx,top+62,6,8);if(e.fire<.5){x.fillStyle=Z.ht;for(let k=0;k<7;k++){x.beginPath();x.arc(cx-10+k*3.4,282-(k%2)*5,2.3,0,TAU);x.fill();}}}
      else{x.fillStyle='rgba(201,162,122,.2)';x.strokeStyle='rgba(201,162,122,.55)';x.lineWidth=1.5;x.beginPath();x.roundRect(cx-14,top,28,130,5);x.fill();x.stroke();nucleus(x,cx,top+90,6,9);
        x.strokeStyle='rgba(201,162,122,.5)';x.lineWidth=1.5;for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(cx+k*5,top);x.lineTo(cx+k*5,top-9);x.stroke();}}});
    x.strokeStyle='rgba(236,230,218,.18)';x.lineWidth=2;x.beginPath();x.moveTo(-400,292);x.lineTo(625,292);x.stroke();
    // nerve fibres and their endings
    x.strokeStyle=rgba(Z.nerve,.8);x.lineWidth=7;x.lineCap='round';x.beginPath();x.moveTo(110,470);x.lineTo(605,470);x.stroke();
    for(const e of ENDS){x.strokeStyle=rgba(Z.nerve,.75);x.lineWidth=3;x.beginPath();e.path.slice(0,3).forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();
      for(const [dx,dy] of [[-10,-6],[8,-8],[0,0]]){const rx=e.x+dx,ry=e.y+dy;x.fillStyle=e.act>.2?Z.fire:Z.rec;x.beginPath();x.arc(rx,ry,4.5,0,TAU);x.fill();
        if(S.drug){x.fillStyle=Z.drug;x.beginPath();x.roundRect(rx-4,ry-9,8,5,2);x.fill();}}}
    x.restore();
    x.strokeStyle='rgba(236,230,218,.2)';x.lineWidth=1.5;x.beginPath();x.moveTo(625,-300);x.lineTo(625,1000);x.stroke();
    // the trunk leaving the gut, then the brainstem inset
    x.strokeStyle=rgba(Z.nerve,.8);x.lineWidth=7;x.lineCap='round';x.beginPath();x.moveTo(605,470);x.lineTo(690,404);x.lineTo(738,236);x.stroke();
    x.fillStyle='#0E1218';x.strokeStyle='rgba(236,230,218,.25)';x.lineWidth=1.5;x.beginPath();x.roundRect(648,70,210,350,8);x.fill();x.stroke();
    x.fillStyle='rgba(143,176,255,.10)';x.beginPath();x.ellipse(753,260,92,140,0,0,TAU);x.fill();
    x.fillStyle='#04070B';x.beginPath();x.moveTo(720,118);x.lineTo(753,160);x.lineTo(786,118);x.fill();
    x.strokeStyle=rgba(Z.cap,.75);x.lineWidth=6;x.beginPath();x.moveTo(858,176);x.quadraticCurveTo(810,168,778,172);x.stroke();
    x.fillStyle=rgba(Z.ap,.35+S.N*.4);x.beginPath();x.ellipse(753,174,24,12,0,0,TAU);x.fill();
    for(const d of [-1,1]){x.fillStyle=rgba(Z.nerve,.22+S.N*.5);x.beginPath();x.ellipse(753+d*28,234,22,14,0,0,TAU);x.fill();}
    for(const [rx,ry] of [[742,172],[764,172],[725,236],[781,236]]){x.fillStyle=Z.rec;x.beginPath();x.arc(rx,ry,3.5,0,TAU);x.fill();if(S.drug){x.fillStyle=Z.drug;x.beginPath();x.roundRect(rx-3.5,ry-8,7,4.5,2);x.fill();}}
    const g=x.createLinearGradient(700,0,806,0);g.addColorStop(0,'rgba(255,227,110,0)');g.addColorStop(.5,`rgba(255,227,110,${.12+S.N*.75})`);g.addColorStop(1,'rgba(255,227,110,0)');x.fillStyle=g;x.fillRect(690,300,126,26);
    // irritants, serotonin, signals
    x.fillStyle=Z.irr;for(const m of S.irr){x.beginPath();for(let k=0;k<8;k++){const a=k/8*TAU+m.x*.1,r=k%2?2:5;x.lineTo(m.x+Math.cos(a)*r,m.y+Math.sin(a)*r);}x.fill();}
    x.fillStyle=Z.ht;for(const h of S.ht){x.globalAlpha=clamp(h.l,0,1);x.beginPath();x.arc(h.x,h.y,2.6,0,TAU);x.fill();}x.globalAlpha=1;
    for(const s of S.spk){const [px,py]=along(s.e,s.d);x.fillStyle=Z.fire;x.beginPath();x.arc(px,py,5,0,TAU);x.fill();x.fillStyle='rgba(255,227,110,.3)';x.beginPath();x.arc(px,py,10,0,TAU);x.fill();}
    label(x,'GUT CONTENTS',150,40,'left',api);label(x,'LINING',150,138,'left',api);label(x,'VAGUS NERVE',150,500,'left',api);label(x,'MUSCLE LAYER',150,690,'left',api);
    x.font=`${api.phone()?12:10}px "Martian Mono", monospace`;x.fillStyle=LBL;x.textAlign='center';x.fillText('BRAINSTEM · INSET',753,92);x.fillText('AREA POSTREMA',753,204);x.fillText('NTS',753,268);x.fillText('NAUSEA, VOMITING',753,346);x.fillText('BLOOD',832,158);
    ui(api);}
  let last=0;function ui(api){const n=performance.now();if(n-last<150)return;last=n;const q=s=>api.card.querySelector(s);if(!q('#zw-n'))return;
    const set=(k,v,txt)=>{q('#zw-'+k).textContent=txt??Math.round(v*100)+'%';q('#zw-'+k+'B').style.width=clamp(v,0,1)*100+'%';};
    set('r',clamp(S.rel,0,1));set('v',clamp(S.rate/6,0,1),S.spk.length?'firing':'quiet');set('n',S.N);
    q('#zw-c').textContent=S.drug?'slower with regular use':'usual';}
  return {id:'wall',label:'Gut wall',size:'250 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:100,label:'25 µm (gut wall)'},zoomFocus:{x:EC[1].x,y:300},
    card(){return `<p class="k">Level 1 · tissue</p><h2>Where nausea starts</h2>
      <p>Among the ordinary cells lining the gut sit enterochromaffin cells (ochre), sensors packed with serotonin (pink). When something irritates the gut, they release it onto the endings of the vagus nerve, which fire. The signal runs up the vagus to the brainstem, where the NTS and the area postrema, a patch that also samples the blood, set off nausea and vomiting. Ondansetron blocks serotonin's 5-HT3 receptor at both ends of that line.</p>
      <div class="dv-meter"><span>Serotonin released</span><b id="zw-r">0%</b><i><u id="zw-rB" style="background:${cc('#FF8FB1')}"></u></i></div>
      <div class="dv-meter"><span>Signals up the vagus</span><b id="zw-v">quiet</b><i><u id="zw-vB" style="background:${cc('#FFE36E')}"></u></i></div>
      <div class="dv-meter"><span>Nausea signal in the brainstem</span><b id="zw-n">0%</b><i><u id="zw-nB"></u></i></div>
      <div class="dv-meter"><span>Stomach emptying (ACG 2022)</span><b>slow · unchanged</b><i><u style="width:28%;background:${cc('#7E8E90')}"></u></i></div>
      <div class="dv-meter"><span>Colon</span><b id="zw-c">usual</b></div>
      <div class="dv-btns"><button class="dv-btn go" id="zw-t" type="button">Irritate the gut</button><button class="dv-btn" id="zw-d" type="button">Ondansetron<small>off</small></button></div>
      <div class="dv-btns"><button class="dv-btn" id="zw-go" type="button">Zoom into one receptor<small>the pocket it plugs</small></button></div>
      <p>What it doesn't do is make the stomach empty faster: a single dose into a vein had no effect on stomach movement in healthy volunteers, and the label says it does not stimulate the stomach or gut (Zofran label). In gastroparesis, nausea is linked to the stomach's own slowed, disordered movement (Babic 2014), and the gastroparesis guideline suggests antinausea drugs for relief while noting they don't improve emptying (ACG 2022). In the label's chemotherapy trials, headache (24% against 13% on placebo) and tiredness (13% against 2%) were the commonest side effects; constipation (9% against under 1%) matters most on top of a slow gut, because with days of use it slows the colon. The label also warns it can hide a worsening blockage or a swollen, stalled stomach.</p>
      <p class="dv-fine">The gut wall is drawn to scale (25 µm bar), schematic in detail; the brainstem is an inset, not to scale. Whether ondansetron works mostly in the gut or in the brainstem isn't certain (Zofran label). Chemotherapy is the trigger the label describes. Sources: Zofran label; Gershon 2007; Babic 2014; Lummis 2012; ACG 2022. Tap cells, nerves and the brainstem to collect them; tap the gut contents to irritate one spot.</p>`;},
    bind(card,api){card.querySelector('#zw-t').onclick=()=>burst();
      const d=card.querySelector('#zw-d');d.onclick=()=>{S.drug=!S.drug;d.classList.toggle('on',S.drug);d.querySelector('small').textContent=S.drug?'on: 5-HT3 blocked':'off';if(S.drug)api.discover('ond_drug',true);};
      card.querySelector('#zw-go').onclick=()=>api.go('receptor',{from:{x:EC[1].x,y:300}});},
    tap(p,api){if(p.x>648&&p.x<858&&p.y>70&&p.y<420)return api.discover('ond_ap');
      if(p.y<158&&p.x<625)return burst(p.x);
      for(const e of EC)if(Math.abs(p.x-e.x)<20&&p.y>158&&p.y<292)return api.discover('ond_ec');
      if(S.ht.some(h=>Math.hypot(h.x-p.x,h.y-p.y)<24))return api.discover('ond_5ht');
      for(const e of ENDS)if(Math.hypot(p.x-e.x,p.y-e.y)<26)return api.discover(S.drug?'ond_drug':'ond_5ht3');
      if(Math.abs(p.y-470)<22||ENDS.some(e=>Math.abs(p.x-e.x)<30&&p.y>292&&p.y<470))return api.discover('ond_vagus');},
    draw,
  };
}

/* ---------------- level B: one receptor */
function receptorLevel(){
  const CX=400,CY=300,R=210;let S;
  const pkPos=i=>{const a=i/5*TAU-Math.PI/2+Math.PI/5;return {x:CX+Math.cos(a)*R*.74,y:CY+Math.sin(a)*R*.74};};
  function reset(){S={cD:0,surge:0,pk:[0,0,0,0,0],open:0,V:-70,trace:[],spikes:[],ions:[],mol:[],acc:0,openT:0,T:0,sig:0};}
  reset();
  function step(dt){S.T+=dt;S.surge=Math.max(0,S.surge-dt*.3);const cS=.12+S.surge,cD=S.cD;
    // each pocket: empty, serotonin (comes and goes fast) or ondansetron (holds on); illustrative rates
    for(let i=0;i<5;i++){const st=S.pk[i];
      if(st===0){const a=cS*4*dt,b=cD*8*dt,r=Math.random();if(r<a)S.pk[i]=1;else if(r<a+b)S.pk[i]=2;}
      else if(st===1&&Math.random()<1.6*dt)S.pk[i]=0;else if(st===2&&Math.random()<.5*dt)S.pk[i]=0;}
    const nS=S.pk.filter(v=>v===1).length;S.open=lerp(S.open,nS>=2?clamp((nS-1)/3,0,1):0,1-Math.exp(-dt*9));if(S.open>.3)S.openT+=dt;
    S.V+=(S.open*260-(S.V+70)*3)*dt;if(S.V>0)S.V=-78;else if(S.V>-48){S.V=28;S.spikes.push(S.T);}
    S.tAcc=(S.tAcc||0)+dt;while(S.tAcc>1/60){S.tAcc-=1/60;S.trace.push(S.V);}while(S.trace.length>360)S.trace.shift();S.spikes=S.spikes.filter(t=>S.T-t<2);S.sig=lerp(S.sig,S.spikes.length/2,1-Math.exp(-dt*3));
    if(S.open>.15){S.acc+=dt*S.open*60;while(S.acc>1){S.acc--;const a=rand(0,TAU);S.ions.push({a,r:R*1.12,sp:rand(160,240)});}}
    for(const o of S.ions)o.r-=o.sp*dt;S.ions=S.ions.filter(o=>o.r>R*(.07+.13*S.open)*.6);
    // free molecules drifting around, for the eye: more serotonin in a surge, gold when the drug is in
    const want=Math.round(4+cS*11),wantD=Math.round(cD*7);const nm=S.mol.filter(m=>!m.d).length,nd=S.mol.filter(m=>m.d).length;
    if(nm<want)S.mol.push({d:false,x:rand(160,640),y:Math.random()<.5?rand(70,100):rand(495,520),vx:rand(-30,30),vy:rand(-30,30)});else if(nm>want){const m=S.mol.find(m=>!m.d);m.gone=true;}
    if(nd<wantD)S.mol.push({d:true,x:rand(160,640),y:Math.random()<.5?rand(70,100):rand(495,520),vx:rand(-20,20),vy:rand(-20,20)});else if(nd>wantD){const m=S.mol.find(m=>m.d);m.gone=true;}
    S.mol=S.mol.filter(m=>!m.gone);
    for(const m of S.mol){m.vx+=rand(-50,50)*dt;m.vy+=rand(-50,50)*dt;m.vx*=.98;m.vy*=.98;m.x+=m.vx*dt;m.y+=m.vy*dt;
      const d=Math.hypot(m.x-CX,m.y-CY);if(d<R*1.05){m.x=CX+(m.x-CX)/d*R*1.05;m.y=CY+(m.y-CY)/d*R*1.05;m.vx*=-1;m.vy*=-1;}
      m.x=clamp(m.x,150,650);m.y=clamp(m.y,70,520);}}
  function draw(x,dt,t,api){step(dt);
    x.fillStyle='#0A0E14';x.fillRect(-400,-300,1800,1300);
    // membrane seen from above as a pale lipid field
    x.fillStyle='rgba(236,230,218,.04)';for(let i=0;i<260;i++){const px=(i*97)%720+100,py=(i*53)%560+20;x.beginPath();x.arc(px,py,3,0,TAU);x.fill();}
    for(const o of S.ions){x.fillStyle=Z.ion;x.beginPath();x.arc(CX+Math.cos(o.a)*o.r,CY+Math.sin(o.a)*o.r,4,0,TAU);x.fill();}
    rec5(x,CX,CY,R,S.open,S.pk,t);
    for(const m of S.mol)m.d?ondG(x,m.x,m.y,.8):htG(x,m.x,m.y,.9);
    label(x,'TOP VIEW · THE NERVE ENDING\'S MEMBRANE',150,36,'left',api);
    if(S.open>.5){x.fillStyle=rgba(Z.ion,.95);x.font=font(api);x.textAlign='center';x.fillText('Na⁺',CX,CY+4);}
    // side view: the same channel cut through the membrane
    const sx=760,mTop=280,mBot=330,gap=6+S.open*16;
    x.fillStyle='#0E1218';x.strokeStyle='rgba(236,230,218,.22)';x.lineWidth=1.5;x.beginPath();x.roundRect(668,80,184,400,8);x.fill();x.stroke();
    x.fillStyle='rgba(236,230,218,.1)';x.fillRect(668,mTop,184,mBot-mTop);x.fillStyle='rgba(236,230,218,.25)';for(let k=0;k<12;k++){x.beginPath();x.arc(676+k*16,mTop+4,4,0,TAU);x.arc(676+k*16,mBot-4,4,0,TAU);x.fill();}
    for(const sg of [-1,1]){x.fillStyle=rgba(Z.rec,.3);x.strokeStyle=rgba(Z.rec,.95);x.lineWidth=1.8;x.beginPath();x.roundRect(sx+sg*gap-(sg<0?34:0),150,34,200,10);x.fill();x.stroke();
      const st=S.pk[sg<0?0:2];const py=210;x.fillStyle='rgba(4,7,11,.85)';x.beginPath();x.arc(sx+sg*(gap+34),py,9,0,TAU);x.fill();
      if(st===1)htG(x,sx+sg*(gap+34),py,.7);else if(st===2)ondG(x,sx+sg*(gap+34)-2,py+1,.42);}
    if(S.open>.15)for(let k=0;k<4;k++){const yy=150+((t*140+k*55)%230);x.fillStyle=Z.ion;x.beginPath();x.arc(sx,yy,3.5,0,TAU);x.fill();}
    x.font=`${api.phone()?12:10}px "Martian Mono", monospace`;x.fillStyle=LBL;x.textAlign='center';x.fillText('SIDE VIEW',sx,104);x.fillText('OUTSIDE',sx,130);x.fillText('INSIDE THE NERVE',sx,400);x.fillText(S.open>.3?'OPEN':'SHUT',sx,440);
    // the nerve ending's voltage
    const y0=566,h=62,x0=150,x1=850;x.strokeStyle='rgba(236,230,218,.15)';x.lineWidth=1;x.setLineDash([4,5]);const yth=y0+h-(-48+80)/110*h;x.beginPath();x.moveTo(x0,yth);x.lineTo(x1,yth);x.stroke();x.setLineDash([]);
    x.strokeStyle=Z.fire;x.lineWidth=2;x.beginPath();S.trace.forEach((v,i)=>{const px=x1-(S.trace.length-1-i)*(x1-x0)/360,py=y0+h-(v+80)/110*h;i?x.lineTo(px,py):x.moveTo(px,py);});x.stroke();
    label(x,'NERVE ENDING VOLTAGE · EACH SPIKE IS ONE SIGNAL UP THE VAGUS',x0,y0-8,'left',api);
    ui(api);}
  let last=0;function ui(api){const n=performance.now();if(n-last<150)return;last=n;const q=s=>api.card.querySelector(s);if(!q('#zr-s'))return;
    q('#zr-s').textContent=S.pk.filter(v=>v===1).length+' of 5';q('#zr-d').textContent=S.pk.filter(v=>v===2).length+' of 5';
    q('#zr-o').textContent=S.open>.3?'open':'shut';q('#zr-oB').style.width=S.open*100+'%';q('#zr-g').textContent=S.sig.toFixed(1)+' a second';q('#zr-gB').style.width=clamp(S.sig/5,0,1)*100+'%';}
  return {id:'receptor',label:'Receptor',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:CX,y:CY},
    card(){return `<p class="k">Level 2 · molecules</p><h2>The pocket it plugs</h2>
      <p>Seen from above, five protein subunits ring a pore through the nerve's membrane. Serotonin binds in pockets between neighbouring subunits; with enough of them filled the pore opens, positive ions (mostly sodium) rush in, and the nerve fires. Ondansetron (gold) fits the same pockets but doesn't open the pore, and it holds on, so serotonin finds them taken. <b style="color:var(--bone)">Set the drug level, then send a serotonin surge.</b></p>
      <label class="dv-meter"><span>Ondansetron around the receptor</span><b id="zr-cv">none</b></label><input id="zr-c" type="range" min="0" max="1" step=".01" value="0" style="width:100%;accent-color:${cc('#DDB741')}">
      <div class="dv-btns"><button class="dv-btn go" id="zr-surge" type="button">Serotonin surge</button></div>
      <div class="dv-meter"><span>Pockets holding serotonin</span><b id="zr-s">0 of 5</b></div>
      <div class="dv-meter"><span>Pockets holding ondansetron</span><b id="zr-d">0 of 5</b></div>
      <div class="dv-meter"><span>Pore</span><b id="zr-o">shut</b><i><u id="zr-oB" style="background:${cc('#7FD3A3')}"></u></i></div>
      <div class="dv-meter"><span>Signals to the brainstem</span><b id="zr-g">0</b><i><u id="zr-gB" style="background:${cc('#FFE36E')}"></u></i></div>
      <p class="sub">Two warnings on the label</p>
      <p><b style="color:var(--bone)">QT.</b> Ondansetron can lengthen the heart's QT interval. In the label's study, 32 mg into a vein lengthened it (QTcF) by about 20 ms at peak, and 8 mg by about 6 ms, which the label calls not clinically relevant. The patient's Lexapro and hydroxychloroquine lengthen QT too, and the label advises ECG monitoring alongside other QT drugs or low potassium or magnesium.</p>
      <p><b style="color:var(--bone)">Serotonin syndrome.</b> Odd for a serotonin blocker, but it has been reported, mostly alongside other serotonergic drugs such as SSRIs. The patient takes Lexapro, an SSRI, and Adderall, whose own label counts amphetamine among them. New agitation, fever, sweating, shaking or twitching after a dose would need a call.</p>
      <p class="dv-fine">The receptor's shape and the competition are real (Lummis 2012; Basak 2020); the binding rates and "two or more pockets opens it" are illustrative. Sources: Zofran label; Adderall XR label; Lummis 2012; Basak 2020. Tap the pockets, the pore and the trace to collect them.</p>`;},
    bind(card,api){const r=card.querySelector('#zr-c'),v=card.querySelector('#zr-cv');r.oninput=()=>{S.cD=+r.value;v.textContent=S.cD<.02?'none':S.cD<.4?'a little':S.cD<.8?'some':'a full dose';};
      card.querySelector('#zr-surge').onclick=()=>{S.surge=1.2;};},
    tap(p,api){for(let i=0;i<5;i++){const q=pkPos(i);if(Math.hypot(p.x-q.x,p.y-q.y)<34)return api.discover(S.pk[i]===2?'ond_drug':S.pk[i]===1?'ond_5ht':'ond_5ht3');}
      for(const m of S.mol)if(Math.hypot(m.x-p.x,m.y-p.y)<26)return api.discover(m.d?'ond_drug':'ond_5ht');
      if(Math.hypot(p.x-CX,p.y-CY)<R||(p.x>668&&p.y>80&&p.y<480))return api.discover('ond_5ht3');
      if(p.y>540)return api.discover('ond_vagus');},
    draw,
  };
}

export const DIVE={color:'#DDB741',top:{label:'Gut',size:'10 cm'},
  target:({centreOf})=>centreOf(['Jejunum']),view:{dist:.2,azim:-15,elev:6},
  text:'Into the wall of the patient\'s gut, where serotonin sets off the nausea signal that runs up the vagus nerve to the brainstem, then down to the single receptor that ondansetron plugs.',
  steps:[['Gut wall, 250 µm.','Irritate the gut and watch the signal climb to the brainstem; switch ondansetron on. What it changes, and what it doesn\'t: the slow stomach.'],['Receptor, 10 nm.','Serotonin and ondansetron compete for the same five pockets. Plus the label\'s two warnings: QT and serotonin syndrome.']],
  also:[],
  refs:['lbl_zofran','lbl_adderall','acg2022','gershon2007','babic2014','andrews2006','lummis2012','basak2020'],
  make:()=>({levels:[wallLevel(),receptorLevel()],guide:GUIDE_Z}),
};
