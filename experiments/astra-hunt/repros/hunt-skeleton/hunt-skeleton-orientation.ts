import { createBuilder } from '../../../../src/builder';
import { aim } from '../../../../src/math';
import { Vector3 } from 'three';

const b = createBuilder({ name: 'orientation' });
const root = b.joint('root', { at: [0, 0, 0], dir: [0, 0, 1] });
for (const [name, dir] of [['forward', [0, 0, 1]], ['down', [0, -1, 0]], ['up', [0, 1, 0]], ['left', [1, 0, 0]], ['right', [-1, 0, 0]]] as const) {
  const j = b.joint(name, { parent: root, at: [0, 0.1 * (name === 'forward' ? 1 : 2), 0], dir });
  console.log('JOINT_AXIS', name, j.axis.toArray(), 'x', j.dir([1, 0, 0]).toArray(), 'z', j.dir([0, 0, 1]).toArray());
}
const chain = b.chain('twist', [[0, 0, 0], [0, 0, 1], [0, 0, 2]], { parent: root, twist: 90 });
for (const t of [0, 0.5, 1]) {
  const p = chain.at(t);
  console.log('CHAIN_FRAME', t, 'tangent', p.tangent.toArray(), 'normal', p.normal.toArray(), 'binormal', p.binormal.toArray());
}
for (const [name, opts] of [['dup', { at: [1, 0, 0] }], ['bad-name', { at: [2, 0, 0] }]] as const) {
  try { b.joint(name, opts); console.log('VALIDATION_ACCEPTED', name); }
  catch (e) { console.log('VALIDATION_THROW', name, String(e)); }
}
