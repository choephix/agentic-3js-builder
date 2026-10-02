import { createBuilder } from '../../../../src/builder';
const b = createBuilder({ name: 'spike', detail: 1 });
b.joint('root', { at: [0, 0, 0] });
const s = b.spike([0, 0, 0], [0, 0, 1], 1, 0.2, { color: '#fff' });
for (const m of s.meshes) {
  const p = m.geometry.getAttribute('position').array;
  const ix = m.geometry.index?.array;
  console.log('verts', p.length / 3, 'tris', ix ? ix.length / 3 : 0);
  if (ix) for (let i = 0; i < ix.length; i += 3) {
    const a = Number(ix[i]) * 3, c = Number(ix[i+2]) * 3;
    console.log(i/3, ix[i], ix[i+1], ix[i+2], [p[a],p[a+1],p[a+2]], [p[c],p[c+1],p[c+2]]);
  }
}
