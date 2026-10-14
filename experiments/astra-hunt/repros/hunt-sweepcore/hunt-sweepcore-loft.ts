import { createBuilder } from '../../../../src/builder';
const b=createBuilder({name:'loft'});b.joint('root',{at:[0,0,0]});
for(const [label,stations] of [
 ['duplicate-start',[{at:[0,0,0],w:.2,h:.2},{at:[0,0,0],w:.1,h:.1},{at:[0,0,1],w:.05,h:.05}]],
 ['duplicate-middle',[{at:[0,0,0],w:.2,h:.2},{at:[0,0,.5],w:.1,h:.1},{at:[0,0,.5],w:.08,h:.08},{at:[0,0,1],w:.05,h:.05}]],
 ['all-same',[{at:[0,0,0],w:.2,h:.2},{at:[0,0,0],w:.1,h:.1}]],
] as const){try{const sw=b.loft(stations,{color:'#fff'});let nf=0;for(const m of sw.meshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++)if(![p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite))nf++;}console.log(label,{meshes:sw.meshes.length,nf,at:sw.at(.5).at.toArray(),radius:sw.at(.5).radius});}catch(e){console.log(label,'THROW',String(e));}}
