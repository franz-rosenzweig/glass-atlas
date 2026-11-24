// Zyrtec dive: a histamine skin test on the forearm at chosen hours after a dose → the H1 receptor cetirizine holds off, and how slowly
// it lets go → a capillary in the brain, the gate that keeps most of it away from the brain's own H1 receptors.
// Skin-test timing and sleepiness are from the 2004 Zyrtec label (the last with adult trial data), binding times from Gillard 2002, brain shares from PET.
import { TAU, clamp, lerp, rand } from './dive.js';
import { glow, rgba, nucleus } from './dive-ra.js';
import { GUIDE_M } from './dive-mast.js';
import { cc, theme } from './theme.js';

const C={cet:'#5AA8FF',dex:'#A9D4FF',oh:'#C08CFF',h1:'#62BED3',gq:'#B193E3',sig:'#FFE36E',nerve:'#E8C547',lys:'#F2A65A',pgp:'#F29A55',endo:'#C98A9A',old:'#F07FA0',fexo:'#7FD3A3',alb:'#E8B04A',rbc:'#C23447',neu:'#40C7AA'};
// histamine is white light on the dark slide; on paper it is drawn purple, as in the MCAS dive
const HIST=()=>theme()==='light'?'#7A4FB0':'#FFFFFF';
const LBL='rgba(236,230,218,.8)',FONT='11px "Martian Mono", monospace';
const bg=h=>`style="background:${cc(h)}"`;
function label(x,t,px,py,al='left',back=false){x.font=FONT;x.textAlign=al;if(back){const w=x.measureText(t).width;x.fillStyle='rgba(10,8,12,.66)';x.fillRect(al==='left'?px-5:al==='center'?px-w/2-5:px-w-5,py-12,w+10,17);}x.fillStyle=LBL;x.fillText(t,px,py);}
function poly(x,cx,cy,r,n,rot){x.beginPath();for(let i=0;i<n;i++){const a=rot+i/n*TAU;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();}
const near=(pts,p,d)=>{for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const L=(bx-ax)**2+(by-ay)**2,u=clamp(((p.x-ax)*(bx-ax)+(p.y-ay)*(by-ay))/L,0,1);if(Math.hypot(p.x-ax-u*(bx-ax),p.y-ay-u*(by-ay))<d)return true;}return false;};
const along=(P,u)=>{const k=clamp(Math.floor(u),0,P.length-2),f=clamp(u-k,0,1);return [lerp(P[k][0],P[k+1][0],f),lerp(P[k][1],P[k+1][1],f)];};

// histamine: a five-membered ring and its two-carbon amine tail
function histG(x,cx,cy,s,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=HIST();x.fillStyle=HIST();x.lineWidth=2;x.lineJoin='round';
  poly(x,-6,0,6,5,0);x.stroke();x.beginPath();x.moveTo(0,0);x.lineTo(5,-4);x.lineTo(10,0);x.stroke();x.beginPath();x.arc(12.5,1.5,2.4,0,TAU);x.fill();x.restore();}
// cetirizine: two benzene rings (one carrying chlorine) on a piperazine ring, an ether chain and the acid tail.
// tail:'oh' draws the alcohol version; flip draws the mirror image
function cetG(x,cx,cy,s,rot=0,col=C.cet,o={}){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,o.flip?-s:s);x.strokeStyle=col;x.fillStyle=rgba(col,.3);x.lineWidth=2;x.lineJoin='round';x.lineCap='round';
  for(const y of [-8,9]){poly(x,-26,y,6,6,Math.PI/6);x.fill();x.stroke();}
  x.beginPath();x.moveTo(-20.8,-5);x.lineTo(-16,0);x.lineTo(-20.8,6);x.moveTo(-16,0);x.lineTo(-11,0);x.moveTo(-31.2,12);x.lineTo(-35,15.5);x.stroke();
  poly(x,-5,0,6,6,0);x.stroke();x.beginPath();x.moveTo(1,0);x.lineTo(6,-4);x.lineTo(11,0);x.lineTo(16,-4);x.lineTo(21,0);x.stroke();x.fillStyle=col;
  if(o.tail==='oh'){x.beginPath();x.arc(23.5,0,2.2,0,TAU);x.fill();}
  else{x.beginPath();x.moveTo(21,0);x.lineTo(25,-4);x.moveTo(21,0);x.lineTo(25,4);x.stroke();x.beginPath();x.arc(26,-4.6,2,0,TAU);x.moveTo(28,4.6);x.arc(26,4.6,2,0,TAU);x.fill();}
  x.restore();}
// fexofenadine: two rings on a piperidine, a longer chain, a third ring and its acid
function fexoG(x,cx,cy,s,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=C.fexo;x.fillStyle=rgba(C.fexo,.3);x.lineWidth=2;x.lineJoin='round';x.lineCap='round';
  for(const y of [-8,9]){poly(x,-30,y,6,6,Math.PI/6);x.fill();x.stroke();}
  x.beginPath();x.moveTo(-24.8,-5);x.lineTo(-20,0);x.lineTo(-24.8,6);x.moveTo(-20,0);x.lineTo(-15,0);x.stroke();
  poly(x,-9,0,6,6,0);x.stroke();x.beginPath();x.moveTo(-3,0);x.lineTo(2,-4);x.lineTo(7,0);x.lineTo(12,-4);x.stroke();
  poly(x,18,-4,6,6,0);x.fill();x.stroke();x.beginPath();x.moveTo(24,-4);x.lineTo(29,0);x.lineTo(33,-4);x.moveTo(29,0);x.lineTo(33,4);x.stroke();x.restore();}
// diphenhydramine: two rings and a short chain ending in an amine
function diphG(x,cx,cy,s,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.scale(s,s);x.strokeStyle=C.old;x.fillStyle=rgba(C.old,.3);x.lineWidth=2;x.lineJoin='round';x.lineCap='round';
  for(const y of [-8,9]){poly(x,-14,y,6,6,Math.PI/6);x.fill();x.stroke();}
  x.beginPath();x.moveTo(-8.8,-5);x.lineTo(-4,0);x.lineTo(-8.8,6);x.moveTo(-4,0);x.lineTo(1,-4);x.lineTo(6,0);x.lineTo(11,-4);x.lineTo(16,0);x.lineTo(20,-4);x.moveTo(16,0);x.lineTo(20,4);x.stroke();x.restore();}
const drugG=(x,k,cx,cy,s,rot=0)=>k==='diph'?diphG(x,cx,cy,s,rot):k==='fexo'?fexoG(x,cx,cy,s,rot):
  cetG(x,cx,cy,s,rot,k==='hyd'?C.old:k==='dex'?C.dex:k==='oh'?C.oh:C.cet,{tail:k==='hyd'||k==='oh'?'oh':'',flip:k==='dex'});
// the H1 receptor side on: seven strands across the membrane; switched on, the outer side squeezes in and the inner side opens
const H1O=[-27,-18,-9,0,9,18,27];
function h1Icon(x,cx,cy,s,a=0){x.lineCap='round';for(let i=0;i<7;i++){x.strokeStyle=i%2?'#4E9AAB':C.h1;x.lineWidth=8*s;x.beginPath();x.moveTo(cx+H1O[i]*s*(1-.3*a),cy-40*s);x.lineTo(cx+H1O[i]*s*(1+.4*a),cy+40*s);x.stroke();}}
// P-glycoprotein: two halves around a channel
function pgpG(x,cx,cy,s,g=0,off=false){const col=off?'#8FA3A6':C.pgp;x.fillStyle=rgba(col,off?.2:.45+.45*g);x.strokeStyle=rgba(col,off?.5:1);x.lineWidth=2*s;
  for(const sg of [-1,1]){x.beginPath();x.moveTo(cx+sg*2.5*s,cy-12*s);x.lineTo(cx+sg*9*s,cy-12*s);x.lineTo(cx+sg*7*s,cy+12*s);x.lineTo(cx+sg*2*s,cy+12*s);x.closePath();x.fill();x.stroke();}
  if(g>.05){x.save();x.globalCompositeOperation='lighter';glow(x,cx,cy,22*s,`rgba(242,154,85,${.6*g})`);x.restore();}}

