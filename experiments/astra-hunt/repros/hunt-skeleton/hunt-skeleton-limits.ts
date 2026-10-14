import { createBuilder } from '../../../../src/builder';
import { assemble } from '../../../../harness/assemble';

async function check(count: number) {
  const b = createBuilder({ name: `joints-${count}` });
  let parent = b.joint('root', { at: [0, 0, 0] });
  for (let i = 1; i < count; i++) {
    parent = b.joint(`j${i}`, { parent, at: [0, i * 0.01, 0] });
  }
  const result = await assemble(b.root, true);
  console.log('JOINTS', count, 'assembly', result.joints.length, 'issues', result.issues.filter(issue => issue.level === 'error').map(issue => issue.message));
}
await check(1);
await check(160);
await check(161);
