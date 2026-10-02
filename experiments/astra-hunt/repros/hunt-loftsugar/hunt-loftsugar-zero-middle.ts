import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';
for (const [label, stations] of Object.entries({
  'zero-start': [{at:[0,0,0],w:0,h:0},{at:[0,0,1],w:1,h:1},{at:[0,0,2],w:1,h:1}],
  'zero-mid': [{at:[0,0,0],w:1,h:1},{at:[0,0,1],w:0,h:0},{at:[0,0,2],w:1,h:1}],
  'zero-end': [{at:[0,0,0],w:1,h:1},{at:[0,0,1],w:1,h:1},{at:[0,0,2],w:0,h:0}],
  'zero-height': [{at:[0,0,0],w:1,h:0},{at:[0,0,2],w:1,h:0}],
} satisfies Record<string,Station[]>)) {
 const b=createBuilder({name:label,detail:1}); b.joint('root',{at:[0,0,0]});
 try {const s=b.loft(stations,{color:'#fff'}); const tris=s.meshes.reduce((n,m)=>n+(m.geometry.index?.count ?? 0)/3,0); console.log(label,{meshes:s.meshes.length,tris});} catch(e){console.log(label,'THREW',String(e));}
}