export const GUIDE_Z={
  hist:GUIDE_M.hist,
  zy_h1r:{name:'H1 receptor',kind:'Receptor',size:'nanometres',draw:(x,cx,cy,s)=>{h1Icon(x,cx,cy,s);histG(x,cx,cy-14*s,s*1.3,-Math.PI/2);},
    text:['A receptor that threads seven times through the cell membrane. Histamine settles into a pocket among its strands, squeezes the pocket\'s outer side tighter and opens the inner side, where the G protein Gq docks and passes the signal on (Xia 2021); calcium rises inside the cell (Thangam 2018).','It sits on the cells lining small blood vessels, on nerve cells and on smooth muscle (Thangam 2018); in the skin, switching it on can bring redness, swelling and itch. Every H1 antihistamine tested holds it in its off shape (Leurs 2002).']},
  zy_itch:{name:'Itch nerve fibre',kind:'Nerve ending (C-fibre)',size:'one fibre can serve a patch up to 85 mm across',draw:(x,cx,cy,s)=>{x.strokeStyle=C.nerve;x.lineWidth=3*s;x.lineCap='round';x.beginPath();x.moveTo(cx-70*s,cy+30*s);x.bezierCurveTo(cx-30*s,cy+30*s,cx-10*s,cy-10*s,cx+30*s,cy-14*s);x.lineTo(cx+62*s,cy-34*s);x.moveTo(cx+30*s,cy-14*s);x.lineTo(cx+66*s,cy-4*s);x.stroke();
      x.strokeStyle=C.h1;x.lineWidth=2.5*s;for(const [a,b] of [[-28,12],[8,-12]]){x.beginPath();x.arc(cx+a*s,cy+b*s-8*s,5*s,Math.PI*.05,Math.PI*.95);x.stroke();}},
    text:['Thin, slow nerve fibres carry histamine itch. Recording from single fibres in human skin, 8 of 56 fired steadily to histamine, in step with the itch people felt. They ignored touch, carried signals at only 0.5 m/s, and each covered a patch of skin up to 85 mm across (Schmelz 1997).','In the skin, histamine\'s itch, like its redness and swelling, can come through H1 receptors (Thangam 2018): the part of an itch an H1 blocker can quiet.']},
  zy_cet:{name:'Cetirizine',kind:'Medicine (Zyrtec)',size:'about 1 nm',draw:(x,cx,cy,s)=>cetG(x,cx+4*s,cy,s*2.3),
    text:['What the body makes from the older antihistamine hydroxyzine, sold as a medicine itself (label). A tablet holds two mirror-image forms, half and half; the R form, sold alone as levocetirizine, grips H1 about 30 times more tightly than the other and lets go far more slowly (Gillard 2002). In lab tests it showed no measurable pull on other receptors (label).','It peaks about an hour after a dose and has a half-life of 8.3 hours. 93% rides on blood proteins, little is broken down, and about half leaves unchanged in the urine (label).']},
  h1:GUIDE_M.h1,
  zy_bbb:{name:'Brain capillary wall',kind:'Blood–brain barrier',size:'micrometres',draw:(x,cx,cy,s)=>{x.fillStyle=rgba(C.endo,.35);x.strokeStyle=C.endo;x.lineWidth=2*s;for(const sg of [-1,1]){x.beginPath();x.roundRect(cx+(sg<0?-76:4)*s,cy-16*s,72*s,32*s,8*s);x.fill();x.stroke();nucleus(x,cx+sg*40*s,cy,18*s,6*s);}
      x.strokeStyle='#E6DEFF';x.lineWidth=2*s;for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(cx-7*s,cy+k*6*s);x.lineTo(cx+7*s,cy+k*6*s);x.stroke();}},
    text:['In the brain, the cells lining the smallest vessels are sealed to one another by tight junctions, and their membranes carry transporters that move substances in or throw them out. That is the blood–brain barrier (Abbott 2010). Pericytes and astrocyte end-feet wrap the outside.','So a molecule has to pass through the cells themselves. Cetirizine, which carries a plus and a minus charge at once and dissolves poorly in fat, does that slowly (Pagliara 1998; Polli 2003).']},
  zy_pgp:{name:'P-glycoprotein',kind:'Pump in the barrier cells',size:'nanometres',draw:(x,cx,cy,s)=>{pgpG(x,cx,cy+10*s,s*2.6,.4);cetG(x,cx,cy-48*s,s*.9);},
    text:['A pump in the barrier cells\' membrane that throws many drugs back into the blood. Cetirizine is one of its cargoes; the sedating antihistamines hydroxyzine and diphenhydramine are not (Chen 2003; Polli 2003). Fexofenadine is a particularly good one (Church 2013).','The evidence is from cell lines and mice: in mice bred without the pump, cetirizine\'s brain-to-blood ratio was 4 times higher in one study and 2 to 9 times in another, while hydroxyzine\'s didn\'t change (Chen 2003; Polli 2003).']},
  zy_old:{name:'Older antihistamines',kind:'Medicines (first generation)',size:'about 1 nm',draw:(x,cx,cy,s)=>{cetG(x,cx-30*s,cy-16*s,s*1.5,0,C.old,{tail:'oh'});diphG(x,cx+40*s,cy+22*s,s*1.5);},
    text:['Hydroxyzine and diphenhydramine are not cargo for the barrier\'s pump, and hydroxyzine crosses cell layers easily (Chen 2003; Polli 2003). In PET scans, 30 mg of diphenhydramine filled 56% of the brain\'s H1 receptors and 30 mg of hydroxyzine 68% (Tashiro 2008; Tashiro 2009).','Hydroxyzine is cetirizine\'s parent (label): the same skeleton, with an alcohol end where cetirizine has its acid. Taken daily for three weeks, hydroxyzine partly lost its effect on a skin test (Long 1985).']},
};

