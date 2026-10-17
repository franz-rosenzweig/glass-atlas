// MCAS dive: skin (the triple response) → one mast cell, "keep it calm".
import { TAU, clamp, lerp, rand } from './dive.js';
import { G, glow, rgba, nucleus } from './dive-ra.js';

const MC={cell:'#F29A55',gran:'#FFB36B',hist:'#FFFFFF',lt:'#7FD3A3',ige:'#C08CFF',mrg:'#71C6FF',h1:'#62BED3',h2:'#DDB741',block:'#5AA8FF'};
function mastCell(x,cx,cy,r,t,act=0,grans){x.save();x.beginPath();for(let i=0;i<=60;i++){const a=i/60*TAU;const rr=r*(1+.05*Math.sin(a*5+t)+act*.03*Math.sin(a*11+t*8));i?x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr):x.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();
  x.fillStyle=rgba(MC.cell,.18+act*.12);x.fill();x.strokeStyle=rgba(MC.cell,.95);x.lineWidth=Math.max(1.5,r*.015);x.stroke();
  nucleus(x,cx-r*.15,cy+r*.05,r*.28,r*.24,.3);
  if(grans)for(const g of grans){if(g.gone)continue;x.fillStyle=rgba(MC.gran,.9);x.beginPath();x.arc(cx+g.x*r,cy+g.y*r,r*.055,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(cx+g.x*r-r*.015,cy+g.y*r-r*.015,r*.018,0,TAU);x.fill();}
  x.restore();}
export const GUIDE_M={
  mast:{name:'Mast cell',kind:'Cell',size:'about 10–20 µm',draw:(x,cx,cy,s,t)=>{const gr=Array.from({length:22},(_,i)=>({x:Math.cos(i*2.4)*.6*((i%5)/5+.3),y:Math.sin(i*2.4)*.6*((i%5)/5+.3)}));mastCell(x,cx,cy,44*s,t||0,0,gr);},
    text:['A sentinel packed with granules, parked next to blood vessels and nerves in the skin, gut lining and airways, the places where the body meets the outside world.','When triggered it releases its granules within seconds and then makes new signalling molecules over the following minutes.']},
  hist:{name:'Histamine',kind:'Signal molecule',size:'under 1 nm',draw:(x,cx,cy,s)=>{for(let i=0;i<9;i++){x.fillStyle='#FFF';x.beginPath();x.arc(cx+Math.cos(i*2.1)*20*s,cy+Math.sin(i*1.7)*16*s,4*s,0,TAU);x.fill();}},
    text:['Stored ready-made in the granules. On blood vessels it acts through H1 receptors: they widen and leak, giving redness and swelling. On nerves, H1 means itch.','In the stomach it acts through H2 receptors and turns up acid production.']},
  tryptase:{name:'Tryptase',kind:'Enzyme',size:'a protein, nanometres',draw:(x,cx,cy,s)=>{x.fillStyle='#FF9F43';for(let i=0;i<4;i++){x.beginPath();x.arc(cx+(i%2?14:-14)*s,cy+(i<2?-14:14)*s,11*s,0,TAU);x.fill();}},
    text:['Also stored in the granules, almost only in mast cells. That makes it the blood test for a mast-cell flare: a rise of more than 20% of baseline plus 2 ng/mL.']},
  ige:{name:'IgE on its receptor',kind:'Antibody + receptor',size:'nanometres',draw:(x,cx,cy,s)=>G.ab(x,cx,cy,s*.7,Math.PI,MC.ige),
    text:['The classic allergy switch: IgE antibodies sit in high-affinity receptors (FcεRI) on the mast cell, and an allergen bridging two of them fires the cell.','In MCAS, flares often happen without any allergy test being positive, through other switches.']},
  mrg:{name:'MRGPRX2',kind:'Receptor',size:'nanometres',draw:(x,cx,cy,s)=>{x.strokeStyle=MC.mrg;x.lineWidth=5*s;x.beginPath();for(let i=0;i<7;i++){x.lineTo(cx-36*s+i*12*s,cy+(i%2?18:-18)*s);}x.stroke();},
    text:['One of the non-allergy switches. Certain drugs and body peptides can fire mast cells through it directly, no IgE needed. It\'s one reason some reactions to medicines look like allergies but aren\'t.']},
  lt:{name:'Leukotrienes and prostaglandin D2',kind:'Newly made signals',size:'under 1 nm',draw:(x,cx,cy,s)=>{x.strokeStyle=MC.lt;x.lineWidth=3*s;for(let i=0;i<3;i++){x.beginPath();for(let k=0;k<8;k++)x.lineTo(cx-30*s+k*8*s,cy-16*s+i*16*s+Math.sin(k)*4*s);x.stroke();}},
    text:['Not stored: built from the cell\'s own membrane fats after it fires. They tighten airways and add to flushing, and they keep a flare going after the granules are spent.','Montelukast blocks leukotriene receptors; it\'s sometimes used in MCAS. It carries an FDA boxed warning (2020) about mood and sleep changes, worth knowing alongside the patient\'s other medicines.']},
  h1:{name:'H1 blocker',kind:'Medicine',size:'under 1 nm',draw:(x,cx,cy,s)=>{x.fillStyle=MC.block;x.beginPath();x.roundRect(cx-22*s,cy-12*s,44*s,24*s,8*s);x.fill();},
    text:['Cetirizine, loratadine, fexofenadine and others sit in histamine\'s H1 receptors so histamine can\'t land. They don\'t stop the mast cell from firing; they mute one of its messages. They help itch, hives and flushing, but they are not enough for throat swelling or breathing trouble: that needs epinephrine.']},
  h2:{name:'H2 blocker',kind:'Medicine',size:'under 1 nm',draw:(x,cx,cy,s)=>{x.fillStyle=MC.h2;x.beginPath();x.roundRect(cx-22*s,cy-12*s,44*s,24*s,8*s);x.fill();},
    text:['Famotidine blocks H2 receptors, mainly on the stomach\'s acid-making cells (H2 receptors on vessels also add a little to flushing). In MCAS H1 and H2 blockers are often combined. Less stomach acid can lower levothyroxine and iron absorption, so it\'s worth a TSH recheck after starting.']},
  cromolyn:{name:'Cromolyn',kind:'Medicine · mast cell stabiliser',size:'about 1 nm',draw:(x,cx,cy,s)=>{x.strokeStyle='#7CFFB2';x.lineWidth=4*s;x.beginPath();x.arc(cx,cy,26*s,0,TAU);x.stroke();x.beginPath();x.arc(cx,cy,14*s,0,TAU);x.stroke();},
    text:['Makes mast cells less ready to fire; how exactly is still not fully understood. Taken by mouth it is barely absorbed, so it works mainly on the gut lining. It is taken half an hour before meals and at bedtime, and needs two to three weeks before judging it.']},
};

/* ---------------- level A: the skin and the triple response */
function skinLevel(){
  const S={flare:0,ft:0,h1:false};const mcs=[{x:330,y:330},{x:560,y:300},{x:690,y:420},{x:430,y:470}];
  const caps=[{x:300,w:60},{x:520,w:70},{x:720,w:60}];const nerve=[[150,640],[260,500],[380,420],[470,300],[520,200],[540,120]];
  const hist=[],plasma=[];
  function trigger(){S.ft=1;for(const m of mcs)for(let i=0;i<26;i++)hist.push({x:m.x+rand(-14,14),y:m.y+rand(-14,14),vx:rand(-30,30),vy:rand(-30,30),l:3});}
  return {id:'skin',label:'Skin',size:'1 mm',fit:'cover',bar:{units:80,label:'50 µm'},zoomFocus:{x:560,y:300},
    card(){return `<p class="k">Level 1 · tissue</p><h2>Under the skin</h2>
      <p>Mast cells (orange) wait beside the small blood vessels and nerve endings of the skin. Give them a trigger and watch what histamine does. The tiny vessels widen (a red spot) and leak fluid (the raised wheal of a hive). Nerve endings fire: that is the itch, and it also sends a reflex that widens vessels further out (the spreading red flare). Red spot, flare and wheal are what physiologists call the triple response.</p>
      <div class="dv-meter"><span>Redness</span><b id="sk-r">0%</b><i><u id="sk-rB" style="background:#E0566A"></u></i></div>
      <div class="dv-meter"><span>Swelling (wheal)</span><b id="sk-w">0%</b><i><u id="sk-wB" style="background:#78A0F4"></u></i></div>
      <div class="dv-meter"><span>Itch</span><b id="sk-i">0%</b><i><u id="sk-iB" style="background:#F2C14E"></u></i></div>
      <div class="dv-btns"><button class="dv-btn go" id="sk-t" type="button">Heat or friction</button><button class="dv-btn" id="sk-h1" type="button">H1 antihistamine<small>off</small></button></div>
      <div class="dv-btns"><button class="dv-btn" id="sk-go" type="button">Zoom into one mast cell<small>keep it calm</small></button></div>
      <p class="dv-fine">Drawn to scale (50 µm bar), schematic in detail. The antihistamine blocks histamine's landing spots, so the same release does less; the mast cells still fire.</p>`;},
    bind(card,api){card.querySelector('#sk-t').onclick=trigger;const h=card.querySelector('#sk-h1');h.onclick=()=>{S.h1=!S.h1;h.classList.toggle('on',S.h1);h.querySelector('small').textContent=S.h1?'on: histamine blocked at H1':'off';if(S.h1)api.discover('h1',true);};
      card.querySelector('#sk-go').onclick=()=>api.go('mast',{from:mcs[1]});},
    tap(p,api){for(const m of mcs)if(Math.hypot(p.x-m.x,p.y-m.y)<40)return api.discover('mast');if(p.y>200)trigger();},
    draw(x,dt,t,api){
      const eff=S.h1?.35:1;S.ft=Math.max(0,S.ft-dt*.08);
      let landed=0;for(const h of hist){h.vx+=rand(-60,60)*dt;h.vy+=rand(-60,60)*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.l-=dt;for(const c of caps)if(Math.abs(h.x-c.x)<c.w*.6&&h.y<380&&h.y>150)landed++;}
      for(let i=hist.length-1;i>=0;i--)if(hist[i].l<=0)hist.splice(i,1);
      S.flare=lerp(S.flare,clamp(S.ft*eff,0,1),1-Math.exp(-2*dt));const F=S.flare;
      if(F>.1&&Math.random()<F*dt*30)for(const c of caps)plasma.push({x:c.x+rand(-10,10),y:rand(200,360),vx:rand(-20,20),vy:rand(-10,10),l:4});
      for(const p of plasma){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}for(let i=plasma.length-1;i>=0;i--)if(plasma[i].l<=0)plasma.splice(i,1);
      // dermis
      x.fillStyle='#160E14';x.fillRect(-400,-300,1800,1300);x.strokeStyle='rgba(200,150,170,.10)';x.lineWidth=2;for(let i=0;i<120;i++){const sx=(i*137)%1300-150,sy=180+(i*71)%520;x.beginPath();x.moveTo(sx,sy);x.bezierCurveTo(sx+30,sy-10,sx+60,sy+10,sx+90,sy);x.stroke();}
      // epidermis lifts over the wheal
      const lift=x0=>F*40*Math.exp(-((x0-520)**2)/(2*160*160));
      for(let row=0;row<5;row++){for(let i=-4;i<34;i++){const cx=i*36+(row%2)*18,base=170-row*24-lift(cx);x.fillStyle=row===4?'rgba(230,200,190,.35)':rgba('#E8B9B0',.55-row*.06);x.beginPath();x.ellipse(cx,base,17,10-row,0,0,TAU);x.fill();if(row<3){x.fillStyle='rgba(75,44,120,.7)';x.beginPath();x.arc(cx,base,3.5,0,TAU);x.fill();}}}
      // capillary loops, widening and reddening
      for(const c of caps){const w=c.w*(1+F*.5);x.strokeStyle=`rgba(${200+55*F},${60-30*F},${70-30*F},.9)`;x.lineWidth=10+F*8;x.beginPath();x.moveTo(c.x-w/2,560);x.lineTo(c.x-w/2,230-lift(c.x));x.arc(c.x,230-lift(c.x),w/2,Math.PI,0);x.lineTo(c.x+w/2,560);x.stroke();
        x.save();x.globalCompositeOperation='lighter';glow(x,c.x,260,120*F,'rgba(224,86,106,.35)');x.restore();}
      // leaked fluid
      x.fillStyle='rgba(120,160,255,.55)';for(const p of plasma){x.beginPath();x.arc(p.x,p.y,3,0,TAU);x.fill();}
      // nerve: flashes with itch
      x.strokeStyle=F>.15&&Math.sin(t*14)>0?'#FFE36E':'#C9A64E';x.lineWidth=4;x.beginPath();nerve.forEach((p,i)=>i?x.lineTo(p[0],p[1]-(i>3?lift(p[0]):0)):x.moveTo(p[0],p[1]));x.stroke();
      for(const m of mcs){const gr=Array.from({length:18},(_,i)=>({x:Math.cos(i*2.4)*.55*((i%4)/4+.3),y:Math.sin(i*2.4)*.55*((i%4)/4+.3),gone:S.ft>.5&&i%2===0}));mastCell(x,m.x,m.y,30,t,S.ft,gr);}
      x.fillStyle='#FFF';for(const h of hist){x.beginPath();x.arc(h.x,h.y,2.4,0,TAU);x.fill();}
      x.fillStyle='rgba(236,230,218,.55)';x.font='11px "Martian Mono", monospace';x.textAlign='left';x.fillText('EPIDERMIS',20,40);x.fillText('DERMIS',20,250);x.fillText('NERVE',150,610);
      const q=s=>api.card.querySelector(s);if(q('#sk-r')){const set=(k,v)=>{q('#sk-'+k).textContent=Math.round(v*100)+'%';q('#sk-'+k+'B').style.width=v*100+'%';};set('r',F);set('w',clamp(F*1.1-.1,0,1));set('i',clamp(F*1.2-.05,0,1));}
    },
  };
}

/* ---------------- level B: one mast cell */
function cellLevel(){
  const CX=420,CY=360,R=170;let S;
  const KINDS=[{k:'allergen',label:'allergen',col:'#C08CFF',needs:'ige'},{k:'drug',label:'certain drugs',col:'#71C6FF',needs:'mrg'},{k:'heat',label:'heat',col:'#FF7A59',needs:null},{k:'friction',label:'friction',col:'#F2C14E',needs:null},{k:'stress',label:'stress signals',col:'#E6DEFF',needs:null}];
  function reset(){S={act:0,flares:0,calm:0,time:0,cro:false,h1:false,h2:false,trig:[],hist:[],lt:[],cool:0,grans:Array.from({length:46},(_,i)=>{const a=i*2.39996,r=Math.sqrt((i+.5)/46)*.78;return {x:Math.cos(a)*r,y:Math.sin(a)*r,gone:false,fly:0};}),
    rec:Array.from({length:12},(_,i)=>({a:i/12*TAU+.2,kind:i%3===0?'mrg':'ige'})),h1r:Array.from({length:6},(_,i)=>({y:150+i*50,busy:0})),h2r:Array.from({length:3},(_,i)=>({y:520+i*50,busy:0})),flush:0,acid:0,acc:0};}
  reset();
  function spawn(){const K=KINDS[Math.floor(Math.random()*KINDS.length)];const a=rand(0,TAU);const tgt=K.needs?S.rec.filter(r=>r.kind===K.needs)[Math.floor(Math.random()*4)]:{a:rand(0,TAU)};
    S.trig.push({K,x:CX+Math.cos(a)*560,y:CY+Math.sin(a)*400,tgt,dead:false,spin:rand(0,6)});}
  function fire(){S.flares++;S.cool=3;for(const g of S.grans)if(!g.gone&&Math.random()<.65){g.gone=true;g.fly=1;for(let k=0;k<5;k++)S.hist.push({x:CX+g.x*R,y:CY+g.y*R,vx:rand(60,160),vy:rand(-80,80),l:5});}
    setTimeout(()=>{for(let k=0;k<18;k++)S.lt.push({x:CX+rand(-R,R)*.7,y:CY+rand(-R,R)*.7,vx:rand(30,90),vy:rand(-50,50),l:6});},900);}
  function step(dt){S.time+=dt;S.acc+=dt*(.55+Math.min(.9,S.time/90));while(S.acc>1){S.acc--;spawn();}
    S.cool=Math.max(0,S.cool-dt);S.act=Math.max(0,S.act-dt*6);if(S.act<40&&S.cool<=0)S.calm+=dt;
    for(const g of S.grans)if(g.gone&&Math.random()<dt*.04)g.gone=false;
    for(const tr of S.trig){if(tr.dead)continue;const ta=tr.tgt.a;const tx=CX+Math.cos(ta)*(R+14),ty=CY+Math.sin(ta)*(R+14);const dx=tx-tr.x,dy=ty-tr.y,d=Math.hypot(dx,dy);
      tr.x+=dx/d*90*dt;tr.y+=dy/d*90*dt;tr.spin+=dt*2;if(d<12){tr.dead=true;S.act+=(S.cro?14:24);if(S.act>=100&&S.cool<=0){S.act=30;fire();}}}
    S.trig=S.trig.filter(t=>!t.dead);
    for(const h of S.hist){h.x+=h.vx*dt;h.y+=h.vy*dt;h.vx+=rand(-30,30)*dt;h.l-=dt;
      if(h.x>800&&!h.done){h.done=true;const top=h.y<480;const list=top?S.h1r:S.h2r;const r=list.reduce((b,c)=>Math.abs(c.y-h.y)<Math.abs(b.y-h.y)?c:b);
        const blocked=top?S.h1:S.h2;if(blocked){h.vx=-60;}else{r.busy=1;h.l=0;if(top)S.flush=Math.min(1,S.flush+.08);else S.acid=Math.min(1,S.acid+.12);}}}
    S.hist=S.hist.filter(h=>h.l>0);for(const l of S.lt){l.x+=l.vx*dt;l.y+=l.vy*dt;l.l-=dt;}S.lt=S.lt.filter(l=>l.l>0);
    for(const r of [...S.h1r,...S.h2r])r.busy=Math.max(0,r.busy-dt*.5);S.flush=Math.max(0,S.flush-dt*.05);S.acid=Math.max(0,S.acid-dt*.06);}
  function draw(x,dt,t,api){step(dt);
    x.fillStyle='#0A0D14';x.fillRect(-400,-300,1800,1300);
    // the cell and its receptors
    mastCell(x,CX,CY,R,t,S.act/100,S.grans);
    for(const r of S.rec){const px=CX+Math.cos(r.a)*R,py=CY+Math.sin(r.a)*R;x.save();x.translate(px,py);x.rotate(r.a+Math.PI/2);
      if(r.kind==='ige'){x.strokeStyle=MC.ige;x.lineWidth=4;x.beginPath();x.moveTo(0,4);x.lineTo(0,-12);x.lineTo(-7,-22);x.moveTo(0,-12);x.lineTo(7,-22);x.stroke();}
      else{x.strokeStyle=MC.mrg;x.lineWidth=3;x.beginPath();for(let k=0;k<6;k++)x.lineTo(-10+k*4,(k%2?-14:6));x.stroke();}x.restore();}
    // activation ring
    x.strokeStyle=S.act>70?'#FF5A3C':'#F29A55';x.lineWidth=6;x.beginPath();x.arc(CX,CY,R+40,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,S.act/100));x.stroke();
    // triggers
    x.font='11px "Atkinson Hyperlegible", sans-serif';x.textAlign='center';
    for(const tr of S.trig){x.save();x.globalCompositeOperation='lighter';glow(x,tr.x,tr.y,26,rgba(tr.K.col,.7));x.restore();x.fillStyle=tr.K.col;x.beginPath();x.arc(tr.x,tr.y,8,0,TAU);x.fill();x.fillStyle='rgba(236,230,218,.85)';x.fillText(tr.K.label,tr.x,tr.y-16);}
    // histamine and newly made mediators
    x.fillStyle='#FFFFFF';for(const h of S.hist){x.beginPath();x.arc(h.x,h.y,3,0,TAU);x.fill();}
    x.strokeStyle=MC.lt;x.lineWidth=2;for(const l of S.lt){x.beginPath();x.moveTo(l.x-6,l.y);x.lineTo(l.x+6,l.y+3);x.stroke();}
    // target tissue: vessel wall with H1 receptors (top), stomach acid cell with H2 (bottom)
    x.fillStyle=`rgba(${120+120*S.flush},40,60,.55)`;x.fillRect(840,110,200,330);x.fillStyle=`rgba(200,170,60,${.25+S.acid*.5})`;x.fillRect(840,490,200,170);
    for(const r of S.h1r){x.fillStyle=r.busy>0?'#FFFFFF':MC.h1;x.beginPath();x.arc(840,r.y,12,Math.PI/2,Math.PI*1.5,false);x.fill();if(S.h1){x.fillStyle=MC.block;x.beginPath();x.roundRect(822,r.y-9,16,18,5);x.fill();}}
    for(const r of S.h2r){x.fillStyle=r.busy>0?'#FFFFFF':MC.h2;x.beginPath();x.arc(840,r.y,12,Math.PI/2,Math.PI*1.5,false);x.fill();if(S.h2){x.fillStyle='#E6C34A';x.beginPath();x.roundRect(822,r.y-9,16,18,5);x.fill();}}
    x.fillStyle='rgba(236,230,218,.65)';x.font='11px "Martian Mono", monospace';x.textAlign='left';x.fillText('BLOOD VESSEL · H1',860,135);x.fillText('STOMACH · H2',860,515);
    const q=s=>api.card.querySelector(s);if(q('#mc-a')){q('#mc-a').textContent=Math.round(S.act)+'%';q('#mc-aB').style.width=Math.min(100,S.act)+'%';q('#mc-f').textContent=S.flares;q('#mc-c').textContent=Math.round(S.calm/Math.max(1,S.time)*100)+'%';
      q('#mc-fl').style.width=S.flush*100+'%';q('#mc-ac').style.width=S.acid*100+'%';}
  }
  return {id:'mast',label:'Mast cell',size:'20 µm',fit:'contain',bar:{units:200,label:'10 µm'},zoomFocus:{x:420,y:360},
    card(){return `<p class="k">Level 2 · one cell</p><h2>Keep it calm</h2>
      <p>Triggers drift in and dock on the cell's switches. Each one adds to its readiness; at 100% it fires, and its granules dump histamine. <b style="color:var(--bone)">Tap triggers to bat them away.</b> Then try the patient's medicines and watch where each one works.</p>
      <div class="dv-meter"><span>Readiness to fire</span><b id="mc-a">0%</b><i><u id="mc-aB"></u></i></div>
      <div class="dv-meter"><span>Flares</span><b id="mc-f">0</b></div><div class="dv-meter"><span>Time kept calm</span><b id="mc-c">0%</b></div>
      <div class="dv-meter"><span>Vessels: flushing, swelling, itch</span><b></b><i><u id="mc-fl" style="background:#E0566A"></u></i></div>
      <div class="dv-meter"><span>Stomach acid</span><b></b><i><u id="mc-ac" style="background:#DDB741"></u></i></div>
      <div class="dv-btns"><button class="dv-btn" id="mc-cro" type="button">Cromolyn<small>steadies the cell</small></button><button class="dv-btn" id="mc-h1" type="button">H1 blocker<small>guards the vessels</small></button><button class="dv-btn" id="mc-h2" type="button">H2 blocker<small>guards the stomach</small></button></div>
      <div class="dv-btns"><button class="dv-btn" id="mc-re" type="button">Start over</button></div>
      <p class="dv-fine">Purple Y's are IgE allergy switches; blue zigzags are MRGPRX2, a switch some drugs flip directly. Heat, friction and stress act through other routes. The game's numbers are illustrative; the mechanisms are real. Tap the cell, its switches, or the receptors to collect them.</p>`;},
    bind(card,api){const tg=(id,key,g)=>{const b=card.querySelector(id);b.onclick=()=>{S[key]=!S[key];b.classList.toggle('on',S[key]);if(S[key])api.discover(g,true);};};
      tg('#mc-cro','cro','cromolyn');tg('#mc-h1','h1','h1');tg('#mc-h2','h2','h2');card.querySelector('#mc-re').onclick=()=>{reset();card.querySelectorAll('.dv-btn.on').forEach(b=>b.classList.remove('on'));};},
    tap(p,api){let best=null,bd=Math.max(34,22/p.s);for(const tr of S.trig){const d=Math.hypot(tr.x-p.x,tr.y-p.y);if(d<bd){bd=d;best=tr;}}
      if(best){best.dead=true;return;}
      for(const r of S.rec){const px=CX+Math.cos(r.a)*R,py=CY+Math.sin(r.a)*R;if(Math.hypot(px-p.x,py-p.y)<24)return api.discover(r.kind==='ige'?'ige':'mrg');}
      if(Math.hypot(p.x-CX,p.y-CY)<R)return api.discover(S.flares?'tryptase':'mast');
      if(p.x>820)return api.discover('hist');
      if(S.lt.some(l=>Math.hypot(l.x-p.x,l.y-p.y)<30))return api.discover('lt');},
    draw,
  };
}
export function mastDive(){return {levels:[skinLevel(),cellLevel()],guide:GUIDE_M};}
