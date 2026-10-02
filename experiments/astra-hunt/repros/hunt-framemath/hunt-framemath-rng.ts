import {rng} from '../../../../src/math';
for(const seed of [0,1,42,123456]) {const r=rng(seed); let sum=0,min=1,max=0;const bins=Array(10).fill(0);for(let i=0;i<100000;i++){const x=r();sum+=x;min=Math.min(min,x);max=Math.max(max,x);bins[Math.min(9,Math.floor(x*10))]++;}console.log(seed,'mean',sum/100000,'min',min,'max',max,'bins',bins.join(','));}
const a=rng(42),b=rng(42); console.log('same',Array.from({length:8},()=>a()).every((v)=>v===b()));