/* ---------------- level 1: the skin test on the forearm */
function skinLevel(){
  // [time after a 10 mg dose, share of the wheal suppressed]. The shares are illustrative, shaped to the label (begun within 20 minutes in
  // half of 69 volunteers and within an hour in 95%, lasting at least 24 hours) and to about 19 hours above 70% (Church 2013)
  const HR=[['No dose',0],['20 min',.3],['1 h',.7],['4 h',.9],['12 h',.82],['24 h',.6]];
  const VOL=['—','begun in half','begun in 95%','working','working','still working'];
  const SLOT=[260,500,740],SY=200,B0=24,B1=396,LX0=150,LX1=850,LY0=424,LY1=672,VY=600;
  const VR=[290,366,442,518,594,670,746,822];  // H1 receptors along the top of the small vein
  const NV=[[166,700],[192,640],[212,560],[262,530],[330,512],[400,500],[456,488]];  // the itch fibre, from deep up to the epidermis
  let sd=5;const R=()=>(sd=sd*16807%2147483647)/2147483647;
  const hairs=Array.from({length:80},()=>({x:-300+R()*1600,y:B0+10+R()*(B1-B0-20),l:9+R()*12,a:-.55+R()*.4}));
  const mot=Array.from({length:12},()=>({x:-200+R()*1400,y:B0+R()*(B1-B0),r:70+R()*120,d:R()<.5}));
  const ease=k=>k*k*(3-2*k),grow=s=>[ease(clamp((s.t-.6)/2.4,0,1)),ease(clamp((s.t-1)/4,0,1))];
  const SZ=v=>v>.8?'full size':v>.4?'smaller':v>.15?'much smaller':'barely there',IT=v=>v>.8?'strong':v>.4?'less':v>.15?'faint':'barely';
  let S;
  function lens(s){const rec=[...VR.map(x=>({x,v:1,on:0,blk:0})),...[3,4,5].map(i=>({x:NV[i][0],y:NV[i][1],i,v:0,on:0,blk:0}))];
    if(s.k!=='none')[3,9,6,0,10,5,2,8,4,7,1].slice(0,Math.round(s.inh*rec.length)).forEach(i=>rec[i].blk=1);
    return {s,rec,red:0,leak:[],pul:[],hist:Array.from({length:70},()=>({x:500+rand(-6,6),y:490,vx:rand(-90,90),vy:rand(10,80),l:rand(5,8)})),
      drug:s.k==='none'?[]:Array.from({length:Math.round(s.inh*7)},()=>({x:rand(190,820),y:rand(500,660),a:rand(0,TAU)}))};}
  function test(px,py,k){k=k||(S.h?'cet':'none');const inh=k==='hyd'?.45:HR[S.h][1];
    const lab=k==='hyd'?'HYDROXYZINE · 3 WEEKS DAILY':k==='none'?'NO DOSE':`${HR[S.h][0].toUpperCase()} AFTER ${S.wk?'· WEEKS DAILY':'A DOSE'}`;
    if(px===undefined){px=SLOT[S.slot];py=SY;S.slot=(S.slot+1)%3;}
    S.sites=S.sites.filter(s=>Math.abs(s.x-px)>150||Math.abs(s.y-py)>150);if(S.sites.length>2)S.sites.shift();
    const s={x:px,y:py,t:0,inh,k,lab,seed:R()*6};S.sites.push(s);S.lens=lens(s);}
  function reset(){S={h:0,wk:false,sites:[],slot:0,lens:null};test();S.h=2;test();}
  reset();
  const vy=L=>VY-16-5*L.red-4;  // where the vein's receptors sit as it widens
  function step(dt){for(const s of S.sites)s.t+=dt;const L=S.lens;if(!L)return;
    if(L.s.t>.6)for(const h of L.hist){h.vx=(h.vx+rand(-90,90)*dt)*.97;h.vy=(h.vy+rand(-90,90)*dt)*.97;h.x+=h.vx*dt;h.y+=h.vy*dt;h.l-=dt;
      if(h.y<484){h.y=484;h.vy=Math.abs(h.vy);}if(h.y>LY1-8){h.y=LY1-8;h.vy=-Math.abs(h.vy);}if(h.x<LX0+8||h.x>LX1-8){h.x=clamp(h.x,LX0+8,LX1-8);h.vx*=-1;}
      for(const r of L.rec)if(!r.blk&&r.on<=0&&Math.hypot(h.x-r.x,h.y-(r.v?vy(L):r.y))<13){r.on=1.4;h.l=0;
        if(r.v)for(let k=0;k<5;k++)L.leak.push({x:r.x+rand(-10,10),y:vy(L),vx:rand(-25,25),vy:-rand(10,40),l:rand(2,3.5)});else L.pul.push({u:r.i});break;}}
    L.hist=L.hist.filter(h=>h.l>0);
    let n=0;for(const r of L.rec){r.on=Math.max(0,r.on-dt);if(r.v&&r.on>0)n++;}L.red=lerp(L.red,clamp(n/3,0,1),1-Math.exp(-dt*1.5));
    for(const p of L.leak){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}L.leak=L.leak.filter(p=>p.l>0);
    for(const p of L.pul)p.u-=dt*5;L.pul=L.pul.filter(p=>p.u>0);
    for(const d of L.drug){d.a+=rand(-1,1)*dt*2;d.x=clamp(d.x+Math.cos(d.a)*10*dt,180,830);d.y=clamp(d.y+Math.sin(d.a)*10*dt,496,662);}}
  function skin(x){x.fillStyle='#C8957A';x.fillRect(-400,B0,1800,B1-B0);
    for(const m of mot){const g=x.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r);g.addColorStop(0,m.d?'rgba(150,95,72,.18)':'rgba(232,190,160,.2)');g.addColorStop(1,'rgba(200,150,122,0)');x.fillStyle=g;const y0=Math.max(B0,m.y-m.r);x.fillRect(m.x-m.r,y0,2*m.r,Math.min(B1,m.y+m.r)-y0);}
    // a vein under the skin, the fine creases, and the hairs lying one way
    x.strokeStyle='rgba(96,112,140,.16)';x.lineWidth=30;x.lineCap='round';x.beginPath();x.moveTo(-300,330);x.bezierCurveTo(200,300,600,380,1300,290);x.stroke();
    x.strokeStyle='rgba(120,70,52,.2)';x.lineWidth=1.2;for(const sg of [-1,1])for(let i=-30;i<40;i++){const x0=i*38;x.beginPath();x.moveTo(x0,B0);for(let y=B0;y<=B1;y+=24)x.lineTo(x0+sg*(y-B0)*.45+Math.sin(y*.05+i)*3,y);x.stroke();}
    x.lineWidth=1.1;for(const h of hairs){x.fillStyle='rgba(104,66,50,.7)';x.beginPath();x.arc(h.x,h.y,1.5,0,TAU);x.fill();x.strokeStyle='rgba(96,62,48,.45)';x.beginPath();x.moveTo(h.x,h.y);x.quadraticCurveTo(h.x+Math.cos(h.a)*h.l*.5,h.y+Math.sin(h.a)*h.l*.5+2,h.x+Math.cos(h.a)*h.l,h.y+Math.sin(h.a)*h.l+3);x.stroke();}
    x.fillStyle='rgba(110,64,50,.4)';x.fillRect(-400,B1-3,1800,3);x.fillRect(-400,B0,1800,2);}
  function site(x,s){const [gw,gf]=grow(s);const rw=5+34*(1-s.inh)*gw,rf=(14+104*(1-s.inh*.95))*gf;
    // the flare: widened vessels around the test, uneven at the edge
    for(let k=0;rf>2&&k<5;k++){const a=k*1.26+s.seed,ox=Math.cos(a)*rf*.2,oy=Math.sin(a)*rf*.16,rr=rf*(.72+.12*Math.sin(a*3));const g=x.createRadialGradient(s.x+ox,s.y+oy,0,s.x+ox,s.y+oy,rr);
      g.addColorStop(0,'rgba(214,74,84,.3)');g.addColorStop(.55,'rgba(214,74,84,.16)');g.addColorStop(1,'rgba(214,74,84,0)');x.fillStyle=g;x.beginPath();x.arc(s.x+ox,s.y+oy,rr,0,TAU);x.fill();}
    // the wheal: pale and raised, with a soft shadow
    const blob=(cx,cy,r)=>{x.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,q=r*(1+.08*Math.sin(a*3+s.seed)+.05*Math.sin(a*5+s.seed*2));i?x.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q*.92):x.moveTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q*.92);}x.closePath();};
    x.fillStyle='rgba(110,60,48,.22)';blob(s.x+3,s.y+5,rw);x.fill();x.fillStyle='#E9CBB5';blob(s.x,s.y,rw);x.fill();
    const g=x.createRadialGradient(s.x-rw*.35,s.y-rw*.4,0,s.x,s.y,rw*1.05);g.addColorStop(0,'rgba(255,246,236,.65)');g.addColorStop(1,'rgba(255,246,236,0)');x.fillStyle=g;blob(s.x,s.y,rw);x.fill();
    x.fillStyle='#9C3E3A';x.beginPath();x.arc(s.x,s.y,2.4,0,TAU);x.fill();
    if(s.t<.9){const k=ease(clamp(s.t/.45,0,1)),tx=s.x+40*(1-k),ty=s.y-40*(1-k);x.globalAlpha=1-clamp((s.t-.5)/.4,0,1);x.strokeStyle='#D9E0E2';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(tx,ty);x.lineTo(tx+80,ty-80);x.stroke();x.globalAlpha=1;}
    label(x,s.lab,s.x,Math.min(s.y+150,386),'center',true);}
  function lensDraw(x){const L=S.lens,red=L?L.red:0,w=16+5*red;
    x.save();x.beginPath();x.roundRect(LX0,LY0,LX1-LX0,LY1-LY0,8);x.fillStyle='#120B10';x.fill();x.clip();
    x.fillStyle='#B27C6C';x.fillRect(LX0,454,LX1-LX0,24);x.fillStyle='rgba(120,70,80,.4)';for(let i=0;i<44;i++){x.beginPath();x.ellipse(LX0+8+i*16,466,6,4,0,0,TAU);x.fill();}
    x.strokeStyle='rgba(200,150,160,.12)';x.lineWidth=2;for(let i=0;i<40;i++){const sx=LX0+(i*97)%700,sy=490+(i*53)%170;x.beginPath();x.moveTo(sx,sy);x.bezierCurveTo(sx+20,sy-8,sx+40,sy+8,sx+60,sy);x.stroke();}
    x.fillStyle=`rgba(194,52,71,${.22+.3*red})`;x.fillRect(LX0,VY-w,LX1-LX0,2*w);x.strokeStyle='#C25060';x.lineWidth=3;x.beginPath();x.moveTo(LX0,VY-w);x.lineTo(LX1,VY-w);x.moveTo(LX0,VY+w);x.lineTo(LX1,VY+w);x.stroke();
    if(red>.05){x.save();x.globalCompositeOperation='lighter';glow(x,560,VY,180,`rgba(224,86,106,${.25*red})`);x.restore();}
    x.strokeStyle=C.nerve;x.lineWidth=4;x.lineJoin='round';x.beginPath();NV.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();
    if(L){for(const p of L.pul){const [a,b]=along(NV,p.u);x.save();x.globalCompositeOperation='lighter';glow(x,a,b,18,'rgba(255,230,120,.9)');x.restore();}
      for(const r of L.rec){const ry=r.v?vy(L):r.y-4;if(r.on>0){x.save();x.globalCompositeOperation='lighter';glow(x,r.x,ry,16,'rgba(255,255,255,.55)');x.restore();}
        x.strokeStyle=C.h1;x.lineWidth=3;x.beginPath();x.arc(r.x,ry-6,7,Math.PI*.05,Math.PI*.95);x.stroke();
        if(r.blk)cetG(x,r.x,ry-12,.3,-Math.PI/2,L.s.k==='hyd'?C.old:C.cet,{tail:L.s.k==='hyd'?'oh':''});}
      for(const p of L.leak){x.fillStyle=`rgba(130,170,255,${clamp(p.l,0,1)*.7})`;x.beginPath();x.arc(p.x,p.y,2.6,0,TAU);x.fill();}
      if(L.s.t>.6){x.fillStyle=HIST();for(const h of L.hist){x.beginPath();x.arc(h.x,h.y,2.3,0,TAU);x.fill();}}
      for(const d of L.drug)cetG(x,d.x,d.y,.3,d.a,L.s.k==='hyd'?C.old:C.cet,{tail:L.s.k==='hyd'?'oh':''});}
    x.restore();x.strokeStyle='rgba(160,160,160,.55)';x.lineWidth=1.5;x.beginPath();x.roundRect(LX0,LY0,LX1-LX0,LY1-LY0,8);x.stroke();
    label(x,'UNDER THE NEWEST TEST · 1 MM',LX0+14,LY0+20);label(x,'EPIDERMIS',LX1-14,LY0+20,'right');label(x,'ITCH FIBRE',LX0+14,520);label(x,'SMALL VEIN · H1 ON ITS LINING',LX1-14,VY+w+22,'right');
    if(!L)label(x,'PRICK THE SKIN TO LOOK UNDERNEATH',500,560,'center');}
  function draw(x,dt,t,api){step(dt);
    x.fillStyle='#0B0A0C';x.fillRect(-400,-300,1800,1300);skin(x);
    const s=S.sites.at(-1);if(s){x.strokeStyle='rgba(150,150,150,.5)';x.setLineDash([4,5]);x.lineWidth=1.2;x.beginPath();x.moveTo(s.x-10,s.y+12);x.lineTo(LX0+30,LY0);x.moveTo(s.x+10,s.y+12);x.lineTo(LX1-30,LY0);x.stroke();x.setLineDash([]);}
    for(const q of S.sites)site(x,q);
    label(x,'FOREARM SKIN, FROM ABOVE',140,52,'left',true);lensDraw(x);
    const q=k=>api.card.querySelector(k);if(q('#zs-w')){const W=(id,v,fin,words)=>{q(id).textContent=s?words(fin):'—';q(id+'B').style.width=(s?v*100:0)+'%';};
      const [gw,gf]=s?grow(s):[0,0],a=s?1-s.inh:0,b=s?1-s.inh*.95:0;W('#zs-w',a*gw,a,SZ);W('#zs-f',b*gf,b,SZ);W('#zs-i',a*gf,a,IT);}
  }
  const chart=()=>`<svg viewBox="0 0 300 92" width="100%" height="92" aria-hidden="true" style="display:block;margin:2px 0 6px"><line x1="8" x2="292" y1="66" y2="66" stroke="var(--line-2)"/>${HR.map((h,i)=>`<rect x="${16+i*46}" y="${66-h[1]*54}" width="28" height="${Math.max(1,h[1]*54)}" rx="2" fill="${i===S.h?'var(--c)':'var(--line-2)'}"/><text x="${30+i*46}" y="82" font-size="8.5" text-anchor="middle" fill="var(--dim)" font-family="Martian Mono, monospace">${h[0].toUpperCase()}</text>`).join('')}<line x1="8" x2="292" y1="${66-.7*54}" y2="${66-.7*54}" stroke="var(--dim)" stroke-dasharray="3 3"/><text x="292" y="${61-.7*54}" font-size="8" text-anchor="end" fill="var(--dim)" font-family="Martian Mono, monospace">70%</text></svg>`;
  return {id:'skin',label:'Skin',size:'3 cm',fit:'cover',natural:true,bar:{units:0,label:'schematic'},zoomFocus:{x:500,y:VY},
    card(){return `<h2>The histamine skin test</h2>
      <p>A little histamine injected into the skin makes a pale, raised wheal, where fluid leaks from tiny veins; a red flare of widened vessels around it; and an itch, the same three features as a hive (Zuberbier 2026). All three can come through H1 receptors, on the cells lining the vessels and on itch nerves (Thangam 2018). That is the receptor cetirizine blocks.</p>
      <div class="dv-seg" role="radiogroup" aria-label="Time after the dose">${HR.map((h,i)=>`<button role="radio" data-h="${i}" aria-checked="${i===S.h}">${h[0]}</button>`).join('')}</div>
      <div class="dv-btns"><button class="dv-btn go" id="zs-go" type="button">Prick with histamine</button><button class="dv-btn" id="zs-cl" type="button">Clear the skin</button></div>
      <div class="dv-meter"><span>Wheal</span><b id="zs-w">—</b><i><u id="zs-wB" ${bg('#E9CBB5')}></u></i></div>
      <div class="dv-meter"><span>Flare</span><b id="zs-f">—</b><i><u id="zs-fB" ${bg('#D64A54')}></u></i></div>
      <div class="dv-meter"><span>Itch</span><b id="zs-i">—</b><i><u id="zs-iB" ${bg(C.nerve)}></u></i></div>
      <p class="sub">Wheal suppressed, by time after the dose (illustrative)</p><div id="zs-ch">${chart()}</div>
      <div class="dv-meter"><span>The label's 69 adult volunteers</span><b id="zs-v">${VOL[S.h]}</b></div>
      <div class="dv-btns"><button class="dv-btn${S.wk?' on':''}" id="zs-wk" type="button" aria-pressed="${S.wk}">After weeks of daily use</button></div>
      <div id="zs-wkp" ${S.wk?'':'hidden'}><p>In small studies it held, with no sign of wearing off (tachyphylaxis): 19 children for 35 days (Watson 1989; label), 10 adults for 3 weeks (Rihoux 1989, whose first author worked for the maker), and two six-month trials by one Polish research group, in which 20 and 28 people with year-round rhinitis finished, split between cetirizine and placebo (and, in the second, levocetirizine), so about ten took cetirizine in each (Kruszewski 2005; Kłos 2007). Two older antihistamines partly wore off: hydroxyzine, cetirizine's parent, partly lost its effect over 3 weeks of daily use in a study of 18 people (Long 1985), and chlorpheniramine within 7 to 21 days in 10 (Taylor 1985).</p>
        <div class="dv-btns"><button class="dv-btn" id="zs-hy" type="button">Test hydroxyzine after 3 weeks</button></div></div>
      <div class="dv-btns"><button class="dv-btn" id="zs-next" type="button">Zoom in · H1 receptor</button></div>
      <p class="dv-fine">The label: in 69 adult volunteers, 5 and 10 mg strongly suppressed the wheal and flare; after a single 10 mg dose it began within 20 minutes in half of them and within an hour in 95%, and lasted at least 24 hours; it also says the clinical relevance of suppressing a skin test is unknown. The bars and drawn sizes are illustrative, set so the wheal stays at least 70% suppressed for about 19 hours, as reported for cetirizine (Church 2013); the flare is drawn smaller than life so three tests fit side by side. Hydroxyzine's partial fade is drawn, not measured.</p>
      <p class="dv-fine">Cetirizine doesn't stop the mast cells: in skin, 10 mg daily for six days reduced the wheal and flare without lowering the histamine, tryptase or PGD2 they released (Nielsen 2001). H1 blockers ease itch, hives and flushing but don't prevent or relieve throat swelling, low blood pressure or shock (WAO 2011). Itch fibres: Schmelz 1997.</p>`;},
    bind(card,api){const q=s=>card.querySelector(s);
      card.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{S.h=+b.dataset.h;card.querySelectorAll('[data-h]').forEach(y=>y.setAttribute('aria-checked',y===b));q('#zs-ch').innerHTML=chart();q('#zs-v').textContent=VOL[S.h];});
      q('#zs-go').onclick=()=>test();q('#zs-cl').onclick=()=>{S.sites=[];S.lens=null;S.slot=0;};q('#zs-hy').onclick=()=>test(undefined,undefined,'hyd');
      const wk=q('#zs-wk');wk.onclick=()=>{S.wk=!S.wk;wk.classList.toggle('on',S.wk);wk.setAttribute('aria-pressed',S.wk);q('#zs-wkp').hidden=!S.wk;};
      q('#zs-next').onclick=()=>api.go('receptor',{from:{x:500,y:VY}});},
    tap(p,api){if(p.y<B1){for(const s of S.sites)if(Math.hypot(p.x-s.x,p.y-s.y)<50)return api.discover('hist');if(p.y>B0)test(clamp(p.x,240,760),clamp(p.y,150,280));return;}
      const L=S.lens;if(!L||p.y<LY0||p.y>LY1||p.x<LX0||p.x>LX1)return;const drug=L.s.k==='hyd'?'zy_old':'zy_cet';
      for(const d of L.drug)if(Math.hypot(p.x-d.x,p.y-d.y)<16)return api.discover(drug);
      for(const r of L.rec)if(r.blk&&Math.hypot(p.x-r.x,p.y-(r.v?vy(L):r.y)+12)<16)return api.discover(drug);
      if(near(NV,p,14))return api.discover('zy_itch');
      if(Math.abs(p.y-VY)<32)return api.discover('zy_h1r');
      for(const h of L.hist)if(Math.hypot(p.x-h.x,p.y-h.y)<14)return api.discover('hist');},
    draw,
  };
}

