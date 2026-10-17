// Stage-two instruments, part 2: lumbar spurs, the cervix (LSIL), endometriosis (suspected).
import * as THREE from 'three';
import { damp } from './core.js';
import { slider, toggle, bindSlider, bindToggle, clamp, fmt, lerp, kit, lineChart } from './kit.js';

export function makeStations3(A){
  const {MESH,V3}=A;const K=kit(A);const all=[];

  /* ==================================================================== LUMBAR SPURS */
  const lumbar=(()=>{
    let built=false,G,roots={},spurs=[],tickOff,ui;const v={spur:2,disc:20,post:0,lvl:'45'};const cur={post:0};
    const ROOT={
      '45':{root:'L4',where:'L4/L5 opening',sense:'inner shin',str:'lifting the foot; straightening the knee',reflex:'knee jerk',zone:'L4'},
      '5S':{root:'L5',where:'L5/S1 opening',sense:'outer shin, top of the foot, big toe',str:'lifting the big toe; lifting the foot',reflex:'no reliable reflex',zone:'L5'},
    };
    function build(){
      built=true;G=new THREE.Group();A.root.add(G);
      const d4=K.box('Intervertebral disk of fourth lumbar vertebra'),d5=K.box('Intervertebral disk of fifth lumbar vertebra');
      const c4=d4.getCenter(V3()),c5=d5.getCenter(V3());
      // the dural sac and its roots, schematic
      const sac=K.tube([[0,1.07,-0.038],[0,0.99,-0.04],[0,0.93,-0.046],[0,0.87,-0.06]],0.0075,'#E9D8A6');sac.mesh.material.transparent=true;sac.mesh.material.opacity=.55;G.add(sac.mesh);
      for(const s of [-1,1]){
        const fr4=V3(s*0.026,c4.y+0.008,d4.min.z-0.008),fr5=V3(s*0.028,c5.y+0.008,d5.min.z-0.008);
        const L4=K.tube([[s*0.004,c4.y+0.035,-0.04],[s*0.013,c4.y+0.02,-0.038],fr4,[s*0.038,c4.y-0.006,d4.min.z+0.004],[s*0.05,0.9,0.002],[s*0.06,0.84,0.004]],0.0028,'#F2C14E');
        const L5=K.tube([[s*0.005,c4.y+0.002,-0.043],[s*0.013,c5.y+0.022,-0.044],fr5,[s*0.04,c5.y-0.01,-0.03],[s*0.05,0.86,-0.032],[s*0.062,0.8,-0.046]],0.0028,'#F2C14E');
        G.add(L4.mesh,L5.mesh);(roots['45']??=[]).push(L4.mesh);(roots['5S']??=[]).push(L5.mesh);
        // spurs: lips at the back corners of the vertebral bodies and on the facet joint, pointing into the opening; plus front lips
        const mat=new THREE.MeshStandardMaterial({color:'#F2A65A',emissive:'#F2A65A',emissiveIntensity:.25,roughness:.6});
        const add=(base,dir,lvl,kind)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),mat);m.userData={base,dir:dir.clone().normalize(),lvl,kind};m.renderOrder=7;G.add(m);spurs.push(m);};
        for(const [d,lvl] of [[d4,'45'],[d5,'5S']]){const c=d.getCenter(V3());
          add(V3(s*0.017,d.max.y+0.001,d.min.z+0.004),V3(s*0.5,0.25,-0.8),lvl,'post');add(V3(s*0.017,d.min.y-0.001,d.min.z+0.004),V3(s*0.5,-0.25,-0.8),lvl,'post');
          add(V3(s*0.024,c.y+0.012,d.min.z-0.024),V3(0,-0.25,1),lvl,'facet');
          add(V3(s*0.01,d.max.y+0.001,d.max.z-0.002),V3(0,0.7,0.7),lvl,'front');add(V3(s*0.01,d.min.y-0.001,d.max.z-0.002),V3(0,-0.7,0.7),lvl,'front');}
      }
    }
    function model(){
      const p=cur.post;const posture=p<0?1+0.12*(-p):1-0.15*p;           // flexion opens the opening ~12%, extension closes it ~15% (Inufusa 1996)
      const area=clamp(posture-v.spur*0.075-v.disc/100*0.45,0.05,1.2);
      const comp=clamp((0.74-area)/0.36,0,1);return {area,comp};
    }
    function foramenSVG(M){
      // side view of one motion segment: front on the left, back on the right
      const ext=cur.post*7,sp=v.spur,drop=v.disc/100*16;const nc=lerp(1,.62,M.comp);
      const bone='#E6DFCC',spur='#F2A65A';
      return `<svg viewBox="0 0 230 180" class="foramen" role="img" aria-label="Side view of the opening where the nerve root leaves the spine">
        <rect x="22" y="${64+drop/2}" width="86" height="${40-drop}" rx="6" fill="#86C9DA" opacity=".9"/>
        <text x="65" y="${88}" text-anchor="middle" fill="#0A0F11" font-size="10">disc</text>
        <g transform="translate(0,${drop}) rotate(${ext} 110 84)">
          <rect x="18" y="10" width="92" height="56" rx="9" fill="${bone}"/>
          <path d="M106 18 h40 q8 0 8 8 v16 q0 6 -8 6 h-40 z" fill="${bone}"/>
          <path d="M150 26 h16 v66 q0 10 -9 10 h-4 q-6 0 -6 -8 z" fill="${bone}"/>
          ${sp>0?`<ellipse cx="${110+sp*1.6}" cy="62" rx="${sp*2.6}" ry="${2+sp*1.1}" fill="${spur}"/>`:''}
          <text x="60" y="42" text-anchor="middle" fill="#3A3A36" font-size="10.5">vertebra above</text>
        </g>
        <rect x="18" y="104" width="92" height="56" rx="9" fill="${bone}"/>
        <path d="M106 114 h40 q8 0 8 8 v16 q0 6 -8 6 h-40 z" fill="${bone}"/>
        <path d="M134 116 q0 -38 6 -48 q4 -4 8 0 v48 z" fill="${bone}"/>
        ${sp>0?`<ellipse cx="${110+sp*1.6}" cy="106" rx="${sp*2.6}" ry="${2+sp*1.1}" fill="${spur}"/><ellipse cx="${136-sp*1.2}" cy="84" rx="${1.5+sp*1.4}" ry="${sp*2.6}" fill="${spur}"/>`:''}
        <ellipse cx="122" cy="${60+drop*.7+Math.max(0,ext)*.5}" rx="8" ry="${8*nc}" fill="${M.comp>.55?'#FF6A3C':'#F2C14E'}" stroke="#0A0F11" stroke-width="1.2"/>
        <text x="60" y="136" text-anchor="middle" fill="#3A3A36" font-size="10.5">vertebra below</text>
        <text x="190" y="62" fill="var(--dim)" font-size="9.5">facet</text><text x="190" y="74" fill="var(--dim)" font-size="9.5">joint</text>
        <text x="122" y="174" text-anchor="middle" fill="var(--dim)" font-size="9.5">front ← → back</text>
      </svg>`;
    }
    function dermSVG(zone,comp){
      // Right leg seen from the front: the inner (medial) side and the big toe are on the viewer's right.
      const on=c=>comp<.2?'var(--line-2)':c,y='#F2C14E',L4=zone==='L4',L5=zone==='L5';
      const toes=[[66,4],[75,4.5],[85,5],[96,5.5],[110,7]];
      return `<svg viewBox="0 0 230 150" class="derm" role="img" aria-label="Right leg from the front, with the skin area served by the ${zone} root">
        <path d="M60 6 H112 Q110 50 104 92 Q114 104 120 122 Q122 132 112 134 H64 Q54 134 56 124 Q60 106 70 92 Q62 50 60 6 Z" fill="var(--line-2)"/>
        ${toes.map(([x,r],i)=>`<circle cx="${x}" cy="${136-r*.4}" r="${r}" fill="${L5&&i>=3?on(y):'var(--line-2)'}"/>`).join('')}
        ${L5?`<path d="M66 6 H94 Q92 50 94 94 Q104 104 112 118 Q118 128 112 132 H100 Q96 120 88 110 Q76 100 72 92 Q66 50 66 6 Z" fill="${on(y)}"/>`:''}
        ${L4?`<path d="M96 6 H112 Q110 50 104 92 Q114 104 119 117 L113 120 Q106 106 98 98 Q94 50 96 6 Z" fill="${on(y)}"/>`:''}
        <text x="52" y="40" text-anchor="end" fill="var(--dim)" font-size="9.5">outer</text><text x="120" y="40" fill="var(--dim)" font-size="9.5">inner</text>
        <text x="${L4?98:76}" y="${L4?30:62}" fill="#0A0F11" font-size="${L4?8:9}">${zone}</text>
        <text x="142" y="84" fill="var(--dim)" font-size="10">right leg,</text><text x="142" y="97" fill="var(--dim)" font-size="10">from the front</text>
        <text x="142" y="116" fill="var(--dim)" font-size="9">${L4?'inner shin, down':'outer shin, top of'}</text><text x="142" y="128" fill="var(--dim)" font-size="9">${L4?'to the inner ankle':'the foot, big toe'}</text>
      </svg>`;
    }
    return {
      id:'lumbar',title:'Lumbar openings',fig:'Spurs, discs and the nerve roots',
      enter(panel){
        K.resetRig();if(!built)build();G.visible=true;
        K.setMode({layers:{skin:0,skeleton:.3,organs:0,vessels:0},focus:A.resolve(['Third lumbar vertebra','Fourth lumbar vertebra','Fifth lumbar vertebra','Sacrum','Intervertebral disk of fourth lumbar vertebra','Intervertebral disk of fifth lumbar vertebra']),focusColor:'#B193E3',dim:.35});
        panel.innerHTML=`<div class="seg" role="radiogroup" aria-label="Level">${Object.entries(ROOT).map(([k,r])=>`<button role="radio" data-l="${k}" aria-checked="${k===v.lvl}">${r.where}</button>`).join('')}</div>
          <div id="l-svg"></div>
          <div class="readouts">
            <div class="ro"><span>Opening left for the nerve</span><b id="l-a"></b><span class="bar"><i id="l-aBar"></i></span></div>
            <div class="ro"><span>Pressure on the <span id="l-root"></span> root</span><b id="l-c"></b><span class="bar"><i id="l-cBar"></i></span></div>
            <div class="ro"><span>Where it would be felt</span><b id="l-se" class="sm"></b></div>
            <div class="ro"><span>Strength to check</span><b id="l-st" class="sm"></b></div>
            <div class="ro"><span>Reflex</span><b id="l-rf" class="sm"></b></div>
          </div>
          <div id="l-derm"></div>
          ${slider('l-spur','Spur size',0,5,.5,2,' mm')}
          ${slider('l-disc','Disc height lost',0,50,5,20,'%')}
          ${slider('l-post','Bend forward ↔ lean back',-1,1,.05,0,'')}
          <div class="btns"><button class="btn" id="l-cart" type="button">Lean on a shopping cart</button><button class="btn" id="l-back" type="button">Lean back</button><button class="btn" id="l-neu" type="button">Upright</button></div>
          <div class="warn"><b>Emergency department, same day</b>Not an urgent-care clinic. New trouble starting to pee or not feeling a full bladder, leaking urine or stool, numbness around the bottom, genitals or inner thighs (the "saddle"), new change in sexual sensation, or pain, numbness or weakness in <strong>both</strong> legs. Hours matter. Leg weakness that is quickly getting worse needs prompt care too.</div>
          <p class="fine">The vertebrae and discs are real anatomy. The spurs (amber), the nerve roots and the side-view diagram are drawn schematically. Most spurs, like the ones on the front of the vertebrae here, never touch a nerve. Spurs can narrow the side openings where each root leaves (at L4/L5, the L4 root; at L5/S1, the L5 root), which is what this instrument shows, or the channel just inside them, where the next root down passes (at L4/L5 that is L5, at L5/S1 it is S1, which affects the sole and outer edge of the foot, pushing off on tiptoe and the ankle jerk). That's why the same level can give different patterns. In donated cadaver spines, bending forward widened the opening by about 12% and leaning back narrowed it by about 15% (Inufusa 1996), which is why some people walk easier leaning on a shopping cart. The patient's imaging report isn't on the chart, so the sizes are illustrative.</p>`;
        ui=panel;
        bindSlider(panel,'l-spur',x=>v.spur=x,x=>x+' mm');bindSlider(panel,'l-disc',x=>v.disc=x,x=>x+'%');
        const ps=bindSlider(panel,'l-post',x=>v.post=x,x=>x<-.05?'forward':x>.05?'back':'upright');
        const set=x=>{ps.value=x;ps.dispatchEvent(new Event('input'));};
        panel.querySelector('#l-cart').onclick=()=>set(-.8);panel.querySelector('#l-back').onclick=()=>set(1);panel.querySelector('#l-neu').onclick=()=>set(0);
        panel.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{v.lvl=b.dataset.l;panel.querySelectorAll('[data-l]').forEach(x=>x.setAttribute('aria-checked',x===b));});
        const tgt=K.box('Intervertebral disk of fourth lumbar vertebra').getCenter(V3());
        A.flyTo({target:[tgt.x-0.01,tgt.y-0.02,tgt.z-0.025],dist:.68,azim:-138,elev:10});
        let lastKey='';
        tickOff=A.onTick(dt=>{
          cur.post=damp(cur.post,v.post,4,dt);const M=model();const R=ROOT[v.lvl];
          for(const m of spurs){const {base,dir,lvl,kind}=m.userData;const L=(kind==='front'?v.spur*.9:v.spur)/1000+1e-5;const show=kind==='front'||lvl===v.lvl||true;
            m.visible=v.spur>0&&show;m.position.copy(base).addScaledVector(dir,L*.25);m.scale.set(L*.7,L*.32,L*.7);m.quaternion.setFromUnitVectors(V3(0,1,0),V3(0,1,0));m.material.emissiveIntensity=.25;}
          for(const k in roots)for(const r of roots[k]){const c=k===v.lvl?M.comp:Math.max(0,M.comp-.25);r.material.color.set('#F2C14E').lerp(new THREE.Color('#FF5A3C'),c);r.material.emissive.copy(r.material.color);r.material.emissiveIntensity=.15+c*.6;}
          ui.querySelector('#l-a').textContent=fmt(M.area*100,0)+'%';const ab=ui.querySelector('#l-aBar');ab.style.width=clamp(M.area*100/1.2,0,100)+'%';ab.classList.toggle('over',M.area<.55);
          ui.querySelector('#l-root').textContent=R.root;ui.querySelector('#l-c').textContent=M.comp<.05?'none':M.comp<.4?'light':M.comp<.7?'moderate':'heavy';
          const cb=ui.querySelector('#l-cBar');cb.style.width=M.comp*100+'%';cb.classList.toggle('over',M.comp>=.55);
          ui.querySelector('#l-se').textContent=M.comp<.25?'nothing yet':(M.comp<.6?'tingling: ':'numbness, pain: ')+R.sense;
          ui.querySelector('#l-st').textContent=M.comp<.55?'normal':(M.comp<.85?'4/5: ':'3/5: ')+R.str;
          ui.querySelector('#l-rf').textContent=R.root==='L5'?R.reflex:(M.comp<.5?'normal knee jerk':'reduced knee jerk');
          const key=[fmt(cur.post,2),v.spur,v.disc,v.lvl,fmt(M.comp,2)].join();
          if(key!==lastKey){lastKey=key;ui.querySelector('#l-svg').innerHTML=foramenSVG(M);ui.querySelector('#l-derm').innerHTML=dermSVG(R.zone,M.comp);}
        });
      },
      exit(){tickOff?.();if(G)G.visible=false;}
    };
  })();all.push(lumbar);

  /* ==================================================================== CERVIX (LSIL) */
  const cervix=(()=>{
    let tickOff,ui,cv,ctx,patches=null,icons=null;const v={stain:'acetic',course:'clear',mo:0,hpv:'pos',recent:false,imm:false};let playing=false;
    const COURSE={clear:{label:'Clears (about 60%)'},persist:{label:'Persists (about 25%)'},progress:{label:'Progresses (about 11%)'}};
    function mkPatches(){
      const rnd=(a,b)=>a+Math.random()*(b-a);
      patches=[];for(let i=0;i<5;i++){const a=rnd(0,Math.PI*2),r=rnd(.34,.5);const pts=[];const n=14;const rad=rnd(.07,.13);
        for(let k=0;k<n;k++){const t=k/n*Math.PI*2;pts.push([Math.cos(t)*rad*rnd(.65,1.25),Math.sin(t)*rad*rnd(.65,1.25)]);}
        patches.push({cx:Math.cos(a)*r,cy:Math.sin(a)*r*.86,pts,dots:Array.from({length:14},()=>[rnd(-1,1)*rad*.7,rnd(-1,1)*rad*.7])});}
      icons=Array.from({length:100},(_,i)=>({cat:i<60?'clear':i<85?'persist':i<96?'progress':'other',at:2+Math.random()*22}));
      for(let i=icons.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[icons[i],icons[j]]=[icons[j],icons[i]];}
    }
    function grow(){const m=v.mo;if(v.course==='clear')return {s:clamp(1-m/16,0,1),hg:0};if(v.course==='persist')return {s:1,hg:0};return {s:1+clamp(m/24,0,1)*.6,hg:clamp((m-8)/10,0,1)};}
    function draw(){
      const W=cv.width,H=cv.height,R=W*.42;const g=grow();ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2,H/2);
      // vaginal wall vignette
      const bg=ctx.createRadialGradient(0,0,R*.9,0,0,W*.7);bg.addColorStop(0,'#5B2C33');bg.addColorStop(1,'#140A0C');ctx.fillStyle=bg;ctx.fillRect(-W/2,-H/2,W,H);
      const iod=v.stain==='iodine',ace=v.stain==='acetic';
      // ectocervix (squamous)
      const ecto=ctx.createRadialGradient(-R*.2,-R*.25,R*.1,0,0,R);ecto.addColorStop(0,iod?'#7A3A1C':'#F0B9B6');ecto.addColorStop(1,iod?'#4E2210':'#D98F92');
      ctx.beginPath();ctx.ellipse(0,0,R,R*.88,0,0,Math.PI*2);ctx.fillStyle=ecto;ctx.fill();
      // columnar epithelium around the os, and the transformation zone
      ctx.beginPath();ctx.ellipse(0,0,R*.3,R*.24,0,0,Math.PI*2);ctx.fillStyle=iod?'#C9877A':'#C2474F';ctx.fill();
      ctx.setLineDash([3,4]);ctx.strokeStyle='rgba(255,240,230,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,R*.62,R*.54,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      // external os
      ctx.beginPath();ctx.ellipse(0,0,R*.1,R*.035,0,0,Math.PI*2);ctx.fillStyle='#2A0F14';ctx.fill();
      // lesions
      for(const P of patches){if(g.s<=0.01)break;ctx.save();ctx.translate(P.cx*R,P.cy*R);ctx.scale(g.s,g.s);
        ctx.beginPath();P.pts.forEach(([x,y],i)=>{const X=x*R,Y=y*R;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});ctx.closePath();
        if(ace){const a=.32+g.hg*.55;ctx.fillStyle=`rgba(250,248,240,${a})`;ctx.shadowColor='rgba(255,255,255,.6)';ctx.shadowBlur=g.hg>.5?2:9;ctx.fill();ctx.shadowBlur=0;
          if(g.hg>.3){ctx.strokeStyle=`rgba(255,255,255,${g.hg})`;ctx.lineWidth=1.4;ctx.stroke();ctx.fillStyle=`rgba(140,30,40,${g.hg*.9})`;for(const [x,y] of P.dots){ctx.beginPath();ctx.arc(x*R,y*R,1.3,0,Math.PI*2);ctx.fill();}}}
        else if(iod){ctx.fillStyle='rgba(222,190,90,.9)';ctx.fill();}
        else{ctx.fillStyle=`rgba(245,200,200,${.08+g.hg*.1})`;ctx.fill();}
        ctx.restore();}
      ctx.restore();
      ctx.fillStyle='rgba(236,230,218,.75)';ctx.font='11px "Martian Mono", monospace';ctx.fillText(v.stain==='none'?'no stain':ace?'after vinegar (acetic acid)':'after iodine (Lugol\'s)',10,H-12);
    }
    function iconsHTML(){
      const col={clear:'var(--ok)',persist:'#F2A65A',progress:'var(--alert)',other:'var(--line-2)'};
      return `<div class="icons" aria-label="100 people with biopsy-confirmed CIN 1, followed without treatment">${icons.map(I=>`<i style="background:${v.mo>=I.at||I.cat==='other'?col[I.cat]:'#B9A8C8'}"></i>`).join('')}</div>`;
    }
    function plan(){
      if(v.imm)return ['not estimated for immunosuppressed patients','Colposcopy for any LSIL, whatever the HPV result.'];
      if(v.hpv==='neg')return ['about 1%','Repeat HPV-based testing in 1 year.'];
      if(v.hpv==='none')return ['not estimated','Colposcopy, as in earlier guidelines.'];
      if(v.recent)return ['about 2%','Repeat HPV-based testing in 1 year, because a negative HPV test within about 5 years lowers the risk.'];
      return ['just over 4%','Colposcopy: the 4% threshold is where the guidelines say to look.'];
    }
    return {
      id:'cervix',title:'Cervix',fig:'Colposcope view and what usually happens',
      enter(panel){
        K.resetRig();if(!patches)mkPatches();
        K.setMode({layers:{skin:0,skeleton:.12,organs:.06,vessels:0},focus:A.resolve(['#cervix']),focusColor:'#62BED3',dim:1});for(const r of A.resolve(['#uterus','#ovaries','Urinary bladder','Rectum']))if(!r.tags.includes('cervix'))r.tgt.op=.55;
        panel.innerHTML=`<canvas id="c-cv" width="560" height="440" class="colpo" data-raw aria-label="Colposcope view of the cervix"></canvas>
          <div class="seg" role="radiogroup" aria-label="Stain">${[['none','No stain'],['acetic','Vinegar'],['iodine','Iodine']].map(([k,l])=>`<button role="radio" data-st="${k}" aria-checked="${k===v.stain}">${l}</button>`).join('')}</div>
          <p class="fine" style="margin-top:0!important">During colposcopy, dilute vinegar turns abnormal cells white for a minute or so: low-grade changes are thin and fade fast; high-grade ones are dense, sharp-edged and may show dotted (punctation) or tiled (mosaic) vessel patterns. Iodine stains healthy surface cells mahogany; abnormal areas, and some normal tissue near the opening, stay mustard-yellow. LSIL whitens thinly with soft, feathery edges inside the transformation zone (dotted ring), where HPV changes begin.</p>
          <p class="eyebrow">Follow one possible course</p>
          <div class="seg" role="radiogroup" aria-label="Course">${Object.entries(COURSE).map(([k,c])=>`<button role="radio" data-co="${k}" aria-checked="${k===v.course}">${c.label}</button>`).join('')}</div>
          ${slider('c-mo','Months of follow-up',0,24,.5,0,'')}
          <div class="btns"><button class="btn primary" id="c-play" type="button">Play two years</button></div>
          <p class="eyebrow">100 people with biopsy-confirmed CIN 1, watched without treatment</p>
          <div id="c-icons"></div>
          <p class="legend"><span><i class="sw dot" style="background:#B9A8C8"></i>not yet resolved</span><span><i class="sw dot" style="background:var(--ok)"></i>cleared 60</span><span><i class="sw dot" style="background:#F2A65A"></i>still there 25</span><span><i class="sw dot" style="background:var(--alert)"></i>CIN 2 or worse 11</span><span><i class="sw dot" style="background:var(--line-2)"></i>4 left over: each figure was pooled separately</span></p>
          <p class="fine" style="margin-top:0!important">Pooled from 63 studies that varied a lot (regression 60%, 95% CI 55–65%); real numbers could be a few points either way.</p>
          <p class="eyebrow">What the 2019 guidelines say for the general population</p>
          <div class="seg" role="radiogroup" aria-label="HPV result">${[['pos','HPV positive'],['neg','HPV negative'],['none','No HPV test']].map(([k,l])=>`<button role="radio" data-h="${k}" aria-checked="${k===v.hpv}">${l}</button>`).join('')}</div>
          <div class="tgs">${toggle('c-recent','A negative HPV test in the last 5 years')}${toggle('c-imm','On immunosuppressive treatment','for example Humira; hydroxychloroquine alone usually doesn\'t count')}</div>
          <div class="readouts"><div class="ro"><span>Immediate risk of CIN 3 or worse</span><b id="c-risk" class="sm"></b></div><div class="ro"><span>Recommended</span><b id="c-plan" class="sm"></b></div></div>
          <p class="fine">These risk numbers come from people with typical immune systems; the patient's own plan is up to her clinician. If she starts Humira or another immunosuppressing treatment, the guidelines send any LSIL to colposcopy regardless of the HPV result and screen more often, which is worth raising with the gynecologist before a biologic starts. After a colposcopy that finds CIN 1 or less following a low-grade result like the patient's, the guidelines recommend HPV-based testing again in 1 year. Under age 25 the rules are gentler. The progression numbers are pooled from 63 studies (Loopik 2021); 2% reached CIN 3 or worse. The lesion pictures are illustrations of typical findings, not the patient's images. The cervix is modelled at its true position between the real bladder and rectum.</p>`;
        ui=panel;cv=panel.querySelector('#c-cv');ctx=cv.getContext('2d');
        const redraw=()=>{draw();panel.querySelector('#c-icons').innerHTML=iconsHTML();const [r,p]=plan();panel.querySelector('#c-risk').textContent=r;panel.querySelector('#c-plan').textContent=p;};
        const radio=(attr,key)=>panel.querySelectorAll(`[data-${attr}]`).forEach(b=>b.onclick=()=>{v[key]=b.dataset[attr];panel.querySelectorAll(`[data-${attr}]`).forEach(x=>x.setAttribute('aria-checked',x===b));redraw();});
        radio('st','stain');radio('co','course');radio('h','hpv');
        bindToggle(panel,'c-recent',on=>{v.recent=on;redraw();});bindToggle(panel,'c-imm',on=>{v.imm=on;redraw();});
        const ms=bindSlider(panel,'c-mo',x=>{v.mo=x;playing=false;redraw();},x=>x+' mo');
        panel.querySelector('#c-play').onclick=()=>{if(v.mo>=23.9)v.mo=0;playing=true;};
        redraw();
        const c=K.centre('Uterus');A.flyTo({target:[c.x,c.y-0.015,c.z-0.01],dist:.5,azim:-62,elev:8});
        let acc=0;
        tickOff=A.onTick(dt=>{if(!playing)return;v.mo=Math.min(24,v.mo+dt*24/14);ms.value=v.mo;panel.querySelector('#c-mo-v').textContent=fmt(v.mo,0)+' mo';acc+=dt;if(acc>.08){acc=0;redraw();}if(v.mo>=24){playing=false;redraw();}});
      },
      exit(){tickOff?.();}
    };
  })();all.push(cervix);

  /* ==================================================================== ENDOMETRIOSIS (suspected) */
  const endo=(()=>{
    let built=false,G,lesions={},cyst,tickOff,ui;const v={day:1,sites:{ovary:true,usl:true,pod:false,bladder:false,bowel:false,perit:true}};let playing=false;
    const SITES={
      ovary:{label:'Ovary (endometrioma)',img:'seen',sens:'ultrasound 93%, MRI 95%',sym:['period']},
      usl:{label:'Uterosacral ligaments',img:'deep',sens:'ultrasound finds about half here (53%); deep disease overall: MRI 94%',sym:['period','sex','chronic']},
      pod:{label:'Pouch behind the uterus',img:'deep',sens:'deep disease overall: ultrasound 79%, MRI 94% (MRI also gives more false alarms: specificity 77%)',sym:['period','sex','bowel','chronic']},
      bladder:{label:'Bladder',img:'deep',sens:'ultrasound about 62% here, but very specific; deep disease overall: MRI 94%',sym:['period','urine']},
      bowel:{label:'Bowel (rectosigmoid)',img:'deep',sens:'deep disease overall: ultrasound 79%, MRI 94% (MRI specificity 77%)',sym:['period','bowel','chronic']},
      perit:{label:'Pelvic lining (superficial)',img:'miss',sens:'imaging usually can\'t see these',sym:['period']},
    };
    const SYM={period:['Period pain','#62BED3'],sex:['Deep pain with sex','#B193E3'],bowel:['Painful bowel movements','#DDB741'],urine:['Painful urination','#78A0F4'],chronic:['Pelvic pain between periods','#F2705F']};
    const act=d=>{const m=d<=5?Math.max(.55,1-(d-1)*.1):0;const pre=d>=24?(d-23)*.08:0;return clamp(Math.max(m,pre,.12),0,1);};
    const symAt=(k,d)=>{const a=act(d);if(k==='chronic')return .35+.25*a;if(k==='sex')return .3+.4*a;return a;};
    function build(){
      built=true;G=new THREE.Group();A.root.add(G);
      const ov=K.centre('Left ovary'),bl=K.box('Urinary bladder'),re=K.box('Rectum'),ut=K.box('Uterus'),cx=K.centre('Cervix');
      const S={usl:[V3(-0.014,cx.y+0.006,cx.z-0.022),V3(0.014,cx.y+0.006,cx.z-0.022),V3(-0.022,cx.y+0.016,cx.z-0.035),V3(0.022,cx.y+0.016,cx.z-0.035)],
        pod:[V3(0,cx.y+0.002,re.max.z-0.004),V3(0.006,cx.y+0.01,re.max.z-0.002)],
        bladder:[V3(0.006,bl.max.y+0.001,(bl.min.z+bl.max.z)/2-0.006),V3(-0.008,bl.max.y,(bl.min.z+bl.max.z)/2-0.012)],
        bowel:[V3(0.004,re.max.y-0.02,re.max.z+0.001),V3(-0.003,re.max.y-0.034,re.max.z+0.001)],
        perit:[V3(-0.07,0.855,-0.02),V3(0.072,0.85,-0.022),V3(-0.03,ut.max.y+0.006,0.02),V3(0.035,0.88,0.012),V3(-0.05,0.87,0.0)],
        ovary:[ov.clone().add(V3(0.006,0.004,0.002))]};
      const dark=new THREE.MeshStandardMaterial({color:'#3A1624',roughness:.5,emissive:'#7A1F2E',emissiveIntensity:.2});
      for(const k in S){lesions[k]=[];for(const c of S[k]){const grp=new THREE.Group();grp.position.copy(c);G.add(grp);
        const n=k==='perit'?4:6;for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.0012+Math.random()*.0016,10,8),dark);m.position.set((Math.random()-.5)*.008,(Math.random()-.5)*.006,(Math.random()-.5)*.006);m.renderOrder=8;grp.add(m);}
        const halo=new THREE.Mesh(new THREE.SphereGeometry(.0042,16,12),new THREE.MeshBasicMaterial({color:'#FF5A5A',transparent:true,opacity:.0,depthWrite:false}));halo.renderOrder=9;grp.add(halo);grp.userData.halo=halo;lesions[k].push(grp);}}
      cyst=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),new THREE.MeshStandardMaterial({color:'#5A2A2E',roughness:.3,transparent:true,opacity:.92}));cyst.position.copy(S.ovary[0]);cyst.scale.setScalar(.009);cyst.renderOrder=8;G.add(cyst);
    }
    function chart(){
      const ks=active();const series=ks.map(k=>({pts:Array.from({length:28},(_,i)=>[i+1,symAt(k,i+1)*100]),stroke:SYM[k][1],width:2}));
      return lineChart({W:300,H:140,x0:1,x1:28,y0:0,y1:100,xticks:[1,7,14,21,28],yticks:[0,50,100],xfmt:v=>'day '+v,yfmt:v=>v===0?'':v===100?'max':'',label:'Typical pain pattern across a cycle',
        extra:(px,py)=>`<rect x="${px(1)}" y="${py(100)}" width="${px(5.5)-px(1)}" height="${py(0)-py(100)}" fill="#C2474F" opacity=".12"/>`,series,
        after:(px,py)=>`<line id="e-ph" x1="${px(v.day)}" x2="${px(v.day)}" y1="${py(100)}" y2="${py(0)}" stroke="var(--bone)"/>`}).svg;
    }
    const active=()=>{const s=new Set();for(const k in v.sites)if(v.sites[k])SITES[k].sym.forEach(x=>s.add(x));return [...s];};
    return {
      id:'endo',title:'Endometriosis map',fig:'Where it grows and what each site does',
      enter(panel){
        K.resetRig();if(!built)build();G.visible=true;
        K.setMode({layers:{skin:0,skeleton:.16,organs:.3,vessels:0},focus:A.resolve(['#uterus','#ovaries','Urinary bladder','Rectum']),focusColor:'#62BED3',dim:.2});
        for(const r of A.resolve(['#uterus','#ovaries','Urinary bladder','Rectum']))r.tgt.em=.08;
        panel.innerHTML=`<p class="lede-s">Suspected, not confirmed. Choose where lesions might be; each site explains a different symptom.</p>
          <div class="tgs two">${Object.entries(SITES).map(([k,s])=>toggle('e-'+k,s.label,v.sites[k])).join('')}</div>
          ${slider('e-day','Cycle day',1,28,1,1,'')}
          <div class="btns"><button class="btn primary" id="e-play" type="button">Play a cycle</button></div>
          <div class="readouts" id="e-ro"></div>
          <div id="e-chart"></div>
          <p class="legend" id="e-leg"></p>
          <p class="eyebrow">Would a scan see it?</p>
          <ul class="quotes" id="e-img"></ul>
          <p class="fine" style="margin-top:4px!important">The 2022 ESHRE guideline says laparoscopy is no longer the diagnostic gold standard: imaging and symptoms can be enough to start treatment, and surgery is for when imaging is negative or treatment doesn't help. A 2024 scoping review found an average delay of 6.8 years across studies (range 1.5 to 11.4).</p>
          <div class="warn"><b>The iron link</b>Heavy periods are one of the commonest causes of iron deficiency, whatever causes them. Endometriosis is mainly a pain condition; heavy bleeding is more typical of adenomyosis or fibroids, which can occur alongside it. Try a heavier period in the iron instrument.</div>
          <p class="fine">The uterus, ovaries and tubes are modelled at their true positions between the real bladder and rectum; the lesions are drawn schematically at the sites where endometriosis is most often found. Pain patterns are typical shapes, not the patient's diary. Deep-disease figures are pooled across sites (Cochrane 2016); site by site, ultrasound finds fewer uterosacral (53%) and bladder (62%) lesions (Guerriero 2015). All depend heavily on a specialist scanner, and the Cochrane authors judged most studies to be of poor quality.</p>`;
        ui=panel;
        const redraw=()=>{panel.querySelector('#e-chart').innerHTML=chart();
          panel.querySelector('#e-leg').innerHTML=active().map(k=>`<span><i class="sw" style="background:${SYM[k][1]}"></i>${SYM[k][0]}</span>`).join('');
          panel.querySelector('#e-img').innerHTML=Object.entries(SITES).filter(([k])=>v.sites[k]).map(([k,s])=>`<li><b>${s.label}:</b> ${s.img==='seen'?'usually seen; ':s.img==='deep'?'often seen, by a skilled scanner; ':'often invisible; '}${s.sens}</li>`).join('')||'<li>No sites chosen.</li>';};
        for(const k in SITES)bindToggle(panel,'e-'+k,on=>{v.sites[k]=on;if(ui)redraw();});
        const ds=bindSlider(panel,'e-day',x=>{v.day=x;playing=false;},x=>'day '+x);
        panel.querySelector('#e-play').onclick=()=>{playing=true;};
        redraw();
        const ut=K.centre('Uterus');A.flyTo({target:[ut.x,ut.y-0.012,ut.z-0.012],dist:.6,azim:24,elev:20});
        let dayF=v.day,lastKey='';
        tickOff=A.onTick((dt)=>{
          if(playing){dayF+=dt*28/16;if(dayF>=29){dayF=1;playing=false;}v.day=Math.floor(dayF);ds.value=v.day;panel.querySelector('#e-day-v').textContent='day '+v.day;}else dayF=v.day;
          const a=act(v.day),t=performance.now()/1000;
          for(const k in lesions)for(const g of lesions[k]){g.visible=v.sites[k];const h=g.userData.halo;h.material.opacity=a*.28*(.75+.25*Math.sin(t*4));h.scale.setScalar(.5+a*.7);}
          cyst.visible=v.sites.ovary;cyst.scale.setScalar(.0085+a*.001);
          const ks=active();const key=v.day+JSON.stringify(v.sites);if(key===lastKey)return;lastKey=key;
          ui.querySelector('#e-ro').innerHTML=(v.day<=5?'<div class="ro"><span>Phase</span><b class="sm">period: lesions bleed and inflame</b></div>':v.day>=24?'<div class="ro"><span>Phase</span><b class="sm">before the period: pain often starts building</b></div>':'<div class="ro"><span>Phase</span><b class="sm">between periods</b></div>')+
            ks.map(k=>{const x=symAt(k,v.day);return `<div class="ro"><span>${SYM[k][0]}</span><b>${x<.3?'low':x<.65?'moderate':'high'}</b><span class="bar"><i style="width:${x*100}%;background:${SYM[k][1]}"></i></span></div>`;}).join('');
          const ph=ui.querySelector('#e-ph');if(ph){const x=30+(v.day-1)/27*260;ph.setAttribute('x1',x);ph.setAttribute('x2',x);}
        });
      },
      exit(){tickOff?.();if(G)G.visible=false;}
    };
  })();all.push(endo);

  return Object.fromEntries(all.map(s=>[s.id,s]));
}
