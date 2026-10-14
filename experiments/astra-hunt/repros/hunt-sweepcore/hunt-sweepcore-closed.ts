import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { polyline, catmull } from '../../../../src/path';
import type { Sweep } from '../../../../src/sweep';
function topology(label: string, sw: Sweep) {
  for (const m of sw.meshes) {
    const idx = m.geometry.getIndex();
    if (!idx) continue;
    const edge = new Map<string, number>();
    for (let i = 0; i < idx.count; i += 3) {
      const a = [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)];
      for (let k = 0; k < 3; k++) {
        const x = a[k];
        const y = a[(k + 1) % 3];
        const key = x < y ? `${x},${y}` : `${y},${x}`;
        edge.set(key, (edge.get(key) ?? 0) + 1);
      }
    }
    const histogram: Record<number, number> = {};
    for (const n of edge.values()) histogram[n] = (histogram[n] ?? 0) + 1;
    console.log(label, { verts: m.geometry.getAttribute('position').count, tris: idx.count / 3, histogram });
  }
}
void THREE;
const b = createBuilder();
b.joint('r', { at: [0, 0, 0] });
topology('poly-smooth-seam', b.sweep(polyline([[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]], { closed: true }), 0.1, { color: '#fff' }));
topology('catmull-closed', b.sweep(catmull([[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]], { closed: true }), 0.1, { color: '#fff' }));
topology('ranged', b.sweep(catmull([[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]], { closed: true }), 0.1, { color: '#fff', from: 0.1, to: 0.9 }));