/* ---------------- level 2: the H1 receptor, switched on and held off */
function receptorLevel(){
  // dissociation half-times in minutes, on human H1 receptors in the lab (Gillard 2002); k191 is levocetirizine on a receptor with Lys191 changed to alanine
  const MY=380,HALF={levo:142,dex:6,oh:31,k191:13},Q=[.17,.5,.83];
  const CMP={dex:['Its mirror image','(S)-CETIRIZINE'],oh:['An alcohol tail','THE ALCOHOL VERSION'],k191:['Lys191 changed','LYS191 → ALANINE']};
  const NOTE={dex:'Its mirror image, (S)-cetirizine, is the other half of every tablet. It grips H1 about 30 times more weakly, and half of it is off in 6 minutes, against 142 for levocetirizine (Gillard 2002).',
    oh:'The same molecule with an alcohol end in place of the acid: half off in 31 minutes, and a methyl ester version in 7. The acid tail is what holds on (Gillard 2002).',
    k191:'Levocetirizine itself, on a receptor whose lysine 191, at the pocket\'s mouth, was changed to alanine: half off in 13 minutes instead of 142, and a looser grip. The acid tail\'s hold on that lysine is much of what keeps it there (Gillard 2002).'};
  const M={mode:'on',cmp:'dex',drug:false};let S;
  function reset(){const xs=M.mode==='on'?[220,360,500,640,780]:[200,300,400,600,700,800];
    S={rec:xs.map(x=>({x,act:0,flick:0,lig:null,mut:false,side:x>500?1:0})),hist:[],drug:[],sparks:[],sig:0,min:0,run:false};
    if(M.mode==='go')S.rec.forEach((r,i)=>{const c=r.side?M.cmp:'levo';r.mut=c==='k191';r.lig={k:c==='k191'?'levo':c,at:HALF[c]*-Math.log2(1-Q[i%3])};});}
  reset();
  function addHist(n){for(let i=0;i<n;i++)S.hist.push({x:rand(160,840),y:rand(60,150),a:rand(0,TAU),l:rand(8,12)});}
  function unbind(r){const L=r.lig;r.lig=null;if(L.k==='hist')S.hist.push({x:r.x,y:MY-74,a:-Math.PI/2,l:rand(2,5)});else S.drug.push({x:r.x,y:MY-74,a:-Math.PI/2,k:L.k,leave:true,rot:0});}
  function step(dt){
    if(M.mode==='go'){if(S.hist.length<10&&Math.random()<dt*4)addHist(1);if(S.run){S.min=Math.min(300,S.min+dt*10);if(S.min>=300)S.run=false;}}
    else if(M.drug){const n=S.drug.filter(d=>!d.leave).length;if(n<6&&Math.random()<dt*3)S.drug.push({x:rand(160,840),y:50,a:rand(.5,2.6),k:n%2?'dex':'levo',rot:rand(0,6)});}
    else for(const d of S.drug)d.leave=true;
    const walk=(m,v)=>{m.a+=rand(-1,1)*dt*3;m.x+=Math.cos(m.a)*v*dt;m.y+=Math.sin(m.a)*v*dt;if(m.x<150||m.x>850){m.x=clamp(m.x,150,850);m.a=Math.PI-m.a;}if(m.y<50){m.y=50;m.a=-m.a;}if(m.y>MY-72){m.y=MY-72;m.a=-m.a;}};
    for(const h of S.hist){walk(h,90);h.l-=dt;if(h.l<=0)continue;for(const r of S.rec)if(!r.lig&&Math.abs(h.x-r.x)<26&&h.y>MY-100&&Math.random()<dt*8){r.lig={k:'hist',t:rand(1,1.8)};h.l=0;break;}}
    S.hist=S.hist.filter(h=>h.l>0);
    for(const d of S.drug){d.rot+=dt*.6;if(d.leave){d.y-=dt*70;d.f=(d.f??1)-dt*.5;continue;}walk(d,50);d.y+=dt*14;
      for(const r of S.rec)if(!r.lig&&Math.abs(d.x-r.x)<26&&d.y>MY-100&&Math.random()<dt*(d.k==='levo'?4:.5)){r.lig={k:d.k,t:d.k==='levo'?rand(16,26):rand(1,2)};d.gone=true;break;}}
    S.drug=S.drug.filter(d=>!d.gone&&!(d.leave&&(d.f<=0||d.y<-40)));
    for(const r of S.rec){const L=r.lig;
      if(L){if(L.k==='hist'||M.mode==='on'){L.t-=dt;if(L.t<=0)unbind(r);}else if(S.min>=L.at)unbind(r);}
      // empty receptors now and then flip on by themselves (constitutive activity); cetirizine stops that too
      if(!r.lig&&M.mode==='on'){if(r.flick>0)r.flick-=dt;else if(Math.random()<dt*.07)r.flick=.9;}
      const tg=r.lig?.k==='hist'?1:!r.lig&&r.flick>0?.7:0;r.act=lerp(r.act,tg,1-Math.exp(-dt*6));
      if(r.act>.4&&Math.random()<dt*9*r.act)S.sparks.push({x:r.x+rand(-16,16),y:MY+100,vx:rand(-30,30),vy:rand(30,90),l:1.3});}
    for(const p of S.sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}S.sparks=S.sparks.filter(p=>p.l>0);
    S.sig=lerp(S.sig,S.rec.reduce((a,r)=>a+r.act,0)/S.rec.length,1-Math.exp(-dt*2));}
  function rcp(x,r){const a=r.act,cx=r.x,tw=1-.3*a,bw=1+.4*a;
    x.lineCap='round';x.strokeStyle=rgba(C.h1,.55);x.lineWidth=2.2;
    for(let i=0;i<6;i++){const top=i%2===0,y=top?MY-58:MY+58,k=top?tw:bw;x.beginPath();x.moveTo(cx+H1O[i]*k,y);x.quadraticCurveTo(cx+(H1O[i]+H1O[i+1])/2*k,y+(top?-16:16),cx+H1O[i+1]*k,y);x.stroke();}
    // Gq docks under the opened inner side
    if(a>.04){x.globalAlpha=clamp(a*1.4,0,1);x.fillStyle=rgba(C.gq,.5);x.strokeStyle=C.gq;x.lineWidth=2;x.beginPath();x.ellipse(cx-6,MY+84,19,12,0,0,TAU);x.fill();x.stroke();
      x.beginPath();x.arc(cx+16,MY+90,9,0,TAU);x.fill();x.stroke();x.beginPath();x.arc(cx+25,MY+76,5,0,TAU);x.fill();x.stroke();x.globalAlpha=1;}
    for(let i=0;i<7;i++){x.strokeStyle=i%2?'#4E9AAB':C.h1;x.lineWidth=8;x.beginPath();x.moveTo(cx+H1O[i]*tw,MY-56);x.lineTo(cx+H1O[i]*bw,MY+56);x.stroke();}
    x.fillStyle='rgba(8,14,20,.82)';x.beginPath();x.ellipse(cx,MY-22,12*tw+2,26,0,0,TAU);x.fill();
    const lx=cx+15*tw,ly=MY-50;x.fillStyle=r.mut?'#8FA3A6':C.lys;x.beginPath();x.arc(lx,ly,4.5,0,TAU);x.fill();
    if(!r.mut){x.strokeStyle='#1A1010';x.lineWidth=1.6;x.beginPath();x.moveTo(lx-2.6,ly);x.lineTo(lx+2.6,ly);x.moveTo(lx,ly-2.6);x.lineTo(lx,ly+2.6);x.stroke();}
    const L=r.lig;if(!L)return;
    if(L.k==='hist'){histG(x,cx,MY-20,1,-Math.PI/2);return;}
    drugG(x,L.k,cx,MY-14,.62,-Math.PI/2);
    if(L.k!=='oh'&&!r.mut){x.strokeStyle=rgba(C.lys,.85);x.setLineDash([2,3]);x.lineWidth=1.4;x.beginPath();x.moveTo(cx+1,MY-31);x.lineTo(lx-3,ly+3);x.stroke();x.setLineDash([]);}}
  function draw(x,dt,t,api){step(dt);const go=M.mode==='go';
    x.fillStyle='#0A1016';x.fillRect(-400,-300,1800,MY+300);x.fillStyle='#100E18';x.fillRect(-400,MY,1800,700);
    for(let xx=-300;xx<=1300;xx+=20)for(const s of [-1,1]){x.fillStyle='#8FA3A6';x.beginPath();x.arc(xx,MY+s*40,8,0,TAU);x.fill();x.strokeStyle='rgba(143,163,166,.45)';x.lineWidth=2;x.beginPath();x.moveTo(xx-3,MY+s*32);x.lineTo(xx-3,MY+s*6);x.moveTo(xx+3,MY+s*32);x.lineTo(xx+3,MY+s*6);x.stroke();}
    if(go){x.strokeStyle='rgba(236,230,218,.25)';x.setLineDash([5,6]);x.lineWidth=1.2;x.beginPath();x.moveTo(500,56);x.lineTo(500,640);x.stroke();x.setLineDash([]);}
    for(const r of S.rec){if(r.act>.3){x.save();x.globalCompositeOperation='lighter';glow(x,r.x,MY+70,70,rgba(C.gq,.35*r.act));x.restore();}rcp(x,r);}
    x.fillStyle=C.sig;for(const p of S.sparks){x.globalAlpha=clamp(p.l,0,1);x.beginPath();x.arc(p.x,p.y,2.6,0,TAU);x.fill();}x.globalAlpha=1;
    for(const h of S.hist)histG(x,h.x,h.y,1.15,h.a);
    for(const d of S.drug){x.globalAlpha=clamp(d.f??1,0,1);drugG(x,d.k,d.x,d.y,.7,d.rot);x.globalAlpha=1;}
    label(x,'OUTSIDE THE CELL',140,go?96:40);label(x,'INSIDE THE CELL',140,MY+176);label(x,'MEMBRANE',go?500:290,MY+5,'center',true);
    if(go){label(x,'LEVOCETIRIZINE',300,40,'center');label(x,CMP[M.cmp][1],700,40,'center');if(S.min>0)label(x,`${Math.round(S.min)} MIN SINCE WASHING OUT`,500,MY+150,'center',true);}
    if(S.rec.some(r=>r.lig&&r.lig.k!=='hist'))label(x,'THE DRUG\'S POSE IN THE POCKET IS MODELLED',500,672,'center');
    const q=s=>api.card.querySelector(s);
    if(!go&&q('#zr-on')){const on=S.rec.filter(r=>r.act>.5).length,held=S.rec.filter(r=>r.lig&&r.lig.k!=='hist').length;q('#zr-on').textContent=`${on} of 5`;q('#zr-onB').style.width=on*20+'%';q('#zr-c').textContent=`${held} of 5`;q('#zr-cB').style.width=held*20+'%';q('#zr-sB').style.width=clamp(S.sig*1.6,0,1)*100+'%';}
    if(go&&q('#zr-m')){const f=h=>Math.pow(2,-S.min/h);q('#zr-m').textContent=Math.round(S.min)+(S.min>=300?' (stop)':'');const l=f(142),c=f(HALF[M.cmp]);
      q('#zr-l').textContent=Math.round(l*100)+'%';q('#zr-lB').style.width=l*100+'%';q('#zr-x').textContent=Math.round(c*100)+'%';q('#zr-xB').style.width=c*100+'%';}
  }
  const ON=()=>`<p>The H1 receptor threads seven times through the cell's membrane. Histamine settles into a pocket among its strands, squeezes the pocket's outer side tighter and opens the inner side, where the G protein Gq (purple) docks and passes the signal on (Xia 2021). Calcium rises inside: in the cells lining small veins the vessel leaks, and on a nerve ending it fires as itch (Thangam 2018).</p>
      <p>Cetirizine (blue) does more than plug the pocket. Like every H1 antihistamine tested, it is an inverse agonist: it holds the receptor in its off shape (Leurs 2002), so even the rare flicker on by itself, drawn here, stops. In structures of three other antihistamines bound to H1, each pushes a ring deep into the pocket and jams a "toggle switch" in the receptor (Wang 2024).</p>
      <p><b style="color:var(--bone)">Release histamine, then add cetirizine.</b></p>
      <div class="dv-btns"><button class="dv-btn go" id="zr-h" type="button">Release histamine</button><button class="dv-btn${M.drug?' on':''}" id="zr-d" type="button" aria-pressed="${M.drug}">Cetirizine<small>a steady level</small></button></div>
      <div class="dv-meter"><span>Receptors switched on</span><b id="zr-on">0 of 5</b><i><u id="zr-onB" ${bg(C.gq)}></u></i></div>
      <div class="dv-meter"><span>Held off by cetirizine</span><b id="zr-c">0 of 5</b><i><u id="zr-cB" ${bg(C.cet)}></u></i></div>
      <div class="dv-meter"><span>Signal inside: leak, itch</span><b></b><i><u id="zr-sB" ${bg('#DDB741')}></u></i></div>
      <p>It is also why guidance for MCAS prefers H1 blockers taken daily, ahead of time, to taking them as rescue: once symptoms show, the histamine has already landed (Weiler 2019, expert opinion).</p>
      <div class="dv-btns"><button class="dv-btn" id="zr-next" type="button">Zoom in · Brain's gate</button></div>
      <p class="dv-fine">The flicker was seen in lab cells made to carry extra receptors (Bakker 2001); whether it matters in skin isn't known. Each tablet is two mirror-image forms, half and half; the paler one is the weaker half (Gillard 2002). No experimental structure of H1 with cetirizine bound has been published: its pose in the pocket is a docking model, with its acid tail reaching two lysines at the pocket's mouth, Lys191 (orange) and Lys179 (Shimamura 2011). Timings are illustrative.</p>`;
  const GO=()=>`<p>Cetirizine's half-life in the blood is 8.3 hours, yet one dose damps the skin test for at least 24 (label). Part of the reason may be how slowly it lets go of the receptor. In the lab, wash the drug away and time how long until half the receptors are free (Gillard 2002).</p>
      <p>Levocetirizine is cetirizine's active half. Histamine keeps arriving.</p>
      <div class="dv-seg" role="radiogroup" aria-label="Rival">${Object.entries(CMP).map(([k,v])=>`<button role="radio" data-zc="${k}" aria-checked="${M.cmp===k}">${v[0]}</button>`).join('')}</div>
      <div class="dv-btns"><button class="dv-btn go" id="zr-w" type="button">Wash the drug out</button><button class="dv-btn" id="zr-r" type="button">Load again</button></div>
      <div class="dv-meter"><span>Minutes since washing out</span><b id="zr-m">0</b></div>
      <div class="dv-meter"><span>Levocetirizine still bound</span><b id="zr-l">100%</b><i><u id="zr-lB" ${bg(C.cet)}></u></i></div>
      <div class="dv-meter"><span>${CMP[M.cmp][0]}: still bound</span><b id="zr-x">100%</b><i><u id="zr-xB" ${bg(M.cmp==='dex'?C.dex:M.cmp==='oh'?C.oh:C.cet)}></u></i></div>
      <p>${NOTE[M.cmp]}</p>
      <div class="dv-btns"><button class="dv-btn" id="zr-next" type="button">Zoom in · Brain's gate</button></div>
      <p class="dv-fine">Half-times from Gillard 2002, measured on human H1 receptors in the lab; the clock runs 10 minutes a second, and the three receptors on each side let go at the matching times. Church 2013 suggests levocetirizine's long effect on the flare is "presumably" due to this "trapping" on the receptor; that link is the authors' explanation, not something measured in skin. The pose in the pocket is a docking model (Shimamura 2011).</p>`;
  return {id:'receptor',label:'H1 receptor',size:'10 nm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic'},zoomFocus:{x:500,y:MY},
    prep(o){if(o?.mode&&o.mode!==M.mode){M.mode=o.mode;reset();}},
    card(){return `<h2>Holding the switch off</h2>
      <div class="dv-seg" role="radiogroup" aria-label="View"><button role="radio" data-zm="on" aria-checked="${M.mode==='on'}">Switching it on</button><button role="radio" data-zm="go" aria-checked="${M.mode==='go'}">Letting go</button></div>
      <div id="zr-body"></div>`;},
    bind(card,api){const body=card.querySelector('#zr-body');
      const render=()=>{body.innerHTML=M.mode==='on'?ON():GO();const q=s=>body.querySelector(s);
        q('#zr-next').onclick=()=>api.go('gate',{from:{x:500,y:MY}});
        if(M.mode==='on'){q('#zr-h').onclick=()=>addHist(14);const d=q('#zr-d');d.onclick=()=>{M.drug=!M.drug;d.classList.toggle('on',M.drug);d.setAttribute('aria-pressed',M.drug);};}
        else{q('#zr-w').onclick=()=>{if(S.min<300)S.run=true;};q('#zr-r').onclick=()=>reset();
          body.querySelectorAll('[data-zc]').forEach(b=>b.onclick=()=>{M.cmp=b.dataset.zc;reset();render();});}};
      card.querySelectorAll('[data-zm]').forEach(b=>b.onclick=()=>{if(M.mode===b.dataset.zm)return;M.mode=b.dataset.zm;reset();card.querySelectorAll('[data-zm]').forEach(y=>y.setAttribute('aria-checked',y===b));render();});
      render();},
    tap(p,api){for(const h of S.hist)if(Math.hypot(p.x-h.x,p.y-h.y)<22)return api.discover('hist');
      for(const d of S.drug)if(Math.hypot(p.x-d.x,p.y-d.y)<26)return api.discover('zy_cet');
      for(const r of S.rec)if(Math.abs(p.x-r.x)<42&&Math.abs(p.y-MY)<72)return api.discover(r.lig&&r.lig.k!=='hist'&&Math.abs(p.y-(MY-16))<26&&Math.abs(p.x-r.x)<16?'zy_cet':'zy_h1r');
      if(p.y>MY+60&&p.y<MY+120)return api.discover('zy_h1r');},
    draw,
  };
}

