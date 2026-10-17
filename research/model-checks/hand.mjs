const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sig=m=>{const e=x=>1/(1+Math.exp(-(x-2)/.6));return (e(m)-e(0))/(1-e(0));};
function model(months,ster,next){const sterOn=ster&&months<3;let I=(1-0.4*sig(months))*(sterOn?.55:1);if(next)I*=.15+.85*(1-sig(months));return {I:I.toFixed(2),D:Math.round(10+140*I)};}
for(const a of [[0,0,0],[.5,0,0],[1,0,0],[2,0,0],[3,0,0],[6,0,0],[1,1,0],[6,1,0],[6,0,1],[3,0,1],[0,0,1]])console.log(a.join(','),JSON.stringify(model(...a)));
const fN=t=>1-Math.pow(1-Math.exp(-1.518*t),5.29);console.log('gastric',[.5,1,2,4].map(t=>(fN(t)*100).toFixed(1)));
