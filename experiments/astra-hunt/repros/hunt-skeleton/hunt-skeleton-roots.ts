import { createBuilder } from '../../../../src/builder';
import { polyline } from '../../../../src/path';

const b = createBuilder({ name: 'root-test' });
b.joint('root', { at: [0, 1, 0], dir: [0, 1, 0] });
try {
  const second = b.joint('second', { at: [0.2, 1, 0] });
  console.log('SECOND_ROOT_RESULT', second.parent?.name ?? null, [...b.ctx.joints.keys()]);
} catch (e) {
  console.log('SECOND_ROOT_THROW', String(e));
}

const c = createBuilder({ name: 'chain-test' });
const r = c.joint('root', { at: [0, 0, 0] });
const chain = c.chain('leg', polyline([[1, 0, 0], [1, 1, 0], [1, 2, 0]]), {
  parent: r,
  names: ['hipL', 'kneeL', 'footL'], role: 'leg', contact: [1, 0, 0],
});
console.log('CHAIN', { joints: chain.joints.map(j => j.name), spans: chain.spanJoints.map(j => j.name), tip: chain.tip?.name ?? null, ts: chain.ts, parents: chain.joints.map(j => j.parent?.name ?? null) });
for (const t of [0, .5, 1]) {
  const p = chain.at(t);
  console.log('AT', t, { at:p.at.toArray(), bone:p.bone?.name, t:p.t, tangent:p.tangent.toArray(), normal:p.normal.toArray(), binormal:p.binormal.toArray(), weights: chain.weightsAt(t).map(([j,w]) => [j.name, +w.toFixed(3)]) });
}
console.log('RIG_BEFORE', JSON.stringify(c.root.userData.rig));
c.pose('hipL', { axis: [0, 0, 1], deg: 90 });
console.log('RIG_AFTER', JSON.stringify(c.root.userData.rig));
console.log('POSE_AT', chain.at(.5).at.toArray());

const mirror = createBuilder({ name: 'mirror' });
const mr = mirror.joint('root', { at: [0, 0, 0] });
for (const s of [1, -1]) {
  const side = s === 1 ? 'L' : 'R';
  const m = mirror.chain('arm' + side, [[s, 0, 0], [s, 1, 0]], { parent: mr, names: ['shoulder' + side], role: 'arm' });
  console.log('MIRROR', side, m.joints.map(j => [j.name, j.at.x]));
}
console.log('MIRROR_RIG', JSON.stringify(mirror.root.userData.rig));
