// Hashimoto's dive: thyroid tissue (H&E slide) → one follicle, the T4 factory, and a year of dosing.
import { TAU, clamp, lerp, rand, esc } from './dive.js';
import { G, glow, rgba, nucleus, COL } from './dive-ra.js';

const HE={bg:'#F4E4EC',colloid:'#E9A9C4',colloidPale:'#F2CFDD',cell:'#B57BB0',nuc:'#4B2C78',lymph:'#3B2A8A',fib:'#F7C9D6',blood:'#D9475E'};
function slideField(x,draw){ // a round microscope field with a dark surround
  x.save();x.fillStyle='#04070B';x.fillRect(-400,-300,1800,1300);x.beginPath();x.arc(500,350,420,0,TAU);x.clip();draw();x.restore();
  const g=x.createRadialGradient(500,350,330,500,350,425);g.addColorStop(0,'rgba(4,7,11,0)');g.addColorStop(1,'rgba(4,7,11,.85)');x.fillStyle=g;x.beginPath();x.arc(500,350,425,0,TAU);x.fill();
}
export const T4={
  t4(x,cx,cy,s=1){x.save();x.translate(cx,cy);x.scale(s,s);x.rotate(Math.PI/4);x.fillStyle='#40C7AA';x.fillRect(-7,-7,14,14);x.restore();x.save();x.translate(cx,cy);x.scale(s,s);x.fillStyle='#FFE36E';for(const [a,b] of [[-9,0],[9,0],[0,-9],[0,9]]){x.beginPath();x.arc(a,b,3,0,TAU);x.fill();}x.restore();},
  tsh(x,cx,cy,s=1){x.save();x.translate(cx,cy);x.scale(s,s);x.fillStyle='#78A0F4';x.beginPath();x.ellipse(-5,0,7,10,.3,0,TAU);x.fill();x.fillStyle='#A9C1FF';x.beginPath();x.ellipse(5,0,7,10,-.3,0,TAU);x.fill();x.restore();},
  tpo(x,cx,cy,s=1,blocked=false){x.save();x.translate(cx,cy);x.scale(s,s);x.fillStyle=blocked?'#7A6A88':'#FF9F43';x.beginPath();x.arc(0,0,9,.5,TAU-.5);x.lineTo(0,0);x.fill();x.restore();},
  thyro(x,cx,cy,s=1,dead=false){x.save();x.translate(cx,cy);x.scale(s,s);x.fillStyle=dead?'#6B6470':'#B57BB0';x.beginPath();x.roundRect(-16,-14,32,28,5);x.fill();x.strokeStyle=dead?'#4A444F':'#E3B6DE';x.lineWidth=1.4;x.stroke();nucleus(x,0,4,7,6,0,dead?'#3A3540':'#4B2C78');x.restore();},
};
export const GUIDE_T={
  thyro:{name:'Thyrocyte (follicular cell)',kind:'Cell',size:'about 10–15 µm',draw:(x,cx,cy,s)=>T4.thyro(x,cx,cy,s*2.4),
    text:['The worker of the thyroid. Thyrocytes sit in a single ring around a ball of stored protein and build thyroid hormone on its surface.','In Hashimoto\'s, immune cells and antibodies destroy them slowly, over years.']},
  colloid:{name:'Colloid and thyroglobulin',kind:'Stored protein',size:'a follicle is 50–500 µm',draw:(x,cx,cy,s)=>{x.fillStyle=HE.colloid;x.beginPath();x.arc(cx,cy,40*s,0,TAU);x.fill();x.fillStyle='#FFE36E';for(let i=0;i<8;i++){x.beginPath();x.arc(cx+Math.cos(i)*22*s,cy+Math.sin(i*1.7)*18*s,3*s,0,TAU);x.fill();}},
    text:['The pink centre of each follicle is colloid, packed with thyroglobulin, a large protein whose tyrosine building blocks get iodine attached.','It is a hormone warehouse: enough for roughly two to three months, stored outside the cells.']},
  tpo:{name:'TPO (thyroid peroxidase)',kind:'Enzyme',size:'a protein, nanometres',draw:(x,cx,cy,s)=>T4.tpo(x,cx,cy,s*3.5),
    text:['The enzyme at the cell\'s inner surface that attaches iodine to thyroglobulin and joins the pieces into T4 and T3. It contains heme, so it needs iron.','Antibodies against TPO (anti-TPO) are the classic blood test for Hashimoto\'s.']},
  t4hormone:{name:'T4 (thyroxine)',kind:'Hormone',size:'about 1 nm',draw:(x,cx,cy,s)=>T4.t4(x,cx,cy,s*3),
    text:['A hormone carrying four iodine atoms (the yellow dots). The thyroid releases mostly T4, which tissues convert to the more active T3.','Levothyroxine is this exact molecule, made in a factory, so the body can\'t tell the difference.']},
  tsh:{name:'TSH',kind:'Hormone',size:'a protein, nanometres',draw:(x,cx,cy,s)=>T4.tsh(x,cx,cy,s*3),
    text:['Thyroid-stimulating hormone from the pituitary. When T4 falls, the pituitary sends more TSH to push the thyroid harder.','A high TSH is the earliest sign of a failing thyroid, and the number doctors use to set the patient\'s dose.']},
  antitpo:{name:'Anti-TPO antibody',kind:'Antibody',size:'about 10–15 nm',draw:(x,cx,cy,s)=>G.ab(x,cx,cy,s*.8,0,'#9B6BE8'),
    text:['An antibody against the patient\'s own TPO enzyme, found in most people with Hashimoto\'s.','It marks the disease; the actual destruction is done mostly by immune cells, which is why no drug currently stops it and treatment replaces the hormone instead.']},
  lymph:{name:'Lymphocytes',kind:'Cells',size:'about 7–10 µm',draw:(x,cx,cy,s)=>{for(let i=0;i<7;i++)G.tcell(x,cx+Math.cos(i)*18*s,cy+Math.sin(i*1.3)*14*s,s*.9);},
    text:['Immune cells that pour into the thyroid in Hashimoto\'s, sometimes forming whole lymph-node-like clusters (germinal centres) inside it.','This crowd of small dark cells is what a pathologist sees under the microscope.']},
};