/* ---------------- level 3: a capillary in the brain, the gate */
function gateLevel(){
  const W0=120,L0=160,L1=270,W1=310,FY=430,RY=548,J=[360,640],PX=[240,470,560,780];
  const RX=Array.from({length:16},(_,i)=>182+i*42);
  // brain H1 receptor occupancy by [11C]doxepin PET after single doses in healthy volunteers; n: molecules drawn in the blood (illustrative)
  const DR={fexo:{l:'Fexofenadine 120 mg',occ:-.001,pgp:true,g:'fexo',n:8},levo:{l:'Levocetirizine 5 mg',occ:.081,pgp:true,g:'levo',n:6},cet10:{l:'Cetirizine 10 mg',occ:.126,pgp:true,g:'levo',n:8},
    cet20:{l:'Cetirizine 20 mg',occ:.252,pgp:true,g:'levo',n:14},diph:{l:'Diphenhydramine 30 mg',occ:.564,pgp:false,g:'diph',n:10},hyd:{l:'Hydroxyzine 30 mg',occ:.676,pgp:false,g:'hyd',n:10}};
  const NOTE={fexo:'Fexofenadine 120 mg: −0.1%, in effect none (Tashiro 2004). It is a particularly good cargo for the pump (Church 2013).',
    levo:'Levocetirizine, cetirizine\'s active half sold on its own: 8.1%, no different from fexofenadine 60 mg in the same study (Hiraoka 2015).',
    cet10:'The patient\'s dose: 12.6% (Tashiro 2009, five healthy men per dose). In the 2004 label\'s trials of people 12 and older, sleepiness was reported by 13.7% on 5 or 10 mg against 6.3% on placebo, and it rose with the dose: 6% on placebo, 11% at 5 mg, 14% at 10 mg.',
    cet20:'Double the dose, double the share: 25.2% (Tashiro 2009), and 26.0% in a second study, where 20 mg did worse than fexofenadine on some tasks (Tashiro 2004). That moves it into "less sedating", though people\'s own sleepiness ratings didn\'t track cetirizine\'s share at 10 or 20 mg (Tashiro 2009). No scans of higher doses were found.',
    diph:'Diphenhydramine 30 mg, an older antihistamine: 56.4% (Tashiro 2008).',
    hyd:'Hydroxyzine 30 mg, cetirizine\'s parent: 67.6%, and here the share tracked how sleepy people felt (Tashiro 2009).'};
  const who=k=>k==='fexo'?'h1':k==='diph'||k==='hyd'?'zy_old':'zy_cet';
  let S;
  const target=()=>{const D=DR[S.d],off=D.pgp&&!S.pgp;return Math.round(16*clamp(Math.max(0,D.occ)*(off?3:1)+(off&&S.d==='fexo'?.06:0),0,.9));};
  const newDrug=x=>({k:'drug',x,y:rand(L0+10,L1-10),v:rand(55,75),rot:rand(0,6)});
  function fillDrug(){S.blood=S.blood.filter(b=>b.k!=='drug');for(let i=0;i<DR[S.d].n;i++)S.blood.push(newDrug(rand(-300,1300)));}
  function reset(){S={d:'cet10',pgp:true,blood:[],tr:[],br:[],hist:[],rec:RX.map(x=>({x,lig:null,h:0})),pump:PX.map(()=>0)};
    for(let i=0;i<10;i++)S.blood.push({k:'rbc',x:rand(-300,1300),y:rand(L0+18,L1-18),v:rand(60,80)});
    for(let i=0;i<12;i++)S.blood.push({k:'alb',x:rand(-300,1300),y:rand(L0+12,L1-12),v:rand(50,70),cargo:i%3!==0});
    fillDrug();[...S.rec].sort(()=>Math.random()-.5).slice(0,target()).forEach(r=>r.lig={k:S.d,t:rand(3,9)});}
  reset();
  function setDrug(d){S.d=d;fillDrug();for(const r of S.rec)if(r.lig&&r.lig.k!==d)r.lig.t=Math.min(r.lig.t,rand(0,1.5));for(const m of S.br)if(m.k!==d)m.st='wander';}
  function step(dt){const D=DR[S.d],T=target();
    for(const b of S.blood){b.x+=b.v*dt;if(b.k==='drug'){b.y=clamp(b.y+rand(-40,40)*dt,L0+10,L1-10);b.rot+=dt;}if(b.x>1300)b.x-=1600;}
    S.pump=S.pump.map(g=>Math.max(0,g-dt*1.5));
    const bound=S.rec.filter(r=>r.lig&&r.lig.k===S.d).length,coming=S.tr.filter(m=>!m.back&&!m.wander).length+S.br.filter(m=>m.st==='seek').length;
    const take=()=>{const c=S.blood.filter(b=>b.k==='drug'&&b.x>180&&b.x<820);if(!c.length)return null;const b=c[Math.floor(Math.random()*c.length)];S.blood.splice(S.blood.indexOf(b),1);return b;};
    // what gets through is set to fill the share the scans measured; a pump cargo's other tries are thrown back
    if(bound+coming<T&&Math.random()<dt*4){const b=take();if(b)S.tr.push({k:S.d,x:b.x,y:b.y,ph:0});}
    if(D.pgp&&S.pgp&&Math.random()<dt*1.4){const b=take();if(b)S.tr.push({k:S.d,x:b.x,y:b.y,ph:0,back:true,pi:PX.reduce((a,p,i)=>Math.abs(p-b.x)<Math.abs(PX[a]-b.x)?i:a,0)});}
    if(!D.pgp&&Math.random()<dt*.9){const b=take();if(b)S.tr.push({k:S.d,x:b.x,y:b.y,ph:0,wander:true});}
    for(const m of S.tr){m.ph+=dt;
      if(m.back){if(m.ph<.4){m.x=lerp(m.x,PX[m.pi],1-Math.exp(-dt*8));m.y=lerp(m.y,L1+10,1-Math.exp(-dt*8));}else{S.pump[m.pi]=1;m.y-=dt*150;if(m.y<L1-26){m.done=true;S.blood.push({...newDrug(m.x),y:m.y});}}}
      else if(m.ph<.35)m.y=lerp(m.y,L1,1-Math.exp(-dt*10));
      else{m.y+=dt*(DR[m.k].pgp?55:120);if(m.y>W1+4){m.done=true;S.br.push({k:m.k,x:m.x,y:W1+6,st:m.wander?'wander':'seek',l:m.wander?2.5:9,a:Math.PI/2});S.blood.push(newDrug(rand(-500,-300)));}}}
    S.tr=S.tr.filter(m=>!m.done);
    for(const m of S.br){
      if(m.st==='seek'){const fr=S.rec.filter(r=>!r.lig);if(!fr.length||m.k!==S.d){m.st='wander';m.l=2;continue;}if(!m.r||m.r.lig)m.r=fr.reduce((a,r)=>Math.abs(r.x-m.x)<Math.abs(a.x-m.x)?r:a);
        const dx=m.r.x-m.x,dy=RY-14-m.y,d=Math.hypot(dx,dy);if(d<6){m.r.lig={k:m.k,t:rand(4,9)};m.done=true;}else{m.x+=dx/d*150*dt;m.y+=dy/d*150*dt;}}
      else{m.a+=rand(-1,1)*dt*3;m.x+=Math.cos(m.a)*50*dt;m.y=clamp(m.y+Math.sin(m.a)*50*dt,W1+6,690);m.l-=dt;if(m.l<=0)m.done=true;}}
    S.br=S.br.filter(m=>!m.done);
    for(const r of S.rec){r.h=Math.max(0,r.h-dt);if(r.lig){r.lig.t-=dt;if(r.lig.t<=0){S.br.push({k:r.lig.k,x:r.x,y:RY-16,st:'wander',l:2,a:-Math.PI/2});r.lig=null;}}}
    // the brain's own histamine, from the fibre to any free receptor
    if(Math.random()<dt*5)S.hist.push({x:160+Math.floor(rand(0,9))*85,y:FY+6,vy:rand(30,60),l:5});
    for(const h of S.hist){h.x+=rand(-30,30)*dt;h.y+=h.vy*dt;h.l-=dt;if(h.y>=RY-8){const r=S.rec.find(r=>Math.abs(r.x-h.x)<14);if(r&&!r.lig)r.h=.7;h.l=0;}}
    S.hist=S.hist.filter(h=>h.l>0);}
  function draw(x,dt,t,api){step(dt);const D=DR[S.d];
    x.fillStyle='#0C0E15';x.fillRect(-400,-300,1800,1300);
    x.strokeStyle='rgba(150,140,200,.07)';x.lineWidth=2;for(let i=0;i<60;i++){const sx=(i*173)%1300-150,sy=(i*97)%760-30;if(sy>W0-20&&sy<W1+20)continue;x.beginPath();x.moveTo(sx,sy);x.bezierCurveTo(sx+30,sy-14,sx+60,sy+14,sx+90,sy);x.stroke();}
    // the capillary: two walls of barrier cells around the blood, sealed by tight junctions
    x.fillStyle='rgba(194,52,71,.14)';x.fillRect(-400,L0,1800,L1-L0);
    for(const [a,b] of [[W0,L0],[L1,W1]]){x.fillStyle=rgba(C.endo,.3);x.fillRect(-400,a,1800,b-a);x.strokeStyle=C.endo;x.lineWidth=2;x.beginPath();x.moveTo(-400,a);x.lineTo(1400,a);x.moveTo(-400,b);x.lineTo(1400,b);x.stroke();
      x.globalAlpha=.45;for(const nx of [180,500,820])nucleus(x,nx,(a+b)/2,34,7);x.globalAlpha=1;
      for(const jx of J){x.strokeStyle='rgba(10,12,20,.9)';x.lineWidth=3;x.beginPath();x.moveTo(jx,a);x.lineTo(jx,b);x.stroke();x.strokeStyle='#E6DEFF';x.lineWidth=2;for(let k=1;k<5;k++){const y=a+(b-a)*k/5;x.beginPath();x.moveTo(jx-6,y);x.lineTo(jx+6,y);x.stroke();}}}
    // the rest of the neurovascular unit on the brain side: basement membrane, a pericyte inside it, astrocyte end-feet around it (Abbott 2010)
    x.strokeStyle='rgba(200,190,230,.45)';x.lineWidth=1.5;x.beginPath();x.moveTo(-400,W1+3);x.lineTo(1400,W1+3);x.stroke();
    x.fillStyle='rgba(150,160,175,.22)';x.strokeStyle='rgba(170,180,195,.55)';x.lineWidth=1.5;for(const ex of [170,320,470]){x.beginPath();x.ellipse(ex,W1+5,62,15,0,0,Math.PI);x.fill();x.stroke();x.beginPath();x.moveTo(ex+6,W1+19);x.quadraticCurveTo(ex+14,W1+40,ex+4,W1+62);x.stroke();}
    x.fillStyle='rgba(205,150,190,.3)';x.strokeStyle='rgba(205,150,190,.7)';x.beginPath();x.ellipse(820,W1+9,58,6,0,0,TAU);x.fill();x.stroke();x.globalAlpha=.6;nucleus(x,820,W1+9,14,4);x.globalAlpha=1;
    PX.forEach((px,i)=>{pgpG(x,px,L1+4,1,S.pgp?S.pump[i]:0,!S.pgp);pgpG(x,px+40,L0-4,1,0,!S.pgp);});
    for(const b of S.blood){if(b.x<-60||b.x>1060)continue;
      if(b.k==='rbc'){x.fillStyle=C.rbc;x.beginPath();x.ellipse(b.x,b.y,17,7,0,0,TAU);x.fill();x.fillStyle='rgba(120,20,36,.6)';x.beginPath();x.ellipse(b.x,b.y,8,3,0,0,TAU);x.fill();}
      else if(b.k==='alb'){x.fillStyle=rgba(C.alb,.75);x.beginPath();x.ellipse(b.x,b.y,8,6,.4,0,TAU);x.fill();if(b.cargo&&D.g==='levo'&&S.d!=='levo'){x.fillStyle=C.cet;x.beginPath();x.arc(b.x+7,b.y-5,2.8,0,TAU);x.fill();}}
      else drugG(x,D.g,b.x,b.y,.42,b.rot);}
    for(const m of S.tr)drugG(x,DR[m.k].g,m.x,m.y,.42,Math.PI/2);
    // the histamine fibre from the hypothalamus, and a neuron's H1 receptors below it
    x.strokeStyle=C.gq;x.lineWidth=3;x.beginPath();for(let xx=-300;xx<=1300;xx+=20)xx===-300?x.moveTo(xx,FY+Math.sin(xx*.02)*6):x.lineTo(xx,FY+Math.sin(xx*.02)*6);x.stroke();
    for(let k=0;k<9;k++){const bx=160+k*85;x.fillStyle=rgba(C.gq,.6);x.beginPath();x.ellipse(bx,FY+Math.sin(bx*.02)*6,9,6,0,0,TAU);x.fill();}
    x.fillStyle=HIST();for(const h of S.hist){x.beginPath();x.arc(h.x,h.y,2.2,0,TAU);x.fill();}
    x.fillStyle=rgba(C.neu,.16);x.strokeStyle=C.neu;x.lineWidth=2.5;x.beginPath();x.roundRect(-300,RY,1600,48,24);x.fill();x.stroke();
    for(const r of S.rec){if(r.h>0){x.save();x.globalCompositeOperation='lighter';glow(x,r.x,RY-6,16,'rgba(255,255,255,.5)');x.restore();}
      x.strokeStyle=C.h1;x.lineWidth=3.5;x.beginPath();x.arc(r.x,RY-8,8,Math.PI*.05,Math.PI*.95);x.stroke();if(r.lig)drugG(x,DR[r.lig.k].g,r.x,RY-16,.36,-Math.PI/2);}
    for(const m of S.br){x.globalAlpha=m.st==='wander'?clamp(m.l,0,1):1;drugG(x,DR[m.k].g,m.x,m.y,.42,m.a);x.globalAlpha=1;}
    label(x,'A CAPILLARY IN THE BRAIN',140,W0-14);label(x,'BLOOD',150,L0+26,'left',true);label(x,'TIGHT JUNCTION',J[1]+12,W1+20);label(x,'ASTROCYTE END-FEET',140,W1+44,'left',true);label(x,'PERICYTE',878,W1+30,'right',true);label(x,'P-GP PUMP',PX[0]+16,L1-12,'left',true);
    label(x,'HISTAMINE FIBRE, FROM THE HYPOTHALAMUS',140,FY-20);label(x,'A NEURON\'S H1 RECEPTORS',140,RY+76);label(x,`${S.rec.filter(r=>r.lig).length} OF 16 FILLED`,860,RY+76,'right');
  }
  return {id:'gate',label:'Brain\'s gate',size:'20 µm',get fit(){return innerWidth<=860?'cover':'contain';},bar:{units:0,label:'schematic, not to scale'},zoomFocus:{x:500,y:L1},
    card(){return `<h2>The brain's gate</h2>
      <p>The brain has its own histamine. Nerve cells in the hypothalamus send fibres almost everywhere, and their histamine is one of the main signals that keep us awake (Yanai 2007). An antihistamine that reaches the brain's H1 receptors can make people drowsy. In the way stand the cells lining the brain's capillaries, sealed to one another by tight junctions and fitted with pumps that throw molecules back into the blood (Abbott 2010).</p>
      <p>Cetirizine carries a plus and a minus charge at once, dissolves poorly in fat, and rides mostly on blood proteins (Pagliara 1998; label). It crosses slowly, and in mice and cell lines the pump P-glycoprotein (orange) throws much of what gets in back out (Polli 2003; Chen 2003).</p>
      <p>The share of receptors filled on the neuron matches human brain scans.</p>
      <div class="dv-seg" role="radiogroup" aria-label="Medicine and dose">${Object.entries(DR).map(([k,v])=>`<button role="radio" data-zd="${k}" aria-checked="${S.d===k}">${v.l}</button>`).join('')}</div>
      <div class="dv-meter"><span>Brain H1 receptors filled (PET)</span><b id="zg-o"></b><i><u id="zg-oB"></u></i></div>
      <div class="dv-meter"><span>By that measure</span><b id="zg-c"></b></div>
      <p id="zg-n"></p>
      <div class="dv-btns"><button class="dv-btn${S.pgp?' on':''}" id="zg-p" type="button" aria-pressed="${S.pgp}">P-gp pumps working</button></div>
      <p id="zg-pn" ${S.pgp?'hidden':''}>In mice bred without P-glycoprotein, cetirizine's brain-to-blood ratio was 4 times higher in one study and 2 to 9 times in another, while hydroxyzine's and diphenhydramine's didn't change (Chen 2003; Polli 2003). The evidence for the pump comes from mice and cell lines; in people, what we have is the scans. The extra filling drawn here is illustrative.</p>
      <p class="dv-fine">Shares are from [11C]doxepin PET after single doses in small groups of healthy volunteers, 5 to 12 people per study (Tashiro 2004, 2008, 2009; Hiraoka 2015). The three classes are a convention: at 20% or less, no impaired performance showed in tests done alongside the scans (Kawauchi 2019). The crossing and pumping are drawn for illustration, not to scale.</p>`;},
    bind(card,api){const q=s=>card.querySelector(s);
      const sync=()=>{const D=DR[S.d],off=D.pgp&&!S.pgp;q('#zg-o').textContent=off?'not measured':D.occ<0?'−0.1%':(D.occ*100).toFixed(1)+'%';
        const u=q('#zg-oB');u.style.width=(off?0:Math.max(0,D.occ)*100)+'%';u.style.background=cc(D.g==='fexo'?C.fexo:D.g==='levo'?C.cet:C.old);
        q('#zg-c').textContent=off?'—':D.occ<.2?'non-sedating (under 20%)':D.occ<.5?'less sedating (20–50%)':'sedating (50% or more)';q('#zg-n').textContent=NOTE[S.d];};
      card.querySelectorAll('[data-zd]').forEach(b=>b.onclick=()=>{setDrug(b.dataset.zd);card.querySelectorAll('[data-zd]').forEach(y=>y.setAttribute('aria-checked',y===b));sync();});
      const p=q('#zg-p');p.onclick=()=>{S.pgp=!S.pgp;p.classList.toggle('on',S.pgp);p.setAttribute('aria-pressed',S.pgp);q('#zg-pn').hidden=S.pgp;sync();};sync();},
    tap(p,api){const hit=m=>Math.hypot(p.x-m.x,p.y-m.y)<22;
      for(const m of [...S.br,...S.tr])if(hit(m))return api.discover(who(m.k));
      for(const r of S.rec)if(r.lig&&Math.hypot(p.x-r.x,p.y-(RY-16))<16)return api.discover(who(r.lig.k));
      if(p.y>=RY-24&&p.y<=RY+50)return api.discover('zy_h1r');
      for(const b of S.blood)if(b.k==='drug'&&hit(b))return api.discover(who(S.d));
      if(Math.abs(p.y-FY)<20)return api.discover('hist');
      for(const px of PX)if(Math.abs(p.x-px)<22&&Math.abs(p.y-L1-4)<20)return api.discover('zy_pgp');
      if((p.y>=W0&&p.y<=L0)||(p.y>=L1&&p.y<=W1))return api.discover('zy_bbb');},
    draw,
  };
}

