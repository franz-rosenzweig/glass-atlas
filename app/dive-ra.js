// The RA dive: knuckle → joint → synovial lining (the game) → molecules.
// Sizes are to scale within each level: the joint is ~3 cm across, the lining view ~250 µm, the molecule view ~60 nm.
import { TAU, clamp, lerp, rand, esc } from './dive.js';

/* ------------------------------------------------------------------ glyphs (design units) */
const C={dapi:'#5B86FF',fls:'#43D99B',mac:'#FF6FA8',t:'#FFB547',b:'#71C6FF',pl:'#C08CFF',neu:'#E6DEFF',oc:'#FF8A5B',ch:'#A9DDEF',tnf:'#FF5A3C',il6:'#B98CFF',ab:'#5AA8FF',hcq:'#7CFFB2'};
function glow(x,cx,cy,r,col,a=1){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha*=a;x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.globalAlpha/=a;}
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`;}
function nucleus(x,cx,cy,rx,ry,rot=0,col=C.dapi){x.save();x.translate(cx,cy);x.rotate(rot);const g=x.createRadialGradient(-rx*.3,-ry*.3,0,0,0,Math.max(rx,ry));g.addColorStop(0,'#B9CCFF');g.addColorStop(1,col);x.fillStyle=g;x.beginPath();x.ellipse(0,0,rx,ry,0,0,TAU);x.fill();x.restore();}
function blob(x,cx,cy,r,seed,lobes=6,amp=.22,t=0){x.beginPath();for(let i=0;i<=48;i++){const a=i/48*TAU;const rr=r*(1+amp*Math.sin(a*lobes+seed)+amp*.5*Math.sin(a*(lobes+3)+seed*2+t));const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();}
export const G={
  fls(x,cx,cy,s=1,t=0,rot=0,act=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);const L=42,w=11+act*3;
    x.beginPath();x.moveTo(-L,0);x.bezierCurveTo(-L*.4,-w*1.3,L*.4,-w*1.3,L,0);x.bezierCurveTo(L*.4,w*1.3,-L*.4,w*1.3,-L,0);
    x.fillStyle=rgba(C.fls,.28+act*.2);x.fill();x.strokeStyle=rgba(C.fls,.9);x.lineWidth=1.4;x.stroke();nucleus(x,0,0,13,5.5);x.restore();},
  mac(x,cx,cy,s=1,t=0,seed=1){x.save();x.translate(cx,cy);x.scale(s,s);blob(x,0,0,21,seed,5,.2,t*.8);x.fillStyle=rgba(C.mac,.3);x.fill();x.strokeStyle=rgba(C.mac,.95);x.lineWidth=1.4;x.stroke();
    nucleus(x,-4,2,9,6.5,.5);for(let i=0;i<3;i++){x.beginPath();x.arc(8+i*3-4,-7+i*5,2.4,0,TAU);x.strokeStyle=rgba(C.mac,.7);x.stroke();}x.restore();},
  tcell(x,cx,cy,s=1){x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.arc(0,0,13,0,TAU);x.fillStyle=rgba(C.t,.25);x.fill();x.strokeStyle=rgba(C.t,.95);x.lineWidth=1.4;x.stroke();nucleus(x,0,0,10,9.5);x.restore();},
  bcell(x,cx,cy,s=1){x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.arc(0,0,13,0,TAU);x.fillStyle=rgba(C.b,.25);x.fill();x.strokeStyle=rgba(C.b,.95);x.lineWidth=1.4;x.stroke();nucleus(x,1,0,10,9.5);
    for(let i=0;i<6;i++){const a=i/6*TAU;x.save();x.translate(Math.cos(a)*14,Math.sin(a)*14);x.rotate(a+Math.PI/2);x.strokeStyle=rgba(C.b,.8);x.lineWidth=1;x.beginPath();x.moveTo(0,0);x.lineTo(0,-3);x.lineTo(-2,-5);x.moveTo(0,-3);x.lineTo(2,-5);x.stroke();x.restore();}x.restore();},
  plasma(x,cx,cy,s=1){x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.ellipse(0,0,21,14,0,0,TAU);x.fillStyle=rgba(C.pl,.3);x.fill();x.strokeStyle=rgba(C.pl,.95);x.lineWidth=1.4;x.stroke();
    glow(x,1,0,9,'rgba(255,255,255,.35)');nucleus(x,-10,0,8,8);x.fillStyle='rgba(20,30,90,.9)';for(let i=0;i<6;i++){const a=i/6*TAU;x.beginPath();x.arc(-10+Math.cos(a)*5,Math.sin(a)*5,1.3,0,TAU);x.fill();}x.restore();},
  neut(x,cx,cy,s=1,t=0){x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.arc(0,0,15,0,TAU);x.fillStyle=rgba(C.neu,.18);x.fill();x.strokeStyle=rgba(C.neu,.85);x.lineWidth=1.3;x.stroke();
    const L=[[-6,-3],[2,-6],[6,3]];x.strokeStyle=C.dapi;x.lineWidth=1.6;x.beginPath();x.moveTo(...L[0]);x.lineTo(...L[1]);x.lineTo(...L[2]);x.stroke();L.forEach(p=>nucleus(x,p[0],p[1],4.6,4.2));
    x.fillStyle='rgba(230,222,255,.5)';for(let i=0;i<10;i++){const a=i*2.4,r=8+(i%3)*2;x.fillRect(Math.cos(a)*r,Math.sin(a)*r,1.2,1.2);}x.restore();},
  osteo(x,cx,cy,s=1,t=0,act=0){x.save();x.translate(cx,cy);x.scale(s,s);
    x.beginPath();for(let i=0;i<=48;i++){const a=i/48*TAU;const rr=1+.1*Math.sin(a*4+3.1+t*.5);const px=Math.cos(a)*68*rr,py=Math.sin(a)*30*rr;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();
    x.fillStyle=rgba(C.oc,.22+act*.25);x.fill();x.strokeStyle=rgba(C.oc,.95);x.lineWidth=1.4;x.stroke();
    // ruffled border on the bone side
    x.beginPath();for(let i=0;i<=24;i++){const px=-50+i*100/24;x.lineTo(px,26+(i%2?4:0)+Math.sin(t*6+i)*act*1.5);}x.strokeStyle=rgba('#FFD0B0',.8);x.lineWidth=1.2;x.stroke();
    [[-40,-6],[-24,4],[-8,-8],[8,5],[24,-5],[40,4],[-30,-14],[30,-14]].forEach(([a,b])=>nucleus(x,a,b,5.5,4.5));x.restore();},
  chondro(x,cx,cy,s=1,pair=false,fade=0){x.save();x.translate(cx,cy);x.scale(s,s);x.globalAlpha*=1-fade*.85;const one=(dx)=>{x.beginPath();x.ellipse(dx,0,16,11,0,0,TAU);x.fillStyle='rgba(4,10,16,.65)';x.fill();
    x.beginPath();x.ellipse(dx,0,12,8,0,0,TAU);x.fillStyle=rgba(C.ch,.35);x.fill();x.strokeStyle=rgba(C.ch,.9);x.lineWidth=1.2;x.stroke();nucleus(x,dx,0,4.5,4);};
    pair?(one(-14),one(14)):one(0);x.restore();},
  rbc(x,cx,cy,s=1){x.save();x.translate(cx,cy);x.scale(s,s);x.beginPath();x.arc(0,0,15,0,TAU);x.fillStyle='rgba(225,70,80,.55)';x.fill();x.beginPath();x.arc(0,0,6,0,TAU);x.fillStyle='rgba(120,20,30,.5)';x.fill();x.restore();},
  tnf(x,cx,cy,s=1,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);for(let i=0;i<3;i++){const a=i/3*TAU-Math.PI/2;const px=Math.cos(a)*14,py=Math.sin(a)*14;
    x.beginPath();x.ellipse(px,py,15,12,a,0,TAU);const g=x.createRadialGradient(px-4,py-4,0,px,py,16);g.addColorStop(0,'#FFC2A8');g.addColorStop(1,C.tnf);x.fillStyle=g;x.fill();x.strokeStyle='rgba(60,10,0,.6)';x.lineWidth=1;x.stroke();}x.restore();},
  il6(x,cx,cy,s=1,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);for(let i=0;i<4;i++){x.beginPath();x.roundRect(-16+i*8.5,-18+(i%2)*4,7,32,3.5);x.fillStyle=i%2?'#9B6BE8':C.il6;x.fill();}x.restore();},
  ab(x,cx,cy,s=1,rot=0,col=C.ab){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.lineCap='round';
    const arm=(sg)=>{x.save();x.rotate(sg*.7);x.strokeStyle=col;x.lineWidth=13;x.beginPath();x.moveTo(0,0);x.lineTo(0,-62);x.stroke();x.strokeStyle='#BFE0FF';x.lineWidth=6;x.beginPath();x.moveTo(sg*7,-14);x.lineTo(sg*7,-60);x.stroke();x.restore();};
    arm(-1);arm(1);x.strokeStyle=col;x.lineWidth=15;x.beginPath();x.moveTo(0,0);x.lineTo(0,70);x.stroke();x.fillStyle='#8FC4FF';x.beginPath();x.arc(0,0,6,0,TAU);x.fill();x.restore();},
  hcq(x,cx,cy,s=1,rot=0,charged=false){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);const hex=(ox)=>{x.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;x.lineTo(ox+Math.cos(a)*9,Math.sin(a)*9);}x.closePath();x.strokeStyle=C.hcq;x.lineWidth=2.2;x.stroke();};
    hex(-8);hex(8);x.beginPath();x.moveTo(16,2);x.lineTo(30,10);x.lineTo(42,4);x.stroke();if(charged){x.fillStyle='#FFFFFF';x.font='bold 14px sans-serif';x.fillText('+',36,-4);}x.restore();},
};

/* ------------------------------------------------------------------ field guide */
export const GUIDE={
  fls:{name:'Fibroblast-like synoviocyte',kind:'Cell',size:'about 30 µm long',draw:(x,cx,cy,s,t)=>G.fls(x,cx,cy,s*1.6,t,-.2,.3),
    text:['One of the two cell types that make up the joint lining, which is normally only two or three cells deep. In RA these cells multiply until the lining is up to 10–20 cells deep.','They become the main destroyers of cartilage, releasing enzymes (matrix metalloproteinases) and creeping over it as pannus.']},
  mac:{name:'Macrophage-like synoviocyte',kind:'Cell',size:'about 20 µm',draw:(x,cx,cy,s,t)=>G.mac(x,cx,cy,s*1.8,t,1.3),
    text:['The other main cell type of the lining: a cleaner that swallows debris.','In RA, macrophages are a major source of TNF and IL-6, the two signals that drive much of the inflammation and that modern drugs target.']},
  t:{name:'T cell',kind:'Cell',size:'about 7–10 µm',draw:(x,cx,cy,s)=>G.tcell(x,cx,cy,s*2.2),
    text:['A coordinator of the immune response, arriving through the new blood vessels that grow into an inflamed lining.','Activated T cells help B cells and macrophages escalate. They, and the lining fibroblasts themselves, make RANKL, the signal that switches on bone-dissolving osteoclasts.']},
  b:{name:'B cell',kind:'Cell',size:'about 7–10 µm',draw:(x,cx,cy,s)=>G.bcell(x,cx,cy,s*2.2),
    text:['Carries antibodies on its surface and can mature into an antibody factory.','Another RA drug, rituximab, works by removing B cells.']},
  plasma:{name:'Plasma cell',kind:'Cell',size:'about 10–20 µm',draw:(x,cx,cy,s)=>G.plasma(x,cx,cy,s*2),
    text:['A mature B cell built to pour out antibodies. Pathologists know it by its off-centre nucleus with "clock-face" chromatin.','In RA some make antibodies against citrullinated proteins (ACPA, measured as anti-CCP) and rheumatoid factor. In a blood-donor study, about half of people later diagnosed with RA had these antibodies a median of 4.5 years before their first symptoms (Nielen 2004).']},
  neut:{name:'Neutrophil',kind:'Cell',size:'about 12–15 µm',draw:(x,cx,cy,s,t)=>G.neut(x,cx,cy,s*2,t),
    text:['The most common cell in inflamed RA joint fluid, recognisable by its nucleus split into lobes.','It floats in the fluid releasing enzymes and reactive oxygen, adding to the swelling.']},
  osteo:{name:'Osteoclast',kind:'Cell',size:'50–100 µm, many nuclei',draw:(x,cx,cy,s,t)=>G.osteo(x,cx,cy,s*.95,t,.5),
    text:['A giant cell formed by fused precursors, with many nuclei and a ruffled edge that dissolves bone.','RANKL from inflamed lining switches it on. RA erosions usually start at the joint\'s "bare areas", where bone inside the capsule has no cartilage cover.']},
  chondro:{name:'Chondrocyte',kind:'Cell',size:'about 10–20 µm',draw:(x,cx,cy,s)=>G.chondro(x,cx,cy,s*2,true),
    text:['Lives alone or in pairs in a small cavity inside the cartilage it maintains.','Cartilage has no blood supply, so it repairs very slowly. Joint space narrowing on an X-ray means cartilage has been lost.']},
  tnf:{name:'TNF',kind:'Signal protein',size:'a trimer about 5 nm across',draw:(x,cx,cy,s)=>G.tnf(x,cx,cy,s*1.8),
    text:['Tumour necrosis factor: three identical units that dock onto receptors and switch on inflammation genes.','One of the master switches of RA. Adalimumab (Humira), etanercept and infliximab all block it.']},
  il6:{name:'IL-6',kind:'Signal protein',size:'about 4 nm',draw:(x,cx,cy,s)=>G.il6(x,cx,cy,s*1.8),
    text:['Interleukin-6 tells the liver to make CRP, the inflammation blood test, and contributes to fatigue.','It also raises hepcidin, the hormone that locks iron away, one reason inflammation causes anaemia. Tocilizumab blocks its receptor.']},
  acpa:{name:'ACPA (anti-CCP antibody)',kind:'Antibody',size:'about 10–15 nm',draw:(x,cx,cy,s)=>G.ab(x,cx,cy,s*.8,0,'#C08CFF'),
    text:['An antibody that targets proteins in which the amino acid arginine has been converted to citrulline, a change made by enzymes called PADs.','It is one of the blood tests used to diagnose RA, and can be present years before the joints hurt.']},
  ada:{name:'Adalimumab (Humira)',kind:'Medicine · antibody',size:'about 10–15 nm',draw:(x,cx,cy,s)=>G.ab(x,cx,cy,s*.8),
    text:['A recombinant human IgG1 antibody that grabs TNF and blocks it from both of its receptors (p55 and p75).','Usually 40 mg under the skin every other week; it lasts about two weeks in the body. Before starting, people are tested for tuberculosis and hepatitis B; live vaccines are avoided while on it, and the label\'s boxed warning covers serious infections and some cancers. With the patient\'s history of brain inflammation, her neurologist should be in the loop, and her cervical screening may become more frequent. Many people now get a biosimilar, which works the same way.']},
  hcq:{name:'Hydroxychloroquine',kind:'Medicine · small molecule',size:'about 1 nm',draw:(x,cx,cy,s)=>G.hcq(x,cx,cy,s*2.4,0,true),
    text:['A weak base that slips into the cell\'s acidic recycling compartments (lysosomes and endosomes), picks up a charge and gets trapped there, making them less acidic.','That blunts how immune cells chop up and display proteins and quiets the TLR7 and TLR9 alarm sensors. It builds up in the body slowly, which is why it takes months to reach full effect.']},
};

/* ------------------------------------------------------------------ level 2: the joint */
function jointLevel(){
  const st={mode:'early',infl:0,dmg:0,tInfl:1,tDmg:.06};
  const MODES={healthy:{l:'Healthy',i:0,d:0,txt:'A healthy knuckle: smooth cartilage on both bone ends, a lining only a few cells thick, and a thin film of fluid that lubricates and feeds the cartilage.'},
    early:{l:'Active RA',i:1,d:.06,txt:'The lining (pink) swells and folds, new blood vessels grow into it, and fluid fills the joint: this is the puffy, warm knuckle. Inflamed tissue is starting to press on the bare areas.'},
    years:{l:'Untreated for years',i:1,d:1,txt:'The inflamed lining, now called pannus, has crept over the cartilage and eaten into the bare areas. Cartilage is thinner, so the joint space narrows. Erosions like these mostly don\'t heal, which is why RA is treated early.'},
    treated:{l:'Treated early',i:.12,d:.06,txt:'With the inflammation controlled the lining settles back, the fluid drains and the cartilage is spared. The goal of treatment is to get here before damage happens.'}};
  const HOT=[
    {x:200,y:350,k:'Metacarpal',t:'The long bone in the palm. Its rounded head forms the knuckle.'},
    {x:800,y:350,k:'Proximal phalanx',t:'The first bone of the finger. Its base cups the metacarpal head.'},
    {x:600,y:262,k:'Cartilage',t:'Glassy, slippery and without blood vessels. RA damages it from the edges and from enzymes in the fluid.'},
    {x:540,y:128,k:'Synovium (joint lining)',t:'Normally just a few cells deep. In RA this is where the disease lives. Tap the lens to zoom into it.'},
    {x:560,y:236,k:'Synovial fluid',t:'Lubricates the joint and nourishes the cartilage. In active RA it fills with inflammatory cells, mostly neutrophils.'},
    {x:300,y:232,k:'Joint capsule',t:'The fibrous sleeve that seals the joint.'},
    {x:392,y:241,k:'Bare area',t:'Bone inside the capsule with no cartilage cover. RA erosions usually start here, at the joint margins.'},
    {x:500,y:96,k:'Extensor tendon',t:'Straightens the finger. It runs over the back of the knuckle.'},
    {x:500,y:612,k:'Flexor tendons',t:'Bend the finger, gliding in a lubricated sheath; inflamed sheaths are behind trigger fingers.'},
  ];
  const fluidPts=[];for(let i=0;i<70;i++)fluidPts.push({x:rand(330,640),y:rand(150,560),r:rand(0,1)});
  let hover=null,lens={x:392,y:508},pulse=0;
  function capsulePath(x,top,sw){const s=top?1:-1,cy=350;const Y=v=>cy-s*(cy-v);
    x.moveTo(330,Y(290));x.bezierCurveTo(338,Y(205-sw),420,Y(168-sw),490,Y(168-sw));x.bezierCurveTo(572,Y(170-sw),626,Y(218-sw*.4),646,Y(297));}
  function draw(x,dt,t){
    st.infl=lerp(st.infl,st.tInfl,1-Math.exp(-2*dt));st.dmg=lerp(st.dmg,st.tDmg,1-Math.exp(-1.6*dt));pulse+=dt;
    const I=st.infl,D=st.dmg,sw=I*34;
    // skin and soft tissue
    x.fillStyle='#0D1418';x.fillRect(-200,40,1400,620);
    x.strokeStyle='rgba(236,230,218,.12)';x.lineWidth=2;x.beginPath();x.moveTo(-200,58-sw*.5);x.bezierCurveTo(300,50-sw*.5,700,50-sw*.5,1200,62);x.stroke();x.beginPath();x.moveTo(-200,648);x.bezierCurveTo(300,656,700,656,1200,642);x.stroke();
    // tendons
    x.fillStyle='#3A3A44';x.beginPath();x.roundRect(-200,84-sw*.6,1400,24,10);x.fill();x.fillStyle='#4A4652';x.beginPath();x.roundRect(-200,596,1400,30,12);x.fill();
    x.strokeStyle='rgba(255,255,255,.07)';for(let i=0;i<40;i++){x.beginPath();x.moveTo(-200+i*36,90-sw*.6);x.lineTo(-180+i*36,104-sw*.6);x.stroke();}
    // joint cavity (fluid) bounded by the two capsules
    x.save();x.beginPath();capsulePath(x,true,sw);x.lineTo(646,403);x.bezierCurveTo(626,482+sw*.4,572,530+sw,490,532+sw);x.bezierCurveTo(420,532+sw,338,495+sw,330,410);x.closePath();
    x.fillStyle=`rgba(${lerp(70,140,I)},${lerp(110,120,I)},${lerp(120,90,I)},.38)`;x.fill();x.clip();
    // synovium: thin pink lining that thickens and folds into villi, with new vessels
    for(const top of [true,false]){x.beginPath();capsulePath(x,top,sw);x.strokeStyle=`rgba(232,120,150,${.55+I*.35})`;x.lineWidth=7+I*46;x.stroke();
      if(I>.05){for(let k=0;k<16;k++){const u=k/15;const px=lerp(345,640,u),base=top?(170-sw+Math.abs(u-.5)*60):(530+sw-Math.abs(u-.5)*60);
        x.beginPath();x.arc(px,base+(top?1:-1)*(20+I*16),6+I*9,0,TAU);x.fillStyle=`rgba(232,120,150,${I*.8})`;x.fill();
        x.strokeStyle=`rgba(220,40,60,${I*.7})`;x.lineWidth=1.4;x.beginPath();x.moveTo(px,base);x.quadraticCurveTo(px+8,base+(top?1:-1)*14,px-2,base+(top?1:-1)*(26+I*10));x.stroke();}}}
    // fluid cells (neutrophils) in active RA
    const n=Math.round(fluidPts.length*I);x.fillStyle='rgba(230,222,255,.55)';for(let i=0;i<n;i++){const p=fluidPts[i];x.beginPath();x.arc(p.x+Math.sin(t+p.r*9)*3,p.y+Math.cos(t*.8+p.r*7)*3,1.6,0,TAU);x.fill();}
    x.restore();
    // capsule
    for(const top of [true,false]){x.beginPath();capsulePath(x,top,sw);x.strokeStyle='#8A8DA3';x.lineWidth=9;x.stroke();}
    // metacarpal shaft + head
    const bone=(path)=>{x.fillStyle='#E7DFCB';path();x.fill();x.save();path();x.clip();x.fillStyle='#CDBF9C';x.fillRect(-200,0,1400,700);
      x.fillStyle='#E7DFCB';for(let i=0;i<220;i++){const px=(i*97)%1300-200,py=(i*53)%420+140;x.beginPath();x.arc(px,py,5+(i%4),0,TAU);x.fill();}x.restore();
      x.strokeStyle='#F2ECDD';x.lineWidth=8;path();x.stroke();};
    const meta=()=>{x.beginPath();x.moveTo(-210,290);x.lineTo(345,290);x.arc(430,350,115,Math.PI+.79,Math.PI-.79);x.lineTo(345,410);x.lineTo(-210,410);x.closePath();};
    bone(meta);
    // phalanx base cupping the head
    const R=153+D*-6;const phal=()=>{x.beginPath();x.moveTo(1210,300);x.lineTo(690,300);x.bezierCurveTo(620,300,560,255,430+R*Math.cos(-.87),350+R*Math.sin(-.87));x.arc(430,350,R,-.87,.87);x.bezierCurveTo(560,445,620,400,690,400);x.lineTo(1210,400);x.closePath();};
    bone(phal);
    // cartilage caps, thinning with damage
    const th=14*(1-.65*D);x.strokeStyle='#CFE6EC';x.lineWidth=th;x.beginPath();x.arc(430,350,115+th/2,-1.2+D*.2,1.2-D*.2);x.stroke();
    x.lineWidth=12*(1-.6*D);x.beginPath();x.arc(430,350,R-6*(1-.6*D),-.82,.82);x.stroke();
    // pannus creeping over the cartilage from the margins, and erosions at the bare areas
    if(D>.02){for(const s of [-1,1]){x.strokeStyle='rgba(222,90,120,.9)';x.lineWidth=10+8*D;x.lineCap='round';x.beginPath();x.arc(430,350,115+th+2,s<0?-1.22:1.22-.55*D,s<0?-1.22+.55*D:1.22);x.stroke();
      const ex=430+117*Math.cos(s*1.83),ey=350+117*Math.sin(s*1.83);x.fillStyle=`rgba(${lerp(70,140,I)},${lerp(110,120,I)},${lerp(120,90,I)},1)`;x.beginPath();x.arc(ex,ey,4+26*D,0,TAU);x.fill();
      x.strokeStyle='rgba(222,90,120,.9)';x.lineWidth=3;x.beginPath();x.arc(ex,ey,4+26*D,0,TAU);x.stroke();}x.lineCap='butt';}
    // labels
    x.font='13px "Atkinson Hyperlegible", sans-serif';x.textAlign='center';
    for(const h of HOT){const w=x.measureText(h.k).width+12;x.fillStyle='rgba(4,7,11,.62)';x.beginPath();x.roundRect(h.x-w/2,h.y-27,w,19,4);x.fill();
      x.fillStyle=hover===h?'#FFFFFF':'rgba(236,230,218,.85)';x.beginPath();x.arc(h.x,h.y,4,0,TAU);x.fill();x.fillText(h.k,h.x,h.y-13);}
    // the lens: tap to zoom into the lining
    const pr=1+.08*Math.sin(pulse*3);x.strokeStyle='rgba(242,154,85,.95)';x.lineWidth=2.5;x.beginPath();x.arc(lens.x,lens.y,38*pr,0,TAU);x.stroke();
    x.lineWidth=5;x.beginPath();x.moveTo(lens.x+27*pr,lens.y+27*pr);x.lineTo(lens.x+48*pr,lens.y+48*pr);x.stroke();
    x.fillStyle='#F29A55';x.font='12px "Martian Mono", monospace';x.fillText('zoom in',lens.x,lens.y+66*pr);
  }
  return {id:'joint',label:'Joint',size:'1 cm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:167,label:'5 mm'},zoomFocus:lens,
    card(){return `<p class="k">Level 2 · tissue</p><h2>Inside the knuckle</h2>
      <p>The middle-finger knuckle, cut lengthwise like a pathology slide. Choose a stage; tap any label to learn what it is.</p>
      <div class="dv-seg" role="radiogroup" aria-label="Stage">${Object.entries(MODES).map(([k,m])=>`<button role="radio" data-m="${k}" aria-checked="${k===st.mode}">${m.l}</button>`).join('')}</div>
      <p id="dj-t">${MODES[st.mode].txt}</p><p id="dj-h" class="dv-fine"></p>
      <div class="dv-btns"><button class="dv-btn go" id="dj-go" type="button">Zoom into the lining<small>where RA lives: cells, signals and a game</small></button></div>
      <p class="dv-fine">Drawn to scale at about 3 cm across. A schematic section based on standard joint anatomy; RA stages follow the textbook sequence, not the patient's imaging.</p>`;},
    bind(card,api){card.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{st.mode=b.dataset.m;const m=MODES[st.mode];st.tInfl=m.i;st.tDmg=m.d;card.querySelectorAll('[data-m]').forEach(x=>x.setAttribute('aria-checked',x===b));card.querySelector('#dj-t').textContent=m.txt;});
      card.querySelector('#dj-go').onclick=()=>api.go('lining',{from:lens});const m=MODES[st.mode];st.tInfl=m.i;st.tDmg=m.d;},
    tap(p,api){if(Math.hypot(p.x-lens.x,p.y-lens.y)<55){api.go('lining',{from:lens});return;}
      let best=null,bd=60;for(const h of HOT){const d=Math.hypot(p.x-h.x,p.y-h.y);if(d<bd){bd=d;best=h;}}
      if(best){hover=best;const el=api.card.querySelector('#dj-h');if(el)el.innerHTML=`<b style="color:var(--bone)">${esc(best.k)}.</b> ${esc(best.t)}`;}},
    draw,
  };
}

