import { createBuilder } from '../../../../src/builder';

const b = createBuilder({ name: 'contact-default' });
const root = b.joint('root', { at: [0, 0, 0] });
const leg = b.chain('leg', [[1, 0, 0], [1, 1, 0], [1, 2, 0]], { parent: root, names: ['hipL', 'kneeL', 'footL'], role: 'leg' });
console.log('DEFAULT_BEFORE', JSON.stringify(b.root.userData.rig));
b.pose('hipL', { axis: [0, 0, 1], deg: 90 });
console.log('DEFAULT_AFTER', JSON.stringify(b.root.userData.rig), 'END', leg.at(1).at.toArray());