export const DIVE={color:'#F29A55',top:{label:'Forearm',size:'10 cm'},
  target:({A})=>{const H=A.hand.right;return H.wrist.clone().lerp(H.elbow,.5).add(new A.THREE.Vector3(0,0,.02));},view:{dist:.14,azim:-20,elev:10},
  text:'Follow the patient\'s daily Zyrtec (cetirizine) to where it works: the label\'s histamine skin test on her forearm at chosen hours after a dose, then the H1 receptor it holds off and how slowly it lets go, then the gate that keeps most of it out of the brain.',
  steps:[['Skin, 3 cm.','Prick with histamine at chosen hours after a 10 mg dose and watch the wheal, flare and itch shrink; then see whether that holds after weeks of daily use.'],
    ['H1 receptor, 10 nm.','Histamine switches it on; cetirizine holds it off. Wash the drug out and see which version lets go first.'],
    ['The brain\'s gate, 20 µm.','A capillary in the brain and its pump. Compare how much of the brain\'s H1 receptors six antihistamine doses fill in PET scans.']],
  also:[{dive:'mcas',level:'skin',label:'MCAS · Skin'},{dive:'mcas',level:'mast',label:'MCAS · Mast cell'}],
  refs:['lbl_zyrtec2004','zuberbier2026','thangam2018','schmelz1997','church2013','watson1989','rihoux1989','kruszewski2005','klos2007','long1985','taylor1985','nielsen2001','wao2011',
    'xia2021','leurs2002','bakker2001','wang2024h1','shimamura2011','gillard2002','weiler2019',
    'yanai2007','abbott2010','pagliara1998','polli2003','chen2003','tashiro2004','tashiro2008','tashiro2009','hiraoka2015','kawauchi2019'],
  make:()=>({levels:[skinLevel(),receptorLevel(),gateLevel()],guide:GUIDE_Z}),
};
