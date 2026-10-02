import { createBuilder } from '../../../../src/builder';
const b = createBuilder({name:'radius-edge'}); b.joint('root',{at:[0,0,0]});
for (const [label,r] of [['empty',[]],['negative',[-.2,-.1]],['zero',[0,0]],['nan', [NaN,.1]], ['huge',[1e300,1e300]]] as Array<[string, readonly number[]]>) {
 try {
  const sw=b.sweep([[0,0,0],[0,0,1]],r,{color:'#fff'});
  let finite=true, badTris=0; for(const m of sw.meshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++)finite &&= [p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite); const idx=m.geometry.getIndex(); if(idx) for(let i=0;i<idx.count;i+=3){const a=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)];if(new Set(a).size<3)badTris++;}}
  console.log(label,{meshes:sw.meshes.length,finite,badTris,at:sw.at(.5).at.toArray(),radius:sw.at(.5).radius});
 } catch(e) {console.log(label,'THROW',String(e));}
}
