// POTS dive: the standing reflex circuit → a rhythm game where every on-time beat squeezes the vessels.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba } from './dive-ra.js';

export const GUIDE_P={
  baro:{name:'Baroreceptors',kind:'Pressure sensors',size:'nerve endings in artery walls',draw:(x,cx,cy,s)=>{x.strokeStyle='#C23447';x.lineWidth=14*s;x.beginPath();x.moveTo(cx-40*s,cy);x.lineTo(cx+40*s,cy);x.stroke();x.fillStyle='#FFE36E';for(let i=-2;i<=2;i++){x.beginPath();x.arc(cx+i*14*s,cy-9*s,4*s,0,TAU);x.fill();}},
    text:['Stretch sensors in the walls of the carotid arteries in the neck and the arch of the aorta. Every heartbeat stretches them and they report the pressure to the brainstem.','When the patient stands and blood drains to the legs, they stretch less, and the brainstem reads it as falling pressure.']},
  brainstem:{name:'Brainstem control centre',kind:'Nerve centre',size:'a few centimetres',draw:(x,cx,cy,s)=>{x.fillStyle='#C99C92';x.beginPath();x.ellipse(cx,cy,26*s,40*s,0,0,TAU);x.fill();},
    text:['Nuclei in the medulla compare the pressure reports with where pressure should be, and answer through two outputs: the vagus nerve, which can change heart rate within a beat or two, and the sympathetic nerves (speed up, squeeze), which take several seconds to tighten the vessels.']},
  symp:{name:'Sympathetic nerves',kind:'Nerves',size:'run the length of the body',draw:(x,cx,cy,s)=>{x.strokeStyle='#F2A65A';x.lineWidth=4*s;x.beginPath();for(let i=0;i<9;i++)x.lineTo(cx-40*s+i*10*s,cy+Math.sin(i)*10*s);x.stroke();},
    text:['They release norepinephrine onto blood vessels (squeeze) and the heart (faster, stronger). Standing should mainly tighten the small arteries in the legs and gut, and the large veins of the gut, which hold much of the body\'s spare blood; in the legs the calf-muscle pump does much of the work.','In neuropathic POTS the nerves to the legs squeeze too weakly; in hyperadrenergic POTS the system is turned up too high.']},
  vagus:{name:'Vagus nerve',kind:'Nerve',size:'brainstem to the gut',draw:(x,cx,cy,s)=>{x.strokeStyle='#78A0F4';x.lineWidth=4*s;x.beginPath();x.moveTo(cx,cy-40*s);x.bezierCurveTo(cx+20*s,cy-10*s,cx-20*s,cy+10*s,cx,cy+40*s);x.stroke();},
    text:['The brake on the heart. Standing eases off the brake so the heart speeds up a little; that is normal.','It also carries the pressure reports from the aortic arch, and runs much of the gut, one reason POTS and gut symptoms travel together.']},
  propr:{name:'Propranolol',kind:'Medicine',size:'about 1 nm',draw:(x,cx,cy,s)=>{x.strokeStyle='#EE6F82';x.lineWidth=4*s;for(let i=0;i<2;i++){x.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;x.lineTo(cx-14*s+i*28*s+Math.cos(a)*12*s,cy+Math.sin(a)*12*s);}x.closePath();x.stroke();}},
    text:['Blocks the heart\'s beta receptors, so the same sympathetic push raises the rate less. In a small 2009 study of single doses, a smaller dose eased symptoms better than a larger one, though the larger one slowed the heart more.','It treats the racing, not the pooling, which is why fluids, salt and compression come first.']},
};