/* ---------------- level A: the slide */
function slideLevel(){
  const st={k:0,tk:.45,cache:null,cacheK:-1};
  const fol=[];{let tries=0;while(fol.length<34&&tries<4000){tries++;const r=rand(38,88),x=rand(120,880),y=rand(-20,720);if(Math.hypot(x-500,y-350)>460)continue;if(fol.every(f=>Math.hypot(f.x-x,f.y-y)>f.r+r+14))fol.push({x,y,r,seed:rand(0,9),fate:Math.random()});}}
  const lymph=[];for(let i=0;i<700;i++){const cx=380+Math.cos(i*.7)*rand(0,200),cy=420+Math.sin(i*1.3)*rand(0,150);lymph.push({x:cx+rand(-60,60),y:cy+rand(-60,60),o:Math.random()});}
  function render(k){const c=document.createElement('canvas');c.width=2000;c.height=1400;const x=c.getContext('2d');x.scale(2,2);
    x.fillStyle=HE.bg;x.fillRect(0,0,1000,700);
    // fibrosis strands
    x.strokeStyle=rgba('#E89BB5',.15+k*.55);x.lineWidth=2+k*5;for(let i=0;i<10;i++){const sx=rand(120,880),sy=rand(60,640),a=rand(0,3.14);x.beginPath();x.moveTo(sx,sy);x.quadraticCurveTo(sx+Math.cos(a)*90+rand(-30,30),sy+Math.sin(a)*90+rand(-30,30),sx+Math.cos(a)*200,sy+Math.sin(a)*200);x.stroke();}
    // capillaries
    x.fillStyle=HE.blood;for(let i=0;i<60;i++){x.beginPath();x.ellipse(rand(80,920),rand(0,700),3,1.6,rand(0,3),0,TAU);x.fill();}
    for(const f of fol){const lost=k>f.fate*0.95+.05;const shrink=lost?.45:1-k*.25;const r=f.r*shrink;if(lost&&k>.85&&f.fate<.5)continue;
      x.fillStyle=k>.5?HE.colloidPale:HE.colloid;x.beginPath();x.arc(f.x,f.y,r,0,TAU);x.fill();
      // the single ring of follicular cells around each follicle
      const n=Math.max(10,Math.round(r*.55));for(let i=0;i<n;i++){const a=i/n*TAU+f.seed;const cx=f.x+Math.cos(a)*(r+5),cy=f.y+Math.sin(a)*(r+5);
        const hurthle=k>.4&&(i+Math.round(f.seed))%5===0;x.fillStyle=hurthle?'#E58AB0':HE.cell;x.beginPath();x.arc(cx,cy,hurthle?7:5.5,0,TAU);x.fill();x.fillStyle=HE.nuc;x.beginPath();x.arc(cx,cy,hurthle?3.4:2.6,0,TAU);x.fill();}}
    // lymphocytes and a germinal centre
    const nL=Math.round(lymph.length*k);x.fillStyle=HE.lymph;for(let i=0;i<nL;i++){const L=lymph[i];x.beginPath();x.arc(L.x,L.y,2.6,0,TAU);x.fill();}
    if(k>.35){x.fillStyle=rgba('#C6B6E8',(k-.35)*1.2);x.beginPath();x.ellipse(380,420,60*k,44*k,0,0,TAU);x.fill();}
    return c;}
  const HOT=[{x:fol[0]?.x??500,y:fol[0]?.y??350,k:'colloid'},{x:380,y:420,k:'lymph'}];
  const lf=fol.slice().sort((a,b)=>Math.hypot(a.x-640,a.y-300)-Math.hypot(b.x-640,b.y-300))[0]||{x:640,y:300};const lens={x:lf.x,y:lf.y};
  return {id:'slide',label:'Tissue',size:'1 mm',fit:'contain',bar:{units:83,label:'100 µm'},zoomFocus:lens,
    card(){return `<p class="k">Level 1 · tissue</p><h2>The thyroid under a microscope</h2>
      <p>A slice of thyroid stained the way pathologists stain it: pink balls of stored hormone protein (colloid), each ringed by a single layer of purple worker cells. Slide to see what years of Hashimoto's do.</p>
      <label class="dv-meter"><span>Years of autoimmune attack</span><b id="ts-k"></b></label><input id="ts-r" type="range" min="0" max="1" step=".01" value=".45" style="width:100%;accent-color:#40C7AA">
      <p id="ts-t"></p>
      <div class="dv-btns"><button class="dv-btn go" id="ts-go" type="button">Zoom into one follicle<small>run the T4 factory for a year</small></button></div>
      <p class="dv-fine">An illustration of typical H&amp;E histology, drawn to scale (100 µm bar). Tap the pink centres or the dark cell crowds to add them to your field guide.</p>`;},
    bind(card,api){const r=card.querySelector('#ts-r');const set=()=>{st.tk=+r.value;const y=st.tk;card.querySelector('#ts-k').textContent=y<.08?'none':y<.4?'early':y<.75?'years':'many years';
        card.querySelector('#ts-t').textContent=y<.08?'Healthy: plump follicles full of smooth pink colloid, each ringed by a neat single layer of cells.':y<.4?'Immune cells start gathering between the follicles.':y<.75?'Dense crowds of lymphocytes, even a germinal centre (pale circle), the hallmark of Hashimoto\'s. Follicles shrink and some cells swell into pink "Hürthle cells".':'Many follicles are gone, replaced by immune cells and scar-like fibrous tissue. What\'s left can\'t keep up, and levothyroxine fills the gap.';};
      r.oninput=set;set();card.querySelector('#ts-go').onclick=()=>api.go('follicle',{from:lens});},
    tap(p,api){if(Math.hypot(p.x-lens.x,p.y-lens.y)<60)return api.go('follicle',{from:lens});
      if(st.k>.2&&Math.hypot(p.x-380,p.y-420)<120)return api.discover('lymph');
      for(const f of fol)if(Math.hypot(p.x-f.x,p.y-f.y)<f.r)return api.discover(Math.hypot(p.x-f.x,p.y-f.y)>f.r*.8?'thyro':'colloid');},
    draw(x,dt,t){st.k=lerp(st.k,st.tk,1-Math.exp(-4*dt));if(Math.abs(st.k-st.cacheK)>.03||!st.cache){st.cache=render(st.k);st.cacheK=st.k;}
      slideField(x,()=>x.drawImage(st.cache,0,0,2000,1400,0,0,1000,700));
      const pr=1+.08*Math.sin(t*3);x.strokeStyle='rgba(64,199,170,.95)';x.lineWidth=2.5;x.beginPath();x.arc(lens.x,lens.y,46*pr,0,TAU);x.stroke();x.fillStyle='#40C7AA';x.font='12px "Martian Mono", monospace';x.textAlign='center';x.fillText('zoom in',lens.x,lens.y+66*pr);},
  };
}

