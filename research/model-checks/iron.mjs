const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function sim({f0=25,mbl=60,sup='none',dose=60,days=365,stopAt=1e9,every=1}){
  let ferr=f0,Hb=13-clamp((12-f0)/7,0,1)*.6;let prev=false,abs=0,nd=0,abs30=0,nd30=0;const out={};
  for(let d=0;d<=days;d++){
    if([30,91,180,365].includes(d))out[d]=+ferr.toFixed(1);
    let stores=ferr*8;const perMl=Hb*0.0347;
    const loss=1.0+(d%28<5?mbl/5*perMl:0);
    let gain=0.9+1.1*(1-clamp(ferr/50,0,1));
    const take=d<stopAt&&(sup==='daily'||(sup==='alt'&&d%2===0));
    if(take){let f=0.22*clamp(Math.pow(20/Math.max(ferr,5),2),0.01,1.3)*Math.pow(60/dose,0.4);if(prev)f*=0.75;gain+=dose*f;abs+=dose*f;nd++;if(d<30){abs30+=dose*f;nd30++;}}
    prev=take;stores+=gain-loss;
    if(Hb<13&&stores>40){const use=Math.min(0.05*156,stores-40);Hb+=use/156;stores-=use;}
    if(stores<40){Hb-=(40-stores)/156;stores=40;}
    ferr=stores/8;
  }
  return {out,per:nd?abs/nd:0,per30:nd30?abs30/nd30:0,Hb:Hb.toFixed(1)};
}
console.log('vonS 100mg daily 90d from 18, mbl40', JSON.stringify(sim({f0:18,mbl:40,sup:'daily',dose:100,stopAt:90})));
console.log('vonS alt 200 mg', JSON.stringify(sim({f0:18,mbl:40,sup:'alt',dose:200,stopAt:180})));
console.log('25 daily 60', JSON.stringify(sim({f0:25,sup:'daily'})));
console.log('25 alt 60', JSON.stringify(sim({f0:25,sup:'alt'})));
console.log('25 none 40mL', JSON.stringify(sim({f0:25,mbl:40})));
console.log('25 none 100mL', JSON.stringify(sim({f0:25,mbl:100})));
console.log('10 daily', JSON.stringify(sim({f0:10,sup:'daily'})));
