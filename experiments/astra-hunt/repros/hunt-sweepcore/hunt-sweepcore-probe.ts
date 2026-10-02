import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { Sweep } from '../../../../src/sweep';
import { polyline } from '../../../../src/path';
import type { Section, Cap, Radius } from '../../../../src/sweep';

function stats(label: string, sw: Sweep) {
  let tris = 0;
  let verts = 0;
  let deg = 0;
  let nan = 0;
  let minArea = Infinity;
  for (const mesh of sw.meshes) {
    const p = mesh.geometry.getAttribute('position');
    const idx = mesh.geometry.getIndex();
    verts += p.count;
    tris += idx ? idx.count / 3 : p.count / 3;
    for (let i = 0; i < p.count; i++) {
      if (!Number.isFinite(p.getX(i)) || !Number.isFinite(p.getY(i)) || !Number.isFinite(p.getZ(i))) nan++;
    }
    const get = (i: number) => new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = get(idx.getX(i));
        const b = get(idx.getX(i + 1));
        const c = get(idx.getX(i + 2));
        const area = b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
        minArea = Math.min(minArea, area);
        if (area < 1e-10) deg++;
      }
    }
  }
  console.log(label, { meshes: sw.meshes.length, verts, tris, deg, minArea, nan, from: sw.from, to: sw.to });
}
const b = createBuilder({ name: 'probe', detail: 1 });
b.joint('root', { at: [0, 0, 0] });
const radii: Array<[string, Radius]> = [
  ['number', 0.1],
  ['taper', [0.2, 0.05]],
  ['keys', [0.2, 0.1, 0.05]],
  ['fn', (t: number) => (t < 0.5 ? [0.2, 0.1] : [0.1, 0.03])],
];
for (const [label, radius] of radii) {
  const sw = b.sweep(polyline([[0, 0, 0], [0, 0, 2]]), radius, { color: '#fff' });
  stats(label, sw);
}
const sectors = b.sweep(polyline([[0, 0, 0], [0, 0, 2]]), 0.1, {
  color: '#fff', sectors: [[-65, 65, '#000'], [125, 235, '#f00']],
});
stats('sector', sectors);
for (const caps of ['round', 'flat', 'point', 'none'] as Cap[]) {
  const sw = b.sweep([[0, 0, 0], [0, 0, 1]], 0.1, { color: '#fff', caps });
  stats('cap-' + caps, sw);
}
const sections: Section[] = ['circle', 'box', { ngon: 5 }];
for (const section of sections) {
  const sw = b.sweep([[0, 0, 0], [0, 0, 1]], 0.1, { color: '#fff', section, smooth: false });
  stats('section-' + JSON.stringify(section), sw);
}
const bend = b.sweep([[0, 0, 0], [0, 0, 1], [1, 0, 1]], 0.1, { color: '#fff' });
stats('bend', bend);
const closed = b.sweep(polyline([[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]], { closed: true }), 0.1, { color: '#fff' });
stats('closed', closed);