/* ---------------- level B: the follicle game */
function follicleLevel(){
  const CX=500,CY=360,R=190,N=18;let S;
  function reset(){S={week:0,done:false,E:.55,dose:0,pool:0,lag:0,labs:[],inRange:0,cells:Array.from({length:N},(_,i)=>({a:i/N*TAU,dead:false,hit:0})),
    iod:[],tg:Array.from({length:22},()=>({a:rand(0,TAU),r:rand(20,R-50),io:0})),out:[],ab:[],tc:[{a:rand(0,TAU),r:R+60},{a:rand(0,TAU),r:R+70}],acc:0,accO:0,tsh:[]};
    S.lag=model().ft4;}
  reset();
  // illustrative hormone model, same constants as the thyroid instrument: T4 half-life ~1 week, TSH lags ~6–8 weeks
  function model(){return {ft4:1.25*(S.E+S.pool)};}
  function step(dt,api){if(S.done)return;const wk=dt/1.6;S.week+=wk;
    // autoimmune loss: steady, faster early
    const alive=S.cells.filter(c=>!c.dead);const target=Math.max(.12,.55-.0085*S.week);
    while(alive.length/N*.55>target+.02){const c=alive.splice(Math.floor(Math.random()*alive.length),1)[0];c.dead=true;c.hit=1;}
    S.E=alive.length/N*.55;
    S.pool+=(S.dose/75*.75-S.pool)*(1-Math.pow(.5,wk));
    const ft4=1.25*(S.E+S.pool);S.lag+=(ft4-S.lag)*(1-Math.exp(-wk/0.8)); // with T4's own week-long half-life, TSH settles in about 6–8 weeks
    S.ft4=ft4;S.tshV=clamp(1.8*Math.pow(10,(1.25-S.lag)/.5),.01,100);
    if(S.ft4>=.8&&S.ft4<=1.8&&S.tshV>=.4&&S.tshV<=4)S.inRange+=wk;
    if(S.week>=52){S.week=52;S.done=true;const pct=Math.round(S.inRange/52*100);api.toast(`Year done · in range ${pct}% of weeks`);const e=api.card.querySelector('#tf-end');if(e){e.hidden=false;e.innerHTML=`<p class="sub">Your year</p><p><b style="color:var(--bone)">In range ${pct}% of the weeks.</b> ${pct>70?'That\'s what good thyroid care looks like: small adjustments, patience between lab checks.':'Hard, isn\'t it? Every change takes weeks to show in TSH, so doses are adjusted in small steps with labs 6–8 weeks apart.'}</p>`;}}
  }
  function cellPos(c,d=0){return {x:CX+Math.cos(c.a)*(R+18+d),y:CY+Math.sin(c.a)*(R+18+d)};}
  function draw(x,dt,t,api){step(dt,api);
    x.fillStyle='#0B0E17';x.fillRect(-400,-300,1800,1300);
    // capillaries around the follicle
    x.strokeStyle='rgba(217,71,94,.45)';x.lineWidth=22;x.beginPath();x.arc(CX,CY,R+78,0,TAU);x.stroke();x.strokeStyle='#14070C';x.lineWidth=14;x.stroke();
    // colloid
    const cg=x.createRadialGradient(CX-40,CY-40,20,CX,CY,R);cg.addColorStop(0,'#F4C6D8');cg.addColorStop(1,'#D98AAE');x.fillStyle=cg;x.beginPath();x.arc(CX,CY,R,0,TAU);x.fill();
    // thyroglobulin beads gaining iodine
    for(const g of S.tg){const px=CX+Math.cos(g.a+t*.03)*g.r,py=CY+Math.sin(g.a+t*.03)*g.r;for(let k=0;k<5;k++){x.fillStyle=k<g.io?'#FFE36E':'rgba(120,60,90,.6)';x.beginPath();x.arc(px+k*7-14,py+Math.sin(k+t)*2,3.2,0,TAU);x.fill();}}
    // cells ring with TPO at the inner surface
    for(const c of S.cells){const p=cellPos(c);x.save();x.translate(p.x,p.y);x.rotate(c.a+Math.PI/2);T4.thyro(x,0,0,1.15,c.dead);if(!c.dead)T4.tpo(x,0,-20,1,false);x.restore();}
    // iodide in, hormone out, at a rate set by living cells
    S.acc+=dt*S.E*10;while(S.acc>1){S.acc--;const live=S.cells.filter(c=>!c.dead);if(!live.length)break;const c=live[Math.floor(Math.random()*live.length)];S.iod.push({c,u:0});}
    for(const i of S.iod){i.u+=dt*.7;const p0=cellPos(i.c,60),p1=cellPos(i.c,-30);const px=lerp(p0.x,p1.x,i.u),py=lerp(p0.y,p1.y,i.u);x.fillStyle='#FFE36E';x.beginPath();x.arc(px,py,3,0,TAU);x.fill();
      if(i.u>=1){const g=S.tg[Math.floor(Math.random()*S.tg.length)];g.io++;if(g.io>=5){g.io=0;S.out.push({c:i.c,u:0});}}}
    S.iod=S.iod.filter(i=>i.u<1);
    for(const o of S.out){o.u+=dt*.5;const p0=cellPos(o.c,-20),p1=cellPos(o.c,70);T4.t4(x,lerp(p0.x,p1.x,o.u),lerp(p0.y,p1.y,o.u),.9);}
    S.out=S.out.filter(o=>o.u<1);
    // levothyroxine arriving from the blood
    if(S.dose>0){const n=Math.round(S.pool*14);for(let i=0;i<n;i++){const a=t*.25+i/n*TAU;T4.t4(x,CX+Math.cos(a)*(R+78),CY+Math.sin(a)*(R+78),.8);}}
    // TSH pressure: more TSH particles when T4 is low
    const nT=Math.round(clamp(Math.log10(S.tshV||1)+1.2,0,3)*6);for(let i=0;i<nT;i++){const a=-t*.3+i/Math.max(nT,1)*TAU;T4.tsh(x,CX+Math.cos(a)*(R+110),CY+Math.sin(a)*(R+110),.9);}
    // immune attack
    for(const tc of S.tc){tc.a+=dt*.15;G.tcell(x,CX+Math.cos(tc.a)*tc.r,CY+Math.sin(tc.a)*tc.r,1.2);}
    for(const c of S.cells)if(c.dead&&c.hit>0){c.hit-=dt*.5;const p=cellPos(c);x.save();x.globalCompositeOperation='lighter';glow(x,p.x,p.y,40*c.hit,'rgba(155,107,232,.8)');x.restore();}
    for(let i=0;i<4;i++){const a=t*.12+i*1.6;G.ab(x,CX+Math.cos(a)*(R+44),CY+Math.sin(a)*(R+44),.16,a+Math.PI/2,'#9B6BE8');}
    x.fillStyle='rgba(236,230,218,.55)';x.font='11px "Martian Mono", monospace';x.textAlign='center';x.fillText('COLLOID (stored thyroglobulin)',CX,CY+6);x.fillText('CAPILLARY',CX,CY-R-98);
    ui(api);
  }
  let last=0;function ui(api){const n=performance.now();if(n-last<180)return;last=n;const q=s=>api.card.querySelector(s);if(!q('#tf-w'))return;
    q('#tf-w').textContent=Math.floor(S.week);q('#tf-e').textContent=Math.round(S.E*100)+'% of normal';q('#tf-eB').style.width=S.E*100+'%';q('#tf-d').textContent=S.dose+' mcg';
    const f=S.ft4||0;q('#tf-feel').textContent=f<.8?'tired, cold, foggy, slowed down':f>1.8?'racing heart, jittery, hot, poor sleep':'steady';}
  return {id:'follicle',label:'Follicle',size:'100 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:100,label:'20 µm'},zoomFocus:{x:500,y:360},
    card(){return `<p class="k">Level 2 · cells · week <span id="tf-w">0</span> of 52</p><h2>Run the T4 factory</h2>
      <p>Worker cells pull iodine (yellow) from the blood, the TPO enzyme stitches it onto stored protein, and finished T4 leaves for the body. Immune cells keep knocking workers out, and no treatment yet stops that. Here years of loss are compressed into one; in real life it usually takes many years. <b style="color:var(--bone)">You play the patient's endocrinologist: keep T4 steady with the dose.</b></p>
      <div class="dv-meter"><span>Thyroid still working</span><b id="tf-e"></b><i><u id="tf-eB"></u></i></div>
      <div class="dv-meter"><span>Levothyroxine</span><b id="tf-d">0 mcg</b></div>
      <div class="dv-btns"><button class="dv-btn" id="tf-m" type="button">− 12.5 mcg</button><button class="dv-btn" id="tf-p" type="button">+ 12.5 mcg</button><button class="dv-btn go" id="tf-lab" type="button">Check labs<small>TSH lags weeks behind</small></button></div>
      <div class="dv-meter"><span>How the patient would feel</span><b id="tf-feel" style="font-size:11.5px"></b></div>
      <div id="tf-labs" class="dv-fine"></div>
      <div id="tf-end" hidden></div>
      <div class="dv-btns"><button class="dv-btn" id="tf-re" type="button">Restart the year</button></div>
      <p class="dv-fine">Target: TSH about 0.4–4.0 and free T4 about 0.8–1.8. The model is illustrative, with real timing: T4's half-life is about a week and TSH takes 6–8 weeks to settle after a change, which is why labs are rechecked on that schedule. One week passes every 1.6 seconds.</p>`;},
    bind(card,api){
      card.querySelector('#tf-m').onclick=()=>{S.dose=Math.max(0,S.dose-12.5);};card.querySelector('#tf-p').onclick=()=>{S.dose=Math.min(200,S.dose+12.5);if(S.dose===12.5)api.discover('t4hormone',true);};
      card.querySelector('#tf-lab').onclick=()=>{S.labs.unshift(`Week ${Math.floor(S.week)}: TSH ${S.tshV<10?S.tshV.toFixed(1):Math.round(S.tshV)}, free T4 ${S.ft4.toFixed(2)}${S.tshV>4?' (high TSH: underactive)':S.tshV<.4?' (suppressed: too much)':' (in range)'}`);
        card.querySelector('#tf-labs').innerHTML=S.labs.slice(0,4).map(l=>`<div>${esc(l)}</div>`).join('');api.discover('tsh',true);};
      card.querySelector('#tf-re').onclick=()=>{reset();card.querySelector('#tf-end').hidden=true;card.querySelector('#tf-labs').innerHTML='';};
    },
    tap(p,api){const d=Math.hypot(p.x-CX,p.y-CY);
      if(d<R-20)return api.discover('colloid');if(d<R+40)return api.discover(d<R?'tpo':'thyro');
      if(d<R+65)return api.discover('antitpo');if(d<R+95)return api.discover('t4hormone');return api.discover('tsh');},
    draw,
  };
}
export function thyroidDive(){return {levels:[slideLevel(),follicleLevel()],guide:GUIDE_T};}
