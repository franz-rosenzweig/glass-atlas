// Iron dive: the duodenal lining → one gut cell and its single exit door, over fourteen days of doses.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba, nucleus } from './dive-ra.js';

const FE='#E8A23A';
export const GUIDE_I={
  entero:{name:'Enterocyte',kind:'Cell',size:'about 20–30 µm tall',draw:(x,cx,cy,s)=>{x.fillStyle='rgba(217,164,65,.25)';x.strokeStyle='#D9A441';x.lineWidth=2*s;x.beginPath();x.roundRect(cx-18*s,cy-40*s,36*s,80*s,6*s);x.fill();x.stroke();nucleus(x,cx,cy+18*s,8*s,10*s);},
    text:['A gut lining cell with a fuzzy "brush border" facing the food. In the duodenum and upper jejunum it is where dietary iron gets in.','The lining renews every few days: old cells are shed into the gut, taking any iron they were still holding with them.']},
  dmt1:{name:'DMT1 and DcytB',kind:'Transporter + enzyme',size:'nanometres',draw:(x,cx,cy,s)=>{x.fillStyle='#71C6FF';x.beginPath();x.roundRect(cx-10*s,cy-24*s,20*s,48*s,8*s);x.fill();x.fillStyle='#FF9F43';x.beginPath();x.arc(cx+24*s,cy,9*s,0,TAU);x.fill();},
    text:['Iron in plant foods is mostly ferric (Fe³⁺), which can\'t get in as it is. An enzyme on the brush border, DcytB, converts it to ferrous iron (Fe²⁺), and the transporter DMT1 carries that inside. Most iron tablets (ferrous sulfate, gluconate, fumarate) are already ferrous.','Vitamin C mainly helps iron from food, by keeping it ferrous and soluble. With a tablet taken on an empty stomach the boost is small, and guidelines don\'t require it.']},
  ferritin:{name:'Ferritin',kind:'Storage protein',size:'about 12 nm',draw:(x,cx,cy,s)=>{x.strokeStyle='#D9A441';x.lineWidth=4*s;x.beginPath();x.arc(cx,cy,24*s,0,TAU);x.stroke();x.fillStyle=FE;for(let i=0;i<6;i++){x.beginPath();x.arc(cx+Math.cos(i)*10*s,cy+Math.sin(i*1.4)*10*s,3.5*s,0,TAU);x.fill();}},
    text:['A hollow protein cage that stores iron safely inside cells. The ferritin blood test reflects how full the body\'s cages are: about 8 mg of stored iron for every ng/mL.']},
  fpn:{name:'Ferroportin',kind:'The only exit door',size:'nanometres',draw:(x,cx,cy,s)=>{x.fillStyle='#7FD3A3';x.beginPath();x.roundRect(cx-22*s,cy-14*s,14*s,28*s,4*s);x.roundRect(cx+8*s,cy-14*s,14*s,28*s,4*s);x.fill();},
    text:['The only known way iron leaves a cell into the blood. Every enterocyte, liver cell and recycling macrophage uses it.','Hepcidin shuts it, which makes ferroportin the body\'s master valve for iron.']},
  hepcidin:{name:'Hepcidin',kind:'Hormone from the liver',size:'a small peptide',draw:(x,cx,cy,s)=>{x.strokeStyle='#F2705F';x.lineWidth=4*s;x.beginPath();x.arc(cx-8*s,cy,10*s,0,TAU);x.moveTo(cx+2*s,cy);x.lineTo(cx+30*s,cy);x.moveTo(cx+22*s,cy);x.lineTo(cx+22*s,cy+8*s);x.stroke();},
    text:['The liver releases it when iron is plentiful, after an iron dose, and during inflammation. It binds ferroportin and the door is pulled inside and destroyed.','After a 60 mg dose it is still raised the next day, and absorption from a second dose falls by about 35–45% (Moretti 2015). That is the case for every-other-day dosing.']},
  tf:{name:'Transferrin',kind:'Carrier protein in blood',size:'about 8 nm',draw:(x,cx,cy,s)=>{x.fillStyle='#C97B5A';x.beginPath();x.arc(cx-12*s,cy,14*s,.4,TAU-.4);x.lineTo(cx-12*s,cy);x.fill();x.beginPath();x.arc(cx+16*s,cy,14*s,.4,TAU-.4);x.lineTo(cx+16*s,cy);x.fill();x.fillStyle=FE;x.beginPath();x.arc(cx-12*s,cy,4*s,0,TAU);x.arc(cx+16*s,cy,4*s,0,TAU);x.fill();},
    text:['The blood\'s iron taxi, with two seats. "Transferrin saturation" on a lab report is how many seats are taken; under about 16–20% means red-cell factories are short.']},
};