/* ------------------------------------------------------------------ level 3: the lining (game) */
function liningLevel(){
  const S={};let bg=null;
  function reset(){
    Object.assign(S,{week:0,running:true,done:false,bone:0,cart:0,caught:0,recruits:0,ster:0,sterUses:0,hcq:false,hcqStart:0,hum:false,humNext:0,shake:0,
      sig:[],ab:[],bursts:[],cells:[],osteo:[{x:300,y:556,act:0,pit:0},{x:410,y:560,act:0,pit:0}],front:{x:540,act:0},neut:[],rbc:[]});
    const LY=v=>232+16*Math.sin(v/70);
    for(let i=0;i<15;i++){const xx=150+i*48+rand(-8,8);S.cells.push({type:i%3===1?'mac':'fls',x:xx,y:LY(xx)+rand(-6,10),rot:rand(-.3,.3),seed:rand(0,6),act:0});
      const x2=170+i*44+rand(-10,10);S.cells.push({type:i%2?'fls':'mac',x:x2,y:LY(x2)+30+rand(-6,6),rot:rand(-.4,.4),seed:rand(0,6),act:0});}
    for(let i=0;i<8;i++)S.cells.push({type:'mac',x:rand(180,820),y:rand(300,370),seed:rand(0,6),act:0});
    for(let i=0;i<7;i++)S.cells.push({type:'t',x:rand(200,800),y:rand(330,470),vx:0,vy:0,act:0});
    for(let i=0;i<4;i++)S.cells.push({type:'b',x:rand(220,780),y:rand(340,470),act:0});
    for(let i=0;i<3;i++)S.cells.push({type:'plasma',x:rand(260,740),y:rand(440,500),act:0,tAb:rand(0,3)});
    for(let i=0;i<9;i++)S.neut.push({x:rand(80,920),y:rand(40,170),vx:rand(-6,6),vy:rand(-3,3),ph:rand(0,6)});
    for(let i=0;i<14;i++)S.rbc.push({u:rand(0,1)});
  }
  // the capillary, the bone and cartilage edges
  const vessel=u=>({x:lerp(120,880,u),y:420+22*Math.sin(u*6.2)});
  const boneTop=xx=>548+10*Math.sin(xx/37);
  function buildBg(){bg=document.createElement('canvas');bg.width=1000*2;bg.height=700*2;const x=bg.getContext('2d');x.scale(2,2);
    // fluid
    const fg=x.createLinearGradient(0,0,0,240);fg.addColorStop(0,'#081923');fg.addColorStop(1,'#0B2230');x.fillStyle=fg;x.fillRect(-300,-100,1600,360);
    // stroma with collagen fibres
    x.fillStyle='#0B0E17';x.fillRect(-300,230,1600,600);x.strokeStyle='rgba(120,140,190,.10)';x.lineWidth=1.2;
    for(let i=0;i<260;i++){const sx=rand(-300,1300),sy=rand(260,560);x.beginPath();x.moveTo(sx,sy);for(let k=1;k<6;k++)x.lineTo(sx+k*14,sy+Math.sin(k+i)*4);x.stroke();}
    // bone (left) with trabecular texture
    x.save();x.beginPath();x.moveTo(-300,800);x.lineTo(-300,560);for(let xx=-300;xx<=480;xx+=10)x.lineTo(xx,boneTop(xx));x.lineTo(500,800);x.closePath();x.fillStyle='#3B3428';x.fill();x.clip();
    x.fillStyle='#1B1812';for(let i=0;i<140;i++){x.beginPath();x.ellipse(rand(-300,500),rand(575,700),rand(8,22),rand(5,12),rand(0,3),0,TAU);x.fill();}
    x.strokeStyle='rgba(255,230,190,.12)';for(let i=0;i<60;i++){x.beginPath();x.arc(rand(-300,500),rand(580,700),rand(10,30),rand(0,3),rand(3,6));x.stroke();}x.restore();
    x.strokeStyle='rgba(255,220,180,.45)';x.lineWidth=2;x.beginPath();for(let xx=-300;xx<=480;xx+=10)x.lineTo(xx,boneTop(xx));x.stroke();
    // cartilage (right): glassy matrix
    const cg=x.createLinearGradient(0,560,0,700);cg.addColorStop(0,'#16303A');cg.addColorStop(1,'#0E2028');x.fillStyle=cg;x.beginPath();x.moveTo(500,800);x.lineTo(500,575);x.quadraticCurveTo(760,560,1300,568);x.lineTo(1300,800);x.closePath();x.fill();
    x.strokeStyle='rgba(169,221,239,.45)';x.lineWidth=2;x.beginPath();x.moveTo(500,575);x.quadraticCurveTo(760,560,1300,568);x.stroke();
    // the capillary wall
    x.lineCap='round';x.strokeStyle='rgba(220,70,90,.35)';x.lineWidth=36;x.beginPath();for(let u=0;u<=1;u+=.02){const p=vessel(u);u?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y);}x.stroke();
    x.strokeStyle='#14070C';x.lineWidth=28;x.stroke();
    // text marks, like a labelled slide
    x.fillStyle='rgba(236,230,218,.45)';x.font='11px "Martian Mono", monospace';x.fillText('JOINT FLUID',30,30);x.fillText('LINING',30,252);x.fillText('BLOOD VESSEL',112,470);x.fillText('BONE',230,688);x.fillText('CARTILAGE',820,688);
  }
  const chondros=[];for(let i=0;i<9;i++)chondros.push({x:560+i*52+rand(-8,8),y:rand(600,670),pair:i%3===0});
  const emitRate=()=>{const w=S.week;let r=1.9*(1+Math.min(.6,S.recruits*.03));if(S.ster>0)r*=1-.65*S.ster;if(S.hcq)r*=1-.32/(1+Math.exp(-((w-S.hcqStart)-8)/2.5)); /* HCQ: little for a month, most of its (modest) effect by 3–4 months */ if(S.hum)r*=.7;return S.running?r:.5;};
  function spawn(){
    const em=S.cells.filter(c=>c.type==='mac'||c.type==='t'||c.type==='fls');const c=em[Math.floor(Math.random()*em.length)];
    const type=c.type==='fls'?'il6':c.type==='mac'?(Math.random()<.62?'tnf':'il6'):'tnf';
    if(S.hum&&type==='il6'&&Math.random()<.5)return; // blocking TNF also turns down IL-6 downstream
    const r=Math.random();const tgt=r<.45?{k:'osteo',o:S.osteo[Math.random()<.5?0:1]}:r<.82?{k:'front'}:{k:'vessel',u:rand(.15,.85)};
    S.sig.push({type,x:c.x,y:c.y,vx:rand(-20,20),vy:rand(-20,20),tgt,life:14,rot:rand(0,6)});c.act=1;
  }
  let acc=0,abAcc=0;
  function step(dt,api){
    if(S.done||!S.running)dt*=1;
    const wk=dt*0.5;if(S.running&&!S.done){S.week+=wk;if(S.week>=52){S.week=52;S.done=true;finish(api);}}
    S.ster=Math.max(0,S.ster*Math.exp(-wk*Math.LN2/5));
    acc+=dt*emitRate();while(acc>1){acc--;spawn();}
    // signals drift towards their targets
    for(const s of S.sig){const T=s.tgt.k==='osteo'?{x:s.tgt.o.x,y:s.tgt.o.y-24}:s.tgt.k==='front'?{x:S.front.x+20,y:566}:vessel(s.tgt.u);
      const dx=T.x-s.x,dy=T.y-s.y,d=Math.hypot(dx,dy)||1;s.vx+=(dx/d*34-s.vx)*dt*.9+rand(-40,40)*dt;s.vy+=(dy/d*34-s.vy)*dt*.9+rand(-40,40)*dt;
      s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot+=dt;s.life-=dt;
      if(d<20&&!s.dead){s.dead=true;if(S.running&&!S.done){if(s.tgt.k==='osteo')s.tgt.o.act=Math.min(1.6,s.tgt.o.act+.28);else if(s.tgt.k==='front')S.front.act=Math.min(1.6,S.front.act+.25);else{S.recruits++;const p=vessel(s.tgt.u);S.cells.push({type:Math.random()<.7?'t':'b',x:p.x,y:p.y,vx:0,vy:-12,act:1,fresh:1});}}}}
    S.sig=S.sig.filter(s=>!s.dead&&s.life>0);
    // damage
    for(const o of S.osteo){o.act*=Math.exp(-dt*.25);if(S.running&&!S.done){S.bone=Math.min(1,S.bone+wk*.0105*o.act);o.pit=S.bone;}}
    S.front.act*=Math.exp(-dt*.25);if(S.running&&!S.done)S.cart=Math.min(1,S.cart+wk*.012*S.front.act);S.front.x=540+300*S.cart;
    // adalimumab: a dose every two weeks from the blood, about a two-week half-life
    if(S.hum&&S.running&&!S.done&&S.week>=S.humNext){S.humNext=S.week+2;for(let i=0;i<6;i++){const p=vessel(rand(.1,.9));S.ab.push({x:p.x,y:p.y,vx:0,vy:0,rot:rand(0,6),bound:null,fade:0});}}
    for(const a of S.ab){if(Math.random()<wk*Math.LN2/2)a.dying=true;
      if(a.bound){a.fade+=dt*.6;a.y-=dt*8;continue;}
      let best=null,bd=230;for(const s of S.sig){if(s.type!=='tnf'||s.held)continue;const d=Math.hypot(s.x-a.x,s.y-a.y);if(d<bd){bd=d;best=s;}}
      if(best){a.vx+=((best.x-a.x)/bd*55-a.vx)*dt*2;a.vy+=((best.y-a.y)/bd*55-a.vy)*dt*2;if(bd<16){a.bound=best;best.held=true;best.dead=true;burst(best.x,best.y,C.ab);}}
      else{a.vx+=rand(-30,30)*dt;a.vy+=rand(-30,30)*dt;}
      a.x+=a.vx*dt;a.y+=a.vy*dt;a.rot+=dt*.4;if(a.dying)a.fade+=dt*.5;}
    S.ab=S.ab.filter(a=>a.fade<1);
    // recruited cells crawl up into the lining
    for(const c of S.cells)if(c.fresh){c.y+=c.vy*dt;c.x+=Math.sin(c.y/20)*dt*6;if(c.y<300+Math.random()*120)c.fresh=0;}
    for(const c of S.cells)c.act*=Math.exp(-dt*1.5);
    for(const n of S.neut){n.x+=n.vx*dt;n.y+=n.vy*dt;if(n.x<40||n.x>960)n.vx*=-1;if(n.y<30||n.y>185)n.vy*=-1;}
    for(const r of S.rbc)r.u=(r.u+dt*.05)%1;
    for(const b of S.bursts)b.t+=dt;S.bursts=S.bursts.filter(b=>b.t<.6);
  }
  function burst(x,y,col){S.bursts.push({x,y,col,t:0});}
  function draw(x,dt,t,api){
    if(!bg)buildBg();step(dt,api);
    x.drawImage(bg,0,0,2000,1400,0,0,1000,700);
    // vessel blood
    for(const r of S.rbc){const p=vessel(r.u);G.rbc(x,p.x,p.y+Math.sin(r.u*40)*4,.62);}
    // erosion pits under osteoclasts; pannus front over cartilage
    for(const o of S.osteo){if(o.pit>.01){x.fillStyle='#0B0E17';x.beginPath();x.ellipse(o.x,o.y+6,60*Math.sqrt(o.pit)+6,8+34*o.pit,0,0,Math.PI);x.fill();x.strokeStyle='rgba(255,138,91,.5)';x.lineWidth=1.5;x.stroke();}}
    x.fillStyle='rgba(67,217,155,.10)';x.beginPath();x.moveTo(500,560);x.lineTo(S.front.x,566);x.lineTo(S.front.x,588);x.quadraticCurveTo(520,600,500,592);x.fill();
    for(let i=0;i<4;i++)G.fls(x,S.front.x-10-i*30,574+(i%2)*10,.8,t,.05,S.front.act);
    for(const c of chondros){const f=clamp((S.front.x-c.x)/40,0,1);G.chondro(x,c.x,c.y,1,c.pair,f*(c.y<640?1:.5));}
    for(const o of S.osteo)G.osteo(x,o.x,o.y-26,.9,t,o.act);
    // cells
    for(const c of S.cells){const j=Math.sin(t*1.3+c.x)*1.5;
      if(c.type==='fls')G.fls(x,c.x+j,c.y,1,t,c.rot,c.act);else if(c.type==='mac')G.mac(x,c.x,c.y+j,1,t,c.seed);else if(c.type==='t')G.tcell(x,c.x+j,c.y);else if(c.type==='b')G.bcell(x,c.x,c.y+j);else G.plasma(x,c.x,c.y);
      if(S.hcq&&c.type!=='plasma'){const r=1-Math.exp(-(S.week-S.hcqStart)/8);x.fillStyle=rgba(C.hcq,.25+.6*r);for(let k=0;k<3;k++){x.beginPath();x.arc(c.x+Math.cos(k*2.1+c.x)*6,c.y+Math.sin(k*2.1+c.x)*5,1.6+r,0,TAU);x.fill();}}}
    for(const n of S.neut)G.neut(x,n.x,n.y,1,t);
    // steroid haze
    if(S.ster>.02){x.fillStyle=`rgba(120,170,255,${S.ster*.10})`;x.fillRect(-300,-100,1600,900);}
    // signals glow
    x.save();x.globalCompositeOperation='lighter';
    for(const s of S.sig){const col=s.type==='tnf'?C.tnf:C.il6;glow(x,s.x,s.y,16,rgba(col,.9),.85);x.fillStyle=col;x.beginPath();x.arc(s.x,s.y,4,0,TAU);x.fill();}
    for(const b of S.bursts){x.strokeStyle=rgba(b.col,1-b.t/.6);x.lineWidth=2;x.beginPath();x.arc(b.x,b.y,8+b.t*60,0,TAU);x.stroke();}
    x.restore();
    for(const a of S.ab){x.save();x.globalAlpha=1-a.fade;G.ab(x,a.x,a.y,.17,a.rot);if(a.bound)G.tnf(x,a.x,a.y-12,.18);x.restore();}
    updateCard(api);
  }
  let lastUi=0;
  function updateCard(api){const now=performance.now();if(now-lastUi<150)return;lastUi=now;const c=api.card;const q=s=>c.querySelector(s);if(!q('#dl-w'))return;
    q('#dl-w').textContent=Math.floor(S.week);q('#dl-bone').textContent=Math.round(S.bone*100)+'%';q('#dl-boneB').style.width=S.bone*100+'%';
    q('#dl-cart').textContent=Math.round(S.cart*100)+'%';q('#dl-cartB').style.width=S.cart*100+'%';q('#dl-c').textContent=S.caught;
    const hc=q('#dl-hcq');hc.classList.toggle('on',S.hcq);hc.querySelector('small').textContent=S.hcq?`week ${Math.floor(S.week-S.hcqStart)}: ${Math.round((1-Math.exp(-(S.week-S.hcqStart)/8))*100)}% of full effect`:'slow: builds over months';
    const st=q('#dl-st');st.disabled=S.ster>.2||S.done;st.querySelector('small').textContent=S.ster>.02?`fading: ${Math.round(S.ster*100)}% strength`:'fast, but wears off';
    const hu=q('#dl-hum');hu.classList.toggle('on',S.hum);hu.querySelector('small').textContent=S.hum?'a dose every 2 weeks; grabs TNF only':'targets TNF';
  }
  function finish(api){const prot=Math.round((1-(S.bone+S.cart)/2)*100);const used=[S.hcq&&'hydroxychloroquine',S.hum&&'Humira',S.sterUses&&'a steroid bridge'].filter(Boolean);
    const el=api.card.querySelector('#dl-end');if(el){el.hidden=false;el.innerHTML=`<p class="sub">A year in this lining</p><p><b style="color:var(--bone)">${prot}% of the joint protected.</b> ${S.caught} signals caught by hand${used.length?', with '+used.join(' and '):', no medicine'}.</p><p>${used.length?'The earlier a treatment starts, the less there is to undo: erosions mostly don\'t heal. That is the whole logic of treating RA early and to a target, and of changing the plan (often methotrexate, sometimes a biologic) if the first drug isn\'t enough by about three months. Hydroxychloroquine is the gentlest DMARD; many people need a stronger one, which is normal.':'Untreated, the lining keeps eroding bone and cartilage. Try again with the patient\'s medicines.'}</p>`;}
    api.toast(`Week 52 · ${prot}% protected`);}
  return {id:'lining',label:'Lining',size:'100 µm',fit:'cover',bar:{units:80,label:'20 µm'},zoomFocus:{x:600,y:330},
    enter(){if(!S.cells)reset();},exit(){},
    card(){return `<p class="k">Level 3 · cells · week <span id="dl-w">0</span> of 52</p><h2>Hold the lining</h2>
      <p>Macrophages and T cells release <b style="color:${C.tnf}">TNF</b> and <b style="color:${C.il6}">IL-6</b>. Signals that reach the osteoclasts dissolve bone; signals that reach the creeping lining cells eat cartilage; signals that reach the vessel call in more immune cells. <b style="color:var(--bone)">Tap signals to catch them</b>, and use the patient's medicines.</p>
      <div class="dv-meter"><span>Bone eroded</span><b id="dl-bone">0%</b><i><u id="dl-boneB"></u></i></div>
      <div class="dv-meter"><span>Cartilage lost</span><b id="dl-cart">0%</b><i><u id="dl-cartB"></u></i></div>
      <div class="dv-meter"><span>Signals caught</span><b id="dl-c">0</b></div>
      <div class="dv-btns"><button class="dv-btn" id="dl-st" type="button">Steroid bridge<small>fast, but wears off</small></button><button class="dv-btn" id="dl-hcq" type="button">Hydroxychloroquine<small>slow: builds over months</small></button><button class="dv-btn" id="dl-hum" type="button">Humira<small>targets TNF</small></button></div>
      <div id="dl-end" hidden></div>
      <div class="dv-btns"><button class="dv-btn" id="dl-re" type="button">Restart the year</button><button class="dv-btn go" id="dl-go" type="button">Zoom to the molecules<small>see TNF meet Humira</small></button></div>
      <p class="dv-fine">Tap any cell to add it to your field guide. One week passes every two seconds. Each glowing dot stands for a burst of signal molecules far too small to see at this scale. Cell sizes are to scale; the game's numbers are illustrative, not a forecast for the patient's joints.</p>`;},
    bind(card,api){
      card.querySelector('#dl-st').onclick=()=>{if(S.ster>.2||S.done)return;S.ster=1;S.sterUses++;api.toast('Steroid: inflammation drops fast');};
      card.querySelector('#dl-hcq').onclick=()=>{if(S.hcq||S.done)return;S.hcq=true;S.hcqStart=S.week;api.toast('Hydroxychloroquine started: it builds slowly');};
      card.querySelector('#dl-hum').onclick=()=>{if(S.hum||S.done)return;S.hum=true;S.humNext=S.week;api.toast('Humira: antibodies arrive from the blood');};
      card.querySelector('#dl-re').onclick=()=>{reset();card.querySelector('#dl-end').hidden=true;};
      card.querySelector('#dl-go').onclick=()=>api.go('molecule',{from:{x:600,y:330}});
    },
    tap(p,api){
      // catch the nearest signal first; generous on touch
      const R=Math.max(26,20/p.s);let best=null,bd=R;for(const s of S.sig){const d=Math.hypot(s.x-p.x,s.y-p.y);if(d<bd){bd=d;best=s;}}
      if(best){best.dead=true;S.caught++;burst(best.x,best.y,best.type==='tnf'?C.tnf:C.il6);if(!api.seenSig){api.seenSig=1;}return;}
      // otherwise identify what was tapped
      const hit=(k,cx,cy,r)=>Math.hypot(p.x-cx,p.y-cy)<r?k:null;
      for(const o of S.osteo)if(hit(1,o.x,o.y-26,60))return api.discover('osteo');
      for(const c of chondros)if(hit(1,c.x,c.y,22))return api.discover('chondro');
      for(const n of S.neut)if(hit(1,n.x,n.y,22))return api.discover('neut');
      let bc=null,bdc=30;for(const c of S.cells){const d=Math.hypot(p.x-c.x,p.y-c.y);if(d<bdc){bdc=d;bc=c;}}
      if(bc)return api.discover(bc.type);
      for(const a of S.ab)if(hit(1,a.x,a.y,24))return api.discover('ada');
    },
    draw,
  };
}

