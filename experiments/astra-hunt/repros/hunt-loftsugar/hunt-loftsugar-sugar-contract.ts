import { Builder, createBuilder } from '../../../../src/builder';
import type { Sweep } from '../../../../src/sweep';

function bounds(s: Sweep) {
  const p: number[] = [];
  for (const m of s.meshes) p.push(...Array.from(m.geometry.getAttribute('position').array, Number));
  const out = { count: p.length / 3, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (let i = 0; i < p.length; i += 3) for (let j = 0; j < 3; j++) { out.min[j] = Math.min(out.min[j], p[i+j]); out.max[j] = Math.max(out.max[j], p[i+j]); }
  return out;
}
function run(label: string, make: (b: Builder) => Sweep) {
 const b = createBuilder({name:label, detail:1}); b.joint('root',{at:[0,0,0]});
 try { const s = make(b); console.log(label, bounds(s)); } catch(e) { console.log(label,'THREW',String(e)); }
}
run('rod-z', b=>b.rod([0,0,0],[0,0,2],0.2,{color:'#fff'}));
run('capsule-z', b=>b.capsule([0,0,0],[0,0,2],0.2,{color:'#fff'}));
run('frustum-z', b=>b.frustumBox([0,0,0],[0,0,2],[2,1],[1,0.5],{color:'#fff'}));
run('frustum-y', b=>b.frustumBox([0,0,0],[0,2,0],[2,1],[1,0.5],{color:'#fff'}));
run('spike-z', b=>b.spike([0,0,0],[0,0,1],2,0.2,{color:'#fff'}));
run('spike-tip', b=>b.spike([0,0,0],[0,0,2],null,0.2,{color:'#fff'}));
run('rod-reverse', b=>b.rod([0,0,2],[0,0,0],0.2,{color:'#fff'}));
