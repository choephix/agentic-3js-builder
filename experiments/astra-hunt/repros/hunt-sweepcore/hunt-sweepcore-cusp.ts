import { createBuilder } from '../../../../src/builder';
import { polyline } from '../../../../src/path';
const path = polyline([[0, 0, 0], [0, 0, 1], [0, 0, 0]]);
console.log('path',path.length,path.corners(0,1).map(c=>({t:c.t,angle:c.angle,tin:c.tin.toArray(),tout:c.tout.toArray()})));
const b = createBuilder({ name: 'cusp' }); b.joint('root', { at: [0, 0, 0] });
const sweep = b.sweep(path, 0.1, { color: '#fff' });
for(const t of [0.49,0.499,0.5,0.501,0.51]){const x=sweep.at(t); console.log('at',t,x.at.toArray(),x.tangent.toArray(),x.n.toArray());}
let nonFinite=0;for(const mesh of sweep.meshes){const p=mesh.geometry.getAttribute('position');for(let i=0;i<p.count;i++)if(![p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite))nonFinite++;}console.log({meshes:sweep.meshes.length,nonFinite});
