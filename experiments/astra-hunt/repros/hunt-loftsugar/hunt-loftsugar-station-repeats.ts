import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';

const cases: Record<string, Station[]> = {
  'A-A-B': [{at:[0,0,0],w:1,h:1},{at:[0,0,0],w:2,h:2},{at:[0,0,2],w:1,h:1}],
  'A-B-B': [{at:[0,0,0],w:1,h:1},{at:[0,0,2],w:2,h:2},{at:[0,0,2],w:1,h:1}],
  'A-B-A-A': [{at:[0,0,0],w:1,h:1},{at:[0,0,2],w:2,h:2},{at:[0,0,0],w:1,h:1},{at:[0,0,0],w:2,h:2}],
  'tiny': [{at:[0,0,0],w:1,h:1},{at:[0,0,1e-10],w:1,h:1},{at:[0,0,2],w:1,h:1}],
};
for (const [label, stations] of Object.entries(cases)) {
 const b=createBuilder({name:label, detail:1}); b.joint('root',{at:[0,0,0]});
 try {const s=b.loft(stations,{color:'#fff'}); const vals=s.meshes.flatMap(m=>Array.from(m.geometry.getAttribute('position').array, Number)); console.log(label,{meshes:s.meshes.length,verts:vals.length/3,finite:vals.every(Number.isFinite),min:Math.min(...vals),max:Math.max(...vals)});} catch(e) {console.log(label,'THREW',String(e));}
}
