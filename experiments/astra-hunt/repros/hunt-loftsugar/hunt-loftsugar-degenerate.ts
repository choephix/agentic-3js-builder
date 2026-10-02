import { Builder, createBuilder } from '../../../../src/builder';
import type { Sweep } from '../../../../src/sweep';

function inspect(label: string, make: (b: Builder) => Sweep) {
  const b = createBuilder({ name: label, detail: 1 });
  b.joint('root', { at: [0, 0, 0] });
  try {
    const s = make(b);
    let degenerate = 0, triangles = 0, finite = true;
    for (const mesh of s.meshes) {
      const p = mesh.geometry.getAttribute('position').array;
      const ix = mesh.geometry.index?.array;
      if (!ix) continue;
      for (let i = 0; i < ix.length; i += 3) {
        triangles++;
        const ia = Number(ix[i]) * 3, ib = Number(ix[i + 1]) * 3, ic = Number(ix[i + 2]) * 3;
        const abx = Number(p[ib]) - Number(p[ia]), aby = Number(p[ib + 1]) - Number(p[ia + 1]), abz = Number(p[ib + 2]) - Number(p[ia + 2]);
        const acx = Number(p[ic]) - Number(p[ia]), acy = Number(p[ic + 1]) - Number(p[ia + 1]), acz = Number(p[ic + 2]) - Number(p[ia + 2]);
        const area2 = Math.hypot(aby * acz - abz * acy, abz * acx - abx * acz, abx * acy - aby * acx);
        if (area2 < 1e-10) degenerate++;
        finite &&= [Number(p[ia]), Number(p[ia+1]), Number(p[ia+2]), Number(p[ib]), Number(p[ib+1]), Number(p[ib+2]), Number(p[ic]), Number(p[ic+1]), Number(p[ic+2])].every(Number.isFinite);
      }
    }
    console.log(label, {meshes:s.meshes.length, triangles, degenerate, finite});
  } catch (e) { console.log(label, 'THREW', String(e)); }
}
inspect('spike', (b) => b.spike([0, 0, 0], [0, 0, 1], 1, 0.2, { color: '#fff' }));
inspect('rod-zero-end', (b) => b.rod([0, 0, 0], [0, 0, 1], [0.2, 0], { color: '#fff' }));
inspect('capsule-zero', (b) => b.capsule([0, 0, 0], [0, 0, 1], [0.2, 0], { color: '#fff' }));
inspect('negative-rod', (b) => b.rod([0, 0, 0], [0, 0, 1], -0.2, { color: '#fff' }));
inspect('zero-rod', (b) => b.rod([0, 0, 0], [0, 0, 1], 0, { color: '#fff' }));
