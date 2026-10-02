import { createBuilder } from '../../../../src/builder';

const b = createBuilder({ name: 'ring-pose' });
const root = b.joint('root', { at: [0, 0, 0], dir: [0, 1, 0] });
const ring = b.ring(root, { count: 4, radius: 0.2, joints: 2, name: 'feather', parent: root, role: 'fan' });
console.log('BEFORE', JSON.stringify(b.root.userData.rig));
b.pose('root', { axis: [0, 0, 1], deg: 90 });
console.log('AFTER', JSON.stringify(b.root.userData.rig));
console.log('GROUPS', ring.joints.map((j) => ({name:j.name,at:j.at.toArray(),axis:j.axis.toArray()})));
