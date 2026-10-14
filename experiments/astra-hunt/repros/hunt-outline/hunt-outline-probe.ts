import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import type { Part } from '../../../../src/parts';

function dump(name: string, part: Part) {
  const g = part.mesh.geometry;
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const idx = g.index;
  const vertices: [number, number, number][] = [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.count; i++) {
    const q: [number, number, number] = [pos.getX(i), pos.getY(i), pos.getZ(i)];
    vertices.push(q);
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], q[k]);
      max[k] = Math.max(max[k], q[k]);
    }
  }
  const indices = idx ? Array.from(idx.array) : Array.from({ length: pos.count }, (_, i) => i);
  let degenerate = 0;
  let badNormals = 0;
  let normalDot = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const a = new THREE.Vector3(...vertices[indices[i]]);
    const b = new THREE.Vector3(...vertices[indices[i + 1]]);
    const c = new THREE.Vector3(...vertices[indices[i + 2]]);
    const cross = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (cross.lengthSq() < 1e-14) degenerate++;
    const n = new THREE.Vector3(nor.getX(indices[i]), nor.getY(indices[i]), nor.getZ(indices[i]));
    if (!Number.isFinite(n.x) || !Number.isFinite(n.y) || !Number.isFinite(n.z)) badNormals++;
    normalDot += cross.dot(n);
  }
  console.log(name, { vertices: pos.count, triangles: indices.length / 3, bbox: min.map((v, i) => [v, max[i]]), degenerate, badNormals, normalDot });
  console.log('firstpos', vertices.slice(0, 8), 'firstidx', indices.slice(0, 12));
}
function tryit(name: string, fn: () => Part) {
  try { dump(name, fn()); }
  catch (error) { console.log(name, 'ERROR', String(error)); }
}

const b = createBuilder({ name: 'probe' }); b.joint('root', { at: [0, 0, 0] });
const base = { at: [0, 0, 0] as const, color: '#fff', thickness: 0.2 };
const cc = [[0, 0], [1, 0], [1, 1], [0, 1]];
const cw = [...cc].reverse();
tryit('ccw', () => b.extrude(cc, base));
tryit('cw', () => b.extrude(cw, base));
tryit('taper', () => b.extrude(cc, { ...base, thickness: [0.1, 0.3], bevel: 0.04 }));
tryit('bevel thin', () => b.extrude([[0, 0], [10, 0], [10, .01], [0, .01]], { ...base, thickness: .01, bevel: 1 }));
for (const smoothing of [1, 2, 3]) tryit('smooth' + smoothing, () => b.extrude([[0, 0], [2, 0], [2, 2], [0, 2]], { ...base, smoothing }));
tryit('sharp smooth', () => b.extrude([[0, 0], [2, 0, 'sharp'], [2, 2], [0, 2]], { ...base, smoothing: 1 }));
for (const segments of [3, 4, 6, 11, 12]) tryit('lathe' + segments, () => b.lathe([[0, 0], [1, 0], [1, 1], [0, 1]], { at: [0, 0, 0], color: '#fff', segments }));
tryit('plane', () => b.extrude(cc, { ...base, x: [1, 0, 0], y: [0, 0, 1] }));
tryit('bad parallel', () => b.extrude(cc, { ...base, x: [0, 1, 0], y: [0, 2, 0] }));
for (const points of [ [[0, 0], [2, 2], [0, 2], [2, 0]], [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0.000001]] ]) tryit('cross ' + JSON.stringify(points), () => b.extrude(points, base));
