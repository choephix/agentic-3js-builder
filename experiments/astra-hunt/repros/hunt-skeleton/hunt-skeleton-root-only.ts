import { SphereGeometry } from 'three';
import { createBuilder } from '../../../../src/builder';
import { assemble } from '../../../../harness/assemble';

const b = createBuilder({ name: 'root-only' });
const root = b.joint('root', { at: [0, 0.1, 0], role: 'spine' });
b.part(new SphereGeometry(0.1, 6, 4), '#888888', { bone: root, at: [0, 0.1, 0] });
const built = b.root;
console.log('RIG', JSON.stringify(built.userData.rig));
const report = await assemble(built, true);
console.log('ASSEMBLY', report.joints.length, report.issues);