/* ---------------- level A: villi */
function villusLevel(){
  const V=[150,290,430,570,710,850];const drops=[];let dose=0;
  return {id:'villi',label:'Lining',size:'1 mm',fit:'cover',bar:{units:100,label:'100 µm'},zoomFocus:{x:430,y:240},
    card(){return `<p class="k">Level 1 · tissue</p><h2>The duodenum's lining</h2>
      <p>Just past the stomach, the gut wall folds into finger-like villi, each covered in absorbing cells with a blood vessel in its core. Nearly all the iron the patient absorbs gets in here, through these cells.</p>
      <div class="dv-btns"><button class="dv-btn go" id="iv-d" type="button">Swallow a 60 mg tablet</button><button class="dv-btn" id="iv-go" type="button">Zoom into one cell<small>the iron door, 14 days</small></button></div>
      <p class="dv-fine">Drawn to scale (100 µm bar), simplified. Most of a tablet's iron passes straight through, which is part of why oral iron upsets the gut. Tap the lining to collect its cells.</p>`;},
    bind(card,api){card.querySelector('#iv-d').onclick=()=>{for(let i=0;i<120;i++)drops.push({x:rand(80,920),y:rand(-200,0),vy:rand(60,110),in:false,v:Math.floor(rand(0,6))});dose++;};card.querySelector('#iv-go').onclick=()=>api.go('cell',{from:{x:430,y:240}});},
    tap(p,api){if(p.y>140)api.discover('entero');},
    draw(x,dt,t){x.fillStyle='#120F0B';x.fillRect(-400,-300,1800,1300);
      x.fillStyle='#2A1E10';x.fillRect(-400,600,1800,400);
      for(const vx of V){const top=120+((vx*7)%40);x.fillStyle='#3A2A18';x.beginPath();x.moveTo(vx-52,620);x.lineTo(vx-52,top+50);x.arc(vx,top+50,52,Math.PI,0);x.lineTo(vx+52,620);x.fill();
        // enterocyte layer
        for(let k=0;k<26;k++){const u=k/25;let px,py;if(u<.35){px=vx-46;py=lerp(600,top+50,u/.35);}else if(u<.65){const a=Math.PI+(u-.35)/.3*Math.PI;px=vx+Math.cos(a)*46;py=top+50+Math.sin(a)*46;}else{px=vx+46;py=lerp(top+50,600,(u-.65)/.35);}
          x.fillStyle='rgba(217,164,65,.35)';x.beginPath();x.arc(px,py,8,0,TAU);x.fill();x.fillStyle='rgba(91,134,255,.8)';x.beginPath();x.arc(px,py,3,0,TAU);x.fill();}
        x.strokeStyle='rgba(200,50,70,.75)';x.lineWidth=7;x.beginPath();x.moveTo(vx-10,620);x.lineTo(vx-10,top+60);x.arc(vx,top+60,10,Math.PI,0);x.lineTo(vx+10,620);x.stroke();}
      for(const d of drops){d.y+=d.vy*dt;const vx=V[d.v];if(!d.in&&d.y>140&&Math.abs(d.x-vx)<56&&Math.random()<.004){d.in=true;}
        if(d.in){d.x=lerp(d.x,vx,dt*2);d.vy=40;}x.fillStyle=d.in?'#FFD27A':FE;x.beginPath();x.arc(d.x,d.y,d.in?3.5:2.6,0,TAU);x.fill();}
      for(let i=drops.length-1;i>=0;i--)if(drops[i].y>720)drops.splice(i,1);
      x.fillStyle='rgba(236,230,218,.55)';x.font='11px "Martian Mono", monospace';x.textAlign='left';x.fillText('GUT CONTENTS',20,40);x.fillText('VILLUS',V[0]+60,300);x.fillText('BLOOD',20,660);},
  };
}

