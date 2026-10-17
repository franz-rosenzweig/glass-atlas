const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function model(rem,dose,w,fabs=.75){const E=rem/100,Dss=dose*fabs/75;let tsh=1.8,ft4,ft4lag;
 for(let k=0;k<8;k++){const Ee=E*Math.pow(clamp(tsh/1.8,.1,1),.3);
  ft4lag=1.25*(Ee+Dss*(1-Math.pow(.5,Math.max(w-1.2,0))));ft4=1.25*(Ee+Dss*(1-Math.pow(.5,Math.max(w,0))));
  const n=clamp(1.8*Math.pow(10,(1.25-ft4lag)/0.5),0.01,100);tsh=Math.sqrt(tsh*n);}
 return [ft4.toFixed(2),tsh.toFixed(2)];}
for(const a of [[35,75,8],[5,95,8],[100,75,8],[100,0,8],[35,0,8],[35,75,0],[35,75,2],[35,75,4],[35,75,6],[35,75,8,.45],[35,75,8,.64]])console.log(a.join(','),model(...a));
