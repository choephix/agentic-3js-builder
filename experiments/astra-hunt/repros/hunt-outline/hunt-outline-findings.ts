import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import type { Part } from '../../../../src/parts';

function triangles(part: Part) {
  const g = part.mesh.geometry;
  const pos = g.getAttribute('position');
  const idx = g.index ? Array.from(g.index.array) : Array.from({ length: pos.count }, (_, i) => i);
  const p: THREE.Vector3[] = [];
  for (let i = 0; i < pos.count; i++) p.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
  let degenerate = 0;
  let minArea = Infinity;
  for (let i = 0; i < idx.length; i += 3) {
    const area2 = new THREE.Vector3().subVectors(p[idx[i + 1]], p[idx[i]]).cross(new THREE.Vector3().subVectors(p[idx[i + 2]], p[idx[i]])).length();
    minArea = Math.min(minArea, area2);
    if (area2 < 1e-10) degenerate++;
  }
  return { vertices: pos.count, triangles: idx.length / 3, degenerate, minArea };
}
function buildExtrude(points: readonly (readonly [number, number] | readonly [number, number, 'sharp'])[], options: Record<string, unknown> = {}) {
  const b = createBuilder({ name: 'findings' });
  b.joint('root', { at: [0, 0, 0] });
  return b.extrude(points, { at: [0, 0, 0], color: '#fff', thickness: 0.2, ...options } as Parameters<typeof b.extrude>[1]);
}
function buildLathe(points: readonly (readonly [number, number] | readonly [number, number, 'sharp'])[], segments: number) {
  const b = createBuilder({ name: 'findings' });
  b.joint('root', { at: [0, 0, 0] });
  return b.lathe(points, { at: [0, 0, 0], color: '#fff', segments });
}
function report(name: string, fn: () => Part) {
  try { console.log(name, triangles(fn())); }
  catch (error) { console.log(name, 'ERROR', String(error)); }
}

report('thin bevel requested 1 on width .01, thickness .01', () => buildExtrude([[0, 0], [10, 0], [10, .01], [0, .01]], { thickness: .01, bevel: 1 }));
report('zero-to-positive taper, bevel .04', () => buildExtrude([[0, 0], [1, 0], [1, 1], [0, 1]], { thickness: [0, .2], bevel: .04 }));
report('spike bevel', () => buildExtrude([[0, 0], [4, 0], [0.02, .01], [4, .02], [0, .03]], { thickness: .1, bevel: .2 }));
report('axis solid lathe segments 6', () => buildLathe([[0, 0], [1, 0], [1, 1], [0, 1]], 6));
report('off-axis shell lathe segments 6', () => buildLathe([[.2, 0], [1, 0], [1, 1], [.2, 1]], 6));
report('thin-to-thick taper .001-to-.3 bevel .04', () => buildExtrude([[0, 0], [1, 0], [1, 1], [0, 1]], { thickness: [.001, .3], bevel: .04 }));
report('axis solid lathe segments 12', () => buildLathe([[0, 0], [1, 0], [1, 1], [0, 1]], 12));

report('clockwise outline', () => buildExtrude([[0, 0], [0, 1], [1, 1], [1, 0]]));
report('counterclockwise outline', () => buildExtrude([[0, 0], [1, 0], [1, 1], [0, 1]]));
report('lathe spin 45', () => buildLathe([[.2, 0], [1, 0], [1, 1], [.2, 1]], 6));
const orient = buildExtrude([[0, 0], [1, 0], [1, 1], [0, 1]], { x: [1, 0, 0], y: [0, 0, 1], thickness: .2 });
const positions = orient.mesh.geometry.getAttribute('position');
const normal = orient.mesh.geometry.getAttribute('normal');
console.log('plane orientation first vertices', Array.from({ length: 6 }, (_, i) => [positions.getX(i), positions.getY(i), positions.getZ(i), normal.getX(i), normal.getY(i), normal.getZ(i)]));

const badOutlines: readonly (readonly [number, number] | readonly [number, number, 'sharp'])[][] = [
  [[0, 0], [2, 2], [0, 2], [2, 0]],
  [[0, 0], [2, 0], [2, 2], [1, 0], [0, 2]],
  [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]],
];
for (const points of badOutlines) report('self-touch/cross ' + JSON.stringify(points), () => buildExtrude(points));
report('smoothing-cross', () => buildExtrude([[0, 0], [4, 0], [4, 4], [2.1, .1], [0, 4]], { smoothing: 3 }));

const boneBuilder = createBuilder({ name: 'bones' });
const root = boneBuilder.joint('root', { at: [0, 0, 0] });
const child = boneBuilder.joint('child', { parent: root, at: [0, 1, 0], dir: [0, 1, 0] });
const onChild = boneBuilder.extrude([[0, 0], [1, 0], [1, 1], [0, 1]], { at: child, color: '#fff', thickness: .1 });
const before = onChild.at;
boneBuilder.pose(child, { axis: [0, 0, 1], deg: 90 });
const after = onChild.at;
console.log('bone child extrude at before-after', before.toArray(), after.toArray(), 'bone', onChild.bone?.name);
const explicit = boneBuilder.extrude([[0, 0], [1, 0], [1, 1], [0, 1]], { at: [0, 1, 0], bone: root, color: '#fff', thickness: .1 });
boneBuilder.pose(child, { axis: [0, 0, 1], deg: 90 });
console.log('explicit rigid root at after child pose', explicit.at.toArray(), 'bone', explicit.bone?.name);