/* ---------------- level B: one enterocyte, 14 days */
function cellLevel(){
  const L={x0:360,x1:640,y0:150,y1:560};const DOORS=[410,500,590];let S;
  function reset(){S={day:1,ph:0,playing:false,plan:'none',comp:'water',H:0,lumen:[],inside:[],stored:0,blood:0,lost:0,doses:0,absorbed:0,doors:DOORS.map(x=>({x,open:1})),taxis:[],shed:0,done:false,taken:false,log:[]};}
  reset();
  const COMP={water:{l:'Water',f:1},oj:{l:'Orange juice',f:1.1},coffee:{l:'Coffee or tea',f:.6},dairy:{l:'Milk or calcium',f:.6}};
  function takeDose(api){if(S.taken||S.done)return;S.taken=true;S.doses++;const f=.22*COMP[S.comp].f*(1-.8*S.H);const n=40,inn=Math.round(n*clamp(f,0,1));
    const mg=60*f/Math.max(1,inn),dh=.9/Math.max(1,inn);for(let i=0;i<n;i++)S.lumen.push({x:i<inn?rand(L.x0+30,L.x1-30):rand(L.x0-180,L.x1+180),y:rand(-160,0),go:i<inn,vy:rand(60,90),mg,dh});S.absorbed+=60*f;S.lastF=f;
    S.log.unshift(`Day ${S.day}: ${(f*100).toFixed(0)}% absorbed (${(60*f).toFixed(1)} mg)${S.H>.3?' · hepcidin still high from the last dose':''}`);api.discover('hepcidin',true);}
  function step(dt,api){if(S.done)return;
    // hepcidin rises after absorbed iron, still high ~24 h later
    S.H=Math.max(0,S.H*Math.exp(-dt/(S.playing?6*30/24:1e9)));
    if(S.playing){S.ph+=dt/6;if(S.ph>=.08&&!S.taken&&(S.plan==='daily'||(S.plan==='alt'&&S.day%2===1)))takeDose(api);
      if(S.ph>=1){S.ph=0;S.day++;S.taken=false;if(S.day%4===1&&S.stored>0){S.lost+=S.stored*.6;S.stored*=.4;S.shed=1;}
        if(S.day>14){S.day=14;S.done=true;S.playing=false;summary(api);}}}
    for(const p of S.lumen){p.y+=p.vy*dt;if(p.go&&p.y>L.y0-20){p.in=true;}}
    for(const p of S.lumen.filter(p=>p.in)){S.inside.push({x:clamp(p.x,L.x0+20,L.x1-20),y:L.y0+10,tx:rand(L.x0+30,L.x1-30),ty:rand(L.y0+80,L.y1-60),t:0,mg:p.mg});S.H=Math.min(1,S.H+p.dh);}
    S.lumen=S.lumen.filter(p=>!p.in&&p.y<760);
    for(const d of S.doors)d.open=lerp(d.open,S.H>.35?0:1,1-Math.exp(-dt*2));
    for(const p of S.inside){p.t+=dt;p.x=lerp(p.x,p.tx,dt*1.5);p.y=lerp(p.y,p.ty,dt*1.5);
      if(p.t>1.5&&!p.done){const d=S.doors[Math.floor(Math.random()*3)];if(d.open>.5){p.tx=d.x;p.ty=L.y1+30;p.exit=true;}else{p.done=true;p.stored=true;S.stored+=p.mg;}}
      if(p.exit&&p.y>L.y1+10){p.gone=true;S.blood+=p.mg;S.taxis.push({x:p.x,y:L.y1+70,vx:rand(60,100)});}}
    S.inside=S.inside.filter(p=>!p.gone);
    // stored iron slowly leaves when doors reopen
    if(S.stored>0&&S.H<.2&&Math.random()<dt*.6){const m=Math.min(S.stored,.4);S.stored-=m;S.blood+=m;S.taxis.push({x:rand(L.x0,L.x1),y:L.y1+70,vx:rand(60,100)});}
    for(const t of S.taxis)t.x+=t.vx*dt;S.taxis=S.taxis.filter(t=>t.x<1300);S.shed=Math.max(0,S.shed-dt*.6);
  }
  function summary(api){const el=api.card.querySelector('#ic-end');if(!el)return;const per=S.doses?S.blood/S.doses:0;el.hidden=false;
    el.innerHTML=`<p class="sub">Fourteen days</p><p><b style="color:var(--bone)">${S.blood.toFixed(0)} mg reached the blood from ${S.doses} doses</b> (${per.toFixed(1)} mg per dose), and ${S.lost.toFixed(0)} mg was lost when cells were shed (an illustrative figure). Try the other schedule and compare per-dose numbers: alternate days absorb more per tablet, though daily dosing still delivers more iron per week.</p>`;}
  function draw(x,dt,t,api){step(dt,api);
    x.fillStyle='#120F0B';x.fillRect(-400,-300,1800,1300);
    // neighbouring cells
    for(const dx of [-300,300]){x.fillStyle='rgba(217,164,65,.08)';x.strokeStyle='rgba(217,164,65,.3)';x.lineWidth=2;x.beginPath();x.roundRect(L.x0+dx,L.y0,L.x1-L.x0,L.y1-L.y0,18);x.fill();x.stroke();}
    // the cell
    x.fillStyle='rgba(217,164,65,.14)';x.strokeStyle='#D9A441';x.lineWidth=3;x.beginPath();x.roundRect(L.x0,L.y0,L.x1-L.x0,L.y1-L.y0,18);x.fill();x.stroke();
    if(S.shed>0){x.fillStyle=`rgba(242,112,95,${S.shed*.25})`;x.fill();}
    for(let k=0;k<28;k++){const px=L.x0+10+k*9.6;x.strokeStyle='rgba(217,164,65,.6)';x.lineWidth=3;x.beginPath();x.moveTo(px,L.y0);x.lineTo(px,L.y0-26);x.stroke();}
    nucleus(x,500,420,46,38,.2);
    for(const dx of [430,570]){x.fillStyle='#71C6FF';x.beginPath();x.roundRect(dx-8,L.y0-10,16,24,6);x.fill();x.fillStyle='#FF9F43';x.beginPath();x.arc(dx+20,L.y0-4,6,0,TAU);x.fill();}
    // ferritin cages fill as iron is stored
    const cages=[[420,260],[580,250],[460,330],[560,330]];cages.forEach(([cx,cy],i)=>{x.strokeStyle='#D9A441';x.lineWidth=3;x.beginPath();x.arc(cx,cy,22,0,TAU);x.stroke();const n=Math.min(8,Math.round(S.stored*.8)-i*2);x.fillStyle=FE;for(let k=0;k<n;k++){x.beginPath();x.arc(cx+Math.cos(k*.8)*9,cy+Math.sin(k*1.3)*9,3.5,0,TAU);x.fill();}});
    // doors
    for(const d of S.doors){const g=d.open;x.fillStyle=g>.5?'#7FD3A3':'#5A3A40';x.beginPath();x.roundRect(d.x-20,L.y1-14,12,28,4);x.roundRect(d.x+8,L.y1-14,12,28,4);x.fill();
      if(S.H>.35){x.strokeStyle='#F2705F';x.lineWidth=3;x.beginPath();x.arc(d.x,L.y1+26,7,0,TAU);x.moveTo(d.x+7,L.y1+26);x.lineTo(d.x+22,L.y1+26);x.stroke();}}
    // blood vessel
    x.fillStyle='#2A0C12';x.fillRect(-400,L.y1+48,1800,46);
    for(const tf of S.taxis){x.fillStyle='#C97B5A';x.beginPath();x.arc(tf.x,tf.y,9,.4,TAU-.4);x.lineTo(tf.x,tf.y);x.fill();x.fillStyle=FE;x.beginPath();x.arc(tf.x,tf.y,3.5,0,TAU);x.fill();}
    // iron
    for(const p of S.lumen){x.fillStyle=p.go?'#FFD27A':'rgba(232,162,58,.55)';x.beginPath();x.arc(p.x,p.y,3.6,0,TAU);x.fill();}
    for(const p of S.inside){x.fillStyle='#FFD27A';x.beginPath();x.arc(p.x,p.y,3.6,0,TAU);x.fill();}
    x.fillStyle='rgba(236,230,218,.6)';x.font='11px "Martian Mono", monospace';x.textAlign='left';x.fillText('GUT SIDE',30,80);x.fillText('BLOOD',30,L.y1+76);x.textAlign='center';x.fillText('ferroportin doors',500,L.y1-26);
    const q=s=>api.card.querySelector(s);if(q('#ic-day')){q('#ic-day').textContent=S.day;q('#ic-h').style.width=S.H*100+'%';q('#ic-hv').textContent=S.H>.35?'doors locked':S.H>.1?'easing':'low';
      q('#ic-b').textContent=S.blood.toFixed(1)+' mg';q('#ic-d').textContent=S.doses;q('#ic-l').textContent=S.lost.toFixed(1)+' mg';q('#ic-log').innerHTML=S.log.slice(0,4).map(l=>`<div>${l}</div>`).join('');
      q('#ic-take').disabled=S.taken||S.done;}
  }
  return {id:'cell',label:'Gut cell',size:'20 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:500,y:350},
    card(){return `<p class="k">Level 2 · one cell · day <span id="ic-day">1</span> of 14</p><h2>The iron door</h2>
      <p>Iron gets in at the top, but leaves for the blood through one kind of door, ferroportin, at the bottom. After a dose the liver sends hepcidin, which closes many of the doors for about a day, so the next day's dose gets out roughly a third less well; iron that can't leave gets stored, and is lost when the cell is shed a few days later.</p>
      <div class="dv-meter"><span>Hepcidin</span><b id="ic-hv">low</b><i><u id="ic-h" style="background:#F2705F"></u></i></div>
      <div class="dv-meter"><span>Reached the blood</span><b id="ic-b">0 mg</b></div><div class="dv-meter"><span>Doses taken</span><b id="ic-d">0</b></div><div class="dv-meter"><span>Lost with shed cells (illustrative)</span><b id="ic-l">0 mg</b></div>
      <p class="sub" style="margin-top:10px">Take it with</p>
      <div class="dv-seg" role="radiogroup" aria-label="Taken with">${Object.entries(COMP).map(([k,c])=>`<button role="radio" data-c="${k}" aria-checked="${k==='water'}">${c.l}</button>`).join('')}</div>
      <div class="dv-btns"><button class="dv-btn go" id="ic-take" type="button">Take today's 60 mg</button><button class="dv-btn" id="ic-daily" type="button">Autoplay: daily</button><button class="dv-btn" id="ic-alt" type="button">Autoplay: every other day</button><button class="dv-btn" id="ic-next" type="button">Next day</button></div>
      <div id="ic-log" class="dv-fine"></div><div id="ic-end" hidden></div>
      <div class="dv-btns"><button class="dv-btn" id="ic-re" type="button">Start over</button></div>
      <p class="dv-fine">Real mechanisms and real numbers where they exist: about 16% absorbed on consecutive days versus 22% on alternate days in iron-depleted women (Stoffel 2017), and 35–45% less from a next-day dose (Moretti 2015). The food effects are directionally right but illustrative. Whether alternate days improve outcomes over months is still being studied.</p>`;},
    bind(card,api){card.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.comp=b.dataset.c;card.querySelectorAll('[data-c]').forEach(x=>x.setAttribute('aria-checked',x===b));});
      card.querySelector('#ic-take').onclick=()=>takeDose(api);
      const auto=plan=>()=>{const c=S.comp;reset();S.comp=c;S.plan=plan;S.playing=true;card.querySelector('#ic-end').hidden=true;};
      card.querySelector('#ic-daily').onclick=auto('daily');card.querySelector('#ic-alt').onclick=auto('alt');
      card.querySelector('#ic-next').onclick=()=>{if(S.done)return;S.H*=Math.exp(-24/30);S.day++;S.taken=false;S.ph=0;if(S.day%4===1&&S.stored>0){S.lost+=S.stored*.6;S.stored*=.4;S.shed=1;}if(S.day>14){S.day=14;S.done=true;summary(api);}};
      card.querySelector('#ic-re').onclick=()=>{reset();card.querySelector('#ic-end').hidden=true;};},
    tap(p,api){if(p.y<L.y0+10&&p.x>L.x0&&p.x<L.x1)return api.discover('dmt1');if(Math.abs(p.y-L.y1)<30&&p.x>L.x0&&p.x<L.x1)return api.discover('fpn');if(p.y>L.y1+40)return api.discover('tf');
      if(p.x>L.x0&&p.x<L.x1&&p.y>200&&p.y<360)return api.discover('ferritin');if(p.x>L.x0&&p.x<L.x1)return api.discover('entero');},
    draw,
  };
}
export function ironDive(){return {levels:[villusLevel(),cellLevel()],guide:GUIDE_I};}
