import { createBuilder } from '../../../../src/builder';

export default function build() {
  const b = createBuilder({ name: 'doubleback' });
  b.joint('root', { at: [0, 0, 0] });
  b.loft(
    [
      { at: [0, 0, 0], w: 1, h: 1 },
      { at: [0, 0, 2], w: 1, h: 1 },
      { at: [0, 0, 0], w: 1, h: 1 },
    ],
    { color: '#d66b42', sides: 16, caps: 'round' },
  );
  return b.root;
}
