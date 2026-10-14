import { createBuilder } from '../../../../src/builder';

const b = createBuilder({ name: 'rig-pose' });
const root = b.joint('root', { at: [0, 0, 0], role: 'spine' });
const jaw = b.joint('jaw', { parent: root, at: [0, 1, 0], dir: [0, 0, 1], role: 'jaw' });
const leg = b.chain('leg', [[1, 0, 0], [1, 1, 0], [1, 2, 0]], { parent: root, names: ['hipL', 'kneeL', 'footL'], role: 'leg', contact: [1, 2, 0] });
const before = b.root.userData.rig;
console.log('BEFORE', JSON.stringify(before));
b.pose('hipL', { axis: [0, 0, 1], deg: 90 });
b.pose('jaw', { axis: [1, 0, 0], deg: 30 });
console.log('AFTER', JSON.stringify(b.root.userData.rig));
console.log('JAW_AXIS', jaw.axis.toArray());
console.log('LEG_END', leg.at(1).at.toArray());