/* ---------------- level A: the circuit */
function circuitLevel(){
  const SUB={typical:{l:'Typical body',hr:13,bp:2,pool:500,sq:1,sym:1,vol:1,t:'Standing shifts about half a litre into the legs and belly. Pressure sensors notice, the brainstem fires the sympathetic nerves, vessels tighten, leg muscles pump and the heart speeds up a little: usually 10–20 bpm.'},
    neuro:{l:'Neuropathic',hr:38,bp:-4,pool:800,sq:.4,sym:1.3,vol:1,t:'The nerves that squeeze the leg vessels work poorly, so blood keeps pooling and the heart has to make up the difference.'},
    hypo:{l:'Low blood volume',hr:36,bp:-3,pool:500,sq:1,sym:1.4,vol:.87,t:'There is less blood to begin with, so the same shift leaves the heart short; it races to keep output up. Fluids and salt target this.'},
    hyper:{l:'Hyperadrenergic',hr:44,bp:14,pool:520,sq:1.2,sym:2,vol:1,t:'The sympathetic system overshoots: very high norepinephrine when upright (600 pg/mL or more) and/or a systolic pressure that rises by 10 mmHg or more on standing, often with a pounding heart, tremor and cold hands.'}};
  const st={sub:'neuro',s:0,ts:0,ph:0};
  const B={feet:[430,640]};
  function pt(px,py){ // body coordinates (upright, x across, y up from feet) → screen, rotating from lying to standing
    const a=(1-st.s)*Math.PI/2;const c=Math.cos(a),sn=Math.sin(a);const X=px*c+py*sn,Y=-px*sn+py*c;return [B.feet[0]+X,B.feet[1]-Y];}
  const PATH={carotid:[[22,520],[30,470],[34,420]],aorta:[[30,420],[50,440],[40,400]],brain:[[20,560]],
    sympLeg:[[10,520],[0,400],[-6,300],[-10,200],[-14,100],[-14,20]],sympHeart:[[10,520],[4,420],[30,410]],vagus:[[20,560],[34,480],[40,410]]};
  function body(x){x.save();x.fillStyle='rgba(191,230,225,.08)';x.strokeStyle='rgba(191,230,225,.5)';x.lineWidth=2;x.beginPath();
    const outline=[[-22,0],[-20,90],[-22,200],[-30,300],[-34,420],[-28,480],[-14,500],[-14,520],[-22,540],[-24,580],[0,605],[24,580],[22,540],[14,520],[14,500],[40,480],[46,420],[38,300],[24,200],[22,90],[26,0]];
    outline.forEach(([a,b],i)=>{const [X,Y]=pt(a,b);i?x.lineTo(X,Y):x.moveTo(X,Y);});x.closePath();x.fill();x.stroke();x.restore();}
  function poly(x,pts,col,w,flow,t,speed){x.strokeStyle=col;x.lineWidth=w;x.beginPath();pts.forEach(([a,b],i)=>{const [X,Y]=pt(a,b);i?x.lineTo(X,Y):x.moveTo(X,Y);});x.stroke();
    if(flow>0){const n=pts.length-1;for(let k=0;k<3;k++){let u=((t*speed+k/3)%1)*n;const i=Math.min(n-1,Math.floor(u)),f=u-i;const [a0,b0]=pts[i],[a1,b1]=pts[i+1];const [X,Y]=pt(lerp(a0,a1,f),lerp(b0,b1,f));
      x.save();x.globalCompositeOperation='lighter';glow(x,X,Y,12*flow,col);x.restore();}}}
  return {id:'circuit',label:'Reflex',size:'1 m',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:176,label:'50 cm'},zoomFocus:{x:470,y:300},
    card(){return `<p class="k">Level 1 · the whole body</p><h2>The standing reflex</h2>
      <p>Press stand and follow the loop: pressure sensors in the neck and chest (gold) report to the brainstem, which answers through the sympathetic nerves (orange: squeeze, speed up) and eases off the vagus (blue: the heart's brake).</p>
      <div class="dv-seg" role="radiogroup" aria-label="Type">${Object.entries(SUB).map(([k,v])=>`<button role="radio" data-s="${k}" aria-checked="${k===st.sub}">${v.l}</button>`).join('')}</div>
      <p id="pc-t"></p>
      <div class="dv-meter"><span>Heart rate</span><b id="pc-hr"></b></div><div class="dv-meter"><span>Blood pressure (systolic)</span><b id="pc-bp"></b></div><div class="dv-meter"><span>Blood shifted to the legs</span><b id="pc-pool"></b></div>
      <div class="dv-btns"><button class="dv-btn go" id="pc-st" type="button">Stand up</button><button class="dv-btn" id="pc-go" type="button">Play the reflex<small>a rhythm game</small></button></div>
      <p class="dv-fine">The circuit is real anatomy, simplified. The subtypes come from the research literature and often overlap; which one fits the patient isn't on the chart. Numbers are typical shapes, not her readings. Tap the sensors, nerves or brainstem to collect them.</p>`;},
    bind(card,api){const txt=()=>card.querySelector('#pc-t').textContent=SUB[st.sub].t;txt();
      card.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{st.sub=b.dataset.s;card.querySelectorAll('[data-s]').forEach(x=>x.setAttribute('aria-checked',x===b));txt();});
      const sb=card.querySelector('#pc-st');sb.onclick=()=>{st.ts=st.ts>.5?0:1;sb.textContent=st.ts?'Lie down':'Stand up';};
      card.querySelector('#pc-go').onclick=()=>api.go('rhythm',{from:{x:470,y:300}});},
    tap(p,api){const near=(name,r=40)=>PATH[name].some(([a,b])=>{const [X,Y]=pt(a,b);return Math.hypot(X-p.x,Y-p.y)<r;});
      if(near('brain'))return api.discover('brainstem');if(near('carotid',30)||near('aorta',30))return api.discover('baro');if(near('vagus',24))return api.discover('vagus');if(near('sympLeg',30)||near('sympHeart',24))return api.discover('symp');},
    draw(x,dt,t,api){st.s=lerp(st.s,st.ts,1-Math.exp(-1.6*dt));const S=SUB[st.sub],s=st.s;
      x.fillStyle='#070B10';x.fillRect(-400,-300,1800,1300);x.fillStyle='#1A2328';x.fillRect(-400,B.feet[1],1800,8);
      body(x);
      // blood: dots that slide toward the legs when upright
      const nb=Math.round(70*S.vol);for(let i=0;i<nb;i++){const h=((i*53)%100)/100;const legBias=s*(S.pool/800);const yy=lerp(h*560,h*h*300,legBias);const xx=((i*37)%40)-20;const [X,Y]=pt(xx*.8,yy+10);x.fillStyle='rgba(194,52,71,.75)';x.beginPath();x.arc(X,Y,3.2,0,TAU);x.fill();}
      const drive=s*S.sym;
      poly(x,PATH.carotid,'#FFE36E',4,1-s*.6,t,.6);poly(x,PATH.aorta,'#FFE36E',4,1-s*.6,t,.6);
      poly(x,PATH.sympLeg,'#F2A65A',3+drive*2,drive,t,.4+drive*.4);poly(x,PATH.sympHeart,'#F2A65A',3,drive,t,.5+drive*.3);poly(x,PATH.vagus,'#78A0F4',3,1-s*.7,t,.5);
      const [bx,by]=pt(20,560);x.fillStyle='#C99C92';x.beginPath();x.arc(bx,by,11,0,TAU);x.fill();
      const [hx,hy]=pt(34,410);const hr=70+S.hr*s;const beat=Math.pow(Math.max(0,Math.sin(t*hr/60*Math.PI)),8);x.fillStyle='#C23447';x.beginPath();x.arc(hx,hy,12+beat*4,0,TAU);x.fill();
      // squeeze rings on the leg veins
      for(let k=0;k<3;k++){const [X,Y]=pt(-6,120+k*80);x.strokeStyle=rgba('#F2A65A',.2+.6*drive*S.sq/2);x.lineWidth=2;x.beginPath();x.ellipse(X,Y,14*(1-.3*s*S.sq),6,0,0,TAU);x.stroke();}
      x.fillStyle='rgba(236,230,218,.6)';x.font='11px "Martian Mono", monospace';x.textAlign='left';const lab=(n,a,b)=>{const [X,Y]=pt(a,b);x.fillText(n,X+16,Y);};
      lab('brainstem',20,566);lab('neck sensors',36,470);lab('heart',40,405);lab('leg veins',0,160);
      const q=s=>api.card.querySelector(s);if(q('#pc-hr')){q('#pc-hr').textContent=Math.round(hr)+' bpm'+(s>.5?` (+${Math.round(S.hr*s)})`:'');q('#pc-bp').textContent=Math.round(112+S.bp*s)+' mmHg';q('#pc-pool').textContent=Math.round(S.pool*s/10)*10+' mL';}
    },
  };
}

