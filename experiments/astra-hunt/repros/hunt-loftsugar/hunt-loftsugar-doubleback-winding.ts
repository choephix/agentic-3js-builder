import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';
import { Vector3 } from 'three';
for (const [label, stations] of Object.entries({
  'straight':[{at:[0,0,0],w:1,h:1},{at:[0,0,1],w:1,h:1},{at:[0,0,2],w:1,h:1}],
  'doubleback':[{at:[0,0,0],w:1,h:1},{at:[0,0,2],w:1,h:1},{at:[0,0,0],w:1,h:1}],
} satisfies Record<string,Station[]>)) {
 const b=createBuilder({name:label,detail:1});b.joint('root',{at:[0,0,0]});const s=b.loft(stations,{color:'#fff'});let wrong=0,total=0;for(const m of s.meshes){const p=m.geometry.getAttribute('position');const n=m.geometry.getAttribute('normal');const ix=m.geometry.index?.array;if(!ix)continue;for(let i=0;i<ix.length;i+=3){const a=Number(ix[i]),bb=Number(ix[i+1]),c=Number(ix[i+2]);const pa=new Vector3(p.getX(a),p.getY(a),p.getZ(a));const pb=new Vector3(p.getX(bb),p.getY(bb),p.getZ(bb));const pc=new Vector3(p.getX(c),p.getY(c),p.getZ(c));const tri=pb.clone().sub(pa).cross(pc.clone().sub(pa));const center=pa.clone().add(pb).add(pc).multiplyScalar(1/3); const radial=new Vector3(center.x,center.y,0); if(tri.dot(radial)<0)wrong++; total++;}}console.log(label,{total,wrong});
}
