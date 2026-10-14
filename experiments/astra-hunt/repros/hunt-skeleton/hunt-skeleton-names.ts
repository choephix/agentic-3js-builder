import { createBuilder } from '../../../../src/builder';
import { polyline } from '../../../../src/path';

const b = createBuilder({ name: 'names' });
b.joint('root', { at: [0, 0, 0] });
for (const [label, call] of [
  ['duplicate', () => b.joint('root', { at: [0, 1, 0] })],
  ['invalid', () => b.joint('bad-name', { at: [0, 1, 0] })],
  ['bad-chain-count', () => b.chain('x', polyline([[0, 0, 0], [0, 1, 0], [0, 2, 0]]), { names: ['a'] })],
] as const) {
  try { call(); console.log('ACCEPTED', label); }
  catch (e) { console.log('THREW', label, String(e)); }
}
