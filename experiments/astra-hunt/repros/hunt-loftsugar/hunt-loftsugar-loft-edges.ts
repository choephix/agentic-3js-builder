import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';

function inspect(label: string, stations: Station[]) {
  const b = createBuilder({ name: label, detail: 1 });
  b.joint('root', { at: [0, 0, 0] });
  try {
    const s = b.loft(stations, { color: '#fff' });
    const meshes = s.meshes;
    let positions: number[] = [], indices: number[] = [];
    for (const m of meshes) {
      positions.push(...(m.geometry.getAttribute('position')?.array as ArrayLike<number>));
      indices.push(...(m.geometry.index?.array as ArrayLike<number> ?? []));
    }
    const finite = positions.every(Number.isFinite);
    const min = positions.length ? Math.min(...positions) : NaN;
    const max = positions.length ? Math.max(...positions) : NaN;
    console.log(label, {meshes: meshes.length, verts: positions.length/3, tris: indices.length/3, finite, min, max, first: positions.slice(0, 12)});
  } catch (e) { console.log(label, 'THREW', String(e)); }
}
inspect('two', [{at:[0,0,0],w:2,h:1},{at:[0,0,2],w:1,h:0.5}]);
inspect('one', [{at:[0,0,0],w:2,h:1}]);
inspect('zero', [{at:[0,0,0],w:0,h:0},{at:[0,0,2],w:0,h:0}]);
inspect('coincident', [{at:[0,0,0],w:2,h:1},{at:[0,0,0],w:1,h:0.5}]);
inspect('doubleback', [{at:[0,0,0],w:1,h:1},{at:[0,0,2],w:1,h:1},{at:[0,0,0],w:1,h:1}]);
inspect('ellipse', [{at:[0,0,0],w:2,h:1},{at:[0,0,2],w:2,h:0.5}]);