/* ------------------------------------------------------------------ level 4: molecules */
function moleculeLevel(){
  const M={mode:'tnf'};let T=null,L=null,drag=null;
  function resetT(){T={tnf:[],ab:[],rec:[150,330,510,690,870].map(x=>({x,busy:0,tnf:null})),hits:0,blocked:0,acc:0,flash:[]};}
  function resetL(){L={hcq:[],acid:1,prot:[],frag:0,alarms:0,acc:0,accN:0,strands:[],mhc:[],flash:[],dose:0};
    for(let i=0;i<4;i++)L.prot.push({a:rand(0,TAU),r:rand(40,110),len:9,cut:0,t:rand(0,2)});}
  resetT();resetL();
  const memY=560;
  function drawMembrane(x,y,w0,w1){for(let xx=w0;xx<=w1;xx+=20){for(const s of [-1,1]){x.fillStyle='#8FA3A6';x.beginPath();x.arc(xx,y+s*34,8,0,TAU);x.fill();x.strokeStyle='rgba(143,163,166,.5)';x.lineWidth=2;x.beginPath();x.moveTo(xx-3,y+s*26);x.lineTo(xx-3,y+s*4);x.moveTo(xx+3,y+s*26);x.lineTo(xx+3,y+s*4);x.stroke();}}}
  function receptor(x,r,t){const busy=r.busy>0;for(let i=-1;i<=1;i++){x.strokeStyle=busy?'#FFB89A':'#C9D6D8';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(r.x+i*16,memY+30);x.lineTo(r.x+i*16,memY-60);x.stroke();
      x.fillStyle=busy?'#FF8A5B':'#9FB4B8';x.beginPath();x.arc(r.x+i*14,memY-66,9,0,TAU);x.fill();}
    if(busy){x.save();x.globalCompositeOperation='lighter';glow(x,r.x,memY+70,70*r.busy,'rgba(255,90,60,.5)');x.restore();}}
  function stepT(dt){
    T.acc+=dt;if(T.acc>1.4){T.acc=0;T.tnf.push({x:rand(80,920),y:-40,vx:rand(-10,10),vy:rand(24,40),rot:rand(0,6),state:'free',t:0});}
    for(const m of T.tnf){m.t+=dt;if(m.state==='free'){m.x+=m.vx*dt+Math.sin(m.t*2+m.rot)*12*dt;m.y+=m.vy*dt;m.rot+=dt*.5;
        for(const r of T.rec)if(!r.busy&&Math.abs(m.x-r.x)<46&&m.y>memY-120){m.state='docked';m.r=r;r.busy=1;r.tnf=m;T.hits++;}
        if(m.y>memY-90)m.y=memY-90;}
      else if(m.state==='docked'){m.x=lerp(m.x,m.r.x,dt*6);m.y=lerp(m.y,memY-96,dt*6);m.r.busy-=dt*.4;if(m.r.busy<=0){m.r.busy=0;m.state='gone';}}
      else if(m.state==='bound'){m.x=m.ab.x+Math.sin(m.ab.rot)*-62;m.y=m.ab.y-Math.cos(m.ab.rot)*62;}}
    T.tnf=T.tnf.filter(m=>m.state!=='gone'&&m.y<800);
    for(const a of T.ab){if(a===drag)continue;
      if(a.cargo){a.y-=dt*30;a.fade+=dt*.25;continue;}
      let best=null,bd=1e9;for(const m of T.tnf)if(m.state==='free'){const d=Math.hypot(m.x-a.x,m.y-a.y);if(d<bd){bd=d;best=m;}}
      if(best){const tx=best.x,ty=best.y+70;a.x+=clamp(tx-a.x,-1,1)*Math.min(Math.abs(tx-a.x),60*dt);a.y+=clamp(ty-a.y,-1,1)*Math.min(Math.abs(ty-a.y),60*dt);}
      tryBind(a);}
    T.ab=T.ab.filter(a=>(a.fade||0)<1);
  }
  function tryBind(a){if(a.cargo)return;const tipX=a.x+Math.sin(a.rot)*-62,tipY=a.y-Math.cos(a.rot)*62;
    for(const m of T.tnf)if(m.state==='free'&&Math.hypot(m.x-tipX,m.y-tipY)<44){m.state='bound';m.ab=a;a.cargo=m;a.fade=0;T.blocked++;T.flash.push({x:m.x,y:m.y,t:0});return;}}
  function drawT(x,dt,t){stepT(dt);
    x.fillStyle='#0A1418';x.fillRect(-300,-100,1600,memY+66);x.fillStyle='#120B12';x.fillRect(-300,memY+30,1600,500);
    drawMembrane(x,memY,-300,1300);T.rec.forEach(r=>receptor(x,r,t));
    for(const m of T.tnf)G.tnf(x,m.x,m.y,1.6,m.rot);
    for(const a of T.ab){x.save();x.globalAlpha=1-(a.fade||0);G.ab(x,a.x,a.y,1,a.rot);x.restore();}
    for(const f of T.flash){f.t+=dt;x.strokeStyle=`rgba(90,168,255,${1-f.t})`;x.lineWidth=3;x.beginPath();x.arc(f.x,f.y,20+f.t*60,0,TAU);x.stroke();}T.flash=T.flash.filter(f=>f.t<1);
    x.fillStyle='rgba(236,230,218,.5)';x.font='12px "Martian Mono", monospace';x.textAlign='left';x.fillText('OUTSIDE THE CELL',24,34);x.fillText('CELL MEMBRANE',24,memY-48);x.fillText('INSIDE: INFLAMMATION GENES',24,memY+90);
    x.textAlign='center';x.fillText('TNF receptors',510,memY+130);
  }
  // hydroxychloroquine and the lysosome
  const LC={x:500,y:360,r:200};
  function stepL(dt){
    const A=L.acid;L.acc+=dt;
    for(const p of L.prot){p.t+=dt*(.35+1.3*A*A);if(p.t>2.4){p.t=0;p.len--;L.frag++;if(Math.random()<.6)L.mhc.push({a:rand(-2.6,-.5),u:0});if(p.len<=2){p.len=9;p.a=rand(0,TAU);p.r=rand(40,110);}}}
    for(const m of L.mhc)m.u+=dt*.35;L.mhc=L.mhc.filter(m=>m.u<1);
    if(Math.random()<dt*.6)L.strands.push({a:rand(0,TAU),r:rand(20,120),t:0});
    for(const s of L.strands){s.t+=dt;s.a+=dt*.3;if(!s.done&&s.t>2.2){s.done=true;if(Math.random()<.15+.85*A*A){L.alarms++;L.flash.push({a:s.a,t:0});}}}
    L.strands=L.strands.filter(s=>s.t<3);for(const f of L.flash)f.t+=dt;L.flash=L.flash.filter(f=>f.t<1.2);
    for(const h of L.hcq){if(!h.in){h.x=lerp(h.x,h.tx,dt*1.5);h.y=lerp(h.y,h.ty,dt*1.5);if(Math.hypot(h.x-h.tx,h.y-h.ty)<6)h.in=true;}else{h.a+=dt*.4;h.x=LC.x+Math.cos(h.a)*h.r;h.y=LC.y+Math.sin(h.a)*h.r;}h.rot+=dt;}
    const n=L.hcq.filter(h=>h.in).length;L.acid=lerp(L.acid,Math.max(.32,1-n*.035),dt*1.2);
  }
  function drawL(x,dt,t){stepL(dt);const A=L.acid;
    x.fillStyle='#0C1016';x.fillRect(-300,-100,1600,900);
    // cell surface along the top, displaying fragments on MHC-II
    x.fillStyle='#16202A';x.fillRect(-300,-100,1600,150);drawMembrane(x,58,-300,1300);
    for(let i=0;i<8;i++){const mx=90+i*120;x.strokeStyle='#C08CFF';x.lineWidth=7;x.beginPath();x.moveTo(mx-10,92);x.lineTo(mx-10,40);x.moveTo(mx+10,92);x.lineTo(mx+10,40);x.stroke();
      if(i<Math.min(8,Math.round(8*A*A))){x.fillStyle='#FFE08A';x.beginPath();x.roundRect(mx-12,26,24,10,4);x.fill();}}
    // lysosome
    const acidCol=`rgba(${Math.round(lerp(60,255,A))},${Math.round(lerp(180,90,A))},${Math.round(lerp(150,110,A))},.20)`;
    x.fillStyle=acidCol;x.beginPath();x.arc(LC.x,LC.y,LC.r,0,TAU);x.fill();x.strokeStyle='#8FA3A6';x.lineWidth=10;x.stroke();x.strokeStyle='#0C1016';x.lineWidth=3;x.stroke();
    // TLR7/9 sensors on the inner membrane
    for(let i=0;i<3;i++){const a=-2.2+i*.9+Math.PI;const sx=LC.x+Math.cos(a)*(LC.r-14),sy=LC.y+Math.sin(a)*(LC.r-14);x.save();x.translate(sx,sy);x.rotate(a+Math.PI/2);
      x.strokeStyle='#71C6FF';x.lineWidth=6;x.beginPath();x.arc(0,10,16,Math.PI,0);x.stroke();x.restore();}
    for(const f of L.flash){const a=f.a;x.save();x.globalCompositeOperation='lighter';glow(x,LC.x+Math.cos(a)*LC.r,LC.y+Math.sin(a)*LC.r,60*(1-f.t/1.2)+20,'rgba(255,90,60,.6)');x.restore();}
    // proteins being chopped by enzymes
    for(const p of L.prot){const cx=LC.x+Math.cos(p.a)*p.r,cy=LC.y+Math.sin(p.a)*p.r;x.fillStyle='#FFE08A';for(let k=0;k<p.len;k++){x.beginPath();x.arc(cx+k*9-p.len*4.5,cy+Math.sin(k+t*2)*4,4.5,0,TAU);x.fill();}
      const mo=.5+.5*Math.sin(p.t*8);x.fillStyle='#FF6FA8';x.beginPath();x.moveTo(cx-p.len*4.5-12,cy);x.arc(cx-p.len*4.5-12,cy,11,mo*.6,TAU-mo*.6);x.closePath();x.fill();}
    for(const s of L.strands){const cx=LC.x+Math.cos(s.a)*s.r,cy=LC.y+Math.sin(s.a)*s.r;x.strokeStyle='rgba(113,198,255,.8)';x.lineWidth=2;x.beginPath();for(let k=0;k<12;k++)x.lineTo(cx+k*4,cy+Math.sin(k*.9+t*3)*6);x.stroke();}
    for(const h of L.hcq)G.hcq(x,h.x,h.y,.7,h.rot,h.in);
    x.fillStyle='rgba(236,230,218,.55)';x.font='12px "Martian Mono", monospace';x.textAlign='center';x.fillText('LYSOSOME',LC.x,LC.y+LC.r+30);x.fillText('cell surface: protein fragments shown to T cells',500,118);
    x.textAlign='left';x.fillText('TLR7/9 alarm sensors',LC.x-LC.r-170,LC.y-120);
  }
  return {id:'molecule',label:'Molecule',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},get bar(){return M.mode==='tnf'?{units:83,label:'5 nm'}:{units:0,label:'schematic, not to scale'};},zoomFocus:{x:500,y:350},
    enter(){},exit(){drag=null;},
    card(){return `<p class="k">Level 4 · molecules</p><h2>How the patient's medicines work</h2>
      <div class="dv-seg" role="radiogroup" aria-label="Molecule"><button role="radio" data-mm="tnf" aria-checked="${M.mode==='tnf'}">TNF and Humira</button><button role="radio" data-mm="hcq" aria-checked="${M.mode==='hcq'}">Hydroxychloroquine</button></div>
      <div id="dm-body"></div>`;},
    bind(card,api){const body=card.querySelector('#dm-body');
      const render=()=>{body.innerHTML=M.mode==='tnf'?`<p>TNF trimers drift down and dock onto receptors, switching on inflammation inside the cell. Adalimumab is an antibody: one of its two arms grabs TNF before it can dock. <b style="color:var(--bone)">Drag an antibody onto a TNF</b>, or let them hunt.</p>
          <div class="dv-meter"><span>TNF that reached a receptor</span><b id="dm-h">0</b></div><div class="dv-meter"><span>TNF caught by adalimumab</span><b id="dm-b">0</b></div>
          <div class="dv-btns"><button class="dv-btn go" id="dm-inj" type="button">Inject adalimumab<small>40 mg every other week in real life</small></button><button class="dv-btn" id="dm-r" type="button">Reset</button></div>
          <p class="dv-fine">To scale: a TNF trimer is about 5 nm across and an antibody about 10–15 nm. Tap a molecule to add it to your field guide.</p>`:
          `<p>Inside immune cells, lysosomes are acidic compartments (about pH 4.5–5) where enzymes chop proteins into fragments to show T cells, and where TLR7 and TLR9 sensors raise alarms. <b style="color:var(--bone)">Tap inside the lysosome</b> to add hydroxychloroquine: it gets charged and trapped there, and the compartment becomes less acidic.</p>
          <div class="dv-meter"><span>Acidity</span><b id="dm-a"></b><i><u id="dm-aB"></u></i></div>
          <div class="dv-meter"><span>Fragments displayed</span><b id="dm-f">0</b></div><div class="dv-meter"><span>Alarms raised</span><b id="dm-al">0</b></div>
          <div class="dv-btns"><button class="dv-btn go" id="dm-dose" type="button">Add a dose<small>it piles up slowly in the body</small></button><button class="dv-btn" id="dm-r" type="button">Reset</button></div>
          <p class="dv-fine">This view is a schematic: a real lysosome is hundreds of times larger than these molecules. The acidity meter is illustrative: the direction (less acidic, fewer fragments shown, quieter TLR alarms) is the established mechanism; the amounts are not. In a dish it works within an hour; in a person it takes months to build up.</p>`;
        body.querySelector('#dm-r').onclick=()=>{M.mode==='tnf'?resetT():resetL();};
        if(M.mode==='tnf')body.querySelector('#dm-inj').onclick=()=>{for(let i=0;i<3;i++)T.ab.push({x:rand(150,850),y:rand(200,330),rot:rand(-.4,.4),fade:0});api.discover('ada',true);};
        else body.querySelector('#dm-dose').onclick=()=>{addHcq(api,8);};};
      card.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>{M.mode=b.dataset.mm;card.querySelectorAll('[data-mm]').forEach(x=>x.setAttribute('aria-checked',x===b));render();});
      render();},
    press(p){if(M.mode!=='tnf')return;for(const a of T.ab)if(!a.cargo&&Math.hypot(p.x-a.x,p.y-a.y)<70){drag=a;a.ox=a.x-p.x;a.oy=a.y-p.y;return;}},
    move(p){if(drag){drag.x=p.x+drag.ox;drag.y=p.y+drag.oy;tryBind(drag);if(drag.cargo)drag=null;}},
    release(){drag=null;},
    tap(p,api){
      if(M.mode==='tnf'){for(const m of T.tnf)if(Math.hypot(p.x-m.x,p.y-m.y)<40)return api.discover('tnf');for(const a of T.ab)if(Math.hypot(p.x-a.x,p.y-a.y)<60)return api.discover('ada');return;}
      if(Math.hypot(p.x-LC.x,p.y-LC.y)<LC.r)addHcq(api,2,p);else if(p.y<110)api.discover('acpa');
    },
    draw(x,dt,t,api){M.mode==='tnf'?drawT(x,dt,t):drawL(x,dt,t);
      const c=api.card;const q=s=>c.querySelector(s);
      if(M.mode==='tnf'&&q('#dm-h')){q('#dm-h').textContent=T.hits;q('#dm-b').textContent=T.blocked;}
      if(M.mode==='hcq'&&q('#dm-a')){q('#dm-a').textContent=L.acid>.85?'strongly acidic':L.acid>.6?'less acidic':'much less acidic';q('#dm-aB').style.width=L.acid*100+'%';q('#dm-f').textContent=L.frag;q('#dm-al').textContent=L.alarms;}},
  };
  function addHcq(api,n,p){for(let i=0;i<n;i++){const a=rand(0,TAU),r=rand(30,LC.r-40);L.hcq.push({x:p?p.x:rand(0,1000),y:p?p.y:-30,tx:LC.x+Math.cos(a)*r,ty:LC.y+Math.sin(a)*r,a,r,rot:rand(0,6),in:false});}
    L.dose++;api.discover('hcq',true);}
}

export function raLevels(){return [jointLevel(),liningLevel(),moleculeLevel()];}
export { glow, rgba, nucleus, blob, C as COL };