/* ---------------- level B: the rhythm game */
function rhythmLevel(){
  const HIT=300,SPD=300;let S;
  function reset(){S={on:false,t:0,P:100,HR:70,beats:[],next:0,hits:0,miss:0,pots:true,comp:false,fluid:false,prop:false,fx:[],done:false,hrMax:70,trace:[]};}
  reset();
  function step(dt,api){if(!S.on||S.done)return;S.t+=dt;
    const drop=4.5*(S.comp?.7:1)*(S.fluid?.75:1);S.P=Math.max(72,S.P-drop*dt);
    const k=2*(S.prop?.6:1);const tgt=70+(S.pots?7:0)+k*Math.max(0,100-S.P);S.HR+=(tgt-S.HR)*(1-Math.exp(-dt*.8));S.hrMax=Math.max(S.hrMax,S.HR);
    S.next-=dt;if(S.next<=0){S.next=60/S.HR;S.beats.push({x:1000,hit:false,missed:false});}
    for(const b of S.beats){b.x-=SPD*dt;
      // a typical body runs the reflex by itself: every beat fires a full squeeze, no tapping needed
      if(!S.pots&&!b.hit&&!b.missed&&b.x<=HIT){b.hit=true;S.hits++;S.P=Math.min(104,S.P+4);S.fx.push({t:0,good:true});}
      if(!b.hit&&!b.missed&&b.x<HIT-46){b.missed=true;S.miss++;}}
    S.beats=S.beats.filter(b=>b.x>-50);
    if(S.t%0.25<dt)S.trace.push([S.t,S.HR,S.P]);
    if(S.t>=60){S.done=true;const rise=Math.round(S.hrMax-70);const el=api.card.querySelector('#pr-end');if(el){el.hidden=false;el.innerHTML=`<p class="sub">Ten minutes upright</p><p><b style="color:var(--bone)">Peak rise: +${rise} bpm</b>, ${S.hits} of ${S.hits+S.miss} beats on time. ${S.pots&&!S.comp&&!S.fluid?'Even with perfect timing, weak squeezes leave the heart to do the work: that\'s POTS. Now try compression and fluids.':S.pots?'Compression and fluids shrink the drop, so each squeeze goes further.':'A typical body: a small rise, and it settles.'}</p>`;}api.toast(`Peak rise +${rise} bpm`);}
  }
  function hit(api){if(!S.on){S.on=true;return;}let best=null,bd=46;for(const b of S.beats){if(b.hit||b.missed)continue;const d=Math.abs(b.x-HIT);if(d<bd){bd=d;best=b;}}
    if(best){best.hit=true;S.hits++;S.P=Math.min(104,S.P+4*(S.pots?.7:1));S.fx.push({t:0,good:bd<20});}else S.fx.push({t:0,bad:true});}
  return {id:'rhythm',label:'Rhythm',size:'1 s',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'a game version of the reflex'},zoomFocus:{x:500,y:350},
    card(){return `<p class="k">Level 2 · the reflex, as a game</p><h2>Stand up and keep up</h2>
      <p>The patient has just stood up and blood is draining to her legs. Each heartbeat (dot) carries the pressure report; <b style="color:var(--bone)">tap or press space as it crosses the line</b> to fire a squeeze. Miss, or squeeze too weakly, and the heart speeds up to compensate. Faster heart, more beats: that's the trade POTS makes. Turn off "The patient (POTS)" to watch a typical body run the reflex by itself. In POTS mode even perfect taps fall short, because the squeeze itself is weaker: it isn't about effort.</p>
      <div class="dv-meter"><span>Heart rate</span><b id="pr-hr">70</b></div>
      <div class="dv-meter"><span>Rise since lying</span><b id="pr-rise">+0</b><i><u id="pr-riseB"></u></i></div>
      <div class="dv-meter"><span>Blood flow to the brain</span><b id="pr-p"></b><i><u id="pr-pB" style="background:#7FD3A3"></u></i></div>
      <div class="dv-btns"><button class="dv-btn on" id="pr-pots" type="button">The patient (POTS)<small>weaker squeeze</small></button><button class="dv-btn" id="pr-comp" type="button">Compression<small>less pooling</small></button><button class="dv-btn" id="pr-fluid" type="button">Fluids and salt<small>more volume</small></button><button class="dv-btn" id="pr-prop" type="button">Propranolol<small>blunts the racing</small></button></div>
      <div id="pr-end" hidden></div>
      <div class="dv-btns"><button class="dv-btn go" id="pr-go" type="button">Start (10 minutes in 60 seconds)</button></div>
      <p class="dv-fine">The red line marks a 30 bpm rise, the diagnostic threshold. A game version of the reflex: the real one runs automatically, beat by beat, and nobody can "try harder" at it. In POTS the arm-cuff blood pressure usually holds; what dips is the flow reaching the brain, which is why the patient can feel lightheaded with a normal reading. Sizes of the effects are illustrative.</p>`;},
    bind(card,api){const tg=(id,key,g)=>{const b=card.querySelector(id);b.onclick=()=>{S[key]=!S[key];b.classList.toggle('on',S[key]);if(g&&S[key])api.discover(g,true);};};
      tg('#pr-pots','pots');tg('#pr-comp','comp');tg('#pr-fluid','fluid');tg('#pr-prop','prop','propr');
      card.querySelector('#pr-go').onclick=()=>{const keep={pots:S.pots,comp:S.comp,fluid:S.fluid,prop:S.prop};reset();Object.assign(S,keep);S.on=true;card.querySelector('#pr-end').hidden=true;};
      if(!this._key){this._key=e=>{if(e.code==='Space'&&api.root&&!api.root.hidden&&api.card.querySelector('#pr-go')){e.preventDefault();hit(api);}};addEventListener('keydown',this._key);}
      this._api=api;},
    press(p,api){hit(api);},
    draw(x,dt,t,api){step(dt,api);
      x.fillStyle='#070B10';x.fillRect(-400,-300,1800,1300);
      // trace of heart rate across the run
      x.strokeStyle='rgba(236,230,218,.12)';x.strokeRect(60,60,880,220);const ty=v=>280-(v-60)/90*220;
      x.strokeStyle='rgba(242,112,95,.8)';x.setLineDash([6,5]);x.beginPath();x.moveTo(60,ty(100));x.lineTo(940,ty(100));x.stroke();x.setLineDash([]);
      x.fillStyle='rgba(242,112,95,.9)';x.font='11px "Martian Mono", monospace';x.textAlign='right';x.fillText('+30 bpm',936,ty(100)-6);
      x.strokeStyle='#7FD3A3';x.lineWidth=2.5;x.beginPath();S.trace.forEach(([tt,hr],i)=>{const X=60+tt/60*880,Y=ty(hr);i?x.lineTo(X,Y):x.moveTo(X,Y);});x.stroke();
      x.textAlign='left';x.fillStyle='rgba(236,230,218,.55)';x.fillText('HEART RATE OVER 10 MINUTES UPRIGHT',64,52);
      // the lane
      x.fillStyle='#0E161B';x.fillRect(-400,380,1800,160);x.strokeStyle='rgba(236,230,218,.9)';x.lineWidth=3;x.beginPath();x.moveTo(HIT,370);x.lineTo(HIT,550);x.stroke();
      x.fillStyle='rgba(127,211,163,.10)';x.fillRect(HIT-46,380,92,160);
      for(const b of S.beats){const col=b.hit?'#7FD3A3':b.missed?'#5A3A40':'#EE6F82';x.save();x.globalCompositeOperation='lighter';if(!b.missed)glow(x,b.x,460,30,rgba(col,.7));x.restore();x.fillStyle=col;x.beginPath();x.arc(b.x,460,12,0,TAU);x.fill();}
      for(const f of S.fx){f.t+=dt;x.strokeStyle=f.bad?`rgba(242,112,95,${1-f.t*2})`:`rgba(127,211,163,${1-f.t*2})`;x.lineWidth=3;x.beginPath();x.arc(HIT,460,20+f.t*120,0,TAU);x.stroke();}
      S.fx=S.fx.filter(f=>f.t<.5);
      x.fillStyle='rgba(236,230,218,.75)';x.font='14px "Atkinson Hyperlegible", sans-serif';x.textAlign='center';x.fillText(S.on?(S.done?'Done. Change something and start again.':S.pots?'tap on the beat':'a typical body squeezes on every beat by itself: just watch'):'press Start, then tap on the beat',HIT+300,600);
      const q=s=>api.card.querySelector(s);if(q('#pr-hr')){q('#pr-hr').textContent=Math.round(S.HR)+' bpm';const rise=Math.round(S.HR-70);q('#pr-rise').textContent='+'+rise;const rb=q('#pr-riseB');rb.style.width=clamp(rise/60*100,0,100)+'%';rb.style.background=rise>=30?'#F2705F':'';
        q('#pr-p').textContent=S.P>94?'steady':S.P>84?'dipping':'low: lightheaded';q('#pr-pB').style.width=clamp((S.P-70)/34*100,0,100)+'%';}
    },
  };
}
export function potsDive(){return {levels:[circuitLevel(),rhythmLevel()],guide:GUIDE_P};}
