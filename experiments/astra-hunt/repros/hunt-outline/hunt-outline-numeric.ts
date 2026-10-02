import { createBuilder } from '../../../../src/builder';

function run(name: string, options: Parameters<ReturnType<typeof createBuilder>['extrude']>[1]) {
  const b = createBuilder({ name });
  b.joint('root', { at: [0, 0, 0] });
  try {
    const part = b.extrude([[0, 0], [1, 0], [1, 1], [0, 1]], options);
    const p = part.mesh.geometry.getAttribute('position');
    let nonfinite = 0;
    for (let i = 0; i < p.count * 3; i++) if (!Number.isFinite(p.array[i])) nonfinite++;
    console.log(name, 'ok', { vertices: p.count, nonfinite });
  } catch (error) { console.log(name, 'ERROR', String(error)); }
}
run('thickness Infinity', { at: [0, 0, 0], color: '#fff', thickness: Infinity });
run('taper Infinity', { at: [0, 0, 0], color: '#fff', thickness: [0.1, Infinity] });
run('bevel negative', { at: [0, 0, 0], color: '#fff', thickness: .1, bevel: -1 });
run('bevel Infinity', { at: [0, 0, 0], color: '#fff', thickness: .1, bevel: Infinity });
run('detail Infinity', { at: [0, 0, 0], color: '#fff', thickness: .1, bevel: .01, detail: Infinity });
